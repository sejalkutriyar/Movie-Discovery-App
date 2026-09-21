import { useEffect, useRef } from 'react';

// Attaches an IntersectionObserver to a sentinel element; calls `onIntersect`
// when it scrolls into view. Used for "load more results" without a button.
export function useInfiniteScroll(onIntersect, { enabled = true } = {}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: '200px' } // trigger a bit before it's fully in view
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
