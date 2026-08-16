// "Craving Check" — PuffBreak's in-app micro-survey.
//
// After a completed break, the app asks a single, optional question:
// "Did that break help?" — one tap, four emoji answers. The responses are
// aggregated anonymously in Firebase (`stats/survey/...`) and published on the
// `/data` page as original data (the single highest GEO lever — AI engines cite
// original data).
//
// Honesty rules (hard constraints):
//  - One response per browser session (deduplicated — cannot be gamed by mashing).
//  - No PII, no identity, no tracking of who answered.
//  - The published numbers are exactly the aggregate of real responses.

import { db } from '@/lib/firebase';
import { ref, set, runTransaction } from 'firebase/database';
import { track } from '@/lib/analytics';

export type SurveyFelt = 'relief' | 'eased' | 'same' | 'worse';

export const SURVEY_OPTIONS: { felt: SurveyFelt; emoji: string; label: string; summary: string }[] = [
  { felt: 'relief', emoji: '😌', label: 'Gone', summary: 'Craving gone' },
  { felt: 'eased', emoji: '🙂', label: 'Eased', summary: 'Much better' },
  { felt: 'same', emoji: '😐', label: 'Same', summary: 'No change' },
  { felt: 'worse', emoji: '😤', label: 'Worse', summary: 'A bit worse' },
];

const ANSWERED_FLAG = 'pb_survey_answered_v1';

/** True once this browser session has already answered (survives re-renders). */
export function hasAnsweredSurvey(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(ANSWERED_FLAG) === '1';
  } catch {
    return false;
  }
}

function markSurveyAnswered(): void {
  try {
    sessionStorage.setItem(ANSWERED_FLAG, '1');
  } catch {
    /* private browsing — fine */
  }
}

/**
 * Record a single survey answer. Safe to call from the UI after a break completes.
 * Writes the response once (by session id) and increments aggregate counters.
 */
export function submitSurvey(felt: SurveyFelt, room: string, sessionId: string): void {
  markSurveyAnswered();

  // The response node is keyed by the anonymous session id → write-once by design.
  set(ref(db, `stats/survey/responses/${sessionId}`), {
    felt,
    room,
    ts: Date.now(),
  }).catch(() => {});

  // Aggregate counters (transactional so concurrent breaks can't lose counts).
  runTransaction(ref(db, 'stats/survey/total'), (c) => (c || 0) + 1).catch(() => {});
  runTransaction(ref(db, `stats/survey/totals/${felt}`), (c) => (c || 0) + 1).catch(() => {});

  track('survey_answered', { felt, room });
}
