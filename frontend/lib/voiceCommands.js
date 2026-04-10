/**
 * Voice Command Handler for Aimybox Integration
 * Processes voice input and executes corresponding commands
 */

export const VOICE_COMMANDS = {
  WAKE: 'wake',
  STOP_SPEAKING: 'stop speaking',
  CANCEL_FLOW: 'cancel flow',
  CONFIRM_YES: 'confirm yes',
  CONFIRM_NO: 'confirm no',
  READ_EVENTS: 'read events',
  SHOW_WEEKEND_EVENTS: 'show weekend events',
  SHOW_SOLD_OUT_EVENTS: 'show sold out events',
  NEXT_EVENT: 'next event',
  PREVIOUS_EVENT: 'previous event',
  EVENT_DETAILS: 'event details',
  EVENT_PRICE: 'event price',
  REPEAT: 'repeat',
  SHOW_BOOKINGS: 'show my bookings',
  CANCEL_BOOKING: 'cancel booking',
  READ_UPCOMING_BOOKINGS: 'read upcoming bookings',
  BOOKING_REFERENCE: 'booking reference',
  BOOKING_DETAILS: 'booking details',
  DOWNLOAD_QR: 'download qr',
  BOOK_EVENT: 'book event',
  DASHBOARD: 'go to dashboard',
  SEARCH_EVENT: 'search',
  FILTER_CATEGORY: 'filter category',
  FILTER_TIMEFRAME: 'filter timeframe',
  GO_HOME: 'go home',
  GO_EVENTS: 'go events',
  GO_BACK: 'go back',
  REFRESH_PAGE: 'refresh',
  GO_PROFILE: 'go profile',
  GO_SETTINGS: 'go settings',
  GO_MY_TICKETS: 'go my tickets',
  OPEN_SCANNER: 'open scanner',
  SHOW_MY_EVENTS: 'show my events',
  SHOW_ATTENDANCE: 'show attendance',
  SHOW_CAPACITY: 'show capacity',
  GO_ADMIN_PANEL: 'go admin panel',
  SHOW_ALL_BOOKINGS: 'show all bookings',
  LOOKUP_BOOKING: 'lookup booking',
  SHOW_SYSTEM_STATS: 'show system stats',
  HELP: 'help',
  SIGN_IN: 'sign in',
  SIGN_UP: 'sign up',
  SIGN_OUT: 'sign out'
};

/**
 * Command authentication requirements
 * Defines which commands are available based on authentication state
 */
