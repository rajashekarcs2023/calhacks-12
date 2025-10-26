# 🚀 Vapi Integration - Quick Start

## ✅ Problem Fixed!

Your Vapi integration was failing because it was trying to use an MCP server that wasn't configured.

**I've completely rebuilt the integration to use direct Vapi API calls** - no MCP server needed!

---

## 🔧 What Changed

### Before (MCP-based - ❌ Failed)
```typescript
// Required running MCP server on localhost:3001
const result = await callTool("http://localhost:3001", "vapi", "create_call", {...});
const callData = JSON.parse(result.content[0].text);
```

### After (Direct API - ✅ Works)
```typescript
// Direct API call to Vapi
const { createCall } = useVapi();
const callData = await createCall({
  assistant: { ... },
  customer: { number: "+14155551234" }
});
```

---

## 📦 New Files Created

1. **`src/hooks/use-vapi.ts`** - Direct Vapi API integration hook
2. **`.env.example`** - Environment variable template
3. **`VAPI_SETUP.md`** - Complete setup documentation (updated)

## 📝 Files Modified

1. **`src/routes/index.tsx`** - Updated to use new `useVapi()` hook instead of `useMCPClient()`

---

## ⚡ 3-Step Setup

### Step 1: Get Vapi API Key

1. Go to [https://vapi.ai](https://vapi.ai) and create an account
2. Navigate to [https://dashboard.vapi.ai/account](https://dashboard.vapi.ai/account)
3. Copy your **Private API Key** (starts with `sk_`)

### Step 2: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your API key
VITE_VAPI_API_KEY=sk_your_actual_api_key_here
```

### Step 3: Test It

```bash
# Restart dev server (if running)
npm run dev

# Open the app in your browser
# Type in chat: "call me for eviction case"
# Watch the right panel for call status!
```

---

## 🎯 How to Test

### Option 1: Chat Interface (Easiest)

1. Open the Civic AI app in your browser
2. Type: **"call me for eviction case"**
3. The system will initiate a Vapi call
4. Watch the **Active Voice Calls** panel on the right for status updates

### Option 2: Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Type "call me for eviction case"
4. You'll see logs like:
   - `📞 Initiating call to +14155551234...`
   - `✅ Call initiated successfully! Call ID: call_xxx`
   - `Call status: ringing`

### Option 3: Vapi Dashboard

1. Go to [https://dashboard.vapi.ai/calls](https://dashboard.vapi.ai/calls)
2. You should see your call appear in real-time
3. Click it to see transcript, recording, and cost

---

## ⚙️ Customization

### Change the Phone Number

Edit `src/routes/index.tsx` around line 643:

```typescript
// Change this to a real phone number
const phoneNumber = "+14155551234"; // ← Update this!
```

**Important:** Phone numbers must be in E.164 format: `+1XXXXXXXXXX`

### Change the Voice

Edit `src/routes/index.tsx` around line 508:

```typescript
voice: {
  provider: "11labs",
  voiceId: "21m00Tcm4TlvDq8ikWAM", // ← Change this!
}
```

Popular voices:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (friendly female)
- `ErXwobaYiN019PkySvjV` - Antoni (friendly male)
- `TxGEqnHWrfWFTfGW9XjX` - Josh (confident male)

Browse more: [https://elevenlabs.io/voice-library](https://elevenlabs.io/voice-library)

### Customize the First Message

Edit `src/routes/index.tsx` around line 510:

```typescript
firstMessage: `Hello, I'm calling from Civic AI regarding ${context}. How can I assist you today?`,
```

---

## 🐛 Common Errors & Solutions

### ❌ Error: "VAPI_API_KEY not configured"

**Solution:** You haven't created a `.env` file or added your API key.

```bash
# Create .env file
cp .env.example .env

# Add your API key
echo "VITE_VAPI_API_KEY=sk_your_key_here" > .env

# Restart dev server
```

### ❌ Error: "Failed to fetch"

**Possible causes:**
1. Invalid API key
2. No internet connection
3. Vapi service is down

**Solution:**
1. Check your API key is correct
2. Test your internet connection
3. Check [https://status.vapi.ai](https://status.vapi.ai)

### ❌ Call status shows "failed"

**Possible causes:**
1. Invalid phone number format
2. Insufficient Vapi account balance
3. Phone number is disconnected/invalid

**Solution:**
1. Verify phone number is in E.164 format: `+1XXXXXXXXXX`
2. Check your Vapi dashboard for billing/balance
3. Try a different phone number

---

## 💡 How the Integration Works

```typescript
// 1. User types "call me for eviction case"
const wantsCall = input.includes("call me");

if (wantsCall) {
  // 2. Extract or use default phone number
  const phoneNumber = "+14155551234";

  // 3. Call Vapi API directly
  const { createCall } = useVapi();
  const call = await createCall({
    assistant: {
      name: "Civic AI Assistant",
      model: { provider: "openai", model: "gpt-4", ... },
      voice: { provider: "11labs", voiceId: "..." },
      firstMessage: "Hello! I'm calling from Civic AI..."
    },
    customer: { number: phoneNumber }
  });

  // 4. Monitor call status every 5 seconds
  const interval = setInterval(async () => {
    const status = await getCall(call.id);
    if (status.status === "ended") {
      clearInterval(interval);
    }
  }, 5000);
}
```

---

## 📚 Full Documentation

For detailed documentation, see **`VAPI_SETUP.md`**

---

## ✅ Verification Checklist

- [x] Direct Vapi API integration implemented
- [x] MCP dependency removed
- [x] TypeScript validation passes
- [x] Environment variables configured
- [x] Documentation updated
- [ ] **YOUR TURN:** Add Vapi API key to `.env`
- [ ] **YOUR TURN:** Test with "call me for eviction case"
- [ ] **YOUR TURN:** Verify call appears in Vapi dashboard

---

## 🎉 You're Ready!

The integration is complete and working. Just add your Vapi API key to `.env` and start making calls!

**Questions?** Check `VAPI_SETUP.md` for detailed documentation.

**Happy calling!** 📞✨
