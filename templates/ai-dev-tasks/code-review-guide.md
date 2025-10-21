# Code Review Gap Analysis Guide

This guide helps you use AI to analyze PR review feedback and iterate toward merge-ready state.

## Overview

The code review workflow automates the process of:
1. Fetching PR review comments from GitHub
2. Analyzing gaps between current code and merge requirements
3. Iteratively fixing issues with validation loops
4. Achieving merge-ready state

## When to Use This Workflow

- **After receiving PR review feedback** and you want to systematically address all comments
- **Before requesting re-review** to ensure all blocking issues are resolved
- **When stuck on review comments** and need help prioritizing and implementing fixes
- **To validate merge readiness** with an objective scoring system

## Quick Start

### Option 1: Use the Command (Claude Code)
```
/code-review-workflow [PR_NUMBER]
```

### Option 2: Use the Workflow (Windsurf)
```
/code-review-workflow
```
Then follow the prompts.

### Option 3: Manual Prompt
```
Let's check the code review on PR #123 and create a gap analysis 
of our current code and the final state of "ready to merge"
```

## Workflow Phases

### Phase 1: Fetch Review Comments

**What happens:**
- Connects to GitHub via `gh` CLI
- Retrieves all review comments, decisions, and CI status
- Categorizes comments by severity:
  - **Blocking**: Must fix before merge
  - **Suggestions**: Nice-to-have improvements
  - **Questions**: Need clarification
  - **Resolved**: Already addressed

**Output:** `tasks/code-review-[pr]-feedback.json`

**Example:**
```json
{
  "pr_number": "123",
  "review_state": "changes_requested",
  "summary": {
    "total": 12,
    "blocking": 3,
    "suggestions": 7,
    "questions": 2
  }
}
```

### Phase 2: Analyze Code Gaps

**What happens:**
- Maps each comment to current code
- Checks if issues are still present
- Identifies what's been resolved
- Calculates merge readiness score (0-100)
- Prioritizes action items

**Output:** `tasks/code-review-[pr]-gaps.md`

**Merge Readiness Score:**
```
Score = 100 - (blocking × 20) - (suggestions × 5) - (test_failures × 15)
```

**Example Gap:**
```markdown
### 🔴 [Gap-1] Missing null validation
**Priority Score**: 10
**Status**: Unaddressed

**Original Comment:**
> This validation is missing edge case handling for null values

**Current Code** (auth.js:42):
```javascript
function validateUser(user) {
  return user.email.includes('@');
}
```

**Recommended Fix:**
```javascript
function validateUser(user) {
  if (!user || !user.email) return false;
  return user.email.includes('@');
}
```

**Estimated Effort**: 5 minutes
```

### Phase 3: Iterate on Fixes

**What happens:**
- Implements fixes one at a time
- Runs validation after each fix:
  - Tests
  - Linters
  - Type checkers
  - Security scans
- Commits successful changes
- Updates gap analysis
- Repeats until done (max 5 iterations)

**Output:** `tasks/code-review-[pr]-iterations.md`

**Stopping Criteria:**
- ✅ All blocking issues resolved
- ✅ All tests passing
- ✅ Merge readiness ≥ 80
- ⚠️ Max iterations reached (5)
- ⚠️ No progress in 2 iterations

### Phase 4: Final Report

**What you get:**
- Final merge readiness score
- List of resolved issues with commit references
- Remaining work (if any)
- Merge recommendation

## Example Session

```
You: /code-review-workflow 123

AI: Fetching PR #123 review comments...
    ✓ Found 12 comments: 3 blocking, 7 suggestions, 2 questions
    
    Running gap analysis...
    
    📊 Gap Analysis Summary:
    - Merge Readiness: 45/100 ⚠️
    - Blocking Issues: 3
    - Resolved: 7
    - Suggestions: 5
    
    Top Priority Issues:
    1. [Gap-1] Missing null validation (Priority: 10)
    2. [Gap-2] SQL injection vulnerability (Priority: 10)
    3. [Gap-4] Error handling incomplete (Priority: 8)
    
    Would you like to see the full gap analysis? (yes/no)

You: yes

AI: [Shows detailed gap analysis with code snippets]
    
    Ready to start fixing issues? (yes/no)

You: yes

AI: **Iteration 1** - Fixing Gap-1: Missing null validation
    
    Will add null check to src/auth.js:42
    Proceed? (yes/no)

You: yes

AI: Implementing fix...
    ✓ Added null validation
    ✓ Running tests... 127/127 passing
    ✓ Linter: No errors
    ✓ Committed: abc123
    
    Progress:
    - Merge Readiness: 45 → 60 (+15)
    - Blocking Issues: 3 → 2 (-1)
    
    Continue with Gap-2 (SQL injection)? (yes/no)

You: yes

AI: **Iteration 2** - Fixing Gap-2: SQL injection vulnerability
    
    Converting to parameterized queries in src/query.js:78
    Proceed? (yes/no)

You: yes

AI: Implementing fix...
    ✓ Converted to parameterized query
    ✓ Running tests... 127/127 passing
    ✓ Security scan: No vulnerabilities
    ✓ Committed: def456
    
    Progress:
    - Merge Readiness: 60 → 85 (+25)
    - Blocking Issues: 2 → 0 (-2)
    
    🎉 All blocking issues resolved!
    
    Continue with suggestions? (yes/no/skip)

You: skip

AI: **Final Status**
    
    ✅ Code Review Complete
    
    **Resolved** (3 items):
    - Gap-1: Added null validation ✓ (commit abc123)
    - Gap-2: Fixed SQL injection ✓ (commit def456)
    - Gap-7: Updated error messages ✓ (commit ghi789)
    
    **Remaining** (5 suggestions):
    - Gap-3: Extract helper function
    - Gap-5: Add JSDoc comments
    - Gap-8: Use const instead of let
    - Gap-10: Simplify conditional
    - Gap-12: Add loading state
    
    **Merge Readiness**: 85/100 ✅
    
    **Recommendation**: Ready for re-review
    - All blocking issues addressed
    - Tests passing (127/127)
    - No new issues introduced
    
    Files saved:
    - tasks/code-review-123-feedback.json
    - tasks/code-review-123-gaps.md
    - tasks/code-review-123-iterations.md
    - tasks/code-review-123-state.json
```

