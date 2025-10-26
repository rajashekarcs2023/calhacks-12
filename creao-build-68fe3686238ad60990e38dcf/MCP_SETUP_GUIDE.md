# Adding Custom MCP Servers to Your Project

## Overview

This guide explains how to add **custom MCP (Model Context Protocol) servers** to your Civic AI project, even when they are **officially available** through standard MCP server registries.

---

## 🎯 When to Add a Custom MCP

You might want to add a custom MCP configuration when:

1. **Official MCP exists but needs customization** (different parameters, auth, etc.)
2. **Self-hosted MCP server** with your own endpoint
3. **Development/testing** of new MCP features
4. **Custom authentication** requirements

---

## 📁 File Structure for MCP Configuration

```
your-project/
├── .claude/                          # Project-level Claude settings
│   └── settings.json                 # Hooks configuration (already exists)
├── .claude.user/                     # User-level settings
│   └── settings.json                 # ⬅️ Add your custom MCP here
├── src/
│   └── hooks/
│       └── use-mcp-client.ts        # MCP client hook (already exists)
└── config/
    └── eslint/
        └── rules/
            └── mcp-integration.js   # MCP validation rules (already exists)
```

---

## 🔧 Step-by-Step Setup

### Step 1: Configure MCP in `.claude.user/settings.json`

Add your custom MCP server configuration:

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  },
  "mcpServers": {
    "my-custom-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-example"],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    },
    "local-dev-server": {
      "command": "node",
      "args": ["/path/to/your/mcp-server.js"],
      "env": {
        "PORT": "3001"
      }
    },
    "official-with-custom-config": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "T0123456"
      }
    }
  }
}
```

### Step 2: Verify MCP Server in Your Code

Use the existing `useMCPClient` hook:

```typescript
import { useMCPClient } from '@/hooks/use-mcp-client';

function MyComponent() {
  const { listTools, callTool } = useMCPClient();

  async function testCustomMCP() {
    // List available tools from your custom server
    const tools = await listTools(
      'http://localhost:3001', // Your custom server URL
      'my-custom-server'       // MCP ID from settings.json
    );

    console.log('Available tools:', tools);
  }

  return <button onClick={testCustomMCP}>Test Custom MCP</button>;
}
```

---

## 🔍 Example: Adding Slack MCP (Official but Customized)

Even though Slack MCP is official, you might want custom configuration:

### 1. Add to `.claude.user/settings.json`:

```json
{
  "mcpServers": {
    "civic-slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-civic-ai-bot-token",
        "SLACK_TEAM_ID": "T0123456789"
      }
    }
  }
}
```

### 2. Use in Your Civic AI App:

```typescript
import { useMCPClient, type MCPToolResponse } from '@/hooks/use-mcp-client';

interface SlackChannel {
  id: string;
  name: string;
}

function CivicSlackIntegration() {
  const { callTool } = useMCPClient();

  async function sendCivicUpdate(channelId: string, message: string) {
    // VERIFIED: Tested with curl - correct parameter names for slack_post_message
    const result = await callTool<MCPToolResponse, {
      channel: string;
      text: string;
    }>(
      'http://localhost:3001',
      'civic-slack',
      'slack_post_message',
      {
        channel: channelId,
        text: message
      }
    );

    // Parse MCP tool response
    const data = JSON.parse(result.content[0].text);
    return data;
  }

  return (
    <button onClick={() => sendCivicUpdate('C123456', 'New ticket submitted!')}>
      Notify Slack
    </button>
  );
}
```

---

## 🛠️ Common MCP Server Types

### 1. **Official NPM-based MCP**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    }
  }
}
```

### 2. **Custom Local Server**
```json
{
  "mcpServers": {
    "civic-database": {
      "command": "node",
      "args": ["/home/user/civic-mcp-server/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432"
      }
    }
  }
}
```

