// Example: Extending Voice Assistant with Custom Commands
// This file shows how to add new voice commands to the system

import { VOICE_COMMANDS, buildVoiceResponse } from '../lib/voiceCommands'

/**
 * EXAMPLE 1: Add "Book Event" Command
 * 
 * In voiceCommands.js, add:
 */

// Add to VOICE_COMMANDS enum
export const EXTENDED_VOICE_COMMANDS = {
  ...VOICE_COMMANDS,
  BOOK_EVENT: 'book event',
  CANCEL_BOOKING: 'cancel booking',
  CHECK_PRICE: 'check price',
  GET_LOCATION: 'get location',
};

/**
 * EXAMPLE 2: Advanced parseVoiceCommand Implementation
 */
export function parseVoiceCommandExtended(transcript) {
  if (!transcript) return { command: null, parameters: {} };

  const lower = transcript.toLowerCase().trim();

  // Book event command
  if (/book.*event|book.*ticket|reserve.*ticket/i.test(lower)) {
    return {
      command: EXTENDED_VOICE_COMMANDS.BOOK_EVENT,
      parameters: {}
    };
  }

  // Cancel booking command
  if (/cancel.*booking|cancel.*ticket|refund|refund.*booking/i.test(lower)) {
    return {
      command: EXTENDED_VOICE_COMMANDS.CANCEL_BOOKING,
      parameters: {}
    };
  }

  // Check price command
  if (/how much|how.*much|check.*price|what.*cost/i.test(lower)) {
    return {
      command: EXTENDED_VOICE_COMMANDS.CHECK_PRICE,
      parameters: {}
    };
  }

  // Get location command
  if (/where.*is|location|address|venue/i.test(lower)) {
    return {
      command: EXTENDED_VOICE_COMMANDS.GET_LOCATION,
      parameters: {}
    };
  }

  // Fallback to original handler
  return parseVoiceCommand(transcript);
}

/**
 * EXAMPLE 3: Advanced Response Builder
 */
export function buildVoiceResponseExtended(command, data = {}) {
  switch (command) {
    case EXTENDED_VOICE_COMMANDS.BOOK_EVENT:
      if (!data.event) {
        return 'No event selected. Please select an event first.';
      }
      return `Ready to book ${data.event.title}. How many tickets would you like?`;

    case EXTENDED_VOICE_COMMANDS.CANCEL_BOOKING:
      if (!data.booking) {
        return 'No booking to cancel. Your bookings appear to be empty.';
      }
      return `Ready to cancel your booking for ${data.booking.event_title}. Your refund will be processed.|`;

    case EXTENDED_VOICE_COMMANDS.CHECK_PRICE:
      if (!data.event) {
        return 'No event selected to check price.';
      }
      const price = data.event.price;
      return price 
        ? `The price is $${price} per ticket.`
        : 'This event is free.';

    case EXTENDED_VOICE_COMMANDS.GET_LOCATION:
      if (!data.event) {
        return 'No event selected to get location.';
      }
      return `${data.event.title} will be held at ${data.event.location || 'a location to be announced'}.`;

    // Fallback to original handler
    default:
      return buildVoiceResponse(command, data);
  }
}

/**
 * EXAMPLE 4: Custom Voice Command Handler in VoiceAssistant Component
 */
export function handleCustomVoiceCommands(command, parameters, { 
  currentEvents, 
  currentEventIndex,
  isAuthenticated,
  user,
  router,
  API_URL,
  speakText
}) {
  // Implement custom command logic
  switch (command) {
    case EXTENDED_VOICE_COMMANDS.BOOK_EVENT:
      if (currentEvents.length > 0) {
        const event = currentEvents[currentEventIndex];
        router.push(`/events/${event.id}`);
        speakText(`Navigating to ${event.title}. You can book tickets there.`);
      }
      return true; // Handled

    case EXTENDED_VOICE_COMMANDS.CANCEL_BOOKING:
      if (!isAuthenticated) {
        speakText('You need to sign in to cancel bookings.');
        return true;
      }
      router.push('/dashboard');
      speakText('Opening your dashboard to manage bookings.');
      return true;

    case EXTENDED_VOICE_COMMANDS.CHECK_PRICE:
      if (currentEvents.length > 0) {
        const event = currentEvents[currentEventIndex];
        const response = buildVoiceResponseExtended(command, { event });
        speakText(response);
      }
      return true;

    case EXTENDED_VOICE_COMMANDS.GET_LOCATION:
      if (currentEvents.length > 0) {
        const event = currentEvents[currentEventIndex];
        const response = buildVoiceResponseExtended(command, { event });
        speakText(response);
      }
      return true;
  }

  return false; // Not handled
}

/**
 * EXAMPLE 5: Integration in VoiceAssistantNew.js
 * 
 * Add this to the handleVoiceInput function:
 * 
 * const { command, parameters } = parseVoiceCommand(voiceText)
 * 
 * // Check custom commands first
 * if (handleCustomVoiceCommands(command, parameters, {
 *   currentEvents,
 *   currentEventIndex,
 *   isAuthenticated,
 *   user,
 *   router,
 *   API_URL,
 *   speakText
 * })) {
 *   return; // Custom command handled
 * }
 * 
 * // Then use default handlers (existing code)
 */

