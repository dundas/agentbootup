# Remote Claude Code Approval & Control System - Architecture Overview

## Executive Summary
The **Remote Claude Code Approval System** enables you to approve/decline Claude Code tool requests and send new instructions to Claude while away from your computer. This is achieved by leveraging **Claude Code hooks** - shell scripts that execute at specific lifecycle events - combined with a cloud relay service and mobile web interface.

## Core Concept
Claude Code provides hook events that execute at key moments in its workflow. By intercepting these events, we can:
1. **Send notifications** when Claude needs permission (via Slack/mobile UI)
2. **Wait for remote approval** before allowing tool execution
3. **Inject new messages** to continue conversations remotely
4. **Track active sessions** for remote management


## System Architecture

### Components
**Local Machine:**
- Claude Code CLI running your development session[1][2]
- Hook scripts in `.claude/hooks/` directory (Python)[3][1]
- Environment variables for API credentials


**Cloud Relay Service:**
- REST API server (Node.js/Express recommended)
- Approval queue with polling mechanism
- Message queue for remote prompt injection
- Session registry tracking active Claude instances


**Remote Interface:**
- Slack integration via webhooks[4][5][6]
- Lightweight mobile Progressive Web App (PWA)
- Approve/Decline UI with real-time updates
- Message input for sending new instructions

## Key Hook Events Used

### PreToolUse Hook
**Triggers:** Before Claude executes any tool (Bash, Edit, Write, etc.)[1][3]


**Data received:**
```json
{
  "session_id": "abc123",
  "tool_name": "Bash",
  "tool_input": {"command": "npm install axios"}
}
```


**What it does:**
1. Sends notification to Slack webhook immediately[4][5]
2. Posts approval request to relay API with unique ID
3. Polls relay API for decision (30-second timeout)
4. Returns JSON response controlling Claude's behavior


**Response options:**[1]
- `"allow"` - Execute the tool immediately
- `"deny"` - Block execution and show reason to Claude
- `"ask"` - Fall back to normal CLI approval prompt


### Stop Hook
**Triggers:** When Claude finishes responding[1][3]


**Purpose:** Check for pending messages from mobile UI and inject them as new prompts


**Mechanism:**
1. Polls relay API for pending messages
2. If message exists, blocks stop and returns it as new instruction
3. Claude processes the new message and continues working
4. Prevents infinite loops with `stop_hook_active` flag check[1]


### SessionStart Hook
**Triggers:** When Claude Code starts or resumes a session[1]


**Purpose:**
- Register active session with relay API
- Notify Slack that session is active
- Makes session available in mobile UI dropdown


### Notification Hook
**Triggers:** When Claude sends notifications (permission needed, idle for 60+ seconds)[1]


**Purpose:** Forward status updates to Slack for awareness


## Data Flow Patterns

### Approval Request Flow
**Step-by-step process:**


1. **Claude initiates tool use** → PreToolUse hook fires
2. **Hook receives JSON** via stdin with tool details[1]
3. **Hook sends Slack notification** (HTTP POST to webhook)[4][5]
4. **Hook posts to relay API** creating approval request with unique ID
5. **Relay API stores request** in pending queue (Map/Redis)
6. **Mobile UI polls API** every 2 seconds for updates
7. **You see notification** on phone or in Slack channel
8. **You tap Approve/Deny** in mobile UI
9. **Mobile UI posts decision** to relay API
10. **Hook's polling loop** receives decision from API
11. **Hook returns JSON** to Claude Code with permission decision[1]
12. **Claude executes or blocks** based on decision


**Timing:** Typically 2-6 seconds from notification to execution[1]


### Message Injection Flow
**Step-by-step process:**


1. **You type message** in mobile UI: "Now add tests for the new function"
2. **Mobile UI posts** to relay API `/send-message` endpoint
3. **Relay API stores** message in session's pending queue
4. **Claude finishes current task** → Stop hook fires[1]
5. **Stop hook polls** relay API for pending messages
6. **Message found** → Stop hook returns `decision: "block"` with message as reason[1]
7. **Claude doesn't stop** → processes the new message instead
8. **Claude continues working** on your remote instruction


## Implementation Approaches

