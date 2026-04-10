import { supabase } from '../config/supabase.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=';
const REQUEST_TIMEOUT = 11000; // 11s timeout for Gemini API (matches 12s client timeout minus buffer)
const MAX_RETRIES = 1; // Reduce retries to save time
let eventCache = { data: [], timestamp: 0, ttl: 300000 }; // 5-min cache

// ── Session cache for conversation context ────────────────────────────────────
const sessionCache = new Map(); // userId -> { messages: [], timestamp, context: {} }

const getCachedSession = (userId) => {
  const cached = sessionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 600000) { // 10 min TTL
    return cached;
  }
  sessionCache.delete(userId);
  return null;
};

const updateSessionCache = (userId, message, isUser = true, metadata = {}) => {
  let session = sessionCache.get(userId) || { messages: [], timestamp: Date.now(), context: {} };
  session.messages.push({ 
    role: isUser ? 'user' : 'assistant', 
    text: message,
    ...metadata
  });
  session.messages = session.messages.slice(-8); // Keep last 4 exchanges for better context
  session.timestamp = Date.now();
  sessionCache.set(userId, session);
};

// ── Optimized system prompt with comprehensive webapp knowledge ───────────────
const buildSystemPrompt = (context) => {
  const { isAuthenticated, userRole, page, conversationHistory } = context;
  
  // Role-specific capabilities
  const roleCapabilities = {
    guest: 'browse events, sign in, register',
    user: 'browse events, book tickets, view bookings, manage account',
    organizer: 'browse events, book tickets, view bookings, create events, view event analytics',
    admin: 'full access: manage users, events, bookings, scanner, insights'
  };
  
  const userCapabilities = roleCapabilities[userRole] || roleCapabilities.guest;
  
  return `You are Evie, the voice assistant for EventsApp. You are deeply integrated into the app and understand its features, workflows, user role permissions, and navigation.

CORE IDENTITY:
- Primary role: understand user intent and execute in-app actions
- Secondary role: answer questions about events and the app
- Tone: warm, concise, conversational, and human
- Rules: plain spoken English only, no markdown, no bullets, no symbols, no URLs, no code

APP KNOWLEDGE - COMPREHENSIVE:

1. EVENT SYSTEM:
   - Categories: Music, Sports, Conference, Workshop, Festival, Theater, Comedy, Food & Drink, Other
   - Status: active (upcoming), completed (past), cancelled
   - Features: title, description, location, date/time, price, available tickets, organizer, image
   - Users can search, filter by category, view details, and book tickets
   - Booking creates a unique reference number and QR code ticket
   - Scheduling conflict detected: users can't book events within 3 hours of each other

2. USER ROLES & PERMISSIONS:
   - Guest: view events, sign in/register
   - User: all guest abilities + book tickets + manage bookings
   - Organizer: all user abilities + create/manage events + view event insights
   - Admin: full system access including scanner, user management, analytics
   - Current user: ${userRole || 'guest'} | Auth status: ${isAuthenticated ? 'signed in' : 'not signed in'}
   - User can: ${userCapabilities}

3. PAGES & FEATURES:
   - /: Home, hero, featured events
   - /events: Browse all events, filter by category, search
   - /events/[id]: View event details, book tickets, see reviews
   - /dashboard: User overview (bookings, upcoming events, stats)
   - /dashboard/create-event: Create new event (organizer+)
   - /dashboard/scanner: Scan QR codes to validate tickets (admin+)
   - /dashboard/attendee-insights: View event analytics (organizer+)
   - /bookings/[id]: View booking details and QR code
   - /auth/login, /auth/register: Authentication
   - /contact-admin: Support request

4. BOOKING WORKFLOW:
   - User selects event and number of tickets
   - Booking confirmed with reference number (BK format)
   - QR code generated for each booking
   - Status: confirmed → attended/cancelled
   - Can't double-book or book conflicting times
   - Cancellation available before event date

5. COMMON USER INTENTS:
   - "Show me X events" → navigate to /events, filter category if specified
   - "Search for X" → search events by title/location/description
   - "Book X for Y people" → navigate to event, trigger booking action
   - "Show my bookings" → navigate to dashboard/bookings
   - "Create an event" → navigate to create-event (check permissions first)
   - "Sign in/Sign out" → auth action
   - "Tell me about X event" → get_event_info action
   - "Cancel my booking" → cancel_booking action

SOPHISTICATED AUTH AWARENESS:
- Current user: ${isAuthenticated ? `${user?.email} (${userRole})` : 'guest'}
- Authentication status: ${isAuthenticated ? '✅ AUTHENTICATED (verified via JWT)' : '❌ NOT AUTHENTICATED'}
- Your role restricts access: Only authenticated users can access bookings, dashboard, create events
- Session security: All user data verified server-side from JWT token (NOT from frontend)
- Never treat guests as authenticated users
- Never offer auth-only commands to guests
- If auth state is uncertain, treat as guest

CONTEXT AWARENESS:
- Current page: ${page}
- User authenticated: ${isAuthenticated}
- User role: ${userRole}
- Session verified: ${isAuthenticated ? 'YES - User identity confirmed' : 'NO - Anonymous guest'}
- Recent actions: ${conversationHistory?.slice(-2).map(m => m.text).join(' → ') || 'none yet'}

ACTION RESPONSES:
You MUST respond ONLY as valid JSON: { "action": "...", "params": {...}, "reply": "..." }
Valid actions: search, filter_category, navigate, clear, get_event_info, book_event, cancel_booking, create_event_form, login, logout, speak_only.

RULES FOR ACTION SELECTION:
1. If user not authenticated and requests protected feature → suggest login
2. If user lacks permission → explain requirement
3. If intent unclear → ask one clarifying question (brief)
4. If action doesn't require page navigation → use speak_only
5. Always be specific: if searching for events, extract keywords; if filtering, specify category
6. Confirmation: if action completed successfully, confirm briefly in reply
7. Errors: provide helpful guidance and suggest alternatives

REPLY FORMAT:
- Keep reply to 1-3 short sentences unless reading a list of results
- Be direct and skip unnecessary details
- Ask one question at a time in multi-step actions
- Do not claim an action is complete unless it is completed
- If question answered, answer concisely and naturally`;
};

