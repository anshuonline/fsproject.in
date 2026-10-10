import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useHomeData } from './useHomeData';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { SongCard } from '../../components/Cards/SongCard';
import { ArtistCard } from '../../components/Cards/ArtistCard';
import { OnboardingModal } from '../../components/Onboarding/OnboardingModal';
import { SeoContentSection } from '../../components/Common/SeoContentSection';
import { TOP_100_ARTISTS } from '../../data/artistsData';
import { storage } from '../../services/storage';
import './Home.css';

// ─── Memoized shelves ────────────────────────────────────────────────────────
// Home intentionally does NOT subscribe to PlayerContext: the 500ms progress
// ticker re-renders context consumers, and without memoized shelves that would
// re-render 300+ cards twice per second. These memo walls keep it silky.

const ArtistsShelf = memo(function ArtistsShelf({ artists, title }) {
  const rowRef = useRef(null);

  const scroll = useCallback((direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: direction === 'left' ? -480 : 480, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="fs-shelf">
      <div className="fs-shelf-header">
        <div className="fs-shelf-title-wrap">
          <span className="fs-shelf-eyebrow">TOP VOICES FOR YOU</span>
          <h2 className="fs-shelf-title">{title}</h2>
        </div>
        <div className="fs-shelf-controls">
          <button className="btn-icon fs-carousel-btn" onClick={() => scroll('left')} aria-label="Scroll left">
            <ChevronLeft size={22} />
          </button>
          <button className="btn-icon fs-carousel-btn" onClick={() => scroll('right')} aria-label="Scroll right">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="fs-shelf-row" ref={rowRef}>
        {artists.map((artist) => (
          <div key={artist.id} className="fs-shelf-col fs-shelf-col-artist">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </section>
  );
});

const QuickPicksShelf = memo(function QuickPicksShelf({ section }) {
  return (
    <section className="fs-shelf">
      <div className="fs-shelf-header">
        <div className="fs-shelf-title-wrap">
          {section.eyebrow && <span className="fs-shelf-eyebrow">{section.eyebrow}</span>}
          <h2 className="fs-shelf-title">{section.title}</h2>
        </div>
      </div>

      <div className="fs-quickpicks-grid">
        {section.items.map((song) => (
          <SongCard key={song.videoId} song={song} queueContext={section.items} />
        ))}
      </div>
    </section>
  );
});

const SectionShelf = memo(function SectionShelf({ section }) {
  const rowRef = useRef(null);

  const scroll = useCallback((direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: direction === 'left' ? -480 : 480, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="fs-shelf">
      <div className="fs-shelf-header">
        <div className="fs-shelf-title-wrap">
          {section.eyebrow && <span className="fs-shelf-eyebrow">{section.eyebrow}</span>}
          <h2 className="fs-shelf-title">{section.title}</h2>
        </div>
        <div className="fs-shelf-controls">
          <button className="btn-icon fs-carousel-btn" onClick={() => scroll('left')} aria-label="Scroll left">
            <ChevronLeft size={22} />
          </button>
          <button className="btn-icon fs-carousel-btn" onClick={() => scroll('right')} aria-label="Scroll right">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="fs-shelf-row" ref={rowRef}>
        {section.items.map((item) => (
          <div key={item.id || item.videoId} className="fs-shelf-col">
            <CommunityCard item={item} queueContext={section.items} />
          </div>
        ))}
      </div>
    </section>
  );
});

export function Home() {
  const { data, loading, refetch } = useHomeData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPrefs, setUserPrefs] = useState(() => storage.getPreferences());

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

      {/* ─── Real-Time Updating Indicator ────────────────────────────────── */}
      {loading && sections.length > 0 && (
        <div className="fs-feed-updating-bar">
          <Loader2 size={16} className="spin text-brand" />
          <span>Updating your feed with your new taste profile...</span>
        </div>
      )}

      {/* ─── Shelf 1: Followed Artists ──────────────────────────────────── */}
      <ArtistsShelf
        artists={displayArtists}
        title={followedArtists.length > 0 ? 'Your Favorite Artists' : 'Explore Top Artists'}
      />

      {/* ─── Dynamic Algorithmic Shelves (Up to 20 Sections) ─────────────── */}
      {sections.map((section) =>
        section.type === 'quickpicks' ? (
          <QuickPicksShelf key={section.id} section={section} />
        ) : (
          <SectionShelf key={section.id} section={section} />
        )
      )}

      {/* ─── SEO Discovery & Why FreeSong Section ──────────────────────── */}
      <SeoContentSection />

      {/* ─── Onboarding Modal ─────────────────────────────────────────── */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
