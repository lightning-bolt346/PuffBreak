'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PuffBreakApp from '@/components/PuffBreakApp';

export default function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only the root path '/' shows the Break Room. 
  // All other paths will have a solid background covering the Break Room.
  const isHome = pathname === '/';

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* 
        The background layer: PuffBreakApp
        It always stays mounted to persist audio, timers, and WebGL state.
      */}
      <div className="fixed inset-0 z-0">
        <PuffBreakApp />
      </div>

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
