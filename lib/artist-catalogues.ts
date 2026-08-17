import type { RadioMood, RadioStation } from './radio';

type ArtistCatalogue = {
  id: string; name: string; icon: string; country: string; genres: string[];
  languages: string[]; moods: RadioMood[]; videoIds?: string[]; streamUrl?: string; featured?: boolean;
};

const catalogue = ({ id, name, icon, country, genres, languages, moods, videoIds, streamUrl, featured }: ArtistCatalogue): RadioStation => ({
  id: `artist-${id}`,
  name: `${name} Radio`,
  icon,
  region: 'Artist Radio',
  country,
  tagline: streamUrl ? `${name} · live around the clock` : `${name} · official music on shuffle`,
  url: streamUrl ?? `https://music.youtube.com/search?q=${encodeURIComponent(name)}`,
  genres,
  languages,
  moods,
  artist: name,
  source: streamUrl ? 'stream' : 'youtube-playlist',
  ...(videoIds?.length ? { videoIds } : {}),
  featured,
  addedAt: '2026-08-17',
});

/**
 * In-app fallbacks for artists without a dependable, browser-safe 24/7 stream.
 * IDs are official artist/label uploads and play only through the embedded player.
 */
export const REQUESTED_ARTIST_STATIONS: RadioStation[] = [
  catalogue({
    id: 'stephen-sanchez', name: 'Stephen Sanchez', icon: 'SS', country: 'USA',
    genres: ['Indie Pop', 'Singer-Songwriter', 'Retro Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia'], featured: true,
    videoIds: ['GxldQ9eX2wo', 'R95ILhksGt8', 'xx-Xqmmzlk4', 'mkqEmQsPzfA', 'S4i1ykNUY_g', 'kPlSyYtE63M', 'MlThQTo6D8A', 'wap6HVfWJ1I', 'fTTcrpvhHqM', 'LUHPqjaKvtA', 'XbAFmBIY6DQ', 'xWkuScCPHr4', '8EZKWKDj_mo', 'OOLMITiXv6c', 'FC-Y8niYass'],
  }),
  catalogue({
    id: 'yung-kai', name: 'yung kai', icon: 'YK', country: 'Canada',
    genres: ['Bedroom Pop', 'Indie Pop', 'Dream Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia'], featured: true,
    videoIds: ['IpFX2vq8HKw', 'WRkbJqvdvAk', 'RAvFybdrPpo', '98zHKN-xSHk', 'ymtCVuf481Q', 'CuT0bF03mGg', 'iQmvTvGJfQs', 'jDf07wV5gMU', 'xkJkZR-0V0E', 'ayo8KqYEoxY', 'OVAHWXLfS_Q', 'xFSA5VE6880', 'H0ShIm_nHdM', '978hqPIxbxc'],
  }),
  catalogue({
    id: 'djo', name: 'Djo', icon: 'DJO', country: 'USA',
    genres: ['Psychedelic Pop', 'Synth Pop', 'Indie Rock'], languages: ['English'], moods: ['Discover', 'Unwind'], featured: true,
    videoIds: ['xy3AcmW0lrQ', 'ZqEOGg6WxgI', 'rBXRMEZCNJA', '3AYJJQEMHwo', 'e2GIiS3NLDE', 'lbqmWtfb-pM', 'jy2AZRsnGqE', '29Wbm-UkvUE', 'rpoeJSr386c', 'zM0goJtxxJY', 'dCfCzzCyMU4', 'oXSw8DGjf5E'],
  }),
  catalogue({
    id: 'kanye-west', name: 'Kanye West', icon: 'YE', country: 'UAE',
    genres: ['Hip-Hop', 'Rap', 'Alternative Hip-Hop'], languages: ['English'], moods: ['Energy', 'Nostalgia', 'Discover'],
    streamUrl: 'https://streaming.exclusive.radio/er/kanyewest/icecast.audio',
  }),
  catalogue({
    id: 'drake', name: 'Drake', icon: 'DR', country: 'Canada',
    genres: ['Hip-Hop', 'Rap', 'R&B'], languages: ['English'], moods: ['Energy', 'Unwind'], featured: true,
    videoIds: ['SD4yRDY9mek', 'bpD-JVy2zV4', 'JFm7YDVlqnI', 'JffHTWti1es', 'YhUqxWR4mnE', 'QW29Ly55Kvs', 'Iu9xmEaHwpU', 'weU76DGHKU0', '8ekJMC8OtGU', 'ipOSrQNrp1U', 'Nq5bP2RdZ6A', 'sOreUnGoIMg', 'dGYxT1QReQs', 'xpVfcZ0ZcFM', 'w1-jss2mZlY'],
  }),
  catalogue({
    id: 'harry-styles', name: 'Harry Styles', icon: 'HS', country: 'UK',
    genres: ['Pop', 'Pop Rock', 'Soft Rock'], languages: ['English'], moods: ['Unwind', 'Energy', 'Nostalgia'], featured: true,
    videoIds: ['H5v3kku4y6Q', 'qN4ooNx77u0', 'P3cffdsEXXw', 'VF-r5TtlT9w', '7sxVHYZ_PnA', 'olGSAVOkkTI', '95pX92cUwV8', '9NZvM1918_E', '4VaqA-5aQTM', 'QbShJru2WFc', 'E07s5ZYygMg', '9wg3v-01yKQ', '-UJCMfuFtSQ', 'hkK5e7CY_h0', 'bGZplqeIb3w'],
  }),
  catalogue({
    id: 'bad-bunny', name: 'Bad Bunny', icon: 'BB', country: 'Puerto Rico',
    genres: ['Reggaeton', 'Latin Trap', 'Latin Pop'], languages: ['Spanish'], moods: ['Energy', 'Discover'], featured: true,
    videoIds: ['KU5V5WZVcVE', 'Cr8K88UcO0s', 'OSUxrSe5GbI', 'wAjHQXrIj9o', 'saGYMhApaH8', 'myDIeOjqQos', 'p38WgakuYDo', 'acEOASYioGY', '_PJvpq8uOZM', 'doLMt10ytHY', 'a1Femq4NPxs'],
  }),
  catalogue({
    id: 'the-weeknd', name: 'The Weeknd', icon: 'XO', country: 'Canada',
    genres: ['Alternative R&B', 'Pop', 'Synth Pop'], languages: ['English'], moods: ['Unwind', 'Energy', 'Nostalgia'], featured: true,
    videoIds: ['Mx92lTYxrJQ', 'u9n7Cw-4_HQ', 'XXYlFuWEuKI', 'JZjAg6fK-BQ', 'bn8gP5N8hqM', '1XqIWr_WqM4', 'dMoFcvfd5t4', '5EpyN_6dqyk', 'M4ZoCHID9GI', 'qFLhGq0060w', '2fDzCWNS3ig', '8zHWTsdnC7A', 'vt0i6nuqNEo', 'KEI4qSrkPAs', '2kjolTLZ_Mg'],
  }),
  catalogue({
    id: 'ariana-grande', name: 'Ariana Grande', icon: 'AG', country: 'USA',
    genres: ['Pop', 'R&B', 'Dance Pop'], languages: ['English'], moods: ['Energy', 'Unwind'], featured: true,
    videoIds: ['4U4jJKH7VLc', 'v1t4MTqdfyI', '0J6tGMnBLlM', '_lKbPBS5HEQ', 'BeoL2D-37I4', '1ekZEVeXwek', 'QYh6mYIJG2Y', 'tcYodQoapMg', 'SXiSVQZLje8', 'b-9gJ1Gc8rE', 'x1XIJM6spaE', 'KNtJGQkC-WI', 'Tja6P2OoPoY', '4bwnO0FQp1s', 'B6_iQvaIjXw'],
  }),
  catalogue({
    id: 'ed-sheeran', name: 'Ed Sheeran', icon: 'ES', country: 'UK',
    genres: ['Pop', 'Singer-Songwriter', 'Acoustic Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia', 'Energy'],
    videoIds: ['iD2rhdFRehU', 'JGwWNGJdvx8', 'JgDNFQ2RaLQ', '2Vv-BfVoq4g', 'orJSJGHjBLI', 'UPOT2tgY9QQ', 'lp-EO5I60KA', 'K0ibBPhiaG0', 'Il0S8BoucSA', 'mj0XInqZMHY', '87gWaABqGYs', 'y83x7MgzWOA', 'nSDgHBxUbVQ'],
  }),
  catalogue({
    id: 'billie-eilish', name: 'Billie Eilish', icon: 'BE', country: 'USA',
    genres: ['Alternative Pop', 'Electropop', 'Bedroom Pop'], languages: ['English'], moods: ['Unwind', 'Nostalgia', 'Discover'], featured: true,
    videoIds: ['S2dRcipMCpw', 'V9PVRfjEBTI', 'cW8VLC9nnTo', '5GJWxDKyk3A', 'DyDfgMOUjCI', '_JGGLJMpVks', 'EgBJmlPo8Xw', 'V1Pl8CzNzCw', 'MB3VkzPdgLA', '9dobJDxPEzM', 'pbMwTqkKSps', 'BY_XwvKogC8', 'RUQl6YcMalg', 'OORBa32WFcM', 'gBRi6aZJGj4'],
  }),
  catalogue({
    id: 'eminem', name: 'Eminem', icon: 'EM', country: 'USA',
    genres: ['Hip-Hop', 'Rap'], languages: ['English'], moods: ['Energy', 'Nostalgia'],
    videoIds: ['xFYQQPAOz7Y', 'S9bCLPwzSC0', 'YVkUvmDQ3HY', 'eJO5HU_7_1w', 'D4hAVemuQXY', 'JByDbPn6A1o', 'j5-yKhDd64s', 'XbGs_qK2PQA', '22tVWwmTie8', 't5H_CewqpKA', 'jfobiCq0YUc', '8CdcCD5V-d8', 'EHkozMIXZ8w', '9dcVOmEQzKA', 'KV2ssT8lzj8'],
  }),
  catalogue({
    id: 'shakira', name: 'Shakira', icon: 'SHA', country: 'Colombia',
    genres: ['Latin Pop', 'Pop Rock', 'Dance Pop'], languages: ['Spanish', 'English'], moods: ['Energy', 'Nostalgia'], featured: true,
    videoIds: ['DUT5rEU6pqM', 'o3mP3mJDL2k', 'booKP974B0k', 'pRpeEdMmmQ0', '7-7knsP2n5w', 'weRHyjj34ZE', '-befR4wHsjQ', 'XkYAxGt-aUs', '_3-GiVIE8gc', 'a5irTX82olg'],
  }),
  catalogue({
    id: 'blackpink', name: 'BLACKPINK', icon: 'BP', country: 'South Korea',
    genres: ['K-Pop', 'Pop', 'Hip-Hop'], languages: ['Korean', 'English'], moods: ['Energy', 'Discover'], featured: true,
    videoIds: ['ioNng23DkIM', 'gQlMMD8auMs', 'FzVR_fymZw4', 'dyRsYk0LyA8', '2S24-y0Ij3Y', '2GJfWMYCWY0', '32si5cfrCNc', 'CgCVZdcKcqY', 'POe9SOEKotk', 'vRXZj0DzXIA', 'Amq-qlqbjYA', 'YudHcBIxlYw', 'gU2HqP4NxUs', 'IHNzOHi8sJs', '9pdj4iJD08s'],
  }),
  catalogue({
    id: 'karol-g', name: 'KAROL G', icon: 'KG', country: 'Colombia',
    genres: ['Reggaeton', 'Latin Pop', 'Latin Trap'], languages: ['Spanish'], moods: ['Energy', 'Discover'], featured: true,
    videoIds: ['BgMU9Vuj17Y', 'QCZZwZQ4qNs', 'MgsdDfdGdHc', 'tbneQDc2H3I', 'QaXhVryxVBk', 'SK37InR9j38', 'jZGpkLElSu8', 'ca48oMV59LU', '2jYEz66J_J4', '5r5UePOgMQU', '8-mloCL49vs', '15iEJ0qY_70', 'aw_cmzF_uZY', 'AqG0GF_LA0Q', 'gFZfwWZV074'],
  }),
  catalogue({
    id: 'ar-rahman', name: 'A. R. Rahman', icon: 'ARR', country: 'India',
    genres: ['Indian Film Music', 'World', 'Classical Crossover'], languages: ['Hindi', 'Tamil', 'Telugu'], moods: ['Unwind', 'Nostalgia', 'Energy'], featured: true,
    videoIds: ['uVcRWDoj30I', '9JDSGhhiOwI', 'jDn2bn7_YSM', 'kw6SFbbinnY', '1Z58KqDkLy0', 'xwwAVRyNmgQ', '_f8dMFzYRCE', 'nCFvhMS5EIU', 'Y6WV7v4zuNM', 'VzOS1TX7zQ0', 'Uvp5HHemf1w', 'gpVA5mx73UE', 'XYZwp-WAg6I'],
  }),
  catalogue({
    id: 'anirudh-ravichander', name: 'Anirudh Ravichander', icon: 'ANI', country: 'India',
    genres: ['Tamil Film Music', 'Indian Pop', 'Electronic'], languages: ['Tamil', 'Telugu', 'Hindi'], moods: ['Energy', 'Discover'], featured: true,
    videoIds: ['NAkQVL61BRI', 'YQ6ShcAU_dQ', 'q6e_b0NERCA', 'IxDvpoCmAaY', 'A_z5g0_hJN8', '4IZFPXNE27k', 'lZORMUufA_Y', '8IU2-E0J3zA', 'iAtoZar5W58', 'DsjRNPrvq6U', 'OXHTlMPbX7o', 'Cs0yA3eKqk0'],
  }),
  catalogue({
    id: 'karan-aujla', name: 'Karan Aujla', icon: 'KA', country: 'India / Canada',
    genres: ['Punjabi Pop', 'Punjabi Hip-Hop', 'Bhangra'], languages: ['Punjabi'], moods: ['Energy', 'Discover'], featured: true,
    videoIds: ['3j7bhOvW6jw', '5GCfYLguTIs', '-YlmnPh-6rE', '4DfVxVeqk2o', 'Fbv6-50S1lc', 'XTp5jaRU3Ws', 'cWMxCE2HTag', 'k85UB5b6pJU', 'K9R7KcaettM', 'vsWxs1tuwDk', 'V23eW2KEIuU', 'Guq9Vl8dK30', 'aFWDOFg7X2A', 'BXNxrT59MzQ', 'fRJ03btNsao'],
  }),
  catalogue({
    id: 'pritam', name: 'Pritam', icon: 'PRI', country: 'India',
    genres: ['Bollywood', 'Indian Pop', 'Film Music'], languages: ['Hindi', 'Bengali'], moods: ['Unwind', 'Nostalgia', 'Energy'], featured: true,
    videoIds: ['UhYRlI_bpJQ', 'Rq7tyOcVgLQ', 'QRwLbf3PwO8', 'yBa3FVQKAvY', 'uErMts4r-Gc', 'xrSZLa14haA', 'LdFFPkiS-9w', 'P7JyrhGnjhg', 'IMg_UUJVpMo', 'yIyVhIspa2I', '1YDULSDalig', 'ZsAOnmByy38', 'Qb3JOTwGcGw', 'dXFVOkq41us'],
  }),
  catalogue({
    id: 'sidhu-moose-wala', name: 'Sidhu Moose Wala', icon: 'SMW', country: 'India / Canada',
    genres: ['Punjabi Hip-Hop', 'Punjabi Pop', 'Rap'], languages: ['Punjabi'], moods: ['Energy', 'Nostalgia'], featured: true,
    videoIds: ['M8vDwlHigJA', 'lJZ8wWCnwow', '6xoB4ZiKKn0', 'tpFljbJxZiw', 'GgmFC8y8q3k', 'c8UUWkUJu6E', 'AKg-PRzEuqo', '9VGJdP5HtZc', 'Xf-N1joH6h4', '2cLTT_bEqTg', 'twCHVhk8iMU', 'hpVNMjpjiJc', 'tHVDy4vYApA', 'YZAFd9o3RYQ', 'tZt3Tp0MFZk'],
  }),
];
