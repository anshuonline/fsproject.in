import express from 'express';
import cors from 'cors';
import YTMusic from 'ytmusic-api';
import { buildAlgorithmicFeed } from './recommendationEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let ytmusicInstance = null;
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { time: Date.now(), data });
}

// Initialize YTMusic instance
async function getYTMusic() {
  if (!ytmusicInstance) {
    console.log('Initializing YTMusic...');
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    ytmusicInstance = ytmusic;
    console.log('YTMusic initialized successfully!');
  }
  return ytmusicInstance;
}

// Helper to upgrade thumbnails to HD safely
function toHDUrl(url, videoId) {
  if (!url) {
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
  }
  let u = url;
  if (u.startsWith('//')) u = 'https:' + u;
  // Upgrade Google usercontent thumbnails to 544x544 HD
  if (u.includes('googleusercontent.com') && u.includes('=w')) {
    u = u.replace(/=w\d+-h\d+/, '=w544-h544');
  } else if (u.includes('ytimg.com') || u.includes('youtube.com')) {
    if (u.includes('/default.jpg') || u.includes('/mqdefault.jpg')) {
      u = u.replace(/\/(default|mqdefault)\.jpg/i, '/hqdefault.jpg');
    }
  }
  return u;
}

function parseDuration(d) {
  if (typeof d === 'number') return d;
  if (typeof d === 'string') {
    const parts = d.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// ─── API Routes ─────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FreeSong.in API', timestamp: new Date().toISOString() });
});

