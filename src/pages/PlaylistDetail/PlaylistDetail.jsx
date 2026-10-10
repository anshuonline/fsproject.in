import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Loader2, Clock, MoreHorizontal, BookmarkPlus, BookmarkCheck, Pencil } from 'lucide-react';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { PlaylistCover } from '../../components/Common/PlaylistCover';
import { SongCard } from '../../components/Cards/SongCard';
import { useSeo } from '../../services/seo';
import './PlaylistDetail.css';

export function PlaylistDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryName = searchParams.get('name');
  const { playlists, saveExternalPlaylist, getSavedClone } = useLibrary();
  const { playSong } = usePlayer();
  const { openPlaylistMenu, openEditPlaylistModal, showToast } = useContextMenu();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Playlists are personalized content: keep them out of search indexes
  useSeo({
    title: playlist ? `${playlist.name || 'Playlist'} - Free Playlist | freesong.in` : undefined,
    description: playlist?.description || undefined,
    noindex: true
  });

  // Check if this playlist is a user-created local playlist
  const isCustom = playlists.some(p => p.id === id);
  // Check if this external playlist is already saved in the user's library
  const savedClone = !isCustom ? getSavedClone(id) : null;

  useEffect(() => {
    // Check if it's a user-created local playlist
    const local = playlists.find(p => p.id === id);
    if (local) {
      setPlaylist({
        id: local.id,
        title: local.name,
        name: local.name,
        description: local.description || '',
        creator: 'You',
        songs: local.songs || [],
        coverImage: local.coverImage || null
      });
      setLoading(false);
      return;
    }

    // Otherwise fetch from ytmusic-api
    setLoading(true);
    api.getPlaylist(id).then(res => {
      if (res) {
        if (queryName && (!res.title || res.title === 'Playlist')) {
          res.title = queryName;
        }
        setPlaylist(res);
      } else {
        setPlaylist({
          id,
          title: queryName || 'Playlist',
          creator: 'Community',
          songs: []
        });
      }
      setLoading(false);
    });
  }, [id, queryName, playlists]);

  // Ensure user always lands directly at the top playlist header
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [id, loading]);

  if (loading) {
    return (
      <div className="fs-pl-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading playlist tracks...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleShufflePlay = () => {
    if (playlist?.songs?.length > 0) {
      const shuffled = [...playlist.songs].sort(() => 0.5 - Math.random());
      playSong(shuffled[0], shuffled);
    }
  };

  const handleSavePlaylist = () => {
    if (!playlist) return;
    const cloned = saveExternalPlaylist(playlist);
    if (cloned) {
      showToast(`Saved "${cloned.name}" to your Library! Opening editable copy...`, 'success');
      navigate(`/playlist/${cloned.id}`);
    }
  };

  return (
    <div className="fs-pl-page">
      <div
        className="fs-pl-hero"
        onContextMenu={(e) => {
          if (playlist) openPlaylistMenu(playlist, e);
        }}
      >
        <div
          className={`fs-pl-cover-wrapper ${isCustom ? 'is-editable' : ''}`}
          onClick={() => {
            if (isCustom && playlist) openEditPlaylistModal(playlist);
          }}
          title={isCustom ? 'Click to edit playlist details & cover' : undefined}
        >
          <PlaylistCover playlist={playlist} size="hero" className="fs-pl-hero-cover" />
          {isCustom && (
            <div className="fs-pl-cover-edit-badge">
              <Pencil size={18} />
              <span>Change cover</span>
            </div>
          )}
        </div>

        <div className="fs-pl-hero-meta">
          <span className="fs-pl-type">PLAYLIST</span>
          <h1 className="fs-pl-title">{playlist?.title}</h1>
          {playlist?.description && (
            <p className="fs-pl-desc">{playlist.description}</p>
          )}
          <p className="fs-pl-sub">
            {playlist?.creator || 'FreeSong'} • {playlist?.songs?.length || 0} songs
          </p>

          <div className="fs-pl-actions">
            <button
              type="button"
              className="btn btn-primary fs-pl-play-btn"
              onClick={handlePlayAll}
              disabled={!playlist?.songs?.length}
            >
              <Play size={18} fill="#000000" />
              <span>Play All</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary fs-pl-shuffle-btn"
              onClick={handleShufflePlay}
              disabled={!playlist?.songs?.length}
            >
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>

            {/* Save / Clone Playlist Button for External Playlists */}
            {!isCustom && (
              savedClone ? (
                <button
                  type="button"
                  className="btn btn-secondary fs-pl-saved-btn"
                  onClick={() => navigate(`/playlist/${savedClone.id}`)}
                  title="View your saved copy"
                >
                  <BookmarkCheck size={18} className="text-brand" />
                  <span>Saved in Library</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary fs-pl-save-btn"
                  onClick={handleSavePlaylist}
                  title="Save an editable clone of this playlist to your Library"
                >
                  <BookmarkPlus size={18} />
                  <span>Save Playlist</span>
                </button>
              )
            )}

            {/* Edit Playlist Button for User's Own Playlists */}
            {isCustom && (
              <button
                type="button"
                className="btn btn-secondary fs-pl-edit-btn"
                onClick={() => openEditPlaylistModal(playlist)}
                title="Edit playlist details"
              >
                <Pencil size={18} />
                <span>Edit Playlist</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-icon fs-pl-more-btn"
              onClick={(e) => {
                if (playlist) openPlaylistMenu(playlist, e);
              }}
              title="Playlist options"
              aria-label="Playlist options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Spotify-Style Track List Container */}
      <div className="fs-pl-tracks-container">
        {playlist?.songs?.length > 0 && (
          <div className="fs-pl-table-header">
            <span className="fs-pl-th fs-pl-th-num">#</span>
            <span className="fs-pl-th fs-pl-th-title">TITLE</span>
            <span className="fs-pl-th fs-pl-th-time">
              <Clock size={16} />
            </span>
            <span className="fs-pl-th-actions-spacer" />
          </div>
        )}

        <div className="fs-pl-tracks-list">
          {playlist?.songs?.length === 0 ? (
            <div className="fs-pl-empty">
              <p>No songs found in this playlist.</p>
            </div>
          ) : (
            playlist?.songs?.map((song, idx) => (
              <SongCard
                key={song.videoId || idx}
                song={song}
                queueContext={playlist.songs}
                index={idx}
                playlistId={isCustom ? playlist.id : null}
                isUserPlaylist={isCustom}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
