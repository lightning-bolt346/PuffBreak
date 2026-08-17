import type { RadioMood, RadioStation } from './radio';

type ArtistCatalogue = {
  id: string; name: string; icon: string; country: string; genres: string[];
  languages: string[]; moods: RadioMood[]; videoIds?: string[]; playlistId?: string; streamUrl?: string; featured?: boolean;
};

const catalogue = ({ id, name, icon, country, genres, languages, moods, videoIds, playlistId, streamUrl, featured }: ArtistCatalogue): RadioStation => ({
  id: `artist-${id}`,
  name: `${name} Radio`,
  icon,
  region: 'Artist Radio',
  country,
  tagline: streamUrl ? `${name} · live around the clock` : `${name} · music catalogue on shuffle`,
  url: streamUrl ?? (playlistId ? `https://music.youtube.com/playlist?list=${playlistId}` : `https://music.youtube.com/search?q=${encodeURIComponent(name)}`),
  genres,
  languages,
  moods,
  artist: name,
  source: streamUrl ? 'stream' : 'youtube-playlist',
  ...(videoIds?.length ? { videoIds } : {}),
  ...(playlistId ? { playlistId } : {}),
  featured,
  addedAt: '2026-08-17',
});

/**
 * In-app fallbacks for artists without a dependable, browser-safe 24/7 stream.
 * IDs are official artist/label uploads and play only through the embedded player.
 */
