import React, { useState } from 'react';
import { Heart, Plus, ListMusic, History, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import { PlaylistCover } from '../../components/Common/PlaylistCover';
import './Library.css';

export function Library() {
  const { playlists, likedSongs, createPlaylist } = useLibrary();
  const { playSong } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const pl = createPlaylist(name.trim());
    setName('');
    setShowModal(false);
    if (pl) navigate(`/playlist/${pl.id}`);
  };

  const handlePlayLiked = (e) => {
    e.stopPropagation();
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  return (
    <div className="fs-library-page">
      <div className="fs-library-header">
        <div className="fs-library-title-group">
          <h1 className="fs-library-title">Library</h1>
          <p className="fs-library-subtitle">Your personal music collection, playlists, and favorites</p>
        </div>

        <div className="fs-library-actions">
          <Link to="/history" className="btn btn-secondary">
            <History size={16} />
            <span>History</span>
          </Link>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>New playlist</span>
          </button>
        </div>
      </div>

      <div className="fs-library-grid">
        {/* Liked Songs Special Card */}
        <div className="fs-lib-featured-card" onClick={() => navigate('/favorites')}>
          <div className="fs-lib-heart-icon-box">
            <Heart size={36} fill="#FFFFFF" />
          </div>
          <div className="fs-lib-featured-info">
            <h3 className="fs-lib-card-title">Liked music</h3>
            <p className="fs-lib-card-sub">Auto playlist • {likedSongs.length} songs</p>
          </div>
          {likedSongs.length > 0 && (
            <button
              className="btn-play-circle fs-lib-play-hover"
              onClick={handlePlayLiked}
              aria-label="Play liked music"
            >
              <Play size={20} fill="#000000" />
            </button>
          )}
        </div>

        {/* User Playlists */}
        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="fs-lib-playlist-card"
            onClick={() => navigate(`/playlist/${pl.id}`)}
          >
            <div className="fs-lib-playlist-art">
              <PlaylistCover playlist={pl} size="card" className="fs-lib-playlist-cover" />
            </div>
            <div className="fs-lib-playlist-meta">
              <h4 className="fs-lib-playlist-name truncate">{pl.name}</h4>
              <p className="fs-lib-playlist-count">
                Playlist • {pl.tracksCount || (pl.songs ? pl.songs.length : 0)} tracks
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fs-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="fs-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="fs-modal-title">New playlist</h3>
            <p className="fs-modal-desc">Enter a title for your playlist</p>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                className="fs-modal-input"
                placeholder="Playlist name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <div className="fs-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
