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
node bootup.mjs --target . --subset agents,skills,commands,workflows,docs,hooks
```

- Categories: `agents, skills, commands, workflows, docs, hooks`
- Defaults: installs all; skips existing files unless `--force`

## What gets installed
- `.claude/agents/` → project subagents (decomposition-architect, technical-planner, spec-writer, tdd-developer, config-task-writer, code-review-orchestrator, ui-prompt-orchestrator, contract-driven-api-developer, pattern-driven-api-developer, phased-code-developer, concurrent-artifact-developer, openapi-doc-writer)
- `.claude/skills/` → project skills (prd-writer, tasklist-generator, task-processor, dev-workflow-orchestrator, fetch-pr-review, analyze-code-gaps, iterate-on-feedback, extract-ia-and-flows, screen-inventory-builder, style-token-suggester, prompt-writer-figma-make, prompt-writer-ux-pilot)
- `.claude/commands/` → convenience commands (prd-writer, generate-tasks, process-tasks, dev-pipeline, code-review-workflow, ui-design-workflow)
- `.windsurf/workflows/` → Windsurf slash-command workflows (dev-pipeline, prd-writer, generate-tasks, process-tasks, code-review-workflow, ui-design-workflow)
- `ai-dev-tasks/` → PRD + tasks + processing + code review + UI design markdown guides
- `tasks/` → created if missing with `.gitkeep`

## After seeding
- Restart Claude Code to reload project assets
- Use Windsurf slash commands: `/dev-pipeline`, `/prd-writer`, `/generate-tasks`, `/process-tasks`, `/code-review-workflow`, `/ui-design-workflow`
- Use Claude Code commands: 
  - `/code-review-workflow [PR_NUMBER]` for automated PR review gap analysis
  - `/ui-design-workflow [SPEC_PATH]` to generate UI design prompts for Figma Make and UX Pilot

## Upgrade existing projects

Use bootup again against your target project to pull in new templates.

### Add only new files (safe)
```bash
# Does not overwrite existing files; adds missing ones only
node bootup.mjs --target /path/to/your/project --subset agents,skills,workflows,commands,hooks
```

### Overwrite to pick up updates (careful)
```bash
# Overwrites existing templates to latest
node bootup.mjs --target /path/to/your/project --subset agents,skills,workflows,commands,hooks --force
```

### Tips
- **Subset**: limit categories to what you want to update (e.g., `agents` only)
- **Dry run**: preview changes before writing
```bash
node bootup.mjs --target /path/to/your/project --subset agents,skills --dry-run --verbose
```
-
If you previously installed without `hooks`, you can install hook templates now with:
```bash
node bootup.mjs --target /path/to/your/project --subset hooks
```

## Local development
```bash
# From repo root
node bootup.mjs --dry-run --verbose
```

Ensure `bootup.mjs` is executable if you plan to use the `bin` command:
```bash
chmod +x bootup.mjs
```

## Related documentation

- `CODE_REVIEW_WORKFLOW.md` – AI-powered code review workflow overview
- `UI_DESIGN_WORKFLOW.md` – UI prompt generation system summary
- `REMOTE_CLAUDE_APPROVAL_SYSTEM.md` – Remote approvals via hooks + mobile UI
- `QUICK_START_CODE_REVIEW.md` – Quick reference for code review workflow

## License
MIT
