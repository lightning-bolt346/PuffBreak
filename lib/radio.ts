import { REQUESTED_ARTIST_STATIONS } from './artist-catalogues';

// Production radio catalogue. Every URL must pass the browser-accurate probe in
// scripts/_test_radio_cors.mjs before it is shipped: the app routes streams
// through Web Audio, so permissive CORS and real audio bytes are both required.

export type RadioMood = 'Unwind' | 'Focus' | 'Discover' | 'Energy' | 'Nostalgia';

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  region: string;
  country: string;
  icon: string;
  url: string;
  genres: string[];
  languages: string[];
  moods: RadioMood[];
  featured?: boolean;
  artist?: string;
  /** Direct streams use HTMLAudio/Web Audio; playlists use the official YouTube iframe player. */
  source?: 'stream' | 'youtube-playlist';
  playlistId?: string;
  videoIds?: string[];
  /** ISO date used by the audition lab to surface the newest testing batch automatically. */
  addedAt?: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'freecodecamp', name: 'FreeCodeCamp Radio', icon: '⌁', region: 'Global', country: 'Internet',
    tagline: 'Instrumental electronic for focus', url: 'https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3',
    genres: ['Electronic', 'Instrumental'], languages: ['Instrumental'], moods: ['Focus', 'Energy'], featured: true,
  },
  {
    id: 'radioparadise-main', name: 'Radio Paradise', icon: '◉', region: 'Global', country: 'USA',
    tagline: 'Human-curated eclectic mix', url: 'https://stream.radioparadise.com/mp3-192',
    genres: ['Eclectic', 'Rock', 'World'], languages: ['English', 'Mixed'], moods: ['Discover', 'Unwind'], featured: true,
  },
  {
    id: 'radioparadise-mellow', name: 'Radio Paradise Mellow', icon: '☾', region: 'Global', country: 'USA',
    tagline: 'Soft, warm and low-key', url: 'https://stream.radioparadise.com/mellow-192',
    genres: ['Mellow', 'Acoustic', 'Electronic'], languages: ['English', 'Mixed'], moods: ['Unwind', 'Focus'], featured: true,
  },
  {
    id: 'somafm-indie-pop-rocks', name: 'SomaFM Indie Pop Rocks!', icon: 'IP', region: 'North America', country: 'USA',
    tagline: 'Melodic indie without the algorithm', url: 'https://ice1.somafm.com/indiepop-128-mp3',
    genres: ['Indie', 'Indie Pop', 'Alternative'], languages: ['English'], moods: ['Discover', 'Energy'], featured: true,
    addedAt: '2026-08-17',
  },
  {
    id: 'somafm-groove-salad', name: 'SomaFM Groove Salad', icon: 'GS', region: 'North America', country: 'USA',
    tagline: 'Downtempo rhythm with soft edges', url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    genres: ['Downtempo', 'Chillout', 'Electronic'], languages: ['Instrumental', 'Mixed'], moods: ['Unwind', 'Focus'], featured: true,
    addedAt: '2026-08-17',
  },
  {
    id: 'somafm-lush', name: 'SomaFM Lush', icon: 'LU', region: 'North America', country: 'USA',
    tagline: 'Mellow electronic with female vocals', url: 'https://ice1.somafm.com/lush-128-mp3',
    genres: ['Electronic', 'Dream Pop', 'Vocal'], languages: ['English', 'Mixed'], moods: ['Unwind', 'Discover'],
    addedAt: '2026-08-17',
  },
  {
    id: 'somafm-beat-blender', name: 'SomaFM Beat Blender', icon: 'BB', region: 'North America', country: 'USA',
    tagline: 'Deep beats for a low-key reset', url: 'https://ice1.somafm.com/beatblender-128-mp3',
    genres: ['Downtempo', 'Chill Beats', 'Electronic'], languages: ['Instrumental', 'Mixed'], moods: ['Focus', 'Unwind'],
    addedAt: '2026-08-17',
  },
  {
    id: 'somafm-drone-zone', name: 'SomaFM Drone Zone', icon: 'DZ', region: 'North America', country: 'USA',
    tagline: 'Deep-space ambient, almost weightless', url: 'https://ice1.somafm.com/dronezone-128-mp3',
    genres: ['Ambient', 'Drone', 'Space Music'], languages: ['Instrumental'], moods: ['Focus', 'Unwind'], featured: true,
    addedAt: '2026-08-17',
  },
  {
    id: 'kexp', name: 'KEXP', icon: 'K', region: 'North America', country: 'USA',
    tagline: 'Independent music discovery', url: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
    genres: ['Indie', 'Alternative', 'World'], languages: ['English'], moods: ['Discover', 'Energy'], featured: true,
  },
  {
    id: 'kcrw-eclectic24', name: 'KCRW Eclectic24', icon: '24', region: 'North America', country: 'USA',
    tagline: 'LA selectors, all music', url: 'https://streams.kcrw.com/e24_mp3',
    genres: ['Eclectic', 'Indie', 'Soul'], languages: ['English'], moods: ['Discover', 'Focus'], featured: true,
  },
  {
    id: 'king-fm', name: 'Classical KING FM', icon: '♩', region: 'North America', country: 'USA',
    tagline: 'Classical calm, beautifully programmed', url: 'https://classicalking.streamguys1.com/king-fm-aac-128k',
    genres: ['Classical', 'Orchestral'], languages: ['Instrumental', 'English'], moods: ['Focus', 'Unwind'],
  },
  {
    id: 'fip', name: 'FIP', icon: 'F', region: 'Europe', country: 'France',
    tagline: 'Parisian eclectic, effortlessly curated', url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    genres: ['Eclectic', 'Jazz', 'World'], languages: ['French', 'Mixed'], moods: ['Discover', 'Unwind'], featured: true,
  },
  {
    id: 'fip-jazz', name: 'FIP Jazz', icon: 'J', region: 'Europe', country: 'France',
    tagline: 'Jazz, soul and modern classics', url: 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3',
    genres: ['Jazz', 'Soul'], languages: ['Instrumental', 'Mixed'], moods: ['Unwind', 'Focus'],
  },
  {
    id: 'fip-groove', name: 'FIP Groove', icon: 'G', region: 'Europe', country: 'France',
    tagline: 'Funk, soul and disco warmth', url: 'https://icecast.radiofrance.fr/fipgroove-midfi.mp3',
    genres: ['Funk', 'Soul', 'Disco'], languages: ['Mixed'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'fip-rock', name: 'FIP Rock', icon: 'R', region: 'Europe', country: 'France',
    tagline: 'Curated alternative and classic rock', url: 'https://icecast.radiofrance.fr/fiprock-midfi.mp3',
    genres: ['Rock', 'Alternative'], languages: ['English', 'Mixed'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'swiss-pop', name: 'Radio Swiss Pop', icon: 'CH', region: 'Europe', country: 'Switzerland',
    tagline: 'Familiar melodic pop', url: 'https://stream.srg-ssr.ch/srgssr/rsp/mp3/128',
    genres: ['Pop'], languages: ['English', 'German', 'French', 'Italian'], moods: ['Unwind', 'Nostalgia'],
  },
  {
    id: 'swiss-jazz', name: 'Radio Swiss Jazz', icon: 'SJ', region: 'Europe', country: 'Switzerland',
    tagline: 'Jazz, blues and swing', url: 'https://stream.srg-ssr.ch/srgssr/rsj/mp3/128',
    genres: ['Jazz', 'Blues', 'Swing'], languages: ['Instrumental', 'Mixed'], moods: ['Unwind', 'Focus'],
  },
  {
    id: 'fluxfm', name: 'FluxFM', icon: 'FX', region: 'Europe', country: 'Germany',
    tagline: 'Berlin indie and electronic', url: 'https://channels.fluxfm.de/FluxFM/externalembedflxhp/stream.mp3',
    genres: ['Indie', 'Alternative', 'Electronic'], languages: ['German', 'English'], moods: ['Discover', 'Energy'],
  },
  {
    id: 'los40', name: 'LOS40', icon: '40', region: 'Europe', country: 'Spain',
    tagline: 'Spanish pop and Latin hits', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3',
    genres: ['Pop', 'Latin'], languages: ['Spanish'], moods: ['Energy'],
  },
  {
    id: 'capital-fm-uk', name: 'Capital FM UK', icon: 'CF', region: 'Europe', country: 'United Kingdom',
    tagline: 'Current chart pop and global hits', url: 'https://media-ice.musicradio.com/CapitalMP3',
    genres: ['Pop', 'Dance', 'Global Hits'], languages: ['English'], moods: ['Energy', 'Discover'], featured: true,
    addedAt: '2026-08-17',
  },
  {
    id: 'radio-mirchi', name: 'Radio Mirchi', icon: 'M', region: 'South Asia', country: 'India',
    tagline: 'Bollywood hits and Indian pop', url: 'https://eu8.fastcast4u.com/proxy/clyedupq/stream',
    genres: ['Bollywood', 'Pop'], languages: ['Hindi'], moods: ['Energy', 'Nostalgia'], featured: true,
  },
  {
    id: 'bollywood-now', name: 'Bollywood Now', icon: 'BN', region: 'South Asia', country: 'India',
    tagline: 'Current Hindi film music', url: 'https://drive.uber.radio/uber/bollywoodnow/icecast.audio',
    genres: ['Bollywood', 'Pop'], languages: ['Hindi'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'bollywood-evergreen', name: 'Bollywood Evergreen', icon: 'BE', region: 'South Asia', country: 'India',
    tagline: 'Golden Hindi melodies', url: 'https://stream.zeno.fm/n2fd0edh9k8uv',
    genres: ['Bollywood', 'Oldies'], languages: ['Hindi'], moods: ['Nostalgia', 'Unwind'], featured: true,
  },
  {
    id: 'japan-city-pop', name: 'Japan City Pop', icon: 'JP', region: 'East Asia', country: 'Japan',
    tagline: 'Retro neon city pop', url: 'https://play.streamafrica.net/japancitypop',
    genres: ['City Pop', 'Retro', 'Pop'], languages: ['Japanese'], moods: ['Nostalgia', 'Discover'], featured: true,
  },
  {
    id: 'bigb-kpop', name: 'Big B Radio K-Pop', icon: 'KR', region: 'East Asia', country: 'South Korea',
    tagline: 'K-pop and Korean hits', url: 'https://antares.dribbcast.com/proxy/kpop?mp=/s',
    genres: ['K-Pop', 'Pop'], languages: ['Korean'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'hotmix-medina', name: 'Hotmix Medina', icon: 'HM', region: 'Middle East', country: 'Regional',
    tagline: 'Arabic and Persian contemporary hits', url: 'https://streaming.hotmixradio.com/hotmix-medina-en-mp3?provider=radiobrowse',
    genres: ['Arabic Pop', 'Persian Pop'], languages: ['Arabic', 'Persian'], moods: ['Discover', 'Energy'],
  },
  {
    id: 'amr-diab', name: 'Amr Diab Radio', icon: 'AD', region: 'Middle East', country: 'Egypt',
    tagline: 'Egyptian and Arabic pop', url: 'https://stream-40.zeno.fm/xa4yhh4k838uv',
    genres: ['Arabic Pop'], languages: ['Arabic'], moods: ['Unwind', 'Nostalgia'], artist: 'Amr Diab',
  },
  {
    id: 'amapiano-fm', name: 'Amapiano FM', icon: 'ZA', region: 'Africa', country: 'South Africa',
    tagline: 'Warm South African rhythm', url: 'https://stream.zeno.fm/xs6zeac1ts8uv',
    genres: ['Amapiano', 'House'], languages: ['Mixed'], moods: ['Energy', 'Discover'], featured: true,
  },
  {
    id: 'major-fm', name: 'MajorFM', icon: 'NG', region: 'Africa', country: 'Nigeria',
    tagline: 'Afrobeats, R&B and lounge', url: 'https://stream.zeno.fm/pkza99xshkhvv',
    genres: ['Afrobeats', 'R&B', 'Hip-Hop'], languages: ['English', 'Mixed'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'bossa-jazz-brasil', name: 'Bossa Jazz Brasil', icon: 'BR', region: 'Latin America', country: 'Brazil',
    tagline: 'Bossa nova, samba and Brazilian jazz', url: 'https://centova5.transmissaodigital.com:20104/live',
    genres: ['Bossa Nova', 'Jazz', 'Samba'], languages: ['Portuguese', 'Instrumental'], moods: ['Unwind', 'Focus'], featured: true,
  },
  {
    id: 'saudade-fm', name: 'Rádio Saudade', icon: 'RS', region: 'Latin America', country: 'Brazil',
    tagline: 'Romantic Brazilian oldies', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SAUDADE_FMAAC.aac',
    genres: ['Brazilian', 'Oldies'], languages: ['Portuguese'], moods: ['Nostalgia', 'Unwind'],
  },
  {
    id: 'triple-j', name: 'triple j', icon: 'JJJ', region: 'Oceania', country: 'Australia',
    tagline: 'New Australian and alternative music', url: 'https://abc.streamguys1.com/live/triplejnsw/icecast.audio',
    genres: ['Alternative', 'Indie', 'Pop'], languages: ['English'], moods: ['Discover', 'Energy'],
  },
  {
    id: 'rnz-concert', name: 'RNZ Concert', icon: 'NZ', region: 'Oceania', country: 'New Zealand',
    tagline: 'Classical and live performance', url: 'https://stream-ice.radionz.co.nz/concert.mp3',
    genres: ['Classical', 'Contemporary'], languages: ['Instrumental', 'English'], moods: ['Focus', 'Unwind'],
  },

  // Hip-hop and R&B: era, language and geography matter more than one giant
  // generic bucket, so this set deliberately spans old-school, current,
  // Latin, North African and South Asian crossover programming.
  {
    id: '181-old-school', name: '181.FM Old School', icon: 'OG', region: 'North America', country: 'USA',
    tagline: 'Old-school hip-hop and R&B', url: 'https://listen.181fm.com/181-oldschool_128k.mp3',
    genres: ['Old School Hip-Hop', 'R&B', 'Rap'], languages: ['English'], moods: ['Nostalgia', 'Energy'], featured: true,
  },
  {
    id: '181-the-beat', name: '181.FM The Beat', icon: 'BT', region: 'North America', country: 'USA',
    tagline: 'Current hip-hop and R&B rotation', url: 'https://listen.181fm.com/181-beat_128k.mp3',
    genres: ['Hip-Hop', 'R&B', 'Rap'], languages: ['English'], moods: ['Energy', 'Discover'], featured: true,
  },
  {
    id: 'radio-nova', name: 'Radio Nova', icon: 'NV', region: 'Europe', country: 'France',
    tagline: 'Future soul, hip-hop and global grooves', url: 'https://novazz.ice.infomaniak.ch/novazz-128.mp3',
    genres: ['Hip-Hop', 'Soul', 'Global'], languages: ['French', 'English', 'Mixed'], moods: ['Discover', 'Unwind'], featured: true,
  },
  {
    id: 'flava-nz', name: 'Flava', icon: 'FL', region: 'Oceania', country: 'New Zealand',
    tagline: 'Old-school hip-hop and R&B favourites', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/NZME_08AAC.aac',
    genres: ['Old School Hip-Hop', 'R&B'], languages: ['English'], moods: ['Nostalgia', 'Energy'],
  },
  {
    id: 'los40-urban', name: 'LOS40 Urban', icon: 'U40', region: 'Europe', country: 'Spain',
    tagline: 'Latin urban, rap and reggaeton', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3',
    genres: ['Latin Urban', 'Rap', 'Reggaeton'], languages: ['Spanish'], moods: ['Energy', 'Discover'],
  },
  {
    id: 'rap-lbeldi', name: 'Rap Lbeldi', icon: 'MA', region: 'Africa', country: 'Morocco',
    tagline: 'Moroccan rap and Maghrebi voices', url: 'https://stream.zeno.fm/ivdufrl7q0quv',
    genres: ['Moroccan Rap', 'Hip-Hop'], languages: ['Arabic', 'French'], moods: ['Discover', 'Energy'],
  },
  {
    id: 'bhaktisudha', name: 'Bhaktisudha', icon: 'ॐ', region: 'South Asia', country: 'India',
    tagline: 'Bhajans and devotional calm', url: 'https://n0a.radiojar.com/cfqyfcspcv8uv',
    genres: ['Bhajan', 'Devotional', 'Indian Classical'], languages: ['Hindi', 'Sanskrit'], moods: ['Unwind', 'Focus'], featured: true,
  },
  {
    id: 'hotmix-lofi', name: 'Hotmix Lo-Fi', icon: 'LF', region: 'Global', country: 'France',
    tagline: 'Low-key beats for an unhurried reset', url: 'https://streaming.hotmixradio.com/hotmix-lofi-en-mp3?provider=radiobrowser',
    genres: ['Lo-Fi', 'Chillhop', 'Instrumental'], languages: ['Instrumental'], moods: ['Focus', 'Unwind'], featured: true,
  },
  {
    id: 'city-fm-89', name: 'City FM 89', icon: 'PK', region: 'South Asia', country: 'Pakistan',
    tagline: 'Pakistan’s contemporary music mix', url: 'https://radio.cityfm89.com/stream',
    genres: ['Pop', 'Pakistani Pop', 'Contemporary'], languages: ['English', 'Urdu'], moods: ['Energy', 'Discover'], featured: true,
  },
  {
    id: 'sbs-popasia', name: 'SBS PopAsia', icon: 'PA', region: 'East Asia', country: 'Australia',
    tagline: 'Asian pop across Korea, Japan and China', url: 'https://sbs-ice.streamguys1.com/sbs-popasia-sbs-web',
    genres: ['Asian Pop', 'K-Pop', 'J-Pop'], languages: ['Korean', 'Japanese', 'Chinese'], moods: ['Energy', 'Discover'], featured: true,
  },
  {
    id: '181-awesome-80s', name: '181.FM Awesome 80s', icon: '80', region: 'North America', country: 'USA',
    tagline: 'Big melodies and familiar 80s favourites', url: 'https://listen.181fm.com/181-awesome80s_128k.mp3',
    genres: ['80s', 'Pop', 'New Wave'], languages: ['English'], moods: ['Nostalgia', 'Energy'],
  },
  // Artist frequencies: deliberately small and globally recognisable.
  ...REQUESTED_ARTIST_STATIONS,
  {
    id: 'artist-cigarettes-after-sex', name: 'Cigarettes After Sex', icon: 'CAS', region: 'Artist Radio', country: 'USA',
    tagline: 'Cigarettes After Sex · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Cigarettes%20After%20Sex',
    genres: ['Dream Pop', 'Ambient Pop', 'Slowcore'], languages: ['English'], moods: ['Unwind', 'Nostalgia', 'Focus'],
    artist: 'Cigarettes After Sex', source: 'youtube-playlist', addedAt: '2026-08-17', featured: true,
    videoIds: ['sElE_BfQ67s', '3XqqkrJENB4', 'L4sbDxR22z4', 's1QCL9AGbO0', 'pZ31pyTZdh0', 'PDJPpG8e4n4', '5-rbSNzU_b8', 'UwTqcctD1rw', '8XjYw8Wuv6Q', '5soixb2U6xM', 'BrzXW140-HM', '--JuMkludKM', 'mL6659-jwaM', 'VlBIeZi3Ko4', 'KrTHeCgGdGA'],
  },
  {
    id: 'artist-joji', name: 'Joji', icon: 'JJ', region: 'Artist Radio', country: 'Japan / USA',
    tagline: 'Joji · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Joji',
    genres: ['Alternative R&B', 'Lo-Fi Pop', 'Bedroom Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia'],
    artist: 'Joji', source: 'youtube-playlist', addedAt: '2026-08-17', featured: true,
    videoIds: ['LUXu4aTnK7E', 'ZEY9UCzzbcQ', 'FvOpPeKSf_4', 'kIEWJ1ljEro', '8X40-5zCoa0', 'QH9vvwPPBS8', 'UGB_Bsm5Unk', 'AeO81mfRook', 'ujriV3vkC9w', 'DCp4nUe9ZUs', 'z9gVoelEjws', 'UnzFVZ7jMN0', 'vljirbsjYMc', '4N4P-Y0DyXs', '08xzc6pZ0m8'],
  },
  {
    id: 'artist-lana-del-rey', name: 'Lana Del Rey', icon: 'LDR', region: 'Artist Radio', country: 'USA',
    tagline: 'Lana Del Rey · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Lana%20Del%20Rey',
    genres: ['Dream Pop', 'Baroque Pop', 'Alternative'], languages: ['English'], moods: ['Unwind', 'Nostalgia'],
    artist: 'Lana Del Rey', source: 'youtube-playlist', addedAt: '2026-08-17', featured: true,
    videoIds: ['T5xcnjAG8pE', 'Te11UaHOHMQ', 'DCYmJDO2_IE', 'jvm6DpqqbLk', 'EJSk2RySqKg', 'QbLGjeR9bvI', 'b6UazdAlqhs', 'o7e4IfE0ScI', 'sEetXo3R-aM', 'uNuMH2i6wdI', 'GVQON-muEFc', 'dvSZQ4oMHGM', 'MiAoetOXKcY', 'vBHild0PiTE', 'o3SqUUoJjW8'],
  },
  {
    id: 'artist-beach-house', name: 'Beach House', icon: 'BH', region: 'Artist Radio', country: 'USA',
    tagline: 'Beach House · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Beach%20House',
    genres: ['Dream Pop', 'Indie', 'Psychedelic Pop'], languages: ['English'], moods: ['Unwind', 'Focus', 'Nostalgia'],
    artist: 'Beach House', source: 'youtube-playlist', addedAt: '2026-08-17',
    videoIds: ['BfzFVbkutFE', 'OS6duOoxctw', '2j1_qPBuBMk', 'Er0leZrMaqc', 'm_DZZqqHwv0', '6xCWGBRzXtU', '08qd-vsHbaY', 'njbmwfndFH4', 'KYmWZv2n7oM', 'hkSmueKk1Lw', 'GAFwrXOsL68', 'Bv7IcjmxjGo', 'jjgs5sZ-8s4', 'AfvJYvb9j0E', '0qz0IJXQ720'],
  },
  {
    id: 'artist-men-i-trust', name: 'Men I Trust', icon: 'MIT', region: 'Artist Radio', country: 'Canada',
    tagline: 'Men I Trust · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Men%20I%20Trust',
    genres: ['Indie Pop', 'Dream Pop', 'Chillwave'], languages: ['English'], moods: ['Unwind', 'Focus'],
    artist: 'Men I Trust', source: 'youtube-playlist', addedAt: '2026-08-17', featured: true,
    videoIds: ['OZRYzH0Q0pU', '9IZKcb3LndA', 'TNsSBhl_2LI', 'xAz_DzPUjrM', 'HSGwL5wORJY', '93rM4qnUyGA', '0LMwgWFzDjU', 'DviID8Ni7Ns', 'e6k4-S4HlHk', 'bCDQN8iDCzo', 'qmVeQEysvtk', 'FJHFSr1Q4Qc', 'FqrRaQO3gZI', 'cVijWC8x7B4', 'PWbyRgAfESk'],
  },
  {
    id: 'artist-mac-demarco', name: 'Mac DeMarco', icon: 'MD', region: 'Artist Radio', country: 'Canada',
    tagline: 'Mac DeMarco · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=Mac%20DeMarco',
    genres: ['Indie Rock', 'Slacker Rock', 'Psychedelic Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia', 'Discover'],
    artist: 'Mac DeMarco', source: 'youtube-playlist', addedAt: '2026-08-17',
    videoIds: ['lPeJMoms_Ag', '463ychC4qIM', 'kXC8kzgY9tw', 'MJoSyNdffGo', 'rxaKVeiBiOE', 'MeRIAew8eXc', '_R3B2Xr8kwQ', '6Lk3NFWw9Fg', 'gbg27oT8Z9M', 'KtuA6Qylpyo', '2lxQsEOSuAU', 'pJS4UsVCzS4', 'qBoQzo98EpQ'],
  },
  {
    id: 'artist-the-marias', name: 'The Marías', icon: 'TM', region: 'Artist Radio', country: 'USA',
    tagline: 'The Marías · official videos on shuffle',
    url: 'https://music.youtube.com/search?q=The%20Mar%C3%ADas',
    genres: ['Psychedelic Pop', 'Dream Pop', 'Indie Pop'], languages: ['English', 'Spanish'], moods: ['Unwind', 'Discover'],
    artist: 'The Marías', source: 'youtube-playlist', addedAt: '2026-08-17', featured: true,
    videoIds: ['4kCVGodVS88', 'Qn8F_u0vBNI', '9NOlqJHvAZo', 'RpR8DDOK1r0', 'cQZDH4NWmaU', '6jiu9TlR11o', 'YPHn4xSvjNM', 'YzKM5g_FwYU', 'jFy03i_LRO8', 'EiS7cKfuf6w', 'QHVp9xiUr9U', '3moMHMhiq7c', 'IqT3WzY8wwo', 'qrqywuDWz_Q', 'El8eL8oRTB4'],
  },
  {
    id: 'artist-taylor-swift', name: 'Taylor Swift Radio', icon: 'TS', region: 'Artist Radio', country: 'Global',
    tagline: 'Taylor Swift, all eras', url: 'https://streaming.exclusive.radio/er/taylorswift/icecast.audio',
    genres: ['Pop', 'Singer-Songwriter'], languages: ['English'], moods: ['Energy', 'Nostalgia'], artist: 'Taylor Swift',
  },
  {
    id: 'artist-beatles', name: 'The Beatles Radio', icon: 'TB', region: 'Artist Radio', country: 'Global',
    tagline: 'The Beatles, around the clock', url: 'https://streaming.exclusive.radio/er/beatles/icecast.audio',
    genres: ['Classic Rock', 'Pop'], languages: ['English'], moods: ['Nostalgia', 'Unwind'], artist: 'The Beatles',
  },
  {
    id: 'artist-queen', name: 'Queen Radio', icon: 'Q', region: 'Artist Radio', country: 'Global',
    tagline: 'Queen anthems and deep cuts', url: 'https://nl4.mystreaming.net/er/queen/icecast.audio',
    genres: ['Classic Rock', 'Rock'], languages: ['English'], moods: ['Energy', 'Nostalgia'], artist: 'Queen',
  },
  {
    id: 'artist-coldplay', name: 'Coldplay Radio', icon: 'CP', region: 'Artist Radio', country: 'Global',
    tagline: 'Coldplay, from Parachutes onward', url: 'https://nl4.mystreaming.net/er/coldplay/icecast.audio',
    genres: ['Alternative', 'Pop Rock'], languages: ['English'], moods: ['Unwind', 'Nostalgia'], artist: 'Coldplay',
  },
  {
    id: 'artist-pink-floyd', name: 'Pink Floyd Radio', icon: 'PF', region: 'Artist Radio', country: 'Global',
    tagline: 'Pink Floyd albums and deep cuts', url: 'https://streaming.exclusive.radio/er/pinkfloyd/icecast.audio',
    genres: ['Progressive Rock', 'Classic Rock'], languages: ['English'], moods: ['Focus', 'Nostalgia'], artist: 'Pink Floyd',
  },
  {
    id: 'artist-bts', name: 'BTS Radio', icon: 'BTS', region: 'Artist Radio', country: 'Global',
    tagline: 'BTS hits, solos and fan favourites', url: 'https://nl4.mystreaming.net/er/bts/icecast.audio',
    genres: ['K-Pop', 'Pop'], languages: ['Korean', 'English'], moods: ['Energy'], artist: 'BTS',
  },
  {
    id: 'artist-bob-marley', name: 'Bob Marley Radio', icon: 'BM', region: 'Artist Radio', country: 'Global',
    tagline: 'Bob Marley and timeless reggae', url: 'https://nl4.mystreaming.net/er/bobmarley/icecast.audio',
    genres: ['Reggae'], languages: ['English'], moods: ['Unwind', 'Nostalgia'], artist: 'Bob Marley',
  },
  {
    id: 'artist-arijit-singh', name: 'Arijit Singh Radio', icon: 'AS', region: 'Artist Radio', country: 'India',
    tagline: 'Arijit Singh favourites', url: 'https://drive.uber.radio/uber/bollywoodaruitsingh/icecast.audio',
    genres: ['Bollywood', 'Pop'], languages: ['Hindi'], moods: ['Unwind', 'Nostalgia'], artist: 'Arijit Singh',
  },
  {
    id: 'artist-bharat-chauhan', name: 'Bharat Chauhan Radio', icon: 'BC', region: 'Artist Radio', country: 'India',
    tagline: 'Bharat Chauhan · official videos on shuffle',
    url: 'https://music.youtube.com/playlist?list=PLK0YpmdoqTAs',
    genres: ['Indie Folk', 'Singer-Songwriter', 'Hindi Indie'], languages: ['Hindi'], moods: ['Unwind', 'Nostalgia'],
    artist: 'Bharat Chauhan', source: 'youtube-playlist', playlistId: 'PLK0YpmdoqTAs',
    addedAt: '2026-08-17',
    videoIds: [
      'e44meSqTkH0', 'JCYWdN8ojSQ', 'cVDASbWZ_KI', 'drMQIxeQI_A',
      '5QZfHx4JcQo', 'Cen9lDWEkHg', 'MQXSJaqhSPA', 'BTRFLscBOGc',
      'pmAmckeOWd8', 'p6Egv1WLc30', '4jkYZMnDTEE', '4OC8juNFtWQ',
      'rhPDRGjw7XU', 'UFy11i_rVI8', 'lnkBPf5184M', 'o42L3FDHji4',
      'P5CCoEHHV9M', 'X7EMFCw5i1w', '6uapBZIpQGI', 'JvkFhDdqNCg',
      'PSB8BPX6euo', 'Ga7lYwoIOhw', '_aSgiqilfAE', 'BnTyhYezgxM',
    ],
  },
  {
    id: 'artist-prateek-kuhad-live', name: 'Prateek Kuhad: The Station', icon: 'PK', region: 'Artist Radio', country: 'India',
    tagline: 'Prateek Kuhad · official essentials on shuffle',
    url: 'https://music.youtube.com/playlist?list=RDCLAK5uy_mM47gZ3c74tlWWkmRE9nb44vugyvZFXoI',
    genres: ['Indie Folk', 'Singer-Songwriter', 'Hindi Indie'], languages: ['Hindi', 'English'], moods: ['Unwind', 'Nostalgia', 'Focus'],
    artist: 'Prateek Kuhad', source: 'youtube-playlist', playlistId: 'RDCLAK5uy_mM47gZ3c74tlWWkmRE9nb44vugyvZFXoI',
    videoIds: [
      'sDeaMm5Wg6c', 'VriRXxOjdiU', 'pRLOXUlIUG0', 'R9FovwkbFIM', 'j6rVGgJUONs', 'vt4jX0iRgCg',
      '1NEEJjTZknY', 'wkwwQgZ_kL4', '9lYQpmKU-GQ', '71s5tNDvPN0', 'BmUe3-sfr7E', '-BpDVIv_860',
      'Il7Nv270zNk', 'GqagMyq2hGQ', '5vCd5Qzhszc', 'dpN2eZiMlRE', '2N8_XDPW67Q', '-JmMQnLE_l4',
      'hlPi4nzRSxA', 'cTwsW54rM3A', 'H8uHux0XuYA', 'bXoa8uutkyc', '9gEHZ3peGvI', '05gAyJZro3M',
      'OfQQMX26xi8', 'Oi2BB5SfhE4', 'j6cg2TQz9H4', '2f5-lp5WjhY', 'ACRTKMgu6lc', 'zrxQkZfbSlE',
      'n7tk2H6qsGM', 'p4-4F-OBDIE', 'TWPqyRAaPkc', '2vP1CMK4I3Y', 'qP9qXGtAc-U', 'VKxeFJCrscc',
      '4fZJwGF5m18', 'zxtfaNjI9_0', 'L_1JgZkEC_U', 'R5HZqHxuQkU', 'LkbYQOZaXiI', 'YCmoZzrS3qY',
      'VJxqvI136sM', 'kpmSVgjvuLQ', '6Zf104PeieM', '36dzd8mv084', 'LPSf4o5G1tw', 'zYl1VAwaBzo',
      'ZMoWZy79RZU', 'MtMuAu3rSnw',
    ], addedAt: '2026-08-17', featured: true,
  },
  {
    id: 'artist-tame-impala', name: 'Tame Impala Radio', icon: 'TI', region: 'Artist Radio', country: 'Australia',
    tagline: 'Tame Impala · official essentials on shuffle',
    url: 'https://music.youtube.com/playlist?list=RDCLAK5uy_lncN931oN6KUNOw36oAtvAGDRdrlj4LGY',
    genres: ['Psychedelic Pop', 'Psychedelic Rock', 'Electronic'], languages: ['English'], moods: ['Discover', 'Unwind', 'Energy'],
    artist: 'Tame Impala', source: 'youtube-playlist', playlistId: 'RDCLAK5uy_lncN931oN6KUNOw36oAtvAGDRdrlj4LGY',
    videoIds: [
      'pFptt7Cargc', 'xnP7qKxwzjg', 'pyUOSaQZmxw', 'KN8nJFLu1Rk', 'ulkdUfItyxI', '47YNsf-7Y7c',
      'Y0U6u2D8cMU', 'sBzrzS1Ag_g', 'utCjuKDXQsE', 's3a4OQR-10M', 'wycjnCCgUes', 'gs-MtItyOFc',
      '2g5xkLqIElU', '_9bw_VtMUGA', 'QoguePcf9P4', 'BgK_Er7WZVg', '44lWO3qhQMk', 'LnKUD_OztRE',
      'rUmV-MorIKc', 'GHe8kKO8uds', 'EWMQE-rwpSA', 'pWqueQ8JO9E', 'hefh9dFnChY', 'cNizeRa8DZ4',
      'bMLq3QQK6a8', 'KQH2Kq1QXaI', 'FRbDkPsj0wk', 'zfcHq0hhFWg', '-F2e9fmYL7Y', '3a7jLiSCtpU',
      'Eq4-9n14ytw', 'AOi-zV5rer0',
    ], addedAt: '2026-08-17', featured: true,
  },
];

export const DEFAULT_RADIO_ID = 'freecodecamp';

export const getRadioStation = (id: string | null | undefined): RadioStation =>
  RADIO_STATIONS.find((station) => station.id === id)
  ?? RADIO_STATIONS.find((station) => station.id === DEFAULT_RADIO_ID)
  ?? RADIO_STATIONS[0];

export const RADIO_REGIONS = Array.from(new Set(
  RADIO_STATIONS.filter((station) => station.region !== 'Artist Radio').map((station) => station.region),
));

export const RADIO_LANGUAGES = Array.from(new Set(
  RADIO_STATIONS.flatMap((station) => station.languages),
)).sort();
