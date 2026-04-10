# 🎤 Voice Assistant - Quick Reference

## 🚀 Start Using (30 seconds)

```bash
npm run dev
# Click blue microphone button in bottom-right
# Say: "Read events"
```

---

## 📁 Key Files

| File | Purpose | Edit If |
|------|---------|---------|
| [VoiceAssistantNew.js](frontend/components/VoiceAssistantNew.js) | Main component | Add UI or change behavior |
| [voiceCommands.js](frontend/lib/voiceCommands.js) | Commands & responses | Add/modify commands |
| [accessibility.js](frontend/lib/accessibility.js) | A11y features | Enhance accessibility |
| [Layout.js](frontend/components/Layout.js) | Integration | Move voice assistant location |
| [assistant.controller.js](backend/controllers/assistant.controller.js) | Backend API | Complex AI logic |

---

## 🎙️ Voice Commands Reference

```bash
"Read events"              → List upcoming events
"Next event"               → Move to next event
"Previous event"           → Go to previous event  
"Event details"            → Full event description
"Show my bookings"         → View your reservations (login required)
"Search for [name]"        → Find specific event
"Repeat"                   → Repeat last response
"Help"                     → Show all commands
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **M** | Toggle microphone (when not in input field) |
| **Tab** | Navigate voice panel controls |
| **Enter** | Send text input |

---

## 🔧 Common Customizations

### 1. Change Button Color
```javascript
// In VoiceAssistantNew.js, line ~290
status === 'listening' 
  ? 'bg-red-500'        // ← Change this
  : 'bg-blue-600'       // ← Or this
```

### 2. Change Voice Speed
```javascript
// In VoiceAssistantNew.js, line ~33
utterance.rate = 0.8  // 0.5=slow, 1.5=fast
```

### 3. Add New Command
```javascript
// In voiceCommands.js

// 1. Add pattern in parseVoiceCommand()
if (/my pattern/i.test(lower)) {
  return { command: 'MY_CMD', parameters: {} }
}

// 2. Add response in buildVoiceResponse()
case 'MY_CMD':
  return 'Your response here'
```

### 4. Change Panel Position
```jsx
// In VoiceAssistantNew.js, line ~370
<div className="fixed bottom-24 right-6 ...">
{/*           ↑ vertical    ↑ horizontal */}
```

---

## 🧪 Testing Commands

### Test in Browser Console
```javascript
// Test speech recognition availability
window.SpeechRecognition || window.webkitSpeechRecognition
// → returns constructor if available

// Test speech synthesis
new SpeechSynthesisUtterance('Hello')
window.speechSynthesis.speak(...)
// → should hear "Hello"

// Parse a command
import { parseVoiceCommand } from '../lib/voiceCommands'
parseVoiceCommand('read events')
// → { command: 'read events', parameters: { count: 5 } }
```

---

## 🐛 Debug Mode

Add logging to see what's happening:

```javascript
// In VoiceAssistantNew.js handleVoiceInput()
const handleVoiceInput = async (voiceText) => {
  console.log('🎤 INPUT:', voiceText)
  const { command, parameters } = parseVoiceCommand(voiceText)
  console.log('📝 COMMAND:', command)
  console.log('📦 PARAMS:', parameters)
  // ... rest
}
```

Then check browser DevTools Console (F12 → Console tab)

---

## 📱 Browser Support

✅ **Full Support**: Chrome, Firefox, Safari, Edge  
⚠️ **Partial**: Opera  
❌ **No Support**: IE 11

---

## 🎯 API Reference

### speakText(text, options)
```javascript
import { speakText } from './VoiceAssistantNew'

speakText('Hello world', {
  rate: 1.0,    // 0.5-2.0
  pitch: 1.0,   // 0.0-2.0
  volume: 1.0   // 0.0-1.0
})
```

### parseVoiceCommand(transcript)
```javascript
import { parseVoiceCommand } from './lib/voiceCommands'

const { command, parameters } = parseVoiceCommand('read events')
// command: 'read events'
// parameters: { count: 5 }
```

### buildVoiceResponse(command, data)
```javascript
import { buildVoiceResponse } from './lib/voiceCommands'

const response = buildVoiceResponse('read events', {
  events: [{ title: 'Concert', date: '2024-12-25' }]
})
// → "Here are the upcoming events..."
```

---

## 🚢 Deployment

**No configuration needed!** Just:
```bash
npm run build
npm start
```

---

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| Mic not working | Check browser permissions |
| No voice output | Unmute speakers, check browser volume |
| Commands ignored | Speak clearly, wait for beep |
| Backend error | Check `NEXT_PUBLIC_API_URL` env var |
| Unsupported browser | Use Chrome, Firefox, or Safari |

---

## 📞 Quick Links

- [Full Setup Guide](VOICE_ASSISTANT_SETUP.md)
- [Implementation Details](IMPLEMENTATION_SUMMARY.md)
- [Advanced Examples](frontend/lib/voiceCommandsExtended.js)
- [Web Speech API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 💡 Pro Tips

1. **Test with real users** - Different accents/speech patterns
2. **Add command variants** - "read events", "show events", "list events"
3. **Use clear feedback** - Announce what the assistant understood
4. **Handle errors gracefully** - Don't crash on unrecognized input
5. **Mobile first** - Test on iOS/Android
6. **Accessibility first** - Always provide keyboard + text alternatives

---

## 🎉 You're All Set!

Run: `npm run dev`  
Click the 🎤 button  
Say: "Read events"  
Done! ✨

For more help, see [VOICE_ASSISTANT_SETUP.md](VOICE_ASSISTANT_SETUP.md)
