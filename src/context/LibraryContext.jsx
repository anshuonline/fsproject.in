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
