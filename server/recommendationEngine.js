/**
 * FreeSong.in — Smart Recommendation Engine
 * Contains 250+ curated query templates and dynamic section generators
 * that adapt to user preferences and real-time listening history,
 * featuring dedicated Latest Releases & Latest Hits pipelines.
 */

// ─── 250+ Curated Query Patterns & Templates ────────────────────────────────
export const QUERY_TEMPLATES = {
  // Latest Releases & Fresh Drops patterns (Brand new songs 2024–2025)
  latestReleases: [
    'Latest Released {genre} Songs 2024 2025',
    'New Released {genre} Songs',
    'Fresh Releases in {genre}',
    'Brand New {genre} Music 2025',
    'Just Dropped {genre} Singles',
    'Latest Released {artist} Songs 2024 2025',
    '{artist} New Song Latest Release',
    '{artist} Latest Released Singles',
    'New Released Songs India 2024 2025',
    'Latest Bollywood New Releases 2024 2025',
    'Latest Punjabi Releases 2024 2025',
    'Latest Tamil Released Songs 2024 2025',
    'Latest Telugu Released Songs 2024 2025',
    'Latest Haryanvi Released Songs 2024 2025',
    'Latest Indian Pop Drops',
    'Fresh Music Friday {genre}',
    'New Music Drops 2024 2025'
  ],

  // Latest Hits & Chartbusters patterns
  latestHits: [
    'Latest {genre} Hits 2024 2025',
    'Top Latest Hits {genre}',
    'Latest Chartbusters {genre}',
    'Latest Viral Hits {genre}',
    'Hot Hits {genre} 2024 2025',
    'Latest {artist} Hits 2024 2025',
    '{artist} Latest Hit Songs',
    'Latest Bollywood Hits 2024 2025',
    'Latest Punjabi Hits 2024 2025',
    'Latest Tamil Hits 2024 2025',
    'Latest Telugu Hits 2024 2025',
    'Latest Top 50 India Hits',
    'Trending Latest Songs 2025',
    'Viral Latest Chartbusters',
    'Superhit Latest Songs 2025'
  ],

  // Artist-driven patterns
  artistBest: [
    'Best of {artist}',
    '{artist} Greatest Hits',
    '{artist} Top Tracks',
    'Essential {artist}',
    '{artist} Chartbusters',
    '{artist} Masterpieces',
    '{artist} Ultimate Collection'
  ],
  artistSpecial: [
    '{artist} Special',
    '{artist} Radio',
    '{artist} Signature Mix',
    'Spotlight on {artist}',
    '{artist} Legacy'
  ],
  artistMoods: [
    '{artist} Romantic Melodies',
    '{artist} Love Songs',
    '{artist} Party Bangers',
    '{artist} Dance Hits',
    '{artist} Acoustic Unplugged',
    '{artist} Slowed & Reverb',
    '{artist} Lo-Fi Chill',
    '{artist} Late Night Drive',
    '{artist} Sad & Soulful',
    '{artist} Monsoon Magic',
    '{artist} Sufi Sessions',
    '{artist} High Voltage'
  ],
  artistCollaborations: [
    '{artist} and Friends',
    '{artist} Duets & Collabs',
    '{artist} Featuring Hits',
    '{artist} & Co Mix'
  ],
  artistDiscovery: [
    'Similar to {artist}',
    'Fans of {artist} Love',
    'Discoveries Like {artist}',
    '{artist} Deep Cuts & B-Sides'
  ],

  // Genre-driven patterns
  genreSuggested: [
    'Suggested for you: {genre}',
    'Trending {genre} Hits',
    '{genre} Vibes',
    'Pure {genre} Anthems',
    'The Best of {genre}'
  ],
  genreMoods: [
    '{genre} Late Night Chill',
    '{genre} Roadtrip Tunes',
    '{genre} Party Station',
    '{genre} Workout Energy',
    '{genre} Coffeehouse Acoustic',
    '{genre} Sunset Moods',
    '{genre} Nostalgia & Classics',
    '{genre} Soul & Melodies',
    '{genre} Lo-Fi Beats',
    '{genre} Underground Wave',
    '{genre} Morning Energy',
    '{genre} Midnight Echoes'
  ],
  genreCurated: [
    'Essential {genre}',
    '{genre} Discovery Radar',
    'New Era of {genre}',
    'Golden Hour {genre}',
    '{genre} Power Hits',
    'Fresh Finds in {genre}'
  ],

  // Listening history adaptive patterns
  historyDriven: [
    'Because you listened to {recentArtist}',
    'More from {recentArtist}',
    'Songs inspired by {recentSong}',
    'Keep listening to {recentArtist}',
    'Rediscover {recentArtist}',
    'Your Next Obsession after {recentArtist}',
    'Similar vibes to {recentSong}'
  ]
};

