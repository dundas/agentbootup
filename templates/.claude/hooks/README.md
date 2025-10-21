# Claude Code Hooks (Templates)

This folder contains example Python hook scripts for Claude Code. Copy them into your project’s `.claude/hooks/` directory and ensure they are executable.

## Hooks
- `pre_tool_use.py` – Intercepts tool invocations to request remote approval.
- `stop.py` – Injects messages from remote/mobile into the ongoing session.
- `session_start.py` – Registers the session with a relay, sends notifications.
- `notification.py` – Forwards Claude Code notifications (e.g., idle, permission needed).

## Setup
1. Install deps: `pip3 install requests`
2. Export environment variables:
```
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/URL"
export RELAY_API_URL="https://your-relay.com/api"
export RELAY_API_KEY="your-secret-key"
```
3. Make executable:
```
chmod +x .claude/hooks/*.py
```

See `REMOTE_CLAUDE_APPROVAL_SYSTEM.md` for the full architecture.
