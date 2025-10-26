# Vapi Integration Debugging Guide

## Issues Found and Fixed

### 1. Missing API Key ✅ FIXED
**Problem**: The `.env.local` file was missing the `VITE_VAPI_API_KEY` environment variable.

**Solution**: Added the API key to `.env.local`:
```bash
VITE_VAPI_API_KEY=c9357f08-9add-46dc-a32a-f91aa5f5c0fd
```

### 2. No MCP Server Available
**Status**: No Vapi MCP server is currently configured.

**Current Implementation**: Direct API integration using REST endpoints at `https://api.vapi.ai`

**To check MCP servers**: Run `claude mcp list`

## How to Debug Vapi Issues

### Step 1: Check API Key Configuration
```bash
# In your terminal
cat .env.local | grep VAPI

# Expected output:
# VITE_VAPI_API_KEY=c9357f08-9add-46dc-a32a-f91aa5f5c0fd
```

### Step 2: Restart Dev Server
**IMPORTANT**: After changing `.env.local`, you MUST restart the dev server for changes to take effect.

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Check Browser Console
Open browser DevTools (F12) and look for logs:

**Successful call logs:**
```
[Vapi] Creating call with request: {customer: {...}, hasAssistant: true}
[Vapi] Request body: {...}
[Vapi] Response status: 201
```

**Error logs:**
```
[Vapi] Response status: 400
[Vapi] Error response: {error: {message: "..."}}
```

### Step 4: Verify API Key Validity
1. Go to https://dashboard.vapi.ai/account
2. Check if your API key `c9357f08-9add-46dc-a32a-f91aa5f5c0fd` is valid
3. Verify it has phone call permissions enabled

### Step 5: Check Vapi Dashboard Requirements
The API might require:
- ✅ Valid API key
- ❓ Configured phone number (phoneNumberId)
- ❓ Configured assistant (assistantId) or inline assistant
- ❓ Valid customer phone number format

## Common Error Messages

### "VAPI_API_KEY not configured"
- **Cause**: API key is missing or empty
- **Fix**: Add `VITE_VAPI_API_KEY` to `.env.local` and restart server

### "HTTP error! status: 400"
Possible causes:
1. **Invalid API key** - Check Vapi dashboard
2. **Missing required fields** - Check if you need `phoneNumberId` or `assistantId`
3. **Invalid phone number format** - Must be E.164 format (e.g., `+16695774085`)
4. **Missing phone number configuration** - You might need to configure a phone number in Vapi dashboard first

### "HTTP error! status: 401"
- **Cause**: Invalid or expired API key
- **Fix**: Get a new API key from Vapi dashboard

### "HTTP error! status: 403"
- **Cause**: API key doesn't have phone call permissions
- **Fix**: Update permissions in Vapi dashboard

## MCP Server Option (Not Currently Used)

### Why Use MCP Server?
- Better abstraction and type safety
- Automatic error handling
- Consistent interface with other tools
- Better logging and debugging

### How to Set Up Vapi MCP Server
If Vapi provides an MCP server, you can configure it:

1. **Add MCP Server**:
```bash
claude mcp add vapi
```

2. **Configure in your code**:
```typescript
import { useMCPClient, type MCPToolResponse } from "@/hooks/use-mcp-client";

// In your component
const { callTool } = useMCPClient();

// Make a call
const result = await callTool<MCPToolResponse, VapiCallRequest>(
  "https://vapi-mcp-server-url",
  "vapi-mcp-id",
  "create_call",
  {
    customer: { number: "+16695774085" },
    assistant: { /* ... */ }
  }
);

// Parse MCP response
const callData = JSON.parse(result.content[0].text);
```

## Current Implementation Details

### Architecture
- **Direct API Integration**: Using `fetch()` to call Vapi REST API
- **Hook**: `use-vapi.ts` provides `createCall`, `getCall`, `listCalls`
- **UI Integration**: `src/routes/index.tsx` at line 472-622

### Test the Integration
1. Make sure dev server is running with the updated `.env.local`
2. Open the app in your browser
3. Type: "call me for eviction case"
4. Watch the browser console for debug logs
5. Check the right panel for "Active Voice Calls (Vapi)"

### Debugging Checklist
- [ ] API key is in `.env.local`
- [ ] Dev server was restarted after adding API key
- [ ] Browser console shows `[Vapi]` debug logs
- [ ] Phone number is in E.164 format (+16695774085)
- [ ] Vapi dashboard shows the API key is valid
- [ ] Check if you need to configure a phone number in Vapi dashboard first

## Next Steps if Still Not Working

1. **Check Vapi Documentation**: https://docs.vapi.ai
2. **Review API Requirements**: Some Vapi features might require:
   - Pre-configured assistant ID
   - Pre-configured phone number ID
   - Account verification
   - Credits/payment setup

3. **Test with Curl**:
```bash
curl -X POST https://api.vapi.ai/call/phone \
  -H "Authorization: Bearer c9357f08-9add-46dc-a32a-f91aa5f5c0fd" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"number": "+16695774085"},
    "assistant": {
      "name": "Test Assistant",
      "model": {"provider": "openai", "model": "gpt-4", "messages": [{"role": "system", "content": "You are helpful"}]},
      "voice": {"provider": "11labs", "voiceId": "21m00Tcm4TlvDq8ikWAM"}
    }
  }'
```

4. **Contact Vapi Support**: If the issue persists, check:
   - Do you need to verify your phone number first?
   - Do you need to add credits to your account?
   - Are there any account restrictions?
