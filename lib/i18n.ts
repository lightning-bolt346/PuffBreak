// Lightweight, honest locale personalization. No tracking — uses the browser's
// `navigator.language`, which never leaves the device. Everything falls back to English.

export interface CultureProfile {
  /** Language code this profile was resolved for (e.g. "en", "hi"). */
  lang: string;
  /** How this culture names the "warm drink break" ritual (chai / tea / coffee). */
  drinkWord: string;
  /** Localized one-liner for the Chai Stall room, reframed for this culture. */
  chaiRoomHint: string;
  /** Localized daily affirmations (rotated deterministically per day). */
  vibes: string[];
}

const GREETINGS: Record<string, string> = {
  en: 'Welcome back',
  hi: 'वापसी पर स्वागत है', // Hindi
  ko: '다시 오신 것을 환영합니다', // Korean
  ja: 'おかえりなさい', // Japanese
  zh: '欢迎回来', // Chinese
  ru: 'С возвращением', // Russian
  es: 'Bienvenido de nuevo', // Spanish
  fr: 'Bon retour', // French
  de: 'Willkommen zurück', // German
  pt: 'Bem-vindo de volta', // Portuguese
  ar: 'مرحباً بعودتك', // Arabic
  id: 'Selamat datang kembali', // Indonesian
  vi: 'Chào mừng trở lại', // Vietnamese
  th: 'ยินดีต้อนรับกลับ', // Thai
  tr: 'Tekrar hoş geldiniz', // Turkish
  it: 'Bentornato', // Italian
  nl: 'Welkom terug', // Dutch
  pl: 'Witaj z powrotem', // Polish
  uk: 'З поверненням', // Ukrainian
  bn: 'ফিরে স্বাগতম', // Bengali
};

const ENGLISH_VIBES = [
  'Breathe in. Breathe out. You are doing better than you think.',
  'Three minutes. That is all it takes to reset.',
  'Your best ideas show up when you stop forcing them.',
  'A break is not a reward — it is fuel.',
  'Step away from the screen. It will still be there.',
  'You are not your inbox.',
  'Rest is productive.',
  'One deep breath changes everything.',
  'The world can wait three minutes.',
  'Do nothing, deliberately.',
];