// ── Smart live data fetch with caching and parallel queries ──────────────────
const fetchLiveData = async (transcript, userId, isAuthenticated) => {
  const lower = transcript.toLowerCase();
  let liveData = '';

  // Faster combined keyword check
  const needsData = /event|show|find|search|booking|ticket|insight|analytics|stats|dashboard|concert|sports|music|festival|workshop|conference|comedy|theater|food|book|category/i.test(lower);
  if (!needsData) return liveData;

  try {
    // Extract category & search term once
    const categoryMatch = lower.match(/music|sports|conference|workshop|festival|theater|comedy|food/i);
    const categoryFilter = categoryMatch ? categoryMatch[0].charAt(0).toUpperCase() + categoryMatch[0].slice(1) : null;
    const searchMatch = lower.match(/(?:find|search|show me|look for|looking for|about|tell me about)\s+(?:a\s+)?(?:the\s+)?([a-z\s]+?)(?:\s+event|$)/i);
    const searchTerm = searchMatch?.[1]?.trim() || null;

    // Parallel data fetching with Promise.all
    const queries = [];

    // Only fetch events if mentioned
    if (/event|show|find|search|concert|sports|music|festival|workshop|conference|comedy|theater|food|book|ticket|category/i.test(lower)) {
      // Use cache if available
      if (Date.now() - eventCache.timestamp < eventCache.ttl && categoryFilter === null && !searchTerm) {
        liveData += `\nUpcoming Events: ${eventCache.data.map(e => 
          `${e.title}|${e.category}|${new Date(e.date).toLocaleDateString()}|$${e.price}`
        ).join(' ; ')}`;
      } else {
        queries.push(
          supabase
            .from('events')
            .select('id, title, category, date, price, available_tickets')
            .eq('status', 'active')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(5) // Reduced from 8
            .then(({ data: events }) => {
              if (events?.length) {
                if (categoryFilter) {
                  events = events.filter(e => e.category?.includes(categoryFilter));
                }
                if (searchTerm) {
                  events = events.filter(e => e.title.toLowerCase().includes(searchTerm) || e.category.toLowerCase().includes(searchTerm));
                }
                if (events.length) {
                  liveData += `\nUpcoming Events [${categoryFilter || 'all'}]: ${events.map(e => `${e.title}|${new Date(e.date).toLocaleDateString()}`).join(' ; ')}`;
                  eventCache = { data: events, timestamp: Date.now(), ttl: 300000 };
                }
              }
            })
        );
      }
    }

    // Only fetch bookings if needed and authenticated
    if (isAuthenticated && userId && /booking|ticket|upcoming|my event/i.test(lower)) {
      queries.push(
        supabase
          .from('bookings')
          .select('id, booking_reference, status, events(title, date)')
          .eq('user_id', userId)
          .in('status', ['confirmed', 'pending'])
          .limit(3) // Reduced from 5
          .then(({ data: bookings }) => {
            if (bookings?.length) {
              liveData += `\nYour Bookings: ${bookings.map(b => `${b.events?.title}|${b.booking_reference}`).join(' ; ')}`;
            }
          })
      );
    }

    if (queries.length > 0) {
      await Promise.all(queries).catch(err => console.error('Data fetch error:', err.message));
    }
  } catch (err) {
    console.error('Live data fetch error:', err.message);
  }

  return liveData;
};

