import { useEffect, useRef } from 'react';

/**
 * Hook that locks body scroll by setting document.body.style.overflow to "hidden"
 * when isLocked is true, and restores the original value when isLocked becomes false
 * or the component unmounts.
 *
 * @param isLocked - Whether body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean): void {
  const previousOverflow = useRef<string>('');

  useEffect(() => {
    if (isLocked) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow.current;
    }

    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [isLocked]);
}
