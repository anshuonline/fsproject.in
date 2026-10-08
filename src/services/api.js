const API_BASE = '/api';

export const api = {
  async getHomeFeed(prefs = null, history = null) {
    try {
      let url = `${API_BASE}/home`;
      const params = new URLSearchParams();
      if (prefs?.genres?.length) params.set('genres', prefs.genres.join(','));
      if (prefs?.artists?.length) params.set('artists', prefs.artists.map(a => typeof a === 'string' ? a : a.name).join(','));
      if (history?.length) params.set('history', JSON.stringify(history.slice(0, 5)));
      params.set('_t', Date.now().toString());

      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API error, using fallback:', err);
      return { sections: [] };
    }
  },

  async search(query, type = 'all', limit = 20) {
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Search API error:', err);
      return { songs: [], albums: [], playlists: [], artists: [] };
    }
  },

  async getSearchSuggestions(query) {
    if (!query || !query.trim()) return [];
    try {
      const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.suggestions || [];
    } catch (err) {
      console.warn('Search suggestions error:', err);
      return [];
    }
  },

  async getExploreFeed() {
    try {
      const res = await fetch(`${API_BASE}/explore`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Explore API error:', err);
      return { categories: [], featuredTracks: [], lofiTracks: [] };
    }
  },

  async getPlaylist(id) {
    try {
      const res = await fetch(`${API_BASE}/playlist/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Playlist fetch error:', err);
      return null;
    }
  },

  async getAlbum(id, name = '') {
    try {
      let url = `${API_BASE}/album/${id}`;
      if (name) url += `?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Album fetch error:', err);
      return null;
    }
  },

  async getArtist(id) {
    try {
      const res = await fetch(`${API_BASE}/artist/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Artist fetch error:', err);
      return null;
    }
  },

  async getLyrics(title, artist) {
    try {
      const res = await fetch(`${API_BASE}/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist || '')}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Lyrics fetch error:', err);
      return { syncedLyrics: null, plainLyrics: null };
    }
  },

  async getRelatedSongs(videoId, artist = '') {
    try {
      const res = await fetch(`${API_BASE}/related/${videoId}?artist=${encodeURIComponent(artist || '')}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('getRelatedSongs error:', err);
      return { songs: [] };
    }
  }
};

function getFallbackHomeData() {
  return {
    community: [
      {
        id: 'RDCLAK5uy_kmPRjHDECIcuVwnKusctBtTV-buui1h0A',
        title: 'chanting mind cleanser',
        creator: 'Ajay Mishra',
        views: '59k views',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=80',
        badge: 'A',
        type: 'playlist'
      },
      {
        id: 'RDCLAK5uy_kbc6FkRfx2Ld3aK0E-2v4N0yG3F9r4u-8',
        title: 'latest',
        creator: 'nikhil',
        views: '501k views',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
        badge: 'N',
        type: 'playlist'
      },
      {
        id: 'RDCLAK5uy_kj5H_l2G2U2Y4F5H8N9O1P3Q5R7S9T1U3',
        title: 'Art',
        creator: 'prashant singh',
        views: '484 views',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
        badge: 'P',
        type: 'playlist'
      },
      {
        id: 'RDCLAK5uy_m-3N6B8V1C4X7Z0A2S5D8F1G4H7J0K3L6',
        title: 'morning 🌅',
        creator: 'Aditi Sengar',
        views: '65k views',
        thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
        badge: 'A',
        type: 'playlist'
      },
      {
        id: 'RDCLAK5uy_n7M9B2V5C8X1Z4A7S0D3F6G9H2J5K8L1',
        title: 'light songs',
        creator: 'Nitin Sangal',
        views: '120k views',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80',
        badge: 'N',
        type: 'playlist'
      },
      {
        id: 'RDCLAK5uy_o5M8B1V4C7X0Z3A6S9D2F5G8H1J4K7L0',
        title: 'car',
        creator: 'Sourav Prakash Mohanty',
        views: '81k views',
        thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=500&q=80',
        badge: 'S',
        type: 'playlist'
      }
    ],
    library: [
      {
        id: 'lib-1',
        title: 'Mohit Lalwani',
        subtitle: 'vikash sharma • 485 views',
        thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      },
      {
        id: 'lib-2',
        title: 'bgm',
        subtitle: 'FreeSong • 10 tracks',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      },
      {
        id: 'lib-3',
        title: 'Radha Rani — Eternal Night Mantras',
        subtitle: 'EP • VibeYatra',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      },
      {
        id: 'lib-4',
        title: 'fav songs',
        subtitle: 'FreeSong • 1 track',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      },
      {
        id: 'lib-5',
        title: 'BG Music',
        subtitle: 'FreeSong • 8 tracks',
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      },
      {
        id: 'lib-6',
        title: 'Radhey',
        subtitle: 'FreeSong • 73 tracks',
        thumbnail: 'https://images.unsplash.com/photo-1520523839898-507127cd5852?auto=format&fit=crop&w=500&q=80',
        type: 'playlist'
      }
    ],
    quickPicks: [
      {
        videoId: 'sJV8kbT1MEU',
        title: 'Raabta (Kehte Hain Khuda)',
        artist: 'Arijit Singh',
        duration: 244,
        durationText: '4:04',
        thumbnail: 'https://i.ytimg.com/vi/sJV8kbT1MEU/hqdefault.jpg'
      },
      {
        videoId: 'kJQP7kiw5Fk',
        title: 'Despacito',
        artist: 'Luis Fonsi ft. Daddy Yankee',
        duration: 228,
        durationText: '3:48',
        thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg'
      },
      {
        videoId: 'fJ9rUzIMcZQ',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        duration: 359,
        durationText: '5:59',
        thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg'
      }
    ]
  };
}
