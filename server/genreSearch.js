// ─── Genre / Mood Smart Search ──────────────────────────────────────────────
// Plain text search for genre & mood queries ("romantic love songs") returns
// junk that merely shares words with the query ("Romantic Love Mashup By DJ
// Dalal"). Real music search treats these as EDITORIAL intents: pull songs
// from curated YouTube Music playlists matching the genre/mood instead of
// ranking title matches.
//
// Detection rules (English + Hinglish):
//  - type word (songs/hits/playlist...) + at least one mood/genre/language token
//  - two or more mood/genre tokens ("romantic love")
//  - a single mood/genre token alone ("romantic", "sufi")
// Song-title queries that merely CONTAIN a mood word ("love me like you do")
// stay on the normal search path.

import { isSpamOrJunkSong, cleanSongTitle } from './recommendationEngine.js';

const TYPE_WORDS = new Set([
  'song', 'songs', 'gana', 'gane', 'gaane', 'gaana', 'hit', 'hits',
  'playlist', 'mix', 'vibes', 'vibe', 'beats', 'track', 'tracks', 'music'
]);

const STRONG_TOKENS = new Set([
  // Romance
  'romantic', 'romance', 'love', 'pyar', 'pyaar', 'mohabbat', 'ishq', 'prem',
  // Sad / heartbreak
  'sad', 'dukh', 'dard', 'gam', 'gham', 'heartbreak', 'breakup', 'judai',
  'bewafa', 'tanhai', 'lonely', 'alone', 'emotional',
  // Energy / activity
  'happy', 'khush', 'khushi', 'chill', 'relaxing', 'relax', 'calm', 'soothing',
  'sleep', 'sleeping', 'study', 'studying', 'focus', 'workout', 'gym',
  'motivation', 'motivational', 'party', 'dance', 'nach', 'club', 'disco',
  'drive', 'driving',
  // Genres
  'ghazal', 'gazal', 'sufi', 'qawwali', 'bhajan', 'bhakti', 'devotional',
  'aarti', 'mantra', 'shabad', 'classical', 'instrumental', 'flute', 'piano',
  'guitar', 'saxophone', 'jazz', 'blues', 'rock', 'metal', 'rap', 'edm',
  'techno', 'trance', 'country', 'reggae', 'soul', 'funk', 'bhangra', 'desi',
  'bollywood', 'acoustic', 'unplugged', 'lofi', 'retro', 'evergreen', 'folk',
  // Languages
  'hindi', 'english', 'punjabi', 'tamil', 'telugu', 'malayalam', 'kannada',
  'bengali', 'marathi', 'bhojpuri', 'gujarati', 'urdu', 'arabic', 'korean',
  // Occasions / moods
  'monsoon', 'barish', 'barsaat', 'rain', 'mehndi', 'sangeet', 'shaadi',
  'wedding', 'holi', 'diwali', 'patriotic', 'morning', 'evening', 'night',
  // Era
  'old', 'purane', 'purani', 'vintage', '90s', '80s', '70s', '2000s'
]);

const STRONG_PHRASES = [
  'hip hop', 'hiphop', 'road trip', 'lo fi', 'semi classical', 'old is gold',
  'heart touching', 'feel good'
];

const norm = (s) => (s || '')
  .toString()
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export function detectGenreMoodQuery(query) {
  const q = norm(query);
  if (!q) return false;

  const words = q.split(' ').filter(Boolean);
  if (words.length === 0) return false;

  let strongCount = words.filter(w => STRONG_TOKENS.has(w)).length;
  if (STRONG_PHRASES.some(p => q.includes(p))) strongCount += 1;

  const hasTypeWord = words.some(w => TYPE_WORDS.has(w));

  // Single genre token alone ("romantic", "sufi")
  if (words.length === 1 && strongCount >= 1) return true;

  // Two or more mood/genre tokens ("romantic love")
  if (strongCount >= 2) return true;

  // Type word + any genre/mood/language token ("romantic songs", "punjabi hits")
  if (hasTypeWord && strongCount >= 1) return true;

  return false;
}

