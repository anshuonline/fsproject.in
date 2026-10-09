import React from 'react';
import { Music, Play, LoaderCircle } from 'lucide-react';
import { useGAnalytics } from './GAnalyticsLayout';
import { usePlayer } from '../../context/PlayerContext';
import './TopSongs.css';

export function TopSongs() {
  const { overview, loadingOverview } = useGAnalytics();
  const { playSong } = usePlayer();

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

  if (loadingOverview && !overview) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading songs...</span>
      </div>
    );
  }

  const songs = overview?.last7Days?.topSongs || [];
  const maxCount = Math.max(...songs.map(s => s.playCount), 1);

  const handlePlay = (song) => {
    playSong({ videoId: song.videoId, title: song.title, artist: song.artist, thumbnail: song.thumbnail });
  };

  return (
    <div className="fs-ga-songs">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Music size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Top 30 Songs</h2>
          <span className="fs-ga-section-sub">Most streamed · Last 7 days</span>
        </div>

        <div className="fs-ga-list-container">
          {songs.length === 0 ? (
            <p className="fs-ga-empty-text">No streams recorded yet</p>
          ) : (
            songs.map((song, i) => (
              <div key={song.videoId} className="fs-ga-songs-row">
                <span className="fs-ga-rank fs-ga-songs-rank">{i + 1}</span>
                <img src={song.thumbnail} alt={song.title} className="fs-ga-songs-thumb" loading="lazy" />
                <button
                  type="button"
                  className="fs-ga-songs-play"
                  onClick={() => handlePlay(song)}
                  aria-label={`Play ${song.title}`}
                >
                  <Play size={18} fill="#000000" />
                </button>
                <div className="fs-ga-songs-main">
                  <div className="fs-ga-songs-top">
                    <div className="fs-ga-songs-info">
                      <span className="fs-ga-songs-title truncate">{song.title}</span>
                      <span className="fs-ga-songs-artist truncate">{song.artist}</span>
                    </div>
                    <span className="fs-ga-songs-count">{formatNumber(song.playCount)} plays</span>
                  </div>
                  <div className="fs-ga-share-bar">
                    <div className="fs-ga-share-bar-fill" style={{ width: `${Math.round((song.playCount / maxCount) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
