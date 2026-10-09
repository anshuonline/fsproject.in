import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import YTMusic from 'ytmusic-api';
import { buildAlgorithmicFeed } from './recommendationEngine.js';
import { TOP_100_ARTISTS } from '../src/data/artistsData.js';
import db, { query, testDbConnection } from './database/db.js';
import crypto from 'crypto';
import { sendWelcomeEmail, sendAccountDeletionEmail, sendPasswordResetEmail } from './mailer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

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

  const historyKey = (userHistory[0]?.videoId || userHistory[0]?.title || userHistory[0]?.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cacheKey = `home_algo_v7_${userGenres.slice().sort().join('_')}_${userArtists.slice().sort().join('_')}_${historyKey}`;
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
      const artists = await yt.searchArtists(query).catch(() => []);
      responseData.artists = (artists || []).slice(0, limit).map(formatArtist);
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

// Search Suggestions Endpoint (YouTube Music / YouTube Autocomplete)
app.get('/api/search/suggestions', async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) {
    return res.json({ suggestions: [] });
  }

  const cacheKey = `suggestions_${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    let suggestions = [];
    try {
      suggestions = await yt.getSearchSuggestions(query);
    } catch (e) {
      console.warn(`yt.getSearchSuggestions failed for "${query}":`, e.message);
    }

    // High-reliability fallback: Google YouTube suggest endpoint
    if (!suggestions || suggestions.length === 0) {
      try {
        const fallbackRes = await fetch(
          `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`
        );
        if (fallbackRes.ok) {
          const text = await fallbackRes.text();
          const jsonMatch = text.match(/\((.*)\)/);
          if (jsonMatch && jsonMatch[1]) {
            const data = JSON.parse(jsonMatch[1]);
            if (Array.isArray(data[1])) {
              suggestions = data[1].map(item => item[0]).filter(Boolean);
            }
          }
        }
      } catch (fbErr) {
        console.warn('Fallback suggestion error:', fbErr.message);
      }
    }

    const unique = Array.from(new Set(suggestions || [])).slice(0, 8);
    const result = { suggestions: unique };
    setCache(cacheKey, result, 10 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching suggestions for "${query}":`, err);
    res.json({ suggestions: [] });
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

