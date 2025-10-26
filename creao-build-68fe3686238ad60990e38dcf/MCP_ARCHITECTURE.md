# MCP Architecture Overview 🏗️

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CIVIC AI APPLICATION                       │
│                     (React + TypeScript)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  Your React Components                                │    │
│  │  (src/routes/index.tsx)                              │    │
│  │                                                       │    │
│  │  import { useMCPClient } from '@/hooks/use-mcp-client'│    │
│  │  const { callTool } = useMCPClient()                 │    │
│  └─────────────────────┬─────────────────────────────────┘    │
│                        │                                        │
│                        ▼                                        │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  MCP Client Hook                                      │    │
│  │  (src/hooks/use-mcp-client.ts)                       │    │
│  │                                                       │    │
│  │  • listTools(serverUrl, mcpId)                       │    │
│  │  • callTool<TOutput, TInput>(...)                    │    │
│  │  • Automatic JWT auth                                 │    │
│  │  • Error handling                                     │    │
│  │  • Parent window reporting                            │    │
│  └─────────────────────┬─────────────────────────────────┘    │
│                        │                                        │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ HTTP POST /execute-mcp/v2
                         │ (JSON-RPC 2.0)
                         │
         ┌───────────────┴──────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  MCP PROXY API  │          │  DIRECT MCP     │
│  (Backend)      │          │  (Local Server) │
├─────────────────┤          ├─────────────────┤
│ • Auth check    │          │ • Custom logic  │
│ • Rate limiting │          │ • Direct access │
│ • Logging       │          │ • No proxy      │
└────────┬────────┘          └────────┬────────┘
         │                            │
         └───────────┬────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
         ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  OFFICIAL MCP    │      │  CUSTOM MCP      │
│  SERVERS         │      │  SERVERS         │
├──────────────────┤      ├──────────────────┤
│ • Slack          │      │ • Civic Backend  │
│ • GitHub         │      │ • Ticket System  │
│ • PostgreSQL     │      │ • ML Models      │
│ • Google Maps    │      │ • Custom APIs    │
│ • Filesystem     │      │ • Your Logic     │
│ • Memory         │      │ • Databases      │
│ • Fetch          │      │ • Services       │
└──────────────────┘      └──────────────────┘
```

---

## Request Flow

### 1. User Interaction
```typescript
// User clicks button in React component
<Button onClick={handleSubmitTicket}>Submit Ticket</Button>
```

### 2. MCP Hook Call
```typescript
const { callTool } = useMCPClient();

// VERIFIED: Tested with curl - correct parameter names for create_ticket
const result = await callTool<MCPToolResponse, {
  category: string;
  description: string;
}>(
  'http://localhost:3001',  // Server URL
  'civic-tickets',          // MCP ID
  'create_ticket',          // Tool name
  {
    category: 'parking',
    description: 'Appeal ticket #12345'
  }
);
```

### 3. HTTP Request
```json
POST http://localhost:3001/execute-mcp/v2
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "transportType": "streamable_http",
  "serverUrl": "http://localhost:3001",
  "request": {
    "jsonrpc": "2.0",
    "id": "call-tool-1730000000000",
    "method": "tools/call",
    "params": {
      "name": "create_ticket",
      "arguments": {
        "category": "parking",
        "description": "Appeal ticket #12345"
      }
    }
  }
}
```

### 4. MCP Server Processing
```javascript
// mcp-server-template.js
async function executeTool(toolName, args) {
  if (toolName === 'create_ticket') {
    // Your custom logic
    const ticket = await database.createTicket(args);
    return { success: true, ticket };
  }
}
```

### 5. JSON-RPC Response
```json
{
  "jsonrpc": "2.0",
  "id": "call-tool-1730000000000",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"success\":true,\"ticket\":{\"id\":\"TICKET-001\"}}"
      }
    ]
  }
}
```

### 6. Parse in React
```typescript
// MCPToolResponse format
const response = await callTool(...);

// Parse JSON from content[0].text
const data = JSON.parse(response.content[0].text);