export const COMMAND_AUTH_REQUIREMENTS = {
  [VOICE_COMMANDS.WAKE]: { requiresAuth: false, description: 'Wake assistant' },
  [VOICE_COMMANDS.STOP_SPEAKING]: { requiresAuth: false, description: 'Stop speaking immediately' },
  [VOICE_COMMANDS.CANCEL_FLOW]: { requiresAuth: false, description: 'Cancel current flow' },
  [VOICE_COMMANDS.CONFIRM_YES]: { requiresAuth: false, description: 'Confirm a pending action' },
  [VOICE_COMMANDS.CONFIRM_NO]: { requiresAuth: false, description: 'Reject a pending action' },
  [VOICE_COMMANDS.READ_EVENTS]: { requiresAuth: false, description: 'Browse public events' },
  [VOICE_COMMANDS.SHOW_WEEKEND_EVENTS]: { requiresAuth: false, description: 'Show weekend events' },
  [VOICE_COMMANDS.SHOW_SOLD_OUT_EVENTS]: { requiresAuth: false, description: 'Show sold out events' },
  [VOICE_COMMANDS.NEXT_EVENT]: { requiresAuth: false, description: 'Navigate to next event' },
  [VOICE_COMMANDS.PREVIOUS_EVENT]: { requiresAuth: false, description: 'Navigate to previous event' },
  [VOICE_COMMANDS.EVENT_DETAILS]: { requiresAuth: false, description: 'Get event details' },
  [VOICE_COMMANDS.EVENT_PRICE]: { requiresAuth: false, description: 'Get event price and availability' },
  [VOICE_COMMANDS.REPEAT]: { requiresAuth: false, description: 'Repeat last response' },
  [VOICE_COMMANDS.HELP]: { requiresAuth: false, description: 'Show available commands' },
  [VOICE_COMMANDS.SEARCH_EVENT]: { requiresAuth: false, description: 'Search for events' },
  [VOICE_COMMANDS.FILTER_CATEGORY]: { requiresAuth: false, description: 'Filter events by category' },
  [VOICE_COMMANDS.FILTER_TIMEFRAME]: { requiresAuth: false, description: 'Filter events by timeframe' },
  [VOICE_COMMANDS.GO_HOME]: { requiresAuth: false, description: 'Go to home page' },
  [VOICE_COMMANDS.GO_EVENTS]: { requiresAuth: false, description: 'Go to events page' },
  [VOICE_COMMANDS.GO_BACK]: { requiresAuth: false, description: 'Go back in browser history' },
  [VOICE_COMMANDS.REFRESH_PAGE]: { requiresAuth: false, description: 'Refresh current page' },
  [VOICE_COMMANDS.SIGN_IN]: { requiresAuth: false, description: 'Sign in to your account' },
  [VOICE_COMMANDS.SIGN_UP]: { requiresAuth: false, description: 'Create an account' },
  [VOICE_COMMANDS.SIGN_OUT]: { requiresAuth: true, description: 'Sign out from your account' },
  [VOICE_COMMANDS.SHOW_BOOKINGS]: { requiresAuth: true, description: 'View your bookings' },
  [VOICE_COMMANDS.CANCEL_BOOKING]: { requiresAuth: true, description: 'Cancel a booking' },
  [VOICE_COMMANDS.READ_UPCOMING_BOOKINGS]: { requiresAuth: true, description: 'Read upcoming bookings' },
  [VOICE_COMMANDS.BOOKING_REFERENCE]: { requiresAuth: true, description: 'Read booking reference' },
  [VOICE_COMMANDS.BOOKING_DETAILS]: { requiresAuth: true, description: 'Read booking details' },
  [VOICE_COMMANDS.DOWNLOAD_QR]: { requiresAuth: true, description: 'Download booking QR code' },
  [VOICE_COMMANDS.BOOK_EVENT]: { requiresAuth: true, description: 'Book an event' },
  [VOICE_COMMANDS.DASHBOARD]: { requiresAuth: true, description: 'Access your dashboard' },
  [VOICE_COMMANDS.GO_PROFILE]: { requiresAuth: true, description: 'Open profile' },
  [VOICE_COMMANDS.GO_SETTINGS]: { requiresAuth: true, description: 'Open settings' },
  [VOICE_COMMANDS.GO_MY_TICKETS]: { requiresAuth: true, description: 'Open tickets page' },
  [VOICE_COMMANDS.SHOW_MY_EVENTS]: { requiresAuth: true, description: 'Show organizer events' },
  [VOICE_COMMANDS.SHOW_ATTENDANCE]: { requiresAuth: true, description: 'Show organizer attendance stats' },
  [VOICE_COMMANDS.SHOW_CAPACITY]: { requiresAuth: true, description: 'Show organizer capacity stats' },
  [VOICE_COMMANDS.OPEN_SCANNER]: { requiresAuth: true, description: 'Open scanner' },
  [VOICE_COMMANDS.GO_ADMIN_PANEL]: { requiresAuth: true, description: 'Open admin panel' },
  [VOICE_COMMANDS.SHOW_ALL_BOOKINGS]: { requiresAuth: true, description: 'Show all bookings' },
  [VOICE_COMMANDS.LOOKUP_BOOKING]: { requiresAuth: true, description: 'Look up booking by reference' },
  [VOICE_COMMANDS.SHOW_SYSTEM_STATS]: { requiresAuth: true, description: 'Show system stats' },
  'ai_query': { requiresAuth: false, description: 'General AI query' }
};

