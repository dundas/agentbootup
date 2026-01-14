# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project Overview

agentbootup is a CLI tool that seeds agentic development assets (agents, skills, commands, workflows) into any target project. Originally designed for Claude Code and Windsurf, it is being updated to support Gemini CLI natively via the Agent Skills standard.

## Core Architecture

### Main Entry Point
- `bootup.mjs` - The executable CLI script that copies template files from `templates/` to a target project directory.

### Template Structure
Templates are organized under `templates/` and map to specific categories:

1. **Gemini CLI Assets** (`templates/.gemini/`):
   - `skills/` - Specialized Agent Skills (agentskills.io) including PRD writing, task generation, and workflow orchestration.
2. **Claude Code Assets** (`templates/.claude/`):
   - `agents/`, `skills/`, `commands/` - Legacy and parallel support for Claude.
3. **Windsurf Workflows** (`templates/.windsurf/workflows/`):
   - Cascade workflow definitions.
4. **Documentation** (`templates/ai-dev-tasks/`):
   - Markdown guides for the AI-assisted development workflow.

## Gemini CLI Specifics

### Agent Skills
This project implements the **Agent Skills** open standard. Skills are located in `.gemini/skills/<skill-name>/SKILL.md`.
- Each skill must have a YAML header with `name` and `description`.
- Activation is handled autonomously by Gemini CLI based on the `description`.

### Subagents
Gemini CLI handles subagents via the `delegate_to_agent` tool (for specialized agents like `codebase_investigator`) or via shell delegation.

## Common Commands

### Development
```bash
# Run dry-run to preview what would be installed
node bootup.mjs --dry-run --verbose

# Install to current directory
node bootup.mjs --target . --force

# Install Gemini subset only
node bootup.mjs --target /path/to/project --subset gemini
```

## Development Workflow Pattern

1. **PRD Creation** - Use `prd-writer` skill.
2. **Task Generation** - Use `tasklist-generator` to break PRD into tasks.
3. **Task Processing** - Use `task-processor` to implement tasks with TDD.
