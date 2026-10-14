import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Play, UserCheck, UserPlus, Loader2, User } from 'lucide-react';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import { LibraryCard } from '../../components/Cards/LibraryCard';
import { AlbumCard } from '../../components/Cards/AlbumCard';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import { useSeo } from '../../services/seo';
import './ArtistDetail.css';

export function ArtistDetail() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [discoFilter, setDiscoFilter] = useState('all'); // 'all' | 'albums' | 'singles'

  const allReleases = useMemo(() => {
    const albList = (artist?.albums || []).map(a => ({ ...a, type: a.type || 'album' }));
    const sglList = (artist?.singles || []).map(s => ({ ...s, type: 'single' }));
    if (discoFilter === 'albums') return albList;
    if (discoFilter === 'singles') return sglList;
    return [...albList, ...sglList];
  }, [artist?.albums, artist?.singles, discoFilter]);

  // Real artist name once metadata loads (long-tail SEO & structured data)
  const artistJsonLd = useMemo(() => {
    if (!artist?.name) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      'name': artist.name,
      'url': `https://freesong.in/artist/${id}`,
      'image': artist.thumbnail || '/images/freesonglogowebp.webp',
      'description': `Listen to ${artist.name} songs online free with synced lyrics on FreeSong.in. Stream top tracks, albums, singles and discography ads free in HD audio.`,
      'genre': ['Bollywood', 'Hindi', 'Indian Pop', 'Punjabi'],
      'track': (artist.songs || []).slice(0, 10).map((s, idx) => ({
        '@type': 'MusicRecording',
        'position': idx + 1,
        'name': s.title || s.name,
        'url': `https://freesong.in/song/${s.videoId || s.id}`
      }))
    };
  }, [artist, id]);

  useSeo({
    title: artist?.name ? `${artist.name} Songs - Listen Free Songs Online | FreeSong.in` : undefined,
    description: artist?.name
      ? `Listen to ${artist.name} songs online free on FreeSong.in. Stream ${artist.name}'s top hits, albums, singles and full discography with live synced lyrics and zero ads in studio HD audio.`
      : undefined,
    keywords: artist?.name
      ? `${artist.name} songs, listen ${artist.name} songs, ${artist.name} online songs, ${artist.name} free song, ${artist.name} hit songs, ${artist.name} albums, ${artist.name} discography, free songs online, freesong.in`
      : undefined,
    image: artist?.thumbnail || undefined,
    jsonLd: artistJsonLd,
    jsonLdId: 'artist-seo-jsonld'
  });

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

      {/* Discography */}
      {allReleases.length > 0 && (
        <section className="fs-artist-section">
          <div className="fs-artist-section-header">
            <h2 className="fs-section-title">Discography</h2>
            {artist?.singles?.length > 0 && (
              <div className="fs-artist-disco-filters">
                <button
                  type="button"
                  className={`fs-disco-pill ${discoFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setDiscoFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`fs-disco-pill ${discoFilter === 'albums' ? 'active' : ''}`}
                  onClick={() => setDiscoFilter('albums')}
                >
                  Albums ({artist.albums?.length || 0})
                </button>
                <button
                  type="button"
                  className={`fs-disco-pill ${discoFilter === 'singles' ? 'active' : ''}`}
                  onClick={() => setDiscoFilter('singles')}
                >
                  Singles ({artist.singles?.length || 0})
                </button>
              </div>
            )}
          </div>
          <div className="fs-artist-albums-grid">
            {allReleases.map(al => (
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