/**
 * Check if a command requires authentication
 * @param {string} command - Command to check
 * @returns {boolean} - True if authentication is required
 */
export function commandRequiresAuth(command) {
  const requirement = COMMAND_AUTH_REQUIREMENTS[command];
  return requirement ? requirement.requiresAuth : false;
}

/**
 * Get authentication-aware help message
 * @param {boolean} isAuthenticated - Current authentication status
 * @returns {string} - Appropriate help message
 */
export function getContextualHelp(isAuthenticated, role = 'guest', includeKeys = false) {
  const keyHint = includeKeys ? ' Press M to start speaking, or Escape to stop me.' : '';

  if (!isAuthenticated) {
    return 'You can browse events, search by keyword, ask for event details, or say sign in to continue.' + keyHint;
  }

  if (role === 'organizer') {
    return 'You can book events, read your tickets, open scanner, show my events, and ask for attendance or capacity.' + keyHint;
  }

  if (role === 'admin' || role === 'superadmin') {
    return 'You can do everything organizers can, plus show all bookings, open admin tools, and look up bookings by reference.' + keyHint;
  }

  if (role === 'support') {
    return 'You can help with booking lookups and status checks, plus browse events and open your dashboard.' + keyHint;
  }

  return 'You can book events, read your bookings, open your tickets, and ask me to navigate anywhere in the app.' + keyHint;
}

/**
 * Parse user voice input and extract command intent
 * @param {string} transcript - Raw voice transcript
 * @returns {object} - {command, parameters}
 */
