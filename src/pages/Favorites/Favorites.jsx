import React, { useState } from 'react';
import { Heart, Play, Shuffle, Search, Music } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import './Favorites.css';

export function Favorites() {
  const { likedSongs } = useLibrary();
  const { playSong } = usePlayer();
  const [filterText, setFilterText] = useState('');

  const filteredSongs = likedSongs.filter(s =>
    s.title?.toLowerCase().includes(filterText.toLowerCase()) ||
    s.artist?.toLowerCase().includes(filterText.toLowerCase())
  );

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  const handleShufflePlay = () => {
    if (likedSongs.length > 0) {
      const shuffled = [...likedSongs].sort(() => 0.5 - Math.random());
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="fs-favorites-page">
      {/* Hero Header */}
      <div className="fs-fav-hero">
        <div className="fs-fav-cover">
          <Heart size={64} fill="#FFFFFF" />
        </div>

        <div className="fs-fav-hero-info">
          <span className="fs-fav-type">AUTO PLAYLIST</span>
          <h1 className="fs-fav-title">Liked music</h1>
          <p className="fs-fav-meta">
            FreeSong.in • {likedSongs.length} songs
          </p>

          <div className="fs-fav-actions">
            <button
              className="btn btn-primary fs-play-all-btn"
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
            >
              <Play size={18} fill="#000000" />
              <span>Play</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleShufflePlay}
              disabled={likedSongs.length === 0}
            >
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter row */}
      {likedSongs.length > 0 && (
        <div className="fs-fav-filter-row">
          <div className="fs-fav-search-wrap">
            <Search size={16} className="fs-fav-search-icon" />
            <input
              type="text"
              placeholder="Search in liked songs"
              className="fs-fav-search-input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Track list */}
      <div className="fs-fav-list">
        {likedSongs.length === 0 ? (
          <div className="fs-fav-empty">
            <Music size={44} className="text-brand" />
            <h3>No liked songs yet</h3>
            <p>Tap the heart icon on any song while listening or searching to save it here.</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="fs-fav-empty">
            <p>No songs match "{filterText}"</p>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <SongCard key={song.videoId} song={song} queueContext={filteredSongs} />
          ))
        )}
      </div>
    </div>
  );
}
