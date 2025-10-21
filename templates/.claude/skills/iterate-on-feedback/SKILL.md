---
name: iterate-on-feedback
description: Implement fixes for code review gaps using reflection pattern with validation loops until merge-ready or max iterations reached.
---

# Iterate on Feedback

## Goal
Execute a reflection loop that implements fixes, validates changes, and iterates until code is merge-ready or stopping criteria are met.

## Inputs
- Gap analysis report (from `analyze-code-gaps` skill)
- Maximum iterations (default: 5)
- Stopping criteria (default: all blockers resolved + tests passing)

## Process

### Iteration Loop
```
For iteration 1 to MAX_ITERATIONS:
  1. SELECT: Choose highest priority unresolved gap
  2. IMPLEMENT: Apply the fix
  3. VALIDATE: Run tests and checks
  4. REFLECT: Analyze results and update gap analysis
  5. CHECK: Evaluate stopping criteria
  6. REPORT: Update progress
  
  If stopping criteria met: EXIT SUCCESS
  If no progress in 2 iterations: ESCALATE
  If max iterations reached: EXIT WITH STATUS
```

### 1. Selection Phase
- Load current gap analysis
- Filter for unresolved items
- Sort by priority score (descending)
- Select top item or batch of independent items
- Show user what will be fixed: "Fixing Gap-1: Missing null validation"

### 2. Implementation Phase
- Read affected file(s)
- Apply recommended fix or generate solution
- Follow existing code style and patterns
- Add necessary imports/dependencies
- Update related documentation
- Log changes made

### 3. Validation Phase
Run comprehensive checks:
```bash
# Syntax check
npm run lint

# Type checking (if applicable)
npm run type-check

# Unit tests
npm test

# Integration tests (if quick)
npm run test:integration

# Security scan (if available)
npm audit
```

Capture results:
- Tests passing/failing
- New errors introduced
- Performance impact
- Coverage changes

### 4. Reflection Phase
Analyze validation results:
- **Success**: Mark gap as resolved, update score
- **Partial Success**: Mark as partially addressed, note remaining work
- **Failure**: Rollback changes, mark as needs different approach
- **New Issues**: Add to gap list, adjust priorities

Update state file: `tasks/code-review-[pr-number]-state.json`
```json
{
  "iteration": 2,
  "gaps_resolved": ["Gap-1", "Gap-3"],
  "gaps_remaining": ["Gap-2"],
  "test_status": "passing",
  "merge_readiness": 75,
  "changes_made": [
    {
      "gap_id": "Gap-1",
      "file": "src/auth.js",
      "lines_changed": 3,
      "commit": "abc123"
    }
  ]
}
```

### 5. Stopping Criteria Check
**Success Criteria** (exit with success):
- All blocking gaps resolved
- All tests passing
- Merge readiness score >= 80
- No new issues introduced

**Escalation Criteria** (pause for human):
- No progress in last 2 iterations
- Same test keeps failing
- Architectural change needed
- Unclear how to proceed

**Max Iterations** (exit with report):
- Reached iteration limit
- Show final status and remaining work

### 6. Progress Reporting
After each iteration, report:
```markdown
## Iteration 2 Complete ✓

**Changes Made**:
- ✅ Fixed Gap-1: Added null validation to auth.js
- ✅ Fixed Gap-4: Updated error messages

**Validation Results**:
- Tests: 127/127 passing ✓
- Linter: No errors ✓
- Type Check: Passed ✓

**Progress**:
- Gaps Resolved: 2 → 4 (+2)
- Merge Readiness: 45 → 75 (+30)
- Remaining Blockers: 3 → 1 (-2)

**Next Iteration**:
Will address Gap-2 (SQL injection fix)

Continue? (yes/no)
```

## Commit Strategy

### Per-Iteration Commits
After successful validation:
```bash
git add [affected-files]
git commit -m "fix(review): address Gap-1 - add null validation" \
           -m "- Added null check in validateUser function" \
           -m "- Added unit test for null input case" \
           -m "- Resolves review comment from @senior-dev" \
           -m "PR #123 iteration 2"
```

### Commit Message Format
```
<type>(review): <brief description>

- Detailed change 1
- Detailed change 2
- Test additions/modifications

Resolves review comment from @reviewer
PR #[number] iteration [n]
```

## Rollback Strategy
If validation fails:
1. Identify what broke
2. Revert changes: `git checkout -- [files]`
3. Analyze why it failed
4. Try alternative approach or escalate
5. Log failed attempt for learning

## Interaction Protocol
- **Before each iteration**: Show what will be fixed, ask for approval
- **After each iteration**: Show results, ask to continue
- **On failure**: Explain what went wrong, propose next steps
- **On success**: Celebrate progress, show remaining work
- **On escalation**: Clearly state why human input needed

## Safety Guardrails
- Never skip test validation
- Always commit working state before next iteration
- Preserve original code in comments if major refactor
- Don't modify files outside scope of review comments
- Don't introduce new dependencies without approval
- Maximum 5 iterations to prevent infinite loops

## Output Artifacts

### Iteration Log
Save to `tasks/code-review-[pr-number]-iterations.md`:
```markdown
# Iteration Log - PR #123

## Iteration 1
**Started**: 2025-10-21 11:30:00  
**Duration**: 8 minutes

**Target**: Gap-1 (Missing null validation)
**Changes**: Added null check in auth.js:42
**Tests**: 127/127 passing
**Result**: ✅ Success

## Iteration 2
**Started**: 2025-10-21 11:38:00  
**Duration**: 15 minutes

**Target**: Gap-2 (SQL injection)
**Changes**: Converted to parameterized query in query.js:78
**Tests**: 127/127 passing
**Result**: ✅ Success

## Summary
- Total Iterations: 2
- Gaps Resolved: 2
- Final Merge Readiness: 85/100
- Status: Ready for re-review
```

## References
- See `reference.md` for iteration examples
- See `code-review-orchestrator` agent for workflow context
- See `analyze-code-gaps` skill for gap prioritization