export function parseVoiceCommand(transcript) {
  if (!transcript) return { command: null, parameters: {} };

  const lower = transcript.toLowerCase().trim();

  // Common STT mishears for browse/event browsing
  if (/^(browse|bush|brose|bruce)$/.test(lower) || /(?:bush|brose|bruce).*events?/.test(lower)) {
    return {
      command: VOICE_COMMANDS.READ_EVENTS,
      parameters: { count: 5, correctedFrom: lower }
    };
  }

  // Global control commands
  if (/^hey evie$|^wake up$|^evie$/.test(lower)) {
    return { command: VOICE_COMMANDS.WAKE, parameters: {} };
  }

  if (/^stop$|^quiet$|^cancel$|^never mind$|^nevermind$|^exit$/.test(lower)) {
    return { command: VOICE_COMMANDS.CANCEL_FLOW, parameters: {} };
  }

  if (/stop speaking|stop talking|be quiet/.test(lower)) {
    return { command: VOICE_COMMANDS.STOP_SPEAKING, parameters: {} };
  }

  if (/^yes$|^yep$|^yeah$|^confirm$|^go ahead$|^yes please$|^sure$|^proceed$|^do it$/.test(lower)) {
    return { command: VOICE_COMMANDS.CONFIRM_YES, parameters: {} };
  }

  if (/^no$|^nope$|^don't$|^do not$|^cancel that$|^no thanks$|^stop$|^nah$/.test(lower)) {
    return { command: VOICE_COMMANDS.CONFIRM_NO, parameters: {} };
  }

  // Help command
  if (/^help$|^what can you do$|^what can i say/.test(lower)) {
    return {
      command: VOICE_COMMANDS.HELP,
      parameters: {}
    };
  }

  // Read events command (multiple variations)
  if (/read.*events|list.*events|show.*events|show me.*events|present.*events|upcoming.*events|all events|what events|see.*events|browse.*events/.test(lower)) {
    return {
      command: VOICE_COMMANDS.READ_EVENTS,
      parameters: { count: 5 }
    };
  }

  if (/weekend|this weekend/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_WEEKEND_EVENTS, parameters: {} };
  }

  if (/sold out/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_SOLD_OUT_EVENTS, parameters: {} };
  }

  // Navigation commands
  if (/next.*event|go.*next|show.*next/.test(lower)) {
    return {
      command: VOICE_COMMANDS.NEXT_EVENT,
      parameters: {}
    };
  }

  if (/previous.*event|go.*back|back|last.*event|show.*previous/.test(lower)) {
    return {
      command: VOICE_COMMANDS.PREVIOUS_EVENT,
      parameters: {}
    };
  }

  // Event details command
  if (/event.*details|details|tell.*about|give.*information|inform/.test(lower)) {
    return {
      command: VOICE_COMMANDS.EVENT_DETAILS,
      parameters: {}
    };
  }

  if (/price|cost|how much/.test(lower)) {
    return {
      command: VOICE_COMMANDS.EVENT_PRICE,
      parameters: {}
    };
  }

  // Repeat last response
  if (/repeat|say.*again|could.*repeat/.test(lower)) {
    return {
      command: VOICE_COMMANDS.REPEAT,
      parameters: {}
    };
  }

  // Show bookings
  if (/show.*bookings|my.*bookings|view.*bookings|bookings/.test(lower)) {
    return {
      command: VOICE_COMMANDS.SHOW_BOOKINGS,
      parameters: {}
    };
  }

  if (/cancel.*booking|cancel.*ticket/.test(lower)) {
    const refMatch = lower.match(/\b(bk[a-z0-9]+)\b/i);
    return {
      command: VOICE_COMMANDS.CANCEL_BOOKING,
      parameters: { reference: refMatch ? refMatch[1] : null }
    };
  }

  if (/upcoming.*booking|read.*booking/.test(lower)) {
    return {
      command: VOICE_COMMANDS.READ_UPCOMING_BOOKINGS,
      parameters: {}
    };
  }

  if (/booking reference|reference number/.test(lower)) {
    return {
      command: VOICE_COMMANDS.BOOKING_REFERENCE,
      parameters: {}
    };
  }

  if (/booking details|ticket details/.test(lower)) {
    return {
      command: VOICE_COMMANDS.BOOKING_DETAILS,
      parameters: {}
    };
  }

  if (/download.*qr|download.*code/.test(lower)) {
    return {
      command: VOICE_COMMANDS.DOWNLOAD_QR,
      parameters: {}
    };
  }

  // Search for event (extract search term)
  if (/search|find|look for|search for/.test(lower)) {
    const searchTermMatch = lower.match(/(?:search|find|look) for (.+)|search (.+)|find (.+)/);
    const searchTerm = searchTermMatch ? (searchTermMatch[1] || searchTermMatch[2] || searchTermMatch[3]) : null;

    return {
      command: VOICE_COMMANDS.SEARCH_EVENT,
      parameters: { searchTerm }
    };
  }

  // Category filtering
  if (/show.*(music|sports|conference|workshop|festival|theater|comedy|food|art)/.test(lower)) {
    const categoryMatch = lower.match(/music|sports|conference|workshop|festival|theater|comedy|food|art/);
    return {
      command: VOICE_COMMANDS.FILTER_CATEGORY,
      parameters: { category: categoryMatch ? categoryMatch[0] : null }
    };
  }

  if (/today|tomorrow|this week|this month|weekend/.test(lower)) {
    let timeframe = 'upcoming';
    if (/today/.test(lower)) timeframe = 'today';
    if (/tomorrow/.test(lower)) timeframe = 'tomorrow';
    if (/this week/.test(lower)) timeframe = 'this_week';
    if (/this month/.test(lower)) timeframe = 'this_month';
    if (/weekend/.test(lower)) timeframe = 'weekend';
    return {
      command: VOICE_COMMANDS.FILTER_TIMEFRAME,
      parameters: { timeframe }
    };
  }

  // Sign in command
  if (/sign in|log in|login|sign me in/.test(lower)) {
    return {
      command: VOICE_COMMANDS.SIGN_IN,
      parameters: {}
    };
  }

  // Sign up command
  if (/sign up|register|create account/.test(lower)) {
    return {
      command: VOICE_COMMANDS.SIGN_UP,
      parameters: {}
    };
  }

  // Sign out command
  if (/sign out|log out|logout|sign me out/.test(lower)) {
    return {
      command: VOICE_COMMANDS.SIGN_OUT,
      parameters: {}
    };
  }

  // Book event command
  // Supports direct phrases like "book tech conference 2024"
  if (/^book\s+.+/.test(lower) || /^reserve\s+.+/.test(lower) || /book.*event|book.*ticket|i want to book|book a|reserve.*ticket|reserve.*event/.test(lower)) {
    const directBookMatch = lower.match(/^book\s+(.+)$/);
    const directReserveMatch = lower.match(/^reserve\s+(.+)$/);
    let eventQuery = directBookMatch ? directBookMatch[1] : (directReserveMatch ? directReserveMatch[1] : null);

    if (eventQuery) {
      // Ignore generic trailing nouns so we do not treat "book event" as a title
      if (/^(an?\s+)?(event|events|ticket|tickets)$/.test(eventQuery.trim())) {
        eventQuery = null;
      }
    }

    return {
      command: VOICE_COMMANDS.BOOK_EVENT,
      parameters: { eventQuery }
    };
  }

  // Dashboard command
  if (/dashboard|go.*dashboard|take.*dashboard|show.*dashboard/.test(lower)) {
    return {
      command: VOICE_COMMANDS.DASHBOARD,
      parameters: {}
    };
  }

  // Navigation map
  if (/go home|home page/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_HOME, parameters: {} };
  }

  if (/events page|go events|take me to events/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_EVENTS, parameters: {} };
  }

  if (/go back/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_BACK, parameters: {} };
  }

  if (/refresh|reload/.test(lower)) {
    return { command: VOICE_COMMANDS.REFRESH_PAGE, parameters: {} };
  }

  if (/my tickets|my bookings page/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_MY_TICKETS, parameters: {} };
  }

  if (/go to profile|open profile/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_PROFILE, parameters: {} };
  }

  if (/open settings|go to settings/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_SETTINGS, parameters: {} };
  }

  // Organizer/admin commands
  if (/open scanner|take me to check in|scanner/.test(lower)) {
    return { command: VOICE_COMMANDS.OPEN_SCANNER, parameters: {} };
  }

  if (/show my events/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_MY_EVENTS, parameters: {} };
  }

  if (/attendance|checked in/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_ATTENDANCE, parameters: {} };
  }

  if (/remaining capacity|capacity remaining|capacity/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_CAPACITY, parameters: {} };
  }

  if (/admin panel|go admin/.test(lower)) {
    return { command: VOICE_COMMANDS.GO_ADMIN_PANEL, parameters: {} };
  }

  if (/show all bookings/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_ALL_BOOKINGS, parameters: {} };
  }

  if (/look up booking|check status of booking|booking status/.test(lower)) {
    const refMatch = lower.match(/\b(bk[a-z0-9]+)\b/i);
    return {
      command: VOICE_COMMANDS.LOOKUP_BOOKING,
      parameters: { reference: refMatch ? refMatch[1] : null }
    };
  }

  if (/system stats|platform stats/.test(lower)) {
    return { command: VOICE_COMMANDS.SHOW_SYSTEM_STATS, parameters: {} };
  }

  // Default: pass to backend for AI processing
  return {
    command: 'ai_query',
    parameters: { query: transcript }
  };
}

