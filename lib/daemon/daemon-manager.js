/**
 * Daemon Manager
 *
 * Manages daemon lifecycle, PID files, and process management
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import crypto from 'crypto';

export class DaemonManager {
  constructor(options = {}) {
    this.daemonDir = options.daemonDir || path.join(os.homedir(), '.uhr', 'daemon');
    this.pidFile = path.join(this.daemonDir, 'memory-sync.pid');
    this.logFile = path.join(this.daemonDir, 'memory-sync.log');
    this.statusFile = path.join(this.daemonDir, 'status.json');
    this.tokenFile = path.join(this.daemonDir, 'api-token');
    this.logStream = null;
  }

  /**
   * Start daemon in background
   */
  async start(basePath = process.cwd()) {
    // Check if already running
    if (await this.isRunning()) {
      throw new Error('Daemon is already running');
    }

    // Ensure daemon directory exists
    await fs.mkdir(this.daemonDir, { recursive: true });

    // Generate API token for this daemon session
    const apiToken = crypto.randomBytes(32).toString('hex');
    await fs.writeFile(this.tokenFile, apiToken, { mode: 0o600 });

    // Spawn daemon process
    const daemonScript = path.join(import.meta.dirname, '../../memory-sync-daemon.mjs');

    const child = spawn(process.execPath, [daemonScript, '--base-path', basePath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, DAEMON_MODE: 'true', DAEMON_API_TOKEN: apiToken }
    });

    // Write PID file
    await fs.writeFile(this.pidFile, String(child.pid), { mode: 0o600 });

    // Setup log streaming
    this.logStream = await fs.open(this.logFile, 'a', 0o600);

    child.stdout.on('data', async (data) => {
      try {
        await this.logStream.write(data);
      } catch (err) {
        console.error('[DaemonManager] Failed to write stdout to log:', err.message);
      }
    });

    child.stderr.on('data', async (data) => {
      try {
        await this.logStream.write(data);
      } catch (err) {
        console.error('[DaemonManager] Failed to write stderr to log:', err.message);
      }
    });

    child.on('exit', async (code) => {
      console.log(`[DaemonManager] Daemon exited with code ${code}`);
      if (this.logStream) {
        try {
          await this.logStream.close();
          this.logStream = null;
        } catch (err) {
          console.error('[DaemonManager] Failed to close log stream:', err.message);
        }
      }
      await this.cleanup();
    });

    // Detach child from parent
    child.unref();

    // Wait a moment to ensure it started
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify it's running
    if (!(await this.isRunning())) {
      throw new Error('Daemon failed to start');
    }

    return { pid: child.pid, logFile: this.logFile };
  }

  /**
   * Stop daemon
   */
  async stop() {
    const pid = await this.getPid();

    if (!pid) {
      throw new Error('Daemon is not running');
    }

    try {
      // Send SIGTERM
      process.kill(pid, 'SIGTERM');

      // Wait for process to exit
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!(await this.isProcessRunning(pid))) {
          await this.cleanup();
          return { success: true };
        }
      }

      // Force kill if still running
      console.warn('[DaemonManager] Daemon did not stop gracefully, forcing...');
      process.kill(pid, 'SIGKILL');
      await this.cleanup();

      return { success: true, forced: true };
    } catch (err) {
      if (err.code === 'ESRCH') {
        // Process doesn't exist
        await this.cleanup();
        return { success: true, alreadyStopped: true };
      }
      throw err;
    }
  }

  /**
   * Get daemon status
   */
  async status() {
    const pid = await this.getPid();

    if (!pid) {
      return {
        running: false,
        message: 'Daemon is not running'
      };
    }

    const running = await this.isProcessRunning(pid);

    if (!running) {
      await this.cleanup();
      return {
        running: false,
        message: 'Daemon PID file exists but process is not running (stale)'
      };
    }

    // Try to get status from HTTP API
    try {
      const status = await this.fetchStatus();
      return {
        running: true,
        pid,
        ...status
      };
    } catch (err) {
      return {
        running: true,
        pid,
        message: 'Daemon is running but status API unavailable',
        error: err.message
      };
    }
  }

  /**
   * Get logs
   */
  async logs(lines = 50) {
    try {
      const content = await fs.readFile(this.logFile, 'utf-8');
      const allLines = content.split('\n');
      return allLines.slice(-lines).join('\n');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return 'No logs available';
      }
      throw err;
    }
  }

  /**
   * Check if daemon is running
   */
  async isRunning() {
    const pid = await this.getPid();

    if (!pid) {
      return false;
    }

    return await this.isProcessRunning(pid);
  }

  /**
   * Get PID from file
   */
  async getPid() {
    try {
      const content = await fs.readFile(this.pidFile, 'utf-8');
      return parseInt(content.trim(), 10);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Check if process is running
   */
  async isProcessRunning(pid) {
    try {
      // Send signal 0 to check if process exists
      process.kill(pid, 0);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Clean up PID and status files
   */
  async cleanup() {
    // Close log stream if still open
    if (this.logStream) {
      try {
        await this.logStream.close();
        this.logStream = null;
      } catch (err) {
        // Ignore errors during cleanup
      }
    }

    try {
      await fs.unlink(this.pidFile);
    } catch (err) {
      // Ignore errors
    }

    try {
      await fs.unlink(this.statusFile);
    } catch (err) {
      // Ignore errors
    }

    try {
      await fs.unlink(this.tokenFile);
    } catch (err) {
      // Ignore errors
    }
  }

  /**
   * Get API token for authenticated requests
   */
  async getApiToken() {
    try {
      return await fs.readFile(this.tokenFile, 'utf-8');
    } catch (err) {
      return null;
    }
  }

  /**
   * Fetch status from daemon HTTP API
   */
  async fetchStatus() {
    const token = await this.getApiToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch('http://localhost:8765/status', { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Trigger manual sync via HTTP API
   */
  async triggerSync() {
    const token = await this.getApiToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch('http://localhost:8765/sync', {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }
}
