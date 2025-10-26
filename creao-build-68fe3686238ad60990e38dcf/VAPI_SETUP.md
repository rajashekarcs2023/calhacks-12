# Vapi Voice AI Setup Guide

## Overview

Your Civic AI application now uses **direct Vapi API integration** to make voice phone calls to citizens, government offices, and other contacts using AI-powered voice assistants.

✅ **No MCP server required** - Direct API calls for simplicity and reliability.

---

## 🔑 Authentication Required

**⚠️ IMPORTANT:** The Vapi integration requires a valid API key to function.

### How to Get Your Vapi API Key

1. **Sign up for Vapi**
   - Go to [https://vapi.ai](https://vapi.ai)
   - Create an account (they offer free credits to start)

2. **Access your Dashboard**
   - Log in to [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
   - Navigate to **Account** → **API Keys**

3. **Copy your Private API Key**
   - Copy the key (starts with `sk_`)
   - This is your **Private API Key** - keep it secret!

4. **Keep it secure**
   - ✅ Never commit API keys to Git
   - ✅ Store in `.env` file (already in `.gitignore`)
   - ✅ Use environment variables

---

## 🔧 Configuration

### Step 1: Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### Step 2: Add Your API Key

Edit `.env` and add your Vapi private API key:

```env
VITE_VAPI_API_KEY=sk_your_actual_api_key_here
```

**Replace `sk_your_actual_api_key_here` with your real API key from the Vapi dashboard.**

### Step 3: Restart Your Dev Server

If your dev server is running, restart it to load the new environment variable:

```bash
# Stop the server (Ctrl+C), then restart
npm run dev
```

---

## 📞 How It Works

The application uses the `useVapi()` hook which provides direct access to the Vapi API:

### Available Functions

```typescript
const { createCall, getCall, listCalls, isLoading, error } = useVapi();
```

#### 1. `createCall()` - Initiate a Voice Call

Creates an outbound phone call with an AI assistant.

**Parameters:**
```typescript
{
  assistant: {
    name: string;
    model: {
      provider: "openai";
      model: "gpt-4";
      messages: Array<{ role: string; content: string }>;
    };
    voice: {
      provider: "11labs";
      voiceId: string;  // ElevenLabs voice ID
    };
    firstMessage: string;
  };
  customer: {
    number: string;  // E.164 format: +1XXXXXXXXXX
  };
}
```

**Returns:** `Promise<VapiCall>` with call details and status

#### 2. `getCall()` - Check Call Status

Get the current status of an ongoing or completed call.

**Parameters:**
```typescript
{
  callId: string;  // ID from createCall()
}
```

**Returns:** `Promise<VapiCall>` with updated status

#### 3. `listCalls()` - List Call History

Retrieve a list of recent calls with optional filters.

**Parameters:**
```typescript
{
  limit?: number;
  createdAtGt?: string;  // ISO timestamp
  createdAtLt?: string;
}
```

**Returns:** `Promise<VapiCall[]>`

---

## 💻 Usage Example

The Civic AI app already has Vapi integrated! Here's how it works:

### Making a Call

```typescript
import { useVapi } from '@/hooks/use-vapi';

function MyComponent() {
  const { createCall, getCall } = useVapi();

  async function initiateCall() {
    try {
      const call = await createCall({
        assistant: {
          name: "Civic AI Assistant",
          model: {
            provider: "openai",
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a helpful government services assistant.",
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
          },
          firstMessage: "Hello! How can I assist you today?",
        },
        customer: {
          number: "+14155551234", // Phone number to call
        },
      });

      console.log("Call initiated:", call.id);

      // Monitor call status
      const interval = setInterval(async () => {
        const status = await getCall(call.id);
        console.log("Call status:", status.status);

        if (status.status === "ended" || status.status === "failed") {
          clearInterval(interval);
        }
      }, 5000);

    } catch (error) {
      console.error("Failed to create call:", error);
    }
  }

  return <button onClick={initiateCall}>Make Call</button>;
}
```

---

## 🧪 Testing the Integration

### Method 1: Using the Chat Interface (Easiest)

1. Make sure you've added your API key to `.env`
2. Run the development server (or deploy the app)
3. Open the Civic AI interface in your browser
4. Type: **"call me for eviction case"**
5. Watch the right panel for the call status updates

### Method 2: Check Browser Console

Open your browser's developer tools (F12) and look for:
- ✅ `Call initiated: {call_id}`
- ✅ `Call status: ringing`
- ❌ Error messages if something goes wrong

### Method 3: Check Vapi Dashboard

1. Go to [https://dashboard.vapi.ai/calls](https://dashboard.vapi.ai/calls)
2. You should see your call appear in real-time
3. Click on the call to see transcript, recording, and cost breakdown

---

## 🐛 Troubleshooting

### Error: "VAPI_API_KEY not configured"

**Solution:** Create a `.env` file with your API key:
```env
VITE_VAPI_API_KEY=sk_your_actual_key_here
```

Then restart your dev server.

### Error: "Failed to fetch" or "Network error"

**Possible causes:**
1. Invalid API key
2. Network/CORS issues
3. Vapi service downtime

**Solution:**
1. Verify your API key in the Vapi dashboard
2. Check [https://status.vapi.ai](https://status.vapi.ai) for service status
3. Check browser console for detailed error messages

### Error: "Invalid phone number"

**Solution:** Phone numbers must be in E.164 format:
- ✅ Correct: `+14155551234`
- ❌ Wrong: `(415) 555-1234`
- ❌ Wrong: `4155551234`

Update line ~643 in `src/routes/index.tsx` to use a valid number.

### Call shows "failed" status

**Possible causes:**
1. Invalid phone number
2. Insufficient account balance in Vapi
3. Phone number is blocked or disconnected

**Solution:** Check the Vapi dashboard for detailed error logs and billing status.

---

## 📚 Additional Resources

- **Vapi Documentation:** [https://docs.vapi.ai](https://docs.vapi.ai)
- **Vapi Dashboard:** [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
- **Vapi API Reference:** [https://docs.vapi.ai/api-reference](https://docs.vapi.ai/api-reference)
- **Voice Library:** [https://elevenlabs.io/voice-library](https://elevenlabs.io/voice-library) (for voice IDs)

---

## ✅ Quick Start Checklist

Follow these steps to get Vapi working:

- [ ] Sign up for Vapi account at [vapi.ai](https://vapi.ai)
- [ ] Copy your Private API Key from dashboard
- [ ] Create `.env` file: `cp .env.example .env`
- [ ] Add API key to `.env`: `VITE_VAPI_API_KEY=sk_...`
- [ ] Restart dev server (if running)
- [ ] Test by typing "call me for eviction case" in the chat
- [ ] Check browser console for call status
- [ ] Verify call appears in Vapi dashboard

---

## 🎯 Use Cases in Civic AI

This application uses Vapi for:

### 1. **Eviction Assistance**
When users mention eviction, the AI offers to call them immediately to explain their rights and provide guidance.

### 2. **Court Date Reminders**
Automated calls to remind citizens about upcoming court appearances.

### 3. **Benefits Eligibility**
Voice-guided assistance for SNAP, Medicaid, and other benefit applications.

### 4. **Community Issue Reporting**
Report potholes, broken streetlights, and other 311 issues via voice.

### 5. **Multilingual Support**
Voice AI can speak multiple languages, helping non-English speakers access services.

---

## 💰 Pricing Information

Vapi charges per minute of call time. Typical costs:
- **Voice calls:** ~$0.10-0.30 per minute
- **Includes:** Speech-to-text, LLM processing, text-to-speech
- **Free credits:** New accounts get free credits to test

Check current pricing: [https://vapi.ai/pricing](https://vapi.ai/pricing)

---

## 🚀 What's Next?

Now that Vapi is integrated:

1. ✅ **Add your API key** to `.env`
2. ✅ **Test the integration** with "call me for eviction case"
3. 📞 **Customize phone numbers** in `src/routes/index.tsx` line ~643
4. 🎨 **Customize voice messages** in the `createCall()` parameters
5. 🔊 **Try different voices** from [ElevenLabs voice library](https://elevenlabs.io/voice-library)

**Happy calling!** 📞✨
