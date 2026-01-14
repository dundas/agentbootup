# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project Overview

agentbootup is a CLI tool that seeds agentic development assets (agents, skills, commands, workflows) into any target project. Originally designed for Claude Code and Windsurf, it also supports Gemini CLI via the Agent Skills standard.

## Gemini CLI Compatibility

- Tested locally with `gemini` CLI `v0.23.0` (run `gemini --version`).
- Gemini CLI flags evolve quickly; verify your installed version with `gemini --help`.

### Headless / scripting invocation

- Prefer the positional prompt (recommended going forward):
  - `gemini "Explain the architecture of this repo"`
- `--prompt` / `-p` exists but is deprecated in newer versions.

### Approval / automation

- For non-interactive automation, use approval modes:
  - `--approval-mode=yolo` (auto-approve all tool calls)
  - `--approval-mode=auto_edit` (auto-approve edit tools)
  - `--yolo` / `-y` is also supported as a shortcut in current versions.

## Template Structure (What agentbootup seeds)

Templates are organized under `templates/` and map to specific categories:

1. **Gemini CLI Assets** (`templates/.gemini/`)
   - `skills/` - Agent Skills (folders containing `SKILL.md` with YAML frontmatter)
   - `agents/` - Persona reference files (promptable roles)
   - `commands/` - Slash-command instructions (documentation)
2. **Claude Code Assets** (`templates/.claude/`)
   - `agents/`, `skills/`, `commands/` - Parallel support for Claude Code
3. **Windsurf Workflows** (`templates/.windsurf/workflows/`)
   - Cascade workflow definitions
4. **Documentation** (`templates/ai-dev-tasks/`)
   - Guides for PRD → tasks → implementation workflows

## Gemini CLI Specifics

### Agent Skills

Skills are located at `.gemini/skills/<skill-name>/SKILL.md`.

- Each skill must have YAML frontmatter with `name` and `description`.
- Gemini CLI discovers skills from `.gemini/skills/` (project), `~/.gemini/skills/` (user), and extension skills.
- Skill management is via `/skills ...` and the `gemini skills ...` command (Agent Skills are an experimental feature and may require enabling `experimental.skills` in `/settings`).

### Personas vs “Agents”

This repo seeds persona reference files under `.gemini/agents/`. These are not automatically executed “agents” by the CLI; they’re role descriptions you include in prompts (for example, "You are the reliability engineer; follow `.gemini/agents/reliability-engineer.md`.").

### Subagents (shell delegation)

To keep your main chat focused, you can spawn separate Gemini CLI processes as subagents via the shell.

Example:

```bash
gemini --approval-mode=yolo "$(cat <<'EOF'
You are the Technical Planner.
Read .gemini/agents/technical-planner.md for your persona.
Summarize the architecture and propose an implementation plan.
EOF
)" < /dev/null &
```

Monitor background jobs with `jobs -l` or `ps`.

## Common Commands

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