### Pattern Comparison
| Pattern | Complexity | Latency | Best For |
|---------|-----------|---------|----------|
| **Hybrid (Recommended)** | Medium | 200ms-2s | Balance of simplicity and speed |
| Polling-Based | Low | 1-2s | MVP, quick start |
| WebSocket-Based | High | <100ms | Production, real-time needs |
| File-Based | Very Low | 5-10s | Prototype without cloud |




### Hybrid Pattern (Recommended)
**Why hybrid?**
- Simple cloud API (no WebSocket complexity)
- Fast enough for practical use (sub-2-second approvals)
- Graceful fallbacks when network unavailable
- Easy to deploy and maintain


**Architecture:**
- Hooks send notifications immediately via Slack webhook[4][5]
- Hooks poll relay API with 30-second timeout[1]
- Mobile UI updates every 2 seconds
- Timeout falls back to normal CLI approval


## Technical Details

### Hook Input/Output Format
**Input (via stdin):**[1]
All hooks receive JSON with common fields:
- `session_id` - Unique session identifier
- `transcript_path` - Path to conversation history
- `cwd` - Current working directory
- `hook_event_name` - Which hook fired


**Output (via stdout + exit code):**[1]


**Exit code 0:** Success, continue normally
**Exit code 2:** Blocking error (shows stderr to Claude)
**JSON output:** Advanced control with structured response


Example PreToolUse JSON response:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Approved via mobile"
  },
  "suppressOutput": true
}
```


### Environment Variables
Hooks have access to:[1]
- `CLAUDE_PROJECT_DIR` - Project root directory
- `CLAUDE_FILE_PATHS` - Files being modified
- Standard shell environment variables
- Custom variables (API keys, webhook URLs)


### Timeout Handling
**Challenge:** Claude Code hooks have 60-second execution timeout[1][3]


**Solution:**
- Send Slack notification immediately (< 1 second)
- Poll relay API with 30-second timeout
- Each poll iteration: 1 second
- If no decision after 30 seconds, return "ask" to fall back to CLI
- Total hook execution: ~32 seconds (well under limit)


### Security Considerations
**Webhook URLs are secrets:**[4][6]
- Never commit to version control
- Store in environment variables
- Slack actively revokes leaked URLs[4]


**API Authentication:**
- Use Bearer token authentication for relay API
- Implement request signing for mobile UI
- Short-lived session tokens recommended
- HTTPS required for all communication


**Hook Safety:**[1]
- Validate and sanitize all inputs
- Never trust JSON data blindly
- Block path traversal attempts
- Quote shell variables properly
- Skip sensitive files (.env, keys)


## Slack Integration

### Incoming Webhooks
**Setup process:**[4][5][6]
1. Create Slack App at api.slack.com
2. Enable "Incoming Webhooks" feature
3. Click "Add New Webhook to Workspace"
4. Select target channel
5. Authorize app
6. Copy generated webhook URL


**Webhook URL format:**[4]
```
https://hooks.slack.com/services/{workspace-id}/{channel-id}/{token}
```


**Sending messages:**[5][4]
```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-type: application/json' \
  -d '{"text":"🤖 Claude needs approval for: rm -rf node_modules"}'
