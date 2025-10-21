# Iterate on Feedback - Reference

## Reflection Loop Pattern

### Basic Structure
```
┌─────────────────────────────────────┐
│  Start Iteration                    │
└──────────────┬──────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  Select Highest Priority Gap         │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  Implement Fix                       │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│  Validate (Tests, Linters, etc.)     │
└──────────────┬───────────────────────┘
               ↓
         ┌─────┴─────┐
         │  Success? │
         └─────┬─────┘
         Yes ↓     ↓ No
    ┌────────┐   ┌────────┐
    │ Commit │   │Rollback│
    └────┬───┘   └───┬────┘
         ↓           ↓
    ┌────────────────────┐
    │  Update Gap List   │
    └────────┬───────────┘
             ↓
    ┌────────────────────┐
    │  Check Stopping    │
    │  Criteria          │
    └────────┬───────────┘
             ↓
       ┌─────┴─────┐
       │  Done?    │
       └─────┬─────┘
       Yes ↓     ↓ No
    ┌──────┐   ┌──────────┐
    │ Exit │   │ Continue │
    └──────┘   └─────┬────┘
                     ↓
               (Next Iteration)
```

## Example Iteration Scenarios

### Scenario 1: Simple Fix Success
```markdown
**Iteration 1**

Target: Gap-1 (Missing null check)
Priority: 10

Implementation:
- File: src/auth.js
- Change: Added `if (!user || !user.email) return false;`
- Lines: 42-43

Validation:
✓ Syntax check passed
✓ Tests: 127/127 passing
✓ Linter: No errors
✓ Coverage: 85% → 87%

Reflection:
- Gap-1 marked as resolved
- Merge readiness: 45 → 60
- No new issues introduced

Commit: abc123
Status: Success ✅
```

### Scenario 2: Fix Causes Test Failure
```markdown
**Iteration 2**

Target: Gap-2 (Refactor validation logic)
Priority: 8

Implementation:
- File: src/validators.js
- Change: Extracted validation to helper function
- Lines: 15-30

Validation:
✓ Syntax check passed
✗ Tests: 3 failures in auth.test.js
✓ Linter: No errors

Failures:
- auth.test.js:42: Expected true, got false
- auth.test.js:56: TypeError: Cannot read property
- auth.test.js:78: Validation failed unexpectedly

Reflection:
- Fix broke existing tests
- Issue: Function signature changed but tests not updated
- Action: Rollback and try different approach

Rollback: git checkout -- src/validators.js
Status: Failed, retrying with different approach ⚠️
```

### Scenario 3: Architectural Change Needed
```markdown
**Iteration 3**

Target: Gap-5 (Improve error handling architecture)
Priority: 7

Analysis:
- Requires changes across 8 files
- Needs new error handling middleware
- Impacts API contract
- Estimated effort: 2+ hours

Reflection:
- Change too large for automated iteration
- Requires architectural decision
- May affect other PRs

Action: Escalate to human
Status: Needs human review 🔄
```

## Validation Command Examples

### JavaScript/Node.js
```bash
# Linting
npx eslint src/ --fix

# Type checking
npx tsc --noEmit

# Unit tests
npm test

# With coverage
npm test -- --coverage

# Specific test file
npm test -- auth.test.js

# Watch mode (for iterative development)
npm test -- --watch
```

### Python
```bash
# Linting
pylint src/
black src/ --check

# Type checking
mypy src/

# Tests
pytest

# With coverage
pytest --cov=src

# Specific test
pytest tests/test_auth.py
```

### Go
```bash
# Format check
gofmt -l .

# Linting
golangci-lint run

# Tests
go test ./...

# With coverage
go test -cover ./...

# Specific package
go test ./pkg/auth
```

## Progress Tracking

