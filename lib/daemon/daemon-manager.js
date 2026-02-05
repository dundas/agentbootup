/**
 * Daemon Manager
 *
 * Manages daemon lifecycle, PID files, and process management
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';

export class DaemonManager {
  constructor(options = {}) {
    this.daemonDir = options.daemonDir || path.join(os.homedir(), '.uhr', 'daemon');
    this.pidFile = path.join(this.daemonDir, 'memory-sync.pid');
    this.logFile = path.join(this.daemonDir, 'memory-sync.log');
    this.statusFile = path.join(this.daemonDir, 'status.json');
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

    // Spawn daemon process
    const daemonScript = path.join(import.meta.dirname, '../../memory-sync-daemon.mjs');

    const child = spawn(process.execPath, [daemonScript, '--base-path', basePath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, DAEMON_MODE: 'true' }
    });

    // Write PID file
    await fs.writeFile(this.pidFile, String(child.pid));

    // Setup log streaming
    const logStream = await fs.open(this.logFile, 'a');

    child.stdout.on('data', async (data) => {
      await logStream.write(data);
    });

    child.stderr.on('data', async (data) => {
      await logStream.write(data);
    });

    child.on('exit', async (code) => {
      console.log(`[DaemonManager] Daemon exited with code ${code}`);
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
  }

  /**
   * Fetch status from daemon HTTP API
   */
  async fetchStatus() {
    const response = await fetch('http://localhost:8765/status');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Trigger manual sync via HTTP API
   */
  async triggerSync() {
    const response = await fetch('http://localhost:8765/sync', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }
}
