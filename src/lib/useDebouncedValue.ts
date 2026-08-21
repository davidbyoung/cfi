"use client";

import { useEffect, useState } from "react";

// Delays updating the returned value until `value` has stopped changing for
// `delayMs` — the input itself can stay wired to the immediate value so
// typing never feels laggy, while the (re-render-heavy) filtering it drives
// only re-runs once typing actually pauses.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
