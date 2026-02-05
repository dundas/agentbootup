#!/usr/bin/env node
/**
 * Test fuzzy search functionality
 */

import { TranscriptParser } from './lib/transcript-parser.js';

const parser = new TranscriptParser();

// Test with the current session transcript
const transcriptPath = '/Users/kefentse/.claude/projects/-Users-kefentse-dev-env-decisive-redux/c5fc2201-871d-4a4b-9798-169f52d38ec5.jsonl';

console.log('Testing fuzzy search...\n');

const data = await parser.parseTranscript(transcriptPath);

console.log(`Parsed ${data.messages.length} messages\n`);

// Test 1: Exact match
console.log('Test 1: Exact match "daemon"');
const exactMatches = parser.searchMessages(data, 'daemon');
console.log(`  Found ${exactMatches.length} matches`);
if (exactMatches.length > 0) {
  console.log(`  Best match score: ${exactMatches[0].score.toFixed(2)}`);
  console.log(`  Match types: ${exactMatches[0].matches.map(m => m.type).join(', ')}`);
}
console.log();

// Test 2: Fuzzy match (typo)
console.log('Test 2: Fuzzy match "daemom" (typo for "daemon")');
const fuzzyMatches = parser.searchMessages(data, 'daemom');
console.log(`  Found ${fuzzyMatches.length} matches`);
if (fuzzyMatches.length > 0) {
  console.log(`  Best match score: ${fuzzyMatches[0].score.toFixed(2)}`);
  console.log(`  Match types: ${fuzzyMatches[0].matches.map(m => m.type).join(', ')}`);
  const preview = fuzzyMatches[0].content.substring(0, 100).replace(/\n/g, ' ');
  console.log(`  Preview: ${preview}...`);
}
console.log();

// Test 3: Stemming
console.log('Test 3: Stemming "transcripting" (should find "transcript")');
const stemmingMatches = parser.searchMessages(data, 'transcripting');
console.log(`  Found ${stemmingMatches.length} matches`);
if (stemmingMatches.length > 0) {
  console.log(`  Best match score: ${stemmingMatches[0].score.toFixed(2)}`);
  console.log(`  Match types: ${stemmingMatches[0].matches.map(m => m.type).join(', ')}`);
}
console.log();

// Test 4: Partial match
console.log('Test 4: Partial match "trans" (should find "transcript", "transaction", etc.)');
const partialMatches = parser.searchMessages(data, 'trans');
console.log(`  Found ${partialMatches.length} matches`);
if (partialMatches.length > 0) {
  console.log(`  Best match score: ${partialMatches[0].score.toFixed(2)}`);
  console.log(`  Match types: ${partialMatches[0].matches.map(m => m.type).join(', ')}`);
}
console.log();

console.log('✅ Fuzzy search test complete');