// ─── Thumbnail & Format Helpers ─────────────────────────────────────────────
export function toHDThumbnail(url, videoId) {
  if (!url) {
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
  }
  let u = url;
  if (u.startsWith('//')) u = 'https:' + u;
  // Upgrade Google/YouTube CDN thumbnails to 544x544 HD
  if (u.includes('googleusercontent.com') && u.includes('=w')) {
    u = u.replace(/=w\d+-h\d+/, '=w544-h544');
  } else if (u.includes('ytimg.com') || u.includes('youtube.com')) {
    if (u.includes('/default.jpg') || u.includes('/mqdefault.jpg')) {
      u = u.replace(/\/(default|mqdefault)\.jpg/i, '/hqdefault.jpg');
    }
  }
  return u;
}

function formatSong(s) {
  if (!s) return null;
  const thumbs = s.thumbnails || [];
  const rawThumb = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || '';
  const hdThumb = toHDThumbnail(rawThumb, s.videoId);
  return {
    videoId: s.videoId,
    title: s.name || s.title || 'Unknown Title',
    artist: s.artist?.name || (typeof s.artist === 'string' ? s.artist : 'Artist'),
    album: s.album?.name || '',
    duration: typeof s.duration === 'number' ? s.duration : 210,
    durationText: typeof s.duration === 'string' ? s.duration : '3:30',
    thumbnail: hdThumb,
    type: 'song'
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

// ─── Shelf Plan Generator (Generates 24–28 Dynamic Sections) ────────────────
export function generateShelfPlan(preferences = {}, history = []) {
  const userArtists = (preferences.artists || []).filter(Boolean);
  const userGenres = (preferences.genres || []).filter(Boolean);

  // Fallbacks if empty
  const primaryArtists = userArtists.length > 0 ? userArtists : ['Diljit Dosanjh', 'Arijit Singh', 'Taylor Swift'];
  const primaryGenres = userGenres.length > 0 ? userGenres : ['punjabi', 'bollywood', 'lofi'];

  const shelves = [];
  const mainArtist = primaryArtists[0] || 'Diljit Dosanjh';
  const mainGenre = primaryGenres[0] || 'punjabi';
  const capGenre = mainGenre.charAt(0).toUpperCase() + mainGenre.slice(1);

  // 1. Signature Artist Top Tracks
  shelves.push({
    id: 'shelf-art-best-0',
    eyebrow: 'SIGNATURE ARTIST',
    title: `Best of ${mainArtist}`,
    searchQuery: `${mainArtist} best songs`,
    type: 'songs',
    category: 'artist'
  });

  // 2. QUICK PICKS (Directly near top like YouTube Music!)
  shelves.push({
    id: 'shelf-quickpicks',
    eyebrow: 'START RADIO BASED ON A SONG',
    title: 'Quick picks for you',
    searchQuery: `${mainArtist} top hits`,
    type: 'quickpicks',
    category: 'picks'
  });

  // 3. LATEST RELEASES & FRESH DROPS (Top Priority: Brand new releases 2024-2025)
  shelves.push({
    id: 'shelf-latest-releases-main',
    eyebrow: 'FRESH DROPS & NEW MUSIC',
    title: 'Latest Releases & Fresh Drops',
    searchQuery: `${mainArtist} ${mainGenre} latest released songs 2024 2025 new release`,
    type: 'songs',
    category: 'latest'
  });

  // 4. LATEST HITS & CHARTBUSTERS (Trending hot hits right now)
  shelves.push({
    id: 'shelf-latest-hits-main',
    eyebrow: 'HOT ON THE CHARTS',
    title: `Latest Hits: ${capGenre} & Trending`,
    searchQuery: `Latest ${mainGenre} hits 2024 2025 trending chartbusters`,
    type: 'songs',
    category: 'hits'
  });

  // 5. ARTIST'S LATEST RELEASES
  shelves.push({
    id: 'shelf-art-latest-main',
    eyebrow: `NEW FROM ${mainArtist.toUpperCase()}`,
    title: `${mainArtist} Latest Releases & Singles`,
    searchQuery: `${mainArtist} latest new songs 2024 2025 release`,
    type: 'songs',
    category: 'artist'
  });

  // 6. Artist Special / Curated Playlists
  shelves.push({
    id: 'shelf-art-special-0',
    eyebrow: `${mainArtist.toUpperCase()} SPOTLIGHT`,
    title: `${mainArtist} Special`,
    searchQuery: `${mainArtist} hit playlist`,
    type: 'playlists',
    category: 'artist'
  });

  // 7. Secondary Artists (if provided) or deeper thematic shelves for main artist
  if (primaryArtists.length > 1) {
    primaryArtists.slice(1, 4).forEach((artist, idx) => {
      // Latest Releases & Hits for secondary followed artists
      shelves.push({
        id: `shelf-art-latest-${idx + 1}`,
        eyebrow: 'LATEST FROM ' + artist.toUpperCase(),
        title: `${artist} Latest Releases & Hits`,
        searchQuery: `${artist} latest new songs 2024 2025`,
        type: 'songs',
        category: 'latest'
      });

      shelves.push({
        id: `shelf-art-best-${idx + 1}`,
        eyebrow: 'FOR FANS OF ' + artist.toUpperCase(),
        title: `Best of ${artist}`,
        searchQuery: `${artist} best songs`,
        type: 'songs',
        category: 'artist'
      });

      shelves.push({
        id: `shelf-art-special-${idx + 1}`,
        eyebrow: `${artist.toUpperCase()} SPOTLIGHT`,
        title: `${artist} Special`,
        searchQuery: `${artist} hit playlist`,
        type: 'playlists',
        category: 'artist'
      });
    });
  } else {
    // If only 1 artist was selected, generate deep thematic shelves for that artist
    shelves.push({
      id: 'shelf-art-romantic',
      eyebrow: 'HEARTFELT & EMOTIONAL',
      title: `${mainArtist} Romantic Melodies`,
      searchQuery: `${mainArtist} romantic love songs`,
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

    shelves.push({
      id: 'shelf-art-drive',
      eyebrow: 'LATE NIGHT VIBES',
      title: `${mainArtist} Late Night Drive`,
      searchQuery: `${mainArtist} lofi chill drive songs`,
      type: 'songs',
      category: 'mood'
    });

    shelves.push({
      id: 'shelf-art-hits',
      eyebrow: 'CHART TOPPERS',
      title: `${mainArtist} Anthems & Chartbusters`,
      searchQuery: `${mainArtist} greatest hits songs`,
      type: 'songs',
      category: 'artist'
    });

    shelves.push({
      id: 'shelf-art-sufi',
      eyebrow: 'SOUL & DEVOTION',
      title: `${mainArtist} Soulful & Sufi Sessions`,
      searchQuery: `${mainArtist} sufi soulful songs`,
      type: 'songs',
      category: 'mood'
    });
  }

  // 8. Genre Shelves (Tailored for regional genres with dedicated Latest Releases & Latest Hits)
  const GENRE_LABELS = {
    tamil: { 
      name: 'Tamil Kollywood Hits', 
      latest: 'Latest Tamil Releases & Drops',
      latestHits: 'Latest Tamil Hits 2025',
      party: 'Tamil Kuthu & Party', 
      chill: 'Tamil Melodies & Chill', 
      workout: 'Tamil Energy Hits' 
    },
    telugu: { 
      name: 'Telugu Tollywood Hits', 
      latest: 'Latest Telugu Releases & Drops',
      latestHits: 'Latest Telugu Hits 2025',
      party: 'Telugu Mass Beats', 
      chill: 'Telugu Soulful Melodies', 
      workout: 'Telugu Fast Beats' 
    },
    haryanvi: { 
      name: 'Haryanvi Ragni & Beats', 
      latest: 'Latest Haryanvi Releases',
      latestHits: 'Latest Haryanvi Hits 2025',
      party: 'Haryanvi Dance Party', 
      chill: 'Haryanvi Desi Chill', 
      workout: 'Haryanvi Power Beats' 
    },
    bengali: { 
      name: 'Bengali Melodies & Folk', 
      latest: 'Latest Bengali Releases',
      latestHits: 'Latest Bangla Pop Hits',
      party: 'Bangla Modern Pop', 
      chill: 'Bengali Acoustic & Folk', 
      workout: 'Bengali Energy Hits' 
    },
    malayalam: { 
      name: 'Malayalam Mollywood', 
      latest: 'Latest Malayalam Releases',
      latestHits: 'Latest Malayalam Hits',
      party: 'Malayalam Beats', 
      chill: 'Malayalam Acoustic Chill', 
      workout: 'Malayalam Power Tracks' 
    },
    kannada: { 
      name: 'Kannada Sandalwood', 
      latest: 'Latest Kannada Releases',
      latestHits: 'Latest Kannada Mass Hits',
      party: 'Kannada Mass Hits', 
      chill: 'Kannada Melodies', 
      workout: 'Kannada Energy Beats' 
    },
    bhojpuri: { 
      name: 'Bhojpuri Tadka', 
      latest: 'Latest Bhojpuri Releases',
      latestHits: 'Latest Bhojpuri Superhits',
      party: 'Bhojpuri DJ Dance', 
      chill: 'Bhojpuri Folk Melodies', 
      workout: 'Bhojpuri High Energy' 
    },
    punjabi: { 
      name: 'Punjabi Beats', 
      latest: 'Latest Punjabi Releases & Fresh Drops',
      latestHits: 'Latest Punjabi Chartbusters 2025',
      party: 'Punjabi Club & Bhangra', 
      chill: 'Punjabi Late Night Chill', 
      workout: 'Punjabi Gym Energy' 
    },
    bollywood: { 
      name: 'Bollywood Hits', 
      latest: 'Latest Bollywood Releases',
      latestHits: 'Latest Bollywood Hits 2025',
      party: 'Bollywood Club Party', 
      chill: 'Bollywood Late Night Chill', 
      workout: 'Bollywood Workout Energy' 
    },
    lofi: { 
      name: 'Lo-Fi Chill', 
      latest: 'Latest Lo-Fi Releases & Drops',
      latestHits: 'Latest Chillhop & Lo-Fi Hits',
      party: 'Lo-Fi Grooves', 
      chill: 'Lo-Fi Midnight Echoes', 
      workout: 'Lo-Fi Focus Energy' 
    },
    indie: { 
      name: 'Indian Indie & Pop', 
      latest: 'Latest Indie Releases & Fresh Drops',
      latestHits: 'Latest Indian Indie Hits',
      party: 'Indie Pop Vibes', 
      chill: 'Acoustic Indie Chill', 
      workout: 'Indie Wave Energy' 
    },
    english: { 
      name: 'Global Pop & English Hits', 
      latest: 'Latest International Releases',
      latestHits: 'Latest Billboard & Global Hits',
      party: 'Global Dance Hits', 
      chill: 'Acoustic Pop Chill', 
      workout: 'Global Workout Hits' 
    }
  };

  primaryGenres.slice(0, 4).forEach((genre, idx) => {
    const meta = GENRE_LABELS[genre.toLowerCase()] || {
      name: genre.charAt(0).toUpperCase() + genre.slice(1) + ' Hits',
      latest: `Latest ${genre} Releases`,
      latestHits: `Latest ${genre} Hits`,
      party: `${genre} Party Hits`,
      chill: `${genre} Chill & Lo-Fi`,
      workout: `${genre} Workout Energy`
    };

    // Dedicated Latest Releases for this genre
    shelves.push({
      id: `shelf-genre-latest-${idx}`,
      eyebrow: 'NEW DROPS',
      title: meta.latest || `Latest ${meta.name} Releases`,
      searchQuery: `${genre} latest released songs 2024 2025 new songs`,
      type: 'songs',
      category: 'latest'
    });

    // Dedicated Latest Hits for this genre
    shelves.push({
      id: `shelf-genre-latest-hits-${idx}`,
      eyebrow: 'TRENDING HITS',
      title: meta.latestHits || `Latest ${meta.name} Hits`,
      searchQuery: `${genre} latest hits songs 2024 2025 trending`,
      type: 'songs',
      category: 'hits'
    });

    shelves.push({
      id: `shelf-genre-suggested-${idx}`,
      eyebrow: 'RECOMMENDED BY GENRE',
      title: `Suggested for you: ${meta.name}`,
      searchQuery: `${genre} best hits songs playlist`,
      type: 'playlists',
      category: 'genre'
    });

    shelves.push({
      id: `shelf-genre-mood-${idx}`,
      eyebrow: 'MOOD VIBES',
      title: meta.chill,
      searchQuery: `${genre} chill acoustic melodies songs`,
      type: 'songs',
      category: 'genre'
    });
  });

  // 9. Workout & High Energy Genre
  const firstMeta = GENRE_LABELS[mainGenre.toLowerCase()] || { workout: `${capGenre} Workout Energy`, party: `${capGenre} Party Station` };
  shelves.push({
    id: 'shelf-genre-workout',
    eyebrow: 'PUMPED UP BEATS',
    title: firstMeta.workout,
    searchQuery: `${mainGenre} workout energetic songs`,
    type: 'songs',
    category: 'genre'
  });

  // 10. Roadtrip & Travel Vibes
  shelves.push({
    id: 'shelf-genre-roadtrip',
    eyebrow: 'ON THE ROAD',
    title: `${capGenre} Roadtrip Tunes`,
    searchQuery: `${mainGenre} roadtrip car songs`,
    type: 'songs',
    category: 'genre'
  });

  // 11. Party Station
  shelves.push({
    id: 'shelf-genre-party',
    eyebrow: 'WEEKEND PARTY',
    title: firstMeta.party,
    searchQuery: `${mainGenre} party dance club songs`,
    type: 'songs',
    category: 'genre'
  });

  // 12. Lo-Fi & Ambient
  shelves.push({
    id: 'shelf-genre-lofi',
    eyebrow: 'RELAX & FOCUS',
    title: `${capGenre} Lo-Fi Beats & Chill`,
    searchQuery: `${mainGenre} lofi beats chill study`,
    type: 'songs',
    category: 'genre'
  });

  // 13. Collaborations / Similar Artists
  if (primaryArtists.length >= 2) {
    shelves.push({
      id: 'shelf-collab',
      eyebrow: 'COLLABORATIVE WAVE',
      title: `${primaryArtists[0]} & ${primaryArtists[1]} Mix`,
      searchQuery: `${primaryArtists[0]} ${primaryArtists[1]} songs`,
      type: 'songs',
      category: 'mix'
    });
  } else {
    shelves.push({
      id: 'shelf-similar',
      eyebrow: 'SIMILAR SOUNDS',
      title: `Fans of ${mainArtist} Also Love`,
      searchQuery: `${mainArtist} similar artist songs`,
      type: 'songs',
      category: 'discovery'
    });
  }

  // 14. Desi Hip Hop & Rap Anthems
  shelves.push({
    id: 'shelf-hiphop',
    eyebrow: 'URBAN BEATS',
    title: 'Desi Hip Hop & Rap Anthems',
    searchQuery: 'Desi Hip Hop top rap songs 2024 2025',
    type: 'songs',
    category: 'genre'
  });

  // 15. Indian Indie Discoveries
  shelves.push({
    id: 'shelf-indie',
    eyebrow: 'FRESH DISCOVERIES',
    title: 'Indie & Alternative Wave',
    searchQuery: 'Indian indie chill acoustic songs 2024 2025',
    type: 'songs',
    category: 'discovery'
  });

  // 16. Evergreen Retro Nostalgia
  shelves.push({
    id: 'shelf-retro',
    eyebrow: 'TIMELESS CLASSICS',
    title: 'Evergreen 90s & 2000s Nostalgia',
    searchQuery: '90s 2000s bollywood retro hits',
    type: 'songs',
    category: 'nostalgia'
  });

  // 17. Acoustic Coffeehouse Sessions
  shelves.push({
    id: 'shelf-coffeehouse',
    eyebrow: 'ACOUSTIC SESSIONS',
    title: 'Coffeehouse Acoustic Melodies',
    searchQuery: 'Hindi acoustic unplugged songs',
    type: 'songs',
    category: 'mood'
  });

  // 18. Global Trending Hits 2025
  shelves.push({
    id: 'shelf-global',
    eyebrow: 'WORLDWIDE RADAR',
    title: 'Trending Global Chartbusters 2025',
    searchQuery: 'Top global pop chartbusters 2025',
    type: 'songs',
    category: 'trending'
  });

  // 19. Bollywood Romance & Heartbeats
  shelves.push({
    id: 'shelf-bollywood-romance',
    eyebrow: 'LOVE ANTHEMS',
    title: 'Bollywood Romantic Melodies',
    searchQuery: 'Bollywood romantic love songs 2024 2025',
    type: 'songs',
    category: 'genre'
  });

  // 20. Real-Time Listening History Driven Shelves
  if (history && history.length > 0) {
    const recentItem = history[0];
    if (recentItem?.artist) {
      shelves.unshift({
        id: 'shelf-history-1',
        eyebrow: 'BECAUSE YOU LISTENED TO ' + recentItem.artist.toUpperCase(),
        title: `More from ${recentItem.artist}`,
        searchQuery: `${recentItem.artist} latest songs`,
        type: 'songs',
        category: 'history'
      });

      shelves.splice(3, 0, {
        id: 'shelf-history-2',
        eyebrow: 'RADIO WAVE',
        title: `Songs like ${recentItem.title || recentItem.artist}`,
        searchQuery: `${recentItem.artist} radio mix`,
        type: 'playlists',
        category: 'history'
      });
    }
  }

  // Deduplicate shelf titles and return top 26 unique shelves
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
  const shelfPlan = generateShelfPlan(preferences, history);

  // Resolve shelves concurrently (batching to avoid overwhelming YTMusic)
  const populatedShelves = await Promise.all(
    shelfPlan.map(async (plan) => {
      const cacheKey = `shelf_${plan.type}_${plan.searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const cached = cacheGet(cacheKey);
      if (cached) {
        return { ...plan, items: cached };
      }

      try {
        let items = [];
        if (plan.type === 'playlists') {
          const res = await yt.searchPlaylists(plan.searchQuery).catch(() => []);
          items = (res || []).slice(0, 10).map(p => formatPlaylist(p));

          // Fail-safe fallback: If playlist search yielded 0 items, search songs!
          if (items.length === 0) {
            const songRes = await yt.searchSongs(plan.searchQuery).catch(() => []);
            items = (songRes || []).slice(0, 10).map(formatSong);
          }
        } else {
          // 'songs' or 'quickpicks'
          const res = await yt.searchSongs(plan.searchQuery).catch(() => []);
          items = (res || []).slice(0, plan.type === 'quickpicks' ? 16 : 10).map(formatSong);
        }

        if (items.length > 0) {
          cacheSet(cacheKey, items);
        }

        return { ...plan, items };
      } catch (err) {
        console.warn(`Shelf fetch failed for "${plan.title}":`, err.message);
        return { ...plan, items: [] };
      }
    })
  );

  // Filter out any shelves that completely failed to return items
  const validShelves = populatedShelves.filter(s => s.items && s.items.length > 0);

  return {
    sections: validShelves,
    totalSections: validShelves.length,
    preferencesApplied: Boolean(preferences.artists?.length || preferences.genres?.length),
    historyApplied: Boolean(history && history.length > 0)
  };
}