// ── Robust JSON parsing with retry ────────────────────────────────────────────
const parseGeminiResponse = (raw) => {
  // If empty response, return fallback
  if (!raw || !raw.trim()) {
    return {
      action: 'speak_only',
      params: {},
      reply: "I cannot perform the task requested. Please repeat your request."
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract JSON from potentially malformed response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch { /* continue */ }
    }

    // Fallback structure
    return {
      action: 'speak_only',
      params: {},
      reply: "I cannot perform the task requested. Please repeat your request."
    };
  }
};

// ── Call Gemini with timeout + retry ──────────────────────────────────────────
const callGemini = async (systemPrompt, userMessage, retries = MAX_RETRIES) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const geminiUrl = `${GEMINI_API_URL}${process.env.GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Lower temperature for faster, more consistent responses
          maxOutputTokens: 200 // Reduced from 400 for faster generation
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error (${response.status}):`, errText.slice(0, 200));
      
      // For 404 (model not found), don't retry - return fallback immediately
      if (response.status === 404) {
        console.warn('Gemini model not available or API key invalid');
        return ''; // Return empty - caller will apply default response
      }
      
      if (retries > 0 && response.status >= 500) {
        console.log(`Retrying... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, 1000)); // Backoff
        return callGemini(systemPrompt, userMessage, retries - 1);
      }
      
      throw new Error(`Gemini failed: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Gemini request timeout');
      throw new Error('Request took too long; try again.');
    }
    throw error;
  }
};

// ── Enhanced Intent Patterns for Siri-like Voice Assistant ────────────────────
const INTENT_PATTERNS = {
  // Authentication
  signup: /sign up|register|create account|new account|make account/i,
  signin: /sign in|log in|login|sign me in|log me in|authenticate/i,
  signout: /sign out|log out|logout|sign me out|log me out/i,
  
  // Account & Navigation
  dashboard: /dashboard|my profile|account|settings|overview/i,
  help: /help|what can you do|capabilities|how.*work|tutorial/i,
  
  // Bookings
  bookings: /my booking|my bookings|my ticket|my tickets|show my booking|view booking/i,
  book: /\bbook\b|i.*want.*book|let me book|can i book|reserve|purchase.*ticket|get.*ticket/i,
  cancel: /cancel booking|cancel.*ticket|cancel.*order|refund|undo booking/i,
  
  // Events - Search & Browse
  search: /search|find|look for|show me|i.*looking|discover/i,
  eventDetails: /event.*detail|tell me.*event|about.*event|information.*event|what.*event/i,
  eventsByDate: /upcoming|today|tomorrow|this week|this month|future event/i,
  eventsByLocation: /near me|location|city|where|around/i,
  eventsByCategory: /music|sports|conference|workshop|festival|theater|comedy|food|concert|sports/i,
  
  // Organizer Features
  create: /create.*event|post.*event|new event|add event|organize event/i,
  insights: /insight|analytics|stats|statistics|attendance|performance|revenue/i,
  
  // Admin Features
  scanner: /scan|qr|check in|validate ticket|ticket check/i,
  
  // General Browsing
  browse: /show.*event|find.*event|lookup event|browse|list/i
};

