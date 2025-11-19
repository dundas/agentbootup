# Bootup: Seed Claude Code + Windsurf into Any Project

## What it does
- Adds project-level Claude Code assets:
  - `.claude/agents/` (decomposition-architect, technical-planner, spec-writer, tdd-developer, config-task-writer)
  - `.claude/skills/` (prd-writer, tasklist-generator, task-processor, dev-workflow-orchestrator, frontend-design-concept, design-system-implementation)
  - `.claude/commands/` (dev-pipeline, prd-writer, generate-tasks, process-tasks)
- Adds Windsurf workflows under `.windsurf/workflows/` (prd-writer, generate-tasks, process-tasks, dev-pipeline)
- Adds AI Dev Tasks docs under `ai-dev-tasks/`:
  - `create-prd.md` – Write a PRD for a new feature.
  - `generate-tasks.md` – Generate a detailed task list from a PRD.
  - `process-task-list.md` – Drive implementation using the generated task list.
  - `design-system-from-reference.md` – Create a reusable design system from a reference UI screenshot.
- Creates `tasks/` directory with `.gitkeep`

## Requirements
- Node.js 18+

## Usage
```bash
# From this repo root
node bootup.mjs --target /path/to/your/project

# Preview only
node bootup.mjs --target . --dry-run --verbose

# Overwrite existing files if needed
node bootup.mjs --target . --force

# Install a subset only
node bootup.mjs --target . --subset agents,skills
```

## After seeding
- Restart Claude Code to reload project agents/skills/commands
- In Windsurf (Cascade): use `/dev-pipeline` or `/prd-writer` etc.
- Tasks will be saved to `tasks/`

## Run from a fresh clone
```bash
git clone <this-repo-url>
cd <repo>
node bootup.mjs --target /path/to/another/project
```

## Notes
- Non-destructive by default (skips existing); use `--force` to overwrite
- Idempotent and safe to re-run
