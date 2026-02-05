#!/usr/bin/env node
/**
 * Transcript Query CLI
 *
 * Query Claude Code transcripts from command line
 */

import { TranscriptParser } from './lib/transcript-parser.js';

const parser = new TranscriptParser();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'list':
        await listTranscripts(args[1] || process.cwd());
        break;

      case 'recent':
        await showRecent(args[1] || process.cwd());
        break;

      case 'search':
        if (!args[1]) {
          console.error('Error: search requires a keyword');
          process.exit(1);
        }
        await search(args[1], args[2] || process.cwd());
        break;

      case 'before':
        if (!args[1]) {
          console.error('Error: before requires a topic');
          process.exit(1);
        }
        await showBefore(args[1], args[2] || process.cwd());
        break;

      case 'summary':
        if (!args[1]) {
          console.error('Error: summary requires a session ID or path');
          process.exit(1);
        }
        await showSummary(args[1]);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Transcript Query CLI

Usage:
  transcript-query.mjs <command> [options]

Commands:
  list [project]              List all transcripts for a project
  recent [project]            Show most recent transcript summary
  search <keyword> [project]  Search for keyword in transcripts
  before <topic> [project]    Show work done before a topic
  summary <session-id|path>   Show detailed summary of a session
  help                        Show this help

Examples:
  transcript-query.mjs list
  transcript-query.mjs recent
  transcript-query.mjs search "authentication"
  transcript-query.mjs before "daemon"
  transcript-query.mjs summary c5fc2201-871d-4a4b-9798-169f52d38ec5
  `);
}

async function listTranscripts(projectPath) {
  const transcripts = await parser.listTranscripts(projectPath);

  if (transcripts.length === 0) {
    console.log('No transcripts found for this project.');
    return;
  }

  console.log(`Found ${transcripts.length} transcripts:\n`);

  for (const t of transcripts) {
    const data = await parser.parseTranscript(t.path);
    console.log(`${t.sessionId}`);
    console.log(`  Time: ${new Date(data.startTime).toLocaleString()}`);
    console.log(`  Duration: ${data.summary.durationFormatted}`);
    console.log(`  Messages: ${data.summary.messageCount}, Files: ${data.summary.filesModifiedCount}`);
    console.log(`  Branch: ${data.gitBranch || 'unknown'}`);
    console.log();
  }
}

async function showRecent(projectPath) {
  const recent = await parser.getMostRecentTranscript(projectPath);

  if (!recent) {
    console.log('No transcripts found for this project.');
    return;
  }

  const data = await parser.parseTranscript(recent.path);

  console.log('Most Recent Session:\n');
  console.log(`Session ID: ${recent.sessionId}`);
  console.log(`Start Time: ${new Date(data.startTime).toLocaleString()}`);
  console.log(`Duration: ${data.summary.durationFormatted}`);
  console.log(`Working Directory: ${data.cwd}`);
  console.log(`Git Branch: ${data.gitBranch || 'unknown'}`);
  console.log();
  console.log('Summary:');
  console.log(`  Messages: ${data.summary.messageCount} (${data.summary.userMessageCount} from user)`);
  console.log(`  Tool Uses: ${data.summary.toolUseCount}`);
  console.log(`  Files Modified: ${data.summary.filesModifiedCount}`);
  console.log(`  Errors: ${data.summary.errorCount}`);
  console.log();

  const topics = parser.extractKeyTopics(data);
  if (topics.length > 0) {
    console.log('Key Topics:');
    console.log(`  ${topics.slice(0, 10).join(', ')}`);
  }
}

async function search(keyword, projectPath) {
  const transcripts = await parser.listTranscripts(projectPath);

  if (transcripts.length === 0) {
    console.log('No transcripts found for this project.');
    return;
  }

  console.log(`Searching for "${keyword}"...\n`);

  let totalMatches = 0;

  for (const t of transcripts) {
    const data = await parser.parseTranscript(t.path);
    const matches = parser.searchMessages(data, keyword);

    if (matches.length > 0) {
      console.log(`${t.sessionId} (${new Date(data.startTime).toLocaleString()})`);
      console.log(`  Branch: ${data.gitBranch || 'unknown'}`);
      console.log(`  ${matches.length} matches:\n`);

      matches.slice(0, 3).forEach(m => {
        const preview = m.content.substring(0, 150).replace(/\n/g, ' ');
        console.log(`    [${m.type}] ${preview}...`);
      });

      if (matches.length > 3) {
        console.log(`    ... and ${matches.length - 3} more matches`);
      }

      console.log();
      totalMatches += matches.length;
    }
  }

  if (totalMatches === 0) {
    console.log(`No matches found for "${keyword}".`);
  } else {
    console.log(`Total: ${totalMatches} matches across ${transcripts.length} sessions.`);
  }
}

async function showBefore(topic, projectPath) {
  const result = await parser.findWorkBefore(projectPath, topic);

  if (!result.found) {
    console.log(result.message);
    return;
  }

  console.log(`Work done before "${topic}":\n`);

  if (result.previousSessions.length === 0) {
    console.log('No previous sessions found.');
    return;
  }

  result.previousSessions.forEach((s, i) => {
    console.log(`${i + 1}. Session ${s.sessionId}`);
    console.log(`   Time: ${new Date(s.startTime).toLocaleString()}`);
    console.log(`   Duration: ${s.summary.durationFormatted}`);
    console.log(`   Branch: ${s.gitBranch || 'unknown'}`);
    console.log(`   Directory: ${s.cwd}`);
    console.log(`   Activity: ${s.summary.messageCount} messages, ${s.summary.filesModifiedCount} files changed`);
    console.log(`   Key Topics: ${s.keyTopics.slice(0, 5).join(', ')}`);
    console.log();
  });

  console.log(`Target session (containing "${topic}"):`);
  console.log(`  Session ID: ${result.targetSession.sessionId}`);
  console.log(`  Time: ${new Date(result.targetSession.data.startTime).toLocaleString()}`);
}

async function showSummary(sessionIdOrPath) {
  let transcriptPath;

  if (sessionIdOrPath.endsWith('.jsonl')) {
    transcriptPath = sessionIdOrPath;
  } else {
    // Assume it's a session ID, find it
    const transcripts = await parser.listTranscripts(process.cwd());
    const match = transcripts.find(t => t.sessionId === sessionIdOrPath);

    if (!match) {
      console.error(`Session not found: ${sessionIdOrPath}`);
      process.exit(1);
    }

    transcriptPath = match.path;
  }

  const data = await parser.parseTranscript(transcriptPath);

  console.log('Session Summary:\n');
  console.log(`Session ID: ${data.sessionId}`);
  console.log(`Start: ${new Date(data.startTime).toLocaleString()}`);
  console.log(`End: ${new Date(data.endTime).toLocaleString()}`);
  console.log(`Duration: ${data.summary.durationFormatted}`);
  console.log(`Directory: ${data.cwd}`);
  console.log(`Branch: ${data.gitBranch || 'unknown'}`);
  console.log();

  console.log('Activity:');
  console.log(`  Total Messages: ${data.summary.messageCount}`);
  console.log(`  User Messages: ${data.summary.userMessageCount}`);
  console.log(`  Tool Uses: ${data.summary.toolUseCount}`);
  console.log(`  Files Modified: ${data.summary.filesModifiedCount}`);
  console.log(`  Errors: ${data.summary.errorCount}`);
  console.log();

  if (data.filesModified.length > 0) {
    console.log('Files Modified:');
    data.filesModified.forEach(f => {
      console.log(`  [${f.action}] ${f.path}`);
    });
    console.log();
  }

  const topics = parser.extractKeyTopics(data);
  if (topics.length > 0) {
    console.log('Key Topics:');
    console.log(`  ${topics.join(', ')}`);
    console.log();
  }

  console.log('Conversation Timeline:');
  data.messages.slice(0, 10).forEach((m, i) => {
    const time = new Date(m.timestamp).toLocaleTimeString();
    const preview = m.content.substring(0, 80).replace(/\n/g, ' ');
    console.log(`  ${i + 1}. [${time}] ${m.type}: ${preview}...`);
  });

  if (data.messages.length > 10) {
    console.log(`  ... and ${data.messages.length - 10} more messages`);
  }
}

main();