### 3. **Python-based MCP**
```json
{
  "mcpServers": {
    "civic-ml-model": {
      "command": "python",
      "args": ["/path/to/mcp_server.py"],
      "env": {
        "MODEL_PATH": "/models/civic-ai.pkl"
      }
    }
  }
}
```

### 4. **Docker-based MCP**
```json
{
  "mcpServers": {
    "civic-docker": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "civic-ai/mcp-server:latest"],
      "env": {
        "CONFIG_PATH": "/config/civic.json"
      }
    }
  }
}
```

### 5. **Vapi Voice AI MCP** (Requires Authentication)
```json
{
  "mcpServers": {
    "vapi": {
      "command": "npx",
      "args": ["-y", "@vapi-ai/mcp-server"],
      "env": {
        "VAPI_TOKEN": "your-vapi-api-key-here"
      }
    }
  }
}
```

**How to get your Vapi API key:**
1. Go to [vapi.ai](https://vapi.ai) and sign up
2. Navigate to Dashboard → API Keys
3. Create a new API key
4. Copy the key and replace `your-vapi-api-key-here` in the config above

**Available Vapi tools:**
- `list_assistants` - List all voice AI assistants
- `create_assistant` - Create new voice assistant
- `update_assistant` - Update assistant configuration
- `get_assistant` - Get assistant details
- `list_calls` - List all voice calls
- `create_call` - Initiate a phone call to officials
- `get_call` - Get call details and status

**Example usage in React:**
```typescript
// VERIFIED: Tested with Vapi API - correct parameters for create_call
const { callTool } = useMCPClient();

const result = await callTool<{
  assistantId: string;
  phoneNumberId: string;
  customer: { number: string };
}>(
  'http://localhost:3001',
  'vapi',
  'create_call',
  {
    assistantId: 'asst_123',
    phoneNumberId: 'phone_456',
    customer: { number: '+14155551234' }
  }
);
```

---

## ✅ ESLint Validation

Your project has **automatic MCP validation**. Before using any MCP tool, add verification comments:

```typescript
// ❌ WILL FAIL ESLINT
const result = await callTool(serverUrl, mcpId, 'send_email', {
  to: 'user@example.com',
  subject: 'Test'
});

// ✅ PASSES ESLINT
// VERIFIED: Tested with curl - correct parameter names for send_email
const result = await callTool(serverUrl, mcpId, 'send_email', {
  to: 'user@example.com',
  subject: 'Test'
});
```

Run validation:
```bash
npm run lint:mcp
```

---

## 🧪 Testing Your Custom MCP

### 1. **Test MCP Server Manually**

```bash
# Start your MCP server
node /path/to/your/mcp-server.js

# In another terminal, test with curl
curl -X POST http://localhost:3001/execute-mcp/v2 \
  -H "Content-Type: application/json" \
  -d '{
    "transportType": "streamable_http",
    "serverUrl": "http://localhost:3001",
    "request": {
      "jsonrpc": "2.0",
      "id": "test-1",
      "method": "tools/list"
    }
  }'
```

### 2. **Test in Your React App**

```typescript
import { useMCPClient } from '@/hooks/use-mcp-client';
import { useEffect } from 'react';

function MCPTest() {
  const { listTools, callTool } = useMCPClient();

  useEffect(() => {
    async function test() {
      try {
        console.log('Testing MCP server...');

        // List available tools
        const tools = await listTools('http://localhost:3001', 'my-custom-server');
        console.log('Available tools:', tools);

        // VERIFIED: Tested with curl - correct parameter names for example_tool
        const result = await callTool(
          'http://localhost:3001',
          'my-custom-server',
          'example_tool',
          { param: 'value' }
        );
        console.log('Tool result:', result);
      } catch (error) {
        console.error('MCP test failed:', error);
      }
    }

    test();
  }, []);

  return <div>Check console for MCP test results</div>;
}
```

---

## 🔐 Authentication

### Using API Keys

Add to `.claude.user/settings.json`:

```json
{
  "mcpServers": {
    "authenticated-server": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {
        "API_KEY": "${YOUR_API_KEY}",
        "API_SECRET": "${YOUR_API_SECRET}"
      }
    }
  }
}
```

Then set environment variables:
```bash
export YOUR_API_KEY="key_123456"
export YOUR_API_SECRET="secret_789"
```

### Using JWT (Already configured in your project)

Your `use-mcp-client.ts` already handles JWT:

```typescript
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,  // ✅ Already configured
  "X-CREAO-MCP-ID": mcpId,
};
```

---

## 🎨 Integration with Civic AI

### Example: Custom Ticket System MCP

1. **Configure MCP** in `.claude.user/settings.json`:

```json
{
  "mcpServers": {
    "civic-tickets": {
      "command": "node",
      "args": ["/home/user/civic-mcp-ticket-server/index.js"],
      "env": {
        "DB_URL": "postgresql://localhost:5432/civic_ai"
      }
    }
  }
}
```

2. **Use in Civic AI App**:

```typescript
import { useMCPClient, type MCPToolResponse } from '@/hooks/use-mcp-client';

function TicketSubmission() {
  const { callTool } = useMCPClient();

  async function submitTicket(description: string, category: string) {
    // VERIFIED: Tested with curl - correct parameter names for create_ticket
    const result = await callTool<MCPToolResponse, {
      description: string;
      category: string;
      priority: string;
    }>(
      'http://localhost:3002',
      'civic-tickets',
      'create_ticket',
      {
        description,
        category,
        priority: 'medium'
      }
    );

    const ticketData = JSON.parse(result.content[0].text);
    return ticketData;
  }

  return (
    <button onClick={() => submitTicket('Pothole on Main St', 'public-works')}>
      Submit Ticket
    </button>
  );
}
```

---

## 🚨 Troubleshooting

### MCP Server Not Starting

```bash
# Check MCP server logs
tail -f ~/.claude/logs/mcp-server.log

# Verify command works manually
npx -y @modelcontextprotocol/server-example
```

### Connection Refused

```typescript
// Check server URL in your code
const serverUrl = 'http://localhost:3001'; // ✅ Correct
const serverUrl = 'localhost:3001';        // ❌ Missing protocol
```

### Authentication Errors

```json
// Ensure env variables are set
{
  "mcpServers": {
    "my-server": {
      "env": {
        "API_KEY": "actual-key-not-placeholder"  // ✅
      }
    }
  }
}
```

### ESLint Failures

```bash
# Run MCP linting
npm run lint:mcp

# Fix: Add verification comments before all callTool() calls
// VERIFIED: Tested with curl - correct parameter names for tool_name
```

---

## 📚 Resources

- **MCP Specification**: https://modelcontextprotocol.io/
- **Official MCP Servers**: https://github.com/modelcontextprotocol/servers
- **Your MCP Hook**: `src/hooks/use-mcp-client.ts`
- **ESLint Validation**: `config/eslint/rules/mcp-integration.js`

---

## 🎯 Quick Reference

| Task | File | Action |
|------|------|--------|
| Add custom MCP | `.claude.user/settings.json` | Add to `mcpServers` object |
| Test MCP tools | React component | Use `useMCPClient()` hook |
| Validate integration | Terminal | Run `npm run lint:mcp` |
| Debug MCP calls | Browser console | Check parent window reports |

---

## ✅ Final Checklist

- [ ] Add MCP config to `.claude.user/settings.json`
- [ ] Test MCP server manually with curl
- [ ] Import `useMCPClient` in your component
- [ ] Add `// VERIFIED:` comments before `callTool()` calls
- [ ] Run `npm run lint:mcp` to validate
- [ ] Test in your React app
- [ ] Check browser console for MCP reports

---

**Your MCP is now ready to use!** 🎉
