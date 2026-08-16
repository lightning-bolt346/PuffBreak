// Localized warm-drink room (SEO name: "Chai Stall") — the in-app display name,
// icon, drinking vessel and ritual hint per culture/region.
//
// Kept separate from lib/i18n.ts so the SEO-facing room name in lib/rooms.ts stays
// intact for Google/AI crawlers. This module only changes what the *user* sees
// inside the app, resolved from `navigator.language` / the `?lang=` query param.
// Privacy-first: locale never leaves the device, no IP geolocation.

export type CupStyle = 'kulhad' | 'glass' | 'tulip' | 'porcelain' | 'espresso' | 'mug';

export interface CupConfig {
  width: number;
  height: number;
  /** Body background (usually a gradient). */
  body: string;
  borderRadius: string;
  /** Optional clip-path for tapered/vase shapes (kulhad, tulip, glass). */
  clipPath?: string;
  /** Optional translucent border (glass / tulip). */
  border?: string;
  /** Liquid fill gradient. */
  liquid: string;
  handle: boolean;
  handleColor?: string;
  saucer: boolean;
  saucerColor?: string;
  emptyIcon: string;
}

/** Visual config for each localized cup — colors/shapes match the real vessels. */
export const CUP_STYLES: Record<CupStyle, CupConfig> = {
  // Terracotta clay cup (Indian tapri / kulhad)
  kulhad: {
    width: 96, height: 112,
    body: 'linear-gradient(to bottom, #d98e5a 0%, #b56a3a 60%, #8f4f28 100%)',
    borderRadius: '8px',
    clipPath: 'polygon(10% 0%, 90% 0%, 76% 100%, 24% 100%)',
    liquid: 'linear-gradient(to bottom, #8b5a2b, #5f3a1b)',
    handle: false,
    saucer: false,
    emptyIcon: '🫖',
  },
  // Clear glass (Arabic karak / Russian tea / Indonesian kopi)
  glass: {
    width: 88, height: 112,
    body: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
    borderRadius: '8px',
    clipPath: 'polygon(14% 0%, 86% 0%, 78% 100%, 22% 100%)',
    border: '1px solid rgba(255,255,255,0.25)',
    liquid: 'linear-gradient(to bottom, #b56a2a, #6f3f13)',
    handle: false,
    saucer: false,
    emptyIcon: '🍵',
  },
  // Turkish tulip-shaped çay glass
  tulip: {
    width: 84, height: 116,
    body: 'linear-gradient(to bottom, rgba(210,80,55,0.30), rgba(150,45,35,0.16))',
    borderRadius: '8px',
    clipPath: 'polygon(34% 0%, 66% 0%, 52% 52%, 86% 100%, 14% 100%)',
    border: '1px solid rgba(220,120,100,0.35)',
    liquid: 'linear-gradient(to bottom, #c23b2a, #7e1f14)',
    handle: false,
    saucer: true,
    saucerColor: 'rgba(255,255,255,0.14)',
    emptyIcon: '🫖',
  },
  // Porcelain teacup + saucer (East Asia / UK)
  porcelain: {
    width: 96, height: 96,
    body: 'linear-gradient(to bottom, #ffffff, #e6e3dc)',
    borderRadius: '8px 8px 14px 14px',
    liquid: 'linear-gradient(to bottom, #6b4a2b, #3f2a16)',
    handle: true,
    handleColor: '#e6e3dc',
    saucer: true,
    saucerColor: '#e6e3dc',
    emptyIcon: '🍵',
  },
  // Small espresso cup + saucer (Latin / French / Italian coffee)
  espresso: {
    width: 72, height: 72,
    body: 'linear-gradient(to bottom, #ffffff, #e8e4dc)',
    borderRadius: '6px 6px 12px 12px',
    liquid: 'linear-gradient(to bottom, #4a2c18, #241408)',
    handle: true,
    handleColor: '#e8e4dc',
    saucer: true,
    saucerColor: '#e8e4dc',
    emptyIcon: '☕',
  },
  // Big ceramic mug (US / Germany / Netherlands / Poland)
  mug: {
    width: 100, height: 110,
    body: 'linear-gradient(to bottom, #d4a373 0%, #b9804f 100%)',
    borderRadius: '10px 10px 16px 16px',
    liquid: 'linear-gradient(to bottom, #6b4a2b, #3f2a16)',
    handle: true,
    handleColor: '#b9804f',
    saucer: false,
    emptyIcon: '☕',
  },
};

export interface WarmDrink {
  /** In-app display name of the warm-drink room. */
  name: string;
  icon: string;
  cupStyle: CupStyle;
  /** Localized "hold to sip · double-tap to clink" hint. */
  sipHint: string;
  /** Whether this culture sweetens at the table (shows the sugar-cube interaction). */
  hasSugar: boolean;
}

