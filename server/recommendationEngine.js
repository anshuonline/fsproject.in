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

// ─── Official YouTube Music Live Chart Registry ─────────────────────────────
export const OFFICIAL_CHARTS = {
  trending_india: 'VLOLAK5uy_lSTp1DIuzZBUyee3kDsXwPgP25WdfwB40', // Trending 20 India
  bollywood: 'VLPL4fGSI1pDJn5RgLW0Sb_zECecWdH_4zOX',         // Top Weekly Hindi
  hindi: 'VLPL4fGSI1pDJn5RgLW0Sb_zECecWdH_4zOX',             // Top Weekly Hindi
  punjabi: 'VLPL4fGSI1pDJn5JXkyIohg2RstsbL2SnRew',           // Top Weekly Punjabi
  tamil: 'VLPL4fGSI1pDJn4WX22qg1Po7qKOwOb4H6Sk',             // Top Weekly Tamil
  telugu: 'VLPL4fGSI1pDJn5ALuqpEj_YZ8mEyw9WN8jd',            // Top Weekly Telugu
  haryanvi: 'VLPL4fGSI1pDJn4tiNLMZVGGt2Kghgw__2u0',          // Top Weekly Haryanvi
  bhojpuri: 'VLPL4fGSI1pDJn4ivDqrsepD3tvHsp0KTDRM',          // Top Weekly Bhojpuri
  english: 'VLPL4fGSI1pDJn49TUu37nJoN2QTeYuRwmNv',           // Top Weekly Global
  global: 'VLPL4fGSI1pDJn49TUu37nJoN2QTeYuRwmNv',            // Top Weekly Global
  daily_india: 'VLPL4fGSI1pDJn5oibdgJt8Hy0-dr2B7kSs2',       // Daily Top Videos India
  top_100_india: 'VLPL4fGSI1pDJn40WjZ6utkIuj2rNg-7iGsq'     // Top 100 Music Videos India
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
    .replace(/#Video\s*\|\s*/gi, '')
    .trim();
}

// ─── Strict Anti-Spam & Anti-Mashup Filter ──────────────────────────────────
export function isSpamOrJunkSong(s) {
  if (!s || !s.videoId || !s.title) return true;
  const title = (s.title || '').toLowerCase();
  const artist = (s.artist || '').toLowerCase();

  // 1. Long compilations, amateur mashups, and non-stop jukeboxes
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
    /\bcontinuous mix\b/i
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
export async function fetchOfficialChart(yt, browseId, cacheGet, cacheSet) {
  if (!browseId) return [];
  const cacheKey = `chart_browse_${browseId}`;
  if (cacheGet) {
    const cached = cacheGet(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const data = await yt.constructRequest('browse', { browseId });
    const shelf = data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer;
    const items = shelf?.contents || [];
    const songs = [];

    for (const c of items) {
      const r = c.musicResponsiveListItemRenderer;
      if (!r) continue;
      const title = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
      const artist = r.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Artist';
      const watch = r.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint ||
                    r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint;
      const videoId = watch?.videoId;
      const thumbs = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
      const thumb = thumbs[thumbs.length - 1]?.url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
      const durText = r.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text || '3:30';
      const durSec = parseDuration(durText);

      if (title && videoId) {
        const item = {
          videoId,
          title: cleanSongTitle(title) || title,
          artist,
          album: '',
          duration: durSec,
          durationText: durText,
          thumbnail: toHDThumbnail(thumb, videoId),
          type: 'song'
        };
        if (!isSpamOrJunkSong(item)) {
          songs.push(item);
        }
      }
    }

    if (songs.length > 0 && cacheSet) {
      cacheSet(cacheKey, songs, 30 * 60 * 1000); // 30 min cache for official charts
    }
    return songs;
  } catch (err) {
    console.warn(`fetchOfficialChart failed for ${browseId}:`, err.message);
    return [];
  }
}

// ─── Shelf Plan Generator ───────────────────────────────────────────────────
export function generateShelfPlan(preferences = {}, history = []) {
  const userArtists = (preferences.artists || []).filter(Boolean);
  const userGenres = (preferences.genres || []).filter(Boolean);

  // Defaults if empty
  const primaryArtists = userArtists.length > 0 ? userArtists : ['Arijit Singh', 'Diljit Dosanjh', 'Taylor Swift'];
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
  }

  // 2. QUICK PICKS (Directly near top like YouTube Music)
  shelves.push({
    id: 'shelf-quickpicks',
    eyebrow: 'START RADIO BASED ON A SONG',
    title: 'Quick picks for you',
    searchQuery: `${mainArtist} top hits`,
    type: 'quickpicks',
    category: 'picks'
  });

  // 3. LATEST RELEASES & FRESH DROPS (Brand new songs powered by official releases & trending drops)
  shelves.push({
    id: 'shelf-latest-releases-main',
    eyebrow: 'FRESH DROPS & NEW MUSIC',
    title: 'Latest Releases & Fresh Drops',
    searchQuery: `new ${mainGenre} songs`,
    genre: mainGenre,
    type: 'latest_releases',
    category: 'latest'
  });

  // 4. LIVE TRENDING CHART (Official YouTube Music Chart API)
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
    searchQuery: `trending ${mainGenre} songs`,
    genre: mainGenre,
    chartKey: OFFICIAL_CHARTS[mainGenre] ? mainGenre : null,
    type: OFFICIAL_CHARTS[mainGenre] ? 'chart_songs' : 'songs',
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

  // 8. Signature Artist Latest Tracks
  shelves.push({
    id: 'shelf-art-latest-main',
    eyebrow: `NEW FROM ${mainArtist.toUpperCase()}`,
    title: `${mainArtist} New Releases & Singles`,
    searchQuery: `${mainArtist} new songs`,
    artistFilter: mainArtist,
    type: 'artist_songs',
    category: 'artist'
  });

  // 9. Secondary Followed Artists
  if (primaryArtists.length > 1) {
    primaryArtists.slice(1, 4).forEach((artist, idx) => {
      shelves.push({
        id: `shelf-art-latest-${idx + 1}`,
        eyebrow: 'LATEST FROM ' + artist.toUpperCase(),
        title: `${artist} New Tracks & Hits`,
        searchQuery: `${artist} new songs`,
        artistFilter: artist,
        type: 'artist_songs',
        category: 'latest'
      });

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
    }
  };

  primaryGenres.slice(0, 4).forEach((genre, idx) => {
    const meta = GENRE_LABELS[genre.toLowerCase()] || {
      name: genre.charAt(0).toUpperCase() + genre.slice(1) + ' Hits',
      latest: `Latest ${genre} Releases`,
      latestQuery: `new ${genre} songs`,
      hits: `Trending ${genre} Hits`,
      hitsQuery: `trending ${genre} songs`,
      chill: `${genre} Chill Melodies`,
      chillQuery: `${genre} chill songs`
    };

    // Genre Latest Releases
    shelves.push({
      id: `shelf-genre-latest-${idx}`,
      eyebrow: 'NEW DROPS',
      title: meta.latest,
      searchQuery: meta.latestQuery,
      type: 'songs',
      category: 'latest'
    });

    // Genre Trending Hits (Powered by official chart API if available!)
    if (meta.chartKey && OFFICIAL_CHARTS[meta.chartKey]) {
      shelves.push({
        id: `shelf-genre-chart-${idx}`,
        eyebrow: 'OFFICIAL CHART',
        title: meta.hits,
        chartKey: meta.chartKey,
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
export async function buildAlgorithmicFeed(yt, preferences, history, cacheGet, cacheSet) {
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

  // 2. Generate customized shelf plan
  const shelfPlan = generateShelfPlan(preferences, history);

  // 3. Populate shelves concurrently
  const populatedShelves = await Promise.all(
    shelfPlan.map(async (plan) => {
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
        const cacheKey = `shelf_artist_songs_v6_${targetArtist.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
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

      // ── TYPE: latest_releases (Combines official new release tracks + official live trending) ──
      if (plan.type === 'latest_releases') {
        const cacheKey = `shelf_latest_releases_v5_${plan.genre || 'all'}`;
        const cached = cacheGet(cacheKey);
        if (cached && cached.length > 0) {
          return { ...plan, items: cached };
        }

        try {
          const songs = [];

          // A. Extract top tracks from official YouTube Music new release albums
          if (officialNewReleasesSec?.contents?.length > 0) {
            const topAlbums = officialNewReleasesSec.contents.slice(0, 4);
            const albumResults = await Promise.all(
              topAlbums.map(a => a.albumId ? yt.getAlbum(a.albumId).catch(() => null) : null)
            );
            albumResults.forEach(alb => {
              if (alb?.songs) {
                alb.songs.slice(0, 3).forEach(s => {
                  const formatted = formatSong({
                    videoId: s.videoId,
                    name: s.name,
                    artist: alb.artist?.name || s.artist?.name || alb.name,
                    album: alb.name,
                    duration: s.duration,
                    thumbnails: s.thumbnails || alb.thumbnails
                  });
                  if (formatted && !isSpamOrJunkSong(formatted)) {
                    songs.push(formatted);
                  }
                });
              }
            });
          }

          // B. Add top trending live drops from official India Trending chart
          const trendingChartSongs = await fetchOfficialChart(
            yt,
            OFFICIAL_CHARTS.trending_india,
            cacheGet,
            cacheSet
          );
          if (trendingChartSongs.length > 0) {
            songs.push(...trendingChartSongs.slice(0, 4));
          }

          // C. Query clean smart new songs (zero year numbers)
          const query = plan.searchQuery || `new ${plan.genre || 'bollywood'} songs`;
          const songRes = await yt.searchSongs(query).catch(() => []);
          (songRes || []).forEach(s => {
            const formatted = formatSong(s);
            if (formatted && !isSpamOrJunkSong(formatted)) {
              songs.push(formatted);
            }
          });

          // Deduplicate
          const seen = new Set();
          const uniqueNewSongs = [];
          for (const s of songs) {
            if (!seen.has(s.videoId)) {
              seen.add(s.videoId);
              uniqueNewSongs.push(s);
              if (uniqueNewSongs.length >= 14) break;
            }
          }

          if (uniqueNewSongs.length > 0) {
            cacheSet(cacheKey, uniqueNewSongs, 15 * 60 * 1000);
          }
          return { ...plan, items: uniqueNewSongs };
        } catch (err) {
          console.warn(`Latest releases shelf failed:`, err.message);
          return { ...plan, items: [] };
        }
      }

      // ── TYPE: official_albums (Direct official album releases from YouTube Music) ──
      if (plan.type === 'official_albums') {
        if (officialNewReleasesSec?.contents?.length > 0) {
          const albumItems = officialNewReleasesSec.contents
            .map(formatAlbum)
            .filter(Boolean);
          return { ...plan, items: albumItems.slice(0, 12) };
        }
        const res = await yt.searchAlbums('Latest Hindi Punjabi Albums').catch(() => []);
        const fallbackAlbums = (res || []).slice(0, 10).map(formatAlbum).filter(Boolean);
        return { ...plan, items: fallbackAlbums };
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

  // Filter out any empty shelves
  const validShelves = populatedShelves.filter(s => s.items && s.items.length > 0);

  return {
    sections: validShelves,
    totalSections: validShelves.length,
    preferencesApplied: Boolean(preferences.artists?.length || preferences.genres?.length),
    historyApplied: Boolean(history && history.length > 0)
  };
}