// Culture profiles keyed by language code. Each overrides the English defaults.
const CULTURES: Record<string, Omit<CultureProfile, 'lang'>> = {
  // ── Chai cultures (South Asia & Middle East) ────────────────────────────
  hi: {
    drinkWord: 'chai',
    chaiRoomHint: 'भारत की टपरी चाय — असली ब्रेक का मज़ा',
    vibes: [
      'साँस लो। साँस छोड़ो। तुम सोच से बेहतर कर रहे हो।',
      'सिर्फ तीन मिनट। रीसेट के लिए काफी है।',
      'आराम भी उत्पादकता है।',
    ],
  },
  bn: {
    drinkWord: 'chai',
    chaiRoomHint: 'এক কাপ গরম চা — আসল বিরতির স্বাদ',
    vibes: [
      'শ্বাস নিন। আপনি ভাবার চেয়ে ভালো করছেন।',
      'মাত্র তিন মিনিট। রিসেটের জন্য যথেষ্ট।',
      'বিশ্রামও উৎপাদনশীলতা।',
    ],
  },
  ar: {
    drinkWord: 'chai',
    chaiRoomHint: 'شاي الكرك الدافئ — استراحة حقيقية',
    vibes: [
      'تنفس. أنت تبلي أفضل مما تظن.',
      'ثلاث دقائق. هذا كل ما تحتاجه.',
      'الراحة إنتاجية أيضاً.',
    ],
  },
  ur: {
    drinkWord: 'chai',
    chaiRoomHint: 'گرم چائے — ایک حقیقی وقفہ',
    vibes: [
      'سانس لیں۔ آپ سوچ سے بہتر کر رہے ہیں۔',
      'صرف تین منٹ۔ ری سیٹ کے لیے کافی ہے۔',
      'آرام بھی پیداوری ہے۔',
    ],
  },
  tr: {
    drinkWord: 'chai',
    chaiRoomHint: 'Sıcak bir çay molası',
    vibes: [
      'Nefes al. Sandığından daha iyi gidiyorsun.',
      'Sadece üç dakika. Sıfırlamak için yeterli.',
      'Dinlenmek de üretkenliktir.',
    ],
  },

  // ── Tea cultures (East Asia & Eastern Europe) ───────────────────────────
  zh: {
    drinkWord: 'tea',
    chaiRoomHint: '温暖的一杯茶时光',
    vibes: [
      '吸气，呼气。你做得比自己想象中好。',
      '三分钟，就够了。',
      '休息也是一种生产力。',
    ],
  },
  ja: {
    drinkWord: 'tea',
    chaiRoomHint: '温かいお茶のひととき',
    vibes: [
      '吸って、吐いて。思っているより上手くいっている。',
      'たった3分。それだけで十分。',
      '休むことも生産性のうち。',
    ],
  },
  ko: {
    drinkWord: 'tea',
    chaiRoomHint: '따뜻한 차 한 잔의 휴식',
    vibes: [
      '들이쉬고, 내쉬고. 생각보다 잘하고 있어요.',
      '3분이면 충분해요.',
      '쉬는 것도 생산성입니다.',
    ],
  },
  ru: {
    drinkWord: 'tea',
    chaiRoomHint: 'Тёплое чаепитие — настоящий перерыв',
    vibes: [
      'Вдох. Выдох. Ты справляешься лучше, чем думаешь.',
      'Три минуты. Больше и не нужно.',
      'Отдых — это продуктивно.',
    ],
  },
  uk: {
    drinkWord: 'tea',
    chaiRoomHint: 'Тепле чаювання — справжня перерва',
    vibes: [
      'Вдих. Видих. Ти справляєшся краще, ніж думаєш.',
      'Три хвилини. Більше й не треба.',
      'Відпочинок — це продуктивно.',
    ],
  },

  // ── Coffee cultures (the Americas & Western Europe) ─────────────────────
  es: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Tu pausa de café digital',
    vibes: [
      'Respira. Exhala. Lo estás haciendo mejor de lo que crees.',
      'Tres minutos. Eso es todo lo que necesitas.',
      'Descansar también es productivo.',
    ],
  },
  fr: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Votre pause café numérique',
    vibes: [
      'Inspire. Expire. Tu fais mieux que tu ne le penses.',
      'Trois minutes. C\'est tout ce qu\'il faut.',
      'Se reposer, c\'est productif.',
    ],
  },
  de: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Deine digitale Kaffeepause',
    vibes: [
      'Atme ein. Atme aus. Du machst das besser, als du denkst.',
      'Drei Minuten. Mehr braucht es nicht.',
      'Ausruhen ist produktiv.',
    ],
  },
  pt: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Sua pausa de café digital',
    vibes: [
      'Respire. Expire. Você está indo melhor do que pensa.',
      'Três minutos. É tudo o que você precisa.',
      'Descansar também é produtivo.',
    ],
  },
  it: {
    drinkWord: 'coffee',
    chaiRoomHint: 'La tua pausa caffè digitale',
    vibes: [
      'Respira. Espira. Stai andando meglio di quanto pensi.',
      'Tre minuti. È tutto ciò che serve.',
      'Riposare è produttivo.',
    ],
  },
  nl: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Jouw digitale koffiepauze',
    vibes: [
      'Adem in. Adem uit. Je doet het beter dan je denkt.',
      'Drie minuten. Meer is niet nodig.',
      'Rust is productief.',
    ],
  },
  pl: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Twoja cyfrowa przerwa na kawę',
    vibes: [
      'Wdech. Wydech. Radzisz sobie lepiej, niż myślisz.',
      'Trzy minuty. Tyle wystarczy.',
      'Odpoczynek to produktywność.',
    ],
  },
  id: {
    drinkWord: 'coffee',
    chaiRoomHint: 'Istirahat kopi digitalmu',
    vibes: [
      'Tarik napas. Kamu lebih baik dari yang kamu kira.',
      'Tiga menit. Itu saja yang kamu butuhkan.',
      'Istirahat itu produktif.',
    ],
  },
};

/** Resolve a full culture profile for a language code, falling back to English. */
export function getCultureProfile(lang?: string): CultureProfile {
  const code = (lang || 'en').toLowerCase().split('-')[0];
  const profile = CULTURES[code];
  if (profile) return { lang: code, ...profile };
  return { lang: 'en', drinkWord: 'coffee', chaiRoomHint: 'Your digital coffee break', vibes: ENGLISH_VIBES };
}

/** Returns a localized greeting for the user's language, falling back to English. */
export function getLocalizedGreeting(lang?: string): string {
  const code = (lang || 'en').toLowerCase().split('-')[0];
  return GREETINGS[code] ?? GREETINGS.en;
}

/** Deterministic daily affirmation for a language (same for everyone each day). */
export function getDailyVibe(lang?: string): string {
  const profile = getCultureProfile(lang);
  const day = Math.floor(Date.now() / 86_400_000);
  return profile.vibes[day % profile.vibes.length];
}

// ── Localized homepage <title>/<description> for the `?lang=` hreflang variants ──
// Kept concise; the app UI localizes greeting/vibe/chai hints via getCultureProfile.

