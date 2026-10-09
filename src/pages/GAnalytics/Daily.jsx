import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, LoaderCircle, Eye, User, UserCheck, Search, Headphones, Clock3 } from 'lucide-react';
import { getDailyStats } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import './Daily.css';

export function Daily() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'guests' | 'registered'

  const loadDaily = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getDailyStats(authToken);
      setDays(data);
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadDaily(token);
  }, [token, loadDaily]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadDaily(token);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');
  const formatHours = (n) => `${(Math.round((Number(n) || 0) * 10) / 10).toLocaleString('en-IN')}h`;

  const selected = days.find(d => d.day === selectedDay) || null;

  // Type filter applies to the selected day's breakdown + table columns
  const getVal = (row, base) => {
    if (!row) return 0;
    if (typeFilter === 'guests') return row[`guest${base.charAt(0).toUpperCase()}${base.slice(1)}`] ?? row.guests ?? 0;
    if (typeFilter === 'registered') return row[`registered${base.charAt(0).toUpperCase()}${base.slice(1)}`] ?? row.registered ?? 0;
    return row[base] ?? 0;
  };

  const visibleRows = days.filter(d => {
    if (typeFilter === 'guests') return d.guests > 0;
    if (typeFilter === 'registered') return d.registered > 0;
    return true;
  });

  return (
    <div className="fs-ga-daily">
      {/* Filters */}
      <div className="fs-ga-daily-filters">
        <div className="fs-ga-daily-date-wrap">
          <CalendarDays size={16} />
          <input
            type="date"
            className="fs-ga-daily-date"
            value={selectedDay}
            max={new Date().toISOString().slice(0, 10)}
            min={days.length > 0 ? days[0].day : undefined}
            onChange={(e) => setSelectedDay(e.target.value)}
          />
        </div>
        <div className="fs-ga-daily-type">
          <button
            className={`fs-ga-daily-chip ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button
            className={`fs-ga-daily-chip ${typeFilter === 'guests' ? 'active guests' : ''}`}
            onClick={() => setTypeFilter('guests')}
          >
            Guests
          </button>
          <button
            className={`fs-ga-daily-chip ${typeFilter === 'registered' ? 'active registered' : ''}`}
            onClick={() => setTypeFilter('registered')}
          >
            Logged In
          </button>
        </div>
        {loading && <LoaderCircle size={16} className="fs-ga-spin" />}
      </div>

      {/* Selected Day Breakdown */}
      {selected && (
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <h2 className="fs-ga-section-title">
              {new Date(selected.day + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}
            </h2>
            <span className="fs-ga-section-sub">
              {typeFilter === 'all' ? 'All users' : typeFilter === 'guests' ? 'Guests only' : 'Logged in users only'}
            </span>
          </div>
          <div className="fs-ga-stats-grid">
            <div className="fs-ga-stat-card">
              <div className="fs-ga-stat-icon-wrap visitors"><Eye size={20} /></div>
              <p className="fs-ga-stat-label">{typeFilter === 'all' ? 'Visitors' : typeFilter === 'guests' ? 'Guest Visitors' : 'Registered Visitors'}</p>
              <p className="fs-ga-stat-value">{formatNumber(getVal(selected, 'visitors'))}</p>
            </div>
            <div className="fs-ga-stat-card">
              <div className="fs-ga-stat-icon-wrap guests"><User size={20} /></div>
              <p className="fs-ga-stat-label">Guests</p>
              <p className="fs-ga-stat-value">{formatNumber(selected.guests)}</p>
            </div>
            <div className="fs-ga-stat-card">
              <div className="fs-ga-stat-icon-wrap registered"><UserCheck size={20} /></div>
              <p className="fs-ga-stat-label">Logged In</p>
              <p className="fs-ga-stat-value">{formatNumber(selected.registered)}</p>
            </div>
            <div className="fs-ga-stat-card">
              <div className="fs-ga-stat-icon-wrap total"><Clock3 size={20} /></div>
              <p className="fs-ga-stat-label">Listening Hours</p>
              <p className="fs-ga-stat-value">{formatHours(getVal(selected, 'hours'))}</p>
            </div>
          </div>
          <div className="fs-ga-daily-mini-stats">
            <span className="fs-ga-daily-mini"><Search size={14} /> {formatNumber(getVal(selected, 'searches'))} searches</span>
            <span className="fs-ga-daily-mini"><Headphones size={14} /> {formatNumber(getVal(selected, 'plays'))} streams</span>
          </div>
        </div>
      )}

      {/* 30-Day Table */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <CalendarDays size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Daily Breakdown</h2>
          <span className="fs-ga-section-sub">Last 30 days</span>
        </div>

        <div className="fs-ga-list-container">
          {visibleRows.length === 0 ? (
            <p className="fs-ga-empty-text">No activity recorded yet</p>
          ) : (
            <>
              <div className="fs-ga-daily-header">
                <span className="fs-ga-daily-col-date">Date</span>
                <span className="fs-ga-daily-col-visitors">Visitors</span>
                <span className="fs-ga-daily-col-guests">Guests</span>
                <span className="fs-ga-daily-col-logged">Logged In</span>
                <span className="fs-ga-daily-col-searches">Searches</span>
                <span className="fs-ga-daily-col-plays">Streams</span>
                <span className="fs-ga-daily-col-hours">Hours</span>
              </div>
              {visibleRows.slice().reverse().map(d => (
                <div
                  key={d.day}
                  className={`fs-ga-daily-row ${d.day === selectedDay ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(d.day)}
                >
                  <span className="fs-ga-daily-col-date">{d.label}</span>
                  <span className="fs-ga-daily-col-visitors">{formatNumber(d.visitors)}</span>
                  <span className="fs-ga-daily-col-guests">{formatNumber(d.guests)}</span>
                  <span className="fs-ga-daily-col-logged">{formatNumber(d.registered)}</span>
                  <span className="fs-ga-daily-col-searches">{formatNumber(d.searches)}</span>
                  <span className="fs-ga-daily-col-plays">{formatNumber(d.plays)}</span>
                  <span className="fs-ga-daily-col-hours">{formatHours(d.hours)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
