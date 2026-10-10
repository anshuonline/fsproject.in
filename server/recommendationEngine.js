/**
 * FreeSong.in — Smart Algorithmic Recommendation Engine (v5)
 * Powered by YouTube Music official live charts & authentic algorithmic radio:
 * - Dynamic System Year: Uses new Date().getFullYear() everywhere, zero hardcoded years
 * - Direct YouTube Music Chart APIs: Fetches official live trending charts (India Trending, Bollywood, Punjabi, Tamil, Telugu, etc.)
 * - "Songs like {song}": Real YouTube Music algorithmic radio queue via yt.getUpNexts(videoId)
 * - "Latest Releases & Fresh Drops": Official YouTube Music new releases + live trending drops
 * - Smart natural queries (zero year keyword pollution to avoid old mashups and spam)
 * - Strict anti-spam & anti-mashup filtering
 */

// ─── Dynamic System Year ────────────────────────────────────────────────────
export const SYSTEM_YEAR = new Date().getFullYear();
export const PREV_YEAR = SYSTEM_YEAR - 1;

// ─── YouTube Music Official Editorial New Releases Playlists ────────────────
export const EDITORIAL_NEW_RELEASES = {
  hindi: 'VLRDCLAK5uy_nNhhgRET3NcJ4SJBvqhAIJ6t7vjsQYowc',      // New Music Hindi
  bollywood: 'VLRDCLAK5uy_nNhhgRET3NcJ4SJBvqhAIJ6t7vjsQYowc',  // New Music Hindi
  punjabi: 'VLRDCLAK5uy_mk3xwsayv9PxawuXS-U6ao9eMeNmSwYAM',    // New Music Punjabi
  tamil: 'VLRDCLAK5uy_nVQAtE2KBWk-ROQIc5o39Oup3hOLnYV0g',      // New Music Tamil
  telugu: 'VLRDCLAK5uy_l8CaYQvBQWVT2st1VsW9JjODWisR_vd3U',     // New Music Telugu
  haryanvi: 'VLRDCLAK5uy_nTkyDVpCk3iCQG_3bDJyhGgb1uzcBZM4A',   // New Music Haryanvi
  bhojpuri: 'VLRDCLAK5uy_lNxm8Rc4iPjaqlYqeZ1oHxrjAC0Oi7bso',   // New Music Bhojpuri
  desihiphop: 'VLRDCLAK5uy_mDTfR8UPbTurG-Riq7QDI5mjT4a7H5eoI', // Ekdum Fresh
  hiphop: 'VLRDCLAK5uy_mDTfR8UPbTurG-Riq7QDI5mjT4a7H5eoI',     // Ekdum Fresh
  indie: 'VLRDCLAK5uy_n17q7_2dwfDqWckpccDyTTkZ-g03jXuII',       // Indie Rising
  indianindie: 'VLRDCLAK5uy_n17q7_2dwfDqWckpccDyTTkZ-g03jXuII', // Indie Rising
  english: 'VLRDCLAK5uy_npj3EI5VV_uv_GdeeNgVpsGe5n_9YwzoI',     // Pop Hotlist
  englishpop: 'VLRDCLAK5uy_npj3EI5VV_uv_GdeeNgVpsGe5n_9YwzoI',  // Pop Hotlist
  pop: 'VLRDCLAK5uy_npj3EI5VV_uv_GdeeNgVpsGe5n_9YwzoI',         // Pop Hotlist
  malayalam: 'VLRDCLAK5uy_kyttsX1y1cRq3B6X-ohiJJHwxkCArzPds',   // New Music Malayalam
  kannada: 'VLRDCLAK5uy_k2CeIv7y1di4d2-Hu2fSz8o9lqwaccApA'      // New Music Kannada
};

// ─── YouTube Music Official Editorial Hitlists (Streaming Top Charts) ───────
export const EDITORIAL_HITLISTS = {
  // India Trending: Uncut Bollywood + Bollywood Hitlist + Top 100 Songs India
  trending_india: [
    'VLRDCLAK5uy_krbBs7P2iEb30IODyVbiOXWyhZtAIX9Uk', // Uncut Bollywood (India's premier streaming hits)
    'VLRDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g', // Bollywood Hitlist
    'VLPL4fGSI1pDJn4pTWyM3t61lOyZ6_4jcNOw'          // Top 100 Songs India (Official song chart)
  ],
  bollywood: 'VLRDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g',   // Bollywood Hitlist
  hindi: 'VLRDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g',       // Bollywood Hitlist
  punjabi: 'VLRDCLAK5uy_kuo_NioExeUmw07dFf8BzQ64DFFTlgE7Q',     // Punjab Fire
  tamil: 'VLRDCLAK5uy_nTbyVypdXPQd00z15bTWjZr7pG-26yyQ4',       // Kollywood Hitlist
  telugu: 'VLRDCLAK5uy_lyVnWI5JnuwKJiuE-n1x-Un0mj9WlEyZw',      // Tollywood Hitlist
  haryanvi: 'VLRDCLAK5uy_lFuh0seSkGQjEEqrmTk7hs2OCMvx86nSo',    // Haryanvi Essentials
  bhojpuri: 'VLRDCLAK5uy_nlUHwf0SaQlGN6n_1ZtWhhplysMPwjP2k',    // Bhojpuri Hitlist
  desihiphop: 'VLRDCLAK5uy_mOvRWCE7v4C98UgkSVh5FTlD3osGjolas',  // EKDUM
  hiphop: 'VLRDCLAK5uy_mOvRWCE7v4C98UgkSVh5FTlD3osGjolas',      // EKDUM
  indie: 'VLRDCLAK5uy_lE0yLj4nuJ--AIHE67gUQdKmfpdkTKNFk',        // हिंदी Indie
  indianindie: 'VLRDCLAK5uy_lE0yLj4nuJ--AIHE67gUQdKmfpdkTKNFk',  // हिंदी Indie
  english: 'VLRDCLAK5uy_nmS3YoxSwVVQk9lEQJ0UX4ZCjXsW_psU8',      // Pop's Biggest Hits
  englishpop: 'VLRDCLAK5uy_nmS3YoxSwVVQk9lEQJ0UX4ZCjXsW_psU8',   // Pop's Biggest Hits
  pop: 'VLRDCLAK5uy_nmS3YoxSwVVQk9lEQJ0UX4ZCjXsW_psU8',          // Pop's Biggest Hits
  bengali: 'VLRDCLAK5uy_nppZBg2AQ7htxIuyqHoMOXX4z2pIjQUP8',     // Bengali Hitlist
  malayalam: 'VLRDCLAK5uy_nT-zkEpc2x7AVVP0XV9JvHSfkFsOtGMR8',    // Mollywood Hitlist
  kannada: 'VLRDCLAK5uy_mPBQePobkU9UZ100tOTfvTCdwWOHoiiPo'      // Sandalwood Hitlist
};

// ─── Backward-compatible Chart Registry ─────────────────────────────────────
export const OFFICIAL_CHARTS = {
  trending_india: EDITORIAL_HITLISTS.trending_india,
  bollywood: EDITORIAL_HITLISTS.bollywood,
  hindi: EDITORIAL_HITLISTS.hindi,
  punjabi: EDITORIAL_HITLISTS.punjabi,
  tamil: EDITORIAL_HITLISTS.tamil,
  telugu: EDITORIAL_HITLISTS.telugu,
  haryanvi: EDITORIAL_HITLISTS.haryanvi,
  bhojpuri: EDITORIAL_HITLISTS.bhojpuri,
  desihiphop: EDITORIAL_HITLISTS.desihiphop,
  indie: EDITORIAL_HITLISTS.indie,
  english: EDITORIAL_HITLISTS.english,
  global: EDITORIAL_HITLISTS.english,
  bengali: EDITORIAL_HITLISTS.bengali,
  malayalam: EDITORIAL_HITLISTS.malayalam,
  kannada: EDITORIAL_HITLISTS.kannada
};

