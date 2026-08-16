import React from 'react';
import Link from 'next/link';

// NOTE: intentionally NO `title` metadata here. A nested title.template would
// suppress the root layout's "%s | PuffBreak" suffix for generateMetadata pages.
// Room pages define their own titles; the root template appends the brand once.

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Minimal sticky top nav for room pages */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="PuffBreak — Return to break room"
          >
            <span className="text-lg">🚬</span>
            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm tracking-wide">
              PuffBreak
            </span>
          </Link>

          <nav className="flex items-center gap-4" aria-label="Room pages navigation">
            <Link
              href="/blog"
              className="text-xs text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-widest font-mono"
            >
              Journal
            </Link>
            <Link
              href="/"
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full transition-all font-semibold"
            >
              Take a Break →
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0a0a0f] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} PuffBreak. Free forever. No data collected.</p>
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <Link href="/blog" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Journal</Link>
            <Link href="/about" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">About</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/support" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Support</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
