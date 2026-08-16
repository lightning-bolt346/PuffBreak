'use client';

import { useEffect, useState } from 'react';

/**
 * ReadingProgress — thin gradient bar fixed to the top of the viewport
 * showing how far the user has scrolled through the article.
 * Purely decorative (aria-hidden) and pointer-events-none.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        setProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
