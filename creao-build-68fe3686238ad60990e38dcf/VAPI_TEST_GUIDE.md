# Vapi MCP Testing Guide

## Overview

This guide shows you how to test the **Vapi voice calling functionality** integrated into the Civic AI application. The app now responds to natural language commands like "call me for eviction case" and automatically triggers Vapi MCP tools to initiate phone calls.

---

## 🎯 What Was Built

### Features Implemented

1. **Natural Language Intent Detection**
   - Detects phrases like "call me", "phone me", "ring me"
   - Identifies case types (eviction, court, tickets, etc.)
   - Automatically selects the right Vapi assistant

2. **Vapi MCP Integration**
   - Uses `create_call` tool to initiate calls
   - Uses `get_call` tool to monitor call status
   - Displays real-time call progress in UI

3. **Visual Call Monitoring**
   - Real-time call status display in right panel
   - Color-coded status indicators (blue=active, green=completed, red=failed)
   - Animated phone icon during active calls
   - Call duration tracking

---

## 🔧 Setup Requirements

### Step 1: Configure Vapi API Key

Edit `.claude.user/settings.json` and add your Vapi API key:

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  },
  "mcpServers": {
    "vapi": {
      "command": "npx",
      "args": ["-y", "@vapi-ai/mcp-server"],
      "env": {
        "VAPI_TOKEN": "vapi_YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

**Get your API key:**
1. Go to [https://vapi.ai](https://vapi.ai)
2. Sign up for a free account
3. Dashboard → API Keys → Create New
4. Copy the key (starts with `vapi_`)

### Step 2: Configure Vapi Assistant

Before making calls, you need to create a Vapi assistant and phone number:

1. **Create Assistant** (via Vapi Dashboard or MCP):
   ```typescript
   // Assistant ID: asst_civic_eviction_helper
   // Voice: Professional, empathetic
   // Model: GPT-4 or similar
   ```

2. **Get Phone Number**:
   ```typescript
   // Phone Number ID: phone_civic_ai
   // This is the number calls will originate from
   ```

**Note:** Update these IDs in `src/routes/index.tsx:489-490` with your actual IDs.

---

## 🧪 Testing the Feature

### Test Scenario 1: Basic Eviction Call

**User Input:** `"call me for eviction case"`

**Expected Behavior:**
1. ✅ AI detects "eviction" intent
2. ✅ AI detects "call me" request
3. ✅ System message: "📞 Initiating call to +14155551234..."
4. ✅ Vapi `create_call` tool is called
5. ✅ Success message shows call ID
6. ✅ Right panel shows call card with animated status
7. ✅ Call status updates every 5 seconds

**Watch For:**
- Blue pulsing phone icon (call in progress)
- Call ID displayed (e.g., `call_abc123`)
- Status changes: Initiating → Ringing → In Progress → Completed

---

### Test Scenario 2: Other Intents with Calling

Try these phrases:

| User Input | Expected Intent | Expected Call Purpose |
|-----------|-----------------|----------------------|
| `"call me for eviction case"` | Legal/Eviction | Eviction Case Assistance |
| `"phone me about my court date"` | Legal/Court | Court Date Discussion |
| `"ring me for ticket help"` | Tickets | Ticket Appeal Support |

**Note:** Currently only eviction cases trigger calls automatically. Extend other intents by following the same pattern in `src/routes/index.tsx:636-654`.

---

### Test Scenario 3: Error Handling

**Simulate Errors:**

1. **No API Key:**
   - Remove `VAPI_TOKEN` from settings
   - Try: `"call me for eviction case"`
   - Expected: Red error message about missing API key

2. **Invalid Assistant ID:**
   - Change `assistantId` to `"invalid_id"`
   - Expected: Error message from Vapi

3. **Network Error:**
   - Disconnect network
   - Expected: "Failed to initiate call" message

---

## 📊 Implementation Details

### Key Files Modified

**`src/routes/index.tsx`** (Main changes):

1. **Imports** (line 28):
   ```typescript
   import { type MCPToolResponse, useMCPClient } from "@/hooks/use-mcp-client";
   ```

2. **New Type** (line 160-169):
   ```typescript
   type VapiCall = {
     id: string;
     callId?: string;
     status: "initiating" | "ringing" | "in-progress" | "completed" | "failed";
     purpose: string;
     phoneNumber: string;
     timestamp: Date;
     duration?: number;
     error?: string;
   };
   ```

3. **Vapi Call Function** (line 457-545):
   ```typescript
   const initiateVapiCall = async (phoneNumber, purpose, context) => {
     // Creates call using Vapi MCP
     const result = await callTool<MCPToolResponse>(
       "http://localhost:3001",
       "vapi",
       "create_call",
       { assistantId, phoneNumberId, customer: { number } }
     );
   };
   ```

4. **Call Monitoring** (line 547-595):
   ```typescript
   const monitorVapiCall = async (localCallId, vapiCallId) => {
     // Polls get_call every 5 seconds
     // Updates UI with current status
   };
   ```

5. **Intent Detection Enhancement** (line 615-620):
   ```typescript
   const wantsCall = lowerInput.includes("call me") ||
                     lowerInput.includes("phone me") ||
                     lowerInput.includes("ring me");
   ```

6. **UI Component** (line 1180-1250):
   - Active Voice Calls panel in right sidebar
   - Color-coded status cards
   - Real-time status updates

---

## 🔍 Debugging

### Check MCP Connection

1. **Verify MCP server is running:**
   ```bash
   # Check if Vapi MCP is accessible
   curl http://localhost:3001/health
   ```

2. **Check browser console:**
   - Open DevTools → Console
   - Look for MCP-related messages
   - Check for authentication errors

### Common Issues

| Issue | Solution |
|-------|----------|
| "User not authenticated" | Check JWT token in `use-auth.ts` |
| "Vapi API error" | Verify API key is correct |
| "Assistant not found" | Update `assistantId` with real ID |
| "Phone number invalid" | Use E.164 format (+14155551234) |
| No call status updates | Check `monitorVapiCall` intervals |

---

## 📝 Code Flow

```
User types: "call me for eviction case"
    ↓
handleSendMessage() detects intent
    ↓
Checks if lowerInput.includes("call me")
    ↓
Shows AI response message
    ↓
setTimeout → initiateVapiCall()
    ↓
callTool("vapi", "create_call", {...})
    ↓
useMCPClient → fetch("/execute-mcp/v2")
    ↓
Vapi API creates call
    ↓
Parse response, extract call.id
    ↓
Update vapiCalls state
    ↓
monitorVapiCall() starts polling
    ↓
Every 5s: callTool("vapi", "get_call")
    ↓
Update UI with status changes
    ↓
Call completes → show duration
```

---

## 🎨 UI Components

### Call Status Card Structure

```typescript
<Card className="border-blue-300 bg-blue-50">
  <Phone className="animate-pulse" /> // Animated icon
  <span>Ringing...</span>            // Status text
  <p>Eviction Case Assistance</p>    // Purpose
  <p>+14155551234</p>                 // Phone number
  <p>ID: call_abc123</p>              // Vapi call ID
  <p>Duration: 120s</p>               // Duration (if completed)
</Card>
```

### Status Colors

- **Blue** (`border-blue-300 bg-blue-50`): Initiating, Ringing, In Progress
- **Green** (`border-green-300 bg-green-50`): Completed
- **Red** (`border-red-300 bg-red-50`): Failed

---

## 🚀 Extending the Feature

### Add More Call Intents

Edit `src/routes/index.tsx` around line 636:

```typescript
case "court":
  if (wantsCall) {
    aiResponse = `I'll call you right now about your court date.`;
    setTimeout(() => {
      initiateVapiCall(
        phoneNumber,
        "Court Date Discussion",
        "your upcoming court appearance"
      );
    }, 1000);
  }
  break;

case "ticket":
  if (wantsCall) {
    aiResponse = `Let me call you to discuss your ticket appeal.`;
    setTimeout(() => {
      initiateVapiCall(
        phoneNumber,
        "Ticket Appeal Support",
        "your parking ticket appeal"
      );
    }, 1000);
  }
  break;
```

### Customize Assistant Behavior

Modify the `assistantOverrides` parameter:

```typescript
assistantOverrides: {
  firstMessage: `Hello, I'm your AI assistant from Civic AI. I'm calling about ${context}. I can help explain your rights and options.`,
  voice: {
    provider: "elevenlabs",
    voiceId: "custom_voice_id"
  },
  model: {
    provider: "openai",
    model: "gpt-4"
  }
}
```

---

## ✅ Success Criteria

Your implementation is working correctly if:

1. ✅ User can type "call me for eviction case"
2. ✅ System detects intent and initiates Vapi call
3. ✅ Call card appears in right panel
4. ✅ Status updates in real-time
5. ✅ Phone icon pulses during active call
6. ✅ Call completes and shows duration
7. ✅ No TypeScript errors (`npm run check:safe` passes)
8. ✅ Error messages display for failed calls

---

## 📖 Related Documentation

- **[VAPI_SETUP.md](VAPI_SETUP.md)** - Complete Vapi MCP setup guide
- **[VAPI_API_KEY_SETUP.md](VAPI_API_KEY_SETUP.md)** - Quick 3-minute setup
- **[MCP_SETUP_GUIDE.md](MCP_SETUP_GUIDE.md)** - Full MCP reference
- **[src/hooks/use-mcp-client.ts](src/hooks/use-mcp-client.ts)** - MCP client implementation

---

## 🎉 Summary

You now have a **fully functional voice calling system** that:

- Responds to natural language ("call me for eviction case")
- Automatically detects the right tool to use
- Initiates Vapi calls via MCP
- Monitors call status in real-time
- Displays visual feedback in the UI

**Test it out by typing:** `"call me for eviction case"` in the chat!

---

## 🐛 Troubleshooting

### Issue: "Failed to initiate call"

**Check:**
1. Is your Vapi API key correct?
2. Is the MCP server running on port 3001?
3. Do you have a valid assistant ID and phone number ID?
4. Is your network connection stable?

### Issue: Call status stuck on "Initiating"

**Check:**
1. Look at browser console for errors
2. Verify `monitorVapiCall()` is being called
3. Check if `get_call` tool has correct callId
4. Ensure polling interval (5000ms) isn't too fast

### Issue: No call card appears

**Check:**
1. Is `vapiCalls` state being updated?
2. Check React DevTools for state changes
3. Verify `setVapiCalls()` is being called
4. Look for JSX rendering errors in console

---

**For more help, see the [VAPI_SETUP.md](VAPI_SETUP.md) documentation.**
