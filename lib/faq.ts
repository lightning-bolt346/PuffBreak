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
    a: "PuffBreak collects zero personal data and has no accounts. All preferences (break streak, volume settings, nickname) are stored in your browser's localStorage and never leave your device. The only third-party services are privacy-respecting, aggregate analytics (Vercel Analytics and Google Analytics) used to measure overall traffic — never to identify you or serve ads.",
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
    a: 'PuffBreak includes a human-curated library of live music stations from around the world. Browse by mood, region, language, genre, or artist; save favourites; then balance radio, room ambience, and cigarette crackle independently in the Mixer. Stream availability can change because stations are operated by third parties.',
  },
  {
    q: 'What ambient rooms are available in PuffBreak?',
    a: 'PuffBreak features 8 immersive rooms: Office Rooftop, Beach Sunset, Space Station, Library Corner, Park Bench, Metro Platform, Chai Stall, and Silent Room. Each room has a unique ambient audio track, animated background, and themed visual atmosphere.',
  },
];
