import React, { useState, useEffect, useCallback } from 'react';
import { Headphones, LoaderCircle, Clock3, User, UserCheck, Eye, CalendarDays } from 'lucide-react';
import { getStreamingStats } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { ChartTooltip } from './ChartTooltip';
import './Streaming.css';

export function Streaming() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getStreamingStats(authToken);
      setStats(data);
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadStats(token);
  }, [token, loadStats]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadStats(token);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');
  const formatHours = (n) => `${(Math.round((Number(n) || 0) * 10) / 10).toLocaleString('en-IN')}h`;

  if (loading && !stats) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading streaming analytics...</span>
      </div>
    );
  }

  const today = stats?.today || {};
  const week = stats?.last7Days || {};
  const month = stats?.last30Days || {};
  const daily = stats?.daily || [];
  const maxPlays = Math.max(...daily.map(d => d.plays), 1);

  return (
    <div className="fs-ga-streaming">
      {/* Range Stat Cards */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Headphones size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Streaming Analytics</h2>
          <span className="fs-ga-section-sub">Total song plays · guests + logged-in combined</span>
          {loading && <LoaderCircle size={16} className="fs-ga-spin fs-ga-streaming-spin" />}
        </div>

        <div className="fs-ga-stats-grid">
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap visitors"><Eye size={20} /></div>
            <p className="fs-ga-stat-label">Today</p>
            <p className="fs-ga-stat-value">{formatNumber(today.plays)}</p>
            <span className="fs-ga-streaming-sub">{formatNumber(today.listeners)} listeners · {formatHours(today.hours)}</span>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap registered"><CalendarDays size={20} /></div>
            <p className="fs-ga-stat-label">Last 7 Days</p>
            <p className="fs-ga-stat-value">{formatNumber(week.plays)}</p>
            <span className="fs-ga-streaming-sub">{formatNumber(week.listeners)} listeners · {formatHours(week.hours)}</span>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap total"><Headphones size={20} /></div>
            <p className="fs-ga-stat-label">Last 30 Days</p>
            <p className="fs-ga-stat-value">{formatNumber(month.plays)}</p>
            <span className="fs-ga-streaming-sub">{formatNumber(month.listeners)} listeners · {formatHours(month.hours)}</span>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap guests"><Clock3 size={20} /></div>
            <p className="fs-ga-stat-label">Listening Hours · 30d</p>
            <p className="fs-ga-stat-value">{formatHours(month.hours)}</p>
            <span className="fs-ga-streaming-sub">Avg {month.plays > 0 ? formatNumber(Math.round(month.plays / 30)) : 0} plays/day</span>
          </div>
        </div>

        {/* Guest vs Registered split (30 days) */}
        <div className="fs-ga-streaming-split">
          <div className="fs-ga-streaming-split-row">
            <span className="fs-ga-streaming-split-label"><User size={14} /> Guests</span>
            <div className="fs-ga-share-bar">
              <div className="fs-ga-share-bar-fill" style={{ width: `${month.plays > 0 ? Math.round((month.guestPlays / month.plays) * 100) : 0}%` }} />
            </div>
            <span className="fs-ga-streaming-split-value">{formatNumber(month.guestPlays)} ({month.plays > 0 ? Math.round((month.guestPlays / month.plays) * 100) : 0}%)</span>
          </div>
          <div className="fs-ga-streaming-split-row">
            <span className="fs-ga-streaming-split-label"><UserCheck size={14} /> Logged In</span>
            <div className="fs-ga-share-bar">
              <div className="fs-ga-share-bar-fill registered" style={{ width: `${month.plays > 0 ? Math.round((month.registeredPlays / month.plays) * 100) : 0}%` }} />
            </div>
            <span className="fs-ga-streaming-split-value">{formatNumber(month.registeredPlays)} ({month.plays > 0 ? Math.round((month.registeredPlays / month.plays) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* 30-Day Daily Plays Chart */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Headphones size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Plays Per Day</h2>
          <span className="fs-ga-section-sub">Last 30 days · auto-purged after 30 days</span>
        </div>

        <div className="fs-ga-streaming-chart-card">
          <div className="fs-ga-streaming-bars">
            {daily.map(d => (
              <div key={d.day} className={`fs-ga-streaming-bar-col ${d.plays === maxPlays && d.plays > 0 ? 'peak' : ''}`}>
                <ChartTooltip
                  dotClass="fs-dot-plays"
                  label={d.label}
                  value={formatNumber(d.plays)}
                  unit="plays"
                  sublabel={`${formatNumber(d.listeners)} listeners · ${formatHours(d.hours)}`}
                />
                <div className="fs-ga-streaming-bar-track">
                  <div className="fs-ga-streaming-bar" style={{ height: `${Math.max(2, Math.round((d.plays / maxPlays) * 100))}%` }} />
                </div>
                <span className="fs-ga-streaming-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Streaming;
