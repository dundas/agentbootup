# Analyze Code Gaps - Reference

## Gap Analysis Methodology

### 1. Comment Mapping Strategy
For each review comment:
1. Parse file path and line number
2. Read current file content
3. Check if line number is still valid (code may have shifted)
4. Extract context (5 lines before/after)
5. Determine if issue persists

### 2. Evidence Collection
Look for resolution evidence:
- Commit messages mentioning the issue
- Code changes in the affected area
- Test additions covering the scenario
- Documentation updates
- Follow-up comments from reviewer

### 3. Priority Scoring Formula
```
Priority Score = Base Severity + Complexity Modifier + Dependency Modifier

Base Severity:
- Blocking/Security: 10
- Bug: 8
- Performance: 6
- Code Quality: 4
- Style/Nit: 2

Complexity Modifier:
- Simple fix (< 10 lines): +0
- Moderate (10-50 lines): +2
- Complex (> 50 lines or architectural): +5

Dependency Modifier:
- Blocks other work: +2
- Has dependencies: +1
- Independent: +0
```

### 4. Merge Readiness Calculation
```javascript
function calculateMergeReadiness(gaps, tests, ci) {
  let score = 100;
  
  // Deduct for unresolved issues
  score -= gaps.blocking.length * 20;
  score -= gaps.suggestions.length * 5;
  score -= gaps.unclear.length * 10;
  
  // Deduct for test failures
  score -= tests.failures * 15;
  
  // Deduct for CI failures
  if (ci.status === 'failing') score -= 25;
  
  // Cap at 0-100
  return Math.max(0, Math.min(100, score));
}
```

## Example Gap Analysis Scenarios

### Scenario 1: Comment on Deleted Code
```
Comment: "Add error handling here" on line 42
Current State: Line 42 no longer exists (file refactored)

Action: Mark as "Needs Clarification"
Reason: Code structure changed, unclear if issue still applies
Next Step: Ask reviewer if concern is still relevant
```

### Scenario 2: Comment Already Addressed
```
Comment: "Missing null check" on line 78
Current State: Line 78 now has `if (!data) return;`
Evidence: Commit abc123 added null check

Action: Mark as "Resolved"
Reason: Code now includes the requested check
Next Step: Add to resolved items list
```

### Scenario 3: Partially Addressed
```
Comment: "Add comprehensive error handling"
Current State: Basic try-catch added, but no specific error types
Evidence: Commit def456 added try-catch

Action: Mark as "Partially Addressed"
Reason: Basic handling added, but not comprehensive
Next Step: Add to action plan with remaining work
```

## Code Analysis Tools

### Static Analysis
```bash
# ESLint for JavaScript
npx eslint src/

# TypeScript type checking
npx tsc --noEmit

# Python linting
pylint src/

# Security scanning
npm audit
snyk test
```

### Test Execution
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

### Git Analysis
```bash
# Check commits since review
git log --since="2025-10-20" --oneline

# Show changes to specific file
git log -p src/auth.js

# Find commits mentioning keyword
git log --grep="null check"

# Show diff for specific lines
git diff HEAD~1 src/auth.js
```

## Gap Analysis Template

```markdown
### 🔴 [Gap-ID] Brief Description
**Reviewer**: @username  
**Category**: Blocking/Suggestion - Type  
**Priority Score**: 0-10  
**Status**: Unaddressed/Partial/Resolved

**Original Comment**:
> Exact quote from reviewer

**Current Code** (file:line):
```language
code snippet
```

**Issue**: Clear explanation of the problem

**Recommended Fix**:
```language
proposed solution
```

**Estimated Effort**: X minutes  
**Dependencies**: List or None  
**Tests Needed**: Description
```

## Merge Criteria Checklist

### Standard Criteria
- [ ] All blocking review comments resolved
- [ ] All tests passing
- [ ] No new test failures introduced
- [ ] Code coverage maintained or improved
- [ ] No security vulnerabilities
- [ ] Code style compliant (linter passing)
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] CI/CD pipeline passing
- [ ] Required approvals obtained

### Custom Criteria (Project-Specific)
- [ ] Performance benchmarks met
- [ ] Accessibility standards met (WCAG)
- [ ] Mobile responsiveness verified
- [ ] Database migrations tested
- [ ] API documentation updated
- [ ] Changelog updated

## Status Indicators

| Symbol | Meaning | Action Required |
|--------|---------|-----------------|
| ❌ | Unaddressed | Must fix |
| 🔄 | Partially Addressed | Complete the work |
| ❓ | Unclear Status | Investigate/Clarify |
| ✅ | Resolved | Verify and document |
| 💡 | Suggestion | Optional improvement |
| 🔴 | Blocking | High priority |
| 🟡 | Warning | Medium priority |
| 🟢 | Good | Low priority |

## Integration with Other Skills

### From fetch-pr-review
Input: `tasks/code-review-[pr-number]-feedback.json`
- Use comment categorization
- Use severity levels
- Use reviewer information

### To iterate-on-feedback
Output: `tasks/code-review-[pr-number]-gaps.md`
- Provides prioritized action items
- Includes recommended fixes
- Estimates effort

### To code-review-orchestrator
- Reports merge readiness score
- Identifies blocking issues
- Suggests iteration plan
