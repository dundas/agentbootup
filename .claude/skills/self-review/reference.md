# Self-Review Skill - Reference

## Quick Start

```bash
# Self-review a PR
/self-review --pr=16

# Self-review local changes
/self-review --files="lib/**/*.js"

# With custom requirements
/self-review --pr=16 --requirements=custom-criteria.md
```

## Skill Flow

```
┌─────────────────────────────────────────┐
│  Create Review Requirements             │
│  (or use provided document)             │
│                                         │
│  - Acceptance criteria by category     │
│  - Evidence requirements                │
│  - Verdict criteria                     │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Launch Coach Agent                     │
│  (via dialectical-autocoder)            │
│                                         │
│  - Read requirements document           │
│  - Review all changed files             │
│  - Check every acceptance criterion     │
│  - Identify issues by severity          │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Coach Produces Structured Review       │
│                                         │
│  CRITICAL Issues (must fix)             │
│  HIGH Issues (should fix)               │
│  MEDIUM Issues (consider fixing)        │
│  LOW Issues (nice to have)              │
│                                         │
│  Verdict: APPROVED|REVISE|REJECTED      │
└───────────────┬─────────────────────────┘
                │
                ▼
        ┌───────┴───────┐
        │               │
        ▼               ▼
   APPROVED        REVISE/REJECTED
        │               │
        │               ▼
        │       ┌───────────────────┐
        │       │  Create Tasks      │
        │       │  for Blocking      │
        │       │  Issues            │
        │       └─────┬─────────────┘
        │             │
        │             ▼
        │       ┌───────────────────┐
        │       │  Fix Issues        │
        │       │  (reliability-eng  │
        │       │   or tdd-dev)      │
        │       └─────┬─────────────┘
        │             │
        │             ▼
        │       ┌───────────────────┐
        │       │  Re-run Tests      │
        │       └─────┬─────────────┘
        │             │
        │             ▼
        │       ┌───────────────────┐
        │       │  Re-run            │
        │       │  Self-Review       │
        │       └─────┬─────────────┘
        │             │
        └─────────────┘
                │
                ▼
        ┌───────────────────┐
        │  Save Results      │
        │  - Review doc      │
        │  - Issues list     │
        │  - Fixes applied   │
        └───────────────────┘
```

## Review Categories

### 1. Stability
- Error handling completeness
- Resource cleanup
- Recovery from failures
- Long-running stability

### 2. Security
- Authentication/authorization
- Input validation
- Credential handling
- File permissions
- Information disclosure

### 3. Edge Cases
- Boundary conditions
- Null/undefined handling
- Empty collections
- Maximum/minimum values
- Concurrent access

### 4. Resource Management
- Memory leaks
- File descriptor leaks
- Event listener leaks
- Timer cleanup
- Connection pooling

### 5. Testing
- Critical path coverage
- Error condition testing
- Edge case testing
- Test determinism
- Cleanup in tests

### 6. Code Quality
- Logic errors
- Race conditions
- Unclear code
- Missing comments
- Magic numbers

### 7. Documentation
- API documentation
- Error scenarios
- Configuration options
- Troubleshooting
- Examples

### 8. Production Readiness
- Long-running stability
- Performance characteristics
- Logging appropriateness
- Monitoring hooks
- Deployment considerations

## Severity Definitions

### CRITICAL
**Criteria:**
- Security vulnerabilities (auth bypass, injection, credential exposure)
- Data loss or corruption
- Guaranteed crashes or hangs
- Resource leaks that prevent long-running operation

**Examples:**
- No authentication on admin API
- SQL injection vulnerability
- Memory leak in core loop
- Credentials logged to file
- File handles never closed

**Action:** MUST fix before merge

### HIGH
**Criteria:**
- Major error handling gaps
- Stability issues under load
- Significant resource waste
- Important functionality missing

**Examples:**
- Malformed input crashes server
- No retry logic for transient failures
- Inefficient algorithm (O(n²) vs O(n))
- Missing validation on critical path

**Action:** SHOULD fix before merge

### MEDIUM
**Criteria:**
- Edge cases not handled
- Testing gaps
- Minor resource waste
- Code quality issues

**Examples:**
- Empty array not handled
- No tests for error conditions
- Duplicate code
- Complex function needs refactoring

**Action:** Consider fixing, or create follow-up issue

### LOW
**Criteria:**
- Style inconsistencies
- Documentation improvements
- Minor optimizations
- Nice-to-have features

**Examples:**
- Inconsistent naming
- Missing JSDoc comments
- Could use const instead of let
- Helpful error message missing

**Action:** Optional, address if trivial

## Evidence Requirements

For each acceptance criterion, coach should verify:

1. **File Reference** - Exact location in code
   ```
   ✅ Error handling: lib/daemon/memory-sync-daemon.js:144-149
   ❌ Rate limiting: NOT FOUND
   ```

2. **Test Coverage** - What tests verify this?
   ```
   ✅ Tested: test-daemon.mjs lines 85-95
   ❌ Not tested: No error injection tests
   ```

3. **Edge Case Handling** - What happens in failure scenarios?
   ```
   ✅ Handles: File deleted during watch (returns null)
   ❌ Doesn't handle: Directory deleted during watch (crash)
   ```

## Verdict Criteria

### APPROVED
**All of the following:**
- Zero CRITICAL issues
- Zero HIGH issues (or all accepted with justification)
- MEDIUM/LOW issues documented for follow-up
- All acceptance criteria met or waived
- Evidence provided for all claims