// ─── Genre-aware junk filter ────────────────────────────────────────────────
// Generic community playlists for mood queries are flooded with ringtones,
// BGM compilations, instrumental showers and amateur "Romantic Love Song"
// uploads. The user's query intent decides which variant keywords are allowed.
const GENRE_JUNK_TITLE_RE = [
  /\bringtone\b/i,
  /\bbackground\s+music\b/i,
  /\bbgm\b/i,
  /\bsoft\s+music\b/i,
  /\brelaxing\s+music\b/i,
  /\bsleep\s+music\b/i,
  /\bmeditation\b/i,
  /\bspa\s+music\b/i,
  /\bcopyright\b/i,
  /\bfree\s+download\b/i,
  /\bdownload\b/i,
  /\bmp3\b/i,
  /\bflac\b/i,
  /\bwav\b/i,
  /\bkbps\b/i,
  /\bwapsite\b/i,
  /\bsaavn\b/i,
  /\bgaana\s*com\b/i,
  /\bnocopyright\b/i,
  /\bnocopy_{0,2}right\b/i,
  /\bslideshow\b/i,
  /\bfull\s+(video|song|audio)\b/i,
  /\blyric(s|al)?\s+video\b/i,
  /\bdj\s+dalal\b/i,
  /\bfeat\.?\s*prod/i
];

const VARIANT_RE = {
  lofi: /\blo[-\s]?fi\b|\bslowed\b|\breverb\b|\bsped\s*up\b|\bnightcore\b/i,
  instrumental: /\binstrumental\b/i,
  cover: /\bcover\b|\bunplugged\b|\btribute\b|\breprise\b/i,
  mix: /\bmix\b|\bset\b|\bdj\b/i
};

// Language → unicode script ranges. Songs in scripts that don't match the
// query's language intent are junk for that search (Sinhala/Telugu/Korean
// uploads flood generic Indian mood playlists).
const SCRIPT_RANGES = {
  sinhala: /[\u0D80-\u0DFF]/,
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  malayalam: /[\u0D00-\u0D7F]/,
  kannada: /[\u0C80-\u0CFF]/,
  bengali: /[\u0980-\u09FF]/,
  gujarati: /[\u0A80-\u0AFF]/,
  punjabi: /[\u0A00-\u0A7F]/,
  arabic: /[\u0600-\u06FF]/,
  korean: /[\uAC00-\uD7AF]/,
  japanese: /[\u3040-\u30FF]/,
  chinese: /[\u4E00-\u9FFF]/,
  thai: /[\u0E00-\u0E7F]/,
  cyrillic: /[\u0400-\u04FF]/,
  hebrew: /[\u0590-\u05FF]/,
  greek: /[\u0370-\u03FF]/
};

// India-first default: queries without an explicit language token accept
// Latin script (English) + Devanagari (Hindi) only
const DEFAULT_ALLOWED_SCRIPTS = new Set(['sinhala', 'tamil', 'telugu', 'malayalam', 'kannada', 'bengali', 'gujarati', 'punjabi', 'arabic', 'korean', 'japanese', 'chinese', 'thai', 'cyrillic', 'hebrew', 'greek']);
const QUERY_LANGUAGE_TOKENS = {
  hindi: 'devanagari',
  marathi: 'devanagari',
  nepali: 'devanagari',
  tamil: 'tamil',
  telugu: 'telugu',
  malayalam: 'malayalam',
  kannada: 'kannada',
  bengali: 'bengali',
  gujarati: 'gujarati',
  punjabi: 'punjabi',
  arabic: 'arabic',
  urdu: 'arabic',
  korean: 'korean',
  japanese: 'japanese',
  chinese: 'chinese',
  thai: 'thai',
  russian: 'cyrillic',
  hebrew: 'hebrew',
  greek: 'greek',
  sinhala: 'sinhala'
};

