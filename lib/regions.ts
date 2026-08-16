// Regional break-culture profiles — the "entity" layer of PuffBreak's GEO strategy.
// Each profile is a genuinely written, distinct piece of cultural content (not a
// templated translation). These power the `/regions/[slug]` entity pages.
//
// The pages are English-language entity pages (this is what makes them citable by
// Google, ChatGPT, Perplexity, Grok, etc.), but each links deep into the localized
// app via `/?lang=<code>` and uses the local term + script as the target keyword.
//
// Content rule: no invented statistics, no fake authority. Real cultural facts
// written in a human voice.

import type { RoomId } from '@/lib/rooms';

export interface RegionFaq {
  q: string;
  a: string;
}

export interface RegionProfile {
  /** URL slug (English, e.g. "damta"). */
  slug: string;
  /** English display name of the ritual/culture. */
  name: string;
  /** The local term, with original script (e.g. "담타 (damta)"). */
  term: string;
  flag: string;
  /** `?lang=` code that localizes the app for this region's audience. */
  lang: string;
  region: string;
  /** Local word for the warm drink (chai / tea / coffee) — shown on the page. */
  drinkWord: string;
  /** Recommended PuffBreak room for this culture's ritual. */
  roomId: RoomId;
  /** SEO <title> — the root layout appends "| PuffBreak". */
  title: string;
  /** Meta description. */
  description: string;
  /** One evocative scene-setting line for the hero. */
  hero: string;
  /** The essay — 3–4 genuinely distinct paragraphs. */
  story: string[];
  /** What the ritual looks like in that culture. */
  ritual: string;
  /** Why a digital version matters specifically to this audience. */
  whyVirtual: string;
  keywords: string[];
  faqs: RegionFaq[];
}