// Home Feeds: "From the community", "From your library", "Quick picks"
app.get('/api/home', async (req, res) => {
  const userGenres = req.query.genres ? req.query.genres.split(',').filter(Boolean) : [];
  const userArtists = req.query.artists ? req.query.artists.split(',').filter(Boolean) : [];
  let userHistory = [];
  try {
    if (req.query.history) {
      userHistory = JSON.parse(req.query.history);
    }
  } catch {}

  const historyKey = (userHistory[0]?.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cacheKey = `home_algo_${userGenres.slice().sort().join('_')}_${userArtists.slice().sort().join('_')}_${historyKey}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    const feed = await buildAlgorithmicFeed(
      yt,
      { artists: userArtists, genres: userGenres },
      userHistory,
      getCached,
      setCache
    );

    setCache(cacheKey, feed, 10 * 60 * 1000); // 10 min cache
    res.json(feed);
  } catch (err) {
    console.error('Error fetching home feed:', err);
    res.status(500).json({ error: 'Failed to fetch home feeds' });
  }
});

// Search Endpoint (Songs, Albums, Playlists, Artists)
app.get('/api/search', async (req, res) => {
  const query = req.query.q?.trim();
  const type = req.query.type || 'all'; // all | song | album | playlist | artist
  const limit = parseInt(req.query.limit, 10) || 20;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const cacheKey = `search_${type}_${query.toLowerCase()}_${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    let responseData = {};

    if (type === 'song') {
      const songs = await yt.searchSongs(query);
      responseData.songs = songs.slice(0, limit).map(formatSong);
    } else if (type === 'album') {
      const albums = await yt.searchAlbums(query);
      responseData.albums = albums.slice(0, limit).map(formatAlbum);
    } else if (type === 'playlist') {
      const playlists = await yt.searchPlaylists(query);
      responseData.playlists = playlists.slice(0, limit).map(formatPlaylist);
    } else if (type === 'artist') {
      const artists = await yt.searchArtists(query);
      responseData.artists = artists.slice(0, limit).map(formatArtist);
    } else {
      // 'all': fetch songs, albums, playlists, artists concurrently
      const [songs, albums, playlists, artists] = await Promise.all([
        yt.searchSongs(query).catch(() => []),
        yt.searchAlbums(query).catch(() => []),
        yt.searchPlaylists(query).catch(() => []),
        yt.searchArtists(query).catch(() => [])
      ]);

      responseData = {
        songs: songs.slice(0, 10).map(formatSong),
        albums: albums.slice(0, 6).map(formatAlbum),
        playlists: playlists.slice(0, 6).map(formatPlaylist),
        artists: artists.slice(0, 6).map(formatArtist)
      };
    }

    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    console.error(`Search error for "${query}":`, err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Synchronized Lyrics endpoint (lrclib + cache)
app.get('/api/lyrics', async (req, res) => {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const cleanTitle = (title || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/Official Video/gi, '')
    .replace(/Video Song/gi, '')
    .replace(/Full Song/gi, '')
    .replace(/Lyrical/gi, '')
    .replace(/\|.*/g, '')
    .trim();

  const cleanArtist = (artist || '')
    .replace(/ - Topic/g, '')
    .replace(/VEVO$/i, '')
    .trim();

  const cacheKey = `lyrics_${cleanTitle.toLowerCase()}_${cleanArtist.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const query = `${cleanTitle} ${cleanArtist}`.trim();
    const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(lrcUrl, {
      headers: {
        'User-Agent': 'FreeSong.in/1.0.0 (https://freesong.in)'
      }
    });

    if (!response.ok) {
      throw new Error(`lrclib responded with ${response.status}`);
    }

    const results = await response.json();
    let result = null;

    if (Array.isArray(results) && results.length > 0) {
      const withSync = results.find(r => r.syncedLyrics);
      if (withSync) {
        result = {
          syncedLyrics: withSync.syncedLyrics,
          plainLyrics: withSync.plainLyrics,
          trackName: withSync.trackName,
          artistName: withSync.artistName
        };
      } else {
        result = {
          syncedLyrics: null,
          plainLyrics: results[0].plainLyrics || null,
          trackName: results[0].trackName,
          artistName: results[0].artistName
        };
      }
    } else {
      result = { syncedLyrics: null, plainLyrics: null };
    }

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn(`Lyrics fetch error for "${title}":`, err.message);
    res.json({ syncedLyrics: null, plainLyrics: null });
  }
});

// Related / UpNext Radio songs endpoint (infinite queue)
app.get('/api/related/:videoId', async (req, res) => {
  const { videoId } = req.params;
  const artistHint = req.query.artist || '';
  if (!videoId) return res.status(400).json({ error: 'videoId is required' });

  const cacheKey = `upnext_${videoId}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    let upNext = [];
    try {
      upNext = await yt.getUpNexts(videoId);
    } catch (e) {
      console.warn(`getUpNexts failed for ${videoId}:`, e.message);
    }

    let songs = [];
    if (Array.isArray(upNext) && upNext.length > 0) {
      songs = upNext.map(item => {
        const rawThumb = item.thumbnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '');
        return {
          videoId: item.videoId,
          title: item.title || 'Unknown Title',
          artist: item.artists || artistHint || 'Unknown Artist',
          durationText: item.duration || '3:30',
          duration: parseDuration(item.duration),
          thumbnail: toHDUrl(rawThumb, item.videoId),
          type: 'song'
        };
      });
    }

    // Fallback: If getUpNexts yielded fewer than 5 songs and artist is available, search artist songs
    if (songs.length < 5 && artistHint) {
      const fallbackSearch = await yt.searchSongs(`${artistHint} songs`).catch(() => []);
      const fallbackSongs = fallbackSearch.map(formatSong).filter(s => s && s.videoId !== videoId);
      songs = [...songs, ...fallbackSongs];
    }

    // Deduplicate by videoId
    const seen = new Set();
    const uniqueSongs = [];
    for (const s of songs) {
      if (s && s.videoId && s.videoId !== videoId && !seen.has(s.videoId)) {
        seen.add(s.videoId);
        uniqueSongs.push(s);
      }
    }

    const result = { songs: uniqueSongs.slice(0, 30) };
    setCache(cacheKey, result, 15 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error(`Error in /api/related/${videoId}:`, err);
    res.status(500).json({ error: 'Failed to fetch related songs', songs: [] });
  }
});

// Explore Feeds (Genres, Moods, Curated Picks)
app.get('/api/explore', async (req, res) => {
  const cacheKey = 'explore_feed';
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    const [popSongs, lofiSongs, romanticSongs, indieSongs] = await Promise.all([
      yt.searchSongs('Top Bollywood Pop').catch(() => []),
      yt.searchSongs('Hindi Lo-Fi Chill').catch(() => []),
      yt.searchSongs('Romantic Hindi Love').catch(() => []),
      yt.searchSongs('Indian Indie Hits').catch(() => [])
    ]);

    const result = {
      categories: [
        { id: 'bollywood', name: 'Bollywood Hits', color: '#E91E63', icon: 'Film' },
        { id: 'punjabi', name: 'Punjabi Beats', color: '#FF9800', icon: 'Flame' },
        { id: 'tamil', name: 'Tamil Hits (Kollywood)', color: '#FF3366', icon: 'Flame' },
        { id: 'telugu', name: 'Telugu Hits (Tollywood)', color: '#FF6B00', icon: 'Activity' },
        { id: 'haryanvi', name: 'Haryanvi Ragni & Beats', color: '#FF5722', icon: 'Zap' },
        { id: 'bengali', name: 'Bengali Melodies & Folk', color: '#9C27B0', icon: 'Heart' },
        { id: 'malayalam', name: 'Malayalam Hits', color: '#00BCD4', icon: 'Music' },
        { id: 'kannada', name: 'Kannada Hits', color: '#FFC107', icon: 'Disc' },
        { id: 'bhojpuri', name: 'Bhojpuri Tadka', color: '#F44336', icon: 'Volume2' },
        { id: 'lofi', name: 'Lo-Fi & Chill', color: '#7E57C2', icon: 'Coffee' },
        { id: 'romantic', name: 'Romantic & Love', color: '#EC407A', icon: 'Heart' },
        { id: 'desihiphop', name: 'Desi Hip Hop', color: '#4CAF50', icon: 'Mic' },
        { id: 'indie', name: 'Indian Indie', color: '#26C6DA', icon: 'Music' },
        { id: 'englishpop', name: 'English Pop', color: '#2196F3', icon: 'Headphones' },
        { id: 'hiphoprap', name: 'Global Rap / Hip Hop', color: '#673AB7', icon: 'Radio' },
        { id: 'devotional', name: 'Devotional & Spiritual', color: '#FFB300', icon: 'Sparkles' },
        { id: 'workout', name: 'Workout & Energy', color: '#E64A19', icon: 'Zap' },
        { id: 'party', name: 'Party & Club Hits', color: '#AB47BC', icon: 'Volume2' },
        { id: '90s', name: '90s Bollywood Nostalgia', color: '#8D6E63', icon: 'Disc' },
        { id: 'ghazals', name: 'Ghazals & Sufi', color: '#78909C', icon: 'BookOpen' },
        { id: 'edm', name: 'EDM & Electronic', color: '#00E676', icon: 'Sliders' },
        { id: 'rock', name: 'Rock & Alternative', color: '#FF3D00', icon: 'Flame' },
        { id: 'sleep', name: 'Sleep & Ambient', color: '#3F51B5', icon: 'Moon' },
        { id: 'focus', name: 'Focus & Study', color: '#009688', icon: 'Compass' }
      ],
      featuredTracks: popSongs.slice(0, 8).map(formatSong),
      lofiTracks: lofiSongs.slice(0, 8).map(formatSong),
      romanticTracks: romanticSongs.slice(0, 8).map(formatSong),
      indieTracks: indieSongs.slice(0, 8).map(formatSong)
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Explore fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch explore feed' });
  }
});

// Playlist Details & Songs
app.get('/api/playlist/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Playlist ID is required' });

  const cacheKey = `playlist_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    let pid = id;
    if (pid.startsWith('VL')) pid = pid.substring(2);

    const videos = await yt.getPlaylistVideos(pid);
    const songs = (videos || []).map(formatSong);

    const result = {
      id: pid,
      title: req.query.name || 'Playlist',
      creator: 'Community / FreeSong.in',
      songs,
      trackCount: songs.length,
      coverImage: songs[0]?.thumbnail || ''
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching playlist ${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch playlist songs' });
  }
});

// Album Details & Songs
app.get('/api/album/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Album ID is required' });

  const cacheKey = `album_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    const album = await yt.getAlbum(id);
    let songs = [];

    if (album.playlistId) {
      const videos = await yt.getPlaylistVideos(album.playlistId).catch(() => []);
      songs = videos.map(formatSong);
    } else if (album.songs && album.songs.length > 0) {
      songs = album.songs.map(formatSong);
    }

    const thumbs = album.thumbnails || [];
    const result = {
      id: album.albumId || id,
      title: album.name || album.title,
      artist: album.artist?.name || 'Various Artists',
      year: album.year || '',
      coverImage: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ''),
      songs,
      trackCount: songs.length
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching album ${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

// Artist Details & Tracks
app.get('/api/artist/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Artist ID is required' });

  const cacheKey = `artist_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    const artist = await yt.getArtist(id);
    const thumbs = artist.thumbnails || [];

    const topSongs = (artist.topSongs || []).map(formatSong);
    const albums = (artist.topAlbums || []).map(formatAlbum);

    const result = {
      id: artist.artistId || id,
      name: artist.name,
      description: artist.description || '',
      subscribers: artist.subscribers || '',
      headerImage: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ''),
      avatarImage: toHDUrl(thumbs[0]?.url || ''),
      topSongs,
      albums
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching artist ${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch artist details' });
  }
});

// Formatters
function formatSong(s) {
  if (!s) return null;
  const thumbs = s.thumbnails || [];
  const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || (s.videoId ? `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg` : '');
  const lowThumb = thumbs[0]?.url || (s.videoId ? `https://i.ytimg.com/vi/${s.videoId}/default.jpg` : '');
  const dur = parseDuration(s.duration);
  return {
    videoId: s.videoId,
    title: s.name || s.title || 'Unknown Title',
    artist: s.artist?.name || (typeof s.artist === 'string' ? s.artist : 'Unknown Artist'),
    album: s.album?.name || (typeof s.album === 'string' ? s.album : ''),
    duration: dur,
    durationText: typeof s.duration === 'string' ? s.duration : `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}`,
    thumbnail: toHDUrl(bestThumb),
    thumbnailLow: toHDUrl(lowThumb),
    type: 'song'
  };
}

function formatAlbum(a) {
  if (!a) return null;
  const thumbs = a.thumbnails || [];
  return {
    id: a.albumId || a.playlistId || '',
    title: a.name || a.title || 'Untitled Album',
    artist: a.artist?.name || (typeof a.artist === 'string' ? a.artist : 'Unknown Artist'),
    year: a.year || '',
    thumbnail: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ''),
    type: 'album'
  };
}

function formatPlaylist(p) {
  if (!p) return null;
  const thumbs = p.thumbnails || [];
  return {
    id: p.playlistId || '',
    title: p.name || p.title || 'Playlist',
    creator: p.artist?.name || 'FreeSong.in',
    trackCount: p.songCount || 0,
    thumbnail: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ''),
    type: 'playlist'
  };
}

function formatArtist(ar) {
  if (!ar) return null;
  const thumbs = ar.thumbnails || [];
  return {
    id: ar.artistId || '',
    name: ar.name || 'Artist',
    subscribers: ar.subscribers || '',
    thumbnail: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ''),
    type: 'artist'
  };
}

app.listen(PORT, () => {
  console.log(`FreeSong.in API server running on port ${PORT}`);
});
