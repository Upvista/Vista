# Setup Guide: Groq + Gemini APIs

This guide will help you set up both Groq and Gemini APIs for your AI Companion Robot.

## Quick Setup Steps

### Step 1: Get Groq API Key (Primary - Recommended)

1. **Sign up for Groq**:
   - Go to: https://console.groq.com/
   - Click "Sign Up" or "Get Started"
   - Create an account (free)

2. **Create API Key**:
   - After logging in, go to: https://console.groq.com/keys
   - Click "Create API Key"
   - Copy the API key (starts with `gsk_...`)
   - ⚠️ Save it immediately - you can't see it again!

3. **Free Tier Limits**:
   - 14,400 requests per day
   - Very fast responses
   - Multiple model options

### Step 2: Get Gemini API Key (Secondary Fallback)

1. **Sign up for Google AI Studio**:
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**:
   - Click "Create API Key"
   - Select "Create API key in new project" (or existing project)
   - Copy the API key (starts with `AIza...`)
   - ⚠️ Save it immediately!

3. **Free Tier Limits**:
   - 1,500 requests per day
   - Good quality responses
   - Multiple model options

### Step 3: Configure Your App

1. **Create `.env.local` file** in your project root:
   ```bash
   # In the project root (D:\code\db\.env.local)
   ```

2. **Add your API keys**:
   ```env
   # Groq API (Primary - Fast and Free)
   GROQ_API_KEY=gsk_your_groq_key_here

   # Gemini API (Secondary Fallback)
   GEMINI_API_KEY=AIza_your_gemini_key_here

   # Hugging Face API (Optional - for tertiary fallback)
   # Get from: https://huggingface.co/settings/tokens
   # HUGGINGFACE_API_KEY=your_hf_key_here
   ```

3. **Save the file** (`.env.local`)

4. **Restart your dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## How It Works

The app tries APIs in this order:

1. **Groq** → If it works, use it (fastest!)
2. **Gemini** → If Groq fails or rate limited, try Gemini
3. **Hugging Face** → If both fail, try HF (works without key)
4. **Simple Fallback** → Last resort (always works)

## Testing

1. Start the app: `npm run dev`
2. Open: http://localhost:3000
3. Click the robot face
4. Say something like "Hello, how are you?"
5. Check the browser console (F12) to see which API was used:
   - `Trying Groq API...` → `✓ Groq API success`
   - `Trying Gemini API...` → `✓ Gemini API success`

## Troubleshooting

### "API key not found"
- Make sure `.env.local` file exists in project root
- Check API key is correct (no spaces, correct format)
- Restart dev server after adding keys

### "Rate limit exceeded"
- Groq: 14,400/day - should be enough
- Gemini: 1,500/day - may hit limit with heavy use
- The app automatically falls back to next API

### APIs not working
- Check internet connection
- Verify API keys are correct
- Check browser console for detailed errors
- The app will fall back to simple responses if all fail

## API Comparison

| Feature | Groq | Gemini | Hugging Face |
|---------|------|--------|--------------|
| Speed | ⚡ Very Fast | ⚡ Fast | 🐌 Slow |
| Free Tier | 14,400/day | 1,500/day | Unlimited |
| Setup | Easy | Easy | No key needed |
| Quality | Great | Excellent | Good |
| Best For | Primary | Fallback | Last Resort |

## Security Notes

- ⚠️ Never commit `.env.local` to Git (it's already in `.gitignore`)
- ⚠️ Never share your API keys publicly
- ⚠️ API keys are server-side only (not exposed to browser)

## Need Help?

- **Groq Docs**: https://console.groq.com/docs
- **Gemini Docs**: https://ai.google.dev/docs
- **Check server logs**: Look at terminal where `npm run dev` is running

## Optional: Hugging Face API Key

Hugging Face works without an API key, but adding one makes it faster:

1. Go to: https://huggingface.co/settings/tokens
2. Create a token (read access)
3. Add to `.env.local`: `HUGGINGFACE_API_KEY=your_token`

---

**That's it!** Your robot now has a smart AI brain with multiple fallback options! 🤖🧠

