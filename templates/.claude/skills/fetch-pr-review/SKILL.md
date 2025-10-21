---
name: fetch-pr-review
description: Fetch and parse PR review comments from GitHub, categorizing by severity and status.
---

# Fetch PR Review

## Goal
Retrieve all review comments, suggestions, and feedback from a GitHub PR and structure them for gap analysis.

## Process
1. Accept PR identifier (number, URL, or branch name)
2. Use GitHub CLI (`gh`) or API to fetch:
   - Review comments (inline code comments)
   - General PR comments
   - Review decisions (approved, changes requested, commented)
   - Check run results (CI/CD status)
3. Parse and categorize each comment:
   - **Blocking**: "must fix", "required", "blocking", review state = "changes_requested"
   - **Suggestion**: "consider", "could", "might", "nit"
   - **Question**: "?", "why", "how", "clarify"
   - **Resolved**: Comments with "resolved" thread status or replies indicating completion
4. Extract metadata:
   - File path and line number
   - Reviewer name
   - Timestamp
   - Thread status (open/resolved)

## Output Format
Save to `tasks/code-review-[pr-number]-feedback.json`:
```json
{
  "pr_number": "123",
  "pr_url": "https://github.com/org/repo/pull/123",
  "fetched_at": "2025-10-21T11:25:00Z",
  "review_state": "changes_requested",
  "ci_status": "passing",
  "comments": [
    {
      "id": "comment-456",
      "category": "blocking",
      "severity": "high",
      "file": "src/auth.js",
      "line": 42,
      "reviewer": "senior-dev",
      "text": "This validation is missing edge case handling for null values",
      "status": "open",
      "created_at": "2025-10-20T14:30:00Z"
    }
  ],
  "summary": {
    "total": 12,
    "blocking": 3,
    "suggestions": 7,
    "questions": 2,
    "resolved": 5
  }
}
```

## GitHub CLI Commands
```bash
# Fetch PR details
gh pr view [PR_NUMBER] --json number,url,state,reviewDecision

# Fetch review comments
gh pr view [PR_NUMBER] --json comments,reviews

# Check CI status
gh pr checks [PR_NUMBER]
```

## Categorization Rules
- **Blocking** keywords: `must`, `required`, `blocking`, `critical`, `security`, `bug`, `broken`
- **Suggestion** keywords: `consider`, `could`, `might`, `nit`, `optional`, `prefer`
- **Question** indicators: `?`, `why`, `how`, `what`, `clarify`, `explain`
- **Resolved** indicators: thread status = `resolved`, reply contains `fixed`, `done`, `addressed`

## Error Handling
- If PR not found: prompt user for correct PR number
- If GitHub CLI not installed: provide installation instructions
- If authentication fails: guide user through `gh auth login`
- If API rate limited: suggest waiting or using personal access token

## Interaction
- Prompt for PR number if not provided
- Show summary after fetching: "Found 12 comments: 3 blocking, 7 suggestions, 2 questions"
- Ask if user wants to see full details or proceed to gap analysis

## References
- See `reference.md` for GitHub CLI examples
- See `code-review-orchestrator` agent for workflow context
