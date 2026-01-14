#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const templatesRoot = path.join(repoRoot, 'templates');

const CLAUDE_ROOT = path.join(templatesRoot, '.claude');
const GEMINI_ROOT = path.join(templatesRoot, '.gemini');
const CODEX_ROOT = path.join(templatesRoot, '.codex');

const GEMINI_SKILL_OVERRIDES = new Set([
  // Gemini versions differ materially from Claude versions
  'dialectical-autocoder',
  'task-processor-parallel',
]);

const CODEX_SKILLS_ALLOWLIST = new Set([
  // Codex supports skills but not Claude-style subagents.
  // Keep this list small and only include skills we validate.
  'dev-workflow-orchestrator',
  'prd-writer',
  'task-processor',
  'tasklist-generator',
]);

function parseArgs(argv) {
  return {
    check: argv.includes('--check'),
    verbose: argv.includes('--verbose'),
  };
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function listChildDirs(p) {
  if (!isDirectory(p)) return [];
  return fs
    .readdirSync(p, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function listFilesRecursively(rootDir) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile()) out.push(abs);
    }
  };
  walk(rootDir);
  return out.sort();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizeNewlines(s) {
  // Keep output stable across platforms.
  return s.replace(/\r\n/g, '\n');
}

function replaceAllStable(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

function transformForGemini(content) {
  let out = normalizeNewlines(content);

  // Path references
  out = out.replace(/\.claude\//g, '.gemini/');

  // Branding (minimal + intentionally conservative)
  out = out.replace(/\bClaude Code\b/g, 'Gemini CLI');
  out = out.replace(/\bClaude\b(?=\s+is\s+capable\b)/g, 'Gemini');

  return out;
}

function transformForCodex(content) {
  let out = normalizeNewlines(content);

  // Codex skills live under .codex/skills.
  out = out.replace(/\.claude\/skills\//g, '.codex/skills/');

  // Codex does not use Claude-style subagents.
  // Drop agent reference lines rather than leaving broken paths.
  out = out
    .split('\n')
    .filter((line) => !line.includes('.claude/agents/'))
    .join('\n');

  // Branding where it is explicitly Claude Code
  out = out.replace(/\bClaude Code\b/g, 'Codex');

  return out;
}

function buildExpectedOutputs({ platform, mode }) {
  // mode: 'write' | 'check'
  const expectedFiles = new Map();
  const expectedDirs = new Set();

  const platformRoot =
    platform === 'gemini'
      ? GEMINI_ROOT
      : platform === 'codex'
        ? CODEX_ROOT
        : CLAUDE_ROOT;

  const transform =
    platform === 'gemini'
      ? transformForGemini
      : platform === 'codex'
        ? transformForCodex
        : (s) => normalizeNewlines(s);

  const addDir = (absDir) => expectedDirs.add(absDir);

  const addFile = (absFile, content) => {
    expectedFiles.set(absFile, content);
    addDir(path.dirname(absFile));
  };

  // Agents
  if (platform === 'gemini') {
    const srcAgents = path.join(CLAUDE_ROOT, 'agents');
    const destAgents = path.join(GEMINI_ROOT, 'agents');

    for (const srcFile of listFilesRecursively(srcAgents)) {
      const rel = path.relative(srcAgents, srcFile);
      const destFile = path.join(destAgents, rel);
      const srcContent = readUtf8(srcFile);
      const rendered = srcFile.endsWith('.md') ? transform(srcContent) : srcContent;
      addFile(destFile, rendered);
    }
  }

  // Skills
  if (platform === 'gemini') {
    const srcSkillsRoot = path.join(CLAUDE_ROOT, 'skills');
    const destSkillsRoot = path.join(GEMINI_ROOT, 'skills');

    for (const skillName of listChildDirs(srcSkillsRoot)) {
      if (GEMINI_SKILL_OVERRIDES.has(skillName)) continue;

      const srcSkillDir = path.join(srcSkillsRoot, skillName);
      const destSkillDir = path.join(destSkillsRoot, skillName);
      addDir(destSkillDir);

      for (const srcFile of listFilesRecursively(srcSkillDir)) {
        const rel = path.relative(srcSkillDir, srcFile);
        const destFile = path.join(destSkillDir, rel);
        const srcContent = readUtf8(srcFile);
        const rendered = srcFile.endsWith('.md') ? transform(srcContent) : srcContent;
        addFile(destFile, rendered);
      }
    }
  }

  if (platform === 'codex') {
    const srcSkillsRoot = path.join(CLAUDE_ROOT, 'skills');
    const destSkillsRoot = path.join(CODEX_ROOT, 'skills');

    for (const skillName of listChildDirs(srcSkillsRoot)) {
      if (!CODEX_SKILLS_ALLOWLIST.has(skillName)) continue;

      const srcSkillDir = path.join(srcSkillsRoot, skillName);
      const destSkillDir = path.join(destSkillsRoot, skillName);
      addDir(destSkillDir);

      for (const srcFile of listFilesRecursively(srcSkillDir)) {
        const rel = path.relative(srcSkillDir, srcFile);
        const destFile = path.join(destSkillDir, rel);
        const srcContent = readUtf8(srcFile);
        const rendered = srcFile.endsWith('.md') ? transform(srcContent) : srcContent;
        addFile(destFile, rendered);
      }
    }
  }

  // Ensure root folders exist
  addDir(platformRoot);

  return { expectedFiles, expectedDirs };
}

function verifyNoExtras({ managedRoot, expectedPaths }) {
  // expectedPaths is Set of absolute file/dir paths.
  if (!isDirectory(managedRoot)) return [];

  const extras = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (!expectedPaths.has(abs)) {
        extras.push(abs);
        continue;
      }
      if (entry.isDirectory()) walk(abs);
    }
  };

  walk(managedRoot);
  return extras;
}

function runCheck({ platform, verbose }) {
  const { expectedFiles, expectedDirs } = buildExpectedOutputs({ platform, mode: 'check' });

  const problems = [];

  for (const dir of expectedDirs) {
    if (!isDirectory(dir)) problems.push(`Missing dir: ${path.relative(repoRoot, dir)}`);
  }

  for (const [destFile, expected] of expectedFiles.entries()) {
    if (!isFile(destFile)) {
      problems.push(`Missing file: ${path.relative(repoRoot, destFile)}`);
      continue;
    }
    const actual = normalizeNewlines(readUtf8(destFile));
    if (actual !== expected) {
      problems.push(`Out of sync: ${path.relative(repoRoot, destFile)}`);
      if (verbose) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbootup-sync-'));
        const expPath = path.join(tmp, 'expected');
        const actPath = path.join(tmp, 'actual');
        fs.writeFileSync(expPath, expected);
        fs.writeFileSync(actPath, actual);
        problems.push(`  diff: diff -u "${actPath}" "${expPath}"`);
      }
    }
  }

  // Extra files/dirs check (only for managed roots)
  if (platform === 'gemini') {
    const expectedPaths = new Set([...expectedDirs, ...expectedFiles.keys()]);
    const extras = [
      ...verifyNoExtras({ managedRoot: path.join(GEMINI_ROOT, 'agents'), expectedPaths }),
      ...verifyNoExtras({ managedRoot: path.join(GEMINI_ROOT, 'skills'), expectedPaths }),
    ];
    for (const extra of extras) {
      // Allow overridden skill directories and their contents.
      const rel = path.relative(path.join(GEMINI_ROOT, 'skills'), extra);
      const top = rel.split(path.sep)[0];
      if (top && GEMINI_SKILL_OVERRIDES.has(top)) continue;
      problems.push(`Unexpected extra: ${path.relative(repoRoot, extra)}`);
    }
  }

  if (platform === 'codex') {
    const expectedPaths = new Set([...expectedDirs, ...expectedFiles.keys()]);
    const extras = verifyNoExtras({ managedRoot: path.join(CODEX_ROOT, 'skills'), expectedPaths });
    for (const extra of extras) {
      // Allow other codex files (future) only if outside skills.
      problems.push(`Unexpected extra: ${path.relative(repoRoot, extra)}`);
    }
  }

  return problems;
}

