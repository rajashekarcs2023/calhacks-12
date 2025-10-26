# 🔑 Vapi API Key Setup - REQUIRED

## ⚠️ CRITICAL: Authentication Required

The **Vapi MCP server is already configured** in your project, but it **WILL NOT WORK** until you add your API key.

---

## 📍 Current Status

✅ **Vapi MCP is configured** in `.claude.user/settings.json`
❌ **Missing API key** - Placeholder value detected: `YOUR_VAPI_API_KEY_HERE`

---

## 🚀 Quick Setup (3 minutes)

### Step 1: Get Your Vapi API Key

1. **Go to Vapi:** [https://vapi.ai](https://vapi.ai)
2. **Sign up** for a free account
3. **Log in** to your dashboard
4. **Navigate to:** Dashboard → API Keys
5. **Click:** "Create New API Key"
6. **Name it:** "Civic AI MCP"
7. **Copy the key** (it looks like: `vapi_abc123...`)

### Step 2: Add Your API Key

1. **Open:** `.claude.user/settings.json`
2. **Find this line:**
   ```json
   "VAPI_TOKEN": "YOUR_VAPI_API_KEY_HERE"
   ```
3. **Replace** `YOUR_VAPI_API_KEY_HERE` with your actual API key:
   ```json
   "VAPI_TOKEN": "vapi_abc123your_actual_key_here"
   ```
4. **Save the file**

### Step 3: Verify It Works

Test with this React component:

```typescript
import { useMCPClient } from '@/hooks/use-mcp-client';

function TestVapi() {
  const { callTool } = useMCPClient();

  async function testConnection() {
    try {
      // VERIFIED: list_assistants requires no parameters
      const result = await callTool<Record<string, never>>(
        'http://localhost:3001',
        'vapi',
        'list_assistants',
        {}
      );

      console.log('✅ Vapi is working!', result);
    } catch (error) {
      console.error('❌ Vapi connection failed:', error);
    }
  }

  return <button onClick={testConnection}>Test Vapi</button>;
}
```

**Expected result:**
- ✅ Success: List of assistants (or empty array if you haven't created any)
- ❌ Failure: "401 Unauthorized" means your API key is invalid

---

## 🔒 Security Notes

### ✅ Safe (already configured)
- `.claude.user/settings.json` is in `.gitignore`
- Your API key will NOT be committed to Git

### ⚠️ Important
- Never share your API key publicly
- Never commit it to version control
- Treat it like a password

---

## 🐛 Troubleshooting

### Error: "VAPI_TOKEN is not set"

**Problem:** The MCP server can't find your API key

**Solution:**
1. Check `.claude.user/settings.json` exists
2. Verify the file has this structure:
   ```json
   {
     "mcpServers": {
       "vapi": {
         "env": {
           "VAPI_TOKEN": "vapi_your_key"
         }
       }
     }
   }
   ```
3. Restart your development server

### Error: "401 Unauthorized"

**Problem:** Your API key is invalid

**Solutions:**
- Check for typos in the API key
- Make sure you copied the entire key (starts with `vapi_`)
- Try generating a new key from Vapi dashboard
- Verify your Vapi account is active

### Error: "Cannot connect to Vapi"

**Problem:** Network or MCP server issue

**Solutions:**
- Check your internet connection
- Verify the MCP server is running
- Check if `npx @vapi-ai/mcp-server` can be executed

---

## 📚 What's Next?

Once your API key is configured:

1. **Read the full guide:** [VAPI_SETUP.md](./VAPI_SETUP.md)
2. **Try the examples:** See working code in the Vapi setup guide
3. **Create an assistant:** Use `create_assistant` to set up your first voice AI
4. **Make a call:** Use `create_call` to phone a city official

---

## 💡 Quick Reference

### File Locations
- **Configuration:** `.claude.user/settings.json` (edit this)
- **Example config:** `.claude.user/settings.json.example` (reference only)
- **Full guide:** `VAPI_SETUP.md`
- **MCP examples:** `.claude.user/mcp-examples.json`

### Available Vapi Tools
- `list_assistants` - List your voice assistants
- `create_assistant` - Create new assistant
- `update_assistant` - Modify assistant
- `get_assistant` - Get assistant details
- `list_calls` - List all calls
- `create_call` - Make a phone call ⭐
- `get_call` - Get call status

### React Hook
```typescript
import { useMCPClient } from '@/hooks/use-mcp-client';

const { callTool } = useMCPClient();

await callTool(
  'http://localhost:3001',  // Server URL
  'vapi',                    // MCP ID
  'create_call',            // Tool name
  { /* parameters */ }       // Tool params
);
```

---

## ✅ Checklist

Before using Vapi features:

- [ ] Signed up at [vapi.ai](https://vapi.ai)
- [ ] Created API key in Vapi dashboard
- [ ] Added API key to `.claude.user/settings.json`
- [ ] Removed placeholder text `YOUR_VAPI_API_KEY_HERE`
- [ ] Tested connection with `list_assistants`
- [ ] Read [VAPI_SETUP.md](./VAPI_SETUP.md) for usage examples

---

## 🆘 Need Help?

**Problem:** Still getting errors after setup
→ Check the full troubleshooting guide in [VAPI_SETUP.md](./VAPI_SETUP.md)

**Problem:** Don't understand how to use Vapi
→ Read the complete examples in [VAPI_SETUP.md](./VAPI_SETUP.md)

**Problem:** Want to see all MCP options
→ Check [MCP_SETUP_GUIDE.md](./MCP_SETUP_GUIDE.md)

---

## 🎯 Summary

**Current state:** Vapi MCP is configured but needs your API key
**Action required:** Add your API key to `.claude.user/settings.json`
**Time required:** 3 minutes
**Difficulty:** Easy - just copy/paste your API key

**Happy coding!** 🚀
