---
name: code-review-workflow
description: Run complete code review gap analysis and iteration workflow to achieve merge-ready state.
---

# Code Review Workflow

Orchestrate the complete code review process: fetch PR feedback, analyze gaps, and iterate on fixes until merge-ready.

## Usage

```
/code-review-workflow [PR_NUMBER]
```

Or simply:
```
/code-review-workflow
```
(Will prompt for PR number)

## What This Does

1. **Fetches PR Review Comments**
   - Retrieves all review feedback from GitHub
   - Categorizes by severity (blocking, suggestions, questions)
   - Identifies resolved vs. unresolved items

2. **Analyzes Code Gaps**
   - Compares current code against review feedback
   - Generates prioritized action items
   - Calculates merge readiness score
   - Creates detailed gap analysis report

3. **Iterates on Fixes** (with your approval)
   - Implements highest priority fixes
   - Validates with tests and linters
   - Commits working changes
   - Repeats until merge-ready or max iterations

4. **Reports Final Status**
   - Shows what was fixed
   - Highlights remaining work
   - Provides merge recommendation

## Example Session

```
You: /code-review-workflow 123

AI: Fetching PR #123 review comments...
    Found 12 comments: 3 blocking, 7 suggestions, 2 questions
    
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

AI: [Shows detailed gap analysis with code snippets and recommendations]
    
    Ready to start fixing issues? I'll work through them one at a time.
    Start with Gap-1 (Missing null validation)? (yes/no)

You: yes

AI: **Iteration 1 - Fixing Gap-1**
    
    Adding null validation to src/auth.js:42...
    Running tests...
    ✓ Tests: 127/127 passing
    ✓ Linter: No errors
    
    Committing changes...
    ✓ Committed: abc123
    
    Progress:
    - Merge Readiness: 45 → 60 (+15)
    - Blocking Issues: 3 → 2 (-1)
    
    Continue with Gap-2 (SQL injection)? (yes/no)

You: yes

AI: **Iteration 2 - Fixing Gap-2**
    
    Converting to parameterized queries in src/query.js:78...
    Running tests...
    ✓ Tests: 127/127 passing
    ✓ Security scan: No vulnerabilities
    
    Committing changes...
    ✓ Committed: def456
    
    Progress:
    - Merge Readiness: 60 → 85 (+25)
    - Blocking Issues: 2 → 0 (-2)
    
    🎉 All blocking issues resolved!
    
    Continue with suggestions? (yes/no/skip)

You: skip

AI: **Final Status**
    
    ✅ Code Review Complete
    
    **Resolved**:
    - Gap-1: Added null validation ✓
    - Gap-2: Fixed SQL injection ✓
    - Gap-7: Updated error messages ✓
    
    **Remaining** (non-blocking):
    - 5 suggestions (optional improvements)
    
    **Merge Readiness**: 85/100 ✅
    
    **Recommendation**: Ready for re-review
    - All blocking issues addressed
    - Tests passing
    - No new issues introduced
    
    Files saved:
    - tasks/code-review-123-feedback.json
    - tasks/code-review-123-gaps.md
    - tasks/code-review-123-iterations.md
    - tasks/code-review-123-state.json
```

## Workflow Steps

### Step 1: Fetch PR Review
Uses `fetch-pr-review` skill to:
- Connect to GitHub via `gh` CLI
- Retrieve all review comments
- Categorize by severity
- Save to `tasks/code-review-[pr]-feedback.json`

### Step 2: Analyze Gaps
Uses `analyze-code-gaps` skill to:
- Map comments to current code
- Identify unresolved issues
- Calculate merge readiness score
- Generate prioritized action plan
- Save to `tasks/code-review-[pr]-gaps.md`

### Step 3: Iterate on Fixes
Uses `iterate-on-feedback` skill to:
- Implement fixes one at a time
- Validate with tests/linters
- Commit successful changes
- Update progress tracking
- Repeat until done or max iterations (5)

### Step 4: Report Results
- Show final merge readiness score
- List resolved vs. remaining issues
- Provide merge recommendation
- Save iteration log

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Tests configured and runnable
- Linter/formatter configured (optional but recommended)

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
  }
}
```

## Output Files

All files saved to `tasks/` directory:

- `code-review-[pr]-feedback.json` - Raw PR review data
- `code-review-[pr]-gaps.md` - Gap analysis report
- `code-review-[pr]-state.json` - Workflow state tracking
- `code-review-[pr]-iterations.md` - Iteration log

## Tips

**For Quick Reviews**:
```
/code-review-workflow 123 --quick
```
Skips detailed analysis, focuses on blockers only

**For Dry Run**:
```
/code-review-workflow 123 --dry-run
```
Shows what would be fixed without making changes

**For Specific Gaps**:
```
/code-review-workflow 123 --gaps Gap-1,Gap-3
```
Only addresses specified gaps

## Troubleshooting

**"GitHub CLI not found"**
```bash
# Install gh CLI
brew install gh  # macOS
# or visit: https://cli.github.com/

# Authenticate
gh auth login
```

**"PR not found"**
- Verify PR number is correct
- Check you're in the right repository
- Ensure PR exists and is accessible

**"Tests failing"**
- Review test output in iteration log
- May need to fix tests separately
- Use `--skip-tests` flag if needed (not recommended)

**"Max iterations reached"**
- Some issues may require human intervention
- Review iteration log to see what was attempted
- May need architectural changes

## Related Commands

- `/fetch-pr-review` - Just fetch and categorize comments
- `/analyze-gaps` - Just run gap analysis on existing feedback
- `/iterate-fixes` - Just run iteration loop on existing gaps

## See Also

- `agents/code-review-orchestrator.md`
- `skills/fetch-pr-review/`
- `skills/analyze-code-gaps/`
- `skills/iterate-on-feedback/`
- `ai-dev-tasks/code-review-guide.md`
