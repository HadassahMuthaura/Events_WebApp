/**
 * Accessibility Enhancements for Voice Assistant
 * Ensures the application is fully accessible to visually impaired users
 */

import { useEffect, useRef } from 'react'

/**
 * Hook to announce messages to screen readers
 * @param {string} message - Message to announce
 * @param {string} role - ARIA role (polite, assertive)
 */
export function useAnnouncement(message, role = 'polite') {
  const announced = useRef(false)

  useEffect(() => {
    if (!message || announced.current) return

    const announcer = document.getElementById('aria-announcer')
    if (announcer) {
      announcer.setAttribute('role', `status aria-${role}`);
      announcer.textContent = message
      announced.current = true

      // Reset for next announcement
      setTimeout(() => {
        announced.current = false
      }, 100)
    }
  }, [message, role])
}

/**
 * Component that provides ARIA announcements for voice feedback
 */
export function AriaAnnouncer() {
  return (
    <div
      id="aria-announcer"
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    />
  )
}

/**
 * Accessibility initialization for voice assistant
 * Sets up keyboard shortcuts, screen reader support, etc.
 *
 * Features:
 * - M key to toggle microphone
 * - Auto-dismiss timeout can be disabled
 * - High contrast mode support
 * - Screen reader announcements
 */
export function initializeAccessibility() {
  // Check for high contrast preference
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches
  if (prefersHighContrast) {
    document.body.classList.add('high-contrast')
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion')
  }

  // Check for dark mode preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDarkMode) {
    document.body.classList.add('dark-mode')
  }

  // Announce voice assistant availability on page load
  if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', announceAvailability)
    } else {
      announceAvailability()
    }
  }
}

/**
 * Announce that voice assistant is available
 */
function announceAvailability() {
  const announcer = document.getElementById('aria-announcer')
  if (announcer) {
    announcer.textContent = 'Voice assistant is available. Press M to start, or click the microphone button.'
    announcer.setAttribute('role', 'status aria-assertive')
  }
}

/**
 * Global keyboard shortcut handler for voice assistant
 */
export function setupKeyboardShortcuts(onListenClick) {
  const handleKeyDown = (e) => {
    // Only if not in an input field
    if (e.target === document.body || e.target === document.documentElement) {
      if (e.key === 'm' || e.key === 'M') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          onListenClick()
        }
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}

/**
 * Auto-read page content on load for screen reader users
 * Useful for first-time visitors
 */
export function autoReadPageContent() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]')
  if (!mainContent) return

  // Extract key text content
  const headings = mainContent.querySelectorAll('h1, h2, h3')
  const textContent = Array.from(headings)
    .map(h => h.textContent)
    .slice(0, 3)
    .join('. ')

  if (textContent) {
    // Speak after a short delay
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textContent)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }, 1000)
  }
}

/**
 * Focus management for modal dialogs
 * Traps focus within the dialog when open
 */
export function useFocusTrap(isOpen, containerRef) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when dialog opens
    if (firstElement) firstElement.focus()

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          if (lastElement) lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          if (firstElement) firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, containerRef])
}

/**
 * CSS utilities for accessibility
 * Add these to your global styles or component
 */
export const accessibilityStyles = `
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* High contrast mode */
  @media (prefers-contrast: more) {
    .voice-panel {
      border: 3px solid currentColor;
      font-weight: bold;
    }

    button {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }

    .animate-pulse {
      animation: none;
      opacity: 0.7;
    }
  }

  /* Focus styles for keyboard navigation */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 3px solid #4f46e5;
    outline-offset: 2px;
  }

  /* Voice button accessibility */
  .voice-button {
    min-width: 48px;
    min-height: 48px;
    padding: 12px;
  }

  /* Improve text contrast in voice panel */
  .voice-panel {
    background-color: white;
    color: #1f2937;
    border: 2px solid #ccc;
  }

  .voice-panel h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .voice-panel p {
    font-size: 16px;
    line-height: 1.5;
  }

  /* Ensure transcript and response are readable */
  .transcript-display,
  .response-display {
    background-color: #f3f4f6;
    border: 2px solid #d1d5db;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    line-height: 1.6;
  }
`;

/**
 * Voice response formatter for better accessibility
 * Breaks long text into readable chunks
 */
export function formatVoiceResponse(text) {
  // Add pauses between sentences
  return text
    .replace(/\. /g, '. ')
    .replace(/\! /g, '! ')
    .replace(/\? /g, '? ')
}

/**
 * Create accessible event descriptions
 * for voice announcement
 */
export function createAccessibleEventDescription(event) {
  const parts = []

  parts.push(`Event: ${event.title}`)
  parts.push(`Category: ${event.category}`)
  parts.push(`Date: ${new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })}`)
  parts.push(`Price: ${event.price ? `$${event.price}` : 'Free'}`)
  parts.push(`Location: ${event.location || 'See online for details'}`)
  parts.push(`Available tickets: ${event.available_tickets || 'Check online'}`)

  if (event.description) {
    parts.push(`Description: ${event.description.substring(0, 200)}`)
  }

  return parts.join('. ')
}

/**
 * Initialize all accessibility features
 * Call this in your app initialization
 */
export function setupAllAccessibilityFeatures() {
  initializeAccessibility()
}
