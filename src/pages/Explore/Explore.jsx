import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Flame, Coffee, Heart, Music, Sparkles, Mic, Zap, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { SongCard } from '../../components/Cards/SongCard';
import './Explore.css';

const ICON_MAP = {
  Film,
  Flame,
  Coffee,
  Heart,
  Guitar: Music,
  Sparkles,
  Mic,
  Zap
};

export function Explore() {
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getExploreFeed().then(data => {
      setExploreData(data);
      setLoading(false);
    });
  }, []);

  const handleCategoryClick = (cat) => {
    navigate(`/search?q=${encodeURIComponent(cat.name)}`);
  };

  if (loading) {
    return (
      <div className="fs-explore-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Exploring moods and genres...</p>
      </div>
    );
  }

  return (
    <div className="fs-explore-page">
      <div className="fs-explore-header">
        <h1 className="fs-explore-heading">Explore</h1>
        <p className="fs-explore-sub">Discover music by moods, genres, and themes</p>
      </div>

      {/* Moods & Genres Grid */}
      <section className="fs-explore-section">
        <h2 className="fs-explore-section-title">Moods & Genres</h2>
        <div className="fs-genres-grid">
          {exploreData.categories?.map(cat => {
            const Icon = ICON_MAP[cat.icon] || Music;
            return (
              <div
                key={cat.id}
                className="fs-genre-card"
                style={{ borderLeftColor: cat.color }}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="fs-genre-icon-wrap" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                  <Icon size={24} />
                </div>
                <span className="fs-genre-name">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chill & Lo-Fi section */}
      {exploreData.lofiTracks?.length > 0 && (
        <section className="fs-explore-section">
          <h2 className="fs-explore-section-title">Lo-Fi & Chill Vibes</h2>
          <div className="fs-explore-songs-grid">
            {exploreData.lofiTracks.map(song => (
              <SongCard key={song.videoId} song={song} queueContext={exploreData.lofiTracks} />
            ))}
          </div>
        </section>
      )}

      {/* Romantic section */}
      {exploreData.romanticTracks?.length > 0 && (
        <section className="fs-explore-section">
          <h2 className="fs-explore-section-title">Romantic Melodies</h2>
          <div className="fs-explore-songs-grid">
            {exploreData.romanticTracks.map(song => (
              <SongCard key={song.videoId} song={song} queueContext={exploreData.romanticTracks} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
