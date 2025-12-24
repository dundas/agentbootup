---
name: task-processor-auto
description: Process tasks autonomously with automated PR reviews and gap analysis after each PR creation/commit.
---

# Autonomous Task Processor with PR Review

## Task Implementation (Autonomous Mode)
- Process all sub-tasks under a parent task **without waiting for user approval**
- Work through tasks sequentially and efficiently
- After each sub-task: commit with proper message
- After parent task complete: create PR and run automated review

## PR Creation & Review Protocol

### When All Sub-Tasks Complete:
1. **Run Tests:** Execute full test suite for the parent task
2. **Stage & Commit:**
   - `git add .`
   - Clean up temporary files/code
   - Commit with conventional commit style:
     ```bash
     git commit -m "feat(scope): summary" \
       -m "- Detailed change 1" \
       -m "- Detailed change 2" \
       -m "Implements Task X.Y from tasks/tasks-autonomous-agent.md"
     ```
3. **Push Branch:** `git push -u origin [branch-name]`
4. **Create PR:** Using `gh pr create` with detailed description
5. **Automated PR Review:**
   - Run: `gh pr view [PR-number]` to get PR status
   - Check code review comments/status
   - Create gap analysis document: `docs/PR_[number]_GAP_ANALYSIS.md`
   - Gap analysis format:
     ```markdown
     # PR #[number] Gap Analysis

     ## Current State
     - Files changed: X
     - Lines added: Y
     - Lines removed: Z
     - Tests added: N

     ## Review Status
     - CI Status: [passing/failing]
     - Review Comments: [count]
     - Blocking Issues: [list]

     ## Gap to "Ready to Merge"
     ### Critical Issues
     - [ ] Issue 1
     - [ ] Issue 2

     ### Nice to Have
     - [ ] Enhancement 1

     ## Recommendation
     ✅ Ready to merge / ❌ Needs work
     ```
6. **Push Gap Analysis:**
   - `git add docs/PR_[number]_GAP_ANALYSIS.md`
   - `git commit -m "docs: add PR gap analysis"`
   - `git push`
7. **Add Detailed PR Comment:**
   - Use `gh pr comment [PR-number] --body "..."`
   - Comment format:
     ```markdown
     ## Changes Summary

     ### Files Modified
     - `path/to/file1.ts` - Brief description of changes
     - `path/to/file2.test.ts` - Added N test cases

     ### Implementation Details
     - Implemented feature X using pattern Y
     - Refactored Z for better performance
     - Added error handling for edge case W

     ### Testing
     - ✅ All X tests passing
     - ✅ Code coverage: Y%
     - ✅ Integration tests added

     ### Gap Analysis
     See docs/PR_[number]_GAP_ANALYSIS.md for detailed gap analysis.

     📊 **Status:** [Ready for review / Needs attention]
     ```

## Workflow Steps

### Phase 1: Implementation
1. Start parent task (e.g., "1.0 Multi-Strategy Comparison")
2. Process all sub-tasks (1.1, 1.2, 1.3, etc.) sequentially
3. For each sub-task:
   - Implement code + tests
   - Run relevant tests
   - Commit with message: `feat(scope): implement task X.Y`
4. Mark parent task complete

### Phase 2: PR Creation
1. Create branch if not exists: `git checkout -b feat/phase-X-description`
2. Push all commits: `git push -u origin feat/phase-X-description`
3. Create PR:
   ```bash
   gh pr create \
     --title "Phase X: Parent Task Name" \
     --body "$(cat <<'EOF'
   ## Summary
   - Bullet point 1
   - Bullet point 2

   ## Implementation
   - Task X.1: Description
   - Task X.2: Description

   ## Testing
   - N tests added (M assertions)
   - All tests passing

   ## Files Changed
   - List of modified/created files

   Closes #[issue-number] (if applicable)
   EOF
   )"
   ```

### Phase 3: Automated Review
1. Wait 30 seconds for CI to start
2. Check PR status: `gh pr view [PR-number]`
3. Check CI status: `gh pr checks [PR-number]`
4. Fetch review comments (if any): `gh api repos/owner/repo/pulls/[PR-number]/comments`
5. Generate gap analysis document
6. Commit and push gap analysis
7. Add detailed comment to PR

### Phase 4: Address Review Feedback (if needed)
1. If gap analysis shows issues:
   - Fix issues
   - Commit: `fix(scope): address PR feedback`
   - Push to PR branch
   - Re-run gap analysis
   - Update PR comment

### Phase 5: Merge
1. When gap analysis shows "Ready to merge":
   - User reviews and approves
   - Squash merge to main
   - Delete branch
   - Move to next parent task

## Task List Maintenance
1. Update task list after each sub-task: mark `[x]`
2. Update after parent task: mark parent `[x]`
3. Keep "Relevant Files" section accurate
4. Add new tasks if discovered during implementation

## Example Workflow

**Starting Task 1.0:**
```
Processing: 1.1 Extend discovery engine
→ Implement code
→ Write tests
→ Run tests (pass)
→ Commit: "feat(discovery): extend engine for multi-strategy scanning"

Processing: 1.2 Create score normalization
→ Implement code
→ Write tests
→ Run tests (pass)
→ Commit: "feat(comparison): implement score normalization"

... (continue through 1.3, 1.4, 1.5, 1.6, 1.7)

All sub-tasks complete for Task 1.0
→ Push branch
→ Create PR #16
→ Wait for CI
→ Check review
→ Generate gap analysis
→ Push gap analysis
→ Add detailed comment
→ Mark parent task complete
```

## AI Instructions
1. **DO NOT** pause after each sub-task (autonomous mode)
2. **DO** commit after each sub-task with clear message
3. **DO** run automated PR review after each PR creation
4. **DO** generate gap analysis document
5. **DO** add detailed PR comments
6. **DO** keep task list updated in real-time
7. Before starting next parent task, ensure previous PR is created and reviewed

## References
- See `reference.md`
- Original task-processor: `.claude/skills/task-processor/SKILL.md`
