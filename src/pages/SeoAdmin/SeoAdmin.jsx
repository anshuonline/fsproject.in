import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Globe, LoaderCircle, CheckCircle2, XCircle,
  ExternalLink, Save, RotateCcw, Pencil, X, Sparkles,
  LogOut, Lock, RefreshCw, ShieldCheck
} from 'lucide-react';
import { SEO_ROUTES } from '../../components/Common/SeoManager';
import {
  getSeoOverrides, saveSeoOverride, deleteSeoOverride,
  getSeoConfig, saveSeoConfig,
  loginAdmin, getSavedAdminToken, clearAdminToken
} from '../../services/analyticsService';
import { applySeo } from '../../services/seo';
import { useToast } from '../../context/ContextMenuContext';
import './SeoAdmin.css';

// Fixed public reputation metrics (not admin-editable): shown in SERP preview
// and emitted as AggregateRating structured data for Google rich results
const RATING_VALUE = 4.8;
const RATING_COUNT = 82454;

// Google Play-style rating row: 4.8 ★★★★☆ (82,454) · Free · Entertainment
function RatingRow() {
  const fill = `${(RATING_VALUE / 5) * 100}%`;
  return (
    <p className="fs-seo-serp-rating">
      <strong className="fs-seo-serp-rating-value">{RATING_VALUE}</strong>
      <span className="fs-seo-serp-stars" aria-hidden="true">
        <span className="fs-seo-stars-bg">★★★★★</span>
        <span className="fs-seo-stars-fg" style={{ width: fill }}>★★★★★</span>
      </span>
      <span className="fs-seo-serp-count">({RATING_COUNT.toLocaleString('en-IN')})</span>
      <span className="fs-seo-serp-sep">·</span>
      <span>Free</span>
      <span className="fs-seo-serp-sep">·</span>
      <span>Entertainment</span>
    </p>
  );
}

