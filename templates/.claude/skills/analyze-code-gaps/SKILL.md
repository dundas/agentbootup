---
name: analyze-code-gaps
description: Compare current code state against PR review feedback to identify unaddressed issues and generate actionable gap analysis.
---

# Analyze Code Gaps

## Goal
Generate a comprehensive gap analysis showing what needs to be fixed to achieve merge-ready state.

## Inputs
- PR review feedback (from `fetch-pr-review` skill)
- Current code state (files, tests, CI status)
- Merge criteria checklist (defaults provided)

## Process
1. **Load Review Feedback**: Read `tasks/code-review-[pr-number]-feedback.json`

2. **Validate Current State**:
   - Check if files mentioned in comments still exist
   - Verify line numbers are still relevant (code may have changed)
   - Run static analysis (linters, type checkers)
   - Run test suite
   - Check security scan results (if available)

3. **Map Comments to Code**:
   - For each comment, locate the relevant code section
   - Determine if issue is still present
   - Check if subsequent commits addressed the concern
   - Look for related changes that may have resolved the issue

4. **Categorize Gaps**:
   - **Unaddressed Blocking**: High priority, must fix
   - **Partially Addressed**: Started but incomplete
   - **Unclear Status**: Needs investigation or clarification
   - **Resolved**: Already fixed, evidence found
   - **New Issues**: Discovered during analysis (tests failing, linter errors)

5. **Prioritize Action Items**:
   - Score each gap (0-10) based on:
     * Severity (blocking=10, suggestion=3)
     * Complexity (simple fix=+0, architectural change=+5)
     * Dependencies (blocks other work=+2)
   - Sort by priority score descending

6. **Generate Merge Readiness Score**:
   ```
   Score = 100 - (blocking_count * 20) - (suggestion_count * 5) - (test_failures * 15)
   Capped at 0-100
   ```

## Output Format
Save to `tasks/code-review-[pr-number]-gaps.md`:

```markdown
# Code Review Gap Analysis - PR #123

**Generated**: 2025-10-21 11:25:00  
**Merge Readiness**: 45/100 ⚠️

## Summary
- ❌ **3 Blocking Issues** (must fix)
- 🔄 **2 Partially Addressed** (needs completion)
- ✅ **7 Resolved** (verified)
- 💡 **5 Suggestions** (optional improvements)

## Merge Criteria Status
- [ ] All blocking review comments resolved
- [x] Tests passing (127/127)
- [ ] No security vulnerabilities
- [x] Code style compliant
- [ ] Documentation updated

---

## Priority 1: Blocking Issues

### 🔴 [Gap-1] Missing null validation in auth.js:42
**Reviewer**: @senior-dev  
**Category**: Blocking - Security  
**Priority Score**: 10  
**Status**: Unaddressed

**Original Comment**:
> This validation is missing edge case handling for null values. Could lead to runtime errors.

**Current Code** (auth.js:42-45):
```javascript
function validateUser(user) {
  return user.email.includes('@');
}
```

**Issue**: No null check before accessing `user.email`

**Recommended Fix**:
```javascript
function validateUser(user) {
  if (!user || !user.email) return false;
  return user.email.includes('@');
}
```

**Estimated Effort**: 5 minutes  
**Dependencies**: None  
**Tests Needed**: Add unit test for null input

---

### 🔴 [Gap-2] SQL injection vulnerability in query.js:78
**Reviewer**: @security-team  
**Category**: Blocking - Security  
**Priority Score**: 10  
**Status**: Unaddressed

**Original Comment**:
> Using string concatenation for SQL queries. Must use parameterized queries.

**Current Code** (query.js:78):
```javascript
const sql = `SELECT * FROM users WHERE id = ${userId}`;
```

**Issue**: Direct string interpolation creates SQL injection risk

**Recommended Fix**:
```javascript
const sql = 'SELECT * FROM users WHERE id = ?';
db.query(sql, [userId]);
```

**Estimated Effort**: 15 minutes  
**Dependencies**: None  
**Tests Needed**: Add security test for injection attempt

---

## Priority 2: Suggestions

### 💡 [Gap-3] Extract helper function
**Reviewer**: @code-reviewer  
**Category**: Suggestion - Code Quality  
**Priority Score**: 4  
**Status**: Unaddressed

**Original Comment**:
> Consider extracting this repeated logic into a helper function

**Current Code**: Multiple files with duplicated validation logic

**Recommended Action**: Create `utils/validators.js` with shared functions

**Estimated Effort**: 20 minutes  
**Dependencies**: None

---

## Resolved Items ✅

### [Resolved-1] Add error handling to API call
**Status**: Fixed in commit `abc123`  
**Evidence**: Try-catch block added, tests passing

### [Resolved-2] Update documentation
**Status**: Addressed in commit `def456`  
**Evidence**: README.md updated with new API examples

---

## Action Plan

**Iteration 1** (Estimated: 30 minutes):
1. Fix Gap-1: Add null validation (5 min)
2. Fix Gap-2: Use parameterized queries (15 min)
3. Run tests and verify (10 min)

**Iteration 2** (if time permits):
4. Address Gap-3: Extract helper functions (20 min)

**Next Steps**:
1. Review this analysis
2. Approve starting fixes
3. Monitor progress through iterations
```

## Validation Checks
- [ ] All review comments accounted for
- [ ] Current code state verified
- [ ] Priority scores calculated
- [ ] Merge criteria evaluated
- [ ] Action plan is realistic
- [ ] Estimated efforts provided

## Interaction
- Present summary first: "Found 3 blocking issues, 5 suggestions, 7 resolved"
- Ask: "Would you like to see the full gap analysis or start fixing issues?"
- If starting fixes: "I'll begin with the highest priority items. Proceed?"

## References
- See `reference.md` for gap analysis examples
- See `code-review-orchestrator` agent for workflow context
- See `iterate-on-feedback` skill for fix implementation
