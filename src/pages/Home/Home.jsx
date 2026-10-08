import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useHomeData } from './useHomeData';
import { usePlayer } from '../../context/PlayerContext';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { SongCard } from '../../components/Cards/SongCard';
import { ArtistCard } from '../../components/Cards/ArtistCard';
import { OnboardingModal } from '../../components/Onboarding/OnboardingModal';
import { TOP_100_ARTISTS } from '../../data/artistsData';
import { storage } from '../../services/storage';
import './Home.css';

export function Home() {
  const { data, loading, refetch } = useHomeData();
  const { currentSong } = usePlayer();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPrefs, setUserPrefs] = useState(() => storage.getPreferences());

  const artistsScrollRef = useRef(null);
  const lastPlayedRef = useRef(null);

  // Check if first-time user hasn't completed onboarding
  useEffect(() => {
    if (!storage.hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  // Listen to playback changes and adapt feed dynamically based on user listening
  useEffect(() => {
    if (currentSong?.videoId && currentSong.videoId !== lastPlayedRef.current) {
      lastPlayedRef.current = currentSong.videoId;
      const timer = setTimeout(() => {
        refetch();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentSong, refetch]);

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
  const displayArtists = followedArtists.length > 0 ? followedArtists : TOP_100_ARTISTS.slice(0, 18);

  const sections = data?.sections || [];

  if (loading && sections.length === 0) {
    return (
      <div className="fs-home-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Curating your dynamic music universe...</p>
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
            <h3 className="fs-taste-title">Smart Algorithmic Feed</h3>
            <p className="fs-taste-desc">
              {followedNames.length > 0
                ? `Tuned for ${followedNames.slice(0, 3).join(', ')}${
                    followedNames.length > 3 ? ` +${followedNames.length - 3} more` : ''
                  } • ${sections.length} dynamic shelves`
                : 'Select your favorite artists & genres to generate 20 personalized sections'}
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
            <span className="fs-shelf-eyebrow">TOP VOICES FOR YOU</span>
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

      {/* ─── Dynamic Algorithmic Shelves (Up to 20 Sections) ─────────────── */}
      {sections.map((section) => {
        const rowId = `fs-shelf-${section.id}`;

        if (section.type === 'quickpicks') {
          return (
            <section key={section.id} className="fs-shelf">
              <div className="fs-shelf-header">
                <div className="fs-shelf-title-wrap">
                  {section.eyebrow && <span className="fs-shelf-eyebrow">{section.eyebrow}</span>}
                  <h2 className="fs-shelf-title">{section.title}</h2>
                </div>
              </div>

              <div className="fs-quickpicks-grid">
                {section.items.map((song) => (
                  <SongCard
                    key={song.videoId}
                    song={song}
                    queueContext={section.items}
                  />
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={section.id} className="fs-shelf">
            <div className="fs-shelf-header">
              <div className="fs-shelf-title-wrap">
                {section.eyebrow && <span className="fs-shelf-eyebrow">{section.eyebrow}</span>}
                <h2 className="fs-shelf-title">{section.title}</h2>
              </div>
              <div className="fs-shelf-controls">
                <button
                  className="btn-icon fs-carousel-btn"
                  onClick={() => {
                    document.getElementById(rowId)?.scrollBy({ left: -480, behavior: 'smooth' });
                  }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  className="btn-icon fs-carousel-btn"
                  onClick={() => {
                    document.getElementById(rowId)?.scrollBy({ left: 480, behavior: 'smooth' });
                  }}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            <div className="fs-shelf-row" id={rowId}>
              {section.items.map((item) => (
                <div key={item.id || item.videoId} className="fs-shelf-col">
                  <CommunityCard item={item} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ─── Onboarding Modal ─────────────────────────────────────────── */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
