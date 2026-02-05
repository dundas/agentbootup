#!/usr/bin/env node
/**
 * End-to-End Daemon Test Suite
 *
 * Tests the complete memory sync daemon functionality:
 * - Configuration
 * - Daemon lifecycle
 * - File watching
 * - Sync operations
 * - HTTP API
 * - Hook integration
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TEST_DIR = path.join(process.cwd(), '.test-daemon');
const TEST_TIMEOUT = 60000; // 60 seconds
const CLI_PATH = path.join(process.cwd(), 'memory-sync.mjs');

class DaemonTester {
  constructor() {
    this.testResults = [];
    this.daemonRunning = false;
  }

  /**
   * Run a test
   */
  async test(name, fn) {
    console.log(`\n🧪 Test: ${name}`);

    try {
      const startTime = Date.now();
      await fn();
      const duration = Date.now() - startTime;

      this.testResults.push({
        name,
        status: 'passed',
        duration
      });

      console.log(`   ✅ PASSED (${duration}ms)`);
    } catch (err) {
      this.testResults.push({
        name,
        status: 'failed',
        error: err.message
      });

      console.error(`   ❌ FAILED: ${err.message}`);
      throw err; // Stop on first failure
    }
  }

  /**
   * Setup test environment
   */
  async setup() {
    console.log('📦 Setting up test environment...');

    // Create test directory
    await fs.mkdir(TEST_DIR, { recursive: true });
    await fs.mkdir(path.join(TEST_DIR, 'memory'), { recursive: true });
    await fs.mkdir(path.join(TEST_DIR, 'memory/daily'), { recursive: true });

    // Create test memory file
    await fs.writeFile(
      path.join(TEST_DIR, 'memory/MEMORY.md'),
      '# Test Memory\n\nThis is a test memory file.\n'
    );

    // Create test config
    const config = {
      projectId: 'test-daemon',
      provider: 'local', // Use local provider for testing
      files: [
        'memory/**/*.md'
      ]
    };

    await fs.writeFile(
      path.join(TEST_DIR, '.memory-sync.config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('   ✓ Test environment ready');
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up...');

    // Stop daemon if running
    if (this.daemonRunning) {
      try {
        await this.stopDaemon();
      } catch (err) {
        console.warn('   Warning: Failed to stop daemon:', err.message);
      }
    }

    // Remove test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
      console.log('   ✓ Cleanup complete');
    } catch (err) {
      console.warn('   Warning: Failed to cleanup:', err.message);
    }
  }

  /**
   * Start daemon
   */
  async startDaemon() {
    const { stdout, stderr } = await execAsync(
      `node "${CLI_PATH}" daemon start`,
      {
        cwd: TEST_DIR,
        timeout: 10000
      }
    );

    // Wait for daemon to start
    await this.waitForDaemon(5000);
    this.daemonRunning = true;

    return { stdout, stderr };
  }

  /**
   * Stop daemon
   */
  async stopDaemon() {
    const { stdout, stderr } = await execAsync(
      `node "${CLI_PATH}" daemon stop`,
      {
        cwd: TEST_DIR,
        timeout: 10000
      }
    );

    this.daemonRunning = false;
    return { stdout, stderr };
  }

  /**
   * Wait for daemon to be ready
   */
  async waitForDaemon(timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch('http://localhost:8765/health');

        if (response.ok) {
          return true;
        }
      } catch (err) {
        // Daemon not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('Daemon did not start in time');
  }

  /**
   * Test daemon status API
   */
  async testStatusAPI() {
    const response = await fetch('http://localhost:8765/status');

    if (!response.ok) {
      throw new Error(`Status API failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.running) {
      throw new Error('Daemon reports not running');
    }

    if (!data.stats) {
      throw new Error('Status missing stats');
    }

    return data;
  }

  /**
   * Test daemon health API
   */
  async testHealthAPI() {
    const response = await fetch('http://localhost:8765/health');

    if (!response.ok) {
      throw new Error(`Health API failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.healthy) {
      throw new Error('Daemon reports unhealthy');
    }

    return data;
  }

  /**
   * Test manual sync trigger
   */
  async testSyncAPI() {
    const response = await fetch('http://localhost:8765/sync', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Sync API failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('Sync reported failure');
    }

    return data;
  }

  /**
   * Test file watching
   */
  async testFileWatching() {
    // Modify memory file
    const memoryPath = path.join(TEST_DIR, 'memory/MEMORY.md');
    await fs.appendFile(memoryPath, '\n## New Section\n\nTest update.\n');

    // Wait for debounce and sync
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check that daemon detected change (via status API)
    const status = await this.testStatusAPI();

    if (status.stats.syncSuccessCount === 0 && status.stats.syncFailureCount === 0) {
      throw new Error('Daemon did not detect file change');
    }

    return status;
  }

  /**
   * Test hook helper functions
   */
  async testHookHelpers() {
    // Import hook helper
    const helperPath = path.join(process.cwd(), 'lib/hooks/daemon-helper.js');
    const { isDaemonRunning, getDaemonStatus, handleSessionStart } = await import(helperPath);

    // Test isDaemonRunning
    const running = await isDaemonRunning();
    if (!running) {
      throw new Error('Hook helper reports daemon not running');
    }

    // Test getDaemonStatus
    const status = await getDaemonStatus();
    if (!status || !status.running) {
      throw new Error('Hook helper status check failed');
    }

    // Test handleSessionStart
    const result = await handleSessionStart({
      basePath: TEST_DIR,
      verbose: false
    });

    if (!result.memory) {
      throw new Error('Hook helper did not load memory');
    }

    if (!result.daemonRunning) {
      throw new Error('Hook helper reports daemon not running');
    }

    return result;
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const total = this.testResults.length;

    console.log(`\nTotal: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  ❌ ${r.name}`);
          console.log(`     ${r.error}`);
        });
    }

    const totalDuration = this.testResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`\nTotal Duration: ${totalDuration}ms`);

    console.log('='.repeat(60));

    return failed === 0;
  }
}

