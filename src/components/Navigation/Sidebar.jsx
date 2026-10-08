import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Bookmark, Plus, Heart, Music, ListMusic, X, ArrowDownToLine, MoreVertical, History } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { usePWA } from '../../context/PWAContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { PlaylistCover } from '../Common/PlaylistCover';
import './Sidebar.css';

export function Sidebar({ isOpen, onClose, isCollapsed = false }) {
  const { playlists, createPlaylist } = useLibrary();
  const { isInstalled, installApp } = usePWA();
  const { openPlaylistMenu } = useContextMenu();
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowModal(false);
    if (pl) {
      navigate(`/playlist/${pl.id}`);
      if (onClose) onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fs-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`fs-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Mobile close button */}
        <div className="fs-sidebar-mobile-header">
          <div className="fs-sidebar-brand">
            <img src="/images/freesonglogowebp.webp" alt="FreeSong.in" className="fs-sidebar-logo" />
            <span className="fs-sidebar-brand-name">FreeSong</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Top Navigation Links */}
        <nav className="fs-sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `fs-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Home size={22} className="fs-nav-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) => `fs-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Compass size={22} className="fs-nav-icon" />
            <span>Explore</span>
          </NavLink>

          <NavLink
            to="/library"
            className={({ isActive }) => `fs-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Bookmark size={22} className="fs-nav-icon" />
            <span>Library</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `fs-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
            title="Listen history"
          >
            <History size={22} className="fs-nav-icon" />
            <span>{isCollapsed ? 'History' : 'Listen history'}</span>
          </NavLink>

          {!isInstalled && (
            <button
              type="button"
              className="fs-nav-item fs-nav-install-btn"
              onClick={() => {
                installApp();
                if (onClose) onClose();
              }}
              title="Install FreeSong App"
            >
              <ArrowDownToLine size={22} className="fs-nav-icon fs-install-icon" />
              <span>{isCollapsed ? 'Install' : 'Install app'}</span>
            </button>
          )}
        </nav>

        <div className="fs-sidebar-divider" />

        {/* Action: New Playlist */}
        <div className="fs-sidebar-action">
          <button className="btn-new-playlist" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            <span>New playlist</span>
          </button>
        </div>

        {/* Auto Playlist: Liked music */}
        <div className="fs-sidebar-playlists">
          <NavLink
            to="/favorites"
            className={({ isActive }) => `fs-playlist-item liked-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="fs-playlist-icon-wrap">
              <Heart size={16} fill="currentColor" />
            </div>
            <div className="fs-playlist-info">
              <span className="fs-playlist-title">Liked music</span>
              <span className="fs-playlist-sub">📌 Auto playlist</span>
            </div>
          </NavLink>

          {/* User Playlists */}
          <div className="fs-custom-playlists-list">
            {playlists.map(pl => (
              <NavLink
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className={({ isActive }) => `fs-playlist-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openPlaylistMenu(pl, e);
                }}
              >
                <PlaylistCover playlist={pl} size="sidebar" className="fs-sidebar-pl-cover" />
                <div className="fs-playlist-info">
                  <span className="fs-playlist-title truncate">{pl.name}</span>
                  <span className="fs-playlist-sub">
                    {pl.tracksCount ? `${pl.tracksCount} tracks` : 'FreeSong'}
                  </span>
                </div>
                <button
                  type="button"
                  className="fs-pl-item-more-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPlaylistMenu(pl, e);
                  }}
                  title="Playlist options"
                  aria-label="Playlist options"
                >
                  <MoreVertical size={14} />
                </button>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      {/* Sidebar backdrop for mobile */}
      {isOpen && <div className="fs-sidebar-backdrop" onClick={onClose} />}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fs-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="fs-modal" onClick={e => e.stopPropagation()}>
            <h3 className="fs-modal-title">Create new playlist</h3>
            <p className="fs-modal-desc">Give your collection a memorable name.</p>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                className="fs-modal-input"
                placeholder="e.g. Late Night Vibes"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
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
                <button type="submit" className="btn btn-primary" disabled={!newPlaylistName.trim()}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
