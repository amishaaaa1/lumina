/**
 * Accessibility utilities and helpers
 */

import React from 'react';

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

export function isKeyboardClick(event: React.KeyboardEvent): boolean {
  return event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE;
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== KEYBOARD_KEYS.TAB) return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// ARIA helpers
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Screen reader only class
export const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}

// Color contrast checker (WCAG AA compliance)
export function hasGoodContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production use a proper library
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= 4.5; // WCAG AA standard for normal text
}

// Reduced motion preference
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}