// ── Siri-like Response Templates ──────────────────────────────────────────────
const RESPONSES = {
  help: `I can help you with:
  
EVENTS: Search events, browse by category or date, get event details
BOOKINGS: View your bookings, book events, cancel bookings
ACCOUNT: Sign in, view profile, access your dashboard
ORGANIZER: Create events, view analytics (for organizers)
  
Just tell me what you'd like to do!`,
  
  noResults: (query) => `I couldn't find any ${query}. Would you like to browse all events or try a different search?`,
  
  unauthorized: (action) => `You need to sign in to ${action}. Let me take you to the login page.`,
  
  confirmAction: (action) => `Sure, I'll help you ${action}.`,
  
  suggestNext: (context) => {
    const suggestions = {
      browsing: "Say 'book' to reserve an event, or ask for more details about any event.",
      afterBooking: "You can say 'show my bookings' to see your tickets, or 'cancel booking' if needed.",
      noAuth: "Sign in to access more features like bookings and your dashboard.",
    };
    return suggestions[context] || "What would you like to do next?";
  }
};

// ── Extract Intent from User Input ───────────────────────────────────────────
function extractIntent(input) {
  const lower = input.toLowerCase();
  
  // Check patterns in order of priority
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(lower)) {
      return { intent, matched: input, confidence: 0.9 };
    }
  }
  
  return { intent: null, confidence: 0 };
}

