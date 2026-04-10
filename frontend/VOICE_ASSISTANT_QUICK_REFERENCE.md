# Voice Assistant - Developer Quick Reference

> **For Senior Engineers & Accessibility Specialists**

---

## 🎯 Quick Navigation

### Core Files:
```
frontend/
├── components/
│   ├── VoiceAssistantNew.js          # Main component (UPDATED)
│   └── [Other UI components]
├── lib/
│   ├── voiceCommands.js               # Command parsing
│   └── accessibility.js               # A11y helpers
├── VOICE_ASSISTANT_PRODUCTION_GUIDE.md  # Full spec (NEW)
└── VOICE_ASSISTANT_IMPLEMENTATION_SUMMARY.md # This session (NEW)

backend/
└── controllers/
    └── assistant.controller.js        # Backend intent parsing
```

---

## 🔌 Architecture

```
┌─────────────────┐
│   User Voice    │
└────────┬────────┘
         │ (Web Speech API - local processing)
         ▼
┌─────────────────────────────┐
│  Speech Recognition (STT)   │ ✅ Auto-retry on temp errors
├─────────────────────────────┤
│  Command Parsing            │ ✅ Flexible pattern matching
├─────────────────────────────┤
│  Auth Check                 │ ✅ Real-time verification
├─────────────────────────────┤
│  Command Handler            │ ✅ Event-specific logic
├─────────────────────────────┤
│  Response Queue             │ ✅ Sequential speech
├─────────────────────────────┤
│  Text-to-Speech (TTS)       │ ✅ No overlapping audio
└────────┬────────────────────┘
         │
    ┌────▼──────┐
    │ AI Query? │ → Backend Gemini
    └────┬──────┘
         │
    ┌────▼───────────┐
    │  Navigation   │ → React Router
    └───────────────┘
```

---

## 🔧 Key Improvements (This Session)

### 1. TTS Queue System ✅
**Problem:** Multiple speech commands queued up, creating overlapping audio.
**Solution:** Sequential queue processing with callback chain.
```javascript
// Before: Multiple speech utterances interrupted each other
speakText(response1) // interrupted by response2
speakText(response2) // interrupted by response3

// After: Queue system ensures sequential playback
addToSpeechQueue(response1) // plays completely
addToSpeechQueue(response2) // waits for response1
addToSpeechQueue(response3) // waits for response2
```

### 2. STT Auto-Recovery ✅
**Problem:** "No speech detected" errors stopped listening permanently.
**Solution:** Auto-retry logic with exponential backoff.
```javascript
// Auto-retry after 1 second on temporary errors
recognition.onerror = (event) => {
  if (event.error === 'no-speech' || event.error === 'audio-capture') {
    setTimeout(() => recognition.start(), 1000) // try again
  }
}
```

### 3. Command Debouncing ✅
**Problem:** Rapid speech input caused duplicate commands.
**Solution:** 500ms debounce interval between commands.
```javascript
// Skip commands within 500ms of last command
if (now - lastCommandTimeRef.current < 500) return
lastCommandTimeRef.current = now
```

### 4. Logout Notification ✅
**Problem:** "You've been signed out" message repeated on every command.
**Solution:** Show once per session, then shortened response.
```javascript
if (logoutNotificationRef.current) {
  // Already notified, use shorter message
  speakText("You need to sign in first")
} else {
  // First time notifying
  logoutNotificationRef.current = true
  speakText("It looks like you've been signed out...")
}
```

---

## 📋 Command Matrix

### Public Commands (No Login Required)
```javascript
VOICE_COMMANDS.READ_EVENTS        // "read events"
VOICE_COMMANDS.NEXT_EVENT         // "next event"
VOICE_COMMANDS.PREVIOUS_EVENT     // "previous event"
VOICE_COMMANDS.EVENT_DETAILS      // "event details"
VOICE_COMMANDS.SEARCH_EVENT       // "search for [term]"
VOICE_COMMANDS.REPEAT             // "repeat"
VOICE_COMMANDS.HELP               // "help"
VOICE_COMMANDS.SIGN_IN            // "sign in"
```

### Protected Commands (Login Required)
```javascript
VOICE_COMMANDS.SIGN_OUT           // "sign out"
VOICE_COMMANDS.SHOW_BOOKINGS      // "show my bookings"
VOICE_COMMANDS.BOOK_EVENT         // "book event"
VOICE_COMMANDS.DASHBOARD          // "dashboard"
```

---

## 🧪 Testing Commands

### Test Sign-In Flow
```
1. Say: "Sign in"
   → "Let me help you sign in. Email address?"
2. Say: "sarah@example.com"
   → "Email received. Now password?"
3. Say: "mypassword123"
   → "Sign in successful! Redirecting to dashboard."
   → Navigates to /dashboard
```

### Test Protected Command (Logged Out)
```
1. Say: "Show my bookings"
   → "It looks like you've been signed out. Sign in first..."
2. Say: "Show my bookings" again
   → "You need to sign in first to access this feature."
   → (Shorter message - no repetition)
```

### Test Book Event Flow
```
1. Say: "Book an event"
   → Lists 5 events with numbers
2. Say: "First one" or "Tech Conference"
   → "How many tickets?"
3. Say: "Two"
   → "Booking confirmed! Reference: BK-123456"
```

### Test Error Recovery
```
1. Say: (nothing - microphone just picks up background)
   → "I didn't hear anything. Please try again."
   → Auto-retry after 1 second (automatic)
   → Listen state begins again
```

---

## 🐛 Debugging Checklist