console.log(data.ticket.id); // "TICKET-001"
```

---

## Configuration Flow

### Project-Level Configuration
`.claude/settings.json`
```json
{
  "hooks": {
    "SessionStart": [...],
    "PostToolUse": [...]
  }
}
```
- Git-committed
- Shared across team
- Hooks and project settings

### User-Level Configuration
`.claude.user/settings.json`
```json
{
  "env": {...},
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "secret"
      }
    }
  }
}
```
- Git-ignored (`.gitignore`)
- User-specific
- Contains secrets/API keys

---

## MCP Server Types

### 1. NPM-based Official MCP
```
┌──────────────────────┐
│  npx -y @model...    │
│  /server-slack       │
├──────────────────────┤
│ • Auto-installed     │
│ • Maintained         │
│ • Official support   │
└──────────────────────┘
```

### 2. Local Node.js MCP
```
┌──────────────────────┐
│  node server.js      │
├──────────────────────┤
│ • Custom logic       │
│ • Full control       │
│ • Direct database    │
└──────────────────────┘
```

### 3. Python MCP
```
┌──────────────────────┐
│  python server.py    │
├──────────────────────┤
│ • ML models          │
│ • Data processing    │
│ • Scientific libs    │
└──────────────────────┘
```

### 4. Docker MCP
```
┌──────────────────────┐
│  docker run ...      │
├──────────────────────┤
│ • Isolated           │
│ • Portable           │
│ • Production-ready   │
└──────────────────────┘
```

---

## Security Architecture

### JWT Authentication Flow
```
┌─────────────────┐
│  React App      │
│  (Frontend)     │
└────────┬────────┘
         │
         │ 1. User logs in
         ▼
┌─────────────────┐
│  Auth Service   │
│  (Backend)      │
└────────┬────────┘
         │
         │ 2. Returns JWT token
         ▼
┌─────────────────┐
│  localStorage   │
│  (Browser)      │
└────────┬────────┘
         │
         │ 3. Auto-attached to MCP calls
         ▼
┌─────────────────┐
│  MCP Client     │
│  Hook           │
└────────┬────────┘
         │
         │ Authorization: Bearer <JWT>
         ▼
┌─────────────────┐
│  MCP Server     │
│  (Validates)    │
└─────────────────┘
```

### Environment Variables
```
.env.local (Git-ignored)
├── API_KEYS
├── DATABASE_URLS
├── SERVICE_CREDENTIALS
└── SECRETS

.claude.user/settings.json (Git-ignored)
└── mcpServers
    └── env
        ├── SLACK_BOT_TOKEN
        ├── GITHUB_TOKEN
        └── DB_PASSWORD
```

---

## Error Handling Flow

```
┌─────────────────┐
│  callTool()     │
└────────┬────────┘
         │
         ├─ Success ────────────────┐
         │                          │
         └─ Error                   ▼
            │              ┌─────────────────┐
            │              │  MCPToolResponse│
            ▼              │  {content:[...]}│
   ┌────────────────┐     └─────────────────┘
   │  Error Types   │
   └────────────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐
│HTTP │ │MCP  │ │Run- │
│Error│ │Error│ │time │
└──┬──┘ └──┬──┘ └──┬──┘
   │       │       │
   └───────┼───────┘
           │
           ▼
   ┌───────────────┐
   │ reportParent()│
   │ (logging)     │
   └───────────────┘
```

---

## Validation Flow

### ESLint MCP Validation
```
┌──────────────────────────┐
│  Your Code               │
│                          │
│  await callTool(...)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  ESLint MCP Rule         │
│  (mcp-integration.js)    │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│ PASS   │   │ FAIL   │
│ ✅     │   │ ❌     │
└────────┘   └────────┘
    │             │
    │             ▼
    │      ┌─────────────────┐
    │      │ Error:          │
    │      │ Missing         │
    │      │ // VERIFIED:    │
    │      │ comment         │
    │      └─────────────────┘
    │
    ▼
┌─────────────────┐
│  Build Success  │
└─────────────────┘
```

### Required Verification Comment
```typescript
// ❌ FAILS ESLint
const result = await callTool(...);

