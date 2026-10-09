import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, UserCheck, UserPlus, Loader2, User } from 'lucide-react';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import { LibraryCard } from '../../components/Cards/LibraryCard';
import { AlbumCard } from '../../components/Cards/AlbumCard';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './ArtistDetail.css';

export function ArtistDetail() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getArtist(id).then(res => {
      setArtist(res);
      if (res?.name) {
        setIsFollowing(storage.getFollowedArtists().includes(res.name));
      }
      setLoading(false);
    });
  }, [id]);

  // Toggle follow: persists to preferences (localStorage) + cloud DB for logged-in users
  const handleToggleFollow = () => {
    if (!artist?.name) return;
    const next = storage.toggleFollowedArtist(artist.name);
    setIsFollowing(next.includes(artist.name));
    api.syncUserPreferences(storage.getPreferences());
  };

  // Ensure user always lands directly at the top artist banner
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [id, loading]);

  if (loading) {
    return (
      <div className="fs-artist-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading artist profile...</p>
      </div>
    );
  }

  if (!artist || !artist.name) {
    return (
      <div className="fs-artist-loading">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Artist profile could not be loaded.
        </p>
      </div>
    );
  }

  const handlePlayTop = () => {
    if (artist?.topSongs?.length > 0) {
      playSong(artist.topSongs[0], artist.topSongs);
    }
  };

  const avatarSrc = artist.avatarImage || artist.headerImage || getArtistAvatarFallback(artist.name);

  return (
    <div className="fs-artist-page">
      {/* Banner / Header */}
      <div
        className="fs-artist-banner"
        style={{
          backgroundImage: artist?.headerImage
            ? `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%), url(${artist.headerImage})`
            : 'none'
        }}
      >
        <div className="fs-artist-banner-content">
          <div className="fs-artist-avatar-wrap">
            <img
              src={avatarSrc}
              alt={artist.name}
              className="fs-artist-avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getArtistAvatarFallback(artist.name);
              }}
            />
          </div>

          <div className="fs-artist-info">
            <span className="fs-artist-badge">VERIFIED ARTIST</span>
            <h1 className="fs-artist-hero-name">{artist?.name}</h1>
            <p className="fs-artist-subs">{artist?.subscribers || '1.2M listeners'}</p>

            <div className="fs-artist-actions">
              <button
                className="btn btn-primary fs-artist-header-play-btn"
                onClick={handlePlayTop}
                disabled={!artist?.topSongs?.length}
              >
                <Play size={18} fill="#000000" />
                <span>Play</span>
              </button>

              <button
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleToggleFollow}
              >
                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Songs */}
      {artist?.topSongs && artist.topSongs.length > 0 && (
        <section className="fs-artist-section">
          <h2 className="fs-section-title">Popular Tracks</h2>
          <div className="fs-artist-tracks-list">
            {artist.topSongs.map(song => (
              <SongCard key={song.videoId} song={song} queueContext={artist.topSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {artist?.albums && artist.albums.length > 0 && (
        <section className="fs-artist-section">
          <h2 className="fs-section-title">Discography</h2>
          <div className="fs-artist-albums-grid">
            {artist.albums.map(al => (
              <AlbumCard
                key={al.id}
                album={al}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
