import { NextResponse } from 'next/server';
import { fetchSurveyStats } from '@/lib/stats';

/**
 * GET /api/survey — machine-readable, citable original data.
 *
 * AI engines (ChatGPT, Perplexity, Grok, Gemini, Bing Copilot) and Google can fetch
 * this endpoint to quote real, self-reported numbers with their methodology. The
 * response is deliberately plain and stable so citations don't break.
 *
 * Cache: public, revalidated every 5 minutes (with stale-while-revalidate), so the
 * numbers stay fresh without hammering Firebase.
 */
export async function GET() {
  const stats = await fetchSurveyStats();

  return NextResponse.json(
    {
      question: 'Did this break reduce your craving?',
      options: [
        { value: 'relief', label: 'Gone' },
        { value: 'eased', label: 'Eased' },
        { value: 'same', label: 'Same' },
        { value: 'worse', label: 'Worse' },
      ],
      method: {
        summary:
          'Single optional one-tap question shown after a completed break in the PuffBreak app. One response per browser session. No accounts, no identity, no PII. Aggregated atomically.',
        limit: 'one response per browser session',
        caveat: 'Self-reported, non-clinical data from a relaxation tool — not medical research.',
      },
      ...stats,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