// ✅ PASSES ESLint
// VERIFIED: Tested with curl - correct parameter names for slack_post_message
const result = await callTool(...);
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  [Submit Ticket Button] → onClick handler                │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   REACT COMPONENT                        │
│  const { callTool } = useMCPClient()                     │
│  await callTool(url, id, tool, args)                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    MCP HOOK LAYER                        │
│  • Add JWT token                                         │
│  • Build JSON-RPC request                                │
│  • Handle errors                                         │
│  • Report to parent                                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   NETWORK LAYER                          │
│  fetch(serverUrl, {                                      │
│    method: 'POST',                                       │
│    headers: { Authorization: 'Bearer ...' },             │
│    body: JSON.stringify(...)                             │
│  })                                                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    MCP SERVER                            │
│  • Validate request                                      │
│  • Execute tool                                          │
│  • Query database/API                                    │
│  • Return JSON-RPC response                              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND SERVICES                        │
│  • Database (PostgreSQL)                                 │
│  • External APIs (Slack, GitHub)                         │
│  • File System                                           │
│  • ML Models                                             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                     RESPONSE                             │
│  {                                                       │
│    "jsonrpc": "2.0",                                     │
│    "result": {                                           │
│      "content": [{                                       │
│        "type": "text",                                   │
│        "text": "{\"success\":true,...}"                  │
│      }]                                                  │
│    }                                                     │
│  }                                                       │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  PARSE & DISPLAY                         │
│  const data = JSON.parse(result.content[0].text)        │
│  setTicketId(data.ticket.id)                            │
│  showSuccessMessage("Ticket created!")                   │
└──────────────────────────────────────────────────────────┘
```

---

## File Organization

```
your-project/
│
├── Configuration
│   ├── .claude/
│   │   └── settings.json          (Project-level, committed)
│   └── .claude.user/
│       ├── settings.json           (User-level, git-ignored)
│       └── mcp-examples.json       (Example configs)
│
├── Documentation
│   ├── MCP_QUICKSTART.md          (5-min setup)
│   ├── MCP_SETUP_GUIDE.md         (Complete guide)
│   ├── MCP_FILES_SUMMARY.md       (File overview)
│   └── MCP_ARCHITECTURE.md        (This file)
│
├── Implementation
│   ├── src/hooks/
│   │   └── use-mcp-client.ts      (MCP client hook)
│   ├── src/components/examples/
│   │   └── MCPIntegrationExample.tsx (Working examples)
│   └── mcp-server-template.js     (Custom server template)
│
└── Validation
    └── config/eslint/rules/
        └── mcp-integration.js      (ESLint validation)
```

---

## Integration Points

### 1. Frontend Integration
```typescript
// src/routes/index.tsx
import { useMCPClient } from '@/hooks/use-mcp-client';

function MyComponent() {
  const { callTool } = useMCPClient();
  // Use MCP tools...
}
```

### 2. Backend Integration
```javascript
// mcp-server-template.js
const server = createServer(async (req, res) => {
  const response = await handleMCPRequest(request);
  res.end(JSON.stringify(response));
});
```

### 3. Configuration Integration
```json
// .claude.user/settings.json
{
  "mcpServers": {
    "my-server": { ... }
  }
}
```

---

## Best Practices

### ✅ DO
- Add verification comments before `callTool()`
- Use TypeScript types (`MCPToolResponse`)
- Validate with `npm run lint:mcp`
- Keep secrets in `.claude.user/settings.json`
- Test MCP servers with curl first
- Parse `content[0].text` JSON

### ❌ DON'T
- Skip verification comments
- Commit `.claude.user/settings.json`
- Assume parameter names without testing
- Hardcode API keys in code
- Skip TypeScript types
- Forget to parse MCP response JSON

---

## Performance Considerations

### Caching Strategy
```typescript
// Use TanStack Query for MCP calls
const { data } = useQuery({
  queryKey: ['mcp-tickets', userId],
  queryFn: () => callTool(...),
  staleTime: 5 * 60 * 1000  // 5 minutes
});
```

### Rate Limiting
```javascript
// In MCP server
const rateLimiter = new Map();
function checkRateLimit(userId) {
  // Implement rate limiting logic
}
```

### Connection Pooling
```javascript
// For database MCPs
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
```

---

## Monitoring & Debugging

### Parent Window Reports
```typescript
// Automatically sent by useMCPClient
reportParent({
  type: 'mcp',
  subType: 'response-success',
  success: true,
  payload: { response: data }
});
```

### Server Logs
```javascript
// In MCP server
console.log(`[MCP] ${method} request from ${userId}`);
```

### Browser DevTools
```typescript
// Check Network tab for:
// - POST /execute-mcp/v2
// - Request/Response payloads
// - Timing information
```

---

## Next Steps

1. **Read**: [`MCP_QUICKSTART.md`](./MCP_QUICKSTART.md) for setup
2. **Explore**: `src/components/examples/MCPIntegrationExample.tsx` for working code
3. **Configure**: `.claude.user/settings.json` with your MCP servers
4. **Build**: Use `mcp-server-template.js` for custom servers
5. **Validate**: Run `npm run lint:mcp` before committing

---

**You now understand the complete MCP architecture!** 🎉