```


**Rich formatting:**[4]
Slack supports "blocks" for interactive messages with buttons, but note that **incoming webhooks don't support interactive buttons** - you'd need a full Slack Bot with OAuth for that functionality.


### Alternative: Slack Bot API
For interactive approve/deny buttons in Slack:[7][8]
- Requires bot user with `chat:write` scope
- Uses `chat.postMessage` API method
- Can send direct messages to users
- Supports interactive components


## Mobile Web UI

### Technology Stack Options
**Lightweight frameworks for mobile UI:**[9][10][11]


| Framework | Size | Features |
|-----------|------|----------|
| **Vanilla HTML/CSS/JS** | ~10KB | No dependencies, fastest load |
| Alpine.js | ~15KB | Reactive, Vue-like syntax |
| Preact | ~3KB | React-compatible, tiny bundle |
| Bulma CSS | ~20KB | Beautiful components, no JS[11] |
| Mini.css | <10KB | Mobile-first, responsive[11] |


**Recommended:** Pure HTML/CSS/JS for maximum compatibility and minimal load time


### Progressive Web App (PWA)
**Benefits:**
- "Add to Home Screen" for native-like experience
- Offline support with service workers
- Push notifications (optional)
- Fast loading with caching
- Works on iOS and Android


**Basic PWA requirements:**
- HTTPS hosting
- `manifest.json` file
- Service worker for offline support
- Responsive design
- App icons in various sizes


## Implementation Phases

### Phase 1: MVP (1-2 days)
**Goal:** One-way Slack notifications


**Components:**
- PreToolUse hook script
- Slack webhook integration
- Basic notifications for all tool requests


**Testing:** Run Claude Code, see Slack messages appear


### Phase 2: Remote Approvals (3-5 days)
**Goal:** Approve/deny from mobile UI


**Components:**
- Cloud relay API (Node.js/Express)
- Approval queue with polling
- Mobile web UI with approve/deny buttons
- Hook polling mechanism


**Testing:** Approve commands from phone while away


### Phase 3: Message Injection (2-3 days)
**Goal:** Send new prompts remotely


**Components:**
- Stop hook implementation
- Message queue in relay API
- Input field in mobile UI
- Session management


**Testing:** Send "Now add tests" from phone, watch Claude continue


### Phase 4: Polish (3-5 days)
**Goal:** Production-ready UX


**Components:**
- PWA manifest and service worker
- Better error handling
- Push notifications
- Session history
- Multiple pending approvals UI


**Testing:** Full workflow testing, edge cases


### Phase 5: Production (5-7 days)
**Goal:** Scalable, secure, monitored


**Components:**
- Redis/PostgreSQL backend
- Rate limiting
- Comprehensive logging
- Monitoring/alerting
- API request signing
- Documentation


**Testing:** Load testing, security audit, failover scenarios


## Deployment Guide

### Local Setup
**1. Install dependencies:**
```bash
pip3 install requests
chmod +x .claude/hooks/*.py
```


**2. Configure environment:**
```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/URL"
export RELAY_API_URL="https://your-relay.com/api"
export RELAY_API_KEY="your-secret-key"
```


**3. Test hooks individually:**
```bash
echo '{"session_id":"test","tool_name":"Bash","tool_input":{"command":"ls"}}' | \
  .claude/hooks/pre_tool_use.py
```


### Cloud Relay Deployment
**Recommended platforms:**
- **DigitalOcean App Platform** - Simple, affordable ($5-12/mo)
- **Fly.io** - Free tier available, fast deploys
- **Heroku** - Easy setup, good free tier
- **Vultr** - Your existing provider, familiar setup


**Requirements:**
- Node.js 18+ or Python 3.9+
- HTTPS support (required for Slack)[4]
- Environment variable configuration
- Redis or PostgreSQL (production)


**Basic deployment:**
```bash
# Example for DigitalOcean
git push dokku main
dokku config:set RELAY_API_KEY=your-key
dokku ps:scale web=1
```


### Mobile UI Hosting
**Options:**
1. **Same server as relay API** - Simple, one domain
2. **Static CDN** (Cloudflare Pages, Netlify) - Free, fast
3. **S3 + CloudFront** - Scalable, cheap


**PWA setup:**
```json
{
  "name": "Claude Code Remote",
  "short_name": "Claude Remote",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#5B3AFF",
  "theme_color": "#5B3AFF",
  "icons": [...]
}
```


## Technical Challenges & Solutions

### Challenge: Hook Timeout (60 seconds)
**Problem:** Hooks must complete within 60 seconds[1][3]


**Solution:**
- Send notification immediately
- Poll with 30-second timeout (50% buffer)
- Graceful fallback to "ask" mode
- Never block indefinitely


### Challenge: Session Management
**Problem:** Mobile UI needs to know active sessions


**Solution:**
- SessionStart hook registers with relay API
- SessionEnd hook deregisters
- Relay maintains active session map
- Mobile UI shows dropdown of active sessions


### Challenge: Multiple Pending Approvals
**Problem:** Several commands waiting simultaneously


**Solution:**
- Unique approval ID for each request (UUID)
- Timestamp-based queue ordering
- Auto-cleanup after 60 seconds
- Mobile UI shows all pending in list


### Challenge: Network Failures
**Problem:** Lost connection during approval


**Solution:**
- Timeout mechanism returns "ask"
- User can approve in CLI if needed
- Retry logic in hook scripts
- Error notifications to Slack


### Challenge: Computer Sleep
**Problem:** Local machine sleeps during approval


**Solution:**
- Accept timeout as normal behavior
- Consider Wake-on-LAN trigger (advanced)
- Or use --dangerously-skip-permissions for non-destructive ops[2]


## Advanced Features

### Slack Interactive Buttons
For true interactive buttons in Slack (requires bot, not webhook):[7][8]


**Setup:**
1. Create Slack Bot with `chat:write` scope
2. Use `chat.postMessage` API instead of webhooks
3. Configure interactive components
4. Set up request URL endpoint to receive button clicks


**Tradeoff:** More complex but better UX in Slack


### Auto-Approval Rules
**Smart filtering in PreToolUse hook:**
```python
# Auto-approve safe operations
safe_tools = ["Read", "Glob", "Grep", "WebSearch"]
if tool_name in safe_tools:
    sys.exit(0)  # Allow without notification


# Auto-approve safe bash commands
safe_commands = ["git status", "git log", "ls", "pwd"]
if any(command.startswith(cmd) for cmd in safe_commands):
    sys.exit(0)
```


### Conversation History Access
**Hooks can read full transcript:**[1]
```python
transcript_path = input_data["transcript_path"]
with open(transcript_path) as f:
    for line in f:
        event = json.loads(line)
        # Analyze conversation history
```


**Use cases:**
- Context-aware approval decisions
- Session summaries in mobile UI
- Audit logging


### Push Notifications
**Mobile push notifications using:**
- Web Push API (PWA standard)
- Service Worker notifications
- Firebase Cloud Messaging
- OneSignal (easy integration)


**Trigger on:**
- New approval requests
- Session starts/ends
- Important Claude notifications


## Best Practices

### Hook Development
1. **Always validate input:**[1]
```python
try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON: {e}", file=sys.stderr)
    sys.exit(1)
```


2. **Use proper error handling:**
```python
try:
    response = requests.post(url, json=data, timeout=5)
except Exception as e:
    # Fall back gracefully, don't crash
    sys.exit(0)
```


3. **Test hooks individually:**
```bash
echo '{"session_id":"test",...}' | python hook.py
```


4. **Set appropriate timeouts:**[1]
```json
{
  "command": "python hook.py",
  "timeout": 35
}
```


### Security
1. **Never log secrets:**
```python
# Bad
logging.info(f"Using API key: {API_KEY}")


# Good
logging.info("API request authenticated")
```


2. **Validate session IDs:**
```python
if not re.match(r'^[a-f0-9-]+$', session_id):
    return error("Invalid session ID")
```


3. **Rate limiting:**
```javascript
const rateLimit = require('express-rate-limit');
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
}));
```


### Monitoring
**Key metrics to track:**
- Approval request count
- Average approval time
- Timeout rate
- Error rate by hook type
- Active sessions count


**Tools:**
- Winston/Pino for logging
- Sentry for error tracking
- Uptime monitoring (Uptime Robot, Better Uptime)
- Custom dashboard with metrics


## Example Use Cases

### 1. Working from Phone
**Scenario:** You're commuting, Claude finds an issue


**Flow:**
1. Get Slack notification: "Claude wants to run tests"
2. Open mobile UI
3. Tap "Approve"
4. Claude continues working
5. Get update when done


### 2. Long-Running Tasks
**Scenario:** Training a model, want to check progress


**Flow:**
1. Send message from phone: "What's the current loss?"
2. Stop hook injects question
3. Claude responds with metrics
4. See response in transcript or next notification


### 3. Evening Review
**Scenario:** Reviewing day's work before sleep


**Flow:**
1. Send: "Create a summary of what we accomplished today"
2. Claude analyzes transcript
3. Get Slack message with summary
4. Approve any final commits


### 4. Emergency Fixes
**Scenario:** Production issue, need immediate hotfix


**Flow:**
1. Send urgent message: "Fix the login bug ASAP"
2. Approve critical file edits from phone
3. Monitor progress via Slack notifications
4. Deploy when ready


## Conclusion
The Remote Claude Code Approval system transforms Claude Code from a local-only tool into a remotely manageable AI development assistant. By leveraging the powerful hook system, you can maintain control and continue conversations even while away from your computer.[1][3]


**Key advantages:**
- ✅ Approve/deny tool requests remotely
- ✅ Send new instructions on the go
- ✅ Monitor Claude's progress via Slack
- ✅ Maintain security and control
- ✅ Simple deployment with cloud relay
- ✅ Graceful fallbacks when offline


**Getting started:**
1. Set up Slack webhook (5 minutes)
2. Create PreToolUse hook script (30 minutes)
3. Deploy simple relay API (1-2 hours)
4. Build mobile UI (2-3 hours)
5. Test end-to-end flow (1 hour)


Total time to MVP: **4-6 hours** for a developer familiar with APIs and hooks.


The hybrid polling architecture provides the sweet spot between simplicity and responsiveness, making this a practical solution for remote Claude Code management without complex WebSocket infrastructure or tunneling requirements.


[1](https://docs.claude.com/en/docs/claude-code/hooks)
[2](https://docs.claude.com/en/docs/claude-code/cli-reference)
[3](https://www.builder.io/blog/claude-code)
[4](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)
[5](https://docs.slack.dev/tools/java-slack-sdk/guides/incoming-webhooks/)
[6](https://www.svix.com/resources/guides/how-to-get-slack-webhook-url/)
[7](https://docs.slack.dev/messaging/sending-and-scheduling-messages)
[8](https://docs.slack.dev/reference/methods/chat.postMessage/)
[9](https://www.reddit.com/r/reactjs/comments/1av89l9/suggest_me_good_very_lightweight_ui_library/)
[10](https://stackoverflow.com/questions/9856232/lightweight-ui-framework-for-js-html5-webkit-based-mobile-development-with-decen)
[11](https://www.lambdatest.com/blog/responsive-lightweight-css-frameworks/)
[12](https://docs.claude.com/en/docs/claude-code/hooks-guide)
[13](https://www.anthropic.com/engineering/claude-code-best-practices)
[14](https://www.reddit.com/r/ClaudeAI/comments/1m7wrdo/my_claude_code_setup_prompts_commands_hooks_and/)
[15](https://www.cometapi.com/claude-code-hooks-what-is-and-how-to-use-it/)
[16](https://docs.claude.com)
[17](https://shipyard.build/blog/claude-code-cheat-sheet/)
[18](https://www.claude.com/platform/api)
[19](https://docs.claude.com/en/docs/claude-code/overview)
[20](https://www.youtube.com/watch?v=J5B9UGTuNoM)
[21](https://www.postman.com/postman/anthropic-apis/documentation/dhus72s/claude-api)
[22](https://www.reddit.com/r/ClaudeAI/comments/1ixave9/whats_claude_code/)
[23](https://github.com/disler/claude-code-hooks-multi-agent-observability)
[24](https://www.anthropic.com/learn/build-with-claude)
[25](https://thediscourse.co/p/claude-code)
[26](https://anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
[27](https://www.reddit.com/r/ClaudeAI/comments/1j09edt/providing_claude_code_reference_to_relevant_api/)
[28](https://www.siddharthbharath.com/claude-code-the-complete-guide/)
[29](https://slack.com/marketplace/A0F7XDUAZ-incoming-webhooks)
[30](https://pinggy.io/blog/how_to_get_slack_webhook/)
[31](https://documentation.lakesidesoftware.com/en/Content/Configure/Webhooks/Webhooks%20and%20Slack.htm)
[32](https://www.jetbrains.com/help/kotlin-multiplatform-dev/cross-platform-frameworks.html)
[33](https://launchdarkly.com/docs/integrations/slack/webhooks)
[34](https://stackoverflow.com/questions/47753834/how-to-send-direct-messages-to-a-user-as-app-in-app-channel)
[35](https://dev.to/robbiecahill/how-to-use-slack-webhooks-a-developers-guide-3dcj)
[36](https://trailhead.salesforce.com/trailblazer-community/feed/0D5KX00000KhkJ30AJ)
[37](https://ionicframework.com)
[38](https://community.make.com/t/send-slack-message-to-make-bot/25396)
[39](https://onsen.io)
[40](https://api.slack.com/reference/functions/send_dm)
