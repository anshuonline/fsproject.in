import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, ShoppingBag, Settings2, Save, Check, Plus, Trash2,
  Loader2, Monitor, Smartphone, Layers, ExternalLink, Lock, Eye, EyeOff
} from 'lucide-react';
import { loginAdmin, getSavedAdminToken, clearAdminToken } from '../../services/analyticsService';
import { useToast } from '../../context/ContextMenuContext';
import './ManageAds.css';

const API_BASE = '/api';

const SLOT_META = {
  header_banner: { icon: Layers, hint: 'Appears below the header on every page' },
  infeed_shelf_1: { icon: Layers, hint: 'Injected after the 2nd home shelf' },
  infeed_shelf_2: { icon: Layers, hint: 'Injected after the 5th home shelf (native works best)' },
  sidebar_sticky: { icon: Monitor, hint: 'Right rail, sticky — desktop >= 1400px only' },
  detail_rectangle: { icon: Layers, hint: 'After tracklist on song/album/playlist pages' },
  search_native: { icon: Layers, hint: 'After search results (native blends best)' },
  social_bar: { icon: Megaphone, hint: 'Global floating script — no page space needed' },
  playlist_infeed: { icon: Layers, hint: 'Every 5 tracks inside playlist tracklists' },
  player_cover_rotate: { icon: Eye, hint: 'Alternates with artwork in the fullscreen player' }
};

