# 🎤 Aimybox Voice Assistant Integration Guide

## Overview

This guide explains how to integrate the new **Aimybox-based voice assistant** into your events web application. The solution is completely **free**, using:

- **Speech-to-Text (STT)**: Browser Web Speech API (no signup required)
- **Text-to-Speech (TTS)**: Browser SpeechSynthesis API (built-in)
- **Voice Commands**: Custom command parser for immediate response
- **AI Fallback**: Gemini API for complex queries (optional, existing setup)

---

## 🚀 Quick Start

### 1. Update Your Layout Component

Replace the old voice assistant with the new one in [frontend/components/Layout.js](frontend/components/Layout.js):

```jsx
// OLD
import VoiceAssistant from './VoiceAssistant'

// NEW
import VoiceAssistantNew from './VoiceAssistantNew'
import { AriaAnnouncer, setupAllAccessibilityFeatures } from '../lib/accessibility'

export default function Layout({ children }) {
  useEffect(() => {
    setupAllAccessibilityFeatures()
  }, [])

  return (
    <>
      <AriaAnnouncer />
      <Navbar />
      <main>{children}</main>
      <VoiceAssistantNew />
      <Footer />
    </>
  )
}
```

### 2. Package Dependencies

All required packages are already in your project:

- `next` - Page routing
- `react` - UI components
- **No need to install anything new!**

### 3. Start Your Application

```bash
npm run dev
```

The voice assistant will be available as a floating **microphone button** in the bottom-right corner.

---

## 📋 Supported Voice Commands (MVP)

The voice assistant recognizes these commands:

| Command | Alternatives | Action |
|---------|-----------|--------|
| **"Read events"** | "Show events", "List events" | Fetches and announces upcoming events |
| **"Next event"** | "Go next", "Show next" | Moves to next event in list |
| **"Previous event"** | "Go back", "Back", "Previous" | Goes to previous event |
| **"Event details"** | "Tell me about it", "Details" | Reads full event description |
| **"Show my bookings"** | "My bookings", "Bookings" | Lists user's reservations (requires login) |
| **"Search for X"** | "Find X", "Look for X" | Searches for event by name |
| **"Repeat"** | "Say again", "Could you repeat" | Repeats last assistant response |
| **"Help"** | "What can you do" | Lists available commands |

---

## 🎯 Technical Architecture

### Frontend Structure

```
frontend/
├── components/
│   ├── VoiceAssistantNew.js          ← Main voice component (replaces old)
│   └── Layout.js                      ← Updated to use new component
├── lib/
│   ├── voiceCommands.js               ← Command parsing & responses
│   └── accessibility.js               ← A11y features & enhancements
└── pages/
    └── _app.js                        ← Initialize accessibility features
```

### Voice Assistant Flow

```
User speaks
    ↓
Web Speech API (recognizes speech)
    ↓
parseVoiceCommand() - Matches command intent
    ↓
┌─────────────────────┐
│ Is it a built-in    │
│ command (Read       │ YES → buildVoiceResponse()
│ Events, etc)?       │       ↓
└─────────────────────┘      SpeechSynthesis API
        │ NO                  ↓
        ↓                 User hears response
    Send to backend
    /api/assistant
        ↓
    Gemini API (if complex)
        ↓
    buildVoiceResponse()
        ↓
    SpeechSynthesis API
        ↓
    User hears response
```

### Backend Integration

**Endpoint**: `POST /api/assistant`

**Request Format** (new, backward compatible):

```json
{
  "query": "read events",
  "context": {
    "isAuthenticated": true,
    "userRole": "user",
    "page": "/events",
    "previousResponse": "Here are the events..."
  }
}
```

**Legacy format still supported**:

```json
{
  "transcript": "read events",
  "page": "/",
  "isAuthenticated": false,
  "user": null
}
```

**Response Format**:

```json
{
  "action": "speak_only",
  "params": {},
  "reply": "Here are the upcoming events..."
}
```

---

## 🔊 Speech Synthesis Configuration

The voice assistant uses the browser's native `SpeechSynthesis` API with sensible defaults:

### Customization

In [frontend/components/VoiceAssistantNew.js](frontend/components/VoiceAssistantNew.js), modify the `speakText()` function:

```javascript
function speakText(text, options = {}) {
  const utterance = new SpeechSynthesisUtterance(text)
  
  utterance.rate = options.rate || 1.0      // 0.5 = slow, 1.5 = fast
  utterance.pitch = options.pitch || 1.0    // 0.5 = low, 2.0 = high
  utterance.volume = options.volume || 1.0  // 0-1
  
  window.speechSynthesis.speak(utterance)
}
```

