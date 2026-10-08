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

const DEFAULT_PLAYLISTS = [
  { id: 'pl-stillhere', name: 'Still Here', tracksCount: 14, updatedAt: 'Recent' },
  { id: 'pl-eng65', name: 'eng65', tracksCount: 65, updatedAt: 'Recent' },
  { id: 'pl-latesthindi', name: 'latest hindi 1', tracksCount: 28, updatedAt: 'Recent' },
  { id: 'pl-tamilsec1', name: 'tamil sec1', tracksCount: 12, updatedAt: 'Recent' },
  { id: 'pl-tollywood', name: 'Tollywood Hits', tracksCount: 45, updatedAt: 'Recent' },
  { id: 'pl-kollywood', name: 'Kollywood Hits', tracksCount: 38, updatedAt: 'Recent' },
  { id: 'pl-pumped', name: 'Pumped Up', tracksCount: 22, updatedAt: 'Recent' },
  { id: 'pl-bollywood', name: 'Bollywood Romance', tracksCount: 50, updatedAt: 'Recent' }
];

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
      return data ? JSON.parse(data) : DEFAULT_PLAYLISTS;
    } catch {
      return DEFAULT_PLAYLISTS;
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
  }
};