/**
 * Main test runner
 */
async function main() {
  const tester = new DaemonTester();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Memory Sync Daemon - End-to-End Tests             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Setup
    await tester.setup();

    // Test 1: Daemon Lifecycle
    await tester.test('Daemon Start', async () => {
      await tester.startDaemon();
    });

    // Test 2: Health API
    await tester.test('Health API', async () => {
      await tester.testHealthAPI();
    });

    // Test 3: Status API
    await tester.test('Status API', async () => {
      await tester.testStatusAPI();
    });

    // Test 4: Manual Sync API
    await tester.test('Manual Sync API', async () => {
      await tester.testSyncAPI();
    });

    // Test 5: File Watching
    await tester.test('File Watching', async () => {
      await tester.testFileWatching();
    });

    // Test 6: Hook Helpers
    await tester.test('Hook Helper Functions', async () => {
      await tester.testHookHelpers();
    });

    // Test 7: Daemon Stop
    await tester.test('Daemon Stop', async () => {
      await tester.stopDaemon();
    });

    // Test 8: Daemon not running detection
    await tester.test('Daemon Not Running Detection', async () => {
      const helperPath = path.join(process.cwd(), 'lib/hooks/daemon-helper.js');
      const { isDaemonRunning } = await import(helperPath);

      const running = await isDaemonRunning();
      if (running) {
        throw new Error('Hook helper reports daemon running when it should be stopped');
      }
    });

    // Cleanup
    await tester.cleanup();

    // Print summary
    const success = tester.printSummary();

    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('\n💥 Test suite failed:', err.message);
    console.error(err.stack);

    // Cleanup on error
    await tester.cleanup();

    // Print partial summary
    tester.printSummary();

    process.exit(1);
  }
}

main();
