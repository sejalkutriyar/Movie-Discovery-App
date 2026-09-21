import { useEffect, useState } from 'react';

// Delays updating the returned value until `value` stops changing for
// `delayMs`. Used so search doesn't fire a request on every keystroke.
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