### REVISE
**One or more of:**
- Some CRITICAL issues (fixable)
- Multiple HIGH issues (fixable)
- Missing evidence for claims
- Tests don't pass
- Fixable within reasonable effort

### REJECTED
**One or more of:**
- Fundamental design flaws
- Critical issues that require major rework
- Requirement misunderstood
- Approach infeasible
- Too many issues to fix incrementally

## Integration Patterns

### With PR Review Loop

```javascript
// pr-review-loop invokes self-review first
async function prReviewLoop(prNumber) {
  // Phase 1: Self-review
  const selfReview = await skillInvoke('self-review', { pr: prNumber });

  if (selfReview.verdict === 'REJECTED') {
    // Fix critical issues before waiting for human review
    await fixCriticalIssues(selfReview.criticalIssues);
    await runTests();
    await skillInvoke('self-review', { pr: prNumber }); // Re-check
  }

  // Phase 2: Wait for human review
  await waitForReview(prNumber);

  // Phase 3: Address human feedback
  await addressFeedback();
}
```

### With Task Processor

```javascript
// task-processor runs self-review after implementation
async function processTask(task) {
  // Implement task
  await implement(task);

  // Self-review implementation
  const review = await skillInvoke('self-review', {
    files: task.filesChanged
  });

  if (review.verdict !== 'APPROVED') {
    // Fix issues before marking complete
    await fixIssues(review.criticalIssues);
    await fixIssues(review.highIssues);
  }

  // Mark complete
  await markTaskComplete(task);
}
```

### Standalone

```javascript
// Manual self-review before PR
await skillInvoke('self-review', {
  pr: 16,
  focus: ['security', 'stability']
});
```

## Custom Requirements Template

Create a custom requirements document:

```markdown
# [Feature Name] Review Requirements

## Context
Brief description of what's being reviewed.

## Acceptance Criteria

### Category 1
- [ ] Criterion 1
- [ ] Criterion 2

### Category 2
- [ ] Criterion 3
- [ ] Criterion 4

## Evidence Required
For each criterion:
- File and line reference
- Test coverage
- Edge case handling

## Verdict Criteria
**APPROVED:** All criteria met
**REVISE:** Some issues found
**REJECTED:** Major flaws
```

Then invoke:
```bash
/self-review --requirements=path/to/custom.md
```

## Output Format

### Review Results Document

```markdown
# Self-Review Results: [Feature Name]

**Date:** YYYY-MM-DD
**Reviewer:** Coach Agent
**Verdict:** APPROVED | REVISE | REJECTED

## Summary
- Files reviewed: N
- Lines reviewed: N
- Critical issues: N
- High issues: N
- Medium issues: N
- Low issues: N

## Critical Issues (Must Fix)

### Issue 1: [Title]
- **File:** path/to/file.js:123
- **Severity:** CRITICAL
- **Category:** Security
- **Issue:** [Description]
- **Risk:** [What could happen]
- **Fix:** [How to fix]
- **Evidence:** [Why this is an issue]

## High Priority Issues (Should Fix)
[Same format...]

## Medium/Low Issues (Consider Fixing)
[Same format...]

## Acceptance Criteria Status

### Category 1
- [x] Criterion 1 - Evidence: file.js:45
- [~] Criterion 2 - Partial, issue #3
- [ ] Criterion 3 - Not addressed

## Recommendations

### Immediate Actions
1. Fix issue #1 (critical security)
2. Fix issue #2 (resource leak)

### Follow-Up
1. Add tests for edge cases
2. Improve error messages

## Next Steps
[What to do next based on verdict]
```

## Common Review Scenarios

### New Feature
**Focus on:**
- Functionality completeness
- Error handling
- Testing coverage
- Documentation

### Bug Fix
**Focus on:**
- Root cause addressed
- Regression tests added
- Edge cases considered
- Related bugs checked

### Refactor
**Focus on:**
- Behavior unchanged
- Tests still pass
- Performance not degraded
- No new bugs introduced

### Security Fix
**Focus on:**
- Vulnerability fully closed
- Similar issues checked
- Tests verify fix
- No information disclosure

### Performance Optimization
**Focus on:**
- Benchmarks show improvement
- No correctness regressions
- Resource usage acceptable
- Edge cases still work

## Tips for Effective Self-Review

1. **Run early** - Don't wait until PR is complete
2. **Fix blocking issues immediately** - Don't accumulate debt
3. **Re-run after fixes** - Verify fixes work and didn't break anything
4. **Document rationale** - Explain why issues are or aren't fixed
5. **Update requirements** - Add new criteria as you learn

## Limitations and Considerations

**Coach agent limitations:**
- May miss subtle logic bugs
- Doesn't run code (catches structure, not runtime behavior)
- Pattern recognition, not exhaustive analysis
- No domain-specific knowledge

**Review depth:**
- Comprehensive but not exhaustive
- Focuses on common issues
- May miss project-specific concerns
- Not a replacement for human expertise

**Time investment:**
- 5-15 minutes for typical review
- More for large changes
- Worth it to catch issues early

## Troubleshooting

### Coach finds no issues but code has bugs
- Requirements may be too vague
- Add more specific acceptance criteria
- Add examples of what should be checked

### Coach finds too many trivial issues
- Adjust severity thresholds
- Focus on critical/high only
- Update verdict criteria

### Review takes too long
- Limit files reviewed
- Split into multiple reviews
- Focus on changed code only

### Disagreement with coach findings
- Review coach's evidence
- Check if requirement is clear
- Document disagreement and rationale
- Human review resolves disputes
