// Shared site-wide constants. Single source of truth so new pages don't
// hardcode the canonical origin (now the owned custom domain).

export const SITE_URL = 'https://puffbreak.app';
export const SITE_NAME = 'PuffBreak';

/** The live stats / original-data page (survey aggregates). */
export const DATA_URL = `${SITE_URL}/data`;

/** Machine-readable survey aggregate endpoint (used in llms.txt for AI citation). */
export const SURVEY_API_URL = `${SITE_URL}/api/survey`;

/** Placeholder for the planned open-source audio engine repo (created in this phase). */
export const GITHUB_URL = 'https://github.com/puffbreak/puffbreak';
export const AUDIO_ENGINE_REPO = 'https://github.com/puffbreak/ambient-synth';

/** Wikidata entity — created 2026-08-16 (the root entity for Google/AI resolution). */
export const WIKIDATA_URL = 'https://www.wikidata.org/wiki/Q141105453';