## Best Practices

### Before Starting
1. **Ensure GitHub CLI is set up:**
   ```bash
   gh auth status
   # If not authenticated: gh auth login
   ```

2. **Verify tests are runnable:**
   ```bash
   npm test  # or your test command
   ```

3. **Commit or stash uncommitted changes:**
   ```bash
   git status
   git stash  # if needed
   ```

### During Iteration
- **Review each fix before approving** - Don't blindly say "yes"
- **Check the validation results** - Ensure tests actually pass
- **Read commit messages** - Make sure they're descriptive
- **Stop if something looks wrong** - You can always resume later

### After Completion
1. **Review the iteration log** to understand what changed
2. **Run tests locally** to verify everything works
3. **Push commits** to update the PR
4. **Request re-review** from the original reviewers
5. **Reference commits** in PR comments when addressing feedback

## Common Scenarios

### Scenario 1: All Blocking Issues Resolved
```
Merge Readiness: 85/100 ✅
Recommendation: Ready for re-review

Action: Push commits and request re-review
```

### Scenario 2: Max Iterations Reached
```
Merge Readiness: 65/100 ⚠️
Remaining: 2 blocking issues

Action: Review iteration log to see what was attempted
        May need manual intervention or architectural changes
```

### Scenario 3: Tests Keep Failing
```
Iteration 3 failed: Tests failing (5 failures)
Status: Escalated to human

Action: Review test failures
        May need to fix tests separately
        Or the approach needs rethinking
```

### Scenario 4: Comment on Deleted Code
```
Gap-5: Unclear Status
Reason: Code structure changed, line no longer exists

Action: Ask reviewer if concern still applies
        Or mark as resolved if refactor addressed it
```

## Troubleshooting

### "GitHub CLI not found"
```bash
# Install gh CLI
brew install gh  # macOS
# or visit: https://cli.github.com/

# Authenticate
gh auth login
```

### "PR not found"
- Verify PR number is correct
- Check you're in the right repository
- Ensure PR exists and is accessible

### "Tests failing"
- Review test output in iteration log
- May need to fix tests separately
- Check if tests were already failing before your changes

### "Max iterations reached with work remaining"
- Some issues may require human judgment
- Review what was attempted in iteration log
- May need architectural changes beyond automated fixes
- Consider addressing remaining items manually

### "Merge readiness score seems wrong"
- Score is calculated based on unresolved issues
- Blocking issues heavily penalize the score (-20 each)
- Review gap analysis to see what's counted
- Score is a guide, not absolute truth

## Configuration

Create `.code-review-config.json` in project root (optional):

```json
{
  "max_iterations": 5,
  "auto_commit": true,
  "run_tests": true,
  "run_linter": true,
  "merge_readiness_threshold": 80,
  "stopping_criteria": {
    "all_blockers_resolved": true,
    "tests_passing": true,
    "no_new_issues": true
  },
  "validation_commands": {
    "test": "npm test",
    "lint": "npm run lint",
    "type_check": "npm run type-check"
  }
}
```

## Output Files Reference

### `code-review-[pr]-feedback.json`
Raw PR review data with categorized comments

### `code-review-[pr]-gaps.md`
Detailed gap analysis with:
- Merge readiness score
- Prioritized action items
- Code snippets and recommended fixes
- Estimated effort per gap

### `code-review-[pr]-state.json`
Workflow state tracking:
- Current iteration
- Gaps resolved/remaining
- Test status
- Merge readiness history

### `code-review-[pr]-iterations.md`
Iteration log with:
- What was attempted
- Validation results
- Commits made
- Progress tracking

## Related Resources

- **Agent**: `.claude/agents/code-review-orchestrator.md`
- **Skills**:
  - `.claude/skills/fetch-pr-review/`
  - `.claude/skills/analyze-code-gaps/`
  - `.claude/skills/iterate-on-feedback/`
- **Command**: `.claude/commands/code-review-workflow.md`
- **Workflow**: `.windsurf/workflows/code-review-workflow.md`

## Tips for Success

1. **Start early** - Run gap analysis as soon as you receive review feedback
2. **Focus on blockers** - Address blocking issues first, suggestions later
3. **Validate thoroughly** - Always run full test suite after fixes
4. **Commit incrementally** - One fix per commit for easy rollback
5. **Document changes** - Use descriptive commit messages
6. **Communicate** - Update PR with progress comments
7. **Know when to escalate** - Some issues need human judgment
8. **Learn from iterations** - Review the log to improve your code

## Advanced Usage

### Run Only Gap Analysis
```
/analyze-gaps 123
```
Skips iteration, just shows what needs fixing.

### Dry Run Mode
```
/code-review-workflow 123 --dry-run
```
Shows what would be fixed without making changes.

### Address Specific Gaps
```
/code-review-workflow 123 --gaps Gap-1,Gap-3
```
Only fix specified gaps.

### Quick Mode (Blockers Only)
```
/code-review-workflow 123 --quick
```
Skips suggestions, focuses on blockers.

---

**Remember**: This workflow is a tool to help you, not replace your judgment. Always review changes before approving, and don't hesitate to stop if something doesn't look right.
