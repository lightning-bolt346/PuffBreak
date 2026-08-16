'use client';

import { useEffect, useState } from 'react';
import type { SurveyStats } from '@/lib/stats';

/**
 * LiveSurveyData — renders the real aggregate survey numbers and quietly refreshes
 * them from `/api/survey` every 60s. The initial render uses server-provided data
 * (so crawlers see real numbers), and the client keeps them warm.
 */
export default function LiveSurveyData({ initial }: { initial: SurveyStats }) {
  const [stats, setStats] = useState<SurveyStats>(initial);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/survey', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as SurveyStats;
        if (alive) setStats(next);
      } catch {
        /* keep last good numbers — never break the page over a refresh */
      }
    };
    const id = window.setInterval(tick, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const pct = stats.improvedPct ?? 0;
  const total = stats.total ?? 0;

  const bars = [
    { key: 'relief', label: '😌 Gone', color: 'bg-emerald-400', pct: stats.pct.relief, count: stats.counts.relief },
    { key: 'eased', label: '🙂 Eased', color: 'bg-teal-400', pct: stats.pct.eased, count: stats.counts.eased },
    { key: 'same', label: '😐 Same', color: 'bg-amber-400', pct: stats.pct.same, count: stats.counts.same },
    { key: 'worse', label: '😤 Worse', color: 'bg-rose-400', pct: stats.pct.worse, count: stats.counts.worse },
  ];

  if (!stats.available) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 text-center">
        <div className="text-4xl mb-4">🧪</div>
        <h2 className="text-2xl font-bold text-white mb-3">We are collecting the first responses</h2>
        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
          The moment a real break is completed in the app, its answer appears here. This page updates by itself —
          come back after your next break and it will have grown.
        </p>
        <p className="text-xs text-gray-600 mt-6 font-mono">
          question: “did this break reduce your craving?” · 1 tap · anonymous · no sign-up
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Headline stat */}
      <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.08] to-transparent p-8 sm:p-12 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-emerald-300/80 mb-6">Self-reported · live · anonymous</p>
        <div className="text-6xl sm:text-8xl font-bold text-white tracking-tight">{pct}%</div>
        <p className="text-xl sm:text-2xl text-gray-300 mt-3 font-light">
          of {total.toLocaleString()} breaks reported a reduced craving
        </p>
        <p className="text-sm text-gray-500 mt-4 max-w-xl mx-auto">
          Measured after the break, not before it — the moment the craving would have peaked.
        </p>
      </div>

      {/* Breakdown */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6">The breakdown</h2>
        <div className="space-y-5">
          {bars.map((bar) => {
            const width = bar.pct ?? 0;
            return (
              <div key={bar.key}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300">{bar.label}</span>
                  <span className="text-gray-500 font-mono text-xs">
                    {bar.pct ?? '—'}% · {bar.count?.toLocaleString() ?? '—'}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real break counters */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-white">
            {stats.breaksTotal?.toLocaleString() ?? '—'}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-widest">virtual breaks · all time</div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-300">
            {stats.breaksToday?.toLocaleString() ?? '—'}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono uppercase tracking-widest">taken today</div>
        </div>
      </div>
    </div>
  );
}
