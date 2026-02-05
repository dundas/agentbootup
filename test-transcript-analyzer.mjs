#!/usr/bin/env node
/**
 * Test Transcript Analyzer
 *
 * Tests the autonomous transcript analysis system
 */

import { TranscriptAnalyzer } from './lib/analysis/transcript-analyzer.js';
import { MechLLMsClient } from './lib/analysis/mech-llms-client.js';

async function main() {
  console.log('=== Transcript Analyzer Test ===\n');

  // Configuration (load from env or .env file)
  const config = {
    appId: process.env.MECH_APP_ID,
    apiKey: process.env.MECH_API_KEY,
    projectPath: process.env.PROJECT_PATH || process.cwd(),
    basePath: process.env.BASE_PATH || process.cwd()
  };

  // Validate config
  if (!config.appId || !config.apiKey) {
    console.error('Error: MECH_APP_ID and MECH_API_KEY environment variables required');
    console.error('\nUsage:');
    console.error('  MECH_APP_ID=xxx MECH_API_KEY=yyy node test-transcript-analyzer.mjs');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  App ID: ${config.appId}`);
  console.log(`  Project Path: ${config.projectPath}`);
  console.log(`  Base Path: ${config.basePath}\n`);

  // Create LLM client
  const llmClient = new MechLLMsClient({
    appId: config.appId,
    apiKey: config.apiKey
  });

  // Create analyzer
  const analyzer = new TranscriptAnalyzer({
    basePath: config.basePath,
    projectPath: config.projectPath,
    llmClient,
    checkIntervalMs: 60 * 60 * 1000 // 1 hour
  });

  // Set up event listeners
  analyzer.on('started', () => {
    console.log('[Event] Analyzer started');
  });

  analyzer.on('session:analyzed', (data) => {
    console.log(`[Event] Session analyzed: ${data.sessionId.substring(0, 8)}`);
    console.log(`  Insights: ${data.insightsCount}`);
    console.log(`  Daily log: ${data.dailyLogPath}`);
    if (data.memoryPath) {
      console.log(`  Memory updated: ${data.memoryPath}`);
    }
  });

  analyzer.on('session:error', (data) => {
    console.error(`[Event] Session error: ${data.sessionId.substring(0, 8)}`);
    console.error(`  Error: ${data.error.message}`);
  });

  analyzer.on('analysis:complete', (data) => {
    console.log(`[Event] Analysis complete: ${data.sessionsAnalyzed} sessions`);
  });

  analyzer.on('error', (err) => {
    console.error('[Event] Analyzer error:', err);
  });

  // Start analyzer
  console.log('Starting analyzer...\n');
  await analyzer.start();

  // Show stats after initial run
  setTimeout(() => {
    const stats = analyzer.getStats();
    console.log('\n=== Analysis Stats ===');
    console.log(`  Sessions analyzed: ${stats.sessionsAnalyzed}`);
    console.log(`  Insights extracted: ${stats.insightsExtracted}`);
    console.log(`  Memory files written: ${stats.memoryFilesWritten}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log(`  Last analysis: ${stats.lastAnalysisAt ? new Date(stats.lastAnalysisAt).toLocaleString() : 'never'}`);

    // Stop analyzer
    console.log('\nStopping analyzer...');
    analyzer.stop().then(() => {
      console.log('Test complete!');
      process.exit(0);
    });
  }, 30000); // Run for 30 seconds then stop
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
