import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface UseFocusTrapOptions {
  /** Whether the trap is active */
  enabled: boolean;
  /** Callback when Escape is pressed */
  onEscape: () => void;
}

/**
 * Hook that traps keyboard focus within a container element.
 *
 * - On activation: stores the currently focused element and moves focus
 *   to the first focusable element inside the container after a short delay.
 * - Handles Tab wrapping (last → first) and Shift+Tab wrapping (first → last).
 * - Handles Escape key to call onEscape callback.
 * - On deactivation: restores focus to the previously focused element,
 *   or document.body if that element is no longer in the DOM.
 *
 * @param containerRef - Ref to the container element that traps focus
 * @param options - Configuration options for the focus trap
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions
): void {
  const { enabled, onEscape } = options;
  const previouslyFocusedElement = useRef<Element | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
  }, [containerRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [getFocusableElements, onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement;

    // After a short delay (100ms), move focus to first focusable element
    const timeoutId = setTimeout(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);

    // Add keydown listener to the container
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      const previousElement = previouslyFocusedElement.current;
      if (
        previousElement &&
        previousElement instanceof HTMLElement &&
        document.body.contains(previousElement)
      ) {
        previousElement.focus();
      } else {
        document.body.focus();
      }
    };
  }, [enabled, containerRef, getFocusableElements, handleKeyDown]);
}
