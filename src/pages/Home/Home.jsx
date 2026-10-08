import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useHomeData } from './useHomeData';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { LibraryCard } from '../../components/Cards/LibraryCard';
import { SongCard } from '../../components/Cards/SongCard';
import { ArtistCard } from '../../components/Cards/ArtistCard';
import { OnboardingModal } from '../../components/Onboarding/OnboardingModal';
import { TOP_100_ARTISTS } from '../../data/artistsData';
import { storage } from '../../services/storage';
import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  const { data, loading, refetch } = useHomeData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPrefs, setUserPrefs] = useState(() => storage.getPreferences());

  const communityScrollRef = useRef(null);
  const libraryScrollRef = useRef(null);
  const artistsScrollRef = useRef(null);

  // Check if first-time user hasn't completed onboarding
  useEffect(() => {
    if (!storage.hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (preferences) => {
    setUserPrefs(preferences);
    setShowOnboarding(false);
    refetch(preferences);
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Followed artists computation
  const followedNames = userPrefs?.artists || [];
  const followedArtists = TOP_100_ARTISTS.filter(a => followedNames.includes(a.name));
  const displayArtists = followedArtists.length > 0 ? followedArtists : TOP_100_ARTISTS.slice(0, 16);

  if (loading && !data.community.length && !data.quickPicks.length) {
    return (
      <div className="fs-home-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading your music universe...</p>
      </div>
    );
  }

  return (
    <div className="fs-home-page">
      {/* ─── Taste Profile Banner ───────────────────────────────────────── */}
      <div className="fs-home-taste-banner">
        <div className="fs-taste-info">
          <div className="fs-taste-icon-circle">
            <Sparkles size={18} className="text-brand" />
          </div>
          <div>
            <h3 className="fs-taste-title">Personalized Music Feed</h3>
            <p className="fs-taste-desc">
              {followedNames.length > 0
                ? `Tuned for ${followedNames.slice(0, 3).join(', ')}${followedNames.length > 3 ? ` +${followedNames.length - 3} more` : ''}`
                : 'Select your favorite genres & artists to tune your stream'}
            </p>
          </div>
        </div>
        <button
          className="btn-pill fs-tune-btn"
          onClick={() => setShowOnboarding(true)}
          aria-label="Tune taste profile"
        >
          <SlidersHorizontal size={14} />
          <span>Tune Taste</span>
        </button>
      </div>

      {/* ─── Shelf 1: Followed Artists ──────────────────────────────────── */}
      <section className="fs-shelf">
        <div className="fs-shelf-header">
          <div className="fs-shelf-title-wrap">
            <span className="fs-shelf-eyebrow">TOP ARTISTS FOR YOU</span>
            <h2 className="fs-shelf-title">
              {followedArtists.length > 0 ? 'Your Favorite Artists' : 'Explore Top Artists'}
            </h2>
          </div>
          <div className="fs-shelf-controls">
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(artistsScrollRef, 'left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(artistsScrollRef, 'right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div className="fs-shelf-row" ref={artistsScrollRef}>
          {displayArtists.map((artist) => (
            <div key={artist.id} className="fs-shelf-col fs-shelf-col-artist">
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Shelf 2: From the community ──────────────────────────────── */}
      <section className="fs-shelf">
        <div className="fs-shelf-header">
          <div className="fs-shelf-title-wrap">
            <h2 className="fs-shelf-title">From the community</h2>
          </div>
          <div className="fs-shelf-controls">
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(communityScrollRef, 'left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(communityScrollRef, 'right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Horizontal Card Row */}
        <div className="fs-shelf-row" ref={communityScrollRef}>
          {data.community.map((item) => (
            <div key={item.id} className="fs-shelf-col">
              <CommunityCard item={item} />
            </div>
          ))}
        </div>

        {/* Scroll Indicator Bar */}
        <div className="fs-scroll-bar-indicator">
          <div className="fs-scroll-bar-thumb" />
        </div>
      </section>

      {/* ─── Shelf 3: From your library ───────────────────────────────── */}
      <section className="fs-shelf">
        <div className="fs-shelf-header">
          <div className="fs-shelf-title-wrap">
            <h2 className="fs-shelf-title">From your library</h2>
          </div>
          <div className="fs-shelf-controls">
            <Link to="/library" className="btn-pill fs-more-btn">
              More
            </Link>
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(libraryScrollRef, 'left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="btn-icon fs-carousel-btn"
              onClick={() => scroll(libraryScrollRef, 'right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Horizontal Card Row */}
        <div className="fs-shelf-row" ref={libraryScrollRef}>
          {data.library.map((item) => (
            <div key={item.id} className="fs-shelf-col">
              <LibraryCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Shelf 4: Quick picks ─────────────────────────────────────── */}
      {data.quickPicks && data.quickPicks.length > 0 && (
        <section className="fs-shelf">
          <div className="fs-shelf-header">
            <div className="fs-shelf-title-wrap">
              <span className="fs-shelf-eyebrow">START RADIO BASED ON A SONG</span>
              <h2 className="fs-shelf-title">Quick picks</h2>
            </div>
          </div>

          <div className="fs-quickpicks-grid">
            {data.quickPicks.map((song) => (
              <SongCard
                key={song.videoId}
                song={song}
                queueContext={data.quickPicks}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Onboarding Modal ─────────────────────────────────────────── */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