function detectIntent(q) {
  return {
    lofi: /\blo[-\s]?fi\b|\bslowed\b|\breverb\b|\bnightcore\b/i.test(q),
    instrumental: /\binstrumental\b|\bflute\b|\bpiano\b|\bsaxophone\b/i.test(q),
    cover: /\bcover\b|\bunplugged\b|\btribute\b|\bacoustic\b/i.test(q),
    mix: /\bmix\b|\bdj\b/i.test(q)
  };
}

function titleScriptIsJunk(title, q) {
  for (const [lang, re] of Object.entries(SCRIPT_RANGES)) {
    if (!re.test(title)) continue;
    // Query explicitly asked for this language → script is fine
    if (q[lang]) return false;
    return true;
  }
  return false;
}

function isGenreJunk(s, intent, q) {
  if (isSpamOrJunkSong(s)) return true;
  const title = s.title || '';
  const artist = s.artist || '';
  if (titleScriptIsJunk(title, q)) return true;
  if (GENRE_JUNK_TITLE_RE.some(re => re.test(title))) return true;
  if (/\|.*\|/.test(title)) return true; // multi-pipe = lyrical/cast video uploads
  if (title.split(/\s+/).length > 10) return true; // descriptive-tail spam
  if (!intent.lofi && VARIANT_RE.lofi.test(title)) return true;
  if (!intent.instrumental && VARIANT_RE.instrumental.test(title)) return true;
  if (!intent.cover && VARIANT_RE.cover.test(title)) return true;
  if (!intent.mix && /\bmix\b/i.test(title)) return true;
  if (!intent.mix && /\bmix\b/i.test(artist)) return true; // "DJ Big Mix" channels
  return false;
}

// Editorial/official channel names produce far cleaner hitlists than hobby channels
const OFFICIAL_CHANNEL_RE = /\b(youtube music|yt music|t-?series|saregama|sony music|zee music|vevo|topic|warner|universal|tips|junglee|vishesh|times music|super cine|aminjikarai)\b/i;

