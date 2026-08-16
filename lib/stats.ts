// Server-safe reader for PuffBreak's aggregate survey stats.
//
// Reads Firebase Realtime Database over its public REST API (no admin SDK, no
// service-account credentials needed) so Server Components and route handlers can
// SSR real numbers for the `/data` page and the `/api/survey` endpoint.
//
// The RTDB is publicly readable by design (the anonymous chat depends on it), so a
// simple GET works. Every fetch is wrapped in a graceful fallback: if the database
// isn't reachable or isn't configured, callers get `available: false` and render
// the "collecting data" state instead of crashing.

import type { SurveyFelt } from '@/lib/survey';

const FELT_KEYS: SurveyFelt[] = ['relief', 'eased', 'same', 'worse'];

export interface SurveyStats {
  /** Whether the live database responded. */
  available: boolean;
  /** Total self-reported answers (null when unavailable). */
  total: number | null;
  /** Raw counts per answer. */
  counts: Record<SurveyFelt, number | null>;
  /** Percentage share of each answer (0–100, null when unavailable). */
  pct: Record<SurveyFelt, number | null>;
  /** "Reduced craving" = relief + eased (the headline number). */
  improvedCount: number | null;
  improvedPct: number | null;
  /** Real aggregate breaks taken on the site (all-time + today). */
  breaksTotal: number | null;
  breaksToday: number | null;
  /** ISO timestamp of the read. */
  updatedAt: string;
}

function dbOrigin(): string | null {
  const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!url || url.includes('dummy') || url.includes('firebaseio.com') === false && !url.includes('firebasedatabase.app')) return null;
  return url.replace(/\/+$/, '');
}

async function getJson<T>(path: string): Promise<T | null> {
  const origin = dbOrigin();
  if (!origin) return null;
  try {
    const res = await fetch(`${origin}/${path}.json`, {
      // Revalidate every 5 minutes — plenty for a live-ISH stats page, cheap for crawlers.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchSurveyStats(): Promise<SurveyStats> {
  const todayStr = new Date().toISOString().split('T')[0];
  const [total, totals, breaksTotal, breaksToday] = await Promise.all([
    getJson<number | null>('stats/survey/total'),
    getJson<Record<SurveyFelt, number> | null>('stats/survey/totals'),
    getJson<number | null>('stats/breaks/total'),
    getJson<number | null>(`stats/breaks/${todayStr}`),
  ]);

  const counts = {
    relief: totals?.relief ?? null,
    eased: totals?.eased ?? null,
    same: totals?.same ?? null,
    worse: totals?.worse ?? null,
  } as Record<SurveyFelt, number | null>;

  const usable = typeof total === 'number' && total > 0;

  const pct = FELT_KEYS.reduce((acc, key) => {
    acc[key] = usable && typeof counts[key] === 'number' ? Math.round(((counts[key] as number) / total) * 100) : null;
    return acc;
  }, {} as Record<SurveyFelt, number | null>);

  const improvedCount =
    typeof counts.relief === 'number' && typeof counts.eased === 'number' ? counts.relief + counts.eased : null;
  const improvedPct = usable && improvedCount !== null ? Math.round((improvedCount / total) * 100) : null;

  return {
    available: usable,
    total: usable ? total : null,
    counts,
    pct,
    improvedCount,
    improvedPct,
    breaksTotal: typeof breaksTotal === 'number' ? breaksTotal : null,
    breaksToday: typeof breaksToday === 'number' ? breaksToday : null,
    updatedAt: new Date().toISOString(),
  };
}
