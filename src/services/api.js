const API_BASE = '/api';
const activeSyncUserPromises = new Map();

// Helper to check for common, weak, or easy-to-guess passwords
export function isEasyPassword(password) {
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

export const api = {
  async getHomeFeed(prefs = null, history = null, likes = null, user = null) {
    try {
      let url = `${API_BASE}/home`;
      const params = new URLSearchParams();
      if (prefs?.genres?.length) params.set('genres', prefs.genres.join(','));
      if (prefs?.artists?.length) params.set('artists', prefs.artists.map(a => typeof a === 'string' ? a : a.name).join(','));
      if (history?.length) params.set('history', JSON.stringify(history.slice(0, 5)));
      if (likes?.length) {
        params.set('likes', JSON.stringify(
          likes.slice(0, 10)
            .map(s => ({ videoId: s.videoId, title: s.title, artist: s.artist }))
            .filter(s => s.videoId)
        ));
      }
      // Identity for "Made for {name}" sections (photo used on mix covers)
      if (user?.name) params.set('name', user.name);
      if (user?.picture) params.set('photo', user.picture);
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
      return { categories: [], spotlight: null, trendingNow: [], freshDrops: [], newAlbums: [], moodShelves: [] };
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
  },

  async getSong(id) {
    if (!id) return null;
    try {
      const res = await fetch(`${API_BASE}/song/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`getSong error for ${id}:`, err);
      return null;
    }
  },

  async syncUser(userData) {
    if (!userData || !userData.email) return null;
    const emailKey = userData.email.toLowerCase().trim();

    if (activeSyncUserPromises.has(emailKey)) {
      return activeSyncUserPromises.get(emailKey);
    }

    const syncPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name || 'FreeSong Listener',
            avatarUrl: userData.picture || userData.avatarUrl || null,
            authProvider: userData.provider || userData.authProvider || 'google',
            firebaseUid: userData.id || userData.firebaseUid || null
          })
        });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('User sync API error:', err);
        return null;
      } finally {
        setTimeout(() => {
          activeSyncUserPromises.delete(emailKey);
        }, 5000);
      }
    })();

    activeSyncUserPromises.set(emailKey, syncPromise);
    return syncPromise;
  },

  async addLike(userId, song, email = null) {
    if (!song?.videoId) return false;
    try {
      const res = await fetch(`${API_BASE}/user/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          videoId: song.videoId,
          title: song.title || 'Untitled',
          artist: song.artist || 'Unknown Artist',
          album: song.album || '',
          thumbnail: song.thumbnail || '',
          duration: song.duration || 0,
          durationText: song.durationText || ''
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('addLike API error:', err);
      return false;
    }
  },

  async removeLike(userId, videoId, email = null) {
    if (!videoId) return false;
    try {
      const res = await fetch(`${API_BASE}/user/likes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, videoId })
      });
      return res.ok;
    } catch (err) {
      console.warn('removeLike API error:', err);
      return false;
    }
  },

  async getUserLikes(userId, email = null) {
    if (!userId && !email) return [];
    try {
      let url = `${API_BASE}/user/${encodeURIComponent(userId || email)}/likes`;
      if (email) url += `?email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.likes || [];
    } catch (err) {
      console.warn('getUserLikes API error:', err);
      return [];
    }
  },

  async recordHistory(userId, song, email = null) {
    if (!song?.videoId) return false;
    try {
      const res = await fetch(`${API_BASE}/user/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          videoId: song.videoId,
          title: song.title || 'Untitled',
          artist: song.artist || 'Unknown Artist',
          album: song.album || '',
          thumbnail: song.thumbnail || '',
          duration: song.duration || 0,
          durationText: song.durationText || '',
          playedDuration: song.playedDuration || 0
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('recordHistory API error:', err);
      return false;
    }
  },

  async getUserHistory(userId, email = null) {
    if (!userId && !email) return [];
    try {
      let url = `${API_BASE}/user/${encodeURIComponent(userId || email)}/history`;
      if (email) url += `?email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.history || [];
    } catch (err) {
      console.warn('getUserHistory API error:', err);
      return [];
    }
  },

  async getUserStats(userId, email = null) {
    try {
      let url = `${API_BASE}/user/stats?userId=${encodeURIComponent(userId || '')}`;
      if (email) url += `&email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return Number(data.totalPlays) || 0;
    } catch {
      return null;
    }
  },

  async syncUserHistory(userId, songs, email = null) {
    if (!Array.isArray(songs) || songs.length === 0) return [];
    try {
      const res = await fetch(`${API_BASE}/user/history/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, songs })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.history || [];
    } catch (err) {
      console.warn('syncUserHistory API error:', err);
      return [];
    }
  },

  async clearUserHistory(userId, email = null) {
    try {
      const res = await fetch(`${API_BASE}/user/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      return res.ok;
    } catch (err) {
      console.warn('clearUserHistory API error:', err);
      return false;
    }
  },

  async removeHistoryItem(userId, videoId, email = null) {
    if (!videoId) return false;
    try {
      const res = await fetch(`${API_BASE}/user/history/item`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, videoId })
      });
      return res.ok;
    } catch (err) {
      console.warn('removeHistoryItem API error:', err);
      return false;
    }
  },

  async syncUserLikes(userId, songs, email = null) {
    if (!Array.isArray(songs) || songs.length === 0) return [];
    try {
      const res = await fetch(`${API_BASE}/user/likes/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, songs })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.likes || [];
    } catch (err) {
      console.warn('syncUserLikes API error:', err);
      return [];
    }
  },

  async getUserPreferences(userId) {
    if (!userId) return null;
    try {
      const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}/preferences`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.preferences || null;
    } catch (err) {
      console.warn('getUserPreferences API error:', err);
      return null;
    }
  },

  async saveUserPreferences(userId, prefs, email = null) {
    if (!prefs) return false;
    try {
      const res = await fetch(`${API_BASE}/user/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          genres: prefs.genres || [],
          artists: (prefs.artists || []).map(a => typeof a === 'string' ? a : a.name),
          volume: prefs.volume,
          theme: prefs.theme,
          autoplay: prefs.autoplay
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('saveUserPreferences API error:', err);
      return false;
    }
  },

  // Sync local preferences (followed artists, genres) to cloud DB for logged-in users
  async syncUserPreferences(prefs) {
    if (!prefs) return false;
    try {
      const user = JSON.parse(localStorage.getItem('fs_auth_user') || 'null');
      if (!user || (!user.email && !user.dbId)) return false;
      return await this.saveUserPreferences(user.dbId || user.email || user.id, prefs, user.email);
    } catch {
      return false;
    }
  },

  async getUserPlaylists(userId, email = null) {
    if (!userId && !email) return [];
    try {
      let url = `${API_BASE}/user/${encodeURIComponent(userId || email)}/playlists`;
      if (email) url += `?email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.playlists || [];
    } catch (err) {
      console.warn('getUserPlaylists API error:', err);
      return [];
    }
  },

  async syncUserPlaylists(userId, playlists, email = null) {
    if (!Array.isArray(playlists)) return false;
    try {
      const res = await fetch(`${API_BASE}/user/playlists/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, playlists })
      });
      return res.ok;
    } catch (err) {
      console.warn('syncUserPlaylists API error:', err);
      return false;
    }
  },

  async updateUserProfile({ userId, email, name, dob, city, locationTracking }) {
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name, dob, city, locationTracking })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('updateUserProfile API error:', err);
      return null;
    }
  },

  async requestAccountDeletion(userId, email) {
    try {
      const res = await fetch(`${API_BASE}/user/request-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('requestAccountDeletion API error:', err);
      throw err;
    }
  },

  async confirmAccountDeletion(token) {
    try {
      const res = await fetch(`${API_BASE}/user/confirm-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP error ${res.status}`);
      return data;
    } catch (err) {
      console.warn('confirmAccountDeletion API error:', err);
      throw err;
    }
  },

  async clearUserHistory(userId, email) {
    try {
      const res = await fetch(`${API_BASE}/user/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      return res.ok;
    } catch (err) {
      console.warn('clearUserHistory API error:', err);
      return false;
    }
  },

  async setPassword(userId, email, newPassword, currentPassword = null) {
    const res = await fetch(`${API_BASE}/user/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, newPassword, currentPassword })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to update password');
      err.code = data.code;
      throw err;
    }
    return data;
  },

  async loginWithPassword(email, password) {
    const res = await fetch(`${API_BASE}/user/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Login failed. Please check your credentials.');
      err.code = data.code;
      err.isGoogleUser = data.isGoogleUser;
      throw err;
    }
    return data;
  },

  async registerWithPassword(name, email, password) {
    const res = await fetch(`${API_BASE}/user/register-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Registration failed');
      err.code = data.code;
      err.email = data.email;
      throw err;
    }
    return data;
  },

  async checkHasPassword(userId, email) {
    try {
      const res = await fetch(`${API_BASE}/user/has-password?userId=${encodeURIComponent(userId || '')}&email=${encodeURIComponent(email || '')}`);
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.hasPassword);
    } catch {
      return false;
    }
  },

  async requestPasswordReset(email) {
    const res = await fetch(`${API_BASE}/user/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to dispatch password reset email');
      err.code = data.code;
      err.hoursRemaining = data.hoursRemaining;
      throw err;
    }
    return data;
  },

  async verifyResetToken(token) {
    const res = await fetch(`${API_BASE}/user/verify-reset-token?token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid or expired password reset link');
    return data;
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE}/user/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
    return data;
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