// ─── Playlist curation ──────────────────────────────────────────────────────
export async function fetchGenreMoodSongs(yt, query, maxResults = 20, formatSong) {
  const cleaned = norm(query);
  if (!cleaned) return [];
  const intent = detectIntent(cleaned);

  // Language intent map: which scripts the query explicitly allows
  const words = cleaned.split(' ').filter(Boolean);
  const q = {};
  for (const w of words) {
    if (QUERY_LANGUAGE_TOKENS[w]) q[QUERY_LANGUAGE_TOKENS[w]] = true;
  }

  // India-first: without an explicit language token the Hindi variant replaces
  // the generic one and its playlists get merge priority, so results lean
  // Bollywood/Punjabi instead of global community party playlists.
  const hasLanguageIntent = Object.keys(q).length > 0;
  const playlistQueries = hasLanguageIntent
    ? [cleaned, `best ${cleaned}`]
    : [cleaned, `hindi ${cleaned}`];

  const searchLists = await Promise.all(
    playlistQueries.map(q => yt.searchPlaylists(q).catch(() => []))
  );

  const seenPlaylists = new Set();
  const candidates = [];
  const sourcePriority = new Map(); // playlistId → bonus
  searchLists.forEach((list, idx) => {
    const bonus = !hasLanguageIntent && idx === 1 ? 5 : 0;
    for (const p of list || []) {
      if (!p?.playlistId || seenPlaylists.has(p.playlistId)) continue;
      seenPlaylists.add(p.playlistId);
      candidates.push(p);
      sourcePriority.set(p.playlistId, bonus);
    }
  });

  // Rank candidates: query-token coverage, official channel bonus, junk-name
  // penalty, and a strong penalty for spammy mega-titles
  const qToks = cleaned.split(' ').filter(Boolean);
  const LANGUAGE_NAMES = [
    'marathi', 'bengali', 'tamil', 'telugu', 'malayalam', 'kannada',
    'bhojpuri', 'gujarati', 'punjabi', 'sinhala', 'nepali', 'odia', 'assamese',
    'english', 'arabic', 'korean'
  ];
  const scorePlaylist = (p) => {
    const name = (p.name || '');
    const lower = name.toLowerCase();
    let s = qToks.filter(t => lower.includes(t)).length * 3;
    if (OFFICIAL_CHANNEL_RE.test(p.artist?.name || '')) s += 4;
    s += sourcePriority.get(p.playlistId) || 0;
    if (GENRE_JUNK_TITLE_RE.some(re => re.test(name))) s -= 8;
    if (VARIANT_RE.lofi.test(name) && !intent.lofi) s -= 3;
    if (VARIANT_RE.instrumental.test(name) && !intent.instrumental) s -= 3;
    if (name.length > 70) s -= 4;
    // Language mismatch: "sad song" query should not surface a "Marathi sad
    // songs" playlist unless the query itself asked for that language
    if (!Object.keys(q).length) {
      for (const lang of LANGUAGE_NAMES) {
        if (lower.includes(lang)) {
          s -= 4;
          break;
        }
      }
    }
    return s;
  };

  const ranked = [...candidates].sort((a, b) => scorePlaylist(b) - scorePlaylist(a)).slice(0, 4);

  const trackLists = await Promise.all(
    ranked.map(p => yt.getPlaylistVideos(p.playlistId).catch(() => []))
  );

  // Quality gate per playlist: drop lists whose tracks are mostly junk
  const formatAndClean = (raw) => {
    const s = formatSong ? formatSong(raw) : raw;
    if (!s) return null;
    const cleanedTitle = cleanSongTitle(s.title) || s.title;
    return { ...s, title: cleanedTitle };
  };

  const goodLists = [];
  for (const rawList of trackLists) {
    const formatted = (rawList || []).map(formatAndClean).filter(Boolean);
    const clean = formatted.filter(s => !isGenreJunk(s, intent, q));
    if (clean.length >= 5 && clean.length / Math.max(1, formatted.length) >= 0.55) {
      goodLists.push(clean);
    }
  }

  const seenVideo = new Set();
  const seenTitle = new Set();
  const artistCounts = new Map();
  const merged = [];
  const push = (raw) => {
    const s = formatAndClean(raw);
    if (!s?.videoId || isGenreJunk(s, intent, q)) return;
    const key = `${norm(s.title)}|${norm(s.artist)}`;
    if (seenVideo.has(s.videoId) || seenTitle.has(key)) return;
    // Editorial rule: max 2 songs per artist so one playlist's favourite
    // doesn't dominate the shelf ("Atta Ullah Khan x5" → variety)
    const artistKey = norm(s.artist);
    const count = artistCounts.get(artistKey) || 0;
    if (artistKey && count >= 2) return;
    seenVideo.add(s.videoId);
    seenTitle.add(key);
    artistCounts.set(artistKey, count + 1);
    merged.push(s);
  };

  // Round-robin interleave for editorial variety; a lone passing playlist is
  // capped so the natural-search top-up can add breadth
  const maxLen = Math.max(0, ...goodLists.map(l => l.length));
  const perListCap = goodLists.length === 1 ? Math.ceil(maxResults * 0.6) : maxLen;
  const listCounts = goodLists.map(() => 0);
  const cap = maxResults + 8;
  for (let i = 0; i < maxLen && merged.length < cap; i++) {
    for (let li = 0; li < goodLists.length; li++) {
      if (merged.length >= cap) break;
      if (listCounts[li] >= perListCap) continue;
      if (i < goodLists[li].length) {
        push(goodLists[li][i]);
        listCounts[li] += 1;
      }
    }
  }

  // Variety top-up with a natural song search (same junk gate). India-first:
  // without a language intent, search the Hindi variant for cleaner results.
  if (merged.length < maxResults) {
    const topUpQuery = !hasLanguageIntent && !/\bhindi\b/.test(cleaned) ? `hindi ${cleaned}` : cleaned;
    const extra = await yt.searchSongs(topUpQuery).catch(() => []);
    for (const s of extra || []) {
      if (merged.length >= maxResults) break;
      push(s);
    }
  }

  return merged.slice(0, maxResults);
}
