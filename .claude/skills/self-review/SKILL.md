# Self-Review Skill

## Overview

Perform rigorous self-review of code changes using adversarial dialectical methodology before PR submission or merge. Uses the coach agent to identify issues, edge cases, security concerns, and improvements.

## When to Use

- **Before creating PR** - Catch issues before code review
- **After code review** - Verify all feedback addressed
- **Before merge** - Final production readiness check
- **After major refactor** - Ensure no regressions

## Prerequisites

- Code to review (PR, branch, or working directory changes)
- Dialectical-autocoder skill available
- Coach agent configured

## Process

### Phase 1: Define Review Criteria

Create a requirements document with acceptance criteria covering:

1. **Stability** - Error handling, resource management, recovery
2. **Security** - Authentication, input validation, credential handling
3. **Edge Cases** - Boundary conditions, error states, unusual inputs
4. **Resource Management** - Memory leaks, file handle leaks, cleanup
5. **Testing** - Coverage, determinism, error injection
6. **Code Quality** - Bugs, clarity, maintainability
7. **Documentation** - API docs, troubleshooting, examples
8. **Production Readiness** - Long-running stability, performance

### Phase 2: Coach Review

Launch coach agent with:
- Requirements document path
- List of files to review
- Focus areas (stability, security, etc.)
- Evidence requirements

Coach will:
- Review every acceptance criterion
- Classify issues by severity (CRITICAL, HIGH, MEDIUM, LOW)
- Provide file/line references for each issue
- Suggest fixes
- Issue verdict: APPROVED, REVISE, or REJECTED

### Phase 3: Fix Issues

For REVISE or REJECTED verdicts:
1. Address all CRITICAL issues (blocking)
2. Address all HIGH issues (should fix)
3. Consider MEDIUM/LOW issues (nice to have)
4. Re-run tests
5. Re-run self-review (repeat until APPROVED)

### Phase 4: Document Results

Save review results:
- Issues found and severity
- Fixes applied
- Testing performed
- Final verdict

Attach to PR as comment or commit message.

## Usage

### Basic Self-Review

```bash
# From Claude Code or skill invocation
/self-review --pr=16
```

### With Custom Requirements

```bash
/self-review --pr=16 --requirements=path/to/criteria.md
```

### For Local Changes

```bash
/self-review --files="lib/**/*.js"
```

## Implementation

When this skill is invoked, it:

1. **Creates review requirements** (or uses provided ones):
   ```markdown
   # PR #[number] Self-Review Requirements

   ## Acceptance Criteria

   ### 1. [Category]
   - [ ] Criterion 1
   - [ ] Criterion 2

   ### Evidence Required
   - File references
   - Test coverage
   - Edge case handling
   ```

2. **Launches dialectical-autocoder**:
   ```
   Review [PR/files] with adversarial critique.

   Coach should identify:
   - Potential issues
   - Edge cases
   - Security concerns
   - Resource leaks
   - Testing gaps

   Focus on: [focus areas]
   ```

3. **Coach performs review**:
   - Reads all changed files
   - Checks each acceptance criterion
   - Identifies issues with severity
   - Provides file/line references
   - Suggests fixes
   - Issues verdict

4. **Produces structured output**:
   ```markdown
   ## Self-Review Results

   **Verdict:** APPROVED | REVISE | REJECTED

   ### Critical Issues (Must Fix)
   - [File:line] - Issue description - Fix suggestion

   ### High Priority Issues
   - [File:line] - Issue description - Fix suggestion

   ### Medium/Low Issues
   - [File:line] - Issue description - Fix suggestion

   ### Evidence Reviewed
   - Test coverage: X%
   - Files reviewed: N
   - Lines reviewed: N
   ```

5. **For REVISE/REJECTED**:
   - Create tasks for each blocking issue
   - Launch reliability-engineer or tdd-developer to fix
   - Re-run self-review after fixes

## Example Session

### Input

```
/self-review --pr=16
```

### Output

```
🔍 Starting self-review of PR #16

📋 Creating review requirements...
✅ Requirements document: PR_16_REVIEW_REQUIREMENTS.md

🤖 Launching coach agent for adversarial review...
📝 Reviewing 34 files, 7,812 lines...

❌ VERDICT: REJECTED

🚨 CRITICAL Issues Found: 4
- Resource leak: Log stream never closed (daemon-manager.js:45)
- No HTTP API authentication (http-server.js)
- Config file not gitignored (.gitignore)
- Test suite completely broken (test-daemon.mjs:122)

⚠️  HIGH Priority Issues: 4
🔶 MEDIUM Priority Issues: 6
ℹ️  LOW Priority Issues: 3

📊 Review Summary:
- Files reviewed: 10
- Lines reviewed: ~2,500
- Critical blockers: 4
- Total issues: 17

🔧 Next Steps:
1. Fix all CRITICAL issues (blocking merge)
2. Fix all HIGH priority issues (should fix)
3. Re-run tests
4. Re-run self-review

See full review: PR_16_REVIEW_RESULTS.md
```