const WORLD_INDIE_ARTISTS: ArtistCatalogue[] = [
  { id: 'lrain', name: "L’Rain", icon: 'LR', country: 'USA', genres: ['Experimental Soul', 'Indie Rock', 'Art Pop'], languages: ['English'], moods: ['Discover', 'Unwind'], videoIds: ['aM1bPtOg60s', 'mDbfrW314qg', 'PIJWnnQLVXA', '13EL6Mgeocc', 'h7ceMlfLxbg', 'UmPlTst22dE', 'Mq06LuQr4EI', 'BhGAfor9zcM'] },
  { id: 'corridor', name: 'Corridor', icon: 'QC', country: 'Canada', genres: ['Francophone Indie', 'Indie Rock', 'Krautrock'], languages: ['French'], moods: ['Discover', 'Energy'], videoIds: ['IyNoEZug9ds', 'Jpc5L-t5V0w', '9i61Od4AUJI', 'Af3Bg7-90JQ', 'dQY9MWtMb5s', 'yAmXjIowTuY', 'l-qGO4DCXtA', 'r9oQsv1RNG0'] },
  { id: 'melted-ice-cream', name: 'Melted Ice Cream', icon: 'MI', country: 'Mexico', genres: ['Indie Pop', 'Surf Pop', 'Dream Pop'], languages: ['Spanish', 'English'], moods: ['Unwind', 'Discover'], videoIds: ['jJXOUUtSFps', 's5DWSRcQZSs', '9gB_molX-SU', 'xIsCh-BA8Ew', '568_MQw7qn8', 'fbc7r8btRpA', '0_q8Q4K_RLk', 's6IQIc98wIg'] },
  { id: 'luiza-brina', name: 'Luiza Brina', icon: 'LB', country: 'Brazil', genres: ['MPB', 'Brazilian Folk', 'Art Pop'], languages: ['Portuguese'], moods: ['Unwind', 'Discover'], videoIds: ['TkefSAQZjWM', 'iick0YGfXas', '66WUMhDN9bE', 'oZxDV3qwyKs', 'k6oCRuIwHuI', 'TK0VoOYESGw', 'yrGBaQhg3xQ', 'Vr27guj_UUI'] },
  { id: 'panchito-villa', name: 'Panchito Villa', icon: 'PV', country: 'Argentina', genres: ['Synth Pop', 'Indie Pop', 'DIY'], languages: ['Spanish'], moods: ['Unwind', 'Nostalgia'], videoIds: ['VOaO45WiZJc', 'u9HvZfRSulQ', 'BTP1810bJvU', '98DvMWGgJpA'] },
  { id: 'estoy-bien', name: 'Estoy Bien', icon: 'EB', country: 'Chile', genres: ['Emo', 'Alternative Rock', 'Indie Rock'], languages: ['Spanish'], moods: ['Energy', 'Discover'], videoIds: ['6gV3SJWLb4c', '9r-XJh_Ot6g', 'MkPPNz0tbQs', 'd91TKAZs3pY', 'iYSzZ0x5jq8', 'xdjI8HjI9ss', 'dlwwvoQWRb0', 'kC3_sYpDtNs'] },
  { id: 'still-house-plants', name: 'Still House Plants', icon: 'SHP', country: 'UK', genres: ['Experimental Rock', 'Slowcore', 'Free Improvisation'], languages: ['English'], moods: ['Discover', 'Unwind'], videoIds: ['pNKYSKU8ApE', 'dDrEu_8iiRc', 'RyxoYefA29s', 'DTem2c3lUUw', 'yb_zMehUGCk', '6ylrfJUqqJ8', 'x1R2lW2zNXo', 'D3Ry4GNAW3s'] },
  { id: 'benoit-b', name: 'Benoit B', icon: 'BB', country: 'France', genres: ['Electronic', 'Coldwave', 'Leftfield'], languages: ['Instrumental', 'French'], moods: ['Discover', 'Focus'], videoIds: ['dIx_oIGZ1qk', '2POG_c0Cg5E', 's0YUbg_hABQ', 'kqIWLBiV4ms', 'xqDWhRt-ur4', '20GsbVCXgqo', 'OQ6IB6QaEoo', '6se53vVlsQM'] },
  { id: 'hidrogenesse', name: 'Hidrogenesse', icon: 'HG', country: 'Spain', genres: ['Synth Pop', 'Art Pop', 'Electronic'], languages: ['Spanish'], moods: ['Discover', 'Energy'], videoIds: ['Kh_KCtDi1lY', 'p6M0Sm_Dd4k', 'M3DGdx5E6P4', '5HCea4MFTIM', 'IPVmBb_VxLc', 'c53S1JV1mCk', 'OOz31eMKwpo', 'Fl4LMtD14Xo'] },
  { id: 'pega-monstro', name: 'Pega Monstro', icon: 'PM', country: 'Portugal', genres: ['DIY Punk', 'Indie Rock', 'Dream Pop'], languages: ['Portuguese'], moods: ['Energy', 'Discover'], videoIds: ['9AAI1TRGYLg', 'V7vELJ3a8Gc', 'ExxHWRbWyI0', 'AxMHiLMTkYE', 'dQvvy6O4NT8', 'hzxuRFwqAxo', 'T6LNVPSv-dw', 'QlQXuV20m9E'] },
  { id: 'exwhite', name: 'ExWhite', icon: 'XW', country: 'Germany', genres: ['Underground Punk', 'Post-Punk', 'DIY'], languages: ['German', 'English'], moods: ['Energy', 'Discover'], videoIds: ['THyzLS0D5L4', 'UKNJNtjaisA', 'GfYOXcI18g4', 'jMiqJ-htV84', 'ylpQ94JU4vg', 'SOKaTbPlHWM', 'f7uTG09Splo', '5oPduWkfJBg'] },
  { id: 'tampon', name: 'Tampon', icon: 'TR', country: 'Turkey', genres: ['Turkish Punk', 'DIY Punk', 'Rock'], languages: ['Turkish'], moods: ['Energy', 'Discover'], videoIds: ['8ZzATnA2oZ4', 'e_TzFsvPz7g', 'mZ0eG_Oq7ag', 'Q-vKrXCNF1U'] },
  { id: 'slowspin', name: 'Slowspin', icon: 'SS', country: 'Pakistan', genres: ['Experimental', 'Electronic', 'Art Pop'], languages: ['Urdu', 'English'], moods: ['Unwind', 'Discover'], videoIds: ['ZYFdU6nzyf4', 'UTnXMVjQmLk', 'DjH9UUN44I8', '-IkLBCr1N70', 'aEbAoNWEBNI', '_mbcHR5B9Gw', 'a_TBsa5jHnU', '3H4DEZlhZPk'] },
  { id: 'hiperson', name: 'Hiperson', icon: 'HP', country: 'China', genres: ['Post-Punk', 'Art Rock', 'Indie Rock'], languages: ['Mandarin'], moods: ['Discover', 'Energy'], videoIds: ['vAheEN7e-6g', 'dJVa8rWPnk4', 'VyD5dWTQ3kc', 'st9S93hRWb0', '9o5vABVQXrI', 'nHe1OrbuW5g', 'uKlEVpH74bg', 'XgDJRFaFavY'] },
  { id: 'tamanaramen', name: 'Tamanaramen', icon: 'TM', country: 'Japan', genres: ['Experimental Pop', 'Electronic', 'Ambient'], languages: ['Japanese'], moods: ['Discover', 'Unwind'], videoIds: ['EKk4fxnKKvo', 'I-ZVJWzxDC0', 'CEkPFjSe55g', '8c7J-YvvOJ4', 'AIV7tkxdm10', 'mGKw9jXqdFE', 'awHbnvYPCe8', 'XJHONxDTN8k'] },
  { id: 'yeong-die', name: 'Yeong Die', icon: 'YD', country: 'South Korea', genres: ['Experimental Electronic', 'Ambient', 'Art Pop'], languages: ['Korean'], moods: ['Discover', 'Focus'], videoIds: ['Qp7IVLJRFLQ', 'AcHTrsORo7E', 'hJxp8fn2Gt8', 'AgfdGh_NahA', 'p5rlwxlkqBc', 'RNHtETgyVvY', 'Je64n8gq4f4', 'p5FKiE7O4AI'] },
  { id: 'huan-huan', name: 'Huan Huan 緩緩', icon: 'HH', country: 'Taiwan', genres: ['Dream Pop', 'Shoegaze', 'Indie Rock'], languages: ['Mandarin'], moods: ['Unwind', 'Discover'], videoIds: ['RHH35gZTjjo', 'PQYHAMWkTzA', 'MeDTVwnBnPQ', 'yggYTpr-Ggc', 'CF91C4pOZGw', 'nIeAdJsV8pk', 'mcni6ycEHGY', 'aRqBcY2k_l0'] },
  { id: 'bedchamber', name: 'Bedchamber', icon: 'BC', country: 'Indonesia', genres: ['Dream Pop', 'Indie Rock', 'Shoegaze'], languages: ['English', 'Indonesian'], moods: ['Unwind', 'Discover'], videoIds: ['5Y_7z7RT4dI', 'CuPCS3iwWIE', 'pmMxZlS_6ws', 'gl_4vcbnNRs', 'BFRP5NUlzE4', '33OcAif2SMU', 'VZvk6jLf5MI', 'HKr06g8jm0U'] },
  { id: 'sobs', name: 'Sobs', icon: 'SB', country: 'Singapore', genres: ['Indie Pop', 'Jangle Pop', 'Pop Punk'], languages: ['English'], moods: ['Energy', 'Discover'], videoIds: ['xasFF_St1ec', 'RPHCC86abXo', 'kAJxeg0iGOw', '4JUtxv3ztXs', 'DBSCk7jj9gI', 'KT5ovS1yU1E', '85g2vp2GzXw', 'L6zBrpNC7UI'] },
  { id: 'lustbass', name: 'LUSTBASS', icon: 'LB', country: 'Philippines', genres: ['Downtempo', 'Jazz', 'Psychedelic Beats'], languages: ['Instrumental', 'English'], moods: ['Unwind', 'Focus'], videoIds: ['XdF1pB89Nb0', 'MGf4Pdy4Tgo', 'MRf9iezkRSY', 'V6TP-F4K9ik', 'LbXUwKLbvao', 'F_UkdgU_Zdg', 'DrrxukdoaoQ', 'e0TAxaxNcbg'] },
  { id: 'khana-bierbood', name: 'Khana Bierbood', icon: 'KB', country: 'Thailand', genres: ['Psychedelic Rock', 'Surf Rock', 'Molam'], languages: ['Thai'], moods: ['Discover', 'Energy'], videoIds: ['REtJFC8lk7M', 'vqYO4qAY9e0', 'ewXAqmT9SX8', 'G21gU-eWU7U', 'QUGG9WhDJcM', 'HHfNZFQKMfI', '-G6FPG6i23Y', 'lnjCeT-DqTU'] },
  { id: 'scott-charlenes-wedding', name: 'Scott & Charlene’s Wedding', icon: 'SCW', country: 'Australia', genres: ['Indie Rock', 'DIY Rock', 'Jangle Pop'], languages: ['English'], moods: ['Discover', 'Energy'], videoIds: ['6NsS1XmRKMc', 'eYMVQ2sgj6U', 'fx59-E_JsRQ', 'ctrYqWyVxK0', '7dG_AJTmipU', 'sFa5mRq5PoY', 'FEQVWAWERkU', 'AG2JiZhJ8Co'] },
  { id: 'alex-wondergem', name: 'Alex Wondergem', icon: 'AW', country: 'Ghana', genres: ['Alternative Beats', 'Electronic', 'Experimental'], languages: ['Instrumental', 'English'], moods: ['Discover', 'Focus'], videoIds: ['YNLqujCArKg', '2KfLUEjibXQ', '0n44XTeIBU8', 'QQQwHFiBl-g', 'o5u00TPNDt4', 'W-pnqIzq_v8', '5rE8g5RiSKI', '4dgT2sATOyI'] },
  { id: 'citizen-boy', name: 'Citizen Boy', icon: 'CB', country: 'South Africa', genres: ['Gqom', 'Electronic', 'Club'], languages: ['Instrumental', 'Zulu'], moods: ['Energy', 'Discover'], videoIds: ['qZlI-FWMjYw', 'RJt79zoYFRs', 'NPdddS2FxBk', 'TM8eyUQiJBc', 'U9upabl4CxM', 'GZX40vDn3AM', 'mJ47gzKGkwM', 'I2RhsXTbzsA'] },
  { id: 'lova-lova', name: 'Lova Lova', icon: 'LL', country: 'DR Congo', genres: ['Congolese Rock', 'Rap', 'Experimental'], languages: ['French', 'Lingala'], moods: ['Energy', 'Discover'], videoIds: ['X52FbZ4baGw', 'x61QkXosD6o', '7QQEaEYEqlU', 'U_Pmqak9x_k'] },
  { id: 'fadi-tabbal', name: 'Fadi Tabbal', icon: 'FT', country: 'Lebanon', genres: ['Ambient', 'Experimental', 'Electronic'], languages: ['Instrumental'], moods: ['Focus', 'Unwind', 'Discover'], videoIds: ['CcLKzsOOLRs', 'Au0NPvJjz0s', '1I2wLWkJOD0', 'NoHqLo90C4U', 'hf9LYBTJrds', 'eWmn1pAyfPU', 'lemMWIMMJHU', 'lqWZNrxLVv8'] },
];