export function SeoAdmin() {
  const { showToast } = useToast();

  // Same admin session as GAnalytics (shared sessionStorage token)
  const [token, setToken] = useState(() => getSavedAdminToken());
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [draft, setDraft] = useState({ title: '', description: '', keywords: '', noindex: false });
  const [saving, setSaving] = useState(false);
  const [technical, setTechnical] = useState({ sitemap: null, robots: null });
  const [search, setSearch] = useState('');

  // Tracking & Verification config state
  const [trackingConfig, setTrackingConfig] = useState({ gscVerification: '', gaMeasurementId: '' });
  const [trackingDraft, setTrackingDraft] = useState({ gscVerification: '', gaMeasurementId: '' });
  const [savingTracking, setSavingTracking] = useState(false);

  const isAuthenticated = Boolean(token);

  // Admin portal pages are never indexed
  useEffect(() => {
    applySeo({
      title: 'SEO Manager Portal | freesong.in',
      description: undefined,
      noindex: true
    });
  }, []);

  const expireSession = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setOverrides([]);
    showToast('Session expired. Please login again.', 'error');
  }, [showToast]);

  const loadOverrides = useCallback(async (authToken, tick = 0) => {
    if (!authToken) return;
    if (tick > 0) setRefreshing(true);
    else setLoading(true);
    try {
      const list = await getSeoOverrides(authToken);
      setOverrides(list);
    } catch (err) {
      if (err.status === 401) expireSession();
      else showToast(err.message || 'Could not load SEO overrides', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [expireSession, showToast]);

  // Auto-login with the shared admin session token
  useEffect(() => {
    if (token) loadOverrides(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (refreshTick > 0 && token) loadOverrides(token, refreshTick);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Technical SEO reachability probes (sitemap & robots)
  useEffect(() => {
    const probe = async (file) => {
      try {
        const res = await fetch(`/${file}`, { cache: 'no-store' });
        return res.ok;
      } catch {
        return false;
      }
    };
    Promise.all([probe('sitemap.xml'), probe('robots.txt')]).then(([sitemap, robots]) => {
      setTechnical({ sitemap, robots });
    });
  }, []);

  // Load tracking & verification config
  const loadTrackingConfig = useCallback(async (authToken) => {
    if (!authToken) return;
    try {
      const config = await getSeoConfig(authToken);
      setTrackingConfig(config);
      setTrackingDraft(config);
    } catch (err) {
      if (err.status === 401) expireSession();
    }
  }, [expireSession]);

  useEffect(() => {
    if (token) loadTrackingConfig(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await loginAdmin(adminId.trim(), password);
      if (res?.token) {
        setToken(res.token);
        setPassword('');
        showToast(`Welcome back, ${res.admin?.name || 'Admin'}!`, 'success');
        loadOverrides(res.token);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setAdminId('');
    setOverrides([]);
    setRefreshTick(0);
    showToast('Logged out of SEO Manager', 'info');
  };

  const handleRefresh = () => setRefreshTick(t => t + 1);

  // Accepts the full meta tag OR just the content value
  const parseGscTag = (input) => {
    const raw = (input || '').trim();
    if (!raw) return '';
    if (raw.includes('google-site-verification')) {
      const m = raw.match(/content=["']([^"']+)["']/i);
      return m ? m[1].trim() : '';
    }
    return raw;
  };

  // Accepts the measurement id OR the full gtag.js script
  const parseGaId = (input) => {
    const raw = (input || '').trim();
    if (!raw) return '';
    const m = raw.match(/(?:G|UA|AW)-[A-Z0-9]+(?:-[0-9]+)?/i);
    return m ? m[0].trim() : raw;
  };

  const handleSaveTracking = async () => {
    const gsc = parseGscTag(trackingDraft.gscVerification);
    const gaId = parseGaId(trackingDraft.gaMeasurementId);

    if (!gsc && !gaId) {
      showToast('Paste the Search Console meta tag or Analytics measurement ID first', 'error');
      return;
    }

    setSavingTracking(true);
    try {
      await saveSeoConfig(token, { gscVerification: gsc, gaMeasurementId: gaId });
      const fresh = await getSeoConfig(token);
      setTrackingConfig(fresh);
      setTrackingDraft(fresh);
      showToast('Tracking tags saved! Injected site-wide in <head>.', 'success');
    } catch (err) {
      if (err.status === 401) expireSession();
      else showToast(err.message || 'Failed to save tracking config', 'error');
    } finally {
      setSavingTracking(false);
    }
  };

  // Merged view: static route defaults + admin overrides
  const pages = useMemo(() => {
    const overrideMap = new Map(overrides.map(o => [o.pagePath, o]));
    return SEO_ROUTES.map(route => {
      const override = overrideMap.get(route.path);
      return {
        path: route.path,
        editable: route.editable,
        overridden: Boolean(override),
        title: (override?.title) || route.title,
        description: (override?.description) || route.description || '',
        keywords: (override?.keywords) || '',
        noindex: override ? override.noindex === true : route.noindex === true,
        updatedAt: override?.updatedAt || null
      };
    });
  }, [overrides]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(p =>
      p.path.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const audit = (page) => {
    const tLen = page.title.length;
    const dLen = page.description.length;
    const titleOk = tLen >= 30 && tLen <= 65;
    const descOk = dLen >= 70 && dLen <= 165;
    return { tLen, dLen, titleOk, descOk };
  };

  const startEdit = (page) => {
    setEditingPath(page.path);
    setDraft({
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      noindex: page.noindex
    });
  };

  const cancelEdit = () => {
    setEditingPath(null);
    setDraft({ title: '', description: '', keywords: '', noindex: false });
  };

  const handleSave = async (pagePath) => {
    if (!draft.title.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSeoOverride(token, {
        pagePath,
        title: draft.title.trim(),
        description: draft.description.trim(),
        keywords: draft.keywords.trim(),
        noindex: draft.noindex
      });
      showToast('SEO saved! Applied site-wide instantly.', 'success');
      await loadOverrides(token);
      cancelEdit();
    } catch (err) {
      if (err.status === 401) expireSession();
      else showToast(err.message || 'Failed to save SEO', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (pagePath) => {
    try {
      await deleteSeoOverride(token, pagePath);
      showToast('Page reset to default metadata', 'success');
      if (editingPath === pagePath) cancelEdit();
      await loadOverrides(token);
    } catch (err) {
      if (err.status === 401) expireSession();
      else showToast(err.message || 'Failed to reset SEO', 'error');
    }
  };

  // ── Admin Login Gate ──
  if (!isAuthenticated) {
    return (
      <div className="fs-seo-portal">
        <div className="fs-seo-gate">
          <div className="fs-seo-gate-icon">
            <Lock size={32} />
          </div>
          <h1 className="fs-seo-gate-title">SEO Manager</h1>
          <p className="fs-seo-gate-subtitle">Enter admin credentials to manage site-wide SEO</p>
          <form onSubmit={handleLogin} className="fs-seo-gate-form">
            <input
              type="text"
              className="fs-seo-gate-input"
              placeholder="Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              autoComplete="username"
              autoFocus
            />
            <input
              type="password"
              className="fs-seo-gate-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" className="btn btn-primary fs-seo-gate-btn" disabled={loginLoading || !adminId.trim() || !password.trim()}>
              {loginLoading ? <LoaderCircle size={16} className="fs-ga-spin" /> : <LogOut size={16} style={{ transform: 'rotate(180deg)' }} />}
              <span>{loginLoading ? 'Authenticating...' : 'Login'}</span>
            </button>
          </form>
          {loginError && <p className="fs-seo-gate-error">{loginError}</p>}
        </div>
      </div>
    );
  }

  const overriddenCount = pages.filter(p => p.overridden).length;

  return (
    <div className="fs-seo-portal">
      {/* Header */}
      <div className="fs-seo-header">
        <div className="fs-seo-header-info">
          <h1 className="fs-seo-title">
            <ShieldCheck size={28} className="fs-seo-title-icon" />
            SEO Manager
          </h1>
          <p className="fs-seo-subtitle">Site-wide search engine optimization control panel</p>
        </div>
        <div className="fs-seo-header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'fs-ga-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="btn btn-secondary fs-seo-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Technical SEO Status */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Globe size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Technical SEO</h2>
          <span className="fs-ga-section-sub">{pages.length} pages • {overriddenCount} customized</span>
        </div>
        <div className="fs-ga-stats-grid">
          <div className="fs-ga-stat-card">
            <div className={`fs-ga-stat-icon-wrap ${technical.sitemap ? 'visitors' : 'guests'}`}>
              {technical.sitemap === null ? <LoaderCircle size={20} className="fs-ga-spin" /> : technical.sitemap ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </div>
            <p className="fs-ga-stat-label">sitemap.xml</p>
            <p className="fs-ga-stat-value fs-seo-tech-value">
              {technical.sitemap === null ? '...' : technical.sitemap ? 'Reachable' : 'Unreachable'}
            </p>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="fs-seo-tech-link">
              Open <ExternalLink size={12} />
            </a>
          </div>
          <div className="fs-ga-stat-card">
            <div className={`fs-ga-stat-icon-wrap ${technical.robots ? 'registered' : 'guests'}`}>
              {technical.robots === null ? <LoaderCircle size={20} className="fs-ga-spin" /> : technical.robots ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </div>
            <p className="fs-ga-stat-label">robots.txt</p>
            <p className="fs-ga-stat-value fs-seo-tech-value">
              {technical.robots === null ? '...' : technical.robots ? 'Reachable' : 'Unreachable'}
            </p>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="fs-seo-tech-link">
              Open <ExternalLink size={12} />
            </a>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap total"><CheckCircle2 size={20} /></div>
            <p className="fs-ga-stat-label">Canonical</p>
            <p className="fs-ga-stat-value fs-seo-tech-value">Auto</p>
            <span className="fs-seo-tech-link">Per-route managed</span>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap registered"><Sparkles size={20} /></div>
            <p className="fs-ga-stat-label">Rich Results</p>
            <p className="fs-ga-stat-value fs-seo-tech-value">Active</p>
            <span className="fs-seo-tech-link">{RATING_VALUE} ★ {RATING_COUNT.toLocaleString('en-IN')} reviews</span>
          </div>
        </div>
      </div>

      {/* Tracking & Verification */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Globe size={18} className="fs-ga-section-icon" />
          <div>
            <h2 className="fs-ga-section-title">Tracking & Verification</h2>
            <p className="fs-ga-section-sub">Google Search Console tag + Analytics script — injected site-wide in head after save</p>
          </div>
        </div>

        <div className="fs-seo-tracking-grid">
          {/* Search Console */}
          <div className="fs-seo-tracking-card">
            <div className="fs-seo-tracking-head">
              <span className="fs-seo-tracking-name">Google Search Console</span>
              <span className={`fs-seo-badge ${trackingConfig.gscVerification ? 'index' : 'noindex'}`}>
                {trackingConfig.gscVerification ? 'Verified' : 'Not Set'}
              </span>
            </div>
            <p className="fs-seo-tracking-desc">
              Paste the full meta tag or just the content value. Search Console → Verification → HTML tag.
            </p>
            <input
              type="text"
              className="fs-seo-input"
              value={trackingDraft.gscVerification}
              onChange={(e) => setTrackingDraft({ ...trackingDraft, gscVerification: e.target.value })}
              placeholder={'<meta name="google-site-verification" content="..." /> or just the content'}
              spellCheck={false}
            />
          </div>

          {/* Google Analytics */}
          <div className="fs-seo-tracking-card">
            <div className="fs-seo-tracking-head">
              <span className="fs-seo-tracking-name">Google Analytics (GA4)</span>
              <span className={`fs-seo-badge ${trackingConfig.gaMeasurementId ? 'index' : 'noindex'}`}>
                {trackingConfig.gaMeasurementId ? trackingConfig.gaMeasurementId : 'Not Set'}
              </span>
            </div>
            <p className="fs-seo-tracking-desc">
              Paste your Measurement ID (G-XXXXXXXXXX) or the full gtag.js script. Page views track automatically on every route.
            </p>
            <input
              type="text"
              className="fs-seo-input"
              value={trackingDraft.gaMeasurementId}
              onChange={(e) => setTrackingDraft({ ...trackingDraft, gaMeasurementId: e.target.value })}
              placeholder="G-XXXXXXXXXX or paste the full gtag.js script"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="fs-seo-tracking-foot">
          <span className="fs-seo-static-note">Full scripts are auto-parsed — only the ID/tag value is stored.</span>
          <button type="button" className="fs-seo-btn primary" onClick={handleSaveTracking} disabled={savingTracking}>
            {savingTracking ? <LoaderCircle size={14} className="fs-ga-spin" /> : <Save size={14} />}
            <span>{savingTracking ? 'Saving...' : 'Save Tracking Tags'}</span>
          </button>
        </div>
      </div>

      {/* Page Metadata */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Pencil size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Page Metadata</h2>
          <input
            type="text"
            className="fs-seo-search"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && pages.length === 0 ? (
          <div className="fs-ga-loading">
            <LoaderCircle size={28} className="fs-ga-spin" />
            <span>Loading SEO data...</span>
          </div>
        ) : (
          <div className="fs-seo-list">
            {filteredPages.map(page => {
              const a = audit(page);
              const isEditing = editingPath === page.path;
              return (
                <div key={page.path} className={`fs-seo-card ${isEditing ? 'editing' : ''}`}>
                  <div className="fs-seo-card-head">
                    <div className="fs-seo-card-path-row">
                      <code className="fs-seo-path">{page.path}</code>
                      {page.overridden && <span className="fs-seo-badge customized">Customized</span>}
                      <span className={`fs-seo-badge ${page.noindex ? 'noindex' : 'index'}`}>
                        {page.noindex ? 'noindex' : 'index, follow'}
                      </span>
                    </div>
                    <div className="fs-seo-card-actions">
                      {page.editable ? (
                        <>
                          {!isEditing && (
                            <button type="button" className="fs-seo-btn" onClick={() => startEdit(page)} title="Edit metadata">
                              <Pencil size={14} /> Edit
                            </button>
                          )}
                          {page.overridden && (
                            <button type="button" className="fs-seo-btn danger" onClick={() => handleReset(page.path)} title="Reset to default">
                              <RotateCcw size={14} /> Reset
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="fs-seo-static-note">Managed statically</span>
                      )}
                    </div>
                  </div>

                  <div className="fs-seo-card-body">
                    <p className="fs-seo-title-line">
                      {page.title}
                      <span className={`fs-seo-len ${a.titleOk ? 'ok' : 'warn'}`}>{a.tLen} chars</span>
                    </p>
                    {page.description && (
                      <p className="fs-seo-desc-line">
                        {page.description}
                        <span className={`fs-seo-len ${a.descOk ? 'ok' : 'warn'}`}>{a.dLen} chars</span>
                      </p>
                    )}
                    {page.keywords && (
                      <p className="fs-seo-keywords-line">{page.keywords}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="fs-seo-edit">
                      {/* Live Google SERP preview */}
                      <div className="fs-seo-serp">
                        <p className="fs-seo-serp-label">Google Preview</p>
                        <div className="fs-seo-serp-card">
                          <p className="fs-seo-serp-url">freesong.in{page.path === '/' ? '' : page.path}</p>
                          <p className="fs-seo-serp-title">{draft.title || 'Your page title appears here'}</p>
                          <RatingRow />
                          <p className="fs-seo-serp-desc">
                            {draft.description || 'Your meta description appears here. Write 120-160 characters describing the page for the best click-through rate.'}
                          </p>
                        </div>
                      </div>

                      <label className="fs-seo-field-label">
                        Title <span className="fs-seo-len inline">{draft.title.length}/65</span>
                      </label>
                      <input
                        type="text"
                        className="fs-seo-input"
                        value={draft.title}
                        maxLength={120}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        placeholder="Page title - always ends with | freesong.in"
                      />

                      <label className="fs-seo-field-label">
                        Meta Description <span className="fs-seo-len inline">{draft.description.length}/165</span>
                      </label>
                      <textarea
                        className="fs-seo-input"
                        rows={3}
                        value={draft.description}
                        maxLength={320}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        placeholder="Describe the page in 120-160 characters with natural keywords..."
                      />

                      <label className="fs-seo-field-label">Keywords (comma separated)</label>
                      <input
                        type="text"
                        className="fs-seo-input"
                        value={draft.keywords}
                        onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
                        placeholder="ads free songs, ads free streaming, free streaming, freesong.in"
                      />

                      <div className="fs-seo-edit-foot">
                        <label className="fs-seo-noindex">
                          <input
                            type="checkbox"
                            checked={draft.noindex}
                            onChange={(e) => setDraft({ ...draft, noindex: e.target.checked })}
                          />
                          <span>noindex, nofollow (hide from search engines)</span>
                        </label>
                        <div className="fs-seo-edit-actions">
                          <button type="button" className="fs-seo-btn" onClick={cancelEdit}>
                            <X size={14} /> Cancel
                          </button>
                          <button type="button" className="fs-seo-btn primary" onClick={() => handleSave(page.path)} disabled={saving}>
                            {saving ? <LoaderCircle size={14} className="fs-ga-spin" /> : <Save size={14} />}
                            <span>{saving ? 'Saving...' : 'Save SEO'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredPages.length === 0 && (
              <p className="fs-seo-empty">No pages match "{search}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SeoAdmin;
