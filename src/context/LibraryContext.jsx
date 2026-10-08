import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [likedSongs, setLikedSongs] = useState(() => storage.getLikedSongs());
  const [playlists, setPlaylists] = useState(() => storage.getPlaylists());
  const [history, setHistory] = useState(() => storage.getHistory());

  useEffect(() => {
    storage.saveLikedSongs(likedSongs);
  }, [likedSongs]);

  useEffect(() => {
    storage.savePlaylists(playlists);
  }, [playlists]);

  const toggleLike = (song) => {
    if (!song || !song.videoId) return;
    setLikedSongs(prev => {
      const exists = prev.some(s => s.videoId === song.videoId);
      if (exists) {
        return prev.filter(s => s.videoId !== song.videoId);
      } else {
        return [{ ...song, likedAt: new Date().toISOString() }, ...prev];
      }
    });
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
