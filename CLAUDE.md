# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

agentbootup is a CLI tool that seeds Claude Code project assets (agents, skills, commands), Windsurf workflows, and AI Dev Task documentation into any target project. It's a bootstrap utility designed to accelerate development by installing pre-built development workflows.

## Core Architecture

### Main Entry Point
- `bootup.mjs` - The executable CLI script that copies template files from `templates/` to a target project directory
- Uses ES modules (type: "module" in package.json)
- Requires Node.js 18+

### Template Structure
Templates are organized under `templates/` and map to specific categories:

1. **Claude Code Assets** (`templates/.claude/`):
   - `agents/` - Specialized subagents for task decomposition, planning, spec writing, TDD development, and config management
   - `skills/` - Multi-file skills including PRD writing, task generation/processing, and workflow orchestration
   - `commands/` - Convenience slash commands that invoke workflows or reference skills

2. **Windsurf Workflows** (`templates/.windsurf/workflows/`):
   - Cascade workflow definitions that mirror the Claude Code commands
   - Include: prd-writer, generate-tasks, process-tasks, dev-pipeline, frontend-design-concept, design-system workflows

3. **Documentation** (`templates/ai-dev-tasks/`):
   - Markdown guides for creating PRDs, generating tasks, processing task lists, and design system workflows
   - These docs explain the AI-assisted development workflow pattern

### CLI Argument Parsing
The script accepts:
- `--target <dir>` - Target project directory (defaults to CWD)
- `--subset <csv>` - Filter by category: agents, skills, commands, workflows, docs (defaults to all)
- `--force` - Overwrite existing files
- `--dry-run` - Preview without writing
- `--verbose` - Print each file action

### File Copy Logic
1. Recursively walks `templates/` directory
2. Maps relative paths to categories (agents, skills, commands, workflows, docs)
3. Filters based on `--subset` argument
4. Skips existing files unless `--force` is used
5. Creates necessary parent directories
6. Copies files maintaining directory structure

## Common Commands

### Development
```bash
# Run dry-run to preview what would be installed
npm run dry-run

# OR using node directly
node bootup.mjs --dry-run --verbose

# Test from source (install to current directory)
node bootup.mjs --target . --force

# Install to another project
node bootup.mjs --target /path/to/project

# Install only specific categories
node bootup.mjs --target /path/to/project --subset agents,skills
```

### CLI Usage (after publishing)
```bash
# Run via npx
npx agentbootup --target /path/to/project

# Global install
npm i -g agentbootup
agentbootup --target /path/to/project
```

### Testing
```bash
npm test  # Currently just prints "ok"
```

## Development Workflow Pattern

This tool implements an AI-assisted development workflow:

1. **PRD Creation** - Use prd-writer skill/command to create structured Product Requirements Document
2. **Task Generation** - Use tasklist-generator to break PRD into granular, dependency-ordered tasks
3. **Task Processing** - Use task-processor to systematically implement each task with TDD approach
4. **Orchestration** - Use dev-workflow-orchestrator or dev-pipeline command to run the full workflow

Tasks are saved to a `tasks/` directory in the target project.

## Key Design Principles

1. **Non-destructive by default** - Skips existing files unless `--force` is specified
2. **Idempotent** - Safe to re-run multiple times
3. **Category-based filtering** - Install only what you need via `--subset`
4. **Portable** - Single file with templates folder, no external dependencies
5. **Cross-platform** - Path handling works on Windows/Unix via path normalization

## Keeping Templates In Sync

The canonical source for shared agents/skills is `templates/.claude/**`.

```bash
# Regenerate derived templates
npm run sync-templates

# Verify everything is synced (useful for CI)
npm run check-templates
```

Notes:
- `templates/.gemini/**` is generated from Claude templates except for:
  - `templates/.gemini/skills/dialectical-autocoder/**`
  - `templates/.gemini/skills/task-processor-parallel/**`
- `templates/.codex/skills/**` is generated from Claude templates for the allowlisted skills (see `scripts/sync-templates.mjs`).

## Important File Paths

- Main script: `bootup.mjs`
- Templates root: `templates/`
- Package metadata: `package.json`
- Documentation: `README.md`, `BOOTUP.md`

## After Installation Notes

When users run this tool on their projects, remind them to:
- Restart Claude Code to reload newly installed agents/skills/commands
- In Windsurf, use slash commands like `/dev-pipeline`, `/prd-writer`
- Generated PRDs and tasks will be saved to `tasks/` directory in their project
