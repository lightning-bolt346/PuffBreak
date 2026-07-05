import React from 'react';
import Link from 'next/link';
import Script from 'next/script';

// Google AdSense publisher ID — replace ca-pub-XXXXXXXXXXXXXXXX with yours once approved
const ADSENSE_PID = 'ca-pub-XXXXXXXXXXXXXXXX';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google AdSense script — only loads on /blog/* routes */}
      {ADSENSE_PID !== 'ca-pub-XXXXXXXXXXXXXXXX' && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}

      {/* Minimal sticky top nav for blog pages */}
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

          <nav className="flex items-center gap-4" aria-label="Blog navigation">
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

      {/* Blog Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0a0a0f] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Ko-fi Support Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-amber-400/5 border border-amber-400/15 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☕</span>
              <div>
                <p className="text-sm font-semibold text-white">Keep PuffBreak free</p>
                <p className="text-xs text-gray-500">No ads, no subscriptions — just vibes. If you enjoy your breaks, consider supporting.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://ko-fi.com/puffbreak"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF5E5B]/10 hover:bg-[#FF5E5B]/20 border border-[#FF5E5B]/30 text-[#FF5E5B] font-semibold text-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ☕ Ko-fi
              </a>
              <a
                href="upi://pay?pa=sgbro33@okicici&pn=PuffBreak&cu=INR"
                className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm px-5 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                🇮🇳 UPI
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-mono mb-3">Product</p>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Break Room</Link></li>
                <li><Link href="/blog" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Journal</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-mono mb-3">Top Reads</p>
              <ul className="space-y-2">
                <li><Link href="/blog/comprehensive-puffbreak-guide" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">User Guide</Link></li>
                <li><Link href="/blog/puffbreak-for-quitting-smoking-2026" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Quit Smoking</Link></li>
                <li><Link href="/blog/chai-break-culture-explained" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">Chai Culture</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-mono mb-3">Community</p>
              <ul className="space-y-2">
                <li>
                  <a href="https://twitter.com/puffbreak" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a href="mailto:sgbro33@gmail.com" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-mono mb-3">Support Us</p>
              <ul className="space-y-2">
                <li>
                  <a href="https://ko-fi.com/puffbreak" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Ko-fi ☕
                  </a>
                </li>
                <li>
                  <span className="text-sm text-gray-400">UPI: sgbro33@okicici</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} PuffBreak. Free forever. No data collected.
            </p>
            <p className="text-xs text-gray-700 font-mono">
              <Link href="/" className="hover:text-gray-400 transition-colors">puff-break.vercel.app</Link>
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}