export const REQUESTED_ARTIST_STATIONS: RadioStation[] = [
  catalogue({
    id: 'krsna', name: 'KR$NA', icon: 'K$', country: 'India',
    genres: ['Desi Hip-Hop', 'Hip-Hop', 'Rap'], languages: ['Hindi', 'English'], moods: ['Energy', 'Discover'], featured: true,
    playlistId: 'RDCLAK5uy_mclbUfg1b-MLxj3vjSmZ_jNV1YXa3R-t8',
  }),
  catalogue({
    id: 'seedhe-maut', name: 'Seedhe Maut', icon: 'SM', country: 'India',
    genres: ['Desi Hip-Hop', 'Hip-Hop', 'Rap'], languages: ['Hindi', 'English'], moods: ['Energy', 'Discover'], featured: true,
    playlistId: 'RDCLAK5uy_nkSXiR_SyN36UcN3dfY4uWS__0ntBjMEM',
  }),
  catalogue({
    id: 'raftaar', name: 'Raftaar', icon: 'RF', country: 'India',
    genres: ['Desi Hip-Hop', 'Hip-Hop', 'Indian Pop'], languages: ['Hindi', 'Punjabi'], moods: ['Energy', 'Discover'], featured: true,
    playlistId: 'RDCLAK5uy_k6_7ddjdEWYGB6XjCwKfTb8Xwxf6qlrp8',
  }),
  catalogue({
    id: 'talha-anjum', name: 'Talha Anjum', icon: 'TA', country: 'Pakistan',
    genres: ['Desi Hip-Hop', 'Urdu Rap', 'Hip-Hop'], languages: ['Urdu', 'English'], moods: ['Energy', 'Nostalgia', 'Discover'], featured: true,
    videoIds: [
      'AllVB-XrTPk', 'UmuvFYXHAFA', 'a__jZRATPVs', 'Pul_JVP_Nxw', 'i-FeXYXJpgg',
      'BwmiN9Cx_zE', 'EhDItfOeo9M', 'WOn0tX4Nfik', 'm5cS2VSbgjI', 'pCm_uvpPGyY',
      'gjwSJUub12c', 'EkZ_BwW29NA', 'ysSq218zW4E', 'H1avAYEiqL8', 'HtavVK1_7FE',
      'UG6ziVK5ykY', 'LMYTbDYMh88', 'q-eZylxkUSw', 'HZ6mMddXyZE', 'oV5FGZmHFr4',
      'YdChyvc4xCg', '08JfwsySUuo', 'hhMEFaeBm1Y', 'HhqPMyFznxw', 'tX5Frxt9U98',
    ],
  }),
  catalogue({
    id: 'anuv-jain', name: 'Anuv Jain', icon: 'AJ', country: 'India',
    genres: ['Indie Folk', 'Singer-Songwriter', 'Hindi Indie'], languages: ['Hindi'], moods: ['Unwind', 'Nostalgia'], featured: true,
    playlistId: 'RDCLAK5uy_kLl1k2BTGe5dgs_PrgdL4323czVcpL_0k',
  }),
  catalogue({
    id: 'osho-jain', name: 'Osho Jain', icon: 'OJ', country: 'India',
    genres: ['Hindi Indie', 'Indie Folk', 'Singer-Songwriter'], languages: ['Hindi'], moods: ['Unwind', 'Nostalgia'],
    videoIds: ['cStOvI74hQo', 'pf8aBbPJI4o', 'OYJxlrQcjn0', 'knRXzT8e6Vo', 'FvCCb8zqT-s', '-d-TzP4XsR0', 'Yn1ZJybtjuA', 'XMcT01QfwWs', 'f8MUrzUrlsM', '4NpMu__lFPQ'],
  }),
  catalogue({
    id: 'lifafa', name: 'Lifafa', icon: 'LF', country: 'India',
    genres: ['Hindi Electronic', 'Indie', 'Disco'], languages: ['Hindi'], moods: ['Unwind', 'Discover'], featured: true,
    playlistId: 'RDCLAK5uy_nAkB_bmCJ8lrdX2eJujE78V_zzAsElLAY',
  }),
  catalogue({
    id: 'pcrc', name: 'Peter Cat Recording Co.', icon: 'PCRC', country: 'India',
    genres: ['Indie Rock', 'Jazz Pop', 'Psychedelic'], languages: ['English', 'Hindi'], moods: ['Unwind', 'Discover'], featured: true,
    videoIds: ['w-ZDaVnHGNw', 'ZoSD4l32m2I', 'x9X4Ul5JWXc', '61OvDrvXlrs', 'B61J7zd78sQ', 'nO8dAsmap7E', 'FXOV3CC38ME', 'XJGC29dbBfI', 'gVAR_xGzhyg', 'eUFB6HY735E'],
  }),
  catalogue({
    id: 'divyam-sodhi', name: 'Divyam Sodhi', icon: 'DS', country: 'India',
    genres: ['Hindi Indie', 'Indie Pop', 'Singer-Songwriter'], languages: ['Hindi'], moods: ['Unwind', 'Nostalgia'],
    videoIds: ['FPbtoRRXxLk', 'xefgneQk3x4', 'HNM-UhBQhJI', 'dxpXN9eC5RU', '_tsMvADB0Gw', 'wYcY4j-drvk', 'w9XHFBADyDU', '_PcPSwcwwfE', 'WGm2g_vwlbU', 'yrihjKlOJPg'],
  }),
  catalogue({
    id: 'oaff', name: 'OAFF & Savera', icon: 'OA', country: 'India',
    genres: ['Indian Electronic', 'Indie Pop', 'Film Music'], languages: ['Hindi', 'English'], moods: ['Unwind', 'Discover'], featured: true,
    playlistId: 'RDCLAK5uy_k6_BFpqbvNt8wJuRSeBeNf2ZsIthr1fxA',
  }),
  ...WORLD_INDIE_ARTISTS.map(catalogue),
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
