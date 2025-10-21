# Code Review Workflow
Fetch PR review comments, analyze gaps between current code and merge-ready state, then iterate on fixes with validation loops.

## Steps
1. **Fetch PR Review Comments**
   - Ask user for PR number (or detect from current branch)
   - Use @skills/fetch-pr-review/SKILL.md to retrieve and categorize all review comments
   - Show summary: "Found X comments: Y blocking, Z suggestions"
   - Save to `/tasks/code-review-[pr]-feedback.json`

2. **Analyze Code Gaps**
   - Use @skills/analyze-code-gaps/SKILL.md to compare current code against review feedback
   - Generate gap analysis with:
     * Unaddressed blocking issues
     * Partially addressed items
     * Resolved items (with evidence)
     * Merge readiness score (0-100)
   - Save to `/tasks/code-review-[pr]-gaps.md`
   - Show summary and ask: "Would you like to see the full gap analysis?"

3. **Review Gap Analysis** (User Checkpoint)
   - Present full gap analysis if requested
   - Show top 3-5 priority items
   - Ask: "Ready to start fixing issues? I'll work through them one at a time."
   - Wait for user approval before proceeding

4. **Iterate on Fixes**
   - Use @skills/iterate-on-feedback/SKILL.md with reflection loop pattern
   - For each iteration (max 5):
     a. Select highest priority unresolved gap
     b. Show what will be fixed, ask for approval
     c. Implement the fix
     d. Run validation (tests, linters, security scans)
     e. If successful: commit with conventional commit message
     f. If failed: rollback and try alternative approach or escalate
     g. Update gap analysis and merge readiness score
     h. Show progress and ask to continue
   - Stop when:
     * All blocking issues resolved AND tests passing
     * Max iterations reached
     * User requests stop
     * No progress in 2 iterations (escalate to human)

5. **Final Report**
   - Show final merge readiness score
   - List resolved items with evidence (commits)
   - List remaining items (if any)
   - Provide merge recommendation
   - Save iteration log to `/tasks/code-review-[pr]-iterations.md`

## Orchestration
- Delegate to @agents/code-review-orchestrator.md for workflow coordination
- Maintain state in `/tasks/code-review-[pr]-state.json`
- Always pause for user approval before:
  * Starting iteration loop
  * Each individual fix
  * Committing changes

## Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Tests configured and runnable (`npm test` or equivalent)
- Current branch has associated PR

## User Interaction Pattern
```
AI: Found 12 comments: 3 blocking, 7 suggestions, 2 questions
    Merge Readiness: 45/100
    
    Top Priority:
    1. Missing null validation (Priority: 10)
    2. SQL injection risk (Priority: 10)
    
    Ready to start fixing? (yes/no)

User: yes

AI: **Iteration 1** - Fixing: Missing null validation
    Will add null check to src/auth.js:42
    Proceed? (yes/no)

User: yes

AI: ✓ Fixed, tests passing, committed abc123
    Merge Readiness: 45 → 60
    Continue? (yes/no)
```

## Output Files
- `/tasks/code-review-[pr]-feedback.json` - Raw PR review data
- `/tasks/code-review-[pr]-gaps.md` - Gap analysis report
- `/tasks/code-review-[pr]-state.json` - Workflow state
- `/tasks/code-review-[pr]-iterations.md` - Iteration log

## Notes
- Skills referenced: `skills/fetch-pr-review/SKILL.md`, `skills/analyze-code-gaps/SKILL.md`, `skills/iterate-on-feedback/SKILL.md`
- Agent: `agents/code-review-orchestrator.md`
- Guide: `ai-dev-tasks/code-review-guide.md`
- Always validate changes with tests before committing
- Use conventional commit format with multi `-m` for detailed messages
- Escalate to human for architectural decisions or when stuck
