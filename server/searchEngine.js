// ─── Smart Search Relevance Layer (YouTube-grade ranking) ───────────────────
// Raw ytmusic-api results are relevance-agnostic. This layer mimics YouTube's
// smart search: query cleaning, exact/phrase match boosting, artist matching,
// official-release preference, junk demotion (unless the user asked for it),
// deduplication and a cleaned-query fallback for weak result sets.

import { TOP_100_ARTISTS } from './artistsData.js';

// Known popular artists act as an authority signal: the original release by a
// mainstream artist outranks anonymous covers with the identical song title.
const KNOWN_ARTIST_NAMES = new Set(
  (TOP_100_ARTISTS || []).map(a => (a.name || '').toLowerCase().trim()).filter(Boolean)
);

const norm = (s) => (s || '')
  .toString()
  .toLowerCase()
  .normalize('NFKD')
  .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokens = (s) => norm(s).split(' ').filter(Boolean);

// Query intent: user explicitly wants a variant, so never demote those keywords in results
const JUNK_INTENT_RE = /\b(remix|lo-?fi|lofi|slowed|reverb|sped\s*up|speed\s*up|nightcore|8d|16d|karaoke|cover|instrumental|mashup|jukebox|mix|dj|acoustic|unplugged|reprise|version|flip|male|female|suno|udio|ai)\b/i;

// Heavy junk: never what a music searcher wants (unless intent matched)
const HARD_JUNK_TITLE_RE = /\b(full album|jukebox|non-?stop|nonstop|mashup|medley|dj mix|mega ?mix|continuous mix|1 hour|lo-?fi|lofi|sped ?up|slowed|reverb|nightcore|8d|16d|karaoke|whatsapp status|status video|reaction|shorts|teaser|trailer|promo|ringtone|8-bit|lyrics|lyrical)\b/i;

// Softer variants: demoted but not buried
const SOFT_JUNK_TITLE_RE = /\b(remix|cover|tribute|reprise|acoustic|female version|male version|instrumental|cover song|selfie|dance performance|dance cover)\b/i;

// AI-generated music (Suno, Udio & generic AI channels) — bottom-ranked in search.
// Bare "suno" is only checked in ARTIST (Hindi titles like "Suno Na Sangemarmar"
// must survive); titles need unambiguous AI-generation markers.
const AI_MUSIC_TITLE_RE = /\bsuno\s*(ai|\.ai|\.com)\b|\[\s*suno\s*\]|\(\s*suno\s*(ai)?\s*\)|\b(ai|a\.i)[-\s]*(generated|gen)\b|\bai\s+(music|songs?|covers?|remix|version|album|artist|singer|vocals?|voice)\b|(made|created|generated|produced)\s+(with|by|using)\s+(suno|udio|ai)\b|aimusic|aisongs?|aigenerated|sunoai|suno\.ai|suno\.com/i;
const AI_MUSIC_ARTIST_RE = /\bsuno\b|\budio\b|\bai\s*(music|songs?|generated|studio|lab|vibes?|covers?|hits?|charts?)\b|aimusic|aisongs?|aigenerated|sunoai|suno\.ai|suno\.com/i;
const AI_INTENT_RE = /\b(suno|udio|ai|a\.i)\b/i;

// Query noise: production metadata that pollutes YouTube Music matching
const NOISE_PATTERNS = [
  /\bofficial\s+(music\s+)?videos?\b/gi,
  /\bofficial\s+audios?\b/gi,
  /\bfull\s+(video|audio|song)s?\b/gi,
  /\blyrical\s+videos?\b/gi,
  /\blyrics?\b/gi,
  /\bvideo\s+songs?\b/gi,
  /\bsongs?\s+video\b/gi,
  /\bhd\s+videos?\b/gi,
  /\b\d{3,4}\s*p\b/gi,
  /\b4k\b/gi,
  /\bmp[34]\b/gi,
  /\b\d{3}\s*kbps\b/gi,
  /\bfree\s+download\b/gi,
  /\bdownload\b/gi,
  /\bwapsite\b/gi,
  /\bgaana\s*com\b/gi,
  /\bsaavn\b/gi,
  /\bjio\s*saavn\b/gi,
  /\bspotify\b/gi,
  /\b(new|latest)\s+songs?\b/gi,
  /\ball\s+songs?\b/gi
];