### Voice Selection

```javascript
// Select specific voice (if available)
const voices = window.speechSynthesis.getVoices()
utterance.voice = voices[0] // Change index to use different voice
```

---

## 🎨 Customizing the UI

### Voice Panel Styling

Modify the panel appearance in [frontend/components/VoiceAssistantNew.js](frontend/components/VoiceAssistantNew.js):

```jsx
<div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl z-40 p-6">
  {/* Customize colors, size, position, etc. */}
</div>
```

### Microphone Button Status Colors

```jsx
className={`fixed bottom-6 right-6 rounded-full p-4 transition-all ${
  status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
}`}
```

- **Blue** - Ready to listen
- **Red (pulsing)** - Actively listening
- **Yellow** - Processing
- **Green** - Speaking response
- **Red (solid)** - Error

---

## ♿ Accessibility Features

### Built-in Features

1. **Screen Reader Support**
   - ARIA live regions for announcements
   - Semantic HTML structure
   - Role attributes for context

2. **Keyboard Navigation**
   - Press **M** to toggle microphone
   - **Tab** to navigate between controls
   - **Enter** to confirm actions

3. **Auto-read Content**
   - Page headings announced on load
   - Status updates announced automatically
   - Error messages pronounced

4. **High Contrast Mode**
   - Respects `prefers-contrast: more`
   - Enhanced borders and text

5. **Reduced Motion**
   - Respects `prefers-reduced-motion: reduce`
   - Disables animations for users who prefer it

6. **Dark Mode Support**
   - Detects `prefers-color-scheme: dark`
   - Automatically adjusts colors

### Using Accessibility Features

In your `_app.js`:

```javascript
import { setupAllAccessibilityFeatures } from '../lib/accessibility'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    setupAllAccessibilityFeatures()
  }, [])

  return <Component {...pageProps} />
}
```

---

## 🔌 Extending the Voice Commands

### Add a New Command

Edit [frontend/lib/voiceCommands.js](frontend/lib/voiceCommands.js):

```javascript
// 1. Add to VOICE_COMMANDS enum
export const VOICE_COMMANDS = {
  // ... existing commands
  MY_NEW_COMMAND: 'my new command',
}

// 2. Add pattern match in parseVoiceCommand()
if (/my pattern|other pattern/i.test(lower)) {
  return {
    command: VOICE_COMMANDS.MY_NEW_COMMAND,
    parameters: { /* any params */ }
  }
}

// 3. Add response builder in buildVoiceResponse()
case VOICE_COMMANDS.MY_NEW_COMMAND:
  return `Response text here`
```

### Example: Add "Show Weather"

```javascript
// In voiceCommands.js
SHOW_WEATHER: 'show weather',

// In parseVoiceCommand()
if (/weather|forecast|how is it outside/i.test(lower)) {
  return {
    command: VOICE_COMMANDS.SHOW_WEATHER,
    parameters: {}
  }
}

// In buildVoiceResponse()
case VOICE_COMMANDS.SHOW_WEATHER:
  return `Today's weather is sunny with a high of 72 degrees.`
```

---

## 🔍 Debugging

### Enable Console Logs

In [frontend/components/VoiceAssistantNew.js](frontend/components/VoiceAssistantNew.js):

```javascript
const handleVoiceInput = async (voiceText) => {
  console.log('[Voice] Input:', voiceText)
  const { command, parameters } = parseVoiceCommand(voiceText)
  console.log('[Voice] Command:', command, 'Params:', parameters)
  // ... rest of function
}
```

### Browser DevTools

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Try speaking commands
4. Watch logs for parsing results

### Common Issues

| Issue | Solution |
|-------|----------|
| Microphone not working | Check browser permissions (Settings → Privacy → Mic) |
| "Didn't hear anything" | Wait for beep, speak clearly ~1 meter from mic |
| No voice output | Enable speakers, check system volume, verify browser supports SpeechSynthesis |
| Commands not recognized | Check command spelling, ensure full phrase is stated |

---

## 📱 Browser Support

### Speech Recognition (Web Speech API)

✅ **Supported**:
- Chrome/Edge 25+
- Firefox 25+ (varies by region)
- Safari 14.1+
- Opera 27+

❌ **Not Supported**:
- Internet Explorer
- Opera Mini

### Speech Synthesis (SpeechSynthesis API)

✅ **Supported**:
- All modern browsers (Chrome, Firefox, Safari, Edge)

Fallback to text display if unsupported.

---

## 🎓 Advanced Usage

### Custom Event Data Fetching

Modify `handleVoiceInput()` in [frontend/components/VoiceAssistantNew.js](frontend/components/VoiceAssistantNew.js):

```javascript
if (command === VOICE_COMMANDS.READ_EVENTS) {
  // Custom API call
  const response = await fetch(`${API_URL}/events?limit=10&category=music`)
  const data = await response.json()
  
  // Custom response building
  const eventTitles = data.data.map(e => e.title).join(', ')
  const response = `Found music events: ${eventTitles}`
  
  speakText(response)
}
```

### Multilingual Support

To add another language (e.g., Spanish):

```javascript
// In VoiceAssistantNew.js
recognition.lang = 'es-ES' // Spanish

