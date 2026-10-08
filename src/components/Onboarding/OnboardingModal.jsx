import React, { useState, useEffect } from 'react';
import {
  Check,
  Search,
  ArrowRight,
  Sparkles,
  Music,
  Users,
  X
} from 'lucide-react';
import { TOP_100_ARTISTS, GENRES_LIST } from '../../data/artistsData';
import { storage } from '../../services/storage';
import { getArtistAvatarFallback } from '../../utils/imageFallback';
import './OnboardingModal.css';

export function OnboardingModal({ isOpen, onComplete, onClose }) {
  const [step, setStep] = useState(1); // 1 = Genres, 2 = Artists
  const [selectedGenres, setSelectedGenres] = useState(() => storage.getPreferences()?.genres || ['bollywood', 'lofi', 'punjabi']);
  const [selectedArtists, setSelectedArtists] = useState(() => storage.getPreferences()?.artists || ['Arijit Singh', 'Taylor Swift', 'Diljit Dosanjh']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Re-sync with current preferences whenever modal is reopened
  useEffect(() => {
    if (isOpen) {
      const current = storage.getPreferences();
      if (current?.genres?.length) setSelectedGenres(current.genres);
      if (current?.artists?.length) setSelectedArtists(current.artists);
      setStep(1);
      setSearchQuery('');
    }
  }, [isOpen]);

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

  const handleFinish = () => {
    const preferences = {
      genres: selectedGenres,
      artists: selectedArtists,
      updatedAt: new Date().toISOString()
    };
    storage.savePreferences(preferences);
    if (onComplete) onComplete(preferences);
  };

  // Filter artists
  const filteredArtists = TOP_100_ARTISTS.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || artist.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Hindi', 'English', 'Punjabi', 'Indie', 'South', 'Regional', 'Devotional'];

  return (
    <div className="fs-onboarding-backdrop">
      <div className="fs-onboarding-modal">
        {/* Header */}
        <div className="fs-onboarding-header">
          <div className="fs-onboarding-brand">
            <img src="/images/freesonglogowebp.webp" alt="FreeSong" className="fs-onboarding-logo" />
            <div className="fs-onboarding-title-wrap">
              <span className="fs-onboarding-step-badge">STEP {step} OF 2</span>
              <h2 className="fs-onboarding-title">
                {step === 1 ? 'What music do you love?' : 'Follow your favorite artists'}
              </h2>
              <p className="fs-onboarding-subtitle">
                {step === 1
                  ? 'Pick 3 or more genres to personalize your feed algorithm'
                  : 'Select artists to tailor your daily mixes, playlists, and recommendations'}
              </p>
            </div>
          </div>
          {onClose && (
            <button className="btn-icon fs-onboarding-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="fs-onboarding-body">
          {step === 1 ? (
            /* ─── Step 1: Genres Grid ────────────────────────────────── */
            <div className="fs-onboarding-genres-grid">
              {GENRES_LIST.map(genre => {
                const isSelected = selectedGenres.includes(genre.id);
                return (
                  <div
                    key={genre.id}
                    className={`fs-genre-select-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(0, 200, 83, 0.12)' : 'var(--color-card)'
                    }}
                    onClick={() => toggleGenre(genre.id)}
                  >
                    <div
                      className="fs-genre-dot"
                      style={{ backgroundColor: genre.color }}
                    />
                    <span className="fs-genre-label">{genre.name}</span>
                    <div className="fs-genre-check">
                      {isSelected ? <Check size={14} className="text-brand" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Step 2: 100 Artists Grid with Spotify Pictures ─────── */
            <div className="fs-onboarding-artists-container">
              {/* Search and Filters */}
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
                </div>

                <div className="fs-artists-cat-chips">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Artist Circles */}
              <div className="fs-artists-circle-grid">
                {filteredArtists.map(artist => {
                  const isSelected = selectedArtists.includes(artist.name);
                  return (
                    <div
                      key={artist.id}
                      className={`fs-artist-circle-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleArtist(artist.name)}
                    >
                      <div className="fs-artist-circle-wrap">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="fs-artist-circle-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getArtistAvatarFallback(artist.name);
                          }}
                        />
                        {isSelected && (
                          <div className="fs-artist-circle-badge">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      <span className="fs-artist-circle-name truncate" title={artist.name}>
                        {artist.name}
                      </span>
                      <span className="fs-artist-circle-genre truncate">
                        {artist.genre}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="fs-onboarding-footer">
          <div className="fs-onboarding-stats">
            {step === 1 ? (
              <span>{selectedGenres.length} genres chosen</span>
            ) : (
              <span>{selectedArtists.length} artists followed</span>
            )}
          </div>

          <div className="fs-onboarding-actions">
            {step === 2 && (
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back to Genres
              </button>
            )}

            {step === 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={selectedGenres.length === 0}
              >
                <span>Continue to Artists</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-primary fs-finish-btn"
                onClick={handleFinish}
                disabled={selectedArtists.length === 0}
              >
                <Sparkles size={16} />
                <span>Start Listening & Personalize</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
