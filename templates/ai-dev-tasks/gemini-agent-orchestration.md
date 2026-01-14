# Gemini Agent Orchestration Guide

This guide explains how to use the agents, skills, and personas seeded by `agentbootup` within the Gemini CLI ecosystem.

## 1. Skills vs. Agents: The Key Distinction

In Gemini CLI, extensibility follows two patterns:
- **Agent Skills**: Procedural "expertises" (e.g., `prd-writer`). They live in `.gemini/skills/` and are loaded into your *current* conversation context when activated.
- **Subagents**: Independent instances of Gemini CLI spawned to perform a specific task in an *isolated* context window.

---

## 2. Using Agent Skills

Skills are **on-demand expertise**. They stay dormant until needed to save token costs.

### Discovery
Use the `/skills` command to manage them:
- `/skills list` — See all available skills and their status.
- `/skills reload` — Refresh the list if you've added new skills.

### Activation
Skills activate in two ways:
1. **Autonomous**: If you ask "Help me write a PRD," Gemini CLI will see that the `prd-writer` skill description matches and call `activate_skill(name="prd-writer")`.
2. **Manual**: You can explicitly ask "Activate the prd-writer skill."

### Human-in-the-Loop
Gemini CLI will always ask for your **confirmation** before activating a skill, as it grants the model access to the skill's specific instructions and resources.

---

## 3. Using Subagents (Delegation)

Gemini CLI uses **Shell Delegation** to handle complex tasks without polluting your main conversation context.

### The Shell Delegation Pattern
To spawn a specialized subagent, use the `run_shell_command` tool.

**Basic Syntax:**
```bash
gemini -p "Prompt" --allowed-tools <tools> --yolo < /dev/null &
```

### Using Seeded Personas
`agentbootup` seeds reference personas in `.gemini/agents/`. You can "boot" a subagent with these roles:

#### Example: Spawning a Technical Planner
```bash
gemini -p "You are the Technical Planner. 
           Read .gemini/agents/technical-planner.md for your persona. 
           Analyze the PRD in tasks/0001-prd.md and suggest a technical approach." \
       --allowed-tools read_file,glob \
       --yolo \
       < /dev/null &
```

### Best Practices for Subagents
1. **Isolated Context**: Use subagents for "heavy lifting" (reading 20+ files) to keep your main chat fast.
2. **Tool Restriction**: Only grant the subagent the tools it needs (e.g., `read_file`, `web_fetch`).
3. **The `--yolo` Flag**: Use this only if you trust the prompt, as it allows the subagent to execute tools without asking for confirmation (crucial for background tasks).
4. **Input Redirection**: Always use `< /dev/null` to ensure the subagent doesn't hang waiting for terminal input.

---

## 4. Native Specialized Agents

Gemini CLI includes a native specialized agent that I can call directly:
- **`codebase_investigator`**: Ask me to "Investigate the codebase to find where authentication is handled." I will use this sub-agent to map the repository without filling our chat with every file I read.

---

## 5. Multi-Agent Orchestration (Filesystem-as-State)

For complex workflows (like the `dev-pipeline`), we use the filesystem to coordinate:
1. **Main Agent**: Writes a task to `tasks/pending-task.json`.
2. **Subagent**: Reads the task, performs the work, and writes a report to `tasks/completed-task.md`.
3. **Main Agent**: Reads the report and updates the user.

This pattern allows for parallel work and "infinite" context by swapping out sub-agents for different phases of development.