export function ManageAds() {
  const { showToast } = useToast();
  const [token, setToken] = useState(() => getSavedAdminToken());
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [activeTab, setActiveTab] = useState('slots');

  const [slots, setSlots] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [settings, setSettings] = useState({ playerRotationSeconds: 5, affiliateRotateSeconds: 18, playlistInfeedEvery: 5 });

  const loadConfig = useCallback(async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/manageads/config?token=${encodeURIComponent(authToken)}`, { cache: 'no-store' });
      if (res.status === 401) {
        clearAdminToken();
        setToken(null);
        showToast('Session expired. Please login again.', 'error');
        return;
      }
      const data = await res.json();
      if (data?.success) {
        setSlots(data.config.slots || []);
        setAffiliates(data.config.affiliates || []);
        setSettings({ playerRotationSeconds: 5, affiliateRotateSeconds: 18, playlistInfeedEvery: 5, ...data.config.settings });
      }
    } catch {
      showToast('Failed to load ad config', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Auto-login with saved session
  useEffect(() => {
    if (token) loadConfig(token);
  }, [token, loadConfig]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await loginAdmin(adminId.trim(), password);
      if (res?.token) {
        setToken(res.token);
        loadConfig(res.token);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const updateSlot = (slotId, patch) => {
    setSlots(prev => prev.map(s => (s.slotId === slotId ? { ...s, ...patch } : s)));
  };

  const updateAffiliate = (id, patch) => {
    setAffiliates(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  };

  const addAffiliate = () => {
    setAffiliates(prev => [...prev, { id: `new-${Date.now()}`, name: '', imageUrl: '', amazonUrl: '', priceLabel: '', enabled: 1 }]);
  };

  const removeAffiliate = (id) => {
    setAffiliates(prev => prev.filter(a => a.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/manageads/config?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, affiliates, settings })
      });
      if (res.status === 401) {
        clearAdminToken();
        setToken(null);
        showToast('Session expired. Please login again.', 'error');
        return;
      }
      const data = await res.json();
      if (data?.success) {
        setSavedTick(true);
        setTimeout(() => setSavedTick(false), 2200);
        showToast('Ad configuration saved successfully', 'success');
      } else {
        showToast(data?.error || 'Save failed', 'error');
      }
    } catch {
      showToast('Save failed — is the server running?', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Login screen ──
  if (!token) {
    return (
      <div className="mad-backdrop">
        <form className="mad-login-card" onSubmit={handleLogin}>
          <div className="mad-login-logo">
            <Megaphone size={26} />
          </div>
          <h1 className="mad-login-title">ManageAds</h1>
          <p className="mad-login-sub">Ad slots & affiliate dashboard for FreeSong.in</p>

          <label className="mad-field">
            <span>Admin ID</span>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label className="mad-field">
            <span>Password</span>
            <div className="mad-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="mad-eye-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {loginError && <p className="mad-login-error">{loginError}</p>}

          <button type="submit" className="mad-login-btn" disabled={loggingIn}>
            {loggingIn ? <Loader2 size={16} className="spin" /> : <Lock size={15} />}
            <span>{loggingIn ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="mad-page">
      {/* Header */}
      <header className="mad-header">
        <div className="mad-header-brand">
          <div className="mad-header-icon"><Megaphone size={20} /></div>
          <div>
            <h1 className="mad-title">ManageAds</h1>
            <p className="mad-subtitle">Configure ad placements & Amazon affiliate stickers</p>
          </div>
        </div>
        <button className={`mad-save-btn ${savedTick ? 'saved' : ''}`} onClick={saveAll} disabled={saving}>
          {savedTick ? <Check size={16} /> : saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          <span>{savedTick ? 'Saved!' : saving ? 'Saving...' : 'Save All'}</span>
        </button>
      </header>

      {/* Tabs */}
      <nav className="mad-tabs">
        <button className={`mad-tab ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>
          <Layers size={15} />
          <span>Ad Slots</span>
          <span className="mad-tab-count">{slots.length}</span>
        </button>
        <button className={`mad-tab ${activeTab === 'affiliate' ? 'active' : ''}`} onClick={() => setActiveTab('affiliate')}>
          <ShoppingBag size={15} />
          <span>Amazon Affiliate</span>
          <span className="mad-tab-count">{affiliates.length}</span>
        </button>
        <button className={`mad-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings2 size={15} />
          <span>Settings</span>
        </button>
      </nav>

      {loading ? (
        <div className="mad-loading"><Loader2 size={28} className="spin text-brand" /><p>Loading configuration...</p></div>
      ) : (
        <>
          {/* ── Ad Slots Tab ── */}
          {activeTab === 'slots' && (
            <div className="mad-slot-list">
              {slots.map(slot => {
                const Meta = SLOT_META[slot.slotId]?.icon || Layers;
                return (
                  <section key={slot.slotId} className={`mad-slot-card ${Number(slot.enabled) === 1 ? 'enabled' : ''}`}>
                    <div className="mad-slot-head">
                      <div className="mad-slot-title-wrap">
                        <div className="mad-slot-icon"><Meta size={16} /></div>
                        <div>
                          <h3 className="mad-slot-title">{slot.label || slot.slotId}</h3>
                          <p className="mad-slot-hint">{SLOT_META[slot.slotId]?.hint || slot.description}</p>
                        </div>
                      </div>
                      <label className="mad-switch" title="Enable / disable this slot">
                        <input
                          type="checkbox"
                          checked={Number(slot.enabled) === 1}
                          onChange={(e) => updateSlot(slot.slotId, { enabled: e.target.checked ? 1 : 0 })}
                        />
                        <span className="mad-slider" />
                      </label>
                    </div>

                    <div className="mad-slot-grid">
                      <label className="mad-field">
                        <span><Monitor size={12} /> Desktop script</span>
                        <textarea
                          rows={3}
                          value={slot.scriptDesktop || ''}
                          onChange={(e) => updateSlot(slot.slotId, { scriptDesktop: e.target.value })}
                          placeholder="Paste Adsterra / ad network code here..."
                          spellCheck="false"
                        />
                      </label>
                      <label className="mad-field">
                        <span><Smartphone size={12} /> Mobile script</span>
                        <textarea
                          rows={3}
                          value={slot.scriptMobile || ''}
                          onChange={(e) => updateSlot(slot.slotId, { scriptMobile: e.target.value })}
                          placeholder="Leave empty to reuse desktop script..."
                          spellCheck="false"
                        />
                      </label>
                    </div>

                    <div className="mad-slot-foot">
                      <label className="mad-device-select">
                        <span>Target</span>
                        <select
                          value={slot.devices || 'both'}
                          onChange={(e) => updateSlot(slot.slotId, { devices: e.target.value })}
                        >
                          <option value="both">Desktop + Mobile</option>
                          <option value="desktop">Desktop only</option>
                          <option value="mobile">Mobile only</option>
                        </select>
                      </label>
                      <code className="mad-slot-id">{slot.slotId}</code>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* ── Affiliate Tab ── */}
          {activeTab === 'affiliate' && (
            <div className="mad-affiliate-wrap">
              <div className="mad-affiliate-note">
                <p>Paste <strong>Amazon affiliate links</strong> (with your tag). Products rotate inside the YT-Shorts-style sticker shown on the fullscreen player.</p>
                <button className="mad-add-btn" onClick={addAffiliate}><Plus size={15} /><span>Add Product</span></button>
              </div>

              {affiliates.length === 0 && (
                <div className="mad-empty">No products yet — click "Add Product" to create your first sticker.</div>
              )}

              {affiliates.map(a => (
                <section key={a.id} className={`mad-affiliate-card ${Number(a.enabled) === 1 ? 'enabled' : ''}`}>
                  <div className="mad-affiliate-row">
                    <div className="mad-affiliate-preview">
                      {a.imageUrl
                        ? <img src={a.imageUrl} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = '0.15'; }} />
                        : <ShoppingBag size={20} />}
                    </div>
                    <div className="mad-affiliate-fields">
                      <div className="mad-affiliate-grid">
                        <label className="mad-field">
                          <span>Product name</span>
                          <input type="text" value={a.name || ''} onChange={(e) => updateAffiliate(a.id, { name: e.target.value })} placeholder="boAt Rockerz 550" />
                        </label>
                        <label className="mad-field">
                          <span>Price label</span>
                          <input type="text" value={a.priceLabel || ''} onChange={(e) => updateAffiliate(a.id, { priceLabel: e.target.value })} placeholder="₹1,499" />
                        </label>
                      </div>
                      <label className="mad-field">
                        <span>Image URL</span>
                        <input type="url" value={a.imageUrl || ''} onChange={(e) => updateAffiliate(a.id, { imageUrl: e.target.value })} placeholder="https://m.media-amazon.com/..." />
                      </label>
                      <label className="mad-field">
                        <span>Amazon link (with your affiliate tag)</span>
                        <input type="url" value={a.amazonUrl || ''} onChange={(e) => updateAffiliate(a.id, { amazonUrl: e.target.value })} placeholder="https://www.amazon.in/dp/B08XXX?tag=freesong-music-21" />
                      </label>
                    </div>
                    <div className="mad-affiliate-actions">
                      <label className="mad-switch" title="Enable / disable">
                        <input
                          type="checkbox"
                          checked={Number(a.enabled) === 1}
                          onChange={(e) => updateAffiliate(a.id, { enabled: e.target.checked ? 1 : 0 })}
                        />
                        <span className="mad-slider" />
                      </label>
                      <button className="mad-delete-btn" onClick={() => removeAffiliate(a.id)} aria-label="Remove product">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {a.amazonUrl && (
                    <a className="mad-affiliate-link-preview" href={a.amazonUrl} target="_blank" rel="noopener noreferrer nofollow sponsored">
                      <ExternalLink size={12} />
                      <span className="truncate">{a.amazonUrl}</span>
                    </a>
                  )}
                </section>
              ))}
            </div>
          )}

          {/* ── Settings Tab ── */}
          {activeTab === 'settings' && (
            <div className="mad-settings-wrap">
              <section className="mad-slot-card enabled">
                <div className="mad-slot-head">
                  <div className="mad-slot-title-wrap">
                    <div className="mad-slot-icon"><Eye size={16} /></div>
                    <div>
                      <h3 className="mad-slot-title">Player cover rotation</h3>
                      <p className="mad-slot-hint">Seconds the ad stays visible before switching back to the artwork</p>
                    </div>
                  </div>
                </div>
                <div className="mad-settings-row">
                  <input
                    type="range" min="3" max="20" step="1"
                    value={settings.playerRotationSeconds || 5}
                    onChange={(e) => setSettings(s => ({ ...s, playerRotationSeconds: e.target.value }))}
                  />
                  <span className="mad-range-value">{settings.playerRotationSeconds || 5}s ad / 5s cover</span>
                </div>
              </section>

              <section className="mad-slot-card enabled">
                <div className="mad-slot-head">
                  <div className="mad-slot-title-wrap">
                    <div className="mad-slot-icon"><ShoppingBag size={16} /></div>
                    <div>
                      <h3 className="mad-slot-title">Affiliate sticker rotation</h3>
                      <p className="mad-slot-hint">How often the sticker cycles to the next product</p>
                    </div>
                  </div>
                </div>
                <div className="mad-settings-row">
                  <input
                    type="range" min="8" max="60" step="1"
                    value={settings.affiliateRotateSeconds || 18}
                    onChange={(e) => setSettings(s => ({ ...s, affiliateRotateSeconds: e.target.value }))}
                  />
                  <span className="mad-range-value">{settings.affiliateRotateSeconds || 18}s</span>
                </div>
              </section>

              <section className="mad-slot-card enabled">
                <div className="mad-slot-head">
                  <div className="mad-slot-title-wrap">
                    <div className="mad-slot-icon"><Layers size={16} /></div>
                    <div>
                      <h3 className="mad-slot-title">Playlist in-feed frequency</h3>
                      <p className="mad-slot-hint">Ad appears after every N tracks (site default: 5)</p>
                    </div>
                  </div>
                </div>
                <div className="mad-settings-row">
                  <input
                    type="range" min="3" max="15" step="1"
                    value={settings.playlistInfeedEvery || 5}
                    onChange={(e) => setSettings(s => ({ ...s, playlistInfeedEvery: e.target.value }))}
                  />
                  <span className="mad-range-value">every {settings.playlistInfeedEvery || 5} tracks</span>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