## Review Checklist Template

The skill uses this template for comprehensive reviews:

```markdown
## Acceptance Criteria

### 1. Daemon Stability
- [ ] Handles file system errors gracefully
- [ ] Recovers from network failures
- [ ] Handles rapid file changes
- [ ] Prevents memory leaks
- [ ] Cleans up resources on shutdown
- [ ] Prevents multiple instances
- [ ] Detects and cleans stale PID files

### 2. Error Handling
- [ ] All async operations have try-catch
- [ ] Errors logged with context
- [ ] Retry logic has maximum attempts
- [ ] Failed operations don't block others
- [ ] Server errors don't crash daemon
- [ ] Malformed inputs handled gracefully

### 3. Security
- [ ] API authentication required
- [ ] Input validation prevents injection
- [ ] Credentials not logged
- [ ] File permissions restrictive
- [ ] Secrets gitignored
- [ ] No information disclosure

### 4. Resource Management
- [ ] Watchers properly closed
- [ ] Servers properly closed
- [ ] Timers/intervals cleared
- [ ] No event listener leaks
- [ ] File handles closed
- [ ] Memory usage bounded
- [ ] CPU usage reasonable

### 5. Testing
- [ ] Critical paths have tests
- [ ] Error conditions tested
- [ ] Edge cases tested
- [ ] Tests deterministic
- [ ] Tests clean up
- [ ] External deps mocked

### 6. Production Readiness
- [ ] Can run days/weeks without intervention
- [ ] Recovers from transient failures
- [ ] Appropriate logging
- [ ] Acceptable performance
- [ ] No known critical bugs
```

## Integration Points

This skill can be invoked by:
- **pr-review-loop** - Self-review before waiting for human review
- **task-processor-auto** - Self-review after each task
- **dev-workflow-orchestrator** - Self-review as quality gate
- Standalone via `/self-review [options]`

## Output Artifacts

### Review Requirements Document
```
PR_[number]_REVIEW_REQUIREMENTS.md or [feature]_REVIEW_REQUIREMENTS.md
```

Contains:
- Acceptance criteria (typically 40-60 items)
- Evidence requirements
- Verdict criteria

### Review Results Document
```
PR_[number]_REVIEW_RESULTS.md or [feature]_REVIEW_RESULTS.md
```

Contains:
- Issues found with severity
- File/line references
- Fix suggestions
- Verdict and next steps

### Issue Tracking
Creates tasks for each blocking issue if task-processor integration enabled.

## Configuration

### Default Focus Areas
```yaml
focus:
  - stability
  - security
  - error_handling
  - resource_management
  - testing_coverage
  - edge_cases
```

### Severity Levels
```yaml
severity:
  CRITICAL: Security issues, crashes, data loss, resource leaks
  HIGH: Error handling gaps, stability issues, major bugs
  MEDIUM: Edge cases, testing gaps, code quality
  LOW: Documentation, minor improvements, style
```

### Verdict Criteria
```yaml
APPROVED: All critical criteria met with evidence
REVISE: Some critical issues found, fixable
REJECTED: Fundamental design flaws, requires major rework
```

## Best Practices

1. **Run early and often** - Catch issues before they compound
2. **Fix blocking issues first** - Don't accumulate technical debt
3. **Re-run after fixes** - Verify fixes didn't introduce new issues
4. **Document results** - Attach to PR for human reviewers
5. **Update requirements** - Add new criteria as patterns emerge

## Benefits

- **Catches issues before human review** - Saves reviewer time
- **Identifies blind spots** - Adversarial perspective finds edge cases
- **Improves code quality** - Forces thinking about error handling, security
- **Speeds up PR cycle** - Fewer review iterations needed
- **Builds better habits** - Learn common pitfalls to avoid

## Limitations

- Coach agent can miss subtle bugs (not a replacement for human review)
- Doesn't run code (catches logic errors, not runtime issues)
- Requires good acceptance criteria (garbage in, garbage out)
- Takes time (5-15 minutes for thorough review)

## See Also

- `.claude/skills/dialectical-autocoder/SKILL.md` - Underlying methodology
- `.claude/agents/coach.md` - Coach agent behavior
- `.claude/skills/pr-review-loop/SKILL.md` - Automated PR review cycle
- `.claude/skills/reliability-engineer/SKILL.md` - Security-focused fixes
