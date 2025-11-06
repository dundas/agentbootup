# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Task Implementation
- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**  
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
    - **First**: Run the full test suite (`pytest`, `npm test`, `bin/rails test`, etc.)
    - **Only if all tests pass**: Stage changes (`git add .`)
    - **Clean up**: Remove any temporary files and temporary code before committing
    - **Commit**: Use a descriptive commit message that:
      - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
      - Summarizes what was accomplished in the parent task
      - Lists key changes and additions
      - References the task number and PRD context
      - **Formats the message as a single-line command using `-m` flags**, e.g.:

        ```
        git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to T123 in PRD"
        ```
  3. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## Pull Request Creation

After **ALL** parent tasks in the task list are complete (`[x]`), create a pull request:

1. **Verify completion:**
   - All parent tasks marked `[x]`
   - All tests passing
   - All commits pushed to feature branch

2. **Create the PR:**
   - Use `gh pr create` or the GitHub web interface
   - Include a comprehensive description with:
     - Summary of what was implemented
     - Link to PRD: `Related to /tasks/[n]-prd-[feature-name].md`
     - Link to tasks: `Task list: /tasks/tasks-[n]-prd-[feature-name].md`
     - Testing instructions
     - Screenshots or demos (if UI changes)
   - Example:
     ```bash
     gh pr create --title "feat: User Profile Editing" --body "$(cat <<'EOF'
     ## Summary
     Implements user profile editing functionality as specified in the PRD.

     ## Related Documents
     - PRD: /tasks/0001-prd-user-profile-editing.md
     - Tasks: /tasks/tasks-0001-prd-user-profile-editing.md

     ## Changes
     - Added profile form with validation
     - Implemented avatar upload
     - Created comprehensive test suite

     ## Testing
     1. Run `npm test` to verify all tests pass
     2. Test profile editing flow manually
     3. Verify avatar upload works with various image formats
     EOF
     )"
     ```

3. **Request review:** Assign appropriate reviewers and add relevant labels.

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.
7. **After all parent tasks are complete:** Create a pull request following the PR creation guidelines above.
