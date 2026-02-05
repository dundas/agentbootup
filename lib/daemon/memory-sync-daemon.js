/**
 * Memory Sync Daemon
 *
 * Continuously watches memory files and syncs them to Mech Storage
 * in real-time with debouncing and retry logic.
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { MemorySyncManager } from '../sync/sync-manager.js';
import { SyncConfigManager } from '../sync/config-manager.js';

export class MemorySyncDaemon extends EventEmitter {
  constructor(options = {}) {
    super();

    this.basePath = options.basePath || process.cwd();
    this.debounceMs = options.debounceMs || 2000;
    this.retryDelayMs = options.retryDelayMs || 5000;
    this.maxRetries = options.maxRetries || 3;

    this.syncManager = null;
    this.watchers = [];
    this.syncQueue = new Map(); // file -> { timer, retries }
    this.running = false;
    this.stats = {
      syncSuccessCount: 0,
      syncFailureCount: 0,
      filesWatched: 0,
      lastSyncAt: null,
      startedAt: null
    };
  }

  /**
   * Start the daemon
   */
  async start() {
    if (this.running) {
      throw new Error('Daemon already running');
    }

    console.log('[Daemon] Starting memory sync daemon...');
    this.running = true;
    this.stats.startedAt = Date.now();

    try {
      // Load sync configuration
      const configManager = new SyncConfigManager(this.basePath);
      const syncConfig = await configManager.getSyncConfig();

      // Initialize sync manager
      this.syncManager = new MemorySyncManager(syncConfig);

      // Do initial sync
      console.log('[Daemon] Performing initial sync...');
      await this.syncManager.sync();

      // Start watching files
      await this.startWatching(syncConfig.files);

      console.log('[Daemon] ✓ Daemon started successfully');
      this.emit('started');
    } catch (err) {
      this.running = false;
      console.error('[Daemon] Failed to start:', err.message);
      throw err;
    }
  }

  /**
   * Stop the daemon
   */
  async stop() {
    if (!this.running) {
      return;
    }

    console.log('[Daemon] Stopping daemon...');
    this.running = false;

    // Clear all pending sync timers
    for (const [file, { timer }] of this.syncQueue.entries()) {
      clearTimeout(timer);
      this.syncQueue.delete(file);
    }

    // Close all watchers
    for (const watcher of this.watchers) {
      await watcher.close();
    }
    this.watchers = [];

    // Do final sync
    if (this.syncManager) {
      console.log('[Daemon] Performing final sync...');
      try {
        await this.syncManager.push();
      } catch (err) {
        console.error('[Daemon] Final sync failed:', err.message);
      }
    }

    console.log('[Daemon] ✓ Daemon stopped');
    this.emit('stopped');
  }

  /**
   * Start watching files
   */
  async startWatching(patterns) {
    const files = await this.syncManager.expandFiles(patterns);
    const dirs = [...new Set(files.map(f => path.dirname(f)))];

    console.log(`[Daemon] Watching ${dirs.length} directories...`);

    for (const dir of dirs) {
      const dirPath = path.join(this.basePath, dir);

      try {
        await fs.access(dirPath); // Check if directory exists

        const watcher = fs.watch(dirPath, { recursive: false });

        console.log(`[Daemon]   - ${dir}/`);

        this.watchers.push(watcher);
        this.stats.filesWatched = files.length;

        // Handle file changes
        (async () => {
          try {
            for await (const event of watcher) {
              if (!this.running) break;

              const filePath = path.join(dir, event.filename);

              // Only sync files that match our patterns
              if (files.includes(filePath)) {
                await this.queueSync(filePath);
              }
            }
          } catch (err) {
            if (this.running) {
              // Handle directory deletion specifically
              if (err.code === 'ENOENT' || err.code === 'EPERM') {
                console.warn(`[Daemon] Directory ${dir}/ was deleted or became inaccessible, stopping watch`);
              } else {
                console.error(`[Daemon] Watcher error for ${dir}:`, err.message);
              }
              this.emit('error', { dir, error: err });
            }
          }
        })();
      } catch (err) {
        console.log(`[Daemon]   - ${dir}/ (not found, skipping)`);
      }
    }

    if (this.watchers.length === 0) {
      console.warn('[Daemon] ⚠ No directories found to watch');
    }
  }

  /**
   * Queue a file for sync (with debouncing)
   */
  async queueSync(filePath) {
    const existing = this.syncQueue.get(filePath);

    // Cancel existing timer
    if (existing) {
      clearTimeout(existing.timer);
    }

    // Create new debounced timer
    const timer = setTimeout(async () => {
      await this.syncFile(filePath);
      this.syncQueue.delete(filePath);
    }, this.debounceMs);

    this.syncQueue.set(filePath, {
      timer,
      retries: existing ? existing.retries : 0
    });

    console.log(`[Daemon] Change detected: ${filePath} (sync queued)`);
  }

  /**
   * Sync a single file
   */
  async syncFile(filePath) {
    if (!this.running || !this.syncManager) {
      return;
    }

    const queueItem = this.syncQueue.get(filePath);
    const retries = queueItem ? queueItem.retries : 0;

    try {
      console.log(`[Daemon] Syncing ${filePath}...`);

      const result = await this.syncManager.provider.syncFile(filePath);

      if (result.status === 'error') {
        throw new Error(result.error);
      }

      this.stats.syncSuccessCount++;
      this.stats.lastSyncAt = Date.now();

      console.log(`[Daemon] ✓ Synced ${filePath} (${result.status})`);
      this.emit('synced', { file: filePath, result });
    } catch (err) {
      console.error(`[Daemon] ✗ Sync failed for ${filePath}:`, err.message);

      this.stats.syncFailureCount++;
      this.emit('syncError', { file: filePath, error: err });

      // Retry logic
      if (retries < this.maxRetries) {
        console.log(`[Daemon] Retrying in ${this.retryDelayMs}ms (attempt ${retries + 1}/${this.maxRetries})`);

        const retryTimer = setTimeout(async () => {
          if (this.running) {
            const newQueueItem = {
              timer: null,
              retries: retries + 1
            };
            this.syncQueue.set(filePath, newQueueItem);
            await this.syncFile(filePath);
          }
        }, this.retryDelayMs);

        // Update queue with retry timer
        this.syncQueue.set(filePath, {
          timer: retryTimer,
          retries: retries
        });
      } else {
        console.error(`[Daemon] Max retries reached for ${filePath}, giving up`);
        // Remove from queue
        this.syncQueue.delete(filePath);
      }
    }
  }

  /**
   * Get daemon status
   */
  getStatus() {
    return {
      running: this.running,
      basePath: this.basePath,
      stats: {
        ...this.stats,
        uptime: this.stats.startedAt ? Date.now() - this.stats.startedAt : 0,
        queueLength: this.syncQueue.size,
        watchersCount: this.watchers.length
      }
    };
  }

  /**
   * Manually trigger sync for all files
   */
  async syncAll() {
    if (!this.running || !this.syncManager) {
      throw new Error('Daemon not running');
    }

    console.log('[Daemon] Manual sync triggered');
    await this.syncManager.sync();
    this.stats.lastSyncAt = Date.now();
  }
}
