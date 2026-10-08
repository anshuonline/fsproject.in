import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  CornerDownRight,
  ListMusic,
  FolderPlus,
  Moon,
  User,
  Heart,
  Share2,
  ChevronRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Pencil,
  Trash2,
  Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContextMenu } from '../../context/ContextMenuContext';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { getArtworkFallback } from '../../utils/imageFallback';
import './GlobalContextMenu.css';

export function GlobalContextMenu() {
  const {
    isOpen,
    song,
    playlist,
    targetType,
    position,
    currentView,
    closeMenu,
    setView,
    showToast,
    openEditPlaylistModal
  } = useContextMenu();

  const {
    playNext,
    playNextSongs,
    startRadio,
    addToQueue,
    addSongsToQueue,
    sleepTimer,
    setSleepTimer,
    setIsFullScreen
  } = usePlayer();

  const {
    playlists,
    isLiked,
    toggleLike,
    createPlaylist,
    deletePlaylist,
    saveExternalPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    isSongInPlaylist
  } = useLibrary();

  const navigate = useNavigate();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [adjustedPos, setAdjustedPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  // Responsive mobile listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute clamped desktop coordinates
  useEffect(() => {
    if (!isOpen || isMobile || !position) return;

    const menuWidth = 290;
    const menuHeight = currentView === 'root' ? 390 : 340;
    const padding = 12;

    let x = position.x;
    let y = position.y;

    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (x < padding) x = padding;

    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (y < padding) y = padding;

    setAdjustedPos({ x, y });
  }, [isOpen, isMobile, position, currentView]);

  // Keyboard dismiss (Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  if (!isOpen || (!song && !playlist)) return null;

  const liked = song ? isLiked(song.videoId) : false;
  const isCustomPlaylist = playlist && (
    (playlist.id && playlist.id.startsWith('pl-')) ||
    playlists.some(p => p.id === playlist.id)
  );

  // Playlist action handlers
  const handleEditPlaylist = () => {
    closeMenu();
    openEditPlaylistModal(playlist);
  };

  const handlePlayNextPlaylist = () => {
    const tracks = playlist?.songs || [];
    if (tracks.length > 0) {
      if (typeof playNextSongs === 'function') {
        playNextSongs(tracks);
      } else {
        tracks.slice().reverse().forEach(s => playNext(s));
      }
      showToast(`${tracks.length} songs from "${playlist.name || playlist.title}" will play next`);
    } else {
      showToast('Playlist has no tracks to play', 'info');
    }
    closeMenu();
  };

  const handleAddToQueuePlaylist = () => {
    const tracks = playlist?.songs || [];
    if (tracks.length > 0) {
      if (typeof addSongsToQueue === 'function') {
        addSongsToQueue(tracks);
      } else {
        tracks.forEach(s => addToQueue(s));
      }
      showToast(`Added ${tracks.length} songs to queue`);
    } else {
      showToast('Playlist has no tracks to add', 'info');
    }
    closeMenu();
  };

  const handleSavePlaylistToLibrary = () => {
    if (!playlist) return;
    const saved = saveExternalPlaylist(playlist);
    if (saved) {
      showToast(`Saved "${saved.name}" to your Library!`, 'success');
    }
    closeMenu();
  };

  const handleSharePlaylist = async () => {
    if (!playlist) return;
    const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
    const title = playlist.name || playlist.title || 'Playlist';
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Check out "${title}" on FreeSong.in`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Playlist link copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Playlist link copied to clipboard!');
      } catch {
        showToast('Failed to copy link', 'error');
      }
    }
    closeMenu();
  };

  const handleDeletePlaylist = () => {
    if (!playlist) return;
    const name = playlist.name || playlist.title || 'Playlist';
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deletePlaylist(playlist.id);
      showToast(`Deleted "${name}"`, 'info');
      closeMenu();
      if (window.location.pathname.includes(playlist.id)) {
        navigate('/library');
      }
    }
  };

  // Action handlers
  const handleStartRadio = () => {
    startRadio(song);
    showToast(`Started radio based on "${song.title}"`);
    closeMenu();
  };

  const handlePlayNext = () => {
    playNext(song);
    showToast(`"${song.title}" will play next`);
    closeMenu();
  };

  const handleAddToQueue = () => {
    addToQueue(song);
    showToast(`Added "${song.title}" to queue`);
    closeMenu();
  };

  const handleToggleLike = () => {
    toggleLike(song);
    if (liked) {
      showToast(`Removed from Favorites`, 'info');
    } else {
      showToast(`Saved to Favorites`, 'success');
    }
  };

  const handleGoToArtist = () => {
    closeMenu();
    if (typeof setIsFullScreen === 'function') {
      setIsFullScreen(false);
    }
    if (song.artistId) {
      navigate(`/artist/${song.artistId}`);
    } else if (song.artist) {
      navigate(`/search?q=${encodeURIComponent(song.artist)}`);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?v=${song.videoId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: song.title,
          text: `Listen to "${song.title}" by ${song.artist} on FreeSong.in`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Song link copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Song link copied to clipboard!');
      } catch {
        showToast('Failed to copy link', 'error');
      }
    }
    closeMenu();
  };

  // Sub-view: Create Playlist
  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;

    const newPl = createPlaylist(trimmed);
    if (newPl && newPl.id) {
      addSongToPlaylist(newPl.id, song);
      showToast(`Created & added to "${trimmed}"`);
      setNewPlaylistName('');
    }
  };

  // Sub-view: Toggle Playlist Song
  const handleTogglePlaylist = (pl) => {
    const inPlaylist = isSongInPlaylist(pl.id, song.videoId);
    const plName = pl.name || pl.title || 'Playlist';

    if (inPlaylist) {
      removeSongFromPlaylist(pl.id, song.videoId);
      showToast(`Removed from "${plName}"`, 'info');
    } else {
      addSongToPlaylist(pl.id, song);
      showToast(`Added to "${plName}"`, 'success');
    }
  };

  // Sub-view: Set Sleep Timer
  const handleSelectSleepTimer = (val, label) => {
    setSleepTimer(val);
    if (val === 'off') {
      showToast('Sleep timer turned off', 'info');
    } else {
      showToast(`Sleep timer set: ${label}`, 'success');
    }
    closeMenu();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fs-context-backdrop" onClick={closeMenu} />

      {/* Menu Container */}
      <div
        ref={menuRef}
        className={`fs-context-menu ${isMobile ? 'mobile' : 'desktop'}`}
        style={
          isMobile
            ? {}
            : {
                left: `${adjustedPos.x}px`,
                top: `${adjustedPos.y}px`
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        {isMobile && (
          <div className="fs-context-handle-wrap" onClick={closeMenu}>
            <div className="fs-context-handle" />
          </div>
        )}

        {/* Playlist Context Menu View */}
        {targetType === 'playlist' && playlist && (
          <>
            <div className="fs-context-header">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.name || playlist.title}
                  className="fs-context-thumb"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="fs-context-thumb fs-pl-thumb-fallback">
                  <ListMusic size={22} className="text-brand" />
                </div>
              )}
              <div className="fs-context-meta">
                <span className="fs-context-title truncate">
                  {playlist.name || playlist.title || 'Playlist'}
                </span>
                <span className="fs-context-subtitle truncate">
                  {playlist.creator || (isCustomPlaylist ? 'You' : 'Community')} • {playlist.songs?.length || playlist.tracksCount || 0} songs
                </span>
              </div>
              <button
                type="button"
                className="fs-context-close-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="fs-context-body">
              {/* Edit Details */}
              <button type="button" className="fs-context-item" onClick={handleEditPlaylist}>
                <span className="fs-context-item-icon">
                  <Pencil size={18} />
                </span>
                <span className="fs-context-item-label">
                  {isCustomPlaylist ? 'Edit playlist details' : 'Save & edit copy'}
                </span>
              </button>

              <button type="button" className="fs-context-item" onClick={handlePlayNextPlaylist}>
                <span className="fs-context-item-icon">
                  <CornerDownRight size={18} />
                </span>
                <span className="fs-context-item-label">Play next</span>
              </button>

              <button type="button" className="fs-context-item" onClick={handleAddToQueuePlaylist}>
                <span className="fs-context-item-icon">
                  <ListMusic size={18} />
                </span>
                <span className="fs-context-item-label">Add to queue</span>
              </button>

              {!isCustomPlaylist && (
                <button type="button" className="fs-context-item" onClick={handleSavePlaylistToLibrary}>
                  <span className="fs-context-item-icon">
                    <Bookmark size={18} />
                  </span>
                  <span className="fs-context-item-label">Save to library</span>
                </button>
              )}

              <button type="button" className="fs-context-item" onClick={handleSharePlaylist}>
                <span className="fs-context-item-icon">
                  <Share2 size={18} />
                </span>
                <span className="fs-context-item-label">Share playlist</span>
              </button>

              {isCustomPlaylist && (
                <>
                  <div className="fs-context-divider" />
                  <button type="button" className="fs-context-item fs-context-item-danger" onClick={handleDeletePlaylist}>
                    <span className="fs-context-item-icon text-danger">
                      <Trash2 size={18} />
                    </span>
                    <span className="fs-context-item-label text-danger">Delete playlist</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Song Context Menu Views */}
        {targetType === 'song' && song && currentView === 'root' && (
          <>
            {/* Header info */}
            <div className="fs-context-header">
              <img
                src={
                  song.thumbnail ||
                  (song.videoId
                    ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`
                    : '/images/freesonglogowebp.webp')
                }
                alt={song.title}
                className="fs-context-thumb"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src || '';
                  if (song.videoId && !currentSrc.includes('i.ytimg.com')) {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
                  } else {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getArtworkFallback(song.title);
                  }
                }}
              />
              <div className="fs-context-meta">
                <span className="fs-context-title truncate">{song.title}</span>
                <span className="fs-context-subtitle truncate">
                  {song.artist || 'FreeSong'} {song.durationText ? `• ${song.durationText}` : ''}
                </span>
              </div>
              <button
                className="fs-context-close-btn"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Root Action items */}
            <div className="fs-context-body">
              <button className="fs-context-item" onClick={handleStartRadio}>
                <span className="fs-context-item-icon">
                  <Radio size={18} />
                </span>
                <span className="fs-context-item-label">Start radio</span>
              </button>

              <button className="fs-context-item" onClick={handlePlayNext}>
                <span className="fs-context-item-icon">
                  <CornerDownRight size={18} />
                </span>
                <span className="fs-context-item-label">Play next</span>
              </button>

              <button className="fs-context-item" onClick={handleAddToQueue}>
                <span className="fs-context-item-icon">
                  <ListMusic size={18} />
                </span>
                <span className="fs-context-item-label">Add to queue</span>
              </button>

              <div className="fs-context-divider" />

              {/* Nested: Add to playlist */}
              <button
                className="fs-context-item"
                onClick={() => setView('playlist')}
              >
                <span className="fs-context-item-icon">
                  <FolderPlus size={18} />
                </span>
                <span className="fs-context-item-label">Add to playlist</span>
                <ChevronRight size={16} className="fs-context-arrow" />
              </button>

              {/* Nested: Sleep timer */}
              <button
                className="fs-context-item"
                onClick={() => setView('sleep_timer')}
              >
                <span className="fs-context-item-icon">
                  <Moon size={18} />
                </span>
                <span className="fs-context-item-label">Sleep timer</span>
                {sleepTimer && (
                  <span className="fs-context-badge">{sleepTimer.label}</span>
                )}
                <ChevronRight size={16} className="fs-context-arrow" />
              </button>

              <div className="fs-context-divider" />

              {song.artist && (
                <button className="fs-context-item" onClick={handleGoToArtist}>
                  <span className="fs-context-item-icon">
                    <User size={18} />
                  </span>
                  <span className="fs-context-item-label">Go to artist</span>
                </button>
              )}

              <button
                className={`fs-context-item ${liked ? 'active-item' : ''}`}
                onClick={handleToggleLike}
              >
                <span className="fs-context-item-icon">
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </span>
                <span className="fs-context-item-label">
                  {liked ? 'Liked in Favorites' : 'Add to Favorites'}
                </span>
              </button>

              <button className="fs-context-item" onClick={handleShare}>
                <span className="fs-context-item-icon">
                  <Share2 size={18} />
                </span>
                <span className="fs-context-item-label">Share song</span>
              </button>
            </div>
          </>
        )}

        {/* View: Playlist Sub-menu */}
        {targetType === 'song' && song && currentView === 'playlist' && (
          <>
            <div className="fs-context-sub-header">
              <button
                className="fs-context-back-btn"
                onClick={() => setView('root')}
                aria-label="Back to actions"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="fs-context-sub-title">Add to playlist</span>
            </div>

            {/* Inline create playlist form */}
            <form onSubmit={handleCreatePlaylist} className="fs-context-new-pl">
              <input
                type="text"
                placeholder="New playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="fs-context-new-pl-input"
                autoFocus
              />
              <button
                type="submit"
                className="fs-context-new-pl-btn"
                disabled={!newPlaylistName.trim()}
              >
                <Plus size={14} />
                <span>Create</span>
              </button>
            </form>

            <div className="fs-context-body">
              {playlists.length === 0 ? (
                <div className="fs-context-empty">
                  No custom playlists yet. Create one above!
                </div>
              ) : (
                playlists.map((pl) => {
                  const inPlaylist = isSongInPlaylist(pl.id, song.videoId);
                  const trackCount = pl.songs ? pl.songs.length : (pl.tracksCount || 0);

                  return (
                    <button
                      key={pl.id}
                      className="fs-context-pl-item"
                      onClick={() => handleTogglePlaylist(pl)}
                    >
                      <div className="fs-context-pl-meta">
                        <span className="fs-context-pl-title truncate">
                          {pl.name || pl.title}
                        </span>
                        <span className="fs-context-pl-count">
                          {trackCount} {trackCount === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                      <div
                        className={`fs-context-check-circle ${
                          inPlaylist ? 'checked' : ''
                        }`}
                      >
                        {inPlaylist && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* View: Sleep Timer Sub-menu */}
        {targetType === 'song' && song && currentView === 'sleep_timer' && (
          <>
            <div className="fs-context-sub-header">
              <button
                className="fs-context-back-btn"
                onClick={() => setView('root')}
                aria-label="Back to actions"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="fs-context-sub-title">Sleep timer</span>
            </div>

            <div className="fs-context-body">
              {[
                { val: '15', label: '15 minutes' },
                { val: '30', label: '30 minutes' },
                { val: '45', label: '45 minutes' },
                { val: '60', label: '60 minutes' },
                { val: 'end_of_song', label: 'End of track' }
              ].map((opt) => {
                const isSelected =
                  sleepTimer &&
                  (sleepTimer.minutes === parseInt(opt.val, 10) ||
                    (opt.val === 'end_of_song' && sleepTimer.type === 'end_of_song'));

                return (
                  <button
                    key={opt.val}
                    className={`fs-context-item ${isSelected ? 'active-item' : ''}`}
                    onClick={() => handleSelectSleepTimer(opt.val, opt.label)}
                  >
                    <span className="fs-context-item-icon">
                      <Moon size={18} />
                    </span>
                    <span className="fs-context-item-label">{opt.label}</span>
                    {isSelected && (
                      <Check size={16} strokeWidth={2.5} color="var(--color-primary)" />
                    )}
                  </button>
                );
              })}

              {sleepTimer && (
                <>
                  <div className="fs-context-divider" />
                  <button
                    className="fs-context-item"
                    style={{ color: '#ff5252' }}
                    onClick={() => handleSelectSleepTimer('off', 'Off')}
                  >
                    <span className="fs-context-item-icon" style={{ color: '#ff5252' }}>
                      <X size={18} />
                    </span>
                    <span className="fs-context-item-label">Turn off sleep timer</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