// Single Song / Track Details by Video ID
app.get('/api/song/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Song ID is required' });

  const cacheKey = `song_meta_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();
    let songData = null;

    // 1. Try yt.getSong(id)
    try {
      const fullSong = await yt.getSong(id);
      if (fullSong && (fullSong.name || fullSong.videoId)) {
        const thumbs = fullSong.thumbnails || [];
        const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        const lowThumb = thumbs[0]?.url || `https://i.ytimg.com/vi/${id}/default.jpg`;
        const dur = fullSong.duration || 0;
        songData = {
          videoId: id,
          title: fullSong.name || 'Unknown Title',
          artist: fullSong.artist?.name || (typeof fullSong.artist === 'string' ? fullSong.artist : 'Unknown Artist'),
          artistId: fullSong.artist?.artistId || null,
          album: fullSong.album?.name || (typeof fullSong.album === 'string' ? fullSong.album : ''),
          duration: dur,
          durationText: dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}` : '',
          thumbnail: toHDUrl(bestThumb, id),
          thumbnailLow: toHDUrl(lowThumb, id),
          type: 'song'
        };
      }
    } catch (err) {
      console.warn(`yt.getSong failed for ${id}:`, err.message);
    }

    // 2. Try yt.getVideo(id) if getSong failed
    if (!songData) {
      try {
        const fullVideo = await yt.getVideo(id);
        if (fullVideo && (fullVideo.name || fullVideo.videoId)) {
          const thumbs = fullVideo.thumbnails || [];
          const bestThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          const lowThumb = thumbs[0]?.url || `https://i.ytimg.com/vi/${id}/default.jpg`;
          const dur = fullVideo.duration || 0;
          songData = {
            videoId: id,
            title: fullVideo.name || 'Unknown Title',
            artist: fullVideo.artist?.name || (typeof fullVideo.artist === 'string' ? fullVideo.artist : 'Unknown Artist'),
            artistId: fullVideo.artist?.artistId || null,
            album: '',
            duration: dur,
            durationText: dur ? `${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}` : '',
            thumbnail: toHDUrl(bestThumb, id),
            thumbnailLow: toHDUrl(lowThumb, id),
            type: 'song'
          };
        }
      } catch (err) {
        console.warn(`yt.getVideo failed for ${id}:`, err.message);
      }
    }

    // 3. Fallback to YouTube oEmbed
    if (!songData) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
        if (oembedRes.ok) {
          const oembed = await oembedRes.json();
          songData = {
            videoId: id,
            title: oembed.title || 'Unknown Title',
            artist: oembed.author_name || 'FreeSong.in',
            artistId: null,
            album: '',
            duration: 0,
            durationText: '',
            thumbnail: toHDUrl(oembed.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, id),
            thumbnailLow: `https://i.ytimg.com/vi/${id}/default.jpg`,
            type: 'song'
          };
        }
      } catch (err) {
        console.warn(`oEmbed failed for ${id}:`, err.message);
      }
    }

    // 4. Default fallback
    if (!songData) {
      songData = {
        videoId: id,
        title: 'Playing Music',
        artist: 'FreeSong.in',
        artistId: null,
        album: '',
        duration: 0,
        durationText: '',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        thumbnailLow: `https://i.ytimg.com/vi/${id}/default.jpg`,
        type: 'song'
      };
    }

    setCache(cacheKey, songData, 60 * 60 * 1000); // 1 hour cache
    res.json(songData);
  } catch (err) {
    console.error(`Error in /api/song/${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch song details' });
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
    let targetId = id;
    if (targetId.startsWith('OLAK')) {
      targetId = 'VL' + targetId;
    }

    let album = null;
    try {
      album = await yt.getAlbum(targetId);
    } catch (err) {
      if (!targetId.startsWith('VL') && !targetId.startsWith('MPREb_')) {
        try {
          album = await yt.getAlbum('VL' + targetId);
        } catch {}
      }
    }

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    let songs = [];
    // Prioritize album.songs because yt.getAlbum already extracts tracks directly with full metadata
    if (Array.isArray(album.songs) && album.songs.length > 0) {
      songs = album.songs.map(formatSong).filter(Boolean);
    } else if (album.playlistId) {
      let pid = album.playlistId;
      if (pid.startsWith('PL')) pid = 'VL' + pid;
      const videos = await yt.getPlaylistVideos(pid).catch(() => []);
      if (videos && videos.length > 0) {
        songs = videos.map(formatSong).filter(Boolean);
      }
    }

    const originalCount = songs.length;
    const isSingle = originalCount <= 2;

    // If album has only 1 or 2 tracks (Single or OST release), enrich with soundtrack / related songs
    if (isSingle) {
      try {
        const albumName = album.name || album.title || req.query.name || '';
        const artistName = album.artist?.name || (typeof album.artist === 'string' ? album.artist : '');

        let extraSongs = [];

        // 1. Check if it's from a film / movie soundtrack: (From "Movie") or From 'Movie'
        const fromMatch = albumName.match(/\(From [\"']?(.*?)[\"']?\)/i) || albumName.match(/From [\"']?(.*?)[\"']?/i);
        if (fromMatch && fromMatch[1]) {
          const movie = fromMatch[1].replace(/[\"']/g, '').trim();
          if (movie) {
            const movieRes = await yt.searchSongs(`${movie} soundtrack songs`).catch(() => []);
            extraSongs = [...extraSongs, ...movieRes.map(formatSong).filter(Boolean)];
          }
        }

        // 2. Fetch more songs by the artist / release if fewer than 8
        if (extraSongs.length < 8 && artistName) {
          const artistRes = await yt.searchSongs(`${artistName} ${albumName} songs`).catch(() => []);
          extraSongs = [...extraSongs, ...artistRes.map(formatSong).filter(Boolean)];
        }

        // 3. Fallback: getUpNexts if still needed
        if (extraSongs.length < 6 && songs[0]?.videoId) {
          const upNexts = await yt.getUpNexts(songs[0].videoId).catch(() => []);
          if (Array.isArray(upNexts)) {
            extraSongs = [...extraSongs, ...upNexts.map(item => {
              const rawThumb = item.thumbnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '');
              return {
                videoId: item.videoId,
                title: item.title || 'Unknown Title',
                artist: item.artists || artistName || 'Unknown Artist',
                durationText: item.duration || '3:30',
                duration: parseDuration(item.duration),
                thumbnail: toHDUrl(rawThumb, item.videoId),
                type: 'song'
              };
            })];
          }
        }

        // Deduplicate songs, preserving original songs at the top
        const seen = new Set(songs.map(s => s.videoId));
        for (const extra of extraSongs) {
          if (extra && extra.videoId && !seen.has(extra.videoId)) {
            seen.add(extra.videoId);
            songs.push(extra);
            if (songs.length >= 15) break;
          }
        }
      } catch (enrichErr) {
        console.warn(`Album enrichment failed for ${id}:`, enrichErr.message);
      }
    }

    const thumbs = album.thumbnails || [];
    const bestCover = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || (songs[0]?.thumbnail || '');

    const result = {
      id: album.albumId || id,
      title: album.name || album.title || req.query.name || 'Album',
      artist: album.artist?.name || (typeof album.artist === 'string' ? album.artist : 'Various Artists'),
      year: album.year || '',
      coverImage: toHDUrl(bestCover),
      songs,
      trackCount: songs.length,
      originalCount,
      isSingle
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(`Error fetching album ${id}:`, err);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

// Artist Details & Tracks (Supports YouTube Channel IDs, slugs, and artist names)
app.get('/api/artist/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Artist ID is required' });

  const cacheKey = `artist_v2_${id.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const yt = await getYTMusic();

    // 1. Check if ID maps to a known curated artist in TOP_100_ARTISTS
    const matchedCurated = TOP_100_ARTISTS.find(a =>
      a.id === id ||
      a.id.toLowerCase() === id.toLowerCase() ||
      a.name.toLowerCase() === id.replace(/[-_]/g, ' ').toLowerCase()
    );

    let artistName = matchedCurated ? matchedCurated.name : decodeURIComponent(id).replace(/[-_]/g, ' ').trim();
    let avatarImage = matchedCurated?.image ? toHDUrl(matchedCurated.image) : '';
    let headerImage = '';
    let subscribers = '';
    let fullArtist = null;
    let channelId = id.startsWith('UC') ? id : null;

    // 2. If it is already a channel ID, try direct getArtist
    if (channelId) {
      try {
        fullArtist = await yt.getArtist(channelId);
      } catch (e) {
        console.warn(`Direct yt.getArtist(${channelId}) failed:`, e.message);
      }
    }

    // 3. If not found yet, search by artist name to get their official channel ID & avatar
    if (!fullArtist) {
      try {
        const searchResults = await yt.searchArtists(artistName);
        if (searchResults && searchResults.length > 0) {
          const bestMatch = searchResults.find(a =>
            a && a.name && a.name.toLowerCase().trim() === artistName.toLowerCase().trim()
          ) || searchResults[0];

          if (bestMatch) {
            artistName = bestMatch.name || artistName;
            if (bestMatch.thumbnails && bestMatch.thumbnails.length > 0) {
              const bestThumb = bestMatch.thumbnails[bestMatch.thumbnails.length - 1]?.url || bestMatch.thumbnails[0]?.url;
              avatarImage = toHDUrl(bestThumb);
            }
            if (bestMatch.artistId) {
              channelId = bestMatch.artistId;
              fullArtist = await yt.getArtist(channelId).catch(() => null);
            }
          }
        }
      } catch (searchErr) {
        console.warn(`yt.searchArtists failed for ${artistName}:`, searchErr.message);
      }
    }

    // 4. Extract data from fullArtist if available
    let topSongs = [];
    let albums = [];

    if (fullArtist) {
      artistName = fullArtist.name || artistName;
      subscribers = fullArtist.subscribers || subscribers;
      const thumbs = fullArtist.thumbnails || [];
      if (thumbs.length > 0) {
        headerImage = toHDUrl(thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '');
        if (!avatarImage) {
          avatarImage = toHDUrl(thumbs[0]?.url || headerImage);
        }
      }
      topSongs = (fullArtist.topSongs || []).map(formatSong).filter(Boolean);
      albums = (fullArtist.topAlbums || []).map(formatAlbum).filter(Boolean);
    }

    // 5. Enrich top songs: ensure at least 15 popular songs
    if (topSongs.length < 15) {
      try {
        const extraResults = await yt.searchSongs(`${artistName} hit songs`).catch(() => []);
        const seenVideos = new Set(topSongs.map(s => s.videoId));
        for (const s of extraResults) {
          const formatted = formatSong(s);
          if (formatted && formatted.videoId && !seenVideos.has(formatted.videoId)) {
            seenVideos.add(formatted.videoId);
            topSongs.push(formatted);
            if (topSongs.length >= 20) break;
          }
        }
      } catch (extraErr) {
        console.warn(`Song enrichment failed for ${artistName}:`, extraErr.message);
      }
    }

    // 6. Enrich albums if empty
    if (albums.length === 0) {
      try {
        const extraAlbums = await yt.searchAlbums(`${artistName} albums`).catch(() => []);
        albums = (extraAlbums || []).slice(0, 8).map(formatAlbum).filter(Boolean);
      } catch (albErr) {}
    }

    // 7. Ensure fallback image if still none
    if (!avatarImage) {
      avatarImage = topSongs[0]?.thumbnail || '';
    }
    if (!headerImage) {
      headerImage = avatarImage;
    }

    const result = {
      id: channelId || id,
      name: artistName,
      description: fullArtist?.description || '',
      subscribers: subscribers || `${(Math.floor(Math.random() * 8) + 1.2).toFixed(1)}M listeners`,
      headerImage,
      avatarImage,
      topSongs,
      albums
    };

    setCache(cacheKey, result, 30 * 60 * 1000); // 30 min cache
    res.json(result);
  } catch (err) {
    console.error(`Error in /api/artist/${id}:`, err);
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
  const thumbs = Array.isArray(ar.thumbnails) ? ar.thumbnails : [];
  const rawThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || ar.thumbnail || ar.image || '';
  return {
    id: ar.artistId || ar.id || '',
    name: ar.name || 'Artist',
    subscribers: ar.subscribers || '',
    thumbnail: toHDUrl(rawThumb),
    type: 'artist'
  };
}

// ─── User, Likes, and History Database Endpoints ───────────────────────────────

function getClientIp(req) {
  // 1. Cloudflare real client IP
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'].trim();
  }
  // 2. Nginx / reverse proxy real IP
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'].trim();
  }
  // 3. Standard forwarded for
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = forwarded.split(',');
    return list[0].trim();
  }
  // 4. Socket remote address
  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    if (socketIp.startsWith('::ffff:')) {
      return socketIp.replace('::ffff:', '');
    }
    return socketIp;
  }
  return '127.0.0.1';
}

function isLocalOrPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, '');
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (clean.startsWith('192.168.') || clean.startsWith('10.') || clean.startsWith('172.16.')) return true;
  return false;
}

async function getIpGeo(ip) {
  const isLocal = isLocalOrPrivateIp(ip);
  // When local or private IP, query ip-api without an IP address to resolve the machine's external public IP & geo
  const url = isLocal
    ? 'http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,query'
    : `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,lat,lon,query`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return {
          ip: data.query || (isLocal ? '127.0.0.1' : ip),
          country: data.country || 'India',
          countryCode: data.countryCode || 'IN',
          region: data.regionName || null,
          city: data.city || null,
          lat: data.lat || null,
          lon: data.lon || null
        };
      }
    }
  } catch (err) {
    console.warn('Geolocation lookup notice:', err.message);
  }

  return {
    ip: isLocal ? '127.0.0.1' : ip,
    country: 'India',
    countryCode: 'IN',
    region: 'India',
    city: 'India',
    lat: null,
    lon: null
  };
}

// Helper to resolve user identifier (DB ID, Firebase UID, or email) to MySQL users.id
async function resolveUserId(userIdentifier, email = null) {
  if (!userIdentifier && !email) return null;

  try {
    // 1. If it's already a numeric integer, verify in users table
    if (userIdentifier && /^\d+$/.test(String(userIdentifier))) {
      const rows = await query('SELECT id FROM users WHERE id = ?', [Number(userIdentifier)]);
      if (rows && rows.length > 0) return rows[0].id;
    }

    // 2. Look up by firebase_uid
    if (userIdentifier) {
      const rows = await query('SELECT id FROM users WHERE firebase_uid = ?', [String(userIdentifier)]);
      if (rows && rows.length > 0) return rows[0].id;
    }

    // 3. Look up by email
    const lookupEmail = email || (typeof userIdentifier === 'string' && userIdentifier.includes('@') ? userIdentifier : null);
    if (lookupEmail) {
      const rows = await query('SELECT id FROM users WHERE email = ?', [lookupEmail]);
      if (rows && rows.length > 0) return rows[0].id;

      // Auto-create user row if not found yet
      try {
        await query(
          'INSERT INTO users (email, name, auth_provider) VALUES (?, ?, ?)',
          [lookupEmail, lookupEmail.split('@')[0], 'email']
        );
        const newRows = await query('SELECT id FROM users WHERE email = ?', [lookupEmail]);
        if (newRows && newRows.length > 0) return newRows[0].id;
      } catch {}
    }
  } catch (err) {
    console.warn('resolveUserId error:', err.message);
  }

  return null;
}



