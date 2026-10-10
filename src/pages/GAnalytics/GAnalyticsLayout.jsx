import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Lock, Loader, LogOut, LayoutDashboard, Radio, Users,
  Search, Music, FileClock, RefreshCw, ShieldCheck,
  CalendarDays, Clock3, Activity
} from 'lucide-react';
import {
  loginAdmin, getAnalyticsOverview,
  getSavedAdminToken, saveAdminToken, clearAdminToken
} from '../../services/analyticsService';
import { useToast } from '../../context/ContextMenuContext';
import './GAnalyticsLayout.css';

const GAnalyticsContext = createContext(null);

export function useGAnalytics() {
  return useContext(GAnalyticsContext);
}

export function GAnalyticsLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shared overview data (consumed by Dashboard, Users, Searches, Songs pages)
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadOverview = useCallback(async (authToken, tick = 0) => {
    if (tick > 0) setRefreshing(true);
    else setLoadingOverview(true);
    try {
      const data = await getAnalyticsOverview(authToken);
      setOverview(data);
    } catch (err) {
      if (err.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        setToken(null);
        setOverview(null);
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Could not load analytics data.', 'error');
      }
    } finally {
      setLoadingOverview(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Auto login with saved session token
  useEffect(() => {
    const savedToken = getSavedAdminToken();
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      loadOverview(savedToken, 0);
    }
  }, [loadOverview]);

  // Refetch overview when refresh is clicked
  useEffect(() => {
    if (refreshTick > 0 && token) loadOverview(token, refreshTick);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) return;
    setLoading(true);
    setLoginError('');
    try {
      const res = await loginAdmin(adminId.trim(), password);
      if (res?.token) {
        setToken(res.token);
        setIsAuthenticated(true);
        setPassword('');
        showToast(`Welcome back, ${res.admin?.name || 'Admin'}!`, 'success');
        loadOverview(res.token, 0);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    clearAdminToken();
    setIsAuthenticated(false);
    setToken(null);
    setAdminId('');
    setOverview(null);
    setRefreshTick(0);
    showToast('Logged out of Analytics', 'info');
    navigate('/ganalytics');
  }, [showToast, navigate]);

  const handleRefresh = () => setRefreshTick(t => t + 1);

  // ── Admin Login Gate ──
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

  return (
    <GAnalyticsContext.Provider value={{ token, overview, loadingOverview, refreshTick, onSessionExpired: handleLogout }}>
      <div className="fs-ganalytics-page">
        {/* Header */}
        <div className="fs-ga-header">
          <div className="fs-ga-header-info">
            <h1 className="fs-ga-title">
              <ShieldCheck size={28} className="fs-ga-title-icon" />
              Analytics
            </h1>
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

        {/* Section Nav */}
        <nav className="fs-ga-nav">
          <NavLink to="/ganalytics" end className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/ganalytics/live" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active live' : ''}`}>
            <Radio size={16} />
            <span>Live Now</span>
          </NavLink>
          <NavLink to="/ganalytics/users" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={16} />
            <span>Users</span>
          </NavLink>
          <NavLink to="/ganalytics/daily" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={16} />
            <span>Daily</span>
          </NavLink>
          <NavLink to="/ganalytics/hours" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <Clock3 size={16} />
            <span>Hours</span>
          </NavLink>
          <NavLink to="/ganalytics/activity" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={16} />
            <span>User Activity</span>
          </NavLink>
          <NavLink to="/ganalytics/searches" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <Search size={16} />
            <span>Searches</span>
          </NavLink>
          <NavLink to="/ganalytics/songs" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <Music size={16} />
            <span>Top Songs</span>
          </NavLink>
          <NavLink to="/ganalytics/logs" className={({ isActive }) => `fs-ga-nav-item ${isActive ? 'active' : ''}`}>
            <FileClock size={16} />
            <span>Logs</span>
          </NavLink>
        </nav>

        {/* Page Content */}
        <Outlet />
      </div>
    </GAnalyticsContext.Provider>
  );
}