/**
 * Build voice response based on command and data
 * @param {string} command - Command identifier
 * @param {object} data - Event/booking data or response info
 * @returns {string} - Voice response text
 */
export function buildVoiceResponse(command, data = {}) {
  switch (command) {
    case VOICE_COMMANDS.HELP:
      return `Here are the commands you can use. Say: read events to hear upcoming events. ` +
        `next event to move forward. previous event to go back. event details to hear about the current event. ` +
        `show my bookings to see your reservations. search for followed by an event name to find specific events. ` +
        `repeat to hear the last response. What would you like to do?`;

    case VOICE_COMMANDS.READ_EVENTS: {
      if (!data.events || !data.events.length) {
        return 'No upcoming events found. Would you like to search for a specific event?';
      }
      const eventList = data.events
        .slice(0, 5)
        .map((e, i) => `${i + 1}. ${e.title} on ${formatDateForVoice(e.date)}, ${e.category}`)
        .join('. ');
      return `Here are the upcoming events. ${eventList}. You can say next event to hear more details.`;
    }

    case VOICE_COMMANDS.NEXT_EVENT:
      return data.event 
        ? `Moving to the next event. ${getEventSummary(data.event)}`
        : 'No more events available.';

    case VOICE_COMMANDS.PREVIOUS_EVENT:
      return data.event
        ? `Going back. ${getEventSummary(data.event)}`
        : 'No previous events available.';

    case VOICE_COMMANDS.EVENT_DETAILS: {
      if (!data.event) return 'No event selected. Say read events to start browsing.';
      const event = data.event;
      return `${event.title} in the ${event.category} category. ` +
        `Date: ${formatDateForVoice(event.date)}. ` +
        `Price: ${formatCurrencyForVoice(event.price)}. ` +
        `${event.available_tickets} tickets available. ` +
        `Location: ${event.location || 'check online for details'}. ` +
        `${event.description?.substring(0, 100) || ''}`;
    }

    case VOICE_COMMANDS.SHOW_BOOKINGS: {
      if (!data.bookings || !data.bookings.length) {
        return 'You have no bookings yet. Would you like to browse events?';
      }
      const bookingList = data.bookings
        .map(b => `${b.events?.title} with reference ${b.booking_reference}`)
        .join('. ');
      return `You have ${data.bookings.length} booking. ${bookingList}`;
    }

    case VOICE_COMMANDS.REPEAT:
      return data.lastResponse || 'I don\'t have a previous response to repeat.';

    case 'error':
      return data.message || 'I encountered an error. Please try again.';

    case 'listening':
      return data.message || 'Listening...';

    default:
      return data.message || 'Processing your command.';
  }
}