// User Sync (Saves registration info, IP, Geolocation, and Login logs)
app.post('/api/user/sync', async (req, res) => {
  const { email, name, avatarUrl, authProvider, firebaseUid } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const rawIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  try {
    const geo = await getIpGeo(rawIp);
    const resolvedIp = geo.ip || rawIp;

    const sql = `
      INSERT INTO users (
        email, name, avatar_url, auth_provider, firebase_uid,
        registered_ip, registered_country, registered_country_code,
        registered_region, registered_city, registered_latitude, registered_longitude,
        registered_user_agent, last_login_at, last_login_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        name = COALESCE(VALUES(name), name),
        avatar_url = COALESCE(VALUES(avatar_url), avatar_url),
        firebase_uid = COALESCE(VALUES(firebase_uid), firebase_uid),
        registered_ip = CASE WHEN registered_ip IN ('::1', '127.0.0.1', 'localhost') OR registered_ip IS NULL THEN VALUES(registered_ip) ELSE registered_ip END,
        registered_country = CASE WHEN registered_country IN ('Localhost', 'LOCAL') OR registered_country IS NULL THEN VALUES(registered_country) ELSE registered_country END,
        registered_country_code = CASE WHEN registered_country_code IN ('LOCAL') OR registered_country_code IS NULL THEN VALUES(registered_country_code) ELSE registered_country_code END,
        registered_region = COALESCE(registered_region, VALUES(registered_region)),
        registered_city = CASE WHEN registered_city IN ('Local Area') OR registered_city IS NULL THEN VALUES(registered_city) ELSE registered_city END,
        registered_latitude = COALESCE(registered_latitude, VALUES(registered_latitude)),
        registered_longitude = COALESCE(registered_longitude, VALUES(registered_longitude)),
        registered_user_agent = COALESCE(registered_user_agent, VALUES(registered_user_agent)),
        last_login_at = NOW(),
        last_login_ip = VALUES(last_login_ip)
    `;

    await query(sql, [
      email,
      name ? name.trim().slice(0, 25) : 'FreeSong Listener',
      avatarUrl || null,
      authProvider || 'google',
      firebaseUid || null,
      resolvedIp,
      geo.country || 'India',
      geo.countryCode || 'IN',
      geo.region || null,
      geo.city || null,
      geo.lat || null,
      geo.lon || null,
      userAgent || null,
      resolvedIp
    ]);

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (user?.id) {
      await query(
        'INSERT INTO user_login_logs (user_id, ip_address, country, city, region, user_agent, logged_in_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [user.id, resolvedIp, geo.country || 'India', geo.city || null, geo.region || null, userAgent || null]
      ).catch(() => {});

      // Send 1st-time registration welcome email asynchronously if not already sent
      if (!user.welcome_email_sent) {
        sendWelcomeEmail({
          email: user.email,
          name: user.name || name || email.split('@')[0],
          userId: user.id
        }).catch(err => console.warn('[Welcome Email] Dispatch error:', err.message));
      }
    }

    if (user) {
      user.hasPassword = Boolean(user.password_hash);
      delete user.password_hash;
    }

    res.json({ success: true, user });
  } catch (err) {
    console.warn('User sync error:', err.message);
    res.status(500).json({ error: 'Database sync error' });
  }
});

// Password Hashing and Verification Utilities (MD5)
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  // Direct MD5 comparison
  const md5Hash = crypto.createHash('md5').update(password).digest('hex');
  if (storedHash.toLowerCase() === md5Hash.toLowerCase()) return true;

  // Backward compatibility: If stored hash was pbkdf2 format (salt:hash)
  if (storedHash.includes(':')) {
    try {
      const [salt, originalHash] = storedHash.split(':');
      if (salt && originalHash) {
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        if (hash === originalHash) return true;
      }
    } catch {}
  }
  return false;
}

// Reject overly simple or common passwords
function isEasyPassword(password) {
  if (!password || typeof password !== 'string') return true;
  const p = password.trim().toLowerCase();
  if (p.length < 6) return true;

  const commonWeak = [
    '123456', '1234567', '12345678', '123456789', '1234567890',
    'password', 'password123', 'pass123', 'qwerty', 'qwertyuiop',
    '111111', '000000', '112233', '123123', 'admin123', 'welcome',
    'welcome123', 'iloveyou', 'abc123', '654321', '987654321',
    'freesong', 'freesong123', 'monkey', 'dragon', 'football',
    'letmein', 'master', 'sunshine', 'princess'
  ];
  if (commonWeak.includes(p)) return true;
  if (/^(.)\1+$/.test(p)) return true;
  if (/^(012345|123456|234567|345678|456789|567890|654321|543210|987654)$/.test(p)) return true;
  if (/^\d+$/.test(p) && p.length < 8) return true;
  return false;
}

// Check if user has set a password
app.get('/api/user/has-password', async (req, res) => {
  const { userId, email } = req.query;
  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) return res.json({ hasPassword: false });
    const users = await query('SELECT password_hash FROM users WHERE id = ?', [resolvedUserId]);
    const hasPassword = Boolean(users && users[0] && users[0].password_hash);
    res.json({ hasPassword });
  } catch {
    res.json({ hasPassword: false });
  }
});

// Set or Update Password for Logged-In User (Verifies current password if already set)
app.post('/api/user/set-password', async (req, res) => {
  const { userId, email, currentPassword, newPassword } = req.body;
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long', code: 'PASSWORD_TOO_SHORT' });
  }

  if (isEasyPassword(newPassword)) {
    return res.status(400).json({
      error: 'This password is too easy or common. Please choose a stronger password with letters and numbers.',
      code: 'EASY_PASSWORD'
    });
  }

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User account not found', code: 'USER_NOT_FOUND' });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [resolvedUserId]);
    const existingUser = users && users[0];

    // If account already has a password, verify currentPassword!
    if (existingUser && existingUser.password_hash) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Current password is required to change password.',
          code: 'CURRENT_PASSWORD_REQUIRED'
        });
      }

      const isMatch = verifyPassword(currentPassword, existingUser.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Incorrect current password. Please enter your valid current password.',
          code: 'WRONG_PASSWORD'
        });
      }
    }

    const hashedPassword = hashPassword(newPassword);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, resolvedUserId]);

    res.json({
      success: true,
      message: 'Password saved successfully! You can now log into FreeSong using your email and password on any device.'
    });
  } catch (err) {
    console.warn('Set password error:', err.message);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Direct Email & Password Login (No OTP required!)
app.post('/api/user/login-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const rawIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  try {
    const users = await query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'No account found with this email. Would you like to create one?',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];
    if (!user.password_hash) {
      return res.status(400).json({
        error: 'This email is registered via Google and has no password yet. Please continue with Google, or click "Forgot password?" to set one.',
        code: 'NO_PASSWORD_SET',
        isGoogleUser: true
      });
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect password. Please try again or use "Forgot password?" to reset it.',
        code: 'INVALID_PASSWORD'
      });
    }

    // Auto-migrate legacy hash to clean MD5 in DB
    if (user.password_hash.includes(':')) {
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(password), user.id]).catch(() => {});
    }

    const geo = await getIpGeo(rawIp);
    const resolvedIp = geo.ip || rawIp;

    await query(
      'UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [resolvedIp, user.id]
    ).catch(() => {});

    await query(
      'INSERT INTO user_login_logs (user_id, ip_address, country, city, region, user_agent, logged_in_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [user.id, resolvedIp, geo.country || 'India', geo.city || null, geo.region || null, userAgent || null]
    ).catch(() => {});

    const sanitizedUser = {
      id: user.firebase_uid || `usr_${user.id}`,
      dbId: user.id,
      name: user.name || cleanEmail.split('@')[0],
      email: user.email,
      picture: user.avatar_url || '',
      provider: user.auth_provider || 'email',
      hasPassword: true,
      dob: user.dob,
      city: user.city,
      location_tracking_enabled: user.location_tracking_enabled,
      joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
    };

    res.json({ success: true, user: sanitizedUser });
  } catch (err) {
    console.warn('Login password error:', err.message);
    res.status(500).json({ error: 'Login failed due to a server error' });
  }
});

