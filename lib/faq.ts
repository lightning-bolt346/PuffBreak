// Single source of truth for PuffBreak FAQ content.
// Consumed by: layout.tsx (JSON-LD FAQPage schema), page.tsx (crawlable/a11y section),
// and PuffBreakApp.tsx (in-app FAQ modal). Keep in sync in one place only.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is PuffBreak?',
    a: 'PuffBreak is a free, browser-based virtual break room. Light a digital cigarette or sip virtual chai in 8 ambient rooms, mix room sound with live music radio, and share the break through anonymous room chat. No account or sign-up is required.',
  },
  {
    q: 'Is PuffBreak free?',
    a: 'Yes, PuffBreak is completely free. There are no subscriptions, no premium tiers, and no ads. It is funded by the creators and remains free for everyone.',
  },
  {
    q: 'Does PuffBreak collect my data?',
    a: "PuffBreak has no accounts and does not ask for your name, email, or profile. Preferences such as your streak, volume settings, nickname, and saved stations stay in your browser. Anonymous room presence, temporary chat, break and survey totals, and aggregate analytics use third-party infrastructure; starting YouTube ambience or live radio also connects your browser to that provider. See the Privacy Policy for the full list.",
  },
  {
    q: 'Can PuffBreak help me quit smoking?',
    a: 'PuffBreak can be used as a mindful substitute during nicotine cravings. The 3-minute session length matches the peak duration of a nicotine craving. By replacing the physical ritual with a digital one, many users report reduced cigarette consumption. It is not a medical device.',
  },
  {
    q: 'What is the difference between PuffBreak and Damta World?',
    a: 'Damta World (온라인 담타) is a Korean-language virtual smoking room. PuffBreak is the English-language alternative with more features: 8 themed ambient rooms, ASMR audio mixing, chai tea mode, Zen/Stealth modes, PWA support, and a global community. Both are free and anonymous.',
  },
  {
    q: 'How does PuffBreak work on mobile?',
    a: 'PuffBreak is fully responsive and works on all smartphones and tablets. You can install it as a PWA (Progressive Web App) from your mobile browser for an app-like experience. Shake your phone to tap the ash off your virtual cigarette.',
  },
  {
    q: 'What music and radio can I listen to?',
    a: 'PuffBreak includes human-curated live music stations and checked in-app artist catalogues. Browse by mood, region, language, genre, or artist; save favourites; then balance radio, room ambience, and cigarette crackle independently in the Mixer. Stream and embedded-video availability can change because playback comes from third-party providers.',
  },
  {
    q: 'What ambient rooms are available in PuffBreak?',
    a: 'PuffBreak features 8 immersive rooms: Office Rooftop, Beach Sunset, Space Station, Library Corner, Park Bench, Metro Platform, Chai Stall, and Silent Room. Each room has a unique ambient audio track, animated background, and themed visual atmosphere.',
  },
];
