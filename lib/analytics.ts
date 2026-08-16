// Privacy-respecting analytics events (aggregate only, no PII).
// Wraps the GA4 `gtag` loaded by @next/third-parties GoogleAnalytics in app/layout.tsx.
// No-op safely when gtag isn't present (e.g. SSR, ad-blockers, dev without GA).

export type AnalyticsEvent =
  | 'break_completed'
  | 'room_joined'
  | 'share_clicked'
  | 'survey_answered';

type EventParams = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') {
    gtag('event', event, params ?? {});
  }
}
