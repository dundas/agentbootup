#!/usr/bin/env node
// Portable bootup script to seed Claude Code agents, skills, commands,
// Windsurf workflows, and AI Dev Tasks into any project.
// Usage:
//   node bootstrap/bootup.mjs [--target <dir>] [--subset <csv>] [--force] [--dry-run] [--verbose]
//   subsets: agents,skills,commands,workflows,docs (default: all)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesRoot = path.join(__dirname, 'templates');

function parseArgs(argv) {
  const args = { target: process.cwd(), subset: ['agents','skills','commands','workflows','docs','hooks'], force: false, dryRun: false, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--target' && argv[i+1]) { args.target = path.resolve(argv[++i]); }
    else if (a === '--subset' && argv[i+1]) {
      args.subset = argv[++i].split(',').map(s => s.trim()).filter(Boolean);
    }
    else if (a === '--force') { args.force = true; }
    else if (a === '--dry-run') { args.dryRun = true; }
    else if (a === '--verbose') { args.verbose = true; }
    else if (a === '--help' || a === '-h') { printHelpAndExit(); }
  }
  return args;
}

function printHelpAndExit(code = 0) {
  console.log(`\nBootup - Seed Claude Code + Windsurf into any project\n\n` +
`Options:\n` +
`  --target <dir>     Target project directory (default: CWD)\n` +
`  --subset <csv>     Which templates to install: agents,skills,commands,workflows,docs,hooks (default: all)\n` +
`  --force            Overwrite existing files\n` +
`  --dry-run          Preview actions without writing\n` +
`  --verbose          Print each file action\n`);
  process.exit(code);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function relToCategory(relPath) {
  if (relPath.startsWith('.claude/agents/')) return 'agents';
  if (relPath.startsWith('.claude/skills/')) return 'skills';
  if (relPath.startsWith('.claude/commands/')) return 'commands';
  if (relPath.startsWith('.claude/hooks/')) return 'hooks';
  if (relPath.startsWith('.windsurf/workflows/')) return 'workflows';
  if (relPath.startsWith('ai-dev-tasks/')) return 'docs';
  if (relPath.startsWith('tasks/')) return 'docs';
  return 'other';
}

function listTemplateFiles(root) {
  const files = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(root);
  return files;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(templatesRoot)) {
    console.error('❌ Templates directory not found:', templatesRoot);
    process.exit(1);
  }

  const allFiles = listTemplateFiles(templatesRoot);
  const actions = [];

  for (const src of allFiles) {
    const rel = path.relative(templatesRoot, src).replaceAll('\\', '/');
    const category = relToCategory(rel);
    if (!args.subset.includes(category)) continue;

    const dest = path.join(args.target, rel);
    const destDir = path.dirname(dest);
    const exists = fs.existsSync(dest);

    if (exists && !args.force) {
      actions.push({ type: 'skip', rel, reason: 'exists' });
      if (args.verbose) console.log('↷ skip (exists):', rel);
      continue;
    }

    if (!args.dryRun) {
      ensureDir(destDir);
      fs.copyFileSync(src, dest);
    }
    actions.push({ type: args.dryRun ? 'wouldWrite' : (exists ? 'overwritten' : 'written'), rel });
    if (args.verbose) console.log(args.dryRun ? '● would write:' : '✓ wrote:', rel);
  }

  // Ensure tasks/ exists
  if (args.subset.includes('docs')) {
    const tasksDir = path.join(args.target, 'tasks');
    ensureDir(tasksDir);
    const gitkeep = path.join(tasksDir, '.gitkeep');
    if (!fs.existsSync(gitkeep) && !args.dryRun) fs.writeFileSync(gitkeep, '');
  }

  // Summary
  const summary = actions.reduce((acc, a) => { acc[a.type] = (acc[a.type]||0)+1; return acc; }, {});
  console.log('\nBootup summary:');
  for (const [k,v] of Object.entries(summary)) console.log(`  ${k}: ${v}`);
  console.log('\nInstalled categories:', args.subset.join(','));
  console.log('Target:', args.target);
  console.log('\nNext steps:');
  console.log('  - Restart Claude Code if running to reload agents/skills/commands');
  console.log('  - In Windsurf, use /dev-pipeline or individual workflows');
}

try {
  run();
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
