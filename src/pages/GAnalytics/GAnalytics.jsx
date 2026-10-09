import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, User, UserCheck, Users, Search, Play, BarChart3,
  RefreshCw, LogOut, Lock, Music, TrendingUp, Headphones,
  Loader, FileClock, ShieldAlert, MapPin
} from 'lucide-react';
import {
  loginAdmin, getAnalyticsOverview, getAdminLogs, getLiveUsers,
  getSavedAdminToken, clearAdminToken
} from '../../services/analyticsService';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ContextMenuContext';
import './GAnalytics.css';

export function GAnalytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logs'

  const { playSong } = usePlayer();
  const { showToast } = useToast();

  const handleSessionExpired = useCallback((message) => {
    clearAdminToken();
    setIsAuthenticated(false);
    setToken(null);
    setData(null);
    setLogs([]);
    showToast(message, 'error');
  }, [showToast]);

  const loadDashboard = useCallback(async (authToken, isRefresh) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [overview, adminLogs] = await Promise.all([
        getAnalyticsOverview(authToken),
        getAdminLogs(authToken)
      ]);
      setData(overview);
      setLogs(adminLogs);
      setIsAuthenticated(true);
    } catch (err) {
      if (err.status === 401) {
        handleSessionExpired('Session expired. Please login again.');
      } else {
        showToast('Could not load analytics. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleSessionExpired]);

  // Auto login with saved session token
  useEffect(() => {
    const savedToken = getSavedAdminToken();
    if (savedToken) {
      setToken(savedToken);
      loadDashboard(savedToken, false);
    }
  }, [loadDashboard]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) return;
    setLoading(true);
    setLoginError('');
    try {
      const res = await loginAdmin(adminId.trim(), password);
      if (res?.token) {
        setToken(res.token);
        setPassword('');
        showToast(`Welcome back, ${res.admin?.name || 'Admin'}!`, 'success');
        await loadDashboard(res.token, false);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (token) loadDashboard(token, true);
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setToken(null);
    setAdminId('');
    setData(null);
    setLogs([]);
    setActiveTab('overview');
    showToast('Logged out of Analytics', 'info');
  };

  const handlePlaySong = (song) => {
    playSong({ videoId: song.videoId, title: song.title, artist: song.artist, thumbnail: song.thumbnail });
  };

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');
  const formatLogDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // ── Password Gate ──
  if (!isAuthenticated) {
    return (
      <div className="fs-ganalytics-page">
        <div className="fs-ga-gate">
          <div className="fs-ga-gate-icon">
            <Lock size={32} />
          </div>
          <h1 className="fs-ga-gate-title">FreeSong Analytics</h1>
          <p className="fs-ga-gate-subtitle">Enter admin credentials to access the dashboard</p>
          <form onSubmit={handleLogin} className="fs-ga-gate-form">
            <input
              type="text"
              className="fs-ga-gate-input"
              placeholder="Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              autoComplete="username"
              autoFocus
            />
            <input
              type="password"
              className="fs-ga-gate-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" className="btn btn-primary fs-ga-gate-btn" disabled={loading || !adminId.trim() || !password.trim()}>
              {loading ? <Loader size={16} className="fs-ga-spin" /> : <LogOut size={16} style={{ transform: 'rotate(180deg)' }} />}
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
            </button>
          </form>
          {loginError && <p className="fs-ga-gate-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  const today = data?.today;
  const week = data?.last7Days;
  const maxVisitors = Math.max(...(week?.days || []).map(d => d.visitors), 1);
  const maxPlays = Math.max(...(week?.days || []).map(d => d.plays), 1);

  return (
    <div className="fs-ganalytics-page">
      {/* Header */}
      <div className="fs-ga-header">
        <div className="fs-ga-header-info">
          <h1 className="fs-ga-title">Analytics</h1>
          <p className="fs-ga-subtitle">Real-time performance metrics for FreeSong.in</p>
        </div>
        <div className="fs-ga-header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'fs-ga-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="btn btn-secondary fs-ga-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="fs-ga-tabs">
        <button
          className={`fs-ga-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          <span>Overview</span>
        </button>
        <button
          className={`fs-ga-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FileClock size={16} />
          <span>Admin Logs</span>
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <>
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
            <div className="fs-ga-mini-stats">
              <span className="fs-ga-mini"><Headphones size={14} /> {formatNumber(today?.plays)} streams today</span>
              <span className="fs-ga-mini"><Search size={14} /> {formatNumber(today?.searches)} searches today</span>
            </div>
          </div>

          {/* Last 7 Days */}
          <div className="fs-ga-section">
            <div className="fs-ga-section-header">
              <BarChart3 size={18} className="fs-ga-section-icon" />
              <h2 className="fs-ga-section-title">Last 7 Days</h2>
            </div>
            <div className="fs-ga-charts-grid">
              <div className="fs-ga-chart-card">
                <div className="fs-ga-chart-header">
                  <h3 className="fs-ga-chart-title">Visitors Trend</h3>
                  <span className="fs-ga-chart-total">{formatNumber(week?.totals?.visitors)} visitors</span>
                </div>
                <div className="fs-ga-bars">
                  {(week?.days || []).map(d => (
                    <div key={d.day} className="fs-ga-bar-col" title={`${d.label}: ${formatNumber(d.visitors)} visitors`}>
                      <div className="fs-ga-bar-track">
                        <div className="fs-ga-bar fill-visitors" style={{ height: `${Math.round((d.visitors / maxVisitors) * 100)}%` }} />
                      </div>
                      <span className="fs-ga-bar-label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="fs-ga-chart-card">
                <div className="fs-ga-chart-header">
                  <h3 className="fs-ga-chart-title">Streaming Trend</h3>
                  <span className="fs-ga-chart-total">{formatNumber(week?.totals?.plays)} streams</span>
                </div>
                <div className="fs-ga-bars">
                  {(week?.days || []).map(d => (
                    <div key={d.day} className="fs-ga-bar-col" title={`${d.label}: ${formatNumber(d.plays)} streams`}>
                      <div className="fs-ga-bar-track">
                        <div className="fs-ga-bar fill-plays" style={{ height: `${Math.round((d.plays / maxPlays) * 100)}%` }} />
                      </div>
                      <span className="fs-ga-bar-label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Searches */}
          <div className="fs-ga-section">
            <div className="fs-ga-section-header">
              <Search size={18} className="fs-ga-section-icon" />
              <h2 className="fs-ga-section-title">Top Searches</h2>
              <span className="fs-ga-section-sub">Last 7 days</span>
            </div>
            <div className="fs-ga-searches-list">
              {(week?.topSearches || []).length === 0 ? (
                <p className="fs-ga-empty-text">No searches recorded yet</p>
              ) : (
                week.topSearches.map((s, i) => (
                  <div key={`${s.query}-${i}`} className="fs-ga-search-row">
                    <span className="fs-ga-rank">{i + 1}</span>
                    <div className="fs-ga-search-icon-wrap"><Search size={14} /></div>
                    <span className="fs-ga-search-query truncate">{s.query}</span>
                    <span className="fs-ga-search-count">{formatNumber(s.count)} searches</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top 30 Songs */}
          <div className="fs-ga-section">
            <div className="fs-ga-section-header">
              <Music size={18} className="fs-ga-section-icon" />
              <h2 className="fs-ga-section-title">Top 30 Songs</h2>
              <span className="fs-ga-section-sub">Most streamed · Last 7 days</span>
            </div>
            <div className="fs-ga-songs-list">
              {(week?.topSongs || []).length === 0 ? (
                <p className="fs-ga-empty-text">No streams recorded yet</p>
              ) : (
                week.topSongs.map((song, i) => (
                  <div key={song.videoId} className="fs-ga-song-row">
                    <span className="fs-ga-rank fs-ga-rank-song">{i + 1}</span>
                    <img src={song.thumbnail} alt={song.title} className="fs-ga-song-thumb" loading="lazy" />
                    <button
                      type="button"
                      className="fs-ga-song-play"
                      onClick={() => handlePlaySong(song)}
                      aria-label={`Play ${song.title}`}
                    >
                      <Play size={18} fill="#000000" />
                    </button>
                    <div className="fs-ga-song-info">
                      <span className="fs-ga-song-title truncate">{song.title}</span>
                      <span className="fs-ga-song-artist truncate">{song.artist}</span>
                    </div>
                    <span className="fs-ga-song-count">{formatNumber(song.playCount)} plays</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Admin Logs Tab (Last 30 Days) ── */}
      {activeTab === 'logs' && (
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <FileClock size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Admin Login Logs</h2>
            <span className="fs-ga-section-sub">Last 30 days · {logs.length} entries</span>
          </div>
          <div className="fs-ga-logs-list">
            {logs.length === 0 ? (
              <p className="fs-ga-empty-text">No admin login activity in the last 30 days</p>
            ) : (
              <>
                <div className="fs-ga-logs-header">
                  <span className="fs-ga-log-col-admin">Admin</span>
                  <span className="fs-ga-log-col-date">Date & Time</span>
                  <span className="fs-ga-log-col-ip">IP Address</span>
                  <span className="fs-ga-log-col-status">Status</span>
                </div>
                {logs.map((log, i) => (
                  <div key={`${log.loggedInAt}-${i}`} className={`fs-ga-log-row ${log.status === 'failed' ? 'failed' : ''}`}>
                    <span className="fs-ga-log-col-admin">
                      <span className="fs-ga-log-avatar">{(log.adminId || 'A').charAt(0).toUpperCase()}</span>
                      <span className="fs-ga-log-admin-id">{log.adminId || 'Unknown'}</span>
                    </span>
                    <span className="fs-ga-log-col-date">{formatLogDate(log.loggedInAt)}</span>
                    <span className="fs-ga-log-col-ip">
                      <MapPin size={12} />
                      {log.ip || '—'}
                      {log.city ? <span className="fs-ga-log-city">{log.city}</span> : null}
                    </span>
                    <span className="fs-ga-log-col-status">
                      {log.status === 'failed' ? (
                        <span className="fs-ga-log-badge failed"><ShieldAlert size={12} /> Failed</span>
                      ) : (
                        <span className="fs-ga-log-badge success">Success</span>
                      )}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