// Direct Email & Password Registration (No OTP required!)
app.post('/api/user/register-password', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long', code: 'PASSWORD_TOO_SHORT' });
  }

  if (isEasyPassword(password)) {
    return res.status(400).json({
      error: 'This password is too easy or common. Please choose a stronger password with letters and numbers.',
      code: 'EASY_PASSWORD'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = ((name || '').trim().slice(0, 25)) || cleanEmail.split('@')[0].slice(0, 25) || 'FreeSong Listener';
  const rawIp = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  try {
    const existing = await query('SELECT id, email, name FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please sign in instead.',
        code: 'ACCOUNT_EXISTS',
        email: cleanEmail
      });
    }

    const geo = await getIpGeo(rawIp);
    const resolvedIp = geo.ip || rawIp;
    const hashedPassword = hashPassword(password);

    const insertResult = await query(`
      INSERT INTO users (
        email, name, password_hash, auth_provider,
        registered_ip, registered_country, registered_country_code,
        registered_region, registered_city, registered_latitude, registered_longitude,
        registered_user_agent, last_login_at, last_login_ip
      ) VALUES (?, ?, ?, 'email', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `, [
      cleanEmail,
      cleanName,
      hashedPassword,
      resolvedIp,
      geo.country || 'India',
      geo.countryCode || 'IN',
      geo.region || null,
      geo.city || null,
      geo.lat || null,
      geo.lon || null,
      userAgent || null,
      resolvedIp
    ]);
    const userId = insertResult.insertId;

    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    await query(
      'INSERT INTO user_login_logs (user_id, ip_address, country, city, region, user_agent, logged_in_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, resolvedIp, geo.country || 'India', geo.city || null, geo.region || null, userAgent || null]
    ).catch(() => {});

    if (!user.welcome_email_sent) {
      sendWelcomeEmail({
        email: user.email,
        name: user.name,
        userId: user.id
      }).catch(err => console.warn('[Welcome Email] Dispatch error:', err.message));
    }

    const sanitizedUser = {
      id: user.firebase_uid || `usr_${user.id}`,
      dbId: user.id,
      name: user.name,
      email: user.email,
      picture: user.avatar_url || '',
      provider: user.auth_provider || 'email',
      hasPassword: true,
      dob: user.dob,
      city: user.city,
      location_tracking_enabled: user.location_tracking_enabled,
      joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
    };

    res.json({ success: true, user: sanitizedUser });
  } catch (err) {
    console.warn('Register password error:', err.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Request Password Reset Link (Sends 24-Hour Token via Hostinger SMTP, Max 1 Request Per 24 Hours)
app.post('/api/user/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const users = await query(
      'SELECT id, email, name, last_reset_request_at FROM users WHERE LOWER(email) = ?',
      [cleanEmail]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'No FreeSong account found with this email. Please check your email or create an account.',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    // Enforce 1 reset per 24 hours rate limit
    if (user.last_reset_request_at) {
      const lastRequestTime = new Date(user.last_reset_request_at).getTime();
      const now = Date.now();
      const diffHours = (now - lastRequestTime) / (1000 * 60 * 60);

      if (diffHours < 24) {
        const hoursRemaining = Math.max(1, Math.ceil(24 - diffHours));
        return res.status(429).json({
          error: `A password reset link was already sent today. For security, you can only request 1 reset link per 24 hours. Please check your inbox (including spam) or try again in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`,
          code: 'RATE_LIMIT_EXCEEDED',
          hoursRemaining
        });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 24 hours, update last_reset_request_at
    await query(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR), last_reset_request_at = NOW() WHERE id = ?',
      [token, user.id]
    );

    const mailResult = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email! Please check your inbox within 24 hours.',
      mailResult
    });
  } catch (err) {
    console.warn('Forgot password error:', err.message);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Verify Password Reset Token Validity
app.get('/api/user/verify-reset-token', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, error: 'Reset token is required' });

  try {
    const users = await query(
      'SELECT id, email, name FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
      [token]
    );

    if (!users || users.length === 0) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired password reset link (exceeded 24 hours)' });
    }

    const user = users[0];
    res.json({
      valid: true,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    console.warn('Verify reset token error:', err.message);
    res.status(500).json({ valid: false, error: 'Failed to verify token' });
  }
});

// Complete Password Reset (Sets new password using MD5 and clears token)
app.post('/api/user/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token) return res.status(400).json({ error: 'Reset token is required' });
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long', code: 'PASSWORD_TOO_SHORT' });
  }

  if (isEasyPassword(newPassword)) {
    return res.status(400).json({
      error: 'This password is too easy or common. Please choose a stronger password with letters and numbers.',
      code: 'EASY_PASSWORD'
    });
  }

  try {
    const users = await query(
      'SELECT id, email, name FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
      [token]
    );

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }

    const user = users[0];
    const md5Hash = hashPassword(newPassword);

    // Update password to MD5 and clear reset token
    await query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [md5Hash, user.id]
    );

    console.log(`[Password Reset] User ${user.email} successfully updated password via email reset token`);

    res.json({
      success: true,
      message: 'Password successfully updated! You can now log into FreeSong using your new password.'
    });
  } catch (err) {
    console.warn('Reset password error:', err.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Update User Profile (Name, Date of Birth, City, Location Tracking)
app.put('/api/user/profile', async (req, res) => {
  const { userId, email, name, dob, city, locationTracking } = req.body;
  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) return res.status(404).json({ error: 'User not found' });

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push((name || '').trim().slice(0, 25) || 'FreeSong Listener');
    }
    if (dob !== undefined) {
      updates.push('dob = ?');
      params.push(dob || null);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      params.push(city ? city.trim() : null);
    }
    if (locationTracking !== undefined) {
      updates.push('location_tracking_enabled = ?');
      params.push(locationTracking ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(resolvedUserId);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const users = await query('SELECT * FROM users WHERE id = ?', [resolvedUserId]);
    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.warn('Update profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Request Account Deletion (Sends 24-Hour Confirmation Link via Hostinger SMTP)
app.post('/api/user/request-delete', async (req, res) => {
  const { userId, email } = req.body;
  if (!email && !userId) return res.status(400).json({ error: 'Email or User ID is required' });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in system' });
    }

    const users = await query('SELECT id, email, name FROM users WHERE id = ?', [resolvedUserId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 24 hours
    await query(
      'UPDATE users SET deletion_token = ?, deletion_token_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id = ?',
      [token, user.id]
    );

    const mailResult = await sendAccountDeletionEmail({
      email: user.email,
      name: user.name,
      token
    });

    res.json({
      success: true,
      message: 'Account deletion confirmation email sent. Please check your inbox within 24 hours.',
      mailResult
    });
  } catch (err) {
    console.warn('Request delete error:', err.message);
    res.status(500).json({ error: 'Failed to initiate account deletion' });
  }
});

// Confirm Account Deletion (Permanently Erases User Data)
app.post('/api/user/confirm-delete', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Deletion token is required' });

  try {
    const users = await query(
      'SELECT id, email, name FROM users WHERE deletion_token = ? AND deletion_token_expires_at > NOW()',
      [token]
    );

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired deletion confirmation link (exceeded 24 hours)' });
    }

    const user = users[0];
    const targetUserId = user.id;

    // Permanently purge all associated records
    await query('DELETE FROM user_likes WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM user_play_history WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM user_playlists WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM user_playlist_songs WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM user_preferences WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM user_login_logs WHERE user_id = ?', [targetUserId]).catch(() => {});
    await query('DELETE FROM users WHERE id = ?', [targetUserId]);

    console.log(`[Account Purge] Successfully deleted user ID ${targetUserId} (${user.email})`);
    res.json({ success: true, message: 'Your FreeSong account and all associated data have been permanently deleted.' });
  } catch (err) {
    console.warn('Confirm delete error:', err.message);
    res.status(500).json({ error: 'Failed to complete account deletion' });
  }
});

// Play History: Save played song and enforce max 100 history limit
app.post('/api/user/history', async (req, res) => {
  const { userId, email, videoId, title, artist, album, thumbnail, duration, durationText, playedDuration } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId is required' });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const rawIp = getClientIp(req);
    const geo = await getIpGeo(rawIp);
    const resolvedIp = geo.ip || rawIp;

    // Delete older duplicate entry for this song so it moves to top and prevents duplicates
    await query('DELETE FROM user_play_history WHERE user_id = ? AND video_id = ?', [resolvedUserId, videoId]).catch(() => {});

    await query(`
      INSERT INTO user_play_history (
        user_id, video_id, title, artist, album, thumbnail,
        duration, duration_text, played_duration, ip_address, played_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      resolvedUserId,
      videoId,
      title || 'Unknown Title',
      artist || 'Unknown Artist',
      album || '',
      thumbnail || '',
      duration || 0,
      durationText || '',
      playedDuration || 0,
      resolvedIp
    ]);

    // Keep only the most recent 100 songs for this user
    await query(`
      DELETE FROM user_play_history
      WHERE user_id = ?
        AND id NOT IN (
          SELECT id FROM (
            SELECT id FROM user_play_history
            WHERE user_id = ?
            ORDER BY played_at DESC, id DESC
            LIMIT 100
          ) AS recent_tracks
        )
    `, [resolvedUserId, resolvedUserId]).catch(() => {});

    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('History save error:', err.message);
    res.status(500).json({ error: 'Failed to record play history' });
  }
});

// Play History: Batch sync local history to cloud MySQL
app.post('/api/user/history/batch', async (req, res) => {
  const { userId, email, songs } = req.body;
  if (!Array.isArray(songs) || songs.length === 0) {
    return res.json({ history: [] });
  }

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const rawIp = getClientIp(req);
    const geo = await getIpGeo(rawIp);
    const resolvedIp = geo.ip || rawIp;

    // Process in reverse (oldest first) so that newest song finishes with latest played_at
    const reversed = [...songs].reverse();
    for (const song of reversed) {
      if (!song?.videoId) continue;
      await query('DELETE FROM user_play_history WHERE user_id = ? AND video_id = ?', [resolvedUserId, song.videoId]).catch(() => {});
      const playedAt = song.playedAt ? new Date(song.playedAt) : new Date();
      await query(`
        INSERT INTO user_play_history (
          user_id, video_id, title, artist, album, thumbnail,
          duration, duration_text, played_duration, ip_address, played_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        resolvedUserId,
        song.videoId,
        song.title || 'Unknown Title',
        song.artist || 'Unknown Artist',
        song.album || '',
        song.thumbnail || '',
        song.duration || 0,
        song.durationText || '',
        song.playedDuration || 0,
        resolvedIp,
        playedAt
      ]).catch(() => {});
    }

    // Keep only the most recent 100 songs for this user
    await query(`
      DELETE FROM user_play_history
      WHERE user_id = ?
        AND id NOT IN (
          SELECT id FROM (
            SELECT id FROM user_play_history
            WHERE user_id = ?
            ORDER BY played_at DESC, id DESC
            LIMIT 100
          ) AS recent_tracks
        )
    `, [resolvedUserId, resolvedUserId]).catch(() => {});

    const history = await query(
      'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText, played_at as playedAt FROM user_play_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 100',
      [resolvedUserId]
    );

    res.json({ success: true, history });
  } catch (err) {
    console.warn('Batch history sync error:', err.message);
    res.status(500).json({ error: 'Failed to batch sync history' });
  }
});

// Play History: Get last 100 played songs
app.get('/api/user/:userId/history', async (req, res) => {
  const { userId } = req.params;
  try {
    const resolvedUserId = await resolveUserId(userId, req.query.email);
    if (!resolvedUserId) return res.json({ history: [] });

    const history = await query(
      'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText, played_at as playedAt FROM user_play_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 100',
      [resolvedUserId]
    );
    res.json({ history });
  } catch (err) {
    res.status(500).json({ history: [] });
  }
});

// Play History: Clear all history
app.delete('/api/user/history', async (req, res) => {
  const { userId, email } = req.body;
  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    await query('DELETE FROM user_play_history WHERE user_id = ?', [resolvedUserId]);
    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('Clear history error:', err.message);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Play History: Remove single track
app.delete('/api/user/history/item', async (req, res) => {
  const { userId, email, videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId is required' });
  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    await query('DELETE FROM user_play_history WHERE user_id = ? AND video_id = ?', [resolvedUserId, videoId]);
    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('Remove history item error:', err.message);
    res.status(500).json({ error: 'Failed to remove history item' });
  }
});

// User Likes: Get, Add, Remove
app.get('/api/user/:userId/likes', async (req, res) => {
  const { userId } = req.params;
  try {
    const resolvedUserId = await resolveUserId(userId, req.query.email);
    if (!resolvedUserId) return res.json({ likes: [] });

    const likes = await query(
      'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText, created_at as likedAt FROM user_likes WHERE user_id = ? ORDER BY created_at DESC',
      [resolvedUserId]
    );
    res.json({ likes });
  } catch (err) {
    res.status(500).json({ likes: [] });
  }
});

app.post('/api/user/likes', async (req, res) => {
  const { userId, email, videoId, title, artist, album, thumbnail, duration, durationText } = req.body;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    await query(`
      INSERT INTO user_likes (user_id, video_id, title, artist, album, thumbnail, duration, duration_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE created_at = NOW()
    `, [
      resolvedUserId,
      videoId,
      title || 'Unknown Title',
      artist || 'Unknown Artist',
      album || '',
      thumbnail || '',
      duration || 0,
      durationText || ''
    ]);

    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('Like save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user/likes', async (req, res) => {
  const { userId, email, videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    await query('DELETE FROM user_likes WHERE user_id = ? AND video_id = ?', [resolvedUserId, videoId]);
    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('Like delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Batch Sync Likes (Syncs all local liked songs to Hostinger MySQL in one go)
app.post('/api/user/likes/batch', async (req, res) => {
  const { userId, email, songs } = req.body;
  if (!Array.isArray(songs) || songs.length === 0) {
    return res.json({ success: true, count: 0, likes: [] });
  }

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    for (const s of songs) {
      if (!s?.videoId) continue;
      await query(`
        INSERT INTO user_likes (user_id, video_id, title, artist, album, thumbnail, duration, duration_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          artist = VALUES(artist),
          thumbnail = VALUES(thumbnail)
      `, [
        resolvedUserId,
        s.videoId,
        s.title || 'Unknown Title',
        s.artist || 'Unknown Artist',
        s.album || '',
        s.thumbnail || '',
        s.duration || 0,
        s.durationText || ''
      ]);
    }

    const allLikes = await query(
      'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText, created_at as likedAt FROM user_likes WHERE user_id = ? ORDER BY created_at DESC',
      [resolvedUserId]
    );

    res.json({ success: true, count: allLikes.length, likes: allLikes });
  } catch (err) {
    console.warn('Batch likes sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// User Playlists: Get and Sync
app.get('/api/user/:userId/playlists', async (req, res) => {
  const { userId } = req.params;
  try {
    const resolvedUserId = await resolveUserId(userId, req.query.email);
    if (!resolvedUserId) return res.json({ playlists: [] });

    const playlists = await query(
      'SELECT id, name, description, is_public as isPublic, cover_url as coverUrl, created_at as createdAt FROM user_playlists WHERE user_id = ? ORDER BY id DESC',
      [resolvedUserId]
    );

    const fullPlaylists = await Promise.all(playlists.map(async (pl) => {
      const songs = await query(
        'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText FROM user_playlist_songs WHERE playlist_id = ? ORDER BY sort_order ASC, id ASC',
        [pl.id]
      );
      const firstThumb = songs[0]?.thumbnail || (songs[0]?.videoId ? `https://i.ytimg.com/vi/${songs[0].videoId}/hqdefault.jpg` : null);
      return {
        id: `pl-${pl.id}`,
        name: pl.name,
        title: pl.name,
        description: pl.description || '',
        coverImage: pl.coverUrl || firstThumb || null,
        coverUrl: pl.coverUrl || firstThumb || null,
        tracksCount: songs ? songs.length : 0,
        songs: songs || []
      };
    }));

    res.json({ playlists: fullPlaylists });
  } catch (err) {
    console.warn('Get playlists error:', err.message);
    res.status(500).json({ playlists: [] });
  }
});

app.post('/api/user/playlists/sync', async (req, res) => {
  const { userId, email, playlists } = req.body;
  if (!Array.isArray(playlists)) return res.json({ success: true, playlists: [] });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) return res.status(404).json({ error: 'User not found in database' });

    for (const pl of playlists) {
      if (!pl?.name) continue;
      const existing = await query('SELECT id FROM user_playlists WHERE user_id = ? AND name = ?', [resolvedUserId, pl.name]);
      let playlistId;
      if (existing && existing.length > 0) {
        playlistId = existing[0].id;
        if (pl.coverImage || pl.coverUrl || pl.description) {
          await query('UPDATE user_playlists SET description = COALESCE(?, description), cover_url = COALESCE(?, cover_url) WHERE id = ?', [
            pl.description || null, pl.coverImage || pl.coverUrl || null, playlistId
          ]).catch(() => {});
        }
      } else {
        const insertRes = await query(
          'INSERT INTO user_playlists (user_id, name, description, cover_url, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [resolvedUserId, pl.name, pl.description || '', pl.coverImage || pl.coverUrl || null]
        );
        playlistId = insertRes.insertId;
      }

      if (Array.isArray(pl.songs) && pl.songs.length > 0) {
        for (let i = 0; i < pl.songs.length; i++) {
          const s = pl.songs[i];
          if (!s?.videoId) continue;
          await query(`
            INSERT INTO user_playlist_songs (playlist_id, video_id, title, artist, album, thumbnail, duration, duration_text, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order), title = VALUES(title), artist = VALUES(artist), thumbnail = VALUES(thumbnail)
          `, [
            playlistId, s.videoId, s.title || '', s.artist || '', s.album || '', s.thumbnail || '', s.duration || 0, s.durationText || '', i
          ]).catch(() => {});
        }
      }
    }

    const dbPlaylists = await query(
      'SELECT id, name, description, is_public as isPublic, cover_url as coverUrl FROM user_playlists WHERE user_id = ? ORDER BY id DESC',
      [resolvedUserId]
    );

    const fullPlaylists = await Promise.all(dbPlaylists.map(async (pl) => {
      const songs = await query(
        'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText FROM user_playlist_songs WHERE playlist_id = ? ORDER BY sort_order ASC, id ASC',
        [pl.id]
      );
      const firstThumb = songs[0]?.thumbnail || (songs[0]?.videoId ? `https://i.ytimg.com/vi/${songs[0].videoId}/hqdefault.jpg` : null);
      return {
        id: `pl-${pl.id}`,
        name: pl.name,
        title: pl.name,
        description: pl.description || '',
        coverImage: pl.coverUrl || firstThumb || null,
        coverUrl: pl.coverUrl || firstThumb || null,
        tracksCount: songs ? songs.length : 0,
        songs: songs || []
      };
    }));

    res.json({ success: true, count: fullPlaylists.length, playlists: fullPlaylists });
  } catch (err) {
    console.warn('Sync playlists error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── User Preferences Endpoints ───────────────────────────────────────────────

app.get('/api/user/:userId/preferences', async (req, res) => {
  const { userId } = req.params;
  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) return res.json({ preferences: null });

    const rows = await query('SELECT * FROM user_preferences WHERE user_id = ?', [resolvedUserId]);
    if (rows.length === 0) return res.json({ preferences: null });

    const p = rows[0];
    let genres = [];
    let artists = [];
    if (Array.isArray(p.selected_genres)) {
      genres = p.selected_genres;
    } else {
      try { genres = JSON.parse(p.selected_genres || '[]'); } catch { genres = []; }
    }
    if (Array.isArray(p.selected_artists)) {
      artists = p.selected_artists;
    } else {
      try { artists = JSON.parse(p.selected_artists || '[]'); } catch { artists = []; }
    }

    res.json({
      preferences: {
        genres,
        artists,
        volume: Number(p.volume || 0.8),
        theme: p.theme || 'amoled-black',
        autoplay: Boolean(p.autoplay),
        updatedAt: p.updated_at
      }
    });
  } catch (err) {
    console.warn('Get preferences error:', err.message);
    res.status(500).json({ preferences: null });
  }
});

app.post('/api/user/preferences', async (req, res) => {
  const { userId, email, genres, artists, volume, theme, autoplay } = req.body;

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const genresJson = JSON.stringify(Array.isArray(genres) ? genres : []);
    const artistsJson = JSON.stringify(Array.isArray(artists) ? artists : []);
    const vol = typeof volume === 'number' ? volume : 0.8;
    const thm = theme || 'amoled-black';
    const auto = autoplay !== undefined ? (autoplay ? 1 : 0) : 1;

    await query(`
      INSERT INTO user_preferences (user_id, selected_genres, selected_artists, volume, theme, autoplay, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        selected_genres = VALUES(selected_genres),
        selected_artists = VALUES(selected_artists),
        volume = VALUES(volume),
        theme = VALUES(theme),
        autoplay = VALUES(autoplay),
        updated_at = NOW()
    `, [resolvedUserId, genresJson, artistsJson, vol, thm, auto]);

    res.json({ success: true, userId: resolvedUserId });
  } catch (err) {
    console.warn('Save preferences error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Custom Playlists Endpoints ───────────────────────────────────────────────

app.get('/api/user/:userId/playlists', async (req, res) => {
  const { userId } = req.params;
  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) return res.json({ playlists: [] });

    const playlists = await query(
      'SELECT id, name, description, is_public as isPublic, cover_url as coverImage, created_at as createdAt, updated_at as updatedAt FROM user_playlists WHERE user_id = ? ORDER BY id DESC',
      [resolvedUserId]
    );

    const fullPlaylists = [];
    for (const pl of playlists) {
      const songs = await query(
        'SELECT video_id as videoId, title, artist, album, thumbnail, duration, duration_text as durationText FROM user_playlist_songs WHERE playlist_id = ? ORDER BY sort_order ASC, id ASC',
        [pl.id]
      );
      fullPlaylists.push({
        id: `pl-${pl.id}`,
        dbId: pl.id,
        name: pl.name,
        description: pl.description || '',
        coverImage: pl.coverImage,
        tracksCount: songs.length,
        songs,
        updatedAt: 'Just now'
      });
    }

    res.json({ playlists: fullPlaylists });
  } catch (err) {
    console.warn('Get playlists error:', err.message);
    res.status(500).json({ playlists: [] });
  }
});

app.post('/api/user/playlists/sync', async (req, res) => {
  const { userId, email, playlists } = req.body;
  if (!Array.isArray(playlists)) return res.status(400).json({ error: 'Playlists array required' });

  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    for (const pl of playlists) {
      if (!pl.name) continue;
      let plId = pl.dbId;
      if (!plId) {
        const existing = await query('SELECT id FROM user_playlists WHERE user_id = ? AND name = ? LIMIT 1', [resolvedUserId, pl.name.trim()]);
        if (existing.length > 0) {
          plId = existing[0].id;
        } else {
          const insertRes = await query(
            'INSERT INTO user_playlists (user_id, name, description, cover_url, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [resolvedUserId, pl.name.trim(), pl.description || '', pl.coverImage || null]
          );
          plId = insertRes.insertId;
        }
      }

      if (plId && Array.isArray(pl.songs)) {
        await query('DELETE FROM user_playlist_songs WHERE playlist_id = ?', [plId]);
        for (let i = 0; i < pl.songs.length; i++) {
          const s = pl.songs[i];
          if (!s?.videoId) continue;
          await query(`
            INSERT INTO user_playlist_songs (playlist_id, video_id, title, artist, album, thumbnail, duration, duration_text, sort_order, added_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            plId,
            s.videoId,
            s.title || 'Unknown Title',
            s.artist || 'Unknown Artist',
            s.album || '',
            s.thumbnail || '',
            s.duration || 0,
            s.durationText || '',
            i
          ]);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.warn('Playlist sync error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin / Verification endpoint to test welcome email delivery
app.all('/api/admin/test-welcome-email', async (req, res) => {
  const email = req.body?.email || req.query?.email;
  const name = req.body?.name || req.query?.name;
  const force = req.body?.force !== undefined ? req.body.force : (req.query?.force !== 'false');

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const result = await sendWelcomeEmail({
      email,
      name: name || 'Music Lover',
      force
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static frontend assets built by Vite in production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: any non-API GET request serves index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`FreeSong.in API server running on port ${PORT}`);
  testDbConnection();
});
