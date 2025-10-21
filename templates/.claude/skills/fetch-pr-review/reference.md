# Fetch PR Review - Reference

## GitHub CLI Examples

### Basic PR Information
```bash
# View PR summary
gh pr view 123

# Get PR as JSON
gh pr view 123 --json number,title,state,url,author,reviewDecision,isDraft

# Get PR with comments
gh pr view 123 --json comments,reviews,reviewRequests
```

### Review Comments
```bash
# List all comments on a PR
gh pr view 123 --json comments --jq '.comments[] | {author: .author.login, body: .body, createdAt: .createdAt}'

# List review comments (inline code comments)
gh pr view 123 --json reviews --jq '.reviews[] | {author: .author.login, state: .state, body: .body}'
```

### CI/CD Status
```bash
# Check status of PR checks
gh pr checks 123

# Get checks as JSON
gh pr checks 123 --json
```

### Authentication
```bash
# Login to GitHub
gh auth login

# Check auth status
gh auth status

# Use with specific token
gh auth login --with-token < token.txt
```

## Comment Categorization Examples

### Blocking Comments
- "This must be fixed before merge"
- "Security vulnerability: SQL injection risk"
- "Required: Add error handling here"
- "Blocking: Tests are failing"
- "Critical: This breaks backward compatibility"

### Suggestion Comments
- "Consider using a more descriptive variable name"
- "Could we extract this into a helper function?"
- "Nit: Extra whitespace"
- "Might want to add a comment explaining this logic"
- "Optional: Could use array destructuring here"

### Question Comments
- "Why did you choose this approach?"
- "How does this handle edge case X?"
- "What happens if the API returns null?"
- "Can you clarify the purpose of this parameter?"

### Resolved Indicators
- Thread status shows "resolved"
- Reply contains: "Fixed in commit abc123"
- Reply contains: "Done, thanks!"
- Reply contains: "Addressed in latest push"

## API Response Structure

### PR View JSON
```json
{
  "number": 123,
  "title": "Add user authentication",
  "state": "OPEN",
  "url": "https://github.com/org/repo/pull/123",
  "author": {"login": "developer"},
  "reviewDecision": "CHANGES_REQUESTED",
  "isDraft": false,
  "comments": [...],
  "reviews": [...]
}
```

### Review Comment Structure
```json
{
  "id": "RC_kwDOABC123",
  "author": {"login": "reviewer"},
  "body": "Please add null check here",
  "path": "src/auth.js",
  "line": 42,
  "createdAt": "2025-10-20T14:30:00Z",
  "state": "PENDING"
}
```

## Error Scenarios

### PR Not Found
```
Error: pull request not found
Solution: Verify PR number and repository
```

### Authentication Required
```
Error: authentication required
Solution: Run `gh auth login`
```

### Rate Limiting
```
Error: API rate limit exceeded
Solution: Wait or use authenticated requests with higher limits
```

## Integration Notes

- Always check if `gh` CLI is installed before running commands
- Cache fetched data to avoid repeated API calls
- Respect GitHub API rate limits (5000 requests/hour for authenticated)
- Use `--json` flag for machine-readable output
- Parse timestamps to calculate comment age
- Track which comments have been addressed in subsequent commits
