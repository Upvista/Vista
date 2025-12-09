# Vista AI - AI Companion Robot

**Vista AI** - An interactive AI companion robot with animated face, voice conversation, and emotions.  
Developed by **Hamza Hafeez**  
Built with Next.js and PWA support.

## Features

- 🤖 **Animated Robot Face** - Beautiful cyan-glowing eyes with emotion animations
- 🎤 **Voice Recognition** - Speech-to-text using Web Speech API
- 🗣️ **Text-to-Speech** - Natural voice responses
- 🧠 **AI Brain** - Real LLM processing (Multiple free API options)
- 😊 **Emotion Detection** - Robot face expresses emotions based on conversation
- 📱 **PWA Support** - Install on mobile devices
- 🎨 **Beautiful UI** - Futuristic design with glowing effects
- 📱 **Auto-Animations** - Face automatically blinks and shows emotions
- 👆 **Click to Chat** - Click the face to start conversations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up AI API for better responses:
   - Copy `.env.local.example` to `.env.local`
   - Add API keys (see options below)

3. Create PWA icons (192x192 and 512x512):
   - Place `icon-192.png` and `icon-512.png` in the `public` folder
   - Or use online tools like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge browser

## Free AI API Options

The app works with **multiple FREE AI APIs**. Choose one or use all:

### Option 1: Groq (Recommended ⭐)
- **Why**: Very fast, free tier, great models
- **Sign up**: https://console.groq.com/
- **Get API key**: https://console.groq.com/keys
- **Add to `.env.local`**: `GROQ_API_KEY=your_key_here`
- **Models**: Llama 3.1, Mixtral, etc.

### Option 2: Google Gemini
- **Why**: Good free tier, reliable
- **Sign up**: https://makersuite.google.com/app/apikey
- **Add to `.env.local`**: `GEMINI_API_KEY=your_key_here`
- **Models**: Gemini Pro

### Option 3: Hugging Face (No API key needed!)
- **Why**: Works without API key (free tier)
- **Optional**: Get API key for faster responses: https://huggingface.co/settings/tokens
- **Add to `.env.local`**: `HUGGINGFACE_API_KEY=your_key_here` (optional)
- **Models**: DialoGPT, Mistral, Llama 2

### Fallback Mode
- If no API keys are set, the app uses simple pattern matching
- Still works, but responses are basic
- Perfect for testing without API setup

## Usage

1. **Auto-Animations**: The face automatically blinks and shows random emotions
2. **Start Conversation**: Click on the robot face
3. **Speak**: The robot will listen when you see it's in listening mode
4. **Response**: AI processes your message and responds with voice
5. **Emotions**: Watch the robot face express emotions based on the conversation

## Browser Support

- ✅ Chrome/Edge (recommended) - Full voice support
- ⚠️ Firefox - Limited voice support
- ❌ Safari - No voice recognition support

## Project Structure

```
├── app/
│   ├── components/
│   │   └── RobotFace.tsx      # Animated robot face component
│   ├── hooks/
│   │   └── useVoiceInterface.ts # Voice recognition & TTS hook
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Backend API with multiple LLM options
│   ├── page.tsx                # Main page (just the face!)
│   ├── layout.tsx              # Root layout with PWA config
│   └── globals.css             # Styles and animations
├── public/
│   ├── manifest.json           # PWA manifest (landscape mode)
│   ├── icon-192.png           # PWA icon (192x192)
│   └── icon-512.png           # PWA icon (512x512)
└── .env.local                  # API keys (create this file)
```

## PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. The app will install as a standalone app

### Mobile (iOS)
1. Open the app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App will open in landscape mode

### Mobile (Android)
1. Open the app in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home Screen"
4. App will open in landscape mode

## Customization

### Change AI Provider
Edit `app/api/chat/route.ts` and modify the `getAIResponse()` function priority.

### Emotions
Edit `app/components/RobotFace.tsx` to customize emotion animations and colors.

### Voice Settings
Modify `app/hooks/useVoiceInterface.ts` to adjust speech rate, pitch, and volume.

## Troubleshooting

### Voice not working?
- Make sure you're using Chrome or Edge
- Check microphone permissions in browser settings
- Try refreshing the page

### AI responses are simple/basic?
- Set up an API key (see Free AI API Options above)
- Check that `.env.local` file exists and has correct API keys
- Restart the dev server after adding API keys

### PWA not installing?
- Make sure you have icons in the `public` folder
- Check browser console for errors
- Verify `manifest.json` is accessible

## API Response Priority

The app tries APIs in this order:
1. **Groq** (if `GROQ_API_KEY` is set)
2. **Gemini** (if `GEMINI_API_KEY` is set)
3. **Hugging Face** (works without key, may be slower)
4. **Simple fallback** (always works)

## Future Enhancements

- [ ] Conversation history
- [ ] Multiple languages
- [ ] Custom voice selection
- [ ] Settings panel
- [ ] More emotion animations

## License

MIT

## Credits

- Robot face design inspired by futuristic UI concepts
- Built with Next.js, React, and TypeScript
- Voice features using Web Speech API
- AI powered by free LLM APIs
