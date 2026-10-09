import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Music,
  Film,
  Flame,
  Activity,
  Zap,
  Heart,
  Disc,
  Volume2,
  Coffee,
  Mic,
  Headphones,
  Radio,
  BookOpen,
  Sliders,
  Moon,
  Compass,
  X
} from 'lucide-react';
import { TOP_100_ARTISTS, GENRES_LIST } from '../../data/artistsData';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { useToast } from '../../context/ContextMenuContext';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './OnboardingModal.css';

const GENRE_ICON_COMPONENTS = {
  Film,
  Flame,
  Activity,
  Zap,
  Heart,
  Music,
  Disc,
  Volume2,
  Coffee,
  Mic,
  Headphones,
  Radio,
  Sparkles,
  BookOpen,
  Sliders,
  Moon,
  Compass
};

function renderGenreIcon(iconName) {
  const IconComp = GENRE_ICON_COMPONENTS[iconName] || Music;
  return <IconComp size={24} className="fs-genre-spotify-svg" />;
}

export function OnboardingModal({ isOpen, onComplete, onClose }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1 = Genres, 2 = Artists
  const [selectedGenres, setSelectedGenres] = useState(() => storage.getPreferences()?.genres || []);
  const [selectedArtists, setSelectedArtists] = useState(() => storage.getPreferences()?.artists || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const bodyRef = useRef(null);

  // Re-sync with current preferences whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const current = storage.getPreferences();
      setSelectedGenres(current?.genres || []);
      setSelectedArtists(current?.artists || []);
      setStep(1);
      setSearchQuery('');
      setActiveCategory('All');
    }
  }, [isOpen]);

  // Reset body scroll when switching steps
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [step]);

  if (!isOpen) return null;

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(g => g !== genreId) : [...prev, genreId]
    );
  };

  const toggleArtist = (artistName) => {
    setSelectedArtists(prev =>
      prev.includes(artistName) ? prev.filter(a => a !== artistName) : [...prev, artistName]
    );
  };

  const handleContinueToArtists = () => {
    if (selectedGenres.length === 0) {
      showToast('Please select at least 1 genre to continue', 'error');
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    if (selectedGenres.length === 0) {
      showToast('Please select at least 1 genre to continue', 'error');
      setStep(1);
      return;
    }
    if (selectedArtists.length === 0) {
      showToast('Please select at least 1 artist to start listening', 'error');
      return;
    }

    const preferences = {
      genres: selectedGenres,
      artists: selectedArtists,
      updatedAt: new Date().toISOString()
    };
    storage.savePreferences(preferences);

    // Save to Hostinger Cloud MySQL
    const currentUser = storage.getUser();
    if (currentUser?.email || currentUser?.dbId) {
      api.saveUserPreferences(currentUser.dbId || currentUser.email || currentUser.id, preferences, currentUser.email).catch(console.warn);
    }

    showToast('Taste profile personalized successfully!', 'success');
    if (onComplete) onComplete(preferences);
  };

  // Filter artists
  const filteredArtists = TOP_100_ARTISTS.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = activeCategory === 'All';
    if (!matchesCategory) {
      if (activeCategory === 'South') {
        matchesCategory = artist.category === 'South' || /tamil|telugu|malayalam|kannada/i.test(artist.genre);
      } else if (activeCategory === 'Haryanvi') {
        matchesCategory = /haryanvi/i.test(artist.genre) || /haryanvi/i.test(artist.category);
      } else if (activeCategory === 'Bengali') {
        matchesCategory = /bengali/i.test(artist.genre) || /bengali/i.test(artist.category);
      } else if (activeCategory === 'Bhojpuri') {
        matchesCategory = /bhojpuri/i.test(artist.genre) || /bhojpuri/i.test(artist.category);
      } else {
        matchesCategory = artist.category === activeCategory;
      }
    }
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Hindi', 'Punjabi', 'South', 'Haryanvi', 'Bengali', 'Bhojpuri', 'English', 'Indie', 'Devotional'];

  return (
    <div className="fs-onboarding-backdrop">
      <div className="fs-onboarding-modal" onClick={(e) => e.stopPropagation()}>
        {/* Spotify-style Top Stepper Progress Line */}
        <div className="fs-onboarding-progress-track">
          <div className={`fs-onboarding-progress-bar ${step >= 1 ? 'active' : ''}`} />
          <div className={`fs-onboarding-progress-bar ${step >= 2 ? 'active' : ''}`} />
        </div>

        {/* Modal Header (No Close Button - Mandatory Selection) */}
        <div className="fs-onboarding-header">
          <div className="fs-onboarding-brand">
            <img src="/images/freesonglogowebp.webp" alt="FreeSong" className="fs-onboarding-logo" />
            <div className="fs-onboarding-title-wrap">
              <div className="fs-onboarding-badge-row">
                <span className="fs-onboarding-step-badge">
                  STEP {step} OF 2 • {step === 1 ? 'PICK YOUR GENRES' : 'FAVORITE ARTISTS'}
                </span>
                <span className="fs-onboarding-counter-badge">
                  {step === 1
                    ? selectedGenres.length === 0
                      ? 'Required: 1+'
                      : `${selectedGenres.length} selected`
                    : selectedArtists.length === 0
                      ? 'Required: 1+'
                      : `${selectedArtists.length} followed`}
                </span>
              </div>
              <h2 className="fs-onboarding-title">
                {step === 1 ? 'What music do you love?' : 'Follow your favorite artists'}
              </h2>
              <p className="fs-onboarding-subtitle">
                {step === 1
                  ? 'Choose genres you like to customize your recommendations and daily mixes'
                  : 'Select artists to tailor your personalized algorithmic shelves'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Artist search toolbar pinned OUTSIDE the scroll body so the
            artist grid scrolls cleanly beneath it without peeking above */}
        {step === 2 && (
          <div className="fs-artists-toolbar">
            <div className="fs-artists-search-wrap">
              <Search size={16} className="fs-search-icon-sm" />
              <input
                type="text"
                placeholder="Search 100+ top artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="fs-artists-search-input"
              />
              {searchQuery && (
                <button
                  className="btn-icon fs-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="fs-artists-cat-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`fs-cat-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="fs-onboarding-body" ref={bodyRef}>
          {step === 1 ? (
            /* ─── Step 1: Spotify-Style Vibrant Genre Tiles ───────────── */
            <div className="fs-onboarding-genres-grid">
              {GENRES_LIST.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <div
                    key={genre.id}
                    className={`fs-genre-spotify-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${genre.color} 0%, rgba(18, 18, 18, 0.94) 115%)`
                    }}
                    onClick={() => toggleGenre(genre.id)}
                  >
                    <div className="fs-genre-card-top">
                      <span className="fs-genre-spotify-name">{genre.name}</span>
                      {isSelected && (
                        <div className="fs-genre-check-pill">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="fs-genre-card-bottom">
                      <div className="fs-genre-icon-bubble">
                        {renderGenreIcon(genre.icon)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Step 2: 100 Artists Grid with Spotify Styling ───────── */
            <div className="fs-onboarding-artists-container">
              {/* Grid of Artist Circles */}
              {filteredArtists.length === 0 ? (
                <div className="fs-artists-empty">
                  <p>No artists found matching "{searchQuery}"</p>
                  <button
                    className="btn btn-secondary fs-back-pill-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="fs-artists-circle-grid">
                  {filteredArtists.map((artist) => {
                    const isSelected = selectedArtists.includes(artist.name);
                    return (
                      <div
                        key={artist.id}
                        className={`fs-artist-spotify-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArtist(artist.name)}
                      >
                        <div className="fs-artist-circle-wrap">
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="fs-artist-circle-img"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getArtistAvatarFallback(artist.name);
                            }}
                          />
                          {isSelected && (
                            <div className="fs-artist-check-pill">
                              <Check size={13} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <span className="fs-artist-circle-name truncate" title={artist.name}>
                          {artist.name}
                        </span>
                        <span className="fs-artist-circle-genre truncate" title={artist.genre}>
                          {artist.genre}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="fs-onboarding-footer">
          <div className="fs-onboarding-footer-left">
            {step === 2 && (
              <button
                className="btn btn-secondary fs-back-pill-btn"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <div className="fs-onboarding-stats-note">
              {step === 1 ? (
                selectedGenres.length === 0 ? (
                  <span className="text-muted">Select at least 1 genre to continue</span>
                ) : (
                  <span className="text-brand-light">
                    {selectedGenres.length} genre{selectedGenres.length === 1 ? '' : 's'} selected
                  </span>
                )
              ) : selectedArtists.length === 0 ? (
                <span className="text-muted">Select at least 1 artist to complete</span>
              ) : (
                <span className="text-brand-light">
                  {selectedArtists.length} artist{selectedArtists.length === 1 ? '' : 's'} followed
                </span>
              )}
            </div>
          </div>

          <div className="fs-onboarding-actions">
            {step === 1 ? (
              <button
                className={`btn btn-primary fs-continue-pill-btn ${
                  selectedGenres.length === 0 ? 'btn-dimmed' : ''
                }`}
                onClick={handleContinueToArtists}
              >
                <span>Continue to Artists</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className={`btn btn-primary fs-finish-pill-btn ${
                  selectedArtists.length === 0 ? 'btn-dimmed' : ''
                }`}
                onClick={handleFinish}
              >
                <Sparkles size={16} />
                <span>Start Listening</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