function runWrite({ platform, verbose }) {
  const { expectedFiles, expectedDirs } = buildExpectedOutputs({ platform, mode: 'write' });

  for (const dir of expectedDirs) ensureDir(dir);

  // Write files
  for (const [destFile, content] of expectedFiles.entries()) {
    ensureDir(path.dirname(destFile));
    fs.writeFileSync(destFile, content);
    if (verbose) console.log('wrote', path.relative(repoRoot, destFile));
  }

  // Clean up codex skills not in allowlist
  if (platform === 'codex') {
    const destSkillsRoot = path.join(CODEX_ROOT, 'skills');
    if (isDirectory(destSkillsRoot)) {
      for (const skillName of listChildDirs(destSkillsRoot)) {
        if (CODEX_SKILLS_ALLOWLIST.has(skillName)) continue;
        const abs = path.join(destSkillsRoot, skillName);
        fs.rmSync(abs, { recursive: true, force: true });
        if (verbose) console.log('removed', path.relative(repoRoot, abs));
      }
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const platforms = ['gemini', 'codex'];

  if (args.check) {
    const allProblems = [];
    for (const platform of platforms) {
      allProblems.push(...runCheck({ platform, verbose: args.verbose }));
    }

    if (allProblems.length > 0) {
      console.error('Templates are out of sync:\n' + allProblems.map((p) => `- ${p}`).join('\n'));
      process.exit(1);
    }

    console.log('Templates are in sync.');
    return;
  }

  for (const platform of platforms) {
    runWrite({ platform, verbose: args.verbose });
  }

  console.log('Sync complete.');
}

try {
  main();
} catch (err) {
  console.error('❌ sync-templates failed:', err?.stack || err?.message || String(err));
  process.exit(1);
}