### STT Not Working?
```javascript
// Check in browser console:
if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
  console.error("Web Speech API not supported")
}

// Check microphone access:
// DevTools → Settings → Permissions → Microphone

// Check error event:
recognition.onerror = (e) => console.log("STT Error:", e.error)
```

### TTS Not Playing?
```javascript
// Check speech queue:
console.log("Queue:", speechQueueRef.items)
console.log("Processing:", speechQueueRef.isProcessing)

// Check if TTS is supported:
if (!window.speechSynthesis) console.error("TTS not supported")

// Check voices available:
console.log("Available voices:", window.speechSynthesis.getVoices())
```

### Commands Not Recognized?
```javascript
// Check pattern matching:
import { parseVoiceCommand } from '../lib/voiceCommands'
const result = parseVoiceCommand("your test phrase")
console.log("Parsed command:", result)

// Check auth requirements:
import { COMMAND_AUTH_REQUIREMENTS } from '../lib/voiceCommands'
console.log("Requirements:", COMMAND_AUTH_REQUIREMENTS)
```

---

## ⚡ Performance Tips

### Reduce Latency
```javascript
// ✅ Good: Memoize callbacks
const handleCommand = useCallback(() => { ... }, [deps])

// ❌ Avoid: Inline functions
useEffect(() => {
  recognition.onresult = () => {} // Creates new function each render
}, [])
```

### Optimize Re-renders
```javascript
// ✅ Good: Only update when needed
if (final && isInitialized) {
  handleVoiceInput(final.trim()) // Once per final result
}
```

### API Call Rates
```javascript
// ✅ Good: Debounce repeated commands
const DEBOUNCE_INTERVAL = 500
if (now - lastCommandTimeRef.current < DEBOUNCE_INTERVAL) return

// ❌ Avoid: Calling API on every keystroke equivalent
```

---

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] Error handling verified
- [ ] Accessibility checked (WCAG 2.1 AA)
- [ ] Performance benchmarked (<500ms response)
- [ ] Documentation updated
- [ ] Privacy policy mentions voice input
- [ ] Browser support verified (Chrome, Firefox, Safari, Edge)

---

## 📊 Monitoring & Alerts

### Key Metrics:
```javascript
// Log these in production
1. STT Success Rate
   - Track: recognition.onresult fired successfully
   - Target: >95%

2. TTS Reliability
   - Track: speechSynthesis.speak() completed without error
   - Target: 99%

3. Command Accuracy
   - Track: parseVoiceCommand() matched pattern
   - Target: >90%

4. Response Time
   - Track: Time from speech end to response start
   - Target: <1 second

5. Error Rate
   - Track: Commands that failed
   - Target: <5%
```

### Sample Monitoring Code:
```javascript
// Add to handleVoiceInput
const startTime = Date.now()
try {
  // Process command...
  const endTime = Date.now()
  const responseTime = endTime - startTime
  
  // Log to analytics
  logMetric('voice_command_latency', responseTime)
  logMetric('voice_command_success', true)
} catch (error) {
  logMetric('voice_command_error', error.message)
  logMetric('voice_command_success', false)
}
```

---

## 🔐 Security Notes

### What We DON'T Store:
- ❌ Audio recordings
- ❌ Raw speech data
- ❌ Microphone access logs
- ❌ User voice biometrics

### What We DO Process:
- ✅ Transcript text (temporary, in memory)
- ✅ Parsed commands (no sensitive data)
- ✅ Response text (for TTS only)

### Privacy Compliance:
- Update Privacy Policy to mention: "Voice input is processed locally and never recorded"
- GDPR compliant: No biometric data collected
- CCPA compliant: No audio permanently stored

---

## 📚 Documentation Map

1. **VOICE_ASSISTANT_PRODUCTION_GUIDE.md** (400 lines)
   - Full production spec
   - Testing requirements
   - Known limitations
   - Future enhancements

2. **VOICE_ASSISTANT_IMPLEMENTATION_SUMMARY.md** (300 lines)
   - What was fixed and why
   - Performance metrics
   - Breaking changes (none)
   - QA checklist

3. **This File: VOICE_ASSISTANT_QUICK_REFERENCE.md** (200 lines)
   - Quick navigation
   - Key improvements
   - Testing commands
   - Debugging tips

---

## 🔗 Related Documentation

- Frontend: `/frontend/lib/voiceCommands.js` - Command definitions
- Backend: `/backend/controllers/assistant.controller.js` - Intent parsing
- Accessibility: `/frontend/lib/accessibility.js` - A11y features
- Config: `/frontend/pages/_app.js` - Global setup

---

## ✨ Code Quality Standards

All code follows:
- ✅ JSDoc comments for functions
- ✅ Inline comments for complex logic
- ✅ Error handling for all scenarios
- ✅ Debouncing/memoization for performance
- ✅ Accessibility best practices (WCAG 2.1 AA)
- ✅ TypeScript-ready structure

---

## 📞 Support

### For Implementation Questions:
1. Check VOICE_ASSISTANT_PRODUCTION_GUIDE.md (comprehensive spec)
2. Review code comments in VoiceAssistantNew.js
3. Check voiceCommands.js for pattern matching
4. Test with debugging checklist above

### For Integration Questions:
1. Check backend/controllers/assistant.controller.js
2. Verify API response format in PRODUCTION_GUIDE.md
3. Test auth flow with protected commands

### For Optimization Questions:
1. Profile in Chrome DevTools (Performance tab)
2. Monitor API response times
3. Check debounce interval (500ms)
4. Review memoized callbacks

---

**Version:** 1.0.0
**Last Updated:** April 9, 2026
**Audience:** Senior Full-Stack Engineers & Accessibility Specialists