// Add to voiceCommands.js
export const VOICE_COMMANDS_ES = {
  READ_EVENTS: 'leer eventos',
  NEXT_EVENT: 'siguiente evento',
  // ...
}
```

### Context Awareness

Pass additional context to backend:

```javascript
const response = await fetch(`${API_URL}/assistant`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userInput,
    context: {
      isAuthenticated,
      userRole: user?.role,
      page: router.pathname,
      previousResponse: lastResponse,
      customData: { /* add any custom context */ }
    }
  })
})
```

---

## 🚢 Deployment

### No Changes Required

The voice assistant uses:
- ✅ Browser APIs (no server-side changes)
- ✅ Existing backend endpoint
- ✅ Existing dependencies

Just deploy as normal:

```bash
npm run build
npm start
```

### Environment Variables

No new environment variables needed. Existing ones should work:

```
NEXT_PUBLIC_API_URL=http://localhost:3002/api
GEMINI_API_KEY=your-key (for AI fallback)
```

---

## 📚 Files Modified/Created

### New Files Created

```
frontend/lib/voiceCommands.js        ← Command parsing & responses
frontend/lib/accessibility.js         ← A11y enhancements
frontend/components/VoiceAssistantNew.js ← Main voice component
```

### Modified Files

```
frontend/components/Layout.js         ← Import new component
backend/controllers/assistant.controller.js ← Support new request format
```

### Deprecated (Keep for Reference)

```
frontend/components/VoiceAssistant.js ← Old implementation (can delete)
```

---

## 🆘 Support & Troubleshooting

### Check Browser Compatibility

```javascript
// Test if speech recognition is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
if (!SpeechRecognition) {
  console.error('Speech Recognition not supported')
}

// Test if speech synthesis is available
if (!window.speechSynthesis) {
  console.error('Speech Synthesis not supported')
}
```

### Test Microphone Access

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Mic access granted'))
  .catch(err => console.error('Mic access denied:', err))
```

### Monitor Network Traffic

Open DevTools → Network tab to monitor:
- `/api/events` calls (when fetching events)
- `/api/bookings` calls (when fetching bookings)
- `/api/assistant` calls (when sending complex queries to AI)

---

## ✨ Future Enhancements

### Potential Improvements

1. **Wake Word Detection**
   - Detect "Hey Assistant" to start listening
   - Reduce need to click microphone button

2. **Offline TTS**
   - Use Piper or RHVoice for offline voice synthesis
   - No network dependency

3. **Voice Profile Training**
   - Personalize recognition for individual users
   - Better accuracy over time

4. **Multi-language Support**
   - Detect and switch between languages
   - Full multilingual responses

5. **Voice Shortcuts**
   - Create custom voice commands
   - Personalized macros

---

## 📖 References

### Browser APIs

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  - `SpeechRecognition` - Speech-to-text
  - `SpeechSynthesisUtterance` - Text-to-speech

- [ARIA (Accessibility)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
  - Live regions
  - Roles & properties

### Related Code

- [Voice Commands Handler](frontend/lib/voiceCommands.js)
- [Accessibility Utils](frontend/lib/accessibility.js)
- [Main Component](frontend/components/VoiceAssistantNew.js)
- [Backend Endpoint](backend/controllers/assistant.controller.js)

---

## 🎉 Next Steps

1. **Test locally** - Run `npm run dev` and try voice commands
2. **Customize commands** - Add your own in `voiceCommands.js`
3. **Enhance accessibility** - Test with screen readers (e.g., NVDA)
4. **Deploy** - Use existing deployment pipeline
5. **Gather feedback** - Get user feedback on voice usability

---

**Happy voice commanding! 🎤✨**