/**
 * Format date for voice output
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateForVoice(date) {
  if (!date) return 'unknown date';
  const d = new Date(date);
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format currency for voice output
 * @param {number} price - Price value
 * @returns {string} - Formatted price string
 */
function formatCurrencyForVoice(price) {
  if (!price) return 'free';
  return `${price} dollars`;
}

/**
 * Get brief summary of an event for voice
 * @param {object} event - Event object
 * @returns {string} - Event summary
 */
function getEventSummary(event) {
  if (!event) return 'No event available.';
  return `${event.title} - ${formatDateForVoice(event.date)}, ${formatCurrencyForVoice(event.price)}.`;
}

/**
 * Export complete event detail with rich context
 * @param {object} event - Event object
 * @returns {string} - Full event description
 */
export function getFullEventDescription(event) {
  if (!event) return 'Event not found.';

  return `${event.title}. ${event.category || 'Event'}. ` +
    `Date ${formatDateForVoice(event.date)}. ` +
    `Time ${event.time || 'check event page for details'}. ` +
    `Location ${event.location || 'check event page for details'}. ` +
    `Price ${formatCurrencyForVoice(event.price)}. ` +
    `${event.available_tickets ?? 'Unknown'} tickets available. ` +
    `${event.description ? event.description.substring(0, 180) : 'No description available.'}`;
}

/**
 * Normalize transcript for comparison
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
export function normalizeTranscript(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if two transcripts are similar (for repeat detection)
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {boolean} - Whether texts are similar
 */
export function areTranscriptsSimilar(text1, text2) {
  const norm1 = normalizeTranscript(text1);
  const norm2 = normalizeTranscript(text2);
  
  if (norm1 === norm2) return true;
  
  // Check if one contains the other (for partial matches)
  return norm1.includes(norm2) || norm2.includes(norm1);
}
