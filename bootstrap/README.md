# agentbootup

Seed Claude Code project assets (agents, skills, commands), Windsurf workflows, and AI Dev Tasks into any project.

## Install

This package is designed to be run directly via Node.js or installed as a CLI once published.

### Run from source (standalone repo)
```bash
node bootup.mjs --target /path/to/your/project
```

### CLI (after publishing)
```bash
# Using npx (recommended once published)
npx agentbootup --target /path/to/your/project

# Or install globally
npm i -g agentbootup
agentbootup --target /path/to/your/project
```

## Usage
```bash
# Preview only (no writes)
node bootup.mjs --target . --dry-run --verbose

# Overwrite existing files when needed
node bootup.mjs --target . --force

# Only install specific categories
node bootup.mjs --target . --subset agents,skills
```

- Categories: `agents, skills, commands, workflows, docs`
- Defaults: installs all; skips existing files unless `--force`

## What gets installed
- `.claude/agents/` → project subagents (decomposition-architect, technical-planner, spec-writer, tdd-developer, config-task-writer)
- `.claude/skills/` → project skills (prd-writer, tasklist-generator, task-processor, dev-workflow-orchestrator)
- `.claude/commands/` → convenience commands (prd-writer, generate-tasks, process-tasks, dev-pipeline)
- `.windsurf/workflows/` → Windsurf slash-command workflows
- `ai-dev-tasks/` → PRD + tasks + processing markdown guides
- `tasks/` → created if missing with `.gitkeep`

## After seeding
- Restart Claude Code to reload project assets
- Use Windsurf slash commands: `/dev-pipeline`, `/prd-writer`, `/generate-tasks`, `/process-tasks`

## Local development
```bash
# From repo root
node bootup.mjs --dry-run --verbose
```

Ensure `bootup.mjs` is executable if you plan to use the `bin` command:
```bash
chmod +x bootup.mjs
```

## License
MIT
