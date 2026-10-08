const KEYS = {
  LIKED_SONGS: 'fs_liked_songs',
  PLAYLISTS: 'fs_playlists',
  HISTORY: 'fs_history',
  SETTINGS: 'fs_settings'
};

const DEFAULT_SETTINGS = {
  audioQuality: 'high',
  autoplay: true,
  crossfade: 0,
  volume: 0.8
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

  getHistory() {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(song) {
    try {
      const history = this.getHistory().filter(s => s.videoId !== song.videoId);
      history.unshift({ ...song, playedAt: new Date().toISOString() });
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('History storage error:', e);
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(KEYS.HISTORY);
    } catch (e) {
      console.warn('History storage error:', e);
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

  hasCompletedOnboarding() {
    try {
      return localStorage.getItem('fs_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  }
};
