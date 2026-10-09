import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, User, UserCheck, Users, Search, Music, TrendingUp,
  BarChart3, Headphones, ArrowRight, LoaderCircle
} from 'lucide-react';
import { useGAnalytics } from './GAnalyticsLayout';
import './Dashboard.css';

export function Dashboard() {
  const { overview, loadingOverview } = useGAnalytics();

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

  if (loadingOverview && !overview) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  const today = overview?.today;
  const week = overview?.last7Days;
  const maxVisitors = Math.max(...(week?.days || []).map(d => d.visitors), 1);
  const maxPlays = Math.max(...(week?.days || []).map(d => d.plays), 1);

  return (
    <div className="fs-ga-dash">
      {/* Today Stats */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <TrendingUp size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Today</h2>
        </div>
        <div className="fs-ga-stats-grid">
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap visitors"><Eye size={20} /></div>
            <p className="fs-ga-stat-label">Visitors Today</p>
            <p className="fs-ga-stat-value">{formatNumber(today?.visitors)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap guests"><User size={20} /></div>
            <p className="fs-ga-stat-label">Guests</p>
            <p className="fs-ga-stat-value">{formatNumber(today?.guests)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap registered"><UserCheck size={20} /></div>
            <p className="fs-ga-stat-label">Registered Today</p>
            <p className="fs-ga-stat-value">{formatNumber(today?.registered)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap total"><Users size={20} /></div>
            <p className="fs-ga-stat-label">Total Registered</p>
            <p className="fs-ga-stat-value">{formatNumber(today?.totalRegisteredUsers)}</p>
          </div>
        </div>
        <div className="fs-ga-dash-mini-stats">
          <span className="fs-ga-dash-mini"><Headphones size={14} /> {formatNumber(today?.plays)} streams today</span>
          <span className="fs-ga-dash-mini"><Search size={14} /> {formatNumber(today?.searches)} searches today</span>
        </div>
      </div>

      {/* Last 7 Days Trends */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <BarChart3 size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Last 7 Days</h2>
        </div>
        <div className="fs-ga-dash-charts">
          <div className="fs-ga-dash-chart-card">
            <div className="fs-ga-dash-chart-header">
              <h3 className="fs-ga-dash-chart-title">Visitors Trend</h3>
              <span className="fs-ga-dash-chart-total">{formatNumber(week?.totals?.visitors)} visitors</span>
            </div>
            <div className="fs-ga-dash-bars">
              {(week?.days || []).map(d => (
                <div key={d.day} className="fs-ga-dash-bar-col" title={`${d.label}: ${formatNumber(d.visitors)} visitors`}>
                  <div className="fs-ga-dash-bar-track">
                    <div className="fs-ga-dash-bar fill-visitors" style={{ height: `${Math.round((d.visitors / maxVisitors) * 100)}%` }} />
                  </div>
                  <span className="fs-ga-dash-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="fs-ga-dash-chart-card">
            <div className="fs-ga-dash-chart-header">
              <h3 className="fs-ga-dash-chart-title">Streaming Trend</h3>
              <span className="fs-ga-dash-chart-total">{formatNumber(week?.totals?.plays)} streams</span>
            </div>
            <div className="fs-ga-dash-bars">
              {(week?.days || []).map(d => (
                <div key={d.day} className="fs-ga-dash-bar-col" title={`${d.label}: ${formatNumber(d.plays)} streams`}>
                  <div className="fs-ga-dash-bar-track">
                    <div className="fs-ga-dash-bar fill-plays" style={{ height: `${Math.round((d.plays / maxPlays) * 100)}%` }} />
                  </div>
                  <span className="fs-ga-dash-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Previews */}
      <div className="fs-ga-dash-previews">
        {/* Top Searches Preview */}
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <Search size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Top Searches</h2>
            <span className="fs-ga-section-sub">7 days</span>
            <Link to="/ganalytics/searches" className="fs-ga-view-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="fs-ga-list-container">
            {(week?.topSearches || []).length === 0 ? (
              <p className="fs-ga-empty-text">No searches recorded yet</p>
            ) : (
              week.topSearches.slice(0, 5).map((s, i) => (
                <div key={`${s.query}-${i}`} className="fs-ga-dash-search-row">
                  <span className="fs-ga-rank">{i + 1}</span>
                  <span className="fs-ga-dash-search-query truncate">{s.query}</span>
                  <span className="fs-ga-dash-search-count">{formatNumber(s.count)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Songs Preview */}
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <Music size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Top Songs</h2>
            <span className="fs-ga-section-sub">7 days</span>
            <Link to="/ganalytics/songs" className="fs-ga-view-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="fs-ga-list-container">
            {(week?.topSongs || []).length === 0 ? (
              <p className="fs-ga-empty-text">No streams recorded yet</p>
            ) : (
              week.topSongs.slice(0, 5).map((song, i) => (
                <div key={song.videoId} className="fs-ga-dash-song-row">
                  <span className="fs-ga-rank">{i + 1}</span>
                  <img src={song.thumbnail} alt={song.title} className="fs-ga-dash-song-thumb" loading="lazy" />
                  <div className="fs-ga-dash-song-info">
                    <span className="fs-ga-dash-song-title truncate">{song.title}</span>
                    <span className="fs-ga-dash-song-artist truncate">{song.artist}</span>
                  </div>
                  <span className="fs-ga-dash-search-count">{formatNumber(song.playCount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
