import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 1.05
  utter.pitch = 1
  window.speechSynthesis.speak(utter)
}

export default function VoiceAssistant() {
  const router = useRouter()
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore()

  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // idle | listening | thinking | success | error
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const [showPanel, setShowPanel] = useState(false)

  const recognitionRef = useRef(null)
  const dismissTimerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setListening(true)
      setStatus('listening')
      setTranscript('')
      setReply('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
        else interim += event.results[i][0].transcript
      }
      setTranscript(final || interim)
      if (final && isInitialized) sendToAI(final.trim())
    }

    recognition.onerror = (e) => {
      setListening(false)
      if (e.error === 'no-speech') {
        setReply("I didn't hear anything — try again!")
        setStatus('error')
      } else {
        setReply(`Mic error: ${e.error}`)
        setStatus('error')
      }
      autoDismiss(2000)
    }

    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => recognition.abort()
  }, []) // eslint-disable-line

  const autoDismiss = useCallback((ms = 5000) => {
    clearTimeout(dismissTimerRef.current)
    dismissTimerRef.current = setTimeout(() => {
      setShowPanel(false)
      setStatus('idle')
      setTranscript('')
      setReply('')
    }, ms)
  }, [])

  const executeAction = useCallback((action, params) => {
    // Prevent multiple rapid navigation calls during transitions
    if (router.isFallback) return
    
    switch (action) {
      case 'search':
        if (params.query) {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'search', query: params.query } }))
          if (router.pathname !== '/') router.push('/')
        } else {
          if (router.pathname !== '/events') {
            router.push('/events')
          }
        }
        break
      case 'filter_category':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'category', category: params.category } }))
        if (router.pathname !== '/') router.push('/')
        break
      case 'navigate':
        // Avoid redundant navigation
        if (router.pathname !== params.path) {
          router.push(params.path)
        }
        break
      case 'clear':
        window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'clear' } }))
        break
      case 'create_event_form':
        router.push('/dashboard/events/create')
        break
      case 'book_event':
        // Dispatch with booking intent — page will handle
        window.dispatchEvent(new CustomEvent('voice-command', {
          detail: { action: 'book', eventId: params.eventId, tickets: params.tickets || 1 }
        }))
        router.push(`/events/${params.eventId}`)
        break
      case 'cancel_booking':
        window.dispatchEvent(new CustomEvent('voice-command', {
          detail: { action: 'cancel_booking', bookingId: params.bookingId }
        }))
        break
      case 'get_event_info':
        if (params.eventId) router.push(`/events/${params.eventId}`)
        break
      case 'login':
        if (router.pathname !== '/auth/login') {
          router.push('/auth/login').then(() => {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'fill_login_form', email: params.email, password: params.password } }))
            }, 500)
          })
        } else {
          window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'fill_login_form', email: params.email, password: params.password } }))
        }
        break
      case 'logout':
        logout()
        if (router.pathname !== '/') router.push('/')
        break
      case 'speak_only':
      default:
        break
    }
  }, [router])

  const sendToAI = useCallback(async (text) => {
    if (!isInitialized) {
      setReply("Please wait while I load your profile...")
      setStatus('error')
      speak("Please wait while I load your profile")
      autoDismiss(1500)
      return
    }

    setLoading(true)
    setStatus('thinking')

    try {
      // Add timeout wrapper to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000) // 12s timeout

      const res = await fetch(`${API_URL}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          page: router.pathname,
          isAuthenticated,
          user: user ? { id: user.id, full_name: user.full_name, role: user.role } : null
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      const aiReply = data.reply || "Got it!"

      setReply(aiReply)
      setStatus('success')
      speak(aiReply)
      executeAction(data.action, data.params || {})

      // longer dismiss for conversational replies
      autoDismiss(data.action === 'speak_only' ? 3500 : 2500)
    } catch (error) {
      let msg = "I'm having trouble connecting right now. Please try again."
      if (error.name === 'AbortError') {
        msg = "Request timed out. Is your internet working?"
      }
      setReply(msg)
      setStatus('error')
      speak(msg)
      autoDismiss(2500)
    } finally {
      setLoading(false)
    }
  }, [router, isAuthenticated, isInitialized, user, executeAction, autoDismiss])

  const toggleListening = () => {
    if (!supported) return
    if (!isInitialized) {
      setReply("Loading your profile... try again in a moment")
      setStatus('error')
      setShowPanel(true)
      autoDismiss(1500)
      return
    }
    if (listening) {
      recognitionRef.current?.abort()
      setListening(false)
      setShowPanel(false)
      clearTimeout(dismissTimerRef.current)
      return
    }
    setShowPanel(true)
    clearTimeout(dismissTimerRef.current)
    try { recognitionRef.current?.start() } catch { /* already started */ }
  }

  // ── Unsupported browser ──────────────────────────────────────────────────────
  if (!supported) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          className="w-14 h-14 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-lg cursor-not-allowed"
          title="Voice assistant requires Chrome or Edge"
        >
          <MicOffIcon />
        </button>
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 w-52 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Voice assistant requires Chrome or Edge.
        </div>
      </div>
    )
  }

  // ── Status color helpers ─────────────────────────────────────────────────────
  const dotColor = {
    listening: 'bg-red-500 animate-pulse',
    thinking: 'bg-amber-400 animate-pulse',
    success: 'bg-green-500',
    error: 'bg-orange-400',
  }[status] || 'bg-indigo-400'

  const statusLabel = {
    listening: 'Listening…',
    thinking: 'Thinking…',
    success: 'Done!',
    error: 'Hmm…',
  }[status] || 'EventsApp Assistant'

  const replyColor = {
    success: 'text-emerald-700',
    error: 'text-orange-500',
    thinking: 'text-amber-600',
  }[status] || 'text-gray-700'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Response panel ── */}
      {showPanel && (
        <div style={{ animation: 'va-slide-up 0.22s ease' }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-80">

          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
              <span className="text-sm font-semibold text-gray-700">{statusLabel}</span>
            </div>
            <button
              onClick={() => {
                setShowPanel(false)
                setStatus('idle')
                clearTimeout(dismissTimerRef.current)
                if (listening) recognitionRef.current?.abort()
              }}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2"
            >×</button>
          </div>

          {/* Sound-wave animation */}
          {status === 'listening' && (
            <div className="flex items-end justify-center gap-1 h-8 my-2">
              {[0.5, 0.8, 1, 0.7, 1, 0.6, 0.9].map((h, i) => (
                <div key={i} className="w-1 bg-red-400 rounded-full"
                  style={{ height: `${h * 100}%`, animation: `va-wave 0.9s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}

          {/* Thinking spinner */}
          {status === 'thinking' && (
            <div className="flex items-center justify-center gap-1.5 my-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-amber-400 rounded-full"
                  style={{ animation: `va-bounce 1s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <p className="text-xs text-gray-400 italic mb-2 line-clamp-2">
              "{transcript}"
            </p>
          )}

          {/* AI reply */}
          {reply && (
            <p className={`text-sm font-medium leading-snug ${replyColor}`}>{reply}</p>
          )}

          {/* Tip while idle/listening with no response yet */}
          {status === 'listening' && !transcript && (
            <p className="text-xs text-gray-400 mt-2">
              Try: "Find music events near me" · "Show my bookings" · "Create a new event"
            </p>
          )}

          {/* Powered by badge */}
          <p className="text-[10px] text-gray-300 mt-3 text-right tracking-wide">
            ✦ Powered by Gemini AI
          </p>
        </div>
      )}

      {/* ── Mic button ── */}
      <button
        onClick={toggleListening}
        title={listening ? 'Stop' : 'Ask the EventsApp assistant'}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
          listening
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-200 scale-110'
            : loading
            ? 'bg-amber-500 focus:ring-amber-200 cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200 hover:scale-105'
        }`}
      >
        {listening ? <StopIcon /> : loading ? <SpinnerIcon /> : <MicIcon />}
        {listening && (
          <span className="absolute inset-0 w-full h-full rounded-full bg-red-400 animate-ping opacity-40" />
        )}
      </button>

      <style>{`
        @keyframes va-slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes va-wave {
          0%, 100% { transform: scaleY(0.35); }
          50%       { transform: scaleY(1); }
        }
        @keyframes va-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────
function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
}
