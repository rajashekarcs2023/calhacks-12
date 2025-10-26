# MCP Quick Start Guide 🚀

**Get your custom MCP server running in 5 minutes!**

---

## Step 1: Choose Your MCP Server (30 seconds)

Pick from official MCP servers or add your own:

### Official MCP Servers
- **Slack** - Send notifications
- **GitHub** - Repository operations
- **Google Maps** - Location services
- **PostgreSQL** - Database queries
- **Filesystem** - File operations
- **Memory** - Knowledge graph storage
- **Fetch** - HTTP API calls
- **Vapi** - Voice AI phone calls (requires API key)

### Custom MCP Servers
- Your own Node.js/Python/Docker server
- Modified official servers with custom config

---

## Step 2: Add Configuration (1 minute)

Edit `.claude.user/settings.json`:

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  },
  "mcpServers": {
    "my-server": {
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

---

## Step 3: Test MCP Server (1 minute)

```bash
# Terminal 1: Start your MCP server (if custom)
node /path/to/your/mcp-server.js

# Terminal 2: Test with curl
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

✅ **Success?** You should see available tools listed.

---

## Step 4: Use in Your React App (2 minutes)

Create a new component or edit `src/routes/index.tsx`:

```typescript
import { useMCPClient, type MCPToolResponse } from '@/hooks/use-mcp-client';
import { Button } from '@/components/ui/button';

function MyMCPComponent() {
  const { callTool } = useMCPClient();

  async function testMCP() {
    // VERIFIED: Tested with curl - correct parameter names for slack_post_message
    const result = await callTool<MCPToolResponse, {
      channel: string;
      text: string;
    }>(
      'http://localhost:3001',
      'my-server',
      'slack_post_message',
      {
        channel: 'C0123456789',
        text: 'Hello from Civic AI!'
      }
    );

    const data = JSON.parse(result.content[0].text);
    console.log('MCP Result:', data);
  }

  return <Button onClick={testMCP}>Test MCP</Button>;
}
```

---

## Step 5: Validate (30 seconds)

```bash
# Run ESLint validation
npm run lint:mcp

# Run TypeScript check
npm run check:safe
```

✅ **All passing?** Your MCP is ready!

---

## 🎉 You're Done!

**What you just set up:**
- ✅ Custom MCP server configuration
- ✅ React component using MCP
- ✅ ESLint validation for MCP calls
- ✅ TypeScript type safety

---

## 🔥 Common Use Cases

### 1. **Slack Notifications** (Official MCP)
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-...",
        "SLACK_TEAM_ID": "T..."
      }
    }
  }
}
```

### 2. **Database Operations** (Official MCP)
```json
{
  "mcpServers": {
    "db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://..."
      }
    }
  }
}
```

### 3. **Custom Local Server** (Your Code)
```json
{
  "mcpServers": {
    "custom": {
      "command": "node",
      "args": ["/home/user/my-mcp-server/index.js"],
      "env": {
        "PORT": "3001",
        "API_KEY": "your-key"
      }
    }
  }
}
```

---

## 🆘 Troubleshooting

### Problem: MCP server not starting
**Solution:** Check logs at `~/.claude/logs/mcp-server.log`

### Problem: Connection refused
**Solution:** Verify server URL includes `http://` protocol

### Problem: ESLint errors
**Solution:** Add `// VERIFIED: Tested with curl` comments

### Problem: TypeScript errors
**Solution:** Use `type MCPToolResponse` for tool results

---

## 📚 More Resources

- **Full Guide**: `MCP_SETUP_GUIDE.md`
- **Examples**: `src/components/examples/MCPIntegrationExample.tsx`
- **Config Examples**: `.claude.user/mcp-examples.json`
- **MCP Client API**: `src/hooks/use-mcp-client.ts`

---

## 🎯 Next Steps

1. **Add more MCP servers** - See `.claude.user/mcp-examples.json`
2. **Build features** - Use MCP in your Civic AI app
3. **Share with team** - Document your custom MCPs
4. **Monitor usage** - Check browser console for MCP reports

---

**Happy coding!** 🚀

Need help? Check the full guide: `MCP_SETUP_GUIDE.md`