// Keyed by base language code. 'en' is the default/fallback.
const WARM_DRINKS: Record<string, WarmDrink> = {
  en: { name: 'Coffee Corner', icon: '☕', cupStyle: 'mug', hasSugar: true, sipHint: 'Hold to sip · Double-tap to clink' },

  // ── Chai cultures (pre-sweetened; no sugar at the table) ────────────────
  hi: { name: 'Chai Tapri', icon: '☕', cupStyle: 'kulhad', hasSugar: false, sipHint: 'पकड़कर चुस्की लें · दो बार टैप से टकराएँ' },
  bn: { name: 'চায়ের দোকান', icon: '☕', cupStyle: 'kulhad', hasSugar: false, sipHint: 'চেপে ধরে চুমুক দিন · দুইবার ট্যাপে ঠুং ঠুং' },
  ur: { name: 'چائے خانہ', icon: '☕', cupStyle: 'kulhad', hasSugar: false, sipHint: 'دبا کر گھونٹ لیں · دو بار ٹیپ کریں' },
  ar: { name: 'مقهى الكرك', icon: '☕', cupStyle: 'glass', hasSugar: false, sipHint: 'اضغط مطولاً للشرب · انقر مرتين' },

  // ── Tea cultures ─────────────────────────────────────────────────────────
  tr: { name: 'Çay Bahçesi', icon: '🫖', cupStyle: 'tulip', hasSugar: true, sipHint: 'İçmek için basılı tut · İki kez dokunup kadeh kaldır' },
  zh: { name: '茶馆', icon: '🍵', cupStyle: 'porcelain', hasSugar: false, sipHint: '长按品尝 · 双击碰杯' },
  ja: { name: '喫茶店', icon: '🍵', cupStyle: 'porcelain', hasSugar: false, sipHint: '長押しで飲む · ダブルタップで乾杯' },
  ko: { name: '다방', icon: '🍵', cupStyle: 'porcelain', hasSugar: false, sipHint: '길게 눌러 마시기 · 두 번 탭하면 건배' },
  ru: { name: 'Чайная', icon: '🍵', cupStyle: 'glass', hasSugar: true, sipHint: 'Удерживай, чтобы пить · Двойной тап — чокнуться' },
  uk: { name: 'Чайна', icon: '🍵', cupStyle: 'glass', hasSugar: true, sipHint: 'Утримуй, щоб пити · Подвійний тап — цокнутись' },

  // ── Coffee cultures ──────────────────────────────────────────────────────
  es: { name: 'Cafetería', icon: '☕', cupStyle: 'espresso', hasSugar: true, sipHint: 'Mantén para beber · Doble toque para brindar' },
  fr: { name: 'Café', icon: '☕', cupStyle: 'espresso', hasSugar: true, sipHint: 'Maintenez pour boire · Double appui pour trinquer' },
  de: { name: 'Café', icon: '☕', cupStyle: 'mug', hasSugar: true, sipHint: 'Halten zum Trinken · Doppeltippen zum Anstoßen' },
  pt: { name: 'Café', icon: '☕', cupStyle: 'espresso', hasSugar: true, sipHint: 'Segure para beber · Toque duplo para brindar' },
  it: { name: 'Caffè', icon: '☕', cupStyle: 'espresso', hasSugar: true, sipHint: 'Tieni premuto per bere · Doppio tocco per brindare' },
  nl: { name: 'Koffiehoek', icon: '☕', cupStyle: 'mug', hasSugar: true, sipHint: 'Houd vast om te drinken · Dubbeltik om te klinken' },
  pl: { name: 'Kawiarnia', icon: '☕', cupStyle: 'mug', hasSugar: true, sipHint: 'Przytrzymaj, aby pić · Podwójne dotknięcie, aby wznieść toast' },
  id: { name: 'Warung Kopi', icon: '☕', cupStyle: 'glass', hasSugar: true, sipHint: 'Tahan untuk minum · Ketuk dua kali untuk bersulang' },
};

// Region-specific overrides within a language (full locale, lowercase).
const LOCALE_OVERRIDES: Record<string, Partial<WarmDrink>> = {
  'en-gb': { name: 'Tea Room', icon: '🫖', cupStyle: 'porcelain', sipHint: 'Hold to sip · Double-tap to clink' },
  'en-au': { name: 'Tea Room', icon: '🫖', cupStyle: 'porcelain', sipHint: 'Hold to sip · Double-tap to clink' },
  'en-in': { name: 'Chai Tapri', icon: '☕', cupStyle: 'kulhad', hasSugar: false, sipHint: 'Hold to sip · Double-tap to clink' },
};

/**
 * Resolve the warm-drink localization for a language/locale string
 * (e.g. "pt-BR", "en-GB", "hi"). Falls back to English.
 */
export function getWarmDrink(lang?: string): WarmDrink {
  const raw = (lang || 'en').toLowerCase();
  const base = raw.split('-')[0];
  const entry = WARM_DRINKS[base] ?? WARM_DRINKS.en;
  const override = LOCALE_OVERRIDES[raw];
  return { ...entry, ...(override ?? {}) };
}
