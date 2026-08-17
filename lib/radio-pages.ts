export interface RadioGuide {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  hook: string;
  intro: string[];
  stationIds: string[];
  sections: Array<{ heading: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  related: string[];
}

// Deliberately small, editorial landing-page set. Each page serves a distinct
// listening intent; this is not a programmatic page-per-keyword factory.
export const RADIO_GUIDES: RadioGuide[] = [
  {
    slug: 'lofi',
    title: 'Best Lo-Fi Radio Online for Work and Short Breaks',
    description: 'Listen to verified lo-fi, chill-beat and downtempo radio streams free in your browser. Human-picked for focus without an infinite feed.',
    eyebrow: 'Low-key signal',
    hook: 'Beats that hold the room without taking it over.',
    intro: [
      'Good lo-fi radio should disappear into the edge of your attention. No autoplay rabbit hole, no playlist admin, no sudden motivational monologue—just a stable stream that makes three quiet minutes feel like a different place.',
      'This shelf pairs one pure lo-fi channel with slower, more textured alternatives. Every direct stream below is tested through the same browser audio path used by PuffBreak.',
    ],
    stationIds: ['hotmix-lofi', 'somafm-beat-blender', 'somafm-groove-salad', 'freecodecamp'],
    sections: [
      { heading: 'For a three-minute reset', body: 'Choose Hotmix Lo-Fi when you want the familiar dusty-beat language. Beat Blender is deeper and less predictable; Groove Salad is softer. Start the stream, lower the room ambience, and let the break end before the music becomes another tab to manage.' },
      { heading: 'For work after the break', body: 'Instrumental and low-vocal stations reduce the chance that language competes with reading or writing. PuffBreak remembers favourites locally, so your work signal is one tap away without an account.' },
    ],
    faqs: [
      { q: 'Can I listen to lo-fi radio online for free?', a: 'Yes. PuffBreak provides free access to verified third-party live streams and requires no account. The stations remain operated by their original broadcasters.' },
      { q: 'Which lo-fi station is best for studying?', a: 'Start with Hotmix Lo-Fi for traditional lo-fi beats or SomaFM Beat Blender for a more varied downtempo sound. Both are low-distraction choices.' },
      { q: 'Does PuffBreak host the music?', a: 'No. PuffBreak is a curated player. Your browser connects to the station operator’s stream, and the station controls its programming and availability.' },
    ],
    related: ['indie', 'best-internet-radio-2026'],
  },
  {
    slug: 'indie',
    title: 'Free Indie Radio Online — Human-Curated Live Streams',
    description: 'Discover independent and alternative music through verified live radio from SomaFM, KEXP, KCRW, FluxFM and triple j.',
    eyebrow: 'Outside the feed',
    hook: 'Indie discovery with actual selectors behind it.',
    intro: [
      'Recommendation engines are good at returning a softer copy of what you already played. Independent radio works differently: a station has a point of view, a local scene and the possibility of hearing something you would not have searched for.',
      'This collection moves from melodic indie pop to adventurous public radio and Berlin alternative programming. It is broad on purpose, but every station earns its place.',
    ],
    stationIds: ['somafm-indie-pop-rocks', 'kexp', 'kcrw-eclectic24', 'fluxfm', 'triple-j'],
    sections: [
      { heading: 'Where to begin', body: 'SomaFM Indie Pop Rocks! is the safest melodic starting point. KEXP is best when discovery is the goal, KCRW Eclectic24 is smoother, FluxFM carries a Berlin edge, and triple j is the window into current Australian alternative music.' },
      { heading: 'Why radio fits a short break', body: 'A live station removes choice. You enter in the middle, hear what is there, and leave three minutes later. That bounded unpredictability is more restorative than searching for the perfect track.' },
    ],
    faqs: [
      { q: 'What is the best free indie radio stream?', a: 'For an accessible default, try SomaFM Indie Pop Rocks!. For deeper discovery, KEXP and KCRW Eclectic24 offer distinct human-curated perspectives.' },
      { q: 'Can I play these indie stations without signing up?', a: 'Yes. PuffBreak requires no account, and the direct stations play in the browser.' },
      { q: 'Is this the same as an algorithmic playlist?', a: 'No. These are live stations programmed by people or broadcaster teams, so everyone hears the station’s current programme rather than a personal recommendation feed.' },
    ],
    related: ['tame-impala-vibe', 'global-hits'],
  },
  {
    slug: 'indian-classical',
    title: 'Indian Classical Radio Online for a Calm Break',
    description: 'A focused starting point for Indian classical, devotional and raga-adjacent listening, with honest notes about stream availability.',
    eyebrow: 'A slower centre',
    hook: 'Raga, devotion and stillness—without pretending they are the same thing.',
    intro: [
      'Indian classical music deserves better than a generic “calm” tag. Hindustani and Carnatic traditions have their own forms, times, instruments and listening cultures. Reliable public browser streams, however, are unusually fragile and frequently change address.',
      'PuffBreak currently leads with Bhaktisudha, a verified devotional station that includes Indian-classical vocabulary. It is not presented as a substitute for a dedicated AIR Raagam service. We will add AIR only when its HLS stream is reliable across the browsers PuffBreak supports.',
    ],
    stationIds: ['bhaktisudha', 'king-fm', 'rnz-concert'],
    sections: [
      { heading: 'What is available now', body: 'Bhaktisudha is the Indian anchor: bhajans, devotional music and classical influence. The two Western classical stations are included as focus alternatives, clearly labelled rather than folded into the same tradition.' },
      { heading: 'Why AIR Raagam is not in the player yet', body: 'AIR’s current links use HLS. Safari can often play HLS natively, while Chrome and Firefox need an additional playback engine. Shipping a card that fails for most visitors would be worse than waiting for proper cross-browser support.' },
    ],
    faqs: [
      { q: 'Does PuffBreak have AIR Raagam?', a: 'Not yet. The currently discoverable AIR Raagam links are HLS streams, and PuffBreak will add one after cross-browser HLS playback and reliability checks are complete.' },
      { q: 'Is Bhaktisudha an Indian classical station?', a: 'It is primarily a devotional and bhajan station with Indian-classical influence. PuffBreak labels it that way rather than claiming it is a dedicated Hindustani or Carnatic service.' },
      { q: 'Can I request a sitar or Carnatic station?', a: 'Yes. Open the PuffBreak radio library and use Request a frequency. A station is added only after its stream passes browser and audio checks.' },
    ],
    related: ['lofi', 'best-internet-radio-2026'],
  },
  {
    slug: 'global-hits',
    title: 'Global Hits Radio Online — Live Pop Without Sign-Up',
    description: 'Play current pop and global hits from Capital FM UK, LOS40, Bollywood Now, SBS PopAsia and more, free in your browser.',
    eyebrow: 'The big signal',
    hook: 'What the world is playing, without building another account.',
    intro: [
      '“Global hits” should mean more than one English-language chart. This shelf moves between UK pop, Spanish and Latin rotation, current Bollywood, Asian pop and contemporary Australian programming.',
      'Capital FM UK is the new mainstream anchor. The rest of the collection keeps the word global honest.',
    ],
    stationIds: ['capital-fm-uk', 'los40', 'bollywood-now', 'sbs-popasia', 'triple-j', 'major-fm'],
    sections: [
      { heading: 'A fast energy reset', body: 'For the 2pm dip, choose a station with a clear pulse and keep the session bounded. Three minutes of a live pop signal can lift the room without turning the break into a half-hour music search.' },
      { heading: 'More than one chart', body: 'LOS40 brings Spanish and Latin hits, Bollywood Now tracks Hindi film pop, SBS PopAsia covers East Asian pop, and MajorFM adds Afrobeats and R&B. The point is movement across scenes, not a single global monoculture.' },
    ],
    faqs: [
      { q: 'Can I listen to Capital FM UK on PuffBreak?', a: 'Yes. PuffBreak uses Capital FM’s current direct MP3 stream, which passed the production audio and browser checks.' },
      { q: 'Does global hits radio include non-English music?', a: 'Yes. This collection includes Spanish, Hindi, Korean, Japanese, Chinese and mixed-language programming alongside English-language pop.' },
      { q: 'Why is BBC Radio 1 not listed?', a: 'The supplied BBC HLS endpoint currently returns a retired-status response. PuffBreak does not publish dead or known geo-restricted cards.' },
    ],
    related: ['indie', 'best-internet-radio-2026'],
  },
  {
    slug: 'tame-impala-vibe',
    title: 'Tame Impala Radio Vibe — Psychedelic Pop and Indie',
    description: 'Start with the official Tame Impala essentials frequency, then move through psychedelic, indie and electronic radio with a similar late-night feel.',
    eyebrow: 'Psychedelic frequency',
    hook: 'For when “indie” is too broad and “chill” is too beige.',
    intro: [
      'There is no honest way to promise a licensed 24/7 Tame Impala broadcast from an unverified stream. PuffBreak instead shuffles a checked artist catalogue inside the break room, then offers live stations that share some of its psychedelic-pop, electronic and alternative atmosphere.',
      'The catalogue uses the embedded YouTube player and stays inside PuffBreak. The neighbouring stations are editorial recommendations, not claims of artist affiliation.',
    ],
    stationIds: ['artist-tame-impala', 'artist-cigarettes-after-sex', 'artist-joji', 'artist-beach-house', 'artist-men-i-trust', 'somafm-lush', 'kcrw-eclectic24', 'fip', 'radio-nova'],
    sections: [
      { heading: 'The closest routes outward', body: 'Cigarettes After Sex and Beach House take the dreamier route; Joji brings nocturnal R&B; Men I Trust adds soft basslines and indie ease. SomaFM Lush, KCRW Eclectic24 and FIP keep discovery live and less predictable.' },
      { heading: 'Artist frequency, clearly labelled', body: 'The Tame Impala option is an in-app artist catalogue, not a claimed terrestrial broadcast or PuffBreak-hosted music stream. That keeps artist discovery useful without blurring ownership or licensing.' },
    ],
    faqs: [
      { q: 'Is this an official Tame Impala radio station?', a: 'No. PuffBreak is not affiliated with Tame Impala. The in-app frequency shuffles a checked YouTube catalogue; the additional live stations are independent editorial recommendations.' },
      { q: 'What radio sounds similar to Tame Impala?', a: 'For dreamy electronic texture try SomaFM Lush. For broader psychedelic and indie discovery, start with KCRW Eclectic24 or FIP.' },
      { q: 'Does the Tame Impala frequency play inside PuffBreak?', a: 'Yes. It plays through the embedded YouTube player without sending you to a separate YouTube page. Direct live stations also continue to play inside PuffBreak.' },
    ],
    related: ['indie', 'lofi'],
  },
  {
    slug: 'chill-artist-radio',
    title: 'Chill Artist Radio — Joji, Cigarettes After Sex, Djo and More',
    description: 'Play in-app artist radio for Joji, Cigarettes After Sex, Lana Del Rey, Beach House, Men I Trust, Djo, Stephen Sanchez, yung kai and more.',
    eyebrow: 'After-dark favourites',
    hook: 'Soft-focus artist radio that never kicks you out of the room.',
    intro: [
      'Some breaks need a familiar voice, not a genre search. This shelf brings together dream pop, bedroom pop, nocturnal R&B and warm indie songwriting: Cigarettes After Sex, Joji, Lana Del Rey, Beach House, Men I Trust, Mac DeMarco, The Marías, Stephen Sanchez, yung kai and Djo.',
      'Each frequency shuffles a checked catalogue inside PuffBreak. Turn the radio down and the catalogue keeps moving silently, so returning feels like tuning back into a station rather than restarting a track.',
    ],
    stationIds: ['artist-cigarettes-after-sex', 'artist-joji', 'artist-lana-del-rey', 'artist-beach-house', 'artist-men-i-trust', 'artist-mac-demarco', 'artist-the-marias', 'artist-stephen-sanchez', 'artist-yung-kai', 'artist-djo', 'artist-the-weeknd', 'artist-billie-eilish', 'artist-harry-styles'],
    sections: [
      { heading: 'Choose the temperature', body: 'For the slowest glow, begin with Cigarettes After Sex or Beach House. Joji and The Weeknd are darker; Men I Trust and The Marías are lighter on their feet. Stephen Sanchez and yung kai lean romantic, while Djo and Mac DeMarco add a stranger psychedelic edge.' },
      { heading: 'Radio behaviour, not another tab', body: 'Play, pause, change frequency and adjust volume from the PuffBreak mixer. Artist catalogues use an embedded player and do not redirect the play button to YouTube.' },
    ],
    faqs: [
      { q: 'Can I listen to Joji or Cigarettes After Sex radio without leaving PuffBreak?', a: 'Yes. Their checked catalogues play through the embedded player inside PuffBreak.' },
      { q: 'What should I play for a calm late-night break?', a: 'Try Cigarettes After Sex for minimal dream pop, Beach House for hazier texture, Men I Trust for soft grooves, or Joji for nocturnal alternative R&B.' },
      { q: 'Is PuffBreak affiliated with these artists?', a: 'No. PuffBreak is an independent listening interface. Artist names identify the catalogue being played, not an endorsement or partnership.' },
    ],
    related: ['tame-impala-vibe', 'indie', 'lofi'],
  },
  {
    slug: 'pop-hip-hop-artist-radio',
    title: 'Pop and Hip-Hop Artist Radio — Drake, Bad Bunny, BLACKPINK and More',
    description: 'Free in-app artist radio for Drake, Kanye West, Bad Bunny, Ariana Grande, Billie Eilish, Eminem, Shakira, BLACKPINK, KAROL G and more.',
    eyebrow: 'Big-name dial',
    hook: 'Global pop and rap, tuned for a short reset.',
    intro: [
      'This is the high-recognition shelf: Drake, Kanye West, Bad Bunny, The Weeknd, Ariana Grande, Ed Sheeran, Billie Eilish, Eminem, Shakira, BLACKPINK, KAROL G and Harry Styles. It moves across rap, R&B, K-pop, Latin pop, reggaeton and singer-songwriter pop without pretending those scenes are interchangeable.',
      'Kanye West Radio uses a verified browser-safe 24/7 artist stream. When an equally dependable direct station is not available, PuffBreak uses checked embedded catalogues that stay inside the app and shuffle automatically.',
    ],
    stationIds: ['artist-drake', 'artist-kanye-west', 'artist-bad-bunny', 'artist-the-weeknd', 'artist-ariana-grande', 'artist-ed-sheeran', 'artist-billie-eilish', 'artist-eminem', 'artist-shakira', 'artist-blackpink', 'artist-karol-g', 'artist-harry-styles'],
    sections: [
      { heading: 'Match the break, not the chart', body: 'Choose Bad Bunny, KAROL G or Shakira for movement; Drake or The Weeknd for a lower-lit room; BLACKPINK or Ariana Grande for bright pop energy; Billie Eilish for quieter intensity; Eminem or Kanye West for rap catalogue depth.' },
      { heading: 'Direct when dependable, catalogues when not', body: 'Kanye West Radio uses a tested direct broadcast. Unofficial artist streams often disappear or fail browser security checks, so the remaining artists use validated in-app catalogues instead of unreliable “24/7” claims.' },
    ],
    faqs: [
      { q: 'Does artist radio open an external YouTube page?', a: 'No. Artist frequencies use either a direct live stream or PuffBreak’s embedded player; the play control stays in the break room.' },
      { q: 'Is Kanye West Radio a continuous live station?', a: 'Yes. PuffBreak uses a verified direct MP3 stream dedicated to Kanye West, so it plays continuously without loading YouTube video.' },
      { q: 'Are these continuous live broadcasts?', a: 'They are continuously shuffled artist catalogues, not claimed live broadcasts. PuffBreak uses direct live streams only when the station endpoint is dependable and browser-safe.' },
      { q: 'Can I mix artist radio with ASMR ambience?', a: 'Yes. Radio, room ambience and cigarette crackle have independent volume controls.' },
    ],
    related: ['global-hits', 'chill-artist-radio', 'best-internet-radio-2026'],
  },
  {
    slug: 'desi-hip-hop',
    title: 'Desi Hip-Hop Radio — KR$NA, Seedhe Maut, Raftaar and Talha Anjum',
    description: 'Play free Desi hip-hop artist radio for KR$NA, Seedhe Maut, Raftaar, Talha Anjum, Karan Aujla and Sidhu Moose Wala inside PuffBreak.',
    eyebrow: 'Bars across borders',
    hook: 'Delhi, Mumbai, Punjab and Karachi—one DHH shelf, no lazy flattening.',
    intro: [
      'Desi hip-hop is not a single sound. KR$NA brings technical Hindi-English rap, Seedhe Maut move between sharp Delhi writing and experimentation, Raftaar connects battle-rap energy with mainstream production, and Talha Anjum anchors the Urdu-rap route from Karachi.',
      'KR$NA, Seedhe Maut and Raftaar use YouTube Music’s own 50-track artist catalogues. Talha Anjum uses a checked 25-track selection built around the complete official Open Letter album. Every frequency plays inside PuffBreak without sending the listener to another page.',
    ],
    stationIds: ['artist-krsna', 'artist-seedhe-maut', 'artist-raftaar', 'artist-talha-anjum', 'artist-karan-aujla', 'artist-sidhu-moose-wala'],
    sections: [
      { heading: 'Where to start', body: 'Choose KR$NA for punchlines and technical delivery, Seedhe Maut for restless duo chemistry, Raftaar for high-energy crossover, or Talha Anjum for reflective Urdu rap. Karan Aujla and Sidhu Moose Wala extend the shelf into Punjabi hip-hop.' },
      { heading: 'A radio-shaped catalogue', body: 'The catalogue shuffles automatically, continues silently when radio volume is turned down, and resumes at its current point. It behaves like a frequency while staying honest that these are in-app artist catalogues rather than claimed terrestrial broadcasts.' },
    ],
    faqs: [
      { q: 'Where can I listen to Desi hip-hop radio online for free?', a: 'PuffBreak offers free in-app artist frequencies for KR$NA, Seedhe Maut, Raftaar, Talha Anjum and more. No account is required.' },
      { q: 'How many songs are in each featured DHH catalogue?', a: 'KR$NA, Seedhe Maut and Raftaar each use a 50-song YouTube Music artist catalogue. Talha Anjum uses 25 checked tracks, including the complete official Open Letter album.' },
      { q: 'Does pressing play open YouTube?', a: 'No. Playback stays inside the PuffBreak room through the embedded audio player; the interface does not redirect the listener to a YouTube page.' },
      { q: 'Is PuffBreak affiliated with these artists?', a: 'No. Artist names describe the listening catalogue. PuffBreak is an independent break-room interface and does not claim artist endorsement.' },
    ],
    related: ['indian-artist-radio', 'pop-hip-hop-artist-radio', 'global-hits'],
  },
  {
    slug: 'global-cult-indie-radio',
    title: 'Global Cult Indie Radio — Underground Artists from 27 Countries',
    description: 'Discover cult and independent artists from the USA, Mexico, Brazil, India, Pakistan, Japan, Taiwan, Ghana, DR Congo, Lebanon and beyond.',
    eyebrow: 'The smaller signal',
    hook: 'Twenty-seven scenes worth hearing before the algorithm sands off their edges.',
    intro: [
      'Global indie discovery should not mean exporting the same English-language guitar playlist everywhere. This shelf follows local scenes: Montréal krautrock, Brazilian MPB, Chilean emo, Turkish punk, Karachi experimental music, Taiwanese shoegaze, Durban gqom and Beirut ambient work.',
      'These are deliberately cult and emerging picks, not a popularity chart. Each artist frequency is labelled by country, language and sound so listeners can explore without pretending every underground tradition is interchangeable.',
    ],
    stationIds: ['artist-lrain', 'artist-corridor', 'artist-melted-ice-cream', 'artist-luiza-brina', 'artist-panchito-villa', 'artist-estoy-bien', 'artist-still-house-plants', 'artist-benoit-b', 'artist-hidrogenesse', 'artist-pega-monstro', 'artist-exwhite', 'artist-tampon', 'artist-lifafa', 'artist-slowspin', 'artist-hiperson', 'artist-tamanaramen', 'artist-yeong-die', 'artist-huan-huan', 'artist-bedchamber', 'artist-sobs', 'artist-lustbass', 'artist-khana-bierbood', 'artist-scott-charlenes-wedding', 'artist-alex-wondergem', 'artist-citizen-boy', 'artist-lova-lova', 'artist-fadi-tabbal'],
    sections: [
      { heading: 'Pick a route, not a ranking', body: 'For soft-focus listening try Huan Huan, Bedchamber or Slowspin. For guitar friction choose Estoy Bien, Pega Monstro or ExWhite. For electronic exploration move through Tamanaramen, Benoit B, Citizen Boy and Fadi Tabbal.' },
      { heading: 'Why the shelf stays selective', body: 'Small catalogues are better represented honestly than padded with unrelated uploads. PuffBreak uses checked artist results and keeps rare artists visible even when their available catalogue is shorter than a mainstream artist’s.' },
    ],
    faqs: [
      { q: 'What is global cult indie radio?', a: 'It is a human-curated shelf of independent and underground artists rooted in different local scenes, rather than one generic indie genre feed.' },
      { q: 'Which countries are represented?', a: 'The collection currently spans 27 country and scene picks across the Americas, Europe, Asia, Africa and the Middle East.' },
      { q: 'Do artist frequencies play inside PuffBreak?', a: 'Yes. The catalogues use the embedded player and do not turn the radio control into an external YouTube link.' },
    ],
    related: ['indie', 'desi-hip-hop', 'chill-artist-radio'],
  },
  {
    slug: 'indian-artist-radio',
    title: 'Indian Artist Radio — A. R. Rahman, Anuv Jain, Lifafa, Pritam and More',
    description: 'Play in-app Indian artist radio for A. R. Rahman, Anirudh, Pritam, Anuv Jain, Lifafa, Peter Cat Recording Co., OAFF and more.',
    eyebrow: 'India on the dial',
    hook: 'Film scores, Tamil energy and Punjabi heat in one clean shelf.',
    intro: [
      'Indian music discovery is often flattened into one Bollywood label. This shelf keeps the routes visible: A. R. Rahman and Pritam across film music, Anirudh Ravichander’s Tamil-led pop energy, Karan Aujla and Sidhu Moose Wala in Punjabi music, plus Anuv Jain, Osho Jain, Lifafa, Peter Cat Recording Co., Divyam Sodhi, OAFF, Bharat Chauhan and Prateek Kuhad across independent scenes.',
      'Direct artist streams are used only when dependable. The remaining frequencies shuffle checked embedded catalogues inside PuffBreak, with no external play-button redirect.',
    ],
    stationIds: ['artist-ar-rahman', 'artist-anirudh-ravichander', 'artist-pritam', 'artist-anuv-jain', 'artist-osho-jain', 'artist-lifafa', 'artist-pcrc', 'artist-divyam-sodhi', 'artist-oaff', 'artist-karan-aujla', 'artist-sidhu-moose-wala', 'artist-arijit-singh', 'artist-bharat-chauhan', 'artist-prateek-kuhad-live'],
    sections: [
      { heading: 'Several different starting points', body: 'Begin with A. R. Rahman for spacious composition, Anirudh for quick energy, or Pritam for Hindi-film breadth. Lifafa and OAFF bring electronic texture; Peter Cat Recording Co. bends indie rock toward jazz; Anuv Jain, Osho Jain, Divyam Sodhi, Bharat Chauhan and Prateek Kuhad make the room smaller and more intimate.' },
      { heading: 'Built for a real short break', body: 'The player shuffles for you, remembers favourites locally and lets music coexist with chai, rain, room tone or silence. There is no account and no playlist work to do.' },
    ],
    faqs: [
      { q: 'Can I listen to A. R. Rahman radio online for free?', a: 'Yes. PuffBreak’s A. R. Rahman artist frequency is free, requires no account and plays through the in-app embedded catalogue.' },
      { q: 'Is there Anirudh Ravichander and Pritam radio?', a: 'Yes. Both have dedicated shuffled artist frequencies in the PuffBreak radio library.' },
      { q: 'Does Sidhu Moose Wala or Karan Aujla radio leave the app?', a: 'No. Both use checked in-app catalogues rather than an external YouTube link.' },
      { q: 'Does PuffBreak have Indian indie artist radio?', a: 'Yes. Anuv Jain, Osho Jain, Lifafa, Peter Cat Recording Co., Divyam Sodhi, OAFF, Bharat Chauhan and Prateek Kuhad each have an in-app artist frequency.' },
    ],
    related: ['global-hits', 'indian-classical', 'chill-artist-radio'],
  },
  {
    slug: 'best-internet-radio-2026',
    title: 'Best Internet Radio Stations in 2026 — 15 Human Picks',
    description: 'Fifteen reliable internet radio stations for focus, discovery, calm and energy, selected and browser-tested by PuffBreak in 2026.',
    eyebrow: '2026 field guide',
    hook: 'Fifteen stations worth keeping—not five hundred logos to scroll past.',
    intro: [
      'The best internet radio directory is not the one with the largest database. It is the one where the play button works and every recommendation has a reason to exist.',
      'This 2026 list favours distinctive programming, dependable browser playback and genuine geographic range. Stream operators can still change endpoints, so PuffBreak continues to retest the production shelf.',
    ],
    stationIds: ['radioparadise-main', 'somafm-groove-salad', 'somafm-indie-pop-rocks', 'somafm-drone-zone', 'kexp', 'kcrw-eclectic24', 'fip', 'swiss-jazz', 'capital-fm-uk', 'bhaktisudha', 'japan-city-pop', 'amapiano-fm', 'bossa-jazz-brasil', 'triple-j', 'hotmix-lofi'],
    sections: [
      { heading: 'How the list was selected', body: 'A station needs a clear editorial identity, a working stream, browser-compatible delivery and a reason to choose it over the station beside it. Audience size is not the deciding factor.' },
      { heading: 'Pick by need, not genre taxonomy', body: 'For focus: Groove Salad, Drone Zone or Hotmix Lo-Fi. For discovery: KEXP, FIP or triple j. For warmth: Radio Paradise, Swiss Jazz or Bossa Jazz Brasil. For energy: Capital FM, Amapiano FM or Japan City Pop.' },
    ],
    faqs: [
      { q: 'What is the best internet radio station in 2026?', a: 'Radio Paradise is the strongest all-purpose starting point. KEXP is better for discovery, SomaFM Groove Salad for focus, and FIP for an eclectic European perspective.' },
      { q: 'Are these internet radio streams free?', a: 'Yes. PuffBreak charges nothing and requires no account. The broadcasters operate their own streams and may have their own policies.' },
      { q: 'How often are the stations checked?', a: 'New additions are checked before release through the production audio path. Because station operators can change URLs at any time, failed streams are reviewed and replaced or removed.' },
    ],
    related: ['lofi', 'indie', 'global-hits'],
  },
];

export const getRadioGuide = (slug: string) => RADIO_GUIDES.find((guide) => guide.slug === slug);
