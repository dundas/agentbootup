# Quick Start: Code Review Workflow

## What You Asked For

> "lets check the code review on the pr and create a gap analysis of our current code and the final state of ready to merge"

This workflow now does exactly that, automatically.

## How to Use

### Step 1: Install to Your Project
```bash
cd /path/to/your/project
node /path/to/agentbootup-src/bootup.mjs --target .
```

### Step 2: Restart Claude Code or Windsurf
Reload to pick up new agents, skills, and commands.

### Step 3: Run the Workflow
```bash
# In Claude Code or Windsurf
/code-review-workflow 123

# Or just ask naturally
"lets check the code review on PR #123 and create a gap analysis"
```

## What Happens

```
1. Fetches PR Review Comments
   ↓
   Found 12 comments: 3 blocking, 7 suggestions, 2 questions

2. Analyzes Code Gaps
   ↓
   Merge Readiness: 45/100 ⚠️
   Top Priority: Missing null validation, SQL injection

3. Iterates on Fixes (with your approval)
   ↓
   Iteration 1: Fix null validation ✓
   Iteration 2: Fix SQL injection ✓
   
4. Reports Final Status
   ↓
   Merge Readiness: 85/100 ✅
   Ready for re-review
```

## What You Get

**Files in `tasks/` directory:**
- `code-review-123-feedback.json` - All PR comments categorized
- `code-review-123-gaps.md` - Detailed gap analysis with fixes
- `code-review-123-state.json` - Workflow state tracking
- `code-review-123-iterations.md` - What was done, step by step

**Git commits:**
- One commit per fix
- Conventional format
- References PR and reviewer

## Example Output

```markdown
# Code Review Gap Analysis - PR #123

**Merge Readiness**: 45/100 ⚠️

## Summary
- ❌ 3 Blocking Issues (must fix)
- ✅ 7 Resolved
- 💡 5 Suggestions (optional)

## Priority 1: Blocking Issues

### 🔴 [Gap-1] Missing null validation
**Reviewer**: @senior-dev
**Priority**: 10

**Current Code** (auth.js:42):
```javascript
function validateUser(user) {
  return user.email.includes('@');
}
```

**Recommended Fix**:
```javascript
function validateUser(user) {
  if (!user || !user.email) return false;
  return user.email.includes('@');
}
```

**Estimated Effort**: 5 minutes
```

## Architecture

**Pattern**: Reflection + Planning (Dual-Loop)

```
Your Prompt
    ↓
Code Review Orchestrator (Agent)
    ↓
    ├─→ Fetch PR Review (Skill) → GitHub CLI
    ├─→ Analyze Gaps (Skill) → Gap Analysis + Score
    └─→ Iterate on Feedback (Skill) → Fix → Test → Commit
                                        ↑____________↓
                                       Reflection Loop
```

## Key Features

✅ **Automatic categorization** - Blocking vs. suggestions  
✅ **Merge readiness score** - Objective 0-100 metric  
✅ **Reflection loop** - Fix → validate → reflect → repeat  
✅ **Human-in-the-loop** - Approval required for each fix  
✅ **Rollback on failure** - Safe iteration  
✅ **Conventional commits** - Clean git history  
✅ **Escalation** - Stops when stuck, asks for help  

## Prerequisites

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Verify tests work
npm test
```

## Configuration (Optional)

Create `.code-review-config.json`:
```json
{
  "max_iterations": 5,
  "merge_readiness_threshold": 80,
  "validation_commands": {
    "test": "npm test",
    "lint": "npm run lint"
  }
}
```

## Troubleshooting

**"GitHub CLI not found"**
```bash
brew install gh
gh auth login
```

**"PR not found"**
- Check PR number
- Verify you're in correct repo
- Ensure PR exists

**"Tests failing"**
- Review iteration log
- May need manual fix
- Check if tests were already failing

## Design Inspiration

Based on research into:
- **Anthropic's Claude Code** - Dual-loop architecture, slash commands
- **OneRedOak Workflows** - Reflection pattern, GitHub Actions
- **LangGraph Patterns** - ReAct, Plan & Solve, Reflexion
- **Agentic AI** - Reflection-focused + Planning-focused patterns

## Files Created

```
templates/
├── .claude/
│   ├── agents/
│   │   └── code-review-orchestrator.md
│   ├── skills/
│   │   ├── fetch-pr-review/
│   │   │   ├── SKILL.md
│   │   │   └── reference.md
│   │   ├── analyze-code-gaps/
│   │   │   ├── SKILL.md
│   │   │   └── reference.md
│   │   └── iterate-on-feedback/
│   │       ├── SKILL.md
│   │       └── reference.md
│   └── commands/
│       └── code-review-workflow.md
├── .windsurf/
│   └── workflows/
│       └── code-review-workflow.md
└── ai-dev-tasks/
    └── code-review-guide.md
```

## Next Steps

1. **Test it**: Run on a real PR
2. **Customize**: Adjust scoring or validation commands
3. **Integrate**: Add to CI/CD pipeline (future)
4. **Share**: Use across your team

## Support

See full documentation:
- **User Guide**: `ai-dev-tasks/code-review-guide.md`
- **Implementation**: `CODE_REVIEW_WORKFLOW.md`
- **Skills**: `.claude/skills/*/reference.md`

---

**Ready to use!** Just run `/code-review-workflow [PR_NUMBER]`