const TRAILING_FILLER = new Set(['song', 'songs', 'gana', 'gane', 'gaana', 'video', 'videos', 'hd']);

// ─── Query Cleaning ──────────────────────────────────────────────────────────

// "tum hi ho official video mp3" -> "tum hi ho" | "play kesariya" -> "kesariya"
export function cleanSearchQuery(query) {
  let q = (query || '')
    .replace(/["'`]/g, ' ')
    .replace(/^\s*(play|sun|suno|bajao|chala|gaana|song)\s+/i, '');

  for (const re of NOISE_PATTERNS) q = q.replace(re, ' ');
  q = q.replace(/\b(19|20)\d{2}\b/g, ' ').replace(/\s+/g, ' ').trim();

  // Strip trailing filler words ("arijit singh songs" -> "arijit singh")
  let words = q.split(' ').filter(Boolean);
  while (words.length > 1 && TRAILING_FILLER.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  // Strip dangling separators ("saiyaan -" -> "saiyaan")
  return words.join(' ').replace(/[\s\-–—|/,]+$/g, '').replace(/^[\s\-–—|/,]+/g, '').trim();
}

// ─── Song Scoring ────────────────────────────────────────────────────────────

export function scoreSearchSong(song, rawQuery, opts = {}) {
  const matchQuery = opts.query ?? rawQuery;
  const q = norm(matchQuery);
  const qToks = tokens(matchQuery);
  if (!q || !qToks.length) return 0;

  const title = norm(song.title);
  const artist = norm(song.artist);
  const album = norm(song.album);
  const junkIntent = opts.junkIntent ?? JUNK_INTENT_RE.test(rawQuery);

  let score = 0;

  // Phrase match on the cleaned title (bracketed suffixes ignored while matching)
  if (title === q) score += 16;
  else if (title.startsWith(q)) score += 10;
  else if (title.includes(q)) score += 7;

  // Token coverage across title + artist (order-independent words like "ho tum hi")
  const covered = qToks.filter(t => title.includes(t) || artist.includes(t)).length;
  score += (covered / qToks.length) * 7;

  // Artist relevance: full artist name inside the query, or most artist tokens present
  if (artist && artist.length > 2) {
    if (q.includes(artist)) score += 6;
    else {
      const artistToks = artist.split(' ');
      const hit = artistToks.filter(t => q.includes(t)).length;
      if (hit >= Math.max(1, Math.ceil(artistToks.length * 0.6))) score += 3;
    }
  }

  // Authority: mainstream/known artists outrank anonymous covers that share
  // the exact song title ("Tum Hi Ho - Arijit Singh" > "Tum Hi Ho - Honey")
  if (artist && KNOWN_ARTIST_NAMES.has(artist)) score += 5;

  // Album name match (query may be the movie/album name)
  if (album && q.length > 3 && album.includes(q)) score += 4;

  // Official release (album-backed songs beat random video uploads)
  if (song.album) score += 4;
  else if (qToks.length >= 2) score *= 0.75;

  // Variant demotion: a title that only becomes an exact match after stripping
  // its bracket suffix ("Tum Hi Ho (Tunisian)", "(Workout Mix)", "(feat. X)")
  // is a variant, not the original release. Production metadata suffixes
  // ("Official Video", "From "...""") belong to the real song and stay untouched.
  if (!junkIntent) {
    const rawTitle = (song.title || '').toLowerCase();
    const bracket = rawTitle.match(/[\(\[\{]([^\)\]\}]*)[\)\]\}]/);
    if (bracket && title === q && !/official|audio|video|lyrical|from|movie/i.test(bracket[1])) {
      score *= 0.45;
    }
  }

  // Junk scaling — skipped when the user explicitly asked for a variant.
  // Multiplier (not subtraction) so junk never outranks clean results via
  // exact-match bonuses earned from stripped suffixes like "(Slowed + Reverb)".
  let junkScale = 1;
  if (!junkIntent) {
    if (HARD_JUNK_TITLE_RE.test(song.title || '')) junkScale = 0.25;
    else if (SOFT_JUNK_TITLE_RE.test(song.title || '')) junkScale = 0.6;
  }

  // AI-generated music demotion is independent of generic junk intent — a
  // "sad song lofi" query still wants real music, not Suno spam. Only an
  // explicit AI-tools query ("suno ai song") skips it.
  if (!AI_INTENT_RE.test(rawQuery) && junkScale > 0.08) {
    if (AI_MUSIC_TITLE_RE.test(song.title || '') || AI_MUSIC_ARTIST_RE.test(song.artist || '')) {
      junkScale = 0.08;
    }
  }

  // Duration sanity: compilations and ringtones sink
  if (song.duration) {
    if (song.duration > 900) score -= 8;
    else if (song.duration > 720) score -= 4;
    if (song.duration < 40) score -= 6;
  }

  return Math.round(score * junkScale * 100) / 100;
}