// ── Extract Action Parameters from Natural Language ──────────────────────────
function extractParameters(input) {
  const lower = input.toLowerCase();
  const params = {};
  
  // Extract search term
  const searchMatch = input.match(/(?:search|find|look for|show me|book)\s+(?:a\s+)?(?:the\s+)?([^\"]+?)(?:\s+(?:event|ticket|concerts?|ticket))?$/i);
  if (searchMatch) params.searchTerm = searchMatch[1].trim();
  
  // Extract category
  const categoryMatch = lower.match(/music|sports|conference|workshop|festival|theater|comedy|food/i);
  if (categoryMatch) params.category = categoryMatch[0];
  
  // Extract date reference
  if (/today|this week|this month|upcoming|future/.test(lower)) {
    params.dateFilter = 'upcoming';
  } else if (/tomorrow/.test(lower)) {
    params.dateFilter = 'tomorrow';
  }
  
  // Extract quantity
  const quantityMatch = input.match(/(\d+)\s+(?:ticket|seat)/i);
  if (quantityMatch) params.quantity = parseInt(quantityMatch[1]);
  
  // Extract event name for bookings
  const eventMatch = input.match(/(?:book|reserve)\s+(?:a\s+)?(?:the\s+)?([^\"]+?)(?:\s+(?:event|ticket))?$/i);
  if (eventMatch) params.eventName = eventMatch[1].trim();
  
  return params;
}

// ── Main controller with improved context and intent detection ───────────────
/**
 * ✅ SECURITY FIX: Authentication is now verified via JWT middleware
 * req.isAuthenticated and req.user come from the server-verified token,
 * NOT from untrusted request body parameters.
 * 
 * This prevents frontend from spoofing authentication state.
 */
export const handleAssistant = async (req, res) => {
  try {
    // Support both 'transcript' and 'query' parameters for flexibility
    const { query, transcript, page = '/' } = req.body;
    const userInput = query || transcript;

    if (!userInput?.trim()) {
      return res.status(400).json({ error: 'Query/transcript required' });
    }

    // ✅ SECURITY: Use verified authentication from middleware, not from body
    const isAuthenticated = req.isAuthenticated || false;
    const user = req.user || null;
    const userId = user?.id || 'anonymous';
    const userRole = user?.role || 'guest';
    const lower = userInput.toLowerCase();

    // Quick exit for simple intents (skip Gemini entirely)
    
    // 1. AUTHENTICATION INTENTS
    if (INTENT_PATTERNS.signup.test(lower)) {
      if (isAuthenticated) {
        const reply = "You're already signed in! To create a new account, please sign out first.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "I'll take you to the registration page.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/auth/register' }, reply });
    }

    if (INTENT_PATTERNS.signin.test(lower)) {
      if (isAuthenticated) {
        const reply = "You're already signed in!";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "I'll take you to the login page.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/auth/login' }, reply });
    }

    if (INTENT_PATTERNS.signout.test(lower)) {
      if (!isAuthenticated) {
        const reply = "You're not currently signed in.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "Signing you out.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'logout', params: {}, reply });
    }

    // 1a. HELP & CAPABILITIES
    if (INTENT_PATTERNS.help.test(lower)) {
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, RESPONSES.help, false);
      return res.json({ action: 'speak_only', params: {}, reply: RESPONSES.help });
    }

    // 2. DASHBOARD & ACCOUNT INTENTS
    if (INTENT_PATTERNS.dashboard.test(lower)) {
      if (!isAuthenticated) {
        const reply = "You need to sign in to access your dashboard. Let me take you to the login page.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'navigate', params: { path: '/auth/login' }, reply });
      }
      const reply = "Opening your dashboard.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/dashboard' }, reply });
    }

    // 3. BOOKING MANAGEMENT
    if (INTENT_PATTERNS.bookings.test(lower)) {
      if (!isAuthenticated) {
        const reply = "To view your bookings, please sign in first.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'navigate', params: { path: '/auth/login' }, reply });
      }
      const reply = "Here are your bookings.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/dashboard' }, reply });
    }

    // 3a. BOOK AN EVENT
    if (INTENT_PATTERNS.book.test(lower)) {
      if (!isAuthenticated) {
        const reply = "You need to sign in first to book events. Let me take you to the login page.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'navigate', params: { path: '/auth/login' }, reply });
      }
      const reply = "I'll help you book an event. Let's find the perfect one for you.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'book_event', params: {}, reply });
    }

    if (INTENT_PATTERNS.cancel.test(lower)) {
      if (!isAuthenticated) {
        const reply = "You need to be signed in to cancel a booking.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "I can help you cancel a booking. Which event would you like to cancel?";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'speak_only', params: {}, reply });
    }

    // 4. EVENT CREATION (ORGANIZER+)
    if (INTENT_PATTERNS.create.test(lower)) {
      if (!isAuthenticated) {
        const reply = "You need to sign in to create an event.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'navigate', params: { path: '/auth/login' }, reply });
      }
      if (userRole !== 'organizer' && userRole !== 'admin' && userRole !== 'superadmin') {
        const reply = "Only event organizers can create events. Contact support to upgrade your account.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "Taking you to the event creation form.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'create_event_form', params: {}, reply });
    }

    // 5. ANALYTICS & INSIGHTS (ORGANIZER+)
    if (INTENT_PATTERNS.insights.test(lower)) {
      if (!isAuthenticated || (userRole !== 'organizer' && userRole !== 'admin' && userRole !== 'superadmin')) {
        const reply = "Insights are available for organizers and admins. Sign in to your organizer account to view analytics.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "Opening your event insights.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/dashboard/attendee-insights' }, reply });
    }

    // 6. SCANNER (ORGANIZER/ADMIN/SUPERADMIN)
    if (INTENT_PATTERNS.scanner.test(lower)) {
      if (!isAuthenticated || !['organizer', 'admin', 'superadmin'].includes(userRole)) {
        const reply = "The scanner is available to organizer and admin roles.";
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ action: 'speak_only', params: {}, reply });
      }
      const reply = "Opening the ticket scanner.";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/dashboard/scanner' }, reply });
    }

    // 7. CATEGORY FILTERING (FAST PATH)
    // Only filter by category if NOT trying to book (booking takes priority)
    const categoryMatch = lower.match(/music|sports|conference|workshop|festival|theater|comedy/i);
    if (categoryMatch && /event|show|find|search/i.test(lower) && !/\bbook\b|reserve|purchase|get.*ticket/i.test(lower)) {
      const categoryDisplay = categoryMatch[0].charAt(0).toUpperCase() + categoryMatch[0].slice(1);
      const reply = `Showing ${categoryDisplay} events.`;
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ 
        action: 'filter_category', 
        params: { category: categoryDisplay }, 
        reply 
      });
    }

    // 8. EVENT BROWSING
    if (INTENT_PATTERNS.browse.test(lower)) {
      const reply = "Here are the available events.";
      updateSessionCache(userId, userInput, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'navigate', params: { path: '/events' }, reply });
    }

    // 9. ADVANCED SEARCH & FILTERS (Siri-like)
    // Search for specific event
    if (INTENT_PATTERNS.search.test(lower) && /event|concert|conference|show|performance/i.test(lower)) {
      const params = extractParameters(userInput);
      if (params.searchTerm) {
        const reply = `Searching for ${params.searchTerm}...`;
        updateSessionCache(userId, transcript, true);
        updateSessionCache(userId, reply, false);
        return res.json({ 
          action: 'search', 
          params: { query: params.searchTerm }, 
          reply 
        });
      }
    }

    // Get event details
    if (INTENT_PATTERNS.eventDetails.test(lower)) {
      const reply = "Which event would you like to know more about?";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'speak_only', params: {}, reply });
    }

    // Upcoming events (by date)
    if (INTENT_PATTERNS.eventsByDate.test(lower)) {
      let timeframe = 'upcoming';
      if (/today/.test(lower)) timeframe = 'today';
      else if (/tomorrow/.test(lower)) timeframe = 'tomorrow';
      else if (/this week/.test(lower)) timeframe = 'this_week';
      
      const reply = `Showing ${timeframe} events.`;
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ 
        action: 'filter_date', 
        params: { timeframe }, 
        reply 
      });
    }

    // Events by location
    if (INTENT_PATTERNS.eventsByLocation.test(lower)) {
      const reply = "Which location or city are you interested in?";
      updateSessionCache(userId, transcript, true);
      updateSessionCache(userId, reply, false);
      return res.json({ action: 'speak_only', params: {}, reply });
    }

    // ── NOW CALL GEMINI ONLY FOR COMPLEX QUERIES ──
    // Build context
    const session = getCachedSession(userId);
    const context = { 
      page, 
      isAuthenticated, 
      userName: user?.full_name || null, 
      userRole,
      conversationHistory: session?.messages || []
    };

    // Fetch live data for complex queries
    const liveData = await fetchLiveData(userInput, userId, isAuthenticated);
    const userMessage = `User (${userRole}): "${userInput}"${liveData}`;

    // Build and call Gemini with enhanced context
    const systemPrompt = buildSystemPrompt(context);
    let raw = '';
    try {
      raw = await callGemini(systemPrompt, userMessage);
    } catch (geminiError) {
      // Gemini failed - but that's OK, we'll use fallback
      console.warn('Gemini unavailable:', geminiError.message);
      raw = '';
    }

    // Parse with robust fallback
    let parsed = parseGeminiResponse(raw);

    // Validate action
    const allowed = ['search', 'filter_category', 'navigate', 'clear', 'get_event_info', 'book_event', 'cancel_booking', 'create_event_form', 'login', 'logout', 'speak_only'];
    if (!allowed.includes(parsed.action)) {
      parsed.action = 'speak_only';
    }

    // Update session cache with action info
    updateSessionCache(userId, transcript, true, { action: parsed.action });
    updateSessionCache(userId, parsed.reply, false);

    return res.json(parsed);
  } catch (error) {
    console.error('Assistant error:', error.message, error.stack);
    // ✅ Return 200 even on error because we have a valid fallback response
    return res.status(200).json({
      action: 'speak_only',
      params: {},
      reply: "I cannot perform the task requested. Please repeat your request."
    });
  }
};
