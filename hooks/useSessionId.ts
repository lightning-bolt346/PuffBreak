'use client';

import { useEffect, useRef } from 'react';

/**
 * useSessionId — returns a stable, anonymous session ID.
 * Generated once per browser session, persisted in sessionStorage so it
 * survives React re-renders but is gone when the tab closes (which triggers
 * Firebase onDisconnect cleanup automatically).
 */
export function useSessionId(): string {
  const idRef = useRef<string>('');

  if (!idRef.current) {
    // On the first call, read from sessionStorage or generate a new UUID
    if (typeof window !== 'undefined') {
      const existing = sessionStorage.getItem('pb_session_id');
      if (existing) {
        idRef.current = existing;
      } else {
        const newId = crypto.randomUUID();
        try {
          sessionStorage.setItem('pb_session_id', newId);
        } catch {
          // Private browsing may throw — that's fine, we still return a valid ID
        }
        idRef.current = newId;
      }
    } else {
      // SSR fallback — never actually used since this is 'use client'
      idRef.current = 'ssr-placeholder';
    }
  }

  return idRef.current;
}