### State File Structure
```json
{
  "pr_number": "123",
  "started_at": "2025-10-21T11:25:00Z",
  "current_iteration": 3,
  "max_iterations": 5,
  "merge_readiness": 75,
  "gaps": {
    "total": 10,
    "resolved": 6,
    "remaining": 4,
    "blocking": 1
  },
  "tests": {
    "total": 127,
    "passing": 127,
    "failing": 0
  },
  "iterations": [
    {
      "number": 1,
      "gap_id": "Gap-1",
      "started_at": "2025-10-21T11:30:00Z",
      "duration_seconds": 480,
      "status": "success",
      "changes": ["src/auth.js"],
      "commit": "abc123"
    },
    {
      "number": 2,
      "gap_id": "Gap-2",
      "started_at": "2025-10-21T11:38:00Z",
      "duration_seconds": 900,
      "status": "success",
      "changes": ["src/query.js", "tests/query.test.js"],
      "commit": "def456"
    },
    {
      "number": 3,
      "gap_id": "Gap-3",
      "started_at": "2025-10-21T11:53:00Z",
      "duration_seconds": 300,
      "status": "in_progress",
      "changes": [],
      "commit": null
    }
  ],
  "escalations": [],
  "final_status": null
}
```

## Stopping Criteria Decision Tree

```
Check Stopping Criteria
│
├─ All blocking gaps resolved?
│  ├─ Yes → Check tests
│  │         ├─ All passing? → Check merge score
│  │         │                 ├─ Score >= 80? → ✅ EXIT SUCCESS
│  │         │                 └─ Score < 80? → Continue
│  │         └─ Tests failing? → Continue
│  └─ No → Continue
│
├─ Max iterations reached?
│  └─ Yes → 📊 EXIT WITH REPORT
│
├─ No progress in 2 iterations?
│  └─ Yes → 🔄 ESCALATE TO HUMAN
│
└─ User requested stop?
   └─ Yes → ⏸️ PAUSE WITH STATUS
```

## Commit Message Templates

### Bug Fix from Review
```
fix(review): add null validation in user authentication

- Added null check before accessing user.email
- Prevents TypeError when user object is undefined
- Added unit test for null user input case

Resolves review comment from @senior-dev
PR #123 iteration 1
```

### Security Fix
```
security(review): use parameterized SQL queries

- Replaced string concatenation with parameterized queries
- Prevents SQL injection vulnerability
- Updated all database query functions
- Added security test for injection attempts

Resolves critical security issue from @security-team
PR #123 iteration 2
```

### Refactoring from Review
```
refactor(review): extract validation logic to helper

- Created utils/validators.js with shared functions
- Reduced code duplication across 3 files
- Maintained existing test coverage
- No breaking changes to API

Addresses suggestion from @code-reviewer
PR #123 iteration 3
```

## Error Recovery Strategies

### Strategy 1: Incremental Rollback
```bash
# Rollback specific file
git checkout -- src/auth.js

# Rollback all changes in iteration
git reset --hard HEAD

# Rollback to previous commit
git reset --hard abc123
```

### Strategy 2: Alternative Approach
```
If approach A fails:
1. Analyze why it failed
2. Identify alternative solution
3. Try approach B
4. If B fails, try C
5. If all fail, escalate
```

### Strategy 3: Simplify Scope
```
If complex fix fails:
1. Break into smaller sub-fixes
2. Implement simplest part first
3. Validate
4. Add complexity incrementally
5. Validate after each addition
```

## Performance Optimization

### Batch Independent Fixes
```
If gaps are independent:
- Gap-1: File A
- Gap-3: File B
- Gap-7: File C

Can fix all in one iteration:
1. Apply all three fixes
2. Run validation once
3. Commit together
4. Mark all as resolved

Saves time vs. 3 separate iterations
```

### Skip Redundant Validation
```
If only documentation changed:
- Skip full test suite
- Run only doc linter
- Quick validation

If only tests added:
- Run new tests
- Run affected unit tests
- Skip integration tests
```

## Integration Points

### With analyze-code-gaps
- Input: Gap analysis with priorities
- Output: Updated gap analysis with resolutions

### With code-review-orchestrator
- Reports: Iteration progress
- Escalates: When stuck or needs decision
- Completes: When stopping criteria met

### With version control
- Commits: After each successful iteration
- Tags: Optional milestone tags
- Branches: Works on current branch
