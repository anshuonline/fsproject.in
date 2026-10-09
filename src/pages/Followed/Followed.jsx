import React, { useState, useEffect } from 'react';
import { Loader2, Users, SlidersHorizontal } from 'lucide-react';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { ArtistCard } from '../../components/Cards/ArtistCard';
import { SongCard } from '../../components/Cards/SongCard';
import { AlbumCard } from '../../components/Cards/AlbumCard';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { OnboardingModal } from '../../components/Onboarding/OnboardingModal';
import { TOP_100_ARTISTS } from '../../data/artistsData';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './Followed.css';

const MAX_FEED_ARTISTS = 12;
const MAX_PLAYLIST_ARTISTS = 4;

export function Followed() {
  const [followedNames, setFollowedNames] = useState(() => storage.getFollowedArtists());
  const [artistData, setArtistData] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Re-sync whenever follow state changes (ArtistDetail, this page, onboarding)
  useEffect(() => {
    const syncFromStorage = () => setFollowedNames(storage.getFollowedArtists());
    window.addEventListener('fs_followed_changed', syncFromStorage);
    return () => window.removeEventListener('fs_followed_changed', syncFromStorage);
  }, []);

  // Build feed strictly from followed artists' songs, albums & playlists
  useEffect(() => {
    if (followedNames.length === 0) {
      setArtistData([]);
      setPlaylists([]);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const fetchFeed = async () => {
      const targets = followedNames.slice(0, MAX_FEED_ARTISTS);

      const artistResults = await Promise.all(
        targets.map(name => api.getArtist(name))
      );
      if (cancelled) return;
      const validArtists = artistResults.filter(Boolean);
      setArtistData(validArtists);

      const plResults = await Promise.all(
        targets.slice(0, MAX_PLAYLIST_ARTISTS).map(name =>
          api.search(`${name}`, 'playlists', 3)
        )
      );
      if (cancelled) return;
      const seen = new Set();
      const merged = [];
      plResults.filter(Boolean).forEach(res => {
        (res.playlists || []).forEach(p => {
          if (p && p.id && !seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        });
      });
      setPlaylists(merged.slice(0, 12));
      setLoading(false);
    };

    fetchFeed();
    return () => { cancelled = true; };
  }, [followedNames]);

  const curatedByName = new Map(TOP_100_ARTISTS.map(a => [a.name, a]));
  const followedArtists = followedNames.map(name => {
    const curated = curatedByName.get(name);
    if (curated) return curated;
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      image: getArtistAvatarFallback(name)
    };
  });

  const seenVideos = new Set();
  const feedSongs = [];
  artistData.forEach(a => {
    (a.topSongs || []).forEach(s => {
      if (s && s.videoId && !seenVideos.has(s.videoId)) {
        seenVideos.add(s.videoId);
        feedSongs.push(s);
      }
    });
  });
  const displaySongs = feedSongs.slice(0, 36);

  const seenAlbums = new Set();
  const feedAlbums = [];
  artistData.forEach(a => {
    (a.albums || []).forEach(al => {
      if (al && al.id && !seenAlbums.has(al.id)) {
        seenAlbums.add(al.id);
        feedAlbums.push(al);
      }
    });
  });
  const displayAlbums = feedAlbums.slice(0, 24);

  if (followedNames.length === 0) {
    return (
      <div className="fs-followed-page">
        <div className="fs-followed-empty">
          <div className="fs-followed-empty-icon">
            <Users size={32} />
          </div>
          <h2>No followed artists yet</h2>
          <p>Follow artists to build your personal feed of only their songs, albums & playlists.</p>
          <button className="btn btn-primary fs-followed-empty-btn" onClick={() => setShowOnboarding(true)}>
            <SlidersHorizontal size={16} />
            <span>Tune Your Taste</span>
          </button>
        </div>
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setShowOnboarding(false);
            setFollowedNames(storage.getFollowedArtists());
          }}
        />
      </div>
    );
  }

  return (
    <div className="fs-followed-page">
      {/* ─── Hero Banner ─────────────────────────────────────────────── */}
      <div className="fs-followed-hero">
        <div className="fs-followed-hero-info">
          <div className="fs-followed-hero-icon">
            <Users size={20} />
          </div>
          <div>
            <h2 className="fs-followed-title">Followed Artists</h2>
            <p className="fs-followed-sub">
              {followedNames.length} artist{followedNames.length === 1 ? '' : 's'} followed
              {loading ? ' • building their feed...' : ' • feed shows only their music'}
            </p>
          </div>
        </div>
        <button className="btn-pill fs-followed-tune-btn" onClick={() => setShowOnboarding(true)} aria-label="Tune taste profile">
          <SlidersHorizontal size={14} />
          <span>Tune Taste</span>
        </button>
      </div>

      {/* ─── Artists You Follow ──────────────────────────────────────── */}
      <section className="fs-followed-shelf">
        <div className="fs-followed-shelf-header">
          <div className="fs-followed-title-wrap">
            <span className="fs-followed-eyebrow">YOUR ARTISTS</span>
            <h3 className="fs-followed-shelf-title">Artists You Follow</h3>
          </div>
        </div>
        <div className="fs-followed-artists-grid">
          {followedArtists.map(artist => (
            <ArtistCard key={artist.id || artist.name} artist={artist} />
          ))}
        </div>
      </section>

      {/* ─── Songs (strictly followed artists) ───────────────────────── */}
      {displaySongs.length > 0 && (
        <section className="fs-followed-shelf">
          <div className="fs-followed-shelf-header">
            <div className="fs-followed-title-wrap">
              <span className="fs-followed-eyebrow">SONGS</span>
              <h3 className="fs-followed-shelf-title">Popular Songs by Your Artists</h3>
            </div>
          </div>
          <div className="fs-followed-songs-grid">
            {displaySongs.map(song => (
              <SongCard key={song.videoId} song={song} queueContext={displaySongs} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Albums & Singles (strictly followed artists) ────────────── */}
      {displayAlbums.length > 0 && (
        <section className="fs-followed-shelf">
          <div className="fs-followed-shelf-header">
            <div className="fs-followed-title-wrap">
              <span className="fs-followed-eyebrow">RELEASES</span>
              <h3 className="fs-followed-shelf-title">Albums & Singles</h3>
            </div>
          </div>
          <div className="fs-followed-albums-grid">
            {displayAlbums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Playlists featuring followed artists ────────────────────── */}
      {playlists.length > 0 && (
        <section className="fs-followed-shelf">
          <div className="fs-followed-shelf-header">
            <div className="fs-followed-title-wrap">
              <span className="fs-followed-eyebrow">PLAYLISTS</span>
              <h3 className="fs-followed-shelf-title">Playlists Featuring Your Artists</h3>
            </div>
          </div>
          <div className="fs-followed-playlist-row">
            {playlists.map(pl => (
              <div key={pl.id} className="fs-followed-pl-col">
                <CommunityCard item={pl} />
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="fs-followed-loading-bar">
          <Loader2 size={15} className="spin" />
          <span>Updating feed with your followed artists...</span>
        </div>
      )}

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          setFollowedNames(storage.getFollowedArtists());
        }}
      />
    </div>
  );
}
