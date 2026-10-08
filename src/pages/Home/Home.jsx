import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useHomeData } from './useHomeData';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { LibraryCard } from '../../components/Cards/LibraryCard';
import { SongCard } from '../../components/Cards/SongCard';
import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  const { data, loading, error } = useHomeData();
  const communityScrollRef = useRef(null);
  const libraryScrollRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="fs-home-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading your music universe...</p>
      </div>
    );
  }

  return (
    <div className="fs-home-page">
      {/* ─── Shelf 1: From the community ──────────────────────────────── */}
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

      {/* ─── Shelf 2: From your library ───────────────────────────────── */}
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

      {/* ─── Shelf 3: Quick picks ─────────────────────────────────────── */}
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
    </div>
  );
}
