import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film, Flame, Coffee, Heart, Music, Sparkles, Mic, Zap, Loader2,
  Headphones, Radio, Volume2, Disc, BookOpen, Activity, Sliders, Moon, Compass,
  Play, Pause, TrendingUp, Disc3
} from 'lucide-react';
import { api } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import { SongTileCard } from '../../components/Cards/SongTileCard';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { Shelf } from '../../components/Common/Shelf';
import './Explore.css';

const ICON_MAP = {
  Film,
  Flame,
  Coffee,
  Heart,
  Guitar: Music,
  Music,
  Sparkles,
  Mic,
  Zap,
  Headphones,
  Radio,
  Volume2,
  Disc,
  Disc3,
  BookOpen,
  Activity,
  Sliders,
  Moon,
  Compass
};

export function Explore() {
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  useEffect(() => {
    let cancelled = false;
    api.getExploreFeed().then(data => {
      if (!cancelled) {
        setExploreData(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryClick = (cat) => {
    const q = cat.query || cat.name || '';
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const spotlight = exploreData?.spotlight || null;
  const trendingNow = exploreData?.trendingNow || [];
  const freshDrops = exploreData?.freshDrops || [];
  const newAlbums = exploreData?.newAlbums || [];
  const moodShelves = exploreData?.moodShelves || [];
  const categories = exploreData?.categories || [];

  const isSpotlightCurrent = spotlight && currentSong?.videoId === spotlight.videoId;

  const handleSpotlightPlay = () => {
    if (!spotlight) return;
    if (isSpotlightCurrent) {
      togglePlay();
    } else {
      playSong(spotlight, trendingNow.length > 0 ? trendingNow : [spotlight]);
    }
  };

  if (loading) {
    return (
      <div className="fs-explore-page">
        {/* Skeleton Spotlight */}
        <div className="fs-skeleton-spotlight shimmer" />

        {/* Skeleton tiles */}
        {[0, 1].map(row => (
          <div key={row} className="fs-skeleton-section">
            <div className="fs-skeleton-line shimmer" style={{ width: '220px', height: '26px' }} />
            <div className="fs-skeleton-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="fs-skeleton-tile shimmer" />
              ))}
            </div>
          </div>
        ))}

        {/* Skeleton moods */}
        <div className="fs-skeleton-section">
          <div className="fs-skeleton-line shimmer" style={{ width: '180px', height: '26px' }} />
          <div className="fs-moods-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="fs-skeleton-mood shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!exploreData || (categories.length === 0 && trendingNow.length === 0 && moodShelves.length === 0)) {
    return (
      <div className="fs-explore-page">
        <div className="fs-explore-empty">
          <Compass size={40} className="text-brand" />
          <h2>Nothing to explore right now</h2>
          <p>Check your connection and try again in a moment.</p>
          <button className="fs-explore-retry" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fs-explore-page">
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="fs-explore-header">
        <div>
          <h1 className="fs-explore-heading">Explore</h1>
          <p className="fs-explore-sub">Live charts, fresh drops & moods tuned for you</p>
        </div>
        <span className="fs-explore-live-badge">
          <TrendingUp size={14} />
          Live Official Charts
        </span>
      </div>

      {/* ─── Spotlight Hero (Trending #1) ────────────────────────────────── */}
      {spotlight && (
        <div className={`fs-explore-spotlight ${isSpotlightCurrent && isPlaying ? 'playing' : ''}`}>
          <div className="fs-spotlight-art">
            <img
              src={spotlight.thumbnail || (spotlight.videoId ? `https://i.ytimg.com/vi/${spotlight.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp')}
              alt={spotlight.title}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="fs-spotlight-info">
            <span className="fs-spotlight-eyebrow">
              <TrendingUp size={14} />
              {spotlight.chartLabel || 'Trending #1'}
            </span>
            <h2 className="fs-spotlight-title" title={spotlight.title}>{spotlight.title}</h2>
            <p className="fs-spotlight-artist">{spotlight.artist}</p>
            <div className="fs-spotlight-actions">
              <button className="fs-spotlight-play-btn" onClick={handleSpotlightPlay}>
                {isSpotlightCurrent && isPlaying ? <Pause size={20} fill="#000000" /> : <Play size={20} fill="#000000" />}
                <span>{isSpotlightCurrent && isPlaying ? 'Pause' : 'Play Now'}</span>
              </button>
              <button
                className="fs-spotlight-radio-btn"
                onClick={() => navigate(`/search?q=${encodeURIComponent(spotlight.artist || '')}`)}
              >
                More from artist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Trending Now (Official Chart Carousel) ──────────────────────── */}
      {trendingNow.length > 0 && (
        <Shelf eyebrow="OFFICIAL LIVE CHART • INDIA" title="Trending Now" carousel>
          {trendingNow.map((song, i) => (
            <div className="fs-explore-card-col" key={song.videoId}>
              <SongTileCard song={song} queueContext={trendingNow} rank={i + 1} />
            </div>
          ))}
        </Shelf>
      )}

      {/* ─── Moods & Genres (Browse Grid) ───────────────────────────────── */}
      {categories.length > 0 && (
        <Shelf eyebrow="BROWSE ALL" title="Moods & Genres">
          <div className="fs-moods-grid">
            {categories.map(cat => {
              const Icon = ICON_MAP[cat.icon] || Music;
              return (
                <button
                  key={cat.id}
                  className="fs-mood-tile"
                  style={{ background: `linear-gradient(140deg, ${cat.color}, color-mix(in srgb, ${cat.color} 38%, #000000))` }}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span className="fs-mood-tile-name">{cat.name}</span>
                  <span className="fs-mood-tile-icon">
                    <Icon size={52} strokeWidth={1.6} />
                  </span>
                </button>
              );
            })}
          </div>
        </Shelf>
      )}

      {/* ─── Fresh Drops (Row List Layout) ──────────────────────────────── */}
      {freshDrops.length > 0 && (
        <Shelf eyebrow="NEW MUSIC • OFFICIAL RELEASES" title="Latest Releases & Fresh Drops">
          {freshDrops.map(song => (
            <SongCard key={song.videoId} song={song} queueContext={freshDrops} />
          ))}
        </Shelf>
      )}

      {/* ─── New Albums & Singles (Album Carousel) ──────────────────────── */}
      {newAlbums.length > 0 && (
        <Shelf eyebrow="OFFICIAL NEW RELEASES" title="New Albums & Singles" carousel>
          {newAlbums.map(alb => (
            <div className="fs-explore-card-col" key={alb.id}>
              <CommunityCard item={alb} />
            </div>
          ))}
        </Shelf>
      )}

      {/* ─── Smart Mood Shelves (Alternating Layouts) ───────────────────── */}
      {moodShelves.map((shelf, index) => {
        const isCarousel = index % 2 === 0;
        return (
          <Shelf
            key={shelf.id}
            eyebrow={shelf.eyebrow}
            title={shelf.title}
            carousel={isCarousel}
          >
            {isCarousel
              ? shelf.songs.map(song => (
                  <div className="fs-explore-card-col" key={song.videoId}>
                    <SongTileCard song={song} queueContext={shelf.songs} />
                  </div>
                ))
              : shelf.songs.map(song => (
                  <SongCard key={song.videoId} song={song} queueContext={shelf.songs} />
                ))}
          </Shelf>
        );
      })}
    </div>
  );
}