// ─── Duration & Format Helpers ──────────────────────────────────────────────
export function parseDuration(d) {
  if (typeof d === 'number') return d;
  if (typeof d === 'string') {
    const parts = d.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function toHDThumbnail(url, videoId) {
  if (!url) {
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
  }
  let u = url;
  if (u.startsWith('//')) u = 'https:' + u;
  if (u.includes('googleusercontent.com') && u.includes('=w')) {
    u = u.replace(/=w\d+-h\d+.*$/, '=w544-h544-l90-rj');
  } else if (u.includes('ytimg.com') || u.includes('youtube.com')) {
    if (u.includes('/default.jpg') || u.includes('/mqdefault.jpg')) {
      u = u.replace(/\/(default|mqdefault)\.jpg/i, '/hqdefault.jpg');
    }
  }
  return u;
}

// ─── Clean Song Title ───────────────────────────────────────────────────────
export function cleanSongTitle(title) {
  if (!title) return '';
  return title
    .replace(/^#Video\s*\|\s*/gi, '')
    .replace(/^#\S+\s*/gi, '')
    .replace(/\s*\(From\s+["'].*?["']\)/gi, '')
    .replace(/\s*\(Movie:.*?\)/gi, '')
    .replace(/\s*\[Official.*?\]/gi, '')
    .replace(/\s*\(Official.*?\)/gi, '')
    .replace(/\s*\[Lyrical.*?\]/gi, '')
    .replace(/\s*\(Lyrical.*?\)/gi, '')
    .replace(/\s*\[Audio.*?\]/gi, '')
    .replace(/\s*\(Audio.*?\)/gi, '')
    .replace(/\s*\[Video.*?\]/gi, '')
    .replace(/\s*\(Video.*?\)/gi, '')
    .replace(/\s*-\s*Official.*$/gi, '')
    .replace(/\s*\|\s*Official.*$/gi, '')
    .replace(/\s*\|\s*New\s+.*$/gi, '')
    .trim();
}

// ─── Strict Anti-Spam & Anti-Mashup Filter ──────────────────────────────────
export function isSpamOrJunkSong(s) {
  if (!s || !s.videoId || !s.title) return true;
  const title = (s.title || '').toLowerCase();
  const artist = (s.artist || '').toLowerCase();

  // 1. Long compilations, amateur mashups, non-stop jukeboxes, meme dance covers, status videos
  const spamTitlePatterns = [
    /\bmashup\b/i,
    /\bnon[- ]?stop\b/i,
    /\bjukebox\b/i,
    /\bremix collection\b/i,
    /\bold vs new\b/i,
    /\bmega mix\b/i,
    /\bdj mix\b/i,
    /\bnonstop\b/i,
    /\bevergreen hits\b/i,
    /\bsad song 90s\b/i,
    /\bfull album\b/i,
    /\bjuke box\b/i,
    /\bold is gold\b/i,
    /\bmedley\b/i,
    /\b1 hour\b/i,
    /\b100 hits\b/i,
    /\btop 50 hits\b/i,
    /\btop 20 hits\b/i,
    /\bcontinuous mix\b/i,
    /\bstatus\b/i,
    /\bwhatsapp status\b/i,
    /\bdance cover\b/i,
    /\bdance performance\b/i,
    /\bshorts\b/i,
    /\breaction\b/i,
    /\b8d audio\b/i,
    /\bkaraoke\b/i,
    /#video\s*\|/i,
    /\bpromo\b/i,
    /\bteaser\b/i
  ];
  if (spamTitlePatterns.some(pat => pat.test(title))) return true;

  // 2. Duration filter: Exclude compilations > 12 minutes (720s) or audio clips < 45 seconds
  if (s.duration && (s.duration > 720 || s.duration < 45)) {
    return true;
  }

  // 3. Spammer artist names / spam channel branding
  const spamArtistPatterns = [
    /\blove song\b/i,
    /\bold is gold\b/i,
    /\bslowed.*reverb\b/i,
    /\blofi remix\b/i,
    /\bswar wawe\b/i,
    /\bofficial mashup\b/i,
    /\bsong collection\b/i
  ];
  if (spamArtistPatterns.some(pat => pat.test(artist))) return true;

  // 4. AI-generated music (Suno, Udio & generic AI channels) — banned from all feeds.
  // Bare "suno" in TITLES is allowed (Hindi word "suno" = listen, e.g. "Suno Na
  // Sangemarmar") — only unambiguous brand / AI-generation markers are banned.
  const aiTitlePatterns = [
    /\bsuno\s*(ai|\.ai|\.com)\b/i,
    /\[\s*suno\s*\]|\(\s*suno\s*(ai)?\s*\)/i,
    /\b(ai|a\.i)[-\s]*(generated|gen)\b/i,
    /\bai\s+(music|songs?|covers?|remix|version|album|artist|singer|vocals?|voice)\b/i,
    /(made|created|generated|produced)\s+(with|by|using)\s+(suno|udio|ai)\b/i,
    /\bsunoai\b|\bsuno\.ai\b|\bsuno\.com\b/i
  ];
  const aiArtistPatterns = [
    /\bsuno\b/i,
    /\budio\b/i,
    /\bai\s*(music|songs?|generated|studio|lab|vibes?|covers?|hits?|charts?)\b/i,
    /aimusic|aisongs?|aigenerated|sunoai|suno\.ai|suno\.com/i
  ];
  if (aiTitlePatterns.some(pat => pat.test(title))) return true;
  if (aiArtistPatterns.some(pat => pat.test(artist))) return true;

  return false;
}

// ─── Artist Normalization & Strict Matcher ─────────────────────────────────
export function normalizeArtist(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.\-_,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ARTIST_ALIASES = {
  'kk': ['kk', 'k k', 'kay kay', 'krishnakumar kunnath'],
  'k k': ['kk', 'k k', 'kay kay', 'krishnakumar kunnath'],
  'kay kay': ['kk', 'k k', 'kay kay', 'krishnakumar kunnath'],
  'ar rahman': ['ar rahman', 'a r rahman', 'rahman', 'a r raman'],
  'a r rahman': ['ar rahman', 'a r rahman', 'rahman'],
  'arijit singh': ['arijit singh', 'arijit'],
  'sidhu moose wala': ['sidhu moose wala', 'sidhu moosewala', 'sidhu'],
  'sidhu moosewala': ['sidhu moose wala', 'sidhu moosewala', 'sidhu'],
  'diljit dosanjh': ['diljit dosanjh', 'diljit'],
  'shreya ghoshal': ['shreya ghoshal', 'shreya'],
  'atif aslam': ['atif aslam', 'atif'],
  'honey singh': ['yo yo honey singh', 'honey singh'],
  'yo yo honey singh': ['yo yo honey singh', 'honey singh'],
  'badshah': ['badshah'],
  'neha kakkar': ['neha kakkar'],
  'anirudh ravichander': ['anirudh ravichander', 'anirudh'],
  'sonu nigam': ['sonu nigam'],
  'kumar sanu': ['kumar sanu'],
  'udit narayan': ['udit narayan'],
  'lata mangeshkar': ['lata mangeshkar'],
  'kishore kumar': ['kishore kumar'],
  'mohammed rafi': ['mohammed rafi', 'mohd rafi', 'rafi'],
  'alka yagnik': ['alka yagnik'],
  'sunidhi chauhan': ['sunidhi chauhan'],
  'pritam': ['pritam', 'pritam chakraborty'],
  'vishal mishra': ['vishal mishra'],
  'jubin nautiyal': ['jubin nautiyal'],
  'himesh reshammiya': ['himesh reshammiya', 'himesh'],
  'arman malik': ['arman malik', 'armaan malik'],
  'armaan malik': ['arman malik', 'armaan malik']
};

export function matchesArtist(songArtist, targetArtist, songTitle = '') {
  if (!songArtist || !targetArtist) return false;

  const normSong = normalizeArtist(songArtist);
  const normTarget = normalizeArtist(targetArtist);

  if (!normSong || !normTarget) return false;

  // 1. Exact equality
  if (normSong === normTarget) return true;

  // 2. Known alias dictionary check
  const targetAliases = ARTIST_ALIASES[normTarget] || [normTarget];
  for (const alias of targetAliases) {
    if (normSong === alias) return true;
    const wordsPattern = new RegExp(`(^|[,/&|•-]\\s*|\\b)${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\s*[,/&|•-]|$)`, 'i');
    if (wordsPattern.test(normSong)) return true;
  }

  // 3. Substring check: if target is at least 3 chars and is in song artist
  if (normTarget.length >= 3 && normSong.includes(normTarget)) {
    return true;
  }

  // 4. Feature in song title: "Song (feat. Artist)" or "Song ft. Artist"
  if (songTitle) {
    const normTitle = normalizeArtist(songTitle);
    for (const alias of targetAliases) {
      if (alias.length >= 2) {
        const titlePattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (titlePattern.test(normTitle)) return true;
      }
    }
  }

  return false;
}

// ─── Taste Profile Builder (Likes + History + Onboarding Signals) ──────────
// Learns what the user loves: artist frequency analysis with weighted signals.
// Likes = strongest engagement signal, recent plays weighted heavier than old.
export function buildTasteProfile(preferences = {}, history = [], likes = []) {
  const artistScores = new Map();

  const bumpArtist = (rawName, weight) => {
    if (!rawName || typeof rawName !== 'string') return;
    // Primary artist only (strip collab/featured suffixes after commas)
    const name = normalizeArtist(rawName.split(',')[0].trim());
    if (!name || name === 'artist' || name === 'unknown artist' || name === 'various artists') return;
    artistScores.set(name, (artistScores.get(name) || 0) + weight);
  };

  // 1. Explicit onboarding choices (declared taste, strongest signal)
  (preferences.artists || []).filter(Boolean).forEach(a => bumpArtist(typeof a === 'string' ? a : a?.name, 3));

  // 2. Liked songs (deliberate engagement signal)
  (likes || []).forEach(l => bumpArtist(l?.artist, 2.5));

  // 3. Play history with recency decay: last 5 plays weigh double
  (history || []).forEach((h, i) => bumpArtist(h?.artist, i < 5 ? 2 : 1));

  // Ranked artists, deduplicated via fuzzy alias matching
  const ranked = Array.from(artistScores.entries()).sort((a, b) => b[1] - a[1]);
  const topArtists = [];
  for (const [name] of ranked) {
    if (topArtists.length >= 6) break;
    if (topArtists.some(t => matchesArtist(t, name) || matchesArtist(name, t))) continue;
    topArtists.push(name);
  }

  // Last played unique songs (most recent first)
  const seenVids = new Set();
  const recentSongs = [];
  for (const h of history || []) {
    if (!h?.videoId || seenVids.has(h.videoId)) continue;
    seenVids.add(h.videoId);
    recentSongs.push({
      videoId: h.videoId,
      title: cleanSongTitle(h.title) || h.title,
      artist: h.artist || 'Artist'
    });
    if (recentSongs.length >= 4) break;
  }

  // Most recent liked songs
  const seenLiked = new Set();
  const topLikedSongs = [];
  for (const l of likes || []) {
    if (!l?.videoId || seenLiked.has(l.videoId)) continue;
    seenLiked.add(l.videoId);
    topLikedSongs.push({
      videoId: l.videoId,
      title: cleanSongTitle(l.title) || l.title,
      artist: l.artist || 'Artist'
    });
    if (topLikedSongs.length >= 3) break;
  }

  return {
    topArtists,
    recentSongs,
    topLikedSongs,
    likedArtists: topLikedSongs.map(s => s.artist).filter(Boolean),
    hasSignals: topArtists.length > 0 || recentSongs.length > 0 || topLikedSongs.length > 0
  };
}

// ─── Model Formatters ───────────────────────────────────────────────────────
function formatSong(s) {
  if (!s || !s.videoId) return null;
  const thumbs = s.thumbnails || [];
  const rawThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
  const hdThumb = toHDThumbnail(rawThumb, s.videoId);
  const durSec = typeof s.duration === 'number' ? s.duration : parseDuration(s.duration);
  const durText = typeof s.duration === 'string'
    ? s.duration
    : durSec > 0
    ? `${Math.floor(durSec / 60)}:${(durSec % 60).toString().padStart(2, '0')}`
    : '3:30';

  return {
    videoId: s.videoId,
    title: s.name || s.title || 'Unknown Title',
    artist: s.artist?.name || (typeof s.artist === 'string' ? s.artist : 'Artist'),
    album: s.album?.name || '',
    duration: durSec,
    durationText: durText,
    thumbnail: hdThumb,
    type: 'song'
  };
}

function formatAlbum(a) {
  if (!a) return null;
  const thumbs = a.thumbnails || [];
  const rawThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
  const hdThumb = toHDThumbnail(rawThumb);
  const title = a.name || a.title || 'New Release';
  const artistName = a.artist?.name || (typeof a.artist === 'string' ? a.artist : 'Artist');
  const releaseYear = a.year || SYSTEM_YEAR;
  return {
    id: a.albumId || a.playlistId || `alb-${Math.random().toString(36).substring(7)}`,
    albumId: a.albumId,
    playlistId: a.playlistId,
    title,
    artist: artistName,
    creator: artistName,
    year: releaseYear,
    views: `Released ${releaseYear}`,
    thumbnail: hdThumb,
    type: 'album',
    badge: (artistName || title || 'A')[0].toUpperCase(),
    trackCount: a.trackCount || 1
  };
}

function formatPlaylist(p, customTitle) {
  if (!p) return null;
  const thumbs = p.thumbnails || [];
  const rawThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
  const hdThumb = toHDThumbnail(rawThumb);
  return {
    id: p.playlistId || p.browseId || `pl-${Math.random().toString(36).substring(7)}`,
    title: customTitle || p.name || p.title || 'Curated Mix',
    creator: p.artist?.name || 'FreeSong AI',
    views: `${Math.floor(Math.random() * 450 + 50)}k plays`,
    thumbnail: hdThumb,
    type: 'playlist',
    badge: (p.artist?.name || p.name || 'F')[0].toUpperCase(),
    trackCount: p.itemCount || 25
  };
}

// ─── Fetch Official YouTube Music Chart Songs Directly via API ─────────────
export async function fetchOfficialChart(yt, browseIdOrIds, cacheGet, cacheSet) {
  if (!browseIdOrIds) return [];
  const browseIds = Array.isArray(browseIdOrIds) ? browseIdOrIds : [browseIdOrIds];
  const cacheKey = `chart_browse_${browseIds.join('_')}`;
  if (cacheGet) {
    const cached = cacheGet(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const allSongs = [];
    const seenVideos = new Set();
    const seenTitles = new Set();

    for (const browseId of browseIds) {
      try {
        const data = await yt.constructRequest('browse', { browseId });
        const shelf = data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer;
        const items = shelf?.contents || [];

        for (const c of items) {
          const r = c.musicResponsiveListItemRenderer;
          if (!r) continue;
          const rawTitle = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
          const artist = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Artist';
          const watch = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint ||
                        r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint;
          const videoId = watch?.videoId;
          const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
          const thumb = thumbs[thumbs.length - 1]?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
          const durText = r.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text || '3:30';
          const durSec = parseDuration(durText);

          if (rawTitle && videoId) {
            const cleaned = cleanSongTitle(rawTitle) || rawTitle;
            const normTitle = cleaned.toLowerCase().trim();
            const item = {
              videoId,
              title: cleaned,
              artist,
              album: '',
              duration: durSec,
              durationText: durText,
              thumbnail: toHDThumbnail(thumb, videoId),
              type: 'song'
            };
            if (!isSpamOrJunkSong(item) && !seenVideos.has(videoId) && !seenTitles.has(normTitle)) {
              seenVideos.add(videoId);
              seenTitles.add(normTitle);
              allSongs.push(item);
            }
          }
        }
      } catch (innerErr) {
        console.warn(`fetchOfficialChart failed for browseId ${browseId}:`, innerErr.message);
      }
    }

    if (allSongs.length > 0 && cacheSet) {
      cacheSet(cacheKey, allSongs, 30 * 60 * 1000); // 30 min cache for official charts
    }
    return allSongs;
  } catch (err) {
    console.warn(`fetchOfficialChart failed:`, err.message);
    return [];
  }
}

// ─── Fetch Live Daily Trending from YouTube Music Charts Page ───────────────
// FEmusic_charts is YouTube Music's native chart page ("Top songs", "Trending
// songs") which rotates DAILY — unlike weekly-updated editorial hitlists.
export async function fetchLiveTrendingCharts(yt, cacheGet, cacheSet) {
  const cacheKey = 'live_music_charts_v1';
  if (cacheGet) {
    const cached = cacheGet(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const data = await yt.constructRequest('browse', { browseId: 'FEmusic_charts' });
    const sections = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const songs = [];
    const seenVideos = new Set();
    const seenTitles = new Set();

    for (const sec of sections) {
      const shelf = sec.musicCarouselShelfRenderer;
      if (!shelf) continue;
      const shelfTitle = (shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '').toLowerCase();
      // Only song/trending carousels — skip music videos, artists, albums, moods
      if (shelfTitle.includes('video') || shelfTitle.includes('artist') || shelfTitle.includes('album')) continue;
      if (!shelfTitle.includes('song') && !shelfTitle.includes('trending')) continue;

      for (const c of shelf.contents || []) {
        const r = c.musicTwoRowItemRenderer || c.musicResponsiveListItemRenderer;
        if (!r) continue;
        const nav = r.navigationEndpoint;
        const videoId = nav?.watchEndpoint?.videoId;
        if (!videoId || seenVideos.has(videoId)) continue;

        const titleRuns = r.title?.runs
          || r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
          || [];
        const rawTitle = titleRuns[0]?.text;
        if (!rawTitle) continue;

        const subRuns = r.subtitle?.runs
          || r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
          || [];
        const artist = (subRuns[0]?.text || 'Artist').replace(/\s*[•·]\s*$/, '').trim();

        const thumbs = r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails
          || r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          || [];
        const thumb = thumbs[thumbs.length - 1]?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

        const cleaned = cleanSongTitle(rawTitle) || rawTitle;
        const normTitle = cleaned.toLowerCase().trim();
        const item = {
          videoId,
          title: cleaned,
          artist,
          album: '',
          duration: 0,
          durationText: '',
          thumbnail: toHDThumbnail(thumb, videoId),
          type: 'song'
        };

        if (!isSpamOrJunkSong(item) && !seenTitles.has(normTitle)) {
          seenVideos.add(videoId);
          seenTitles.add(normTitle);
          songs.push(item);
        }
      }
    }

    if (songs.length > 0 && cacheSet) {
      cacheSet(cacheKey, songs, 30 * 60 * 1000);
    }
    return songs;
  } catch (err) {
    console.warn('fetchLiveTrendingCharts failed:', err.message);
    return [];
  }
}

// ─── Fetch Official New Album Releases Directly from YouTube Music ─────────
export async function fetchOfficialNewAlbums(yt, cacheGet, cacheSet) {
  const cacheKey = 'official_new_albums_v2';
  if (cacheGet) {
    const cached = cacheGet(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const relData = await yt.constructRequest('browse', { browseId: 'FEmusic_new_releases_albums' }).catch(() => null);
    const gridItems = relData?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.gridRenderer?.items || [];
    const albums = gridItems.map(it => {
      const twoRow = it.musicTwoRowItemRenderer;
      if (!twoRow) return null;
      const title = twoRow.title?.runs?.[0]?.text;
      const subRuns = twoRow.subtitle?.runs || [];
      const subText = subRuns.map(r => r.text).join('');
      const artist = subRuns.length > 2 ? subRuns.slice(2).map(r => r.text).join('').trim() : subRuns[0]?.text;
      const albumId = twoRow.navigationEndpoint?.browseEndpoint?.browseId;
      const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      const rawThumb = thumbs[thumbs.length - 1]?.url || '';
      return {
        id: albumId || `alb-${Math.random().toString(36).substring(7)}`,
        albumId,
        title: title || 'New Release',
        artist: artist || 'Artist',
        creator: artist || 'Artist',
        year: SYSTEM_YEAR,
        views: subText || `Released ${SYSTEM_YEAR}`,
        thumbnail: toHDThumbnail(rawThumb),
        type: 'album',
        badge: (artist || title || 'A')[0].toUpperCase(),
        trackCount: subText.toLowerCase().includes('single') ? 1 : (subText.toLowerCase().includes('ep') ? 4 : 8)
      };
    }).filter(Boolean);

    if (albums.length > 0 && cacheSet) {
      cacheSet(cacheKey, albums, 30 * 60 * 1000);
    }
    return albums;
  } catch (err) {
    console.warn('fetchOfficialNewAlbums failed:', err.message);
    return [];
  }
}

// ─── Shelf Plan Generator ───────────────────────────────────────────────────
// ─── Genre Variety Terms Engine ─────────────────────────────────────────────
// Every genre has a pool of themed sub-shelf terms (5-8 each). The home feed
// picks a RANDOM 3-4 subset per genre per rotation window — never all at once,
// so the feed feels fresh on every refresh.
const GENRE_VARIETY_POOLS = {
  bollywood: [
    { eyebrow: 'CHARTBUSTERS', title: 'Bollywood Chartbusters', query: 'trending bollywood songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Bollywood Releases', query: 'new bollywood songs' },
    { eyebrow: 'DANCE FLOOR', title: 'Bollywood Dance Floor', query: 'bollywood dance hits' },
    { eyebrow: 'LOVE DOSE', title: 'Bollywood Romantic Hits', query: 'bollywood romantic songs' },
    { eyebrow: 'SOULFUL SIDE', title: 'Bollywood Soulful Melodies', query: 'bollywood soulful songs' },
    { eyebrow: 'SUPERHITS', title: 'Filmy Superhits Mix', query: 'bollywood superhit songs' }
  ],
  punjabi: [
    { eyebrow: 'CHARTBUSTERS', title: 'Punjabi Chartbusters', query: 'trending punjabi songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Punjabi Drops', query: 'new punjabi songs' },
    { eyebrow: 'PARTY MODE', title: 'Punjabi Party Bangers', query: 'punjabi party songs' },
    { eyebrow: 'MOHABBAT', title: 'Punjabi Romantic', query: 'punjabi romantic songs' },
    { eyebrow: 'DESI SWAG', title: 'Punjabi Desi Vibes', query: 'punjabi desi songs' },
    { eyebrow: 'SLOW JAMS', title: 'Punjabi Slow Jams', query: 'punjabi slow songs romantic' }
  ],
  tamil: [
    { eyebrow: 'CHARTBUSTERS', title: 'Kollywood Chartbusters', query: 'trending tamil songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Kollywood Releases', query: 'new tamil songs' },
    { eyebrow: 'KADHAL', title: 'Tamil Romantic Hits', query: 'tamil romantic songs' },
    { eyebrow: 'GAANA FOLK', title: 'Tamil Folk & Gaana', query: 'tamil gaana folk songs' },
    { eyebrow: 'MELDIES', title: 'Tamil Soulful Melodies', query: 'tamil melody songs' }
  ],
  telugu: [
    { eyebrow: 'CHARTBUSTERS', title: 'Tollywood Chartbusters', query: 'trending telugu songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Tollywood Releases', query: 'new telugu songs' },
    { eyebrow: 'PREMA', title: 'Telugu Romantic Hits', query: 'telugu romantic songs' },
    { eyebrow: 'MASS BEATS', title: 'Telugu Mass Bangers', query: 'telugu mass songs' },
    { eyebrow: 'MELDIES', title: 'Telugu Soulful Melodies', query: 'telugu melody songs' }
  ],
  haryanvi: [
    { eyebrow: 'CHARTBUSTERS', title: 'Haryanvi Trending Hits', query: 'trending haryanvi songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Haryanvi Releases', query: 'new haryanvi songs' },
    { eyebrow: 'DESI BEATS', title: 'Haryanvi Dance Beats', query: 'haryanvi dance songs' },
    { eyebrow: 'RAGNI FOLK', title: 'Ragni & Folk Tales', query: 'haryanvi folk ragni songs' }
  ],
  bengali: [
    { eyebrow: 'CHARTBUSTERS', title: 'Bangla Chartbusters', query: 'trending bengali songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Bengali Releases', query: 'new bengali songs' },
    { eyebrow: 'MONER KOTHA', title: 'Bengali Romantic', query: 'bengali romantic songs' },
    { eyebrow: 'ROOTS', title: 'Rabindra Sangeet & Folk', query: 'rabindra sangeet bengali folk' }
  ],
  malayalam: [
    { eyebrow: 'CHARTBUSTERS', title: 'Mollywood Chartbusters', query: 'trending malayalam songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Malayalam Releases', query: 'new malayalam songs' },
    { eyebrow: 'MELDIES', title: 'Malayalam Evergreen Melodies', query: 'malayalam melody songs' },
    { eyebrow: 'INDIE WAVE', title: 'Malayalam Independent', query: 'malayalam indie songs' }
  ],
  kannada: [
    { eyebrow: 'CHARTBUSTERS', title: 'Sandalwood Chartbusters', query: 'trending kannada songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Kannada Releases', query: 'new kannada songs' },
    { eyebrow: 'MASS BEATS', title: 'Kannada Mass Bangers', query: 'kannada mass songs' },
    { eyebrow: 'MELDIES', title: 'Kannada Melodies', query: 'kannada melody songs' }
  ],
  bhojpuri: [
    { eyebrow: 'CHARTBUSTERS', title: 'Bhojpuri Superhits', query: 'trending bhojpuri songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Bhojpuri Releases', query: 'new bhojpuri songs' },
    { eyebrow: 'DANCE FLOOR', title: 'Bhojpuri Dance Bangers', query: 'bhojpuri dance songs' },
    { eyebrow: 'SAJAN', title: 'Bhojpuri Romantic', query: 'bhojpuri romantic songs' }
  ],
  lofi: [
    { eyebrow: 'CHILL BEATS', title: 'Lo-Fi Chill Beats', query: 'lofi chill beats songs' },
    { eyebrow: 'STUDY MODE', title: 'Study & Focus Lo-Fi', query: 'lofi study focus' },
    { eyebrow: 'DESI LO-FI', title: 'Hindi Lo-Fi Chill', query: 'hindi lofi songs' },
    { eyebrow: 'MIDNIGHT', title: 'Late Night Lo-Fi', query: 'lofi night sleep calm' },
    { eyebrow: 'BOLLYWOOD FLIP', title: 'Bollywood Lo-Fi Flips', query: 'bollywood lofi songs' }
  ],
  romantic: [
    { eyebrow: 'CHARTBUSTERS', title: 'Romantic Chartbusters', query: 'trending romantic songs hindi' },
    { eyebrow: 'DUETS', title: 'Bollywood Love Duets', query: 'bollywood romantic duets' },
    { eyebrow: '90s ISHQ', title: '90s Romantic Gold', query: '90s romantic hindi songs' },
    { eyebrow: 'PUNJABI ISHQ', title: 'Punjabi Love Songs', query: 'punjabi love songs' },
    { eyebrow: 'ENGLISH LOVE', title: 'English Love Ballads', query: 'english love ballads songs' },
    { eyebrow: 'FIRST LOVE', title: 'Soft First-Love Melodies', query: 'romantic melodies hindi soft' }
  ],
  desihiphop: [
    { eyebrow: 'BANGERS', title: 'Desi Hip Hop Bangers', query: 'desi hip hop rap songs' },
    { eyebrow: 'CYPHERS', title: 'Hindi Rap Cyphers', query: 'hindi rap songs' },
    { eyebrow: 'PUNJABI RAP', title: 'Punjabi Hip Hop Heat', query: 'punjabi hip hop songs' },
    { eyebrow: 'TRAP', title: 'Desi Trap Wave', query: 'desi trap songs' },
    { eyebrow: 'NEW SCHOOL', title: 'New School Desi Rap', query: 'desi rap songs' }
  ],
  indianindie: [
    { eyebrow: 'RISING', title: 'Indie Rising Stars', query: 'trending indian indie songs' },
    { eyebrow: 'DISCOVER', title: 'Fresh Indie Discoveries', query: 'new indian indie songs' },
    { eyebrow: 'INDIE ISHQ', title: 'Indie Love Songs', query: 'indian indie love songs' },
    { eyebrow: 'ACOUSTIC', title: 'Indie Acoustic Sessions', query: 'indian indie acoustic songs' },
    { eyebrow: 'HINDI POP', title: 'Hindi Indie Pop', query: 'hindi indie pop songs' }
  ],
  englishpop: [
    { eyebrow: 'HOTLIST', title: 'Pop Hotlist', query: 'trending english pop songs' },
    { eyebrow: 'NEW DROPS', title: 'New Pop Drops', query: 'new english pop songs' },
    { eyebrow: 'CLASSICS', title: 'Pop Classics', query: 'english pop classic songs' },
    { eyebrow: 'ACOUSTIC', title: 'Stripped Pop', query: 'english acoustic pop songs' },
    { eyebrow: 'PARTY POP', title: 'Pop Party', query: 'english pop party songs' }
  ],
  hiphoprap: [
    { eyebrow: 'GLOBAL HEAT', title: 'Global Rap Heat', query: 'trending rap songs' },
    { eyebrow: 'LEGENDS', title: 'Hip Hop Classics', query: 'hip hop classics songs' },
    { eyebrow: 'TRAP & DRILL', title: 'Trap & Drill Wave', query: 'trap drill rap songs' },
    { eyebrow: 'OLD SCHOOL', title: 'Old School Rap', query: 'old school hip hop songs' },
    { eyebrow: 'COLLABS', title: 'Epic Rap Collabs', query: 'rap collab songs' }
  ],
  devotional: [
    { eyebrow: 'BHAJAN', title: 'Bhakti Chartbusters', query: 'trending devotional songs' },
    { eyebrow: 'MORNING POOJA', title: 'Morning Aarti & Bhajan', query: 'morning bhajan aarti songs' },
    { eyebrow: 'MAHADEV', title: 'Shiv Bhakti & Bhajans', query: 'shiv bhajan songs' },
    { eyebrow: 'KRISHNA', title: 'Krishna Bhakti Ras', query: 'krishna bhajan songs' },
    { eyebrow: 'MANTRA', title: 'Mantra Chants & Jaap', query: 'mantra chanting songs' }
  ],
  workout: [
    { eyebrow: 'BEAST MODE', title: 'Beast Mode Bangers', query: 'workout motivation songs' },
    { eyebrow: 'GYM PUMP', title: 'Hindi Gym Pump', query: 'gym hindi songs' },
    { eyebrow: 'EDM LIFTS', title: 'EDM Workout Mix', query: 'workout edm songs' },
    { eyebrow: 'CARDIO', title: 'Cardio Hip Hop', query: 'cardio rap workout songs' },
    { eyebrow: 'PUNJABI POWER', title: 'Power Punjabi Gym', query: 'punjabi gym workout songs' }
  ],
  party: [
    { eyebrow: 'KICKOFF', title: 'Party Starters', query: 'party songs bollywood' },
    { eyebrow: 'CLUB', title: 'Club Bangers', query: 'club songs hindi' },
    { eyebrow: 'DANCE FLOOR', title: 'Dance Floor Fillers', query: 'bollywood dance floor songs' },
    { eyebrow: 'HOUSE PARTY', title: 'House Party Anthems', query: 'house party songs' },
    { eyebrow: 'PUNJABI PARTY', title: 'Punjabi Party Nonstop', query: 'punjabi party dance songs' }
  ],
  '90s': [
    { eyebrow: 'SUPERHITS', title: '90s Superhits', query: '90s bollywood hits' },
    { eyebrow: 'ISHQ', title: '90s Romantic Gold', query: '90s romantic hindi songs' },
    { eyebrow: 'MASALA', title: '90s Dance & Masala', query: '90s bollywood dance songs' },
    { eyebrow: 'DARD', title: '90s Sad Classics', query: '90s sad hindi songs' },
    { eyebrow: '2000s', title: 'Early 2000s Nostalgia', query: '2000s bollywood hits' }
  ],
  ghazals: [
    { eyebrow: 'LEGENDS', title: 'Ghazal Greats', query: 'ghazal songs classic' },
    { eyebrow: 'SUFI', title: 'Sufi & Qawwali Nights', query: 'sufi qawwali songs' },
    { eyebrow: 'JAGJIT ERA', title: 'Golden Ghazal Era', query: 'ghazal jagjit singh mehdi hassan' },
    { eyebrow: 'MODERN', title: 'Modern Ghazals', query: 'modern ghazal songs' },
    { eyebrow: 'SUFI ROCK', title: 'Sufi Rock Fusion', query: 'sufi rock songs' }
  ],
  edm: [
    { eyebrow: 'BANGERS', title: 'EDM Bangers', query: 'edm electronic dance songs' },
    { eyebrow: 'FESTIVAL', title: 'Festival Anthems', query: 'edm festival anthems' },
    { eyebrow: 'HOUSE', title: 'Deep & Tropical House', query: 'tropical deep house songs' },
    { eyebrow: 'BIG ROOM', title: 'Big Room Energy', query: 'big room edm songs' },
    { eyebrow: 'INDIAN EDM', title: 'Indian EDM Scene', query: 'indian edm songs' }
  ],
  rock: [
    { eyebrow: 'ANTHEMS', title: 'Rock Anthems', query: 'rock alternative anthems' },
    { eyebrow: 'HINDI ROCK', title: 'Hindi Rock Scene', query: 'hindi rock songs' },
    { eyebrow: 'LEGENDS', title: 'Classic Rock Legends', query: 'classic rock songs' },
    { eyebrow: 'BALLADS', title: 'Soft Rock Ballads', query: 'soft rock ballads songs' },
    { eyebrow: 'INDIE ROCK', title: 'Indie Rock Picks', query: 'indie rock songs' }
  ],
  sleep: [
    { eyebrow: 'DRIFT OFF', title: 'Sleep & Drift Away', query: 'sleep music relaxing' },
    { eyebrow: 'RAIN', title: 'Rain & Nature Sounds', query: 'rain sounds sleep music' },
    { eyebrow: 'DEEP SLEEP', title: 'Deep Sleep Ambient', query: 'deep sleep ambient music' },
    { eyebrow: 'MEDITATE', title: 'Calm Meditation', query: 'meditation calm music' }
  ],
  focus: [
    { eyebrow: 'DEEP WORK', title: 'Deep Focus Instrumentals', query: 'focus instrumental music' },
    { eyebrow: 'STUDY', title: 'Study Concentration', query: 'study concentration music' },
    { eyebrow: 'FLOW', title: 'Ambient Work Flow', query: 'ambient work music' },
    { eyebrow: 'LO-FI STUDY', title: 'Lo-Fi Study Beats', query: 'lofi study beats' }
  ],
  sad: [
    { eyebrow: 'CHARTBUSTERS', title: 'Sad & Breakup Chartbusters', query: 'trending sad songs bollywood' },
    { eyebrow: 'BEWAFAI', title: 'Heartbreak & Bewafai', query: 'sad songs bewafai hindi' },
    { eyebrow: 'AKELAPAN', title: 'Alone & Lonely Nights', query: 'sad alone songs hindi' },
    { eyebrow: 'BARISH', title: 'Emotional Rain Melodies', query: 'sad barish songs' },
    { eyebrow: 'OLD DARD', title: 'Old Sad Classics', query: 'old sad hindi songs evergreen' },
    { eyebrow: 'PUNJABI DARD', title: 'Punjabi Heartbreak Hits', query: 'punjabi sad songs' },
    { eyebrow: 'NIGHT BLUES', title: 'Sad Lo-Fi Nights', query: 'sad lofi songs' }
  ],
  viral: [
    { eyebrow: 'REELS', title: 'Reel Sensations', query: 'viral instagram reel songs' },
    { eyebrow: 'TRENDING', title: 'Trending Everywhere', query: 'viral trending songs india' },
    { eyebrow: 'PUNJABI VIRAL', title: 'Viral Punjabi', query: 'viral punjabi songs' },
    { eyebrow: 'VIRAL ISHQ', title: 'Viral Love Anthems', query: 'viral love songs' },
    { eyebrow: 'DANCE VIRAL', title: 'Internet Dance Breakers', query: 'viral dance songs' },
    { eyebrow: 'GLOBAL VIRAL', title: 'Global Viral Crossovers', query: 'viral english songs trending' }
  ],
  wedding: [
    { eyebrow: 'WEDDING ESSENTIALS', title: 'Best of Wedding Songs', query: 'best bollywood wedding songs' },
    { eyebrow: 'CEREMONIES', title: 'Wedding Ceremonies & Rituals', query: 'indian wedding ceremony songs traditional' },
    { eyebrow: 'SANGEET NIGHT', title: 'Sangeet Dance Floor Fillers', query: 'sangeet dance songs bollywood' },
    { eyebrow: 'MEHNDI & HALDI', title: 'Mehndi & Haldi Melodies', query: 'mehndi haldi songs' },
    { eyebrow: 'BAARAT', title: 'Baarat & Entry Anthems', query: 'baraat entry songs hindi' },
    { eyebrow: 'FIRST DANCE', title: 'Romantic Wedding Duets', query: 'wedding romantic duets hindi' },
    { eyebrow: 'VIDAAI', title: 'Emotional Vidaai Moments', query: 'vidai emotional songs' },
    { eyebrow: 'PUNJABI SHADI', title: 'Punjabi Shaadi Bangers', query: 'punjabi wedding songs' }
  ],
  retro: [
    { eyebrow: 'GOLDEN ERA', title: 'Golden Era Superhits', query: 'old hindi classic hits kishore rafi' },
    { eyebrow: 'KISHORE DA', title: 'Kishore Kumar Timeless', query: 'kishore kumar best songs' },
    { eyebrow: 'DUETS', title: 'Lata & Rafi Classic Duets', query: 'lata mangeshkar mohammed rafi duets' },
    { eyebrow: 'DISCO', title: '70s & 80s Disco Fever', query: 'old hindi disco songs' },
    { eyebrow: 'RETRO ISHQ', title: 'Retro Romantic Classics', query: 'old hindi romantic songs' },
    { eyebrow: 'GHAZAL GOLD', title: 'Ghazal Era Gold', query: 'old hindi ghazal songs' },
    { eyebrow: 'RETRO DANCE', title: 'Retro Dance Classics', query: 'old hindi dance songs' }
  ],
  marathi: [
    { eyebrow: 'CHARTBUSTERS', title: 'Marathi Chartbusters', query: 'trending marathi songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Marathi Releases', query: 'new marathi songs' },
    { eyebrow: 'PREM GEETE', title: 'Marathi Romantic Hits', query: 'marathi romantic songs' },
    { eyebrow: 'LAVANI', title: 'Lavani & Folk', query: 'lavani marathi folk songs' },
    { eyebrow: 'MELDIES', title: 'Marathi Soulful Melodies', query: 'marathi melody songs' }
  ],
  gujarati: [
    { eyebrow: 'GARBA NIGHT', title: 'Garba & Dandiya Night', query: 'garba dandiya songs' },
    { eyebrow: 'CHARTBUSTERS', title: 'Gujarati Chartbusters', query: 'trending gujarati songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Gujarati Releases', query: 'new gujarati songs' },
    { eyebrow: 'PREM', title: 'Gujarati Romantic Hits', query: 'gujarati romantic songs' },
    { eyebrow: 'FOLK', title: 'Gujarati Folk Melodies', query: 'gujarati folk songs' }
  ],
  rajasthani: [
    { eyebrow: 'CHARTBUSTERS', title: 'Rajasthani Trending Hits', query: 'trending rajasthani songs' },
    { eyebrow: 'LOK GEET', title: 'Folk & Lok Geet', query: 'rajasthani lok geet folk songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Rajasthani Releases', query: 'new rajasthani songs' },
    { eyebrow: 'PREM', title: 'Rajasthani Romantic', query: 'rajasthani romantic songs' },
    { eyebrow: 'DESERT BEATS', title: 'Desert Dance Beats', query: 'rajasthani dance songs' }
  ],
  kpop: [
    { eyebrow: 'CHARTBUSTERS', title: 'K-Pop Chartbusters', query: 'trending kpop songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest K-Pop Releases', query: 'new kpop songs' },
    { eyebrow: 'GIRL GROUPS', title: 'K-Pop Girl Groups', query: 'kpop girl group hits' },
    { eyebrow: 'BOY GROUPS', title: 'K-Pop Boy Groups', query: 'kpop boy group hits' },
    { eyebrow: 'BALLADS', title: 'K-Pop Ballads', query: 'kpop ballads acoustic' },
    { eyebrow: 'K-HIPHOP', title: 'K-Hip Hop & R&B', query: 'korean hip hop rnb songs' }
  ],
  pakistani: [
    { eyebrow: 'COKE STUDIO', title: 'Coke Studio Legends', query: 'coke studio pakistan best songs' },
    { eyebrow: 'CHARTBUSTERS', title: 'Pakistani Chartbusters', query: 'trending pakistani songs' },
    { eyebrow: 'FRESH DROPS', title: 'Latest Pakistani Pop', query: 'new pakistani pop songs' },
    { eyebrow: 'SUFI ROCK', title: 'Sufi Rock & Qawwali', query: 'pakistani sufi rock qawwali songs' },
    { eyebrow: 'MOHABBAT', title: 'Pakistani Romantic Hits', query: 'pakistani romantic songs' },
    { eyebrow: 'VIRAL', title: 'Pakistani Viral Crossovers', query: 'pakistani viral songs' }
  ],
  metal: [
    { eyebrow: 'HEAVY', title: 'Metal Bangers', query: 'heavy metal songs' },
    { eyebrow: 'ANTHEMS', title: 'Hard Rock Anthems', query: 'hard rock anthems songs' },
    { eyebrow: 'MODERN', title: 'Modern Metalcore', query: 'metalcore modern metal songs' },
    { eyebrow: 'BALLADS', title: 'Rock Ballads That Hit Deep', query: 'rock ballads songs' },
    { eyebrow: 'DESI METAL', title: 'Indian Metal Scene', query: 'indian metal bands songs' }
  ],
  jazz: [
    { eyebrow: 'CLASSICS', title: 'Jazz Classics', query: 'jazz classics songs' },
    { eyebrow: 'EVENING', title: 'Smooth Jazz Evening', query: 'smooth jazz saxophone songs' },
    { eyebrow: 'BLUES', title: 'Blues Greats', query: 'blues classic songs' },
    { eyebrow: 'COFFEE', title: 'Jazz & Coffee Mornings', query: 'jazz coffee morning music' },
    { eyebrow: 'FUSION', title: 'Modern Jazz Fusion', query: 'modern jazz fusion songs' }
  ],
  rnb: [
    { eyebrow: 'CHARTBUSTERS', title: 'R&B Chartbusters', query: 'trending rnb songs' },
    { eyebrow: 'SOUL', title: 'Soul Classics', query: 'soul music classics' },
    { eyebrow: 'LATE NIGHT', title: 'Late Night R&B', query: 'rnb late night slow songs' },
    { eyebrow: 'NEO SOUL', title: 'Neo-Soul Vibes', query: 'neo soul songs' },
    { eyebrow: 'LOVE', title: 'R&B Love Songs', query: 'rnb love songs' }
  ],
  classical: [
    { eyebrow: 'LEGENDS', title: 'Hindustani Legends', query: 'hindustani classical vocal legendary' },
    { eyebrow: 'CARNATIC', title: 'Carnatic Gems', query: 'carnatic classical songs' },
    { eyebrow: 'INSTRUMENTAL', title: 'Sitar, Tabla & Sarod', query: 'indian classical instrumental sitar tabla' },
    { eyebrow: 'FUSION', title: 'Classical Fusion', query: 'indian classical fusion songs' },
    { eyebrow: 'RAAGAS', title: 'Raaga Deep Dives', query: 'indian classical raga renditions' },
    { eyebrow: 'MORNING RAAG', title: 'Morning Ragas', query: 'morning raga classical songs' }
  ],
  acoustic: [
    { eyebrow: 'UNPLUGGED', title: 'Unplugged Hits', query: 'unplugged acoustic hits bollywood' },
    { eyebrow: 'COVERS', title: 'Acoustic Bollywood Covers', query: 'acoustic bollywood covers' },
    { eyebrow: 'GUITAR', title: 'Raw Guitar Sessions', query: 'acoustic guitar sessions hindi' },
    { eyebrow: 'INDIE ACOUSTIC', title: 'Indie Acoustic', query: 'indie acoustic songs' },
    { eyebrow: 'STRIPPED', title: 'Stripped & Soulful', query: 'stripped acoustic songs' }
  ],
  happy: [
    { eyebrow: 'CHARTBUSTERS', title: 'Happy Vibes Chartbusters', query: 'happy feel good songs bollywood' },
    { eyebrow: 'SUNSHINE', title: 'Sunshine Pop (English)', query: 'feel good english pop songs' },
    { eyebrow: 'ZINDAGI', title: 'Zindagi & Positivity', query: 'positive zindagi songs hindi' },
    { eyebrow: 'DANCE SMILE', title: 'Dance-Inducing Happy Hits', query: 'happy dance songs bollywood' },
    { eyebrow: 'PUNJABI JOY', title: 'Feel-Good Punjabi', query: 'feel good punjabi songs' },
    { eyebrow: 'INSTRUMENTAL JOY', title: 'Good Mood Instrumentals', query: 'uplifting instrumental songs' }
  ],
  piano: [
    { eyebrow: 'GREATS', title: 'Piano Greats', query: 'piano instrumental covers popular' },
    { eyebrow: 'FOCUS', title: 'Calm Piano for Focus', query: 'calm piano melodies relaxing' },
    { eyebrow: 'CINEMATIC', title: 'Cinematic Piano', query: 'cinematic piano music' },
    { eyebrow: 'LOVE THEMES', title: 'Piano Love Themes', query: 'romantic piano instrumental' },
    { eyebrow: 'BOLLYWOOD KEYS', title: 'Bollywood on Piano', query: 'piano bollywood covers instrumental' }
  ]
};

// Deterministic pick for the current 10-minute rotation window — the same
// window serves a stable variety mix (cache friendly), the next window rotates.
function pickGenreVariety(pool, count, seedKey) {
  const timeBucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const key = `${seedKey}_${timeBucket}`;
  let s = 2166136261;
  for (let i = 0; i < key.length; i++) {
    s ^= key.charCodeAt(i);
    s = Math.imul(s, 16777619) >>> 0;
  }
  const arr = [...pool];
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

// Genius time machine: IST hour buckets so the feed matches the user's
// moment of the day — morning freshness, afternoon focus, golden hour
// romance, after-hours chill. Weekend evenings get a party boost.
function getIstHour() {
  try {
    return parseInt(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23'
    }).format(new Date()), 10) || 0;
  } catch {
    return new Date().getHours();
  }
}

const GENIUS_TIME_BUCKETS = [
  {
    id: 'morning', hours: [5, 6, 7, 8, 9, 10, 11],
    eyebrow: 'GENIUS TIME PICK • MORNING VIBES',
    picks: [
      { title: 'Good Morning Fresh Mix', query: 'morning fresh songs hindi uplifting' },
      { title: 'Sunshine Starters', query: 'morning english pop fresh songs' },
      { title: 'Morning Raagas & Calm', query: 'morning raga classical songs' },
      { title: 'Wake Up Punjabi Energy', query: 'morning punjabi upbeat songs' }
    ]
  },
  {
    id: 'afternoon', hours: [12, 13, 14, 15, 16],
    eyebrow: 'GENIUS TIME PICK • AFTERNOON FLOW',
    picks: [
      { title: 'Afternoon Focus Flow', query: 'focus study instrumental songs' },
      { title: 'Midday Mood Lifters', query: 'afternoon mood uplifting songs hindi' },
      { title: 'Timeless Afternoon Classics', query: 'timeless bollywood afternoon hits' },
      { title: 'Chill Afternoon Acoustic', query: 'afternoon acoustic chill songs' }
    ]
  },
  {
    id: 'evening', hours: [17, 18, 19, 20, 21],
    eyebrow: 'GENIUS TIME PICK • GOLDEN HOUR',
    picks: [
      { title: 'Golden Hour Romance', query: 'evening romantic songs hindi' },
      { title: 'Sunset Drive Mix', query: 'driving songs hindi highway' },
      { title: 'Evening Party Warmup', query: 'evening party songs bollywood' },
      { title: 'Evening Unwind Sessions', query: 'evening soulful songs unwind' }
    ]
  },
  {
    id: 'night', hours: [22, 23, 0, 1, 2, 3, 4],
    eyebrow: 'GENIUS TIME PICK • AFTER HOURS',
    picks: [
      { title: 'Late Night Lo-Fi & Chill', query: 'late night lofi chill songs' },
      { title: 'Midnight Sad Melodies', query: 'midnight sad songs emotional' },
      { title: 'After Hours Slow Jams', query: 'late night slow songs romantic' },
      { title: 'Sleep-Ready Ambient', query: 'sleep ambient calming music' }
    ]
  }
];

export function generateShelfPlan(preferences = {}, history = [], likes = []) {
  const userArtists = (preferences.artists || []).filter(Boolean);
  const userGenres = (preferences.genres || []).filter(Boolean);

  // Smart taste profile: learns from liked songs, play history & onboarding choices
  const taste = buildTasteProfile(preferences, history, likes);

  // Artist pool: onboarding choices first, then artists inferred from likes & history
  const primaryArtists = [...userArtists];
  taste.topArtists.forEach(a => {
    if (!primaryArtists.some(x => matchesArtist(x, a))) primaryArtists.push(a);
  });
  if (primaryArtists.length === 0) primaryArtists.push('Arijit Singh', 'Diljit Dosanjh', 'Taylor Swift');

  const primaryGenres = userGenres.length > 0 ? userGenres : ['bollywood', 'punjabi', 'lofi'];

  const shelves = [];
  const mainArtist = primaryArtists[0] || 'Arijit Singh';
  const mainGenre = primaryGenres[0].toLowerCase();
  const capGenre = mainGenre.charAt(0).toUpperCase() + mainGenre.slice(1);

  // 1. Real-Time Listening History Driven Shelves (TOP PRIORITY)
  if (history && history.length > 0) {
    const recentItem = history[0];
    if (recentItem?.videoId) {
      const cleanTitle = cleanSongTitle(recentItem.title) || recentItem.title;
      shelves.push({
        id: 'shelf-history-radio-0',
        eyebrow: 'RADIO WAVE • BASED ON RECENT PLAY',
        title: `Songs like ${cleanTitle}`,
        videoId: recentItem.videoId,
        artistHint: recentItem.artist,
        type: 'radio_songs',
        category: 'history'
      });

      if (recentItem.artist) {
        const isFollowed = primaryArtists.some(
          a => matchesArtist(a, recentItem.artist)
        );
        if (!isFollowed) {
          shelves.push({
            id: 'shelf-history-artist-0',
            eyebrow: `MORE FROM ${(recentItem.artist || '').toUpperCase()}`,
            title: `More from ${recentItem.artist}`,
            searchQuery: `${recentItem.artist} new songs`,
            artistFilter: recentItem.artist,
            type: 'artist_songs',
            category: 'history'
          });
        }
      }
    }

    // Second recent track radio wave
    if (history.length > 1 && history[1]?.videoId && history[1].videoId !== history[0]?.videoId) {
      const secondItem = history[1];
      const secondCleanTitle = cleanSongTitle(secondItem.title) || secondItem.title;
      shelves.push({
        id: 'shelf-history-radio-1',
        eyebrow: 'CONTINUE LISTENING',
        title: `Songs like ${secondCleanTitle}`,
        videoId: secondItem.videoId,
        artistHint: secondItem.artist,
        type: 'radio_songs',
        category: 'history'
      });
    }

    // ── GENIUS: "On Repeat" — replay-count analysis resurfaces the songs the
    // user keeps coming back to (Spotify's killer feature, done live from
    // history with zero extra API calls)
    const replayCounts = new Map();
    for (const h of history) {
      if (!h?.videoId) continue;
      const cur = replayCounts.get(h.videoId) || { ...h, count: 0 };
      cur.count += 1;
      replayCounts.set(h.videoId, cur);
    }
    const onRepeatSongs = [...replayCounts.values()]
      .filter(x => x.count >= 2)
      .sort((a, b) => b.count - a.count);
    if (onRepeatSongs.length >= 2) {
      shelves.push({
        id: 'shelf-on-repeat',
        eyebrow: 'ON REPEAT • ON LOOP IN YOUR HEAD',
        title: "Songs you can't stop playing",
        type: 'history_items',
        category: 'history',
        items: onRepeatSongs.slice(0, 8).map(h => ({
          videoId: h.videoId,
          title: cleanSongTitle(h.title) || h.title,
          artist: h.artist || 'Artist',
          thumbnail: h.thumbnail || (h.videoId ? `https://i.ytimg.com/vi/${h.videoId}/hqdefault.jpg` : ''),
          duration: h.duration || 0,
          durationText: h.durationText || '',
          type: 'song'
        }))
      });
    }

    // ── GENIUS: "Jump Back In" — instant resurfacing of the last unique plays
    if (taste.recentSongs.length >= 3) {
      shelves.push({
        id: 'shelf-jump-back-in',
        eyebrow: 'JUMP BACK IN',
        title: 'Pick up where you left off',
        type: 'history_items',
        category: 'history',
        items: taste.recentSongs.map(s => ({
          ...s,
          thumbnail: s.thumbnail || (s.videoId ? `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg` : ''),
          duration: s.duration || 0,
          durationText: s.durationText || '',
          type: 'song'
        }))
      });
    }
  }

  // 1b. "Because you liked" shelves — algorithmic radio seeded from user's liked songs
  const usedRadioIds = new Set(
    shelves.filter(s => s.type === 'radio_songs').map(s => s.videoId)
  );
  taste.topLikedSongs.slice(0, 2).forEach((likedSong, idx) => {
    if (!likedSong?.videoId || usedRadioIds.has(likedSong.videoId)) return;
    usedRadioIds.add(likedSong.videoId);
    shelves.push({
      id: `shelf-liked-radio-${idx}`,
      eyebrow: 'BASED ON YOUR LIKES',
      title: `Because you liked ${likedSong.title}`,
      videoId: likedSong.videoId,
      artistHint: likedSong.artist,
      type: 'radio_songs',
      category: 'likes'
    });
  });

  // 2. QUICK PICKS (Genius rotation: blends main artist, liked artists, recent
  // history artists and secondary taste artists — rotates every window)
  const quickPickPool = [];
  const seenQp = new Set();
  const addQp = (q) => {
    if (q && !seenQp.has(q.toLowerCase())) {
      seenQp.add(q.toLowerCase());
      quickPickPool.push(q);
    }
  };
  addQp(`${mainArtist} top hits`);
  addQp(taste.topLikedSongs[0]?.artist ? `${taste.topLikedSongs[0].artist} top songs` : null);
  addQp(history?.[0]?.artist ? `${history[0].artist} hit songs` : null);
  addQp(taste.topArtists[1] ? `${taste.topArtists[1]} top hits` : null);
  addQp(`${mainArtist} best songs`);
  const pickedQuickPick = pickGenreVariety(quickPickPool, 1, 'genius_quickpicks')[0] || `${mainArtist} top hits`;
  shelves.push({
    id: 'shelf-quickpicks',
    eyebrow: 'START RADIO BASED ON A SONG',
    title: 'Quick picks for you',
    searchQuery: pickedQuickPick,
    type: 'quickpicks',
    category: 'picks'
  });

  // 2b. GENIUS TIME MACHINE — shelves matched to the user's moment of the day
  // (IST). Weekend evenings get an extra party boost.
  const istHour = getIstHour();
  const istDay = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(new Date());
    } catch {
      return new Date().toLocaleDateString('en-US', { weekday: 'short' });
    }
  })();
  const isWeekend = istDay === 'Sat' || istDay === 'Sun';
  const timeBucket = GENIUS_TIME_BUCKETS.find(b => b.hours.includes(istHour)) || GENIUS_TIME_BUCKETS[2];
  pickGenreVariety(timeBucket.picks, 2, `genius_time_${timeBucket.id}`).forEach((p, pi) => {
    shelves.push({
      id: `shelf-genius-time-${pi}`,
      eyebrow: timeBucket.eyebrow,
      title: p.title,
      searchQuery: p.query,
      type: 'songs',
      category: 'mood'
    });
  });
  if (isWeekend && (timeBucket.id === 'evening' || timeBucket.id === 'night')) {
    shelves.push({
      id: 'shelf-genius-weekend',
      eyebrow: 'GENIUS WEEKEND MODE',
      title: 'Weekend Party Starters',
      searchQuery: 'weekend party songs bollywood',
      type: 'songs',
      category: 'mood'
    });
  }

  // 3. LATEST RELEASES & FRESH DROPS (Brand new songs powered by official editorial releases & drops)
  shelves.push({
    id: 'shelf-latest-releases-main',
    eyebrow: 'FRESH DROPS & NEW MUSIC',
    title: 'Latest Releases & Fresh Drops',
    genre: mainGenre,
    type: 'latest_releases',
    category: 'latest'
  });

  // 4. LIVE TRENDING CHART (Official YouTube Music Editorial Streaming Hitlists)
  shelves.push({
    id: 'shelf-official-trending-india',
    eyebrow: 'OFFICIAL LIVE CHART',
    title: 'India Trending (Top Weekly)',
    chartKey: 'trending_india',
    type: 'chart_songs',
    category: 'hits'
  });

  // 5. OFFICIAL NEW ALBUMS & SINGLES (Official discography drops)
  shelves.push({
    id: 'shelf-new-albums',
    eyebrow: 'OFFICIAL NEW RELEASES',
    title: 'New Albums & Fresh Singles',
    type: 'official_albums',
    category: 'latest'
  });

  // 6. LATEST HITS & CHARTBUSTERS (Genre trending chart)
  shelves.push({
    id: 'shelf-latest-hits-main',
    eyebrow: 'HOT ON THE CHARTS',
    title: `Latest Hits: ${capGenre} & Trending`,
    genre: mainGenre,
    chartKey: OFFICIAL_CHARTS[mainGenre] ? mainGenre : 'bollywood',
    type: 'chart_songs',
    category: 'hits'
  });

  // 7. Signature Artist Best Songs
  shelves.push({
    id: 'shelf-art-best-0',
    eyebrow: 'SIGNATURE ARTIST',
    title: `Best of ${mainArtist}`,
    searchQuery: `${mainArtist} hit songs`,
    artistFilter: mainArtist,
    type: 'artist_songs',
    category: 'artist'
  });

  // 8. Signature Artist Playlist & Essentials
  shelves.push({
    id: 'shelf-art-special-0',
    eyebrow: `${mainArtist.toUpperCase()} ESSENTIALS`,
    title: `${mainArtist} Radio & Mixes`,
    searchQuery: `${mainArtist} official playlist`,
    type: 'playlists',
    category: 'artist'
  });

  // 9. Secondary Followed Artists (Each gets 1 Best Of shelf + 1 Curated Spotlight shelf)
  if (primaryArtists.length > 1) {
    primaryArtists.slice(1, 4).forEach((artist, idx) => {
      shelves.push({
        id: `shelf-art-best-${idx + 1}`,
        eyebrow: 'FOR FANS OF ' + artist.toUpperCase(),
        title: `Best of ${artist}`,
        searchQuery: `${artist} hit songs`,
        artistFilter: artist,
        type: 'artist_songs',
        category: 'artist'
      });

      shelves.push({
        id: `shelf-art-special-${idx + 1}`,
        eyebrow: `${artist.toUpperCase()} SPOTLIGHT`,
        title: `${artist} Special`,
        searchQuery: `${artist} official playlist`,
        type: 'playlists',
        category: 'artist'
      });
    });
  } else {
    shelves.push({
      id: 'shelf-art-romantic',
      eyebrow: 'HEARTFELT & EMOTIONAL',
      title: `${mainArtist} Romantic Melodies`,
      searchQuery: `${mainArtist} romantic songs`,
      type: 'songs',
      category: 'mood'
    });

    shelves.push({
      id: 'shelf-art-party',
      eyebrow: 'HIGH ENERGY & DANCE',
      title: `Party with ${mainArtist}`,
      searchQuery: `${mainArtist} party dance songs`,
      type: 'songs',
      category: 'mood'
    });

    shelves.push({
      id: 'shelf-art-acoustic',
      eyebrow: 'STRIPPED DOWN & RAW',
      title: `${mainArtist} Acoustic & Unplugged`,
      searchQuery: `${mainArtist} acoustic unplugged`,
      type: 'songs',
      category: 'mood'
    });
  }

  // 10. Regional & Preferred Genre Shelves (Clean Smart Queries)
  const GENRE_LABELS = {
    tamil: { 
      name: 'Tamil Kollywood Hits', 
      latest: 'Latest Tamil Releases & Drops',
      latestQuery: 'new tamil songs',
      hits: 'Tamil Trending Hits',
      hitsQuery: 'trending tamil songs',
      chartKey: 'tamil',
      chill: 'Tamil Melodies & Chill', 
      chillQuery: 'tamil chill melodies'
    },
    telugu: { 
      name: 'Telugu Tollywood Hits', 
      latest: 'Latest Telugu Releases & Drops',
      latestQuery: 'new telugu songs',
      hits: 'Telugu Mass Hits',
      hitsQuery: 'trending telugu songs',
      chartKey: 'telugu',
      chill: 'Telugu Soulful Melodies', 
      chillQuery: 'telugu soulful melodies'
    },
    haryanvi: { 
      name: 'Haryanvi Ragni & Beats', 
      latest: 'Latest Haryanvi Releases',
      latestQuery: 'new haryanvi songs',
      hits: 'Haryanvi Trending Hits',
      hitsQuery: 'trending haryanvi songs',
      chartKey: 'haryanvi',
      chill: 'Haryanvi Desi Chill', 
      chillQuery: 'haryanvi acoustic songs'
    },
    bengali: { 
      name: 'Bengali Melodies & Folk', 
      latest: 'Latest Bengali Releases',
      latestQuery: 'new bengali songs',
      hits: 'Bangla Pop & Film Hits',
      hitsQuery: 'trending bengali songs',
      chill: 'Bengali Acoustic & Folk', 
      chillQuery: 'bengali acoustic songs'
    },
    malayalam: { 
      name: 'Malayalam Mollywood', 
      latest: 'Latest Malayalam Releases',
      latestQuery: 'new malayalam songs',
      hits: 'Malayalam Chartbusters',
      hitsQuery: 'trending malayalam songs',
      chill: 'Malayalam Acoustic Chill', 
      chillQuery: 'malayalam melodies'
    },
    kannada: { 
      name: 'Kannada Sandalwood', 
      latest: 'Latest Kannada Releases',
      latestQuery: 'new kannada songs',
      hits: 'Kannada Mass Hits',
      hitsQuery: 'trending kannada songs',
      chill: 'Kannada Melodies', 
      chillQuery: 'kannada melodies songs'
    },
    bhojpuri: { 
      name: 'Bhojpuri Tadka', 
      latest: 'Latest Bhojpuri Releases',
      latestQuery: 'new bhojpuri songs',
      hits: 'Bhojpuri Superhits',
      hitsQuery: 'trending bhojpuri songs',
      chartKey: 'bhojpuri',
      chill: 'Bhojpuri Folk Melodies', 
      chillQuery: 'bhojpuri folk songs'
    },
    punjabi: { 
      name: 'Punjabi Beats', 
      latest: 'Latest Punjabi Releases & Fresh Drops',
      latestQuery: 'new punjabi songs',
      hits: 'Punjabi Chartbusters',
      hitsQuery: 'trending punjabi songs',
      chartKey: 'punjabi',
      chill: 'Punjabi Late Night Chill', 
      chillQuery: 'punjabi acoustic chill songs'
    },
    bollywood: { 
      name: 'Bollywood Hits', 
      latest: 'Latest Bollywood Releases',
      latestQuery: 'new bollywood songs',
      hits: 'Bollywood Trending Hits',
      hitsQuery: 'trending bollywood songs',
      chartKey: 'bollywood',
      chill: 'Bollywood Late Night Chill', 
      chillQuery: 'hindi chill acoustic songs'
    },
    lofi: { 
      name: 'Lo-Fi Chill', 
      latest: 'Latest Lo-Fi Releases & Drops',
      latestQuery: 'lofi chill songs',
      hits: 'Chillhop & Lo-Fi Hits',
      hitsQuery: 'lofi beats study chill',
      chill: 'Lo-Fi Midnight Echoes', 
      chillQuery: 'hindi lofi chill beats'
    },
    indie: { 
      name: 'Indian Indie & Pop', 
      latest: 'Latest Indie Releases & Drops',
      latestQuery: 'new indian indie songs',
      hits: 'Indian Indie Trending Hits',
      hitsQuery: 'trending indian indie songs',
      chill: 'Acoustic Indie Chill', 
      chillQuery: 'indie pop acoustic'
    },
    english: { 
      name: 'Global Pop & English Hits', 
      latest: 'Latest Global Releases',
      latestQuery: 'new global pop songs',
      hits: 'Billboard & Global Hits',
      hitsQuery: 'trending global pop songs',
      chartKey: 'english',
      chill: 'Acoustic Pop Chill', 
      chillQuery: 'acoustic pop songs'
    },
    sad: {
      name: 'Sad & Breakup Songs',
      latest: 'Latest Sad Songs & Drops',
      latestQuery: 'new sad songs hindi',
      hits: 'Sad & Breakup Chartbusters',
      hitsQuery: 'trending sad songs bollywood',
      chill: 'Late Night Sad Melodies',
      chillQuery: 'sad songs slow emotional'
    },
    viral: {
      name: 'Viral & Trending Hits',
      latest: 'Fresh Viral Drops',
      latestQuery: 'new viral songs india',
      hits: 'Viral Hits & Reel Sensations',
      hitsQuery: 'viral trending songs india',
      chill: 'Viral Chill Picks',
      chillQuery: 'viral acoustic songs'
    },
    wedding: {
      name: 'Wedding & Shaadi Songs',
      latest: 'Latest Wedding Songs',
      latestQuery: 'new wedding songs hindi',
      hits: 'Shaadi Season Chartbusters',
      hitsQuery: 'bollywood wedding songs hits',
      chill: 'Wedding Romantic Melodies',
      chillQuery: 'wedding romantic melodies'
    },
    retro: {
      name: 'Retro Classics (60s–80s)',
      latest: 'Timeless Retro Picks',
      latestQuery: 'evergreen old hindi songs',
      hits: 'Golden Era Superhits',
      hitsQuery: 'old hindi classic hits kishore rafi',
      chill: 'Retro Soft Melodies',
      chillQuery: 'old hindi soft melodies'
    },
    marathi: {
      name: 'Marathi Hits',
      latest: 'Latest Marathi Releases',
      latestQuery: 'new marathi songs',
      hits: 'Marathi Chartbusters',
      hitsQuery: 'trending marathi songs',
      chill: 'Marathi Soulful Melodies',
      chillQuery: 'marathi melodies songs'
    },
    gujarati: {
      name: 'Gujarati Garba & Hits',
      latest: 'Latest Gujarati Releases',
      latestQuery: 'new gujarati songs',
      hits: 'Gujarati Garba & Chartbusters',
      hitsQuery: 'trending gujarati songs garba',
      chill: 'Gujarati Folk Melodies',
      chillQuery: 'gujarati folk songs'
    },
    rajasthani: {
      name: 'Rajasthani Folk & Hits',
      latest: 'Latest Rajasthani Releases',
      latestQuery: 'new rajasthani songs',
      hits: 'Rajasthani Trending Hits',
      hitsQuery: 'trending rajasthani songs',
      chill: 'Rajasthani Folk Melodies',
      chillQuery: 'rajasthani folk songs'
    },
    kpop: {
      name: 'K-Pop',
      latest: 'Latest K-Pop Releases',
      latestQuery: 'new kpop songs',
      hits: 'K-Pop Chartbusters',
      hitsQuery: 'trending kpop songs',
      chill: 'K-Pop Ballads & Chill',
      chillQuery: 'kpop ballads acoustic'
    },
    pakistani: {
      name: 'Pakistani Pop & Coke Studio',
      latest: 'Latest Pakistani Releases',
      latestQuery: 'new pakistani pop songs',
      hits: 'Pakistani Chartbusters & Coke Studio',
      hitsQuery: 'trending pakistani songs coke studio',
      chill: 'Pakistani Soulful Melodies',
      chillQuery: 'coke studio soulful songs'
    },
    metal: {
      name: 'Metal & Hard Rock',
      latest: 'Latest Metal & Rock Drops',
      latestQuery: 'new metal rock songs',
      hits: 'Metal & Hard Rock Bangers',
      hitsQuery: 'metal hard rock hits',
      chill: 'Rock Ballads',
      chillQuery: 'rock ballads acoustic'
    },
    jazz: {
      name: 'Jazz & Blues',
      latest: 'Latest Jazz Releases',
      latestQuery: 'new jazz songs',
      hits: 'Jazz & Blues Classics',
      hitsQuery: 'jazz blues classics songs',
      chill: 'Smooth Jazz Chill',
      chillQuery: 'smooth jazz chill saxophone'
    },
    rnb: {
      name: 'R&B & Soul',
      latest: 'Latest R&B Releases',
      latestQuery: 'new rnb soul songs',
      hits: 'R&B & Soul Chartbusters',
      hitsQuery: 'trending rnb soul songs',
      chill: 'Smooth R&B Late Night',
      chillQuery: 'smooth rnb soul chill'
    },
    classical: {
      name: 'Indian Classical',
      latest: 'Classical Renditions & Drops',
      latestQuery: 'hindustani classical renditions',
      hits: 'Classical Greats & Legends',
      hitsQuery: 'indian classical instrumental legendary',
      chill: 'Carnatic & Hindustani Chill',
      chillQuery: 'carnatic classical melodies'
    },
    acoustic: {
      name: 'Acoustic & Unplugged',
      latest: 'Fresh Acoustic Covers',
      latestQuery: 'new acoustic covers hindi',
      hits: 'Unplugged & Acoustic Hits',
      hitsQuery: 'unplugged acoustic hits',
      chill: 'Coffee House Acoustic',
      chillQuery: 'acoustic chill songs coffee house'
    },
    happy: {
      name: 'Feel-Good & Happy Vibes',
      latest: 'Fresh Feel-Good Drops',
      latestQuery: 'new happy songs hindi',
      hits: 'Happy Vibes Chartbusters',
      hitsQuery: 'happy feel good songs bollywood',
      chill: 'Sunny Uplifting Melodies',
      chillQuery: 'uplifting feel good melodies'
    },
    piano: {
      name: 'Instrumental & Piano',
      latest: 'Latest Piano Instrumentals',
      latestQuery: 'new piano instrumentals',
      hits: 'Piano & Instrumental Greats',
      hitsQuery: 'piano instrumental covers popular',
      chill: 'Calm Piano for Focus',
      chillQuery: 'calm piano melodies relaxing'
    }
  };

  primaryGenres.slice(0, 4).forEach((genre, idx) => {
    const g = genre.toLowerCase();
    const meta = GENRE_LABELS[g] || {
      name: genre.charAt(0).toUpperCase() + genre.slice(1) + ' Hits',
      latest: `Latest ${genre} Releases`,
      latestQuery: `new ${genre} songs`,
      hits: `Trending ${genre} Hits`,
      hitsQuery: `trending ${genre} songs`,
      chill: `${genre} Chill Melodies`,
      chillQuery: `${genre} chill songs`
    };

    const isMainGenre = g === mainGenre.toLowerCase();
    const varietyPool = GENRE_VARIETY_POOLS[g];

    if (varietyPool && varietyPool.length > 0) {
      // Variety rotation: random themed terms (4 for main genre, 3 for others).
      // Never all at once — the pool rotates every refresh window.
      const varietyCount = isMainGenre
        ? Math.min(4, varietyPool.length)
        : Math.min(3, varietyPool.length);
      pickGenreVariety(varietyPool, varietyCount, `genre_variety_${g}`).forEach((v, vi) => {
        shelves.push({
          id: `shelf-genre-variety-${g}-${vi}`,
          eyebrow: v.eyebrow,
          title: v.title,
          searchQuery: v.query,
          type: 'songs',
          category: 'genre'
        });
      });

      // Core freshness shelf for the main genre + curated playlists for all
      if (isMainGenre) {
        shelves.push({
          id: `shelf-genre-latest-${idx}`,
          eyebrow: 'NEW DROPS',
          title: meta.latest,
          searchQuery: meta.latestQuery,
          type: 'songs',
          category: 'latest'
        });
      }

      shelves.push({
        id: `shelf-genre-suggested-${idx}`,
        eyebrow: 'RECOMMENDED PLAYLISTS',
        title: `Curated: ${meta.name}`,
        searchQuery: `${genre} hit playlist`,
        type: 'playlists',
        category: 'genre'
      });
      return;
    }

    // Fallback (genres without a variety pool): deterministic core shelves

    // Only add latest & chart shelves for secondary genres (mainGenre already has top shelves)
    if (!isMainGenre) {
      // Genre Latest Releases (Uses official editorial new music playlist if available)
      if (EDITORIAL_NEW_RELEASES[g]) {
        shelves.push({
          id: `shelf-genre-latest-${idx}`,
          eyebrow: 'NEW DROPS',
          title: meta.latest,
          genre: g,
          type: 'latest_releases',
          category: 'latest'
        });
      } else {
        shelves.push({
          id: `shelf-genre-latest-${idx}`,
          eyebrow: 'NEW DROPS',
          title: meta.latest,
          searchQuery: meta.latestQuery,
          type: 'songs',
          category: 'latest'
        });
      }

      // Genre Trending Hits (Powered by official editorial hitlists!)
      const effectiveChartKey = meta.chartKey || (OFFICIAL_CHARTS[g] ? g : null);
      if (effectiveChartKey && OFFICIAL_CHARTS[effectiveChartKey]) {
        shelves.push({
          id: `shelf-genre-chart-${idx}`,
          eyebrow: 'OFFICIAL CHART',
          title: meta.hits,
          chartKey: effectiveChartKey,
          type: 'chart_songs',
          category: 'hits'
        });
      } else {
        shelves.push({
          id: `shelf-genre-latest-hits-${idx}`,
          eyebrow: 'TRENDING HITS',
          title: meta.hits,
          searchQuery: meta.hitsQuery,
          type: 'songs',
          category: 'hits'
        });
      }
    }

    // Curated Playlists
    shelves.push({
      id: `shelf-genre-suggested-${idx}`,
      eyebrow: 'RECOMMENDED PLAYLISTS',
      title: `Curated: ${meta.name}`,
      searchQuery: `${genre} hit playlist`,
      type: 'playlists',
      category: 'genre'
    });

    // Chill vibes
    shelves.push({
      id: `shelf-genre-mood-${idx}`,
      eyebrow: 'MOOD VIBES',
      title: meta.chill,
      searchQuery: meta.chillQuery,
      type: 'songs',
      category: 'genre'
    });
  });

  // 11. Desi Hip Hop & Rap Anthems
  shelves.push({
    id: 'shelf-hiphop',
    eyebrow: 'URBAN BEATS',
    title: 'Desi Hip Hop & Rap Anthems',
    searchQuery: 'desi hip hop songs',
    type: 'songs',
    category: 'genre'
  });

  // 12. Indian Indie Discoveries
  shelves.push({
    id: 'shelf-indie',
    eyebrow: 'FRESH DISCOVERIES',
    title: 'Indie & Alternative Wave',
    searchQuery: 'indian indie acoustic songs',
    type: 'songs',
    category: 'discovery'
  });

  // 13. Evergreen Retro Nostalgia
  shelves.push({
    id: 'shelf-retro',
    eyebrow: 'TIMELESS CLASSICS',
    title: 'Evergreen 90s & 2000s Nostalgia',
    searchQuery: '90s 2000s bollywood evergreen hits',
    type: 'songs',
    category: 'nostalgia'
  });

  // 14. Acoustic Coffeehouse Sessions
  shelves.push({
    id: 'shelf-coffeehouse',
    eyebrow: 'ACOUSTIC SESSIONS',
    title: 'Coffeehouse Acoustic Melodies',
    searchQuery: 'hindi acoustic unplugged songs',
    type: 'songs',
    category: 'mood'
  });

  // 15. Global Trending Hits
  shelves.push({
    id: 'shelf-global',
    eyebrow: 'WORLDWIDE RADAR',
    title: 'Trending Global Pop Chartbusters',
    chartKey: 'english',
    type: 'chart_songs',
    category: 'trending'
  });

  // 16. Bollywood Romance & Heartbeats
  shelves.push({
    id: 'shelf-bollywood-romance',
    eyebrow: 'LOVE ANTHEMS',
    title: 'Bollywood Romantic Melodies',
    searchQuery: 'bollywood romantic love songs',
    type: 'songs',
    category: 'genre'
  });

  // Deduplicate shelf titles and return up to 26 unique shelves
  const seenTitles = new Set();
  const uniqueShelves = [];
  for (const s of shelves) {
    if (!seenTitles.has(s.title)) {
      seenTitles.add(s.title);
      uniqueShelves.push(s);
    }
  }

  return uniqueShelves.slice(0, 26);
}

// ─── Feed Builder with YTMusic Client ───────────────────────────────────────
export async function buildAlgorithmicFeed(yt, preferences, history, cacheGet, cacheSet, likes = []) {
  // 1. Retrieve or fetch YouTube Music official home sections
  let homeSections = [];
  const homeSecCacheKey = 'yt_home_sections_v5';
  const cachedHomeSec = cacheGet(homeSecCacheKey);
  if (cachedHomeSec) {
    homeSections = cachedHomeSec;
  } else {
    try {
      homeSections = await yt.getHomeSections();
      if (homeSections && homeSections.length > 0) {
        cacheSet(homeSecCacheKey, homeSections, 15 * 60 * 1000); // 15 min cache
      }
    } catch (err) {
      console.warn('yt.getHomeSections() failed:', err.message);
    }
  }

  const officialNewReleasesSec = homeSections.find(s => s.title?.toLowerCase().includes('new releases'));
  const officialQuickPicksSec = homeSections.find(s => s.title?.toLowerCase().includes('quick picks'));

  // 2. Generate customized shelf plan (learns from history + likes)
  const shelfPlan = generateShelfPlan(preferences, history, likes);

  // 3. Populate shelves concurrently
  const populatedShelves = await Promise.all(
    shelfPlan.map(async (plan) => {
      // ── TYPE: history_items (precomputed from user history — instant, no API) ──
      if (plan.type === 'history_items') {
        return { ...plan, items: (plan.items || []).slice(0, 12) };
      }

      // ── TYPE: chart_songs (Direct YouTube Music Official Live Chart API) ──
      if (plan.type === 'chart_songs' && plan.chartKey) {
        const browseId = OFFICIAL_CHARTS[plan.chartKey];
        if (browseId) {
          const chartSongs = await fetchOfficialChart(yt, browseId, cacheGet, cacheSet);
          if (chartSongs.length > 0) {
            return { ...plan, items: chartSongs.slice(0, 16) };
          }
        }
        // Fallback to songs query if chart API fails
        const fallbackRes = await yt.searchSongs(plan.searchQuery || 'trending songs').catch(() => []);
        const cleanFallback = (fallbackRes || [])
          .map(formatSong)
          .filter(s => s && !isSpamOrJunkSong(s));
        return { ...plan, items: cleanFallback.slice(0, 14) };
      }

      // ── TYPE: artist_songs (Strict matching for artist-dedicated shelves) ──
      if (plan.type === 'artist_songs' && plan.artistFilter) {
        const targetArtist = plan.artistFilter;
        const cacheKey = `shelf_art_songs_v7_${targetArtist.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${plan.id || 'default'}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        try {
          let matchedSongs = [];

          // 1. Fetch official top songs directly from artist's YouTube Music profile
          try {
            const artistSearchResults = await yt.searchArtists(targetArtist).catch(() => []);
            const bestArtistMatch = (artistSearchResults || []).find(a => a && matchesArtist(a.name, targetArtist));
            if (bestArtistMatch && bestArtistMatch.artistId) {
              const fullArtist = await yt.getArtist(bestArtistMatch.artistId).catch(() => null);
              if (fullArtist && Array.isArray(fullArtist.topSongs) && fullArtist.topSongs.length > 0) {
                const directTop = fullArtist.topSongs
                  .map(formatSong)
                  .filter(s => s && !isSpamOrJunkSong(s));
                matchedSongs.push(...directTop);
              }
            }
          } catch (artErr) {
            console.warn(`Direct artist fetch failed for ${targetArtist}:`, artErr.message);
          }

          // 2. Query searchSongs with strict matchesArtist filter
          if (matchedSongs.length < 12) {
            const searchRes = await yt.searchSongs(`${targetArtist} songs`).catch(() => []);
            const searchHits = (searchRes || [])
              .map(formatSong)
              .filter(s => s && matchesArtist(s.artist, targetArtist, s.title) && !isSpamOrJunkSong(s));
            matchedSongs.push(...searchHits);
          }

          // 3. Fallback: query "{targetArtist} hits" with strict matching
          if (matchedSongs.length < 6) {
            const fallbackRes = await yt.searchSongs(`${targetArtist} hits`).catch(() => []);
            const fallbackHits = (fallbackRes || [])
              .map(formatSong)
              .filter(s => s && matchesArtist(s.artist, targetArtist, s.title) && !isSpamOrJunkSong(s));
            matchedSongs.push(...fallbackHits);
          }

          // Deduplicate by videoId
          const seen = new Set();
          const uniqueArtistSongs = [];
          for (const s of matchedSongs) {
            if (!seen.has(s.videoId)) {
              seen.add(s.videoId);
              uniqueArtistSongs.push(s);
              if (uniqueArtistSongs.length >= 16) break;
            }
          }

          if (uniqueArtistSongs.length > 0) {
            cacheSet(cacheKey, uniqueArtistSongs, 25 * 60 * 1000);
            return { ...plan, items: uniqueArtistSongs };
          }
        } catch (err) {
          console.warn(`Artist shelf fetch failed for ${targetArtist}:`, err.message);
        }
      }

      // ── TYPE: radio_songs (Direct YouTube Music Radio Queue via yt.getUpNexts) ──
      if (plan.type === 'radio_songs' && plan.videoId) {
        const cacheKey = `shelf_radio_v5_${plan.videoId}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        try {
          const upNexts = await yt.getUpNexts(plan.videoId).catch(() => []);
          let radioSongs = [];
          if (Array.isArray(upNexts) && upNexts.length > 0) {
            radioSongs = upNexts
              .filter(item => item && item.videoId && item.videoId !== plan.videoId)
              .map(item => {
                const rawThumb = item.thumbnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '');
                const durSec = parseDuration(item.duration);
                return {
                  videoId: item.videoId,
                  title: item.title || 'Unknown Title',
                  artist: item.artists || plan.artistHint || 'Artist',
                  duration: durSec,
                  durationText: item.duration || '3:30',
                  thumbnail: toHDThumbnail(rawThumb, item.videoId),
                  type: 'song'
                };
              })
              .filter(s => !isSpamOrJunkSong(s));
          }

          // Fallback if getUpNexts yielded fewer than 6 songs
          if (radioSongs.length < 6 && plan.artistHint) {
            const fallbackQuery = `${plan.artistHint} hit songs`;
            const fallbackRes = await yt.searchSongs(fallbackQuery).catch(() => []);
            const cleanFallback = (fallbackRes || [])
              .map(formatSong)
              .filter(s => s && s.videoId !== plan.videoId && !isSpamOrJunkSong(s));
            radioSongs = [...radioSongs, ...cleanFallback];
          }

          // Deduplicate
          const seen = new Set();
          const uniqueRadio = [];
          for (const s of radioSongs) {
            if (!seen.has(s.videoId)) {
              seen.add(s.videoId);
              uniqueRadio.push(s);
              if (uniqueRadio.length >= 16) break;
            }
          }

          if (uniqueRadio.length > 0) {
            cacheSet(cacheKey, uniqueRadio, 20 * 60 * 1000);
          }
          return { ...plan, items: uniqueRadio };
        } catch (err) {
          console.warn(`Radio shelf failed for ${plan.title}:`, err.message);
          return { ...plan, items: [] };
        }
      }

      // ── TYPE: latest_releases (Official YouTube Music Editorial New Drops) ──
      if (plan.type === 'latest_releases') {
        const genreKey = (plan.genre || 'bollywood').toLowerCase();
        const cacheKey = `shelf_latest_releases_v6_${genreKey}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        try {
          const songs = [];
          const seenVideos = new Set();
          const seenTitles = new Set();

          const addCandidate = (item) => {
            if (!item || !item.videoId || !item.title) return;
            const cleaned = cleanSongTitle(item.title) || item.title;
            const normTitle = cleaned.toLowerCase().trim();
            if (seenVideos.has(item.videoId) || seenTitles.has(normTitle)) return;
            if (isSpamOrJunkSong(item)) return;
            seenVideos.add(item.videoId);
            seenTitles.add(normTitle);
            songs.push({
              ...item,
              title: cleaned
            });
          };

          // 1. Primary: YouTube Music Editorial New Music playlist for this genre
          const editorialPlaylistId = EDITORIAL_NEW_RELEASES[genreKey] || EDITORIAL_NEW_RELEASES.bollywood;
          if (editorialPlaylistId) {
            const playlistSongs = await fetchOfficialChart(yt, editorialPlaylistId, cacheGet, cacheSet);
            (playlistSongs || []).slice(0, 14).forEach(addCandidate);
          }

          // 2. Secondary: YouTube Music Explore Section 5 "New music videos"
          try {
            const exploreData = await yt.constructRequest('browse', { browseId: 'FEmusic_explore' }).catch(() => null);
            const exploreSecs = exploreData?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
            const vidsShelf = exploreSecs.find(s => {
              const t = s.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || '';
              return t.toLowerCase().includes('new music video');
            })?.musicCarouselShelfRenderer?.contents || [];

            for (const it of vidsShelf) {
              const twoRow = it.musicTwoRowItemRenderer;
              if (!twoRow) continue;
              const title = twoRow.title?.runs?.[0]?.text;
              const subRuns = twoRow.subtitle?.runs || [];
              const artist = subRuns[0]?.text || 'Artist';
              const videoId = twoRow.navigationEndpoint?.watchEndpoint?.videoId;
              const thumbs = twoRow.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
              const thumb = thumbs[thumbs.length - 1]?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

              if (title && videoId) {
                addCandidate({
                  videoId,
                  title,
                  artist,
                  duration: 210,
                  durationText: '3:30',
                  thumbnail: toHDThumbnail(thumb, videoId),
                  type: 'song'
                });
              }
              if (songs.length >= 16) break;
            }
          } catch (expErr) {
            console.warn('Explore new music videos fetch error:', expErr.message);
          }

          // 3. Tertiary: Top tracks from official new release albums/singles if more needed
          if (songs.length < 10) {
            try {
              const relData = await yt.constructRequest('browse', { browseId: 'FEmusic_new_releases_albums' }).catch(() => null);
              const gridItems = relData?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.gridRenderer?.items || [];
              const topAlbums = gridItems.slice(0, 5);
              const albumResults = await Promise.all(
                topAlbums.map(it => {
                  const albId = it.musicTwoRowItemRenderer?.navigationEndpoint?.browseEndpoint?.browseId;
                  return albId ? yt.getAlbum(albId).catch(() => null) : null;
                })
              );
              albumResults.forEach(alb => {
                if (alb?.songs) {
                  alb.songs.slice(0, 2).forEach(s => {
                    const formatted = formatSong({
                      videoId: s.videoId,
                      name: s.name,
                      artist: alb.artist?.name || s.artist?.name || alb.name,
                      album: alb.name,
                      duration: s.duration,
                      thumbnails: s.thumbnails || alb.thumbnails
                    });
                    if (formatted) addCandidate(formatted);
                  });
                }
              });
            } catch (relErr) {
              console.warn('New release albums extraction error:', relErr.message);
            }
          }

          if (songs.length > 0) {
            const finalDrops = songs.slice(0, 16);
            cacheSet(cacheKey, finalDrops, 20 * 60 * 1000);
            return { ...plan, items: finalDrops };
          }
        } catch (err) {
          console.warn(`Latest releases shelf failed:`, err.message);
        }
        return { ...plan, items: [] };
      }

      // ── TYPE: official_albums (Direct official album releases from YouTube Music) ──
      if (plan.type === 'official_albums') {
        const albums = await fetchOfficialNewAlbums(yt, cacheGet, cacheSet);
        if (albums.length > 0) {
          return { ...plan, items: albums.slice(0, 16) };
        }

        if (officialNewReleasesSec?.contents?.length > 0) {
          const albumItems = officialNewReleasesSec.contents
            .map(formatAlbum)
            .filter(Boolean);
          return { ...plan, items: albumItems.slice(0, 12) };
        }
        return { ...plan, items: [] };
      }

      // ── TYPE: quickpicks ──
      if (plan.type === 'quickpicks') {
        const cacheKey = `shelf_quickpicks_v5_${(plan.searchQuery || '').replace(/[^a-z0-9]/g, '_')}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        // Use official quick picks directly from YouTube Music if available
        if (officialQuickPicksSec?.contents?.length > 0) {
          const qpSongs = officialQuickPicksSec.contents
            .map(formatSong)
            .filter(s => s && !isSpamOrJunkSong(s));
          if (qpSongs.length >= 6) {
            cacheSet(cacheKey, qpSongs.slice(0, 16), 15 * 60 * 1000);
            return { ...plan, items: qpSongs.slice(0, 16) };
          }
        }

        const res = await yt.searchSongs(plan.searchQuery).catch(() => []);
        const cleanSongs = (res || [])
          .map(formatSong)
          .filter(s => s && !isSpamOrJunkSong(s))
          .slice(0, 16);
        if (cleanSongs.length > 0) {
          cacheSet(cacheKey, cleanSongs, 15 * 60 * 1000);
        }
        return { ...plan, items: cleanSongs };
      }

      // ── TYPE: playlists ──
      if (plan.type === 'playlists') {
        const cacheKey = `shelf_pl_v5_${plan.searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        const res = await yt.searchPlaylists(plan.searchQuery).catch(() => []);
        let items = (res || []).slice(0, 10).map(p => formatPlaylist(p));

        if (items.length === 0) {
          const songRes = await yt.searchSongs(plan.searchQuery).catch(() => []);
          items = (songRes || []).slice(0, 10).map(formatSong).filter(s => s && !isSpamOrJunkSong(s));
        }

        if (items.length > 0) {
          cacheSet(cacheKey, items, 20 * 60 * 1000);
        }
        return { ...plan, items };
      }

      // ── TYPE: songs (Standard clean songs shelf) ──
      const cacheKey = `shelf_songs_v5_${plan.searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const cached = cacheGet(cacheKey);
      if (cached && cached.length > 0) {
        return { ...plan, items: cached };
      }

      try {
        const res = await yt.searchSongs(plan.searchQuery).catch(() => []);
        const cleanSongs = (res || [])
          .map(formatSong)
          .filter(s => s && !isSpamOrJunkSong(s))
          .slice(0, 12);

        if (cleanSongs.length > 0) {
          cacheSet(cacheKey, cleanSongs, 15 * 60 * 1000);
        }
        return { ...plan, items: cleanSongs };
      } catch (err) {
        console.warn(`Shelf fetch failed for "${plan.title}":`, err.message);
        return { ...plan, items: [] };
      }
    })
  );

  // Filter out empty shelves and deduplicate identical shelf content
  const seenShelvesFingerprint = new Set();
  const validShelves = [];

  for (const shelf of populatedShelves) {
    if (!shelf.items || shelf.items.length === 0) continue;

    // Create a signature based on top 4 items to prevent identical duplicate shelves
    const topSign = shelf.items
      .slice(0, 4)
      .map(it => it.videoId || it.id || it.title)
      .filter(Boolean)
      .join('|');

    if (topSign && seenShelvesFingerprint.has(topSign)) {
      console.warn(`[AlgoFeed] Dropping duplicate shelf "${shelf.title}" (${shelf.id}) matching earlier shelf`);
      continue;
    }

    if (topSign) {
      seenShelvesFingerprint.add(topSign);
    }
    validShelves.push(shelf);
  }

  return {
    sections: validShelves,
    totalSections: validShelves.length,
    preferencesApplied: Boolean(preferences.artists?.length || preferences.genres?.length),
    historyApplied: Boolean(history && history.length > 0)
  };
}
