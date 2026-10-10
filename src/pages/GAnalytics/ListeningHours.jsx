import React, { useState, useEffect, useCallback } from 'react';
import { Clock3, Play, LoaderCircle, Headphones } from 'lucide-react';
import { getListeningHours } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { usePlayer } from '../../context/PlayerContext';
import { ChartTooltip } from './ChartTooltip';
import './ListeningHours.css';

export function ListeningHours() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const { playSong } = usePlayer();
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadHours = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getListeningHours(authToken);
      setHours(data);
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadHours(token);
  }, [token, loadHours]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadHours(token);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatHours = (n) => `${(Math.round((Number(n) || 0) * 10) / 10).toLocaleString('en-IN')}h`;
  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

  if (loading && !hours) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading listening hours...</span>
      </div>
    );
  }

  const maxHours = Math.max(...(hours?.days || []).map(d => d.hours), 0.1);
  const topSongs = hours?.topSongs || [];
  const maxSongHours = Math.max(...topSongs.map(s => s.hours), 0.1);

  const handlePlay = (song) => {
    playSong({ videoId: song.videoId, title: song.title, artist: song.artist, thumbnail: song.thumbnail });
  };

  return (
    <div className="fs-ga-hours">
      {/* Totals */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Clock3 size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Listening Hours</h2>
          <span className="fs-ga-section-sub">Total music play time</span>
        </div>
        <div className="fs-ga-stats-grid">
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap visitors"><Clock3 size={20} /></div>
            <p className="fs-ga-stat-label">Today</p>
            <p className="fs-ga-stat-value">{formatHours(hours?.totals?.today)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap registered"><Headphones size={20} /></div>
            <p className="fs-ga-stat-label">Last 7 Days</p>
            <p className="fs-ga-stat-value">{formatHours(hours?.totals?.last7Days)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap total"><Clock3 size={20} /></div>
            <p className="fs-ga-stat-label">All Time</p>
            <p className="fs-ga-stat-value">{formatHours(hours?.totals?.allTime)}</p>
          </div>
        </div>
      </div>

      {/* 7-Day Hours Trend */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Clock3 size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Hours Trend</h2>
          <span className="fs-ga-section-sub">Last 7 days</span>
        </div>
        <div className="fs-ga-hours-chart-card">
          <div className="fs-ga-hours-bars">
            {(hours?.days || []).map(d => (
              <div key={d.day} className="fs-ga-hours-bar-col">
                <ChartTooltip
                  dotClass="fs-dot-hours"
                  label={d.label}
                  value={formatHours(d.hours)}
                  unit="listened"
                  sublabel={`${formatNumber(d.plays)} streams`}
                />
                <div className="fs-ga-hours-bar-track">
                  <div className="fs-ga-hours-bar" style={{ height: `${Math.max(2, Math.round((d.hours / maxHours) * 100))}%` }} />
                </div>
                <span className="fs-ga-hours-bar-value">{d.hours > 0 ? formatHours(d.hours) : ''}</span>
                <span className="fs-ga-hours-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Songs by Hours */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Headphones size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Most Listened Songs</h2>
          <span className="fs-ga-section-sub">By total hours · Last 7 days</span>
        </div>
        <div className="fs-ga-list-container">
          {topSongs.length === 0 ? (
            <p className="fs-ga-empty-text">No listening data recorded yet</p>
          ) : (
            topSongs.map((song, i) => (
              <div key={song.videoId} className="fs-ga-hours-song-row">
                <span className="fs-ga-rank">{i + 1}</span>
                <img src={song.thumbnail} alt={song.title} className="fs-ga-hours-song-thumb" loading="lazy" />
                <button
                  type="button"
                  className="fs-ga-hours-song-play"
                  onClick={() => handlePlay(song)}
                  aria-label={`Play ${song.title}`}
                >
                  <Play size={18} fill="#000000" />
                </button>
                <div className="fs-ga-hours-song-main">
                  <div className="fs-ga-hours-song-top">
                    <div className="fs-ga-hours-song-info">
                      <span className="fs-ga-hours-song-title truncate">{song.title}</span>
                      <span className="fs-ga-hours-song-artist truncate">{song.artist}</span>
                    </div>
                    <span className="fs-ga-hours-song-count">{formatHours(song.hours)} · {formatNumber(song.playCount)} plays</span>
                  </div>
                  <div className="fs-ga-share-bar">
                    <div className="fs-ga-share-bar-fill" style={{ width: `${Math.max(2, Math.round((song.hours / maxSongHours) * 100))}%` }} />
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
