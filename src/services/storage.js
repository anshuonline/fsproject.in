const KEYS = {
  LIKED_SONGS: 'fs_liked_songs',
  PLAYLISTS: 'fs_playlists',
  HISTORY: 'fs_history',
  DELETED_HISTORY: 'fs_deleted_history',
  SETTINGS: 'fs_settings',
  AUTH_USER: 'fs_auth_user'
};

const DEFAULT_SETTINGS = {
  audioQuality: 'high',
  inactivityTimeout: 60,
  locationTracking: true,
  autoplay: true,
  crossfade: 0,
  volume: 1,
  stableVolume: false
};

const DEFAULT_PLAYLISTS = [];

export const storage = {
  getLikedSongs() {
    try {
      const data = localStorage.getItem(KEYS.LIKED_SONGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLikedSongs(songs) {
    try {
      localStorage.setItem(KEYS.LIKED_SONGS, JSON.stringify(songs));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getPlaylists() {
    try {
      const data = localStorage.getItem(KEYS.PLAYLISTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      const legacyIds = new Set([
        'pl-stillhere', 'pl-eng65', 'pl-latesthindi', 'pl-tamilsec1',
        'pl-tollywood', 'pl-kollywood', 'pl-pumped', 'pl-bollywood'
      ]);
      const legacyNames = new Set([
        'Still Here', 'eng65', 'latest hindi 1', 'tamil sec1',
        'Tollywood Hits', 'Kollywood Hits', 'Pumped Up', 'Bollywood Romance'
      ]);
      const filtered = parsed.filter(p => !legacyIds.has(p.id) && !legacyNames.has(p.name));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  },

  savePlaylists(playlists) {
    try {
      localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  getDeletedHistoryIds() {
    try {
      const data = localStorage.getItem(KEYS.DELETED_HISTORY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  },

  markHistoryDeleted(videoId) {
    if (!videoId) return;
    try {
      const set = this.getDeletedHistoryIds();
      set.add(videoId);
      localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(Array.from(set).slice(-200)));
    } catch (e) {
      console.warn('Mark deleted history error:', e);
    }
  },

  unmarkHistoryDeleted(videoId) {
    if (!videoId) return;
    try {
      const set = this.getDeletedHistoryIds();
      if (set.has(videoId)) {
        set.delete(videoId);
        localStorage.setItem(KEYS.DELETED_HISTORY, JSON.stringify(Array.from(set)));
      }
    } catch (e) {
      console.warn('Unmark deleted history error:', e);
    }
  },

  getHistory() {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      const raw = data ? JSON.parse(data) : [];
      const deletedIds = this.getDeletedHistoryIds();
      if (deletedIds.size === 0) return raw;
      return raw.filter(s => !deletedIds.has(s.videoId || s.id));
    } catch {
      return [];
    }
  },

  saveHistory(history) {
    try {
      const deletedIds = this.getDeletedHistoryIds();
      const clean = (history || []).filter(s => !deletedIds.has(s.videoId || s.id)).slice(0, 100);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(clean));
    } catch (e) {
      console.warn('History storage error:', e);
    }
  },

  addToHistory(song) {
    if (!song) return;
    const vid = song.videoId || song.id;
    if (vid) this.unmarkHistoryDeleted(vid);
    try {
      const history = this.getHistory().filter(s => (s.videoId || s.id) !== vid);
      history.unshift({ ...song, videoId: vid, playedAt: new Date().toISOString() });
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
    } catch (e) {
      console.warn('History storage error:', e);
    }
  },

  removeFromHistory(videoId) {
    if (!videoId) return [];
    this.markHistoryDeleted(videoId);
    try {
      const current = this.getHistory();
      const history = current.filter(s => (s.videoId || s.id) !== videoId);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
      return history;
    } catch (e) {
      console.warn('History storage error:', e);
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.removeItem(KEYS.DELETED_HISTORY);
    } catch (e) {
      console.warn('History storage error:', e);
    }
  },

  clearSearchHistory() {
    try {
      localStorage.removeItem('freesong_recent_searches');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fs_search_history_cleared'));
      }
    } catch (e) {
      console.warn('Clear search history error:', e);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Settings storage error:', e);
    }
  },

  getPreferences() {
    try {
      const data = localStorage.getItem('fs_preferences');
      return data ? JSON.parse(data) : { genres: [], artists: [] };
    } catch {
      return { genres: [], artists: [] };
    }
  },

  savePreferences(pref) {
    try {
      localStorage.setItem('fs_preferences', JSON.stringify(pref));
      localStorage.setItem('fs_onboarding_completed', 'true');
    } catch (e) {
      console.warn('Preferences storage error:', e);
    }
  },

  getFollowedArtists() {
    const prefs = this.getPreferences();
    return Array.isArray(prefs.artists) ? prefs.artists : [];
  },

  // Toggle followed artist, persist, and notify listeners (Followed feed etc.)
  toggleFollowedArtist(artistName) {
    if (!artistName) return this.getFollowedArtists();
    const prefs = this.getPreferences();
    const artists = Array.isArray(prefs.artists) ? prefs.artists : [];
    const isFollowing = artists.includes(artistName);
    const next = isFollowing
      ? artists.filter(a => a !== artistName)
      : [...artists, artistName];
    this.savePreferences({ ...prefs, artists: next, updatedAt: new Date().toISOString() });
    try {
      window.dispatchEvent(new CustomEvent('fs_followed_changed'));
    } catch {}
    return next;
  },

  hasCompletedOnboarding() {
    try {
      return localStorage.getItem('fs_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUser(user) {
    try {
      if (user) {
        localStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(KEYS.AUTH_USER);
      }
    } catch (e) {
      console.warn('User storage error:', e);
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(KEYS.AUTH_USER);
    } catch (e) {
      console.warn('User storage error:', e);
    }
  }
};