/**
 * EXAMPLE 6: Voice Command with Search Parameters
 */
export function parseAdvancedSearch(transcript) {
  const lower = transcript.toLowerCase();

  // Extract search parameters
  const categoryMatch = lower.match(/for\s+(.*?)\s+(music|sports|conference|workshop|food|theater|comedy)/i);
  const priceMatch = lower.match(/under\s+\$?(\d+)|max.*\$?(\d+)/i);
  const dateMatch = lower.match(/(today|tomorrow|this.*week|this.*month|next|upcoming)/i);

  return {
    searchTerm: categoryMatch?.[1] || null,
    category: categoryMatch?.[2] || null,
    maxPrice: priceMatch?.[1] || priceMatch?.[2] || null,
    dateRange: dateMatch?.[1] || null
  };
}

/**
 * EXAMPLE 7: Backend Integration for Custom Commands
 * 
 * POST /api/assistant
 * {
 *   "query": "show me concerts under 50 dollars",
 *   "context": {
 *     "command": "custom_search",
 *     "params": {
 *       "category": "music",
 *       "maxPrice": 50
 *     }
 *   }
 * }
 */

/**
 * EXAMPLE 8: Real-time Feedback During Listening
 */
export function createVisualizerFeedback(audioContext) {
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  return function updateVisualization() {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    
    // Update UI with audio level
    return Math.round((average / 255) * 100);
  };
}

/**
 * EXAMPLE 9: Voice Command History Tracking
 */
export class VoiceCommandHistory {
  constructor(maxSize = 10) {
    this.commands = [];
    this.maxSize = maxSize;
  }

  add(command, timestamp = Date.now()) {
    this.commands.push({ command, timestamp });
    if (this.commands.length > this.maxSize) {
      this.commands.shift();
    }
  }

  getHistory() {
    return this.commands;
  }

  getFrequency() {
    const freq = {};
    this.commands.forEach(({ command }) => {
      freq[command] = (freq[command] || 0) + 1;
    });
    return freq;
  }

  getMostUsed() {
    const freq = this.getFrequency();
    return Object.entries(freq).sort(([,a], [,b]) => b - a)[0];
  }

  clear() {
    this.commands = [];
  }
}

/**
 * EXAMPLE 10: Multilingual Voice Commands
 */
export const VOICE_COMMANDS_ES = {
  READ_EVENTS: 'leer eventos',
  NEXT_EVENT: 'siguiente evento',
  PREVIOUS_EVENT: 'evento anterior',
  EVENT_DETAILS: 'detalles del evento',
  REPEAT: 'repetir',
  SHOW_BOOKINGS: 'mostrar reservas',
  SEARCH_EVENT: 'buscar',
  HELP: 'ayuda'
};

export const VOICE_COMMANDS_FR = {
  READ_EVENTS: 'lire les événements',
  NEXT_EVENT: 'événement suivant',
  PREVIOUS_EVENT: 'événement précédent',
  EVENT_DETAILS: 'détails de l\'événement',
  REPEAT: 'répéter',
  SHOW_BOOKINGS: 'afficher les réservations',
  SEARCH_EVENT: 'rechercher',
  HELP: 'aide'
};

/**
 * EXAMPLE 11: Error Recovery Strategies
 */
export const ERROR_RECOVERY = {
  'no-speech': {
    immediate: 'I didn\'t hear anything.',
    followUp: 'Can you try again?',
    action: 'restart_listening'
  },
  'network-error': {
    immediate: 'Network connection lost.',
    followUp: 'Please check your internet and try again.',
    action: 'retry_with_backoff'
  },
  'timeout': {
    immediate: 'Request took too long.',
    followUp: 'Let me retry.',
    action: 'retry_with_reduced_timeout'
  }
};

/**
 * EXAMPLE 12: Voice Command Analytics
 */
export class VoiceAnalytics {
  constructor() {
    this.totalCommands = 0;
    this.successfulCommands = 0;
    this.failedCommands = 0;
    this.commandDuration = [];
    this.errorLog = [];
  }

  recordCommand(command, success, duration, error = null) {
    this.totalCommands++;
    if (success) {
      this.successfulCommands++;
    } else {
      this.failedCommands++;
      if (error) this.errorLog.push({ command, error, timestamp: Date.now() });
    }
    this.commandDuration.push(duration);
  }

  getStats() {
    const avgDuration = this.commandDuration.reduce((a, b) => a + b, 0) / this.commandDuration.length;
    const successRate = (this.successfulCommands / this.totalCommands) * 100;

    return {
      totalCommands: this.totalCommands,
      successRate: successRate.toFixed(2) + '%',
      averageDuration: avgDuration.toFixed(2) + 'ms',
      errors: this.errorLog.length
    };
  }
}

export default {
  parseVoiceCommandExtended,
  buildVoiceResponseExtended,
  handleCustomVoiceCommands,
  parseAdvancedSearch,
  VoiceCommandHistory,
  VoiceAnalytics,
  VOICE_COMMANDS_ES,
  VOICE_COMMANDS_FR
};
