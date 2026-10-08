import express from 'express';
import cors from 'cors';
import YTMusic from 'ytmusic-api';

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

// Helper to upgrade thumbnails to HD
function toHDUrl(url) {
  if (!url) return '';
  let u = url;
  if (u.includes('googleusercontent.com') || u.includes('ggpht.com')) {
    if (/=w\d+-h\d+/i.test(u)) {
      u = u.replace(/=w\d+-h\d+[^=]*/i, '=w544-h544-l90-rj');
    } else if (/-w\d+-h\d+/i.test(u)) {
      u = u.replace(/-w\d+-h\d+[^=]*/i, '-w544-h544-l90-rj');
    } else if (/=s\d+/i.test(u)) {
      u = u.replace(/=s\d+(-[a-zA-Z0-9_-]*)?/i, '=s544-c-k-c0x00ffffff-no-rj');
    } else if (/-s\d+/i.test(u)) {
      u = u.replace(/-s\d+(-[a-zA-Z0-9_-]*)?/i, '-s544-c-k-c0x00ffffff-no-rj');
    } else if (/\/s\d+\//i.test(u)) {
      u = u.replace(/\/s\d+\//i, '/s544/');
    } else if (!u.includes('=')) {
      u = u + '=w544-h544-l90-rj';
    }
    return u;
  }
  if (u.includes('ytimg.com') || u.includes('youtube.com')) {
    let clean = u.split('?')[0];
    if (clean.includes('/default.jpg') || clean.includes('/mqdefault.jpg') || clean.includes('/sddefault.jpg')) {
      return clean.replace(/\/(default|mqdefault|sddefault)\.jpg$/i, '/hqdefault.jpg');
    }
    return clean;
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
  const cacheKey = 'home_feeds_v1';
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();

    // 1. Search for popular community playlists
    const [communityPlaylists, hindiMixes, librarySuggestions, quickPicks] = await Promise.all([
      yt.searchPlaylists('chill playlist').catch(() => []),
      yt.searchPlaylists('hindi lofi songs').catch(() => []),
      yt.searchPlaylists('bolly hits').catch(() => []),
      yt.searchSongs('arijit singh top').catch(() => [])
    ]);

    // Format community items matching screenshot
    const communityItems = [...communityPlaylists, ...hindiMixes].slice(0, 10).map((p, index) => {
      const thumbs = p.thumbnails || [];
      const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
      return {
        id: p.playlistId || `comm-${index}`,
        title: p.name || 'Community Playlist',
        creator: p.artist?.name || 'Curated',
        views: `${Math.floor(Math.random() * 450 + 50)}k views`,
        thumbnail: toHDUrl(bestThumb),
        type: 'playlist',
        badge: (p.artist?.name || 'A')[0].toUpperCase(),
        // Multi-image collage simulation if 4 thumbs available or generated
        thumbnails: thumbs.map(t => toHDUrl(t.url))
      };
    });

    // Format library items matching screenshot
    const libraryItems = librarySuggestions.slice(0, 10).map((p, index) => {
      const thumbs = p.thumbnails || [];
      const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
      return {
        id: p.playlistId || `lib-${index}`,
        title: p.name || 'Library Collection',
        subtitle: `${p.artist?.name || 'FreeSong'} • ${Math.floor(Math.random() * 20 + 8)} tracks`,
        thumbnail: toHDUrl(bestThumb),
        type: 'playlist'
      };
    });

    // Quick pick songs
    const quickPickSongs = quickPicks.slice(0, 12).map(s => {
      const thumbs = s.thumbnails || [];
      return {
        videoId: s.videoId,
        title: s.name,
        artist: s.artist?.name || 'Unknown Artist',
        album: s.album?.name || '',
        duration: parseDuration(s.duration),
        durationText: typeof s.duration === 'string' ? s.duration : `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')}`,
        thumbnail: toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '')
      };
    });

    const result = {
      community: communityItems,
      library: libraryItems,
      quickPicks: quickPickSongs
    };

    setCache(cacheKey, result);
    res.json(result);
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
        { id: 'lofi', name: 'Lo-Fi & Chill', color: '#9C27B0', icon: 'Coffee' },
        { id: 'romantic', name: 'Romantic & Love', color: '#F44336', icon: 'Heart' },
        { id: 'indie', name: 'Indian Indie', color: '#00BCD4', icon: 'Guitar' },
        { id: 'devotional', name: 'Devotional & Spiritual', color: '#FFC107', icon: 'Sparkles' },
        { id: 'hiphop', name: 'Desi Hip Hop', color: '#4CAF50', icon: 'Mic' },
        { id: 'workout', name: 'Workout & Energy', color: '#FF5722', icon: 'Zap' }
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