// Score, dedupe (one entry per song: title+artist, best variant wins) and sort
export function rankSearchSongs(songs, rawQuery, opts = {}) {
  const junkIntent = opts.junkIntent ?? JUNK_INTENT_RE.test(rawQuery);
  const byKey = new Map();

  for (const s of songs || []) {
    if (!s || !s.videoId) continue;
    const score = scoreSearchSong(s, rawQuery, { junkIntent, query: opts.matchQuery ?? rawQuery });
    const key = `${norm(s.title)}|${norm(s.artist)}`;
    const prev = byKey.get(key);
    if (!prev || score > prev.score) byKey.set(key, { s, score });
  }

  const pairs = [...byKey.values()].sort((a, b) => b.score - a.score);
  const topScore = pairs.length ? Math.max(0, pairs[0].score) : 0;
  return { ranked: pairs.map(x => x.s), topScore };
}

// ─── Artist / Album / Playlist Ranking ───────────────────────────────────────

export function rankSearchArtists(artists, rawQuery) {
  const q = norm(rawQuery);
  const qToks = tokens(rawQuery);
  const score = (a) => {
    const n = norm(a.name);
    if (n === q) return 20;
    if (n.startsWith(q)) return 14;
    if (n.includes(q)) return 10;
    const covered = qToks.filter(t => n.includes(t)).length;
    return (covered / Math.max(1, qToks.length)) * 6;
  };
  return [...(artists || [])].sort((a, b) => score(b) - score(a));
}

export function rankSearchAlbums(albums, rawQuery) {
  const q = norm(rawQuery);
  const qToks = tokens(rawQuery);
  const score = (a) => {
    const t = norm(a.title);
    const ar = norm(a.artist);
    let s = 0;
    if (t === q) s += 18;
    else if (t.includes(q)) s += 9;
    s += (qToks.filter(tok => t.includes(tok) || ar.includes(tok)).length / Math.max(1, qToks.length)) * 6;
    if (ar && q.includes(ar)) s += 3;
    const year = parseInt(a.year, 10);
    if (year && year >= new Date().getFullYear() - 1) s += 1;
    return s;
  };
  return [...(albums || [])].sort((a, b) => score(b) - score(a));
}

export function rankSearchPlaylists(playlists, rawQuery) {
  const q = norm(rawQuery);
  const qToks = tokens(rawQuery);
  const score = (p) => {
    const t = norm(p.title);
    if (t === q) return 18;
    if (t.includes(q)) return 10;
    return (qToks.filter(tok => t.includes(tok)).length / Math.max(1, qToks.length)) * 6;
  };
  return [...(playlists || [])].sort((a, b) => score(b) - score(a));
}