const HOME_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'PuffBreak — Virtual Break Room | Digital Smoke & Chai Break Simulator',
    description: 'Take a mindful 3-minute digital break. Light a virtual cigarette or sip virtual chai in 8 immersive rooms with ASMR audio. Free, anonymous, no sign-up.',
  },
  hi: {
    title: 'पफब्रेक — वर्चुअल ब्रेक रूम | डिजिटल चाय और स्मोक ब्रेक',
    description: '3 मिनट का माइंडफुल डिजिटल ब्रेक। 8 इमर्सिव कमरों में वर्चुअल चाय या सिगरेट। मुफ़्त, अनाम, बिना साइन-अप।',
  },
  bn: {
    title: 'PuffBreak — ভার্চুয়াল ব্রেক রুম',
    description: '৩ মিনিটের মাইন্ডফুল ডিজিটাল বিরতি। ৮টি রুমে ভার্চুয়াল চা বা সিগারেট। বিনামূল্যে, বেনামে।',
  },
  ar: {
    title: 'PuffBreak — غرفة استراحة افتراضية',
    description: 'خذ استراحة رقمية واعية لثلاث دقائق. أضئ سيجارة افتراضية أو اشرب شاياً في 8 غرف. مجاني وبدون تسجيل.',
  },
  ur: {
    title: 'PuffBreak — ورچوئل بریک روم',
    description: '3 منٹ کا ذہنی ڈیجیٹل بریک۔ 8 کمروں میں ورچوئل چائے یا سگریٹ۔ مفت، گمنام۔',
  },
  tr: {
    title: 'PuffBreak — Sanal Mola Odası',
    description: '3 dakikalık bilinçli bir dijital mola. 8 odada sanal sigara veya çay. Ücretsiz, anonim.',
  },
  zh: {
    title: 'PuffBreak — 虚拟休息室',
    description: '享受 3 分钟的用心数字休息。在 8 个沉浸式房间中点燃虚拟香烟或品茶。免费、匿名、无需注册。',
  },
  ja: {
    title: 'PuffBreak — バーチャルブレイクルーム',
    description: '3分間のマインドフルなデジタル休憩。8つの没入ルームで仮想タバコやお茶を。無料・匿名・登録不要。',
  },
  ko: {
    title: 'PuffBreak — 가상 브레이크 룸',
    description: '3분의 마음챙김 디지털 휴식. 8개의 몰입형 룸에서 가상 담배 또는 차를. 무료, 익명, 회원가입 없음.',
  },
  ru: {
    title: 'PuffBreak — виртуальная комната отдыха',
    description: 'Осознанный 3-минутный цифровой перерыв. Зажгите виртуальную сигарету или чай в 8 комнатах. Бесплатно и анонимно.',
  },
  uk: {
    title: 'PuffBreak — віртуальна кімната відпочинку',
    description: 'Усвідомлена 3-хвилинна цифрова перерва. Запаліть віртуальну сигарету чи чай у 8 кімнатах. Безкоштовно.',
  },
  es: {
    title: 'PuffBreak — Sala de descanso virtual',
    description: 'Tómate una pausa digital consciente de 3 minutos. Enciende un cigarrillo virtual o chai en 8 salas. Gratis y anónimo.',
  },
  fr: {
    title: 'PuffBreak — Salle de pause virtuelle',
    description: 'Une pause numérique de 3 minutes. Allumez une cigarette virtuelle ou un chai dans 8 pièces. Gratuit et anonyme.',
  },
  de: {
    title: 'PuffBreak — Virtueller Pausenraum',
    description: 'Eine bewusste 3-Minuten-Digitalpause. Zünde eine virtuelle Zigarette oder Chai in 8 Räumen an. Kostenlos und anonym.',
  },
  it: {
    title: 'PuffBreak — Sala di pausa virtuale',
    description: 'Una pausa digitale consapevole di 3 minuti. Accendi una sigaretta virtuale o un chai in 8 sale. Gratis e anonimo.',
  },
  pt: {
    title: 'PuffBreak — Sala de pausa virtual',
    description: 'Uma pausa digital consciente de 3 minutos. Acenda um cigarro virtual ou chai em 8 salas. Grátis e anônimo.',
  },
  nl: {
    title: 'PuffBreak — Virtuele pauzeruimte',
    description: 'Een bewuste digitale pauze van 3 minuten. Steek een virtuele sigaret of chai aan in 8 ruimtes. Gratis en anoniem.',
  },
  pl: {
    title: 'PuffBreak — Wirtualny pokój przerwy',
    description: 'Świadoma 3-minutowa cyfrowa przerwa. Zapal wirtualnego papierosa lub chai w 8 pokojach. Za darmo i anonimowo.',
  },
  id: {
    title: 'PuffBreak — Ruang Istirahat Virtual',
    description: 'Istirahat digital sadar 3 menit. Nyalakan rokok virtual atau chai di 8 ruang. Gratis dan anonim.',
  },
};

/** Localized homepage metadata for the `?lang=` hreflang variants (English fallback). */
export function getHomeMeta(lang?: string): { title: string; description: string } {
  const code = (lang || 'en').toLowerCase().split('-')[0];
  return HOME_META[code] ?? HOME_META.en;
}
