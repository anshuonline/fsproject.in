import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState(() => storage.getLikedSongs());
  const [playlists, setPlaylists] = useState(() => storage.getPlaylists());
  const [history, setHistory] = useState(() => storage.getHistory());

  // Save to localStorage
  useEffect(() => {
    storage.saveLikedSongs(likedSongs);
  }, [likedSongs]);

  useEffect(() => {
    storage.savePlaylists(playlists);
  }, [playlists]);

  // Sync likes and playlists from Hostinger MySQL cloud when user logs in or dbId resolves
  useEffect(() => {
    const currentUser = user || storage.getUser();
    if (!currentUser?.email && !currentUser?.dbId) return;

    const identifier = currentUser.dbId || currentUser.email || currentUser.id;

    // 1. Batch sync local likes to cloud first, then pull full cloud likes
    const localLikes = storage.getLikedSongs();
    if (Array.isArray(localLikes) && localLikes.length > 0) {
      api.syncUserLikes(identifier, localLikes, currentUser.email).then((cloudLikes) => {
        if (Array.isArray(cloudLikes) && cloudLikes.length > 0) {
          setLikedSongs(cloudLikes);
          storage.saveLikedSongs(cloudLikes);
        }
      }).catch(console.warn);
    } else {
      api.getUserLikes(identifier).then((cloudLikes) => {
        if (Array.isArray(cloudLikes) && cloudLikes.length > 0) {
          setLikedSongs(cloudLikes);
          storage.saveLikedSongs(cloudLikes);
        }
      }).catch(console.warn);
    }

    // 2. Playlists sync
    const localPlaylists = storage.getPlaylists();
    if (Array.isArray(localPlaylists) && localPlaylists.length > 0) {
      api.syncUserPlaylists(identifier, localPlaylists, currentUser.email).catch(console.warn);
    }
    api.getUserPlaylists(identifier).then((cloudPlaylists) => {
      if (Array.isArray(cloudPlaylists) && cloudPlaylists.length > 0) {
        setPlaylists((prev) => {
          const map = new Map();
          (prev || []).forEach(p => map.set(p.name, p));
          cloudPlaylists.forEach(p => {
            if (!map.has(p.name)) map.set(p.name, p);
          });
          const merged = Array.from(map.values());
          storage.savePlaylists(merged);
          return merged;
        });
      }
    }).catch(console.warn);
  }, [user?.email, user?.dbId]);

  const toggleLike = (song) => {
    if (!song || !song.videoId) return;

    const currentUser = user || storage.getUser();
    const exists = likedSongs.some(s => s.videoId === song.videoId);

    if (exists) {
      const updated = likedSongs.filter(s => s.videoId !== song.videoId);
      setLikedSongs(updated);
      storage.saveLikedSongs(updated);
      if (currentUser?.email || currentUser?.dbId) {
        api.removeLike(currentUser.dbId || currentUser.email || currentUser.id, song.videoId, currentUser.email).catch(console.warn);
      }
    } else {
      const newSong = { ...song, likedAt: new Date().toISOString() };
      const updated = [newSong, ...likedSongs];
      setLikedSongs(updated);
      storage.saveLikedSongs(updated);
      if (currentUser?.email || currentUser?.dbId) {
        api.addLike(currentUser.dbId || currentUser.email || currentUser.id, newSong, currentUser.email).catch(console.warn);
      }
    }
  };

  const isLiked = (videoId) => {
    return likedSongs.some(s => s.videoId === videoId);
  };

  const createPlaylist = (name) => {
    if (!name.trim()) return null;
    const newPl = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      tracksCount: 0,
      songs: [],
      updatedAt: 'Just now'
    };
    setPlaylists(prev => [newPl, ...prev]);
    return newPl;
  };

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const updatePlaylist = (id, updates) => {
    let updatedItem = null;
    setPlaylists(prev => prev.map(p => {
      if (p.id === id) {
        updatedItem = {
          ...p,
          name: updates.name !== undefined ? updates.name.trim() : p.name,
          description: updates.description !== undefined ? updates.description.trim() : (p.description || ''),
          coverImage: updates.coverImage !== undefined ? updates.coverImage : p.coverImage,
          updatedAt: 'Just now'
        };
        return updatedItem;
      }
      return p;
    }));
    return updatedItem;
  };

  const saveExternalPlaylist = (ext) => {
    if (!ext) return null;
    const songs = ext.songs || [];
    const firstThumb = songs[0]?.thumbnail || (songs[0]?.videoId ? `https://i.ytimg.com/vi/${songs[0].videoId}/hqdefault.jpg` : null);
    const cover = ext.coverImage || firstThumb || null;
    const newPl = {
      id: `pl-${Date.now()}`,
      name: ext.title || ext.name || 'Saved Playlist',
      description: ext.description || `Saved from ${ext.creator || 'Community'}`,
      tracksCount: songs.length,
      songs: [...songs],
      coverImage: cover,
      sourcePlaylistId: ext.id,
      updatedAt: 'Just now'
    };
    setPlaylists(prev => [newPl, ...prev]);
    return newPl;
  };

  const clonePlaylist = (pl) => {
    return saveExternalPlaylist(pl);
  };

  const isPlaylistSaved = (playlistId) => {
    if (!playlistId) return false;
    return playlists.some(p => p.id === playlistId || p.sourcePlaylistId === playlistId);
  };

  const getSavedClone = (playlistId) => {
    if (!playlistId) return null;
    return playlists.find(p => p.id === playlistId || p.sourcePlaylistId === playlistId) || null;
  };

  const addSongToPlaylist = (playlistId, song) => {
    if (!playlistId || !song || !song.videoId) return false;
    let added = false;
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const existing = p.songs || [];
        if (!existing.some(s => s.videoId === song.videoId)) {
          added = true;
          const updated = [song, ...existing];
          return {
            ...p,
            songs: updated,
            tracksCount: updated.length,
            updatedAt: 'Just now'
          };
        }
      }
      return p;
    }));
    return added;
  };

  const removeSongFromPlaylist = (playlistId, videoId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const updated = (p.songs || []).filter(s => s.videoId !== videoId);
        return {
          ...p,
          songs: updated,
          tracksCount: updated.length,
          updatedAt: 'Just now'
        };
      }
      return p;
    }));
  };

  const isSongInPlaylist = (playlistId, videoId) => {
    const pl = playlists.find(p => p.id === playlistId);
    return pl ? (pl.songs || []).some(s => s.videoId === videoId) : false;
  };

  const refreshHistory = () => {
    setHistory(storage.getHistory());
  };

  const clearHistory = () => {
    storage.clearHistory();
    setHistory([]);
  };

  return (
    <LibraryContext.Provider
      value={{
        likedSongs,
        playlists,
        history,
        toggleLike,
        isLiked,
        createPlaylist,
        deletePlaylist,
        updatePlaylist,
        saveExternalPlaylist,
        clonePlaylist,
        isPlaylistSaved,
        getSavedClone,
        addSongToPlaylist,
        removeSongFromPlaylist,
        isSongInPlaylist,
        refreshHistory,
        clearHistory
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