export const REGIONS: RegionProfile[] = [
  // ─────────────────────────── SOUTH KOREA · 담타 ───────────────────────────
  {
    slug: 'damta',
    name: 'The Online Damta',
    term: '담타 · damta',
    flag: '🇰🇷',
    lang: 'ko',
    region: 'South Korea',
    drinkWord: 'tea',
    roomId: 'office',
    title: 'What is Damta (담타)? The Korean Online Smoking Room Explained',
    description:
      'Damta (담타) is the Korean online smoking room — a viral website where strangers take virtual cigarette breaks together. Here is the story, and the English alternative.',
    hero: 'In Seoul, the smoking room was always the most honest room in the building.',
    story: [
      'In Korean office culture, the smoking room (흡연실) has always been more than a place to smoke. It is where the real work happens — where a junior hears the truth about a project, where a manager lets their guard down, where decisions are made between two puffs. The people who smoked were not just having a break; they were inside the building\'s social loop. Everyone else watched from the outside.',
      'Then came 2023 and a strange internet experiment: 담타 (damta, a portmanteau of 담배 "cigarette" and 타임 "time"). An anonymous website where a tiny animated cigarette burned down in a browser tab while strangers smoked it together, typed a few lines of chat, and left. No accounts. No profiles. No pressure. It went viral because it solved a very Korean problem: the smoke break was the social ritual, but not everyone smoked — and remote workers had no smoking room at all.',
      'What made damta feel special was the quiet. Nobody had a reputation to protect. A stranger on the other side of the city lit up at 2am, you lit up too, and for three minutes you were both just people taking a breather. It is the closest the internet has come to the solidarity of a shared smoke — without a single cigarette involved.',
      'PuffBreak is the English-speaking continuation of that idea. The same anonymous browser ritual — the same burning-down cigarette, the same floating chat, the same "we are all taking a break together" feeling — rebuilt with 8 ambient rooms, real ASMR audio, and a global community. Open it with ?lang=ko for the Korean-localized experience.',
    ],
    ritual:
      'A Korean smoke break is short, silent and socially loaded. You duck into the smoking room, nod at whoever is there, take your three minutes, and come back ready. The unspoken rule: what happens in the smoking room stays there.',
    whyVirtual:
      'Not everyone smokes, and remote workers lost the smoking room entirely. A virtual version gives anyone — smoker, non-smoker, or someone quitting — the same three-minute reset and the same shared-room feeling, with zero health cost.',
    keywords: ['담타', '온라인 담타', 'online damta', 'damta world english', '가상 흡연', 'virtual smoking room korea', 'what is damta'],
    faqs: [
      {
        q: 'What does "damta" mean in Korean?',
        a: 'Damta (담타) is a Korean portmanteau of 담배 (cigarette) and 타임 (time) — literally "cigarette time". It became the name of a viral anonymous website where people take virtual smoking breaks together.',
      },
      {
        q: 'Is there an English version of damta?',
        a: 'Yes. PuffBreak is the English-language continuation of the damta concept — anonymous browser-based virtual smoke breaks with ambient rooms, ASMR audio and live chat, free and with no sign-up.',
      },
      {
        q: 'Do I need to smoke to use it?',
        a: 'No. The point is the ritual and the three-minute reset, not the nicotine. PuffBreak is a simulation — virtual cigarette, virtual chai — so anyone can join the break.',
      },
    ],
  },

  // ─────────────────────────── GERMANY · Raucherpause ───────────────────────
  {
    slug: 'raucherpause',
    name: 'The Raucherpause',
    term: 'Raucherpause',
    flag: '🇩🇪',
    lang: 'de',
    region: 'Germany',
    drinkWord: 'coffee',
    roomId: 'office',
    title: 'Raucherpause: Why the German Smoke Break Is a Workplace Institution',
    description:
      'The Raucherpause is German office culture in miniature — a legally protected ritual that became the real meeting room. Here is why it matters, and the digital alternative.',
    hero: 'In Germany, the Raucherpause is where the meeting actually happens.',
    story: [
      'Germany is the land of strong coffee, strong words and strong non-smoking laws — which is exactly why the Raucherpause became a workplace institution. Because smoking inside was banned everywhere (Germany was one of the strictest non-smoking countries in the EU), the smokers were pushed outside, together, in all weather. And there, huddled by the door in the rain, they formed the most functional committee in the company.',
      'The Raucherpause is the place where the CEO finds out what the warehouse really thinks, where two departments that never speak in meetings finally resolve a feud, and where the most important feedback of the week is delivered without a single agenda item. Germans are famously direct, but the pause outside the door has its own etiquette: you can say things there that would be "unangemessen" (inappropriate) in the meeting room.',
      'There is a running German joke that the Raucherpause is the true "Betriebsversammlung" (staff meeting). Non-smokers know it too — which is why so many of them take "frische Luft Pausen" (fresh-air breaks) or a "Kaffee holen" (coffee run) just to stay in the loop. The smoke break is the social currency, and the cigarette is almost incidental.',
      'PuffBreak gives every German worker — smoker or not — their own Raucherpause. The Office Rooftop room is built for exactly that feeling: a quiet place outside the building, a three-minute reset, and a floating chat where colleagues and strangers trade the honest words. With ?lang=de, the whole app speaks your language.',
    ],
    ritual:
      'Outside, in any weather. Coat on, one cigarette or one cup of coffee, three to five minutes, and the day\'s real topics handled in passing. Then back inside, duty done.',
    whyVirtual:
      'Fewer people smoke now, remote work scattered the smoking corner, and fresh-air breaks can be lonely. A virtual Raucherpause gives everyone the same ritual, the same social warmth and the same reset — without standing in the rain.',
    keywords: ['Raucherpause', 'Raucherpause Alternative', 'virtuelle Raucherpause', 'digital smoke break germany', 'Pausenraum online', 'smoke break alternative deutsch'],
    faqs: [
      {
        q: 'What is a Raucherpause?',
        a: 'A Raucherpause is the German word for a smoking break. In practice it is a workplace ritual: smokers (and increasingly non-smokers on fresh-air breaks) step outside together and handle the day\'s real conversations there.',
      },
      {
        q: 'Is there a digital alternative to the Raucherpause?',
        a: 'Yes — PuffBreak is a free, anonymous virtual break room. You get the same outside-the-building reset with 8 ambient rooms, procedural ASMR audio and live chat, without the cigarette or the weather.',
      },
      {
        q: 'Can non-smokers use PuffBreak?',
        a: 'Absolutely. PuffBreak is a simulation — you can light a virtual cigarette, sip virtual chai, or simply take the break. The ritual, not the nicotine, is the point.',
      },
    ],
  },

  // ─────────────────────────── BRAZIL · pausa do cigarro ───────────────────
  {
    slug: 'pausa-cigarro',
    name: 'A Pausa do Cigarro',
    term: 'pausa do cigarro · fumódromo',
    flag: '🇧🇷',
    lang: 'pt',
    region: 'Brazil',
    drinkWord: 'coffee',
    roomId: 'beach',
    title: 'Pausa do Cigarro: Brazil\'s Smoking Corner Is a Social Ritual',
    description:
      'In Brazil, the fumódromo is where offices really talk. Here is the story of the pausa do cigarro — and the free virtual pausa cigarro that replaces it.',
    hero: 'In a Brazilian office, the smoking corner is the boardroom that doesn\'t exist.',
    story: [
      'Ask anyone who works in a Brazilian office: the fumódromo (the smoking corner) has a gravity of its own. It is where the coffee talk turns real, where the manager becomes just another person, and where the gossip — "fofoca" — is delivered with perfect comic timing. In a culture where warmth and relationships are the engine of work, the pausa do cigarro is relationship-building disguised as a cigarette.',
      'Brazilian smoke breaks are rarely silent. There is laughter, there is drama, there is a running commentary on the football from the weekend. The cigarette is the excuse; the conversation is the point. And like the cafezinho (the tiny strong coffee shared across desks), the pausa is a form of currency — being invited to the corner means you are inside the circle.',
      'But Brazil\'s smoking rate has dropped sharply over the past two decades, and remote work scattered the corner to the wind. Non-smokers now hover awkwardly at the edge of the conversation they used to be part of, and home-workers have no corner at all. The ritual survived; the room didn\'t.',
      'PuffBreak is the pausa cigarro that fits in your pocket — the same warm, unhurried three-minute reset, with the Beach Sunset room standing in for the rooftop and the floating chat standing in for the fofoca. Open it with ?lang=pt and the whole app greets you in Portuguese.',
    ],
    ritual:
      'A cigarette (or a cafezinho), good conversation, and the unofficial business of the day handled between laughs. Three minutes that feel like a small holiday.',
    whyVirtual:
      'Smoking is down, remote work is up, and the corner is gone. A virtual pausa gives you the same warmth, the same conversation and the same reset — free, anonymous, and with zero smoke.',
    keywords: ['pausa cigarro', 'pausa do cigarro virtual', 'fumodromo online', 'sala de descanso virtual', 'virtual cigarette brazil', 'pausa digital'],
    faqs: [
      {
        q: 'What is a pausa do cigarro?',
        a: 'It is the Brazilian workplace smoking break — but in practice it is a social ritual. People gather at the smoking corner (fumódromo) to talk, laugh and handle the day\'s real topics over a cigarette or a cafezinho.',
      },
      {
        q: 'How can I take a pausa cigarro online?',
        a: 'PuffBreak is a free virtual break room. Open it in your browser, pick a room (Beach Sunset is a favorite), light a virtual cigarette or sip virtual chai, and join the anonymous chat. No sign-up, no smoke.',
      },
      {
        q: 'Does it work in Portuguese?',
        a: 'Yes — open PuffBreak with ?lang=pt and the app\'s greetings and daily affirmations appear in Portuguese.',
      },
    ],
  },

  // ─────────────────────────── INDIA · chai tapri ───────────────────────────
  {
    slug: 'chai-tapri',
    name: 'The Chai Tapri',
    term: 'चाय की टपरी · chai tapri',
    flag: '🇮🇳',
    lang: 'hi',
    region: 'India',
    drinkWord: 'chai',
    roomId: 'chai',
    title: 'Chai Tapri: India\'s Original Break Room, Digitized',
    description:
      'The tapri — the street chai stall — is India\'s original break room: democracy, gossip and cutting chai in one glass. Here is its digital continuation.',
    hero: 'Every Indian office runs on chai, and every chai runs through the tapri.',
    story: [
      'The tapri is not a café. It is a street corner, a kerosene stove, a steel tray of glasses, and the most democratic room in India. The chai-wala knows everyone\'s order, the first glass of the morning belongs to whoever arrived first, and the conversation — cricket, politics, the boss, the wedding — flows until the last sip of "cutting" chai. It is where the office actually talks, and it always has been.',
      'The word "tapri" carries a specific romance. A tapri is improvised, permanent, and honest. There is no menu because there is only chai. There is no table because the kerosene crate is the table. And yet the most important decisions in a hundred small businesses are made there, over a 10-rupee glass, with the traffic of the street passing by like white noise.',
      'Indian office culture has always leaked out to the tapri — the smoke break, the chai break and the gossip break all happen there, often at the same stall. But modern offices have become smoke-free, glass-walled and far from any street corner. The chai-wala now has to deliver to a desk, and the conversation has thinned out.',
      'PuffBreak\'s Chai Stall room is a love letter to the tapri. Steam rises from a virtual cutting chai, the bazaar hums in the background, and the anonymous chat carries the adda (the chatter) that the glass-walled office lost. Open it with ?lang=hi and even the greeting is in Hindi.',
    ],
    ritual:
      'Walk over, nod at the chai-wala, take your cutting chai, and join the adda. No invitations, no hierarchy — the tapri accepts everyone.',
    whyVirtual:
      'The tapri is the original break room, but not everyone has one nearby anymore. PuffBreak digitizes the ritual: the steam, the buzz, the adda — so any worker, anywhere, gets their chai break back.',
    keywords: ['chai tapri', 'चाय की टपरी', 'chai break india', 'virtual chai', 'tapri culture', 'chai pe charcha', 'sutta break', 'desi break room'],
    faqs: [
      {
        q: 'What is a chai tapri?',
        a: 'A tapri is a roadside chai stall in India — part tea shop, part social institution. It is the original break room: a place where people of every rank gather for cutting chai, conversation and the day\'s real news.',
      },
      {
        q: 'How is the tapri ritual available online?',
        a: 'PuffBreak has a dedicated Chai Stall room with a steaming virtual cup, ambient bazaar audio and anonymous chat — the adda, digitized. It is free and needs no sign-up.',
      },
      {
        q: 'Is there a Hindi version?',
        a: 'Yes — open PuffBreak with ?lang=hi and the greetings, chai hints and daily affirmations appear in Hindi.',
      },
    ],
  },

  // ─────────────────────────── RUSSIA · перекур ─────────────────────────────
  {
    slug: 'perekur',
    name: 'The Perekur',
    term: 'перекур · perekur',
    flag: '🇷🇺',
    lang: 'ru',
    region: 'Russia',
    drinkWord: 'tea',
    roomId: 'office',
    title: 'Perekur (перекур): Russia\'s Legendary Smoke Break',
    description:
      'The перекур is Russian work culture in a ritual — a smoke break with its own rules, its own jokes and its own verb. Here is the story, and the digital perekur.',
    hero: 'In Russia, "перекурим" is a promise: we will sort this out over a smoke.',
    story: [
      'The перекур (from курить, to smoke) is one of the most recognizable rituals in Russian work culture. It has its own verb — "перекурить" (to smoke, to take a smoke break, to think it over with a cigarette) — and its own unwritten constitution. On the factory floor, at the office, in the army, in the hospital corridor: the perekur is the universal pause.',
      'There is a beloved Russian joke: the plant can stop production for anything, but the perekur is sacred. "Перекур" was a legally recognized break on Soviet factory floors, and the habit outlived the system. What survived is the feeling: the perekur is where people stop performing. A boss and a worker smoke the same cigarette, the same silence, the same cold air. "Покурим — и решим" ("we\'ll smoke, and then we\'ll decide") is not a joke; it is a decision procedure.',
      'The perekur has a rhythm: the first smoke of the morning ("утренний перекур"), the one after lunch, the last one before leaving. In winter it is fast and shared, huddled for warmth. In summer it is slow. It is also, quietly, a smoke-free moment for many: Russians will take a перекур with tea ("чайный перекур") or just for the company — the ritual outlives the cigarette.',
      'PuffBreak is a perekur that never ends and never smells. The Office Rooftop room is exactly that huddle above the city at night — a shared three-minute reset with strangers who are also, briefly, off the clock. Open it with ?lang=ru and the app greets you on its own.',
    ],
    ritual:
      'Step outside (or to the window), light up or pour the tea, and for three minutes be a person instead of a role. The decision can wait — "покурим, разберёмся".',
    whyVirtual:
      'Smoke-free offices, remote work and colder rules have scattered the perekur. A virtual version keeps the ritual — the pause, the company, the reset — without the smoke, the cold, or the smell.',
    keywords: ['перекур', 'перекурить', 'виртуальный перекур', 'perekur', 'virtual smoke break russia', 'онлайн перекур', 'перекур онлайн'],
    faqs: [
      {
        q: 'What does perekur (перекур) mean?',
        a: 'Perekur means "smoke break" in Russian, from курить (to smoke). It is also an idiom — "перекурить" means to pause, to think it over, to take a breather with a cigarette or a cup of tea.',
      },
      {
        q: 'Is there a virtual perekur?',
        a: 'Yes. PuffBreak is a free anonymous break room — open it with ?lang=ru for the Russian-localized app, pick a room, and take a three-minute perekur with a virtual cigarette or chai.',
      },
      {
        q: 'Do I need to smoke to take a perekur on PuffBreak?',
        a: 'No. In Russia a "tea perekur" (чайный перекур) is already a thing. On PuffBreak the ritual is the point — the cigarette is virtual and optional.',
      },
    ],
  },

  // ─────────────────────────── UK · fag break ───────────────────────────────
  {
    slug: 'fag-break',
    name: 'The Fag Break',
    term: 'the fag break · the cuppa',
    flag: '🇬🇧',
    lang: 'en',
    region: 'United Kingdom',
    drinkWord: 'tea',
    roomId: 'library',
    title: 'The Fag Break: Britain\'s Smoking Shelter and the Tea Round',
    description:
      'From the smoking shelter to the tea round, the British break is a national institution. Here is its story — and the digital version for the smoke-free era.',
    hero: 'In Britain, you don\'t go outside for a cigarette. You go out for a "fag".',
    story: [
      'The British smoking shelter is a cultural landmark disguised as a bus stop. It is where the office gossip gets its primary sources, where the tea round is negotiated, and where "popping out for a fag" became the most socially acceptable way to escape a spreadsheet. The shelter — all cigarette burns and shared lighters — was the original water cooler, and it was out in the rain.',
      'Britain has been quietly quitting for decades, and the shelter has thinned out. But the British break has a second pillar that outlived the fag: the tea round. The "cuppa" is sacred — the kettle goes on, the round is built (who\'s having what, who\'s on milk, who\'s on "builders\'"), and the entire office realigns around the boiling kettle. The tea round is the smoke break for people who never smoked.',
      'Both rituals share a secret: they are the only sanctioned time a British worker can stop, breathe, and talk to a human being without a reason. The weather is terrible, which makes the shared misery bonding. The tea is strong, which makes the moment real. The British break is not about the smoke or the tea — it is about the collective exhale.',
      'PuffBreak gives Britain\'s workers their shelter and their round in one place: the Library Corner room is built for a quiet cuppa in the rain, the floating chat is the shelter\'s banter, and the whole thing takes three minutes. No lighter, no weather, no standing outside. Just the break.',
    ],
    ritual:
      'Kettle on. Round built. Out to the shelter or down to the kitchen, three minutes of proper chat, then back to the desk with a hot cuppa and a clear head.',
    whyVirtual:
      'Smoking shelters are emptier and remote workers have no kettle to gather around. A digital break room keeps the ritual — the chat, the cuppa, the collective exhale — for every British worker.',
    keywords: ['fag break', 'smoking shelter', 'tea round', 'cuppa break', 'virtual smoke break uk', 'smoke break britain', 'digital break room uk'],
    faqs: [
      {
        q: 'What is a "fag break" in British slang?',
        a: 'It is the British term for a smoking break ("fag" being informal slang for a cigarette). In practice it refers to the whole ritual of stepping outside to the smoking shelter for a break and a chat.',
      },
      {
        q: 'Is there a digital alternative to the smoking shelter?',
        a: 'Yes — PuffBreak is a free, anonymous virtual break room. You get the same three-minute reset, the same banter (via anonymous chat) and the same cuppa (virtual chai), without the smoke or the rain.',
      },
      {
        q: 'What about the tea round?',
        a: 'PuffBreak\'s Chai Stall and Library Corner rooms are built around the warm-drink break. Light the virtual stove, take a virtual cuppa, and join the round from anywhere.',
      },
    ],
  },

  // ─────────────────────────── TURKEY · çay molası ──────────────────────────
  {
    slug: 'cay-molasi',
    name: 'The Çay Molası',
    term: 'çay molası · çay bahçesi',
    flag: '🇹🇷',
    lang: 'tr',
    region: 'Turkey',
    drinkWord: 'chai',
    roomId: 'chai',
    title: 'Çay Molası: The Turkish Tea Break Is a National Ritual',
    description:
      'In Turkey, çay (tea) is not a drink — it is a way of life, and the çay molası is its heartbeat. Here is the story, and the virtual çay bahçesi.',
    hero: 'In Turkey, the first question is not "how are you?" — it is "çay içer misin?" (will you have a tea?).',
    story: [
      'Turkey drinks more tea per person than almost any country on Earth, and it drinks it in a specific glass: narrow at the waist, tulip-shaped, served on a small saucer with two sugar cubes. The çaycı (tea server) moves through offices and shops carrying a round tray of these glasses, and the tray never empties for long. The çay molası (tea break) is not a break from work — it is the rhythm that work runs on.',
      'The ritual has a grammar. The first tea of the day is for the eyes. The glass is refilled the moment it drops below half, and refusing a refill is a small social statement. In a çay bahçesi (tea garden) the conversation stretches for hours; in an office it stretches for exactly the time it takes to drain the glass and decide something. Turkish workplaces know that the decision you make over çay is the decision that sticks.',
      'There is also the matter of the "simit" — the sesame bread ring that arrives with the tea — and the endless negotiation of who pays, which in Turkey is a ritual of its own (everyone insists, someone wins, everyone remembers). The çay molası is generosity, argument, news and gossip all served in a tulip glass.',
      'PuffBreak\'s Chai Stall room speaks this language fluently: the steam, the warmth, the hum of conversation, the anonymous chat that runs like a good sohbet (conversation). Open it with ?lang=tr and the whole app turns Turkish.',
    ],
    ritual:
      'The çaycı arrives, the glasses appear, the conversation opens. You sip, you talk, you decide. Then the tray comes back for round two — and you let it.',
    whyVirtual:
      'Not every desk has a çaycı, and remote work emptied the tray. A virtual çay molası gives every Turkish worker the ritual — the glass, the conversation, the pause — anywhere, for free.',
    keywords: ['çay molası', 'çay bahçesi online', 'sanal çay molası', 'turkish tea break', 'virtual chai turkey', 'çay keyfi', 'turkish tea culture'],
    faqs: [
      {
        q: 'What is a çay molası?',
        a: 'It is the Turkish tea break — a national ritual where workplaces and homes pause for çay served in tulip-shaped glasses, accompanied by conversation. In Turkey it is the heartbeat of the working day.',
      },
      {
        q: 'Is there a virtual çay molası?',
        a: 'Yes — PuffBreak has a Chai Stall room built for exactly this: a steaming virtual cup, ambient bazaar sounds and anonymous chat. Open it with ?lang=tr for the Turkish-localized app.',
      },
      {
        q: 'Does PuffBreak work with Turkish tea culture?',
        a: 'Yes. The ritual is the same: you take the glass (virtual), you sip, you talk, you reset. No sugar cubes required, but we won\'t stop you.',
      },
    ],
  },

  // ─────────────────────────── FRANCE · pause clope ─────────────────────────
  {
    slug: 'pause-clope',
    name: 'La Pause Clope',
    term: 'la pause clope · le tabac',
    flag: '🇫🇷',
    lang: 'fr',
    region: 'France',
    drinkWord: 'coffee',
    roomId: 'office',
    title: 'La Pause Clope: The French Smoke Break as an Art Form',
    description:
      'In France, the pause clope is a small ceremony — part coffee, part cigarette, part philosophy. Here is the story, and the digital pause clope.',
    hero: 'The French do not just take a smoke break. They stage it.',
    story: [
      'The French pause clope has a mise en scène. It starts at the tabac (the tobacco shop, where you buy both cigarettes and the Loto ticket), moves to the café terrace or the office doorway, and involves a specific posture — the lean, the hand, the squint — that the rest of the world secretly envies. It is less a break than a small work of performance art, repeated three times a day.',
      'Under the surface is a very French logic: the pause clope is where thinking happens. French intellectual culture has always treated the cigarette as an accessory to the thought — the pause is the moment when the memo gets written in the head, when the argument gets rehearsed, when the boss and the junior actually talk as equals. The coffee that arrives with it (un express, served with a small glass of water) is the fuel; the clope is the punctuation.',
      'France\'s smoking rate has fallen, workplaces went smoke-free, and the terrace is now often a memory. What survives is the posture and the need: a moment, on your own terms, where the work waits and the mind catches up. Non-smokers in France have long taken the same break with a coffee and a stare at the street — the ritual never needed the cigarette.',
      'PuffBreak is the pause clope without the smoke. The Office Rooftop room at night has the right mood — a city below, a glowing tip, three minutes of your own. Open it with ?lang=fr and the app performs the greeting in French.',
    ],
    ritual:
      'Express in one hand, cigarette (or just the pause) in the other, a squint at the street, and three minutes of unhurried thought. Then back in, sharper than before.',
    whyVirtual:
      'The terrace is gone and the tabac crowd has thinned. A virtual pause clope keeps the ceremony — the posture, the pause, the thinking time — free and anonymous, anywhere.',
    keywords: ['pause clope', 'pause cigarette virtuelle', 'salle de pause en ligne', 'virtual smoke break france', 'pause clope en ligne', 'tabac virtual'],
    faqs: [
      {
        q: 'What is a "pause clope"?',
        a: 'It is the French slang for a cigarette break (clope = cigarette). In practice it is a small daily ceremony — coffee, a cigarette or just the pause, and a few minutes of unhurried thought.',
      },
      {
        q: 'Is there a virtual pause clope?',
        a: 'Yes. PuffBreak is a free anonymous break room. Open it with ?lang=fr, pick a room, and take a three-minute pause clope with a virtual cigarette or a virtual expresso-style break.',
      },
      {
        q: 'Do I need to smoke to use it?',
        a: 'Not at all. The French pause never strictly required the cigarette. On PuffBreak the cigarette is virtual and optional — the pause is the point.',
      },
    ],
  },

  // ─────────────────────────── JAPAN · 気分転換 ─────────────────────────────
  {
    slug: 'kibun-tenkan',
    name: 'Kibun Tenkan',
    term: '気分転換 · kibun tenkan',
    flag: '🇯🇵',
    lang: 'ja',
    region: 'Japan',
    drinkWord: 'tea',
    roomId: 'space',
    title: '気分転換 (Kibun Tenkan): Japan\'s Smoke Break as a Pressure Valve',
    description:
      'Kibun tenkan — changing your mood — is the Japanese art of the reset. The smoking room was its pressure valve. Here is the story, and the digital version.',
    hero: 'In Japan, the smoking room was never really about smoking. It was about 気分転換 — changing your mood.',
    story: [
      'The Japanese word 気分転換 (kibun tenkan) means "change of mood" — a deliberate reset of your mental state. It is a concept Japanese workers take seriously, and for decades the workplace smoking room (喫煙室) was its most reliable tool. A Japanese office smoking room is a tiny, efficient pressure valve: glass walls, a ventilator, a handful of people standing silently, each lost in their own three minutes. No small talk required — the silence is part of the design.',
      'That silence is the point. In a culture where group harmony (和) and formality run deep, the smoking room was one of the few places a worker could step out of their role without explaining why. The ritual has its own etiquette: you enter, nod, smoke or just stand, and return. Nobody asks. The room absorbs the stress that the meeting room cannot.',
      'Japan\'s smoking rate has fallen to historic lows and offices are increasingly smoke-free — the pressure valve is closing. But the need for kibun tenkan did not disappear with the cigarettes. Workers now take 休憩 (kyūkei, breaks) at their desks, staring at screens, which is precisely the thing they needed a break from.',
      'PuffBreak is a dedicated kibun tenkan machine. The Space Station room is the ultimate pressure valve — total isolation, a window onto Earth, a slow drone engineered to lower your heart rate. Three minutes of deliberate nothing. Open it with ?lang=ja and the app switches to Japanese.',
    ],
    ritual:
      'Step into the room, nod, and be silent for three minutes. No small talk, no questions, no performance. Then return to the work, reset.',
    whyVirtual:
      'Smoke-free offices closed the pressure valve. A virtual smoking room gives every Japanese worker the same sanctioned, silent three-minute reset — free, anonymous, and as quiet as they need it to be.',
    keywords: ['気分転換', 'バーチャル喫煙', '仮想喫煙室', 'kibun tenkan', 'virtual smoking room japan', 'オンライン休憩', 'japanese smoke break'],
    faqs: [
      {
        q: 'What does kibun tenkan (気分転換) mean?',
        a: 'It literally means "change of mood" — the Japanese concept of deliberately resetting your mental state. The workplace smoking room has long been its most reliable tool.',
      },
      {
        q: 'Is there a virtual smoking room for Japan?',
        a: 'Yes. PuffBreak is a free, anonymous virtual break room. The Space Station room was designed for exactly this — a silent, isolated three-minute reset. Open it with ?lang=ja.',
      },
      {
        q: 'Is PuffBreak quiet?',
        a: 'You choose. The Space Station room is near-silent, the Silent Room has no audio at all, and the chat is optional. The reset is yours.',
      },
    ],
  },

  // ─────────────────────────── INDONESIA · warung kopi ──────────────────────
  {
    slug: 'warung-kopi',
    name: 'The Warung Kopi',
    term: 'warung kopi · ngeroko',
    flag: '🇮🇩',
    lang: 'id',
    region: 'Indonesia',
    drinkWord: 'coffee',
    roomId: 'chai',
    title: 'Warung Kopi: Indonesia\'s Roadside Coffee Stall and the Ngeroko Break',
    description:
      'The warung kopi — a roadside coffee stall — is Indonesia\'s true break room: a plastic chair, a sachet coffee, and the whole neighborhood. Here is its digital version.',
    hero: 'In Indonesia, the warung kopi is where the day is decided — one sachet coffee at a time.',
    story: [
      'The warung kopi (kopi stall) is a plastic chair, a low table, a gas stove and the most important social institution in Indonesian working life. It serves kopi sachet (sachet coffee) and teh botol (bottled sweet tea) and it holds court on the sidewalk from morning to midnight. Everyone stops there: the ojek driver, the office worker, the shop owner, the student. It is the break room that the office never had.',
      'The ritual is unhurried. You sit, you stir your coffee with a spoon you will stir with again, you smoke (ngeroko) or you don\'t, and the conversation flows — politics, football, the price of everything, the boss. In Indonesian culture, work relationships are built over this table, not in the meeting room. The warung kopi is where trust is brewed.',
      'The smoking part of the ritual — ngeroko — has always been optional and social: a kretek cigarette (clove cigarette) is shared, offered, refused and re-offered, and the smoke is part of the atmosphere. But as smoking rates fall and offices modernize, the ritual has thinned. The stall is still there; the crowd is not.',
      'PuffBreak recreates the warung kopi feeling in a browser: the Chai Stall room hums with background conversation, steam rises from the cup, and the anonymous chat is the sidewalk chatter. Open it with ?lang=id and the app greets you in Indonesian.',
    ],
    ritual:
      'Pull up a plastic chair. Stir your kopi. Talk about nothing important for exactly as long as it takes. Then go back and get on with it — lighter.',
    whyVirtual:
      'The warung kopi is the real break room, but not every worker has one outside the door. A virtual version gives every Indonesian worker the same plastic-chair calm, anywhere — free and anonymous.',
    keywords: ['warung kopi', 'ngeroko', 'kopi susu', 'virtual coffee break indonesia', 'warung kopi online', 'istirahat kopi', 'virtual smoking indonesia'],
    faqs: [
      {
        q: 'What is a warung kopi?',
        a: 'It is an Indonesian roadside coffee stall — a plastic-chair institution where workers, drivers and students gather for sachet coffee, conversation and a proper break. It is Indonesia\'s true break room.',
      },
      {
        q: 'Is there a virtual warung kopi?',
        a: 'Yes. PuffBreak is a free anonymous break room — the Chai Stall room recreates the stall\'s warmth and chatter. Open it with ?lang=id for the Indonesian-localized app.',
      },
      {
        q: 'What is ngeroko?',
        a: 'Ngeroko is Indonesian slang for smoking (taking a smoke break). On PuffBreak the cigarette is virtual — you get the ritual and the reset without the smoke.',
      },
    ],
  },
];

export const getRegionBySlug = (slug: string): RegionProfile | undefined =>
  REGIONS.find((r) => r.slug === slug);
