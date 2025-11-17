import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onFold?: () => void;
  onCheck?: () => void;
  onCall?: () => void;
  onBet?: () => void;
  onRaise?: () => void;
  onAllIn?: () => void;
}

/**
 * Hook to add keyboard shortcuts for poker actions
 * F = Fold, C = Check/Call, B = Bet, R = Raise, A = All-In
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case 'f':
          handlers.onFold?.();
          break;
        case 'c':
          // Try check first, fall back to call
          handlers.onCheck?.() || handlers.onCall?.();
          break;
        case 'b':
          handlers.onBet?.();
          break;
        case 'r':
          handlers.onRaise?.();
          break;
        case 'a':
          handlers.onAllIn?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers, enabled]);
}
