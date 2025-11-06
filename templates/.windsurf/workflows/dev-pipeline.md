# Dev Pipeline
Chain PRD creation → Task generation → Task processing → PR creation with confirmation gates. This workflow composes the other three workflows.

## Steps
1. Call /prd-writer
   - Ask the user for feature description and refs.
   - Use @skills/prd-writer/SKILL.md to ask clarifying questions and generate the PRD.
   - Confirm saved PRD path (e.g., `/tasks/0001-prd-...md`).
2. Call /generate-tasks
   - Provide the confirmed PRD path.
   - Generate ONLY parent tasks first; pause and ask the user to reply "Go".
   - On "Go", generate sub‑tasks, "Relevant Files", testing guidance, commit strategy, and PR strategy.
   - Confirm tasks file path (e.g., `/tasks/tasks-0001-prd-...md`).
3. Call /process-tasks
   - Provide the confirmed tasks file path.
   - Work one sub‑task at a time. After each sub‑task, pause for "yes"/"y".
   - When a parent's subtasks are all `[x]`: run tests, stage, clean up, conventional commit with multi `-m`, then mark parent `[x]`.
4. Create Pull Request
   - After ALL parent tasks are `[x]`, create a PR with comprehensive description.
   - Include links to PRD and tasks files, summary of changes, and testing instructions.
   - Request review and add labels.

## Notes
- Skills referenced: `.claude/skills/prd-writer/SKILL.md`, `.claude/skills/tasklist-generator/SKILL.md`, `.claude/skills/task-processor/SKILL.md`.
- In‑repo guidance: `ai-dev-tasks/create-prd.md`, `ai-dev-tasks/generate-tasks.md`, `ai-dev-tasks/process-task-list.md`.
