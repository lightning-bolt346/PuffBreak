'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PuffBreakApp from '@/components/PuffBreakApp';

export default function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only the root path '/' shows the Break Room. 
  // All other paths will have a solid background covering the Break Room.
  const isHome = pathname === '/';

  // Sync <html lang> with the ?lang= hreflang variant after hydration (React
  // otherwise resets it to "en" because the RootLayout hardcodes lang="en").
  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get('lang');
    if (lang) document.documentElement.lang = lang;
  }, []);

  // Lock document scroll ONLY on the homepage (immersive full-screen app).
  // Content routes (blog, about, privacy, support) use native document scrolling.
  useEffect(() => {
    if (!isHome) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;

    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';

    return () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
    };
  }, [isHome]);

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* 
        The background layer: PuffBreakApp
        We only mount this on the homepage to avoid heavy canvas/audio rendering on other routes.
      */}
      {isHome && (
        <div className="fixed inset-0 z-0">
          <PuffBreakApp />
        </div>
      )}

      {/* 
        The foreground layer: children (Next.js pages)
        When not on the homepage, this layer gets a solid dark background 
        and covers the background app completely. When on the homepage, 
        it becomes completely transparent and allows clicks to pass through.
      */}
      <div 
        className={
          "relative z-10 min-h-screen w-full transition-colors duration-500 " + 
          (isHome ? 'bg-transparent pointer-events-none' : 'bg-[#0a0a0f] pointer-events-auto')
        }
      >
        {children}
      </div>
    </div>
  );
}
