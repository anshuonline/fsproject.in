const API_BASE = '/api';
const VISITOR_KEY = 'fs_analytics_visitor_id';
const VISIT_TRACKED_KEY = 'fs_analytics_visit_tracked';
const ADMIN_TOKEN_KEY = 'fs_ganalytics_token';

// Bot environments must never pollute analytics
function isBotEnvironment() {
  if (typeof navigator === 'undefined') return false;
  if (navigator.webdriver) return true;
  const search = window.location?.search || '';
  if (search.includes('LSCWP_CTRL') || search.includes('before_optm')) return true;
  return false;
}

// Stable guest id per browser (never contains personal info)
export function getAnalyticsVisitorId() {
  if (typeof localStorage === 'undefined') return 'guest_temp';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    try {
      localStorage.setItem(VISITOR_KEY, id);
    } catch {}
  }
  return id;
}

function post(path, body) {
  try {
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    }).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}

// ── Visitor / Search / Play Tracking ─────────────────────────────────────────

// Track a daily visit (once per session; upgrades guest visit to registered when logged in)
export function trackVisit(user = null) {
  if (isBotEnvironment()) return Promise.resolve(null);
  const isRegistered = Boolean(user?.email || user?.dbId);
  const guestId = getAnalyticsVisitorId();
  const visitorId = isRegistered ? (user.dbId ? `usr_${user.dbId}` : user.email) : guestId;

  if (!isRegistered && sessionStorage.getItem(VISIT_TRACKED_KEY)) {
    return Promise.resolve(null);
  }

  if (isRegistered) {
    return post('/analytics/track/visit', {
      visitorId,
      guestId,
      isRegistered: true
    });
  }

  sessionStorage.setItem(VISIT_TRACKED_KEY, '1');
  return post('/analytics/track/visit', {
    visitorId: guestId,
    isRegistered: false
  });
}

// Track a search query (fire and forget)
export function trackSearch(query, resultCount = 0, user = null) {
  if (isBotEnvironment()) return Promise.resolve(null);
  const trimmed = (query || '').trim();
  if (!trimmed) return Promise.resolve(null);
  const isRegistered = Boolean(user?.email || user?.dbId);
  return post('/analytics/track/search', {
    query: trimmed,
    visitorId: isRegistered ? (user.dbId ? `usr_${user.dbId}` : user.email) : getAnalyticsVisitorId(),
    isRegistered,
    resultCount
  });
}

// Track a song play (fire and forget)
export function trackPlay(track, user = null) {
  if (isBotEnvironment()) return Promise.resolve(null);
  if (!track || !track.videoId) return Promise.resolve(null);
  const isRegistered = Boolean(user?.email || user?.dbId);
  return post('/analytics/track/play', {
    videoId: track.videoId,
    title: track.title,
    artist: track.artist,
    thumbnail: track.thumbnail || '',
    visitorId: isRegistered ? (user.dbId ? `usr_${user.dbId}` : user.email) : getAnalyticsVisitorId(),
    isRegistered
  });
}

// Presence heartbeat (Live Now: online status, location, now playing — every 60s)
export function trackPresence(user = null, song = null) {
  if (isBotEnvironment()) return Promise.resolve(null);
  const isRegistered = Boolean(user?.email || user?.dbId);
  return post('/analytics/track/presence', {
    visitorId: isRegistered ? (user.dbId ? `usr_${user.dbId}` : user.email) : getAnalyticsVisitorId(),
    isRegistered,
    displayName: isRegistered ? (user.name || user.email?.split('@')[0] || null) : null,
    song: song ? {
      videoId: song.videoId,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail || ''
    } : null
  });
}

// ── GAnalytics Admin Dashboard ───────────────────────────────────────────────

export function getSavedAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveAdminToken(token) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
}

// Admin Login (Admin ID + password validated against MySQL, MD5 password)
export async function loginAdmin(adminId, password) {
  try {
    const res = await fetch(`${API_BASE}/analytics/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, password })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.error || 'Invalid admin ID or password');
      err.status = res.status;
      throw err;
    }
    if (data?.token) saveAdminToken(data.token);
    return data;
  } catch (err) {
    if (err.status) throw err;
    console.warn('Admin login error:', err);
    throw new Error('Connection failed. Is the FreeSong server running?');
  }
}

// Fetch analytics overview (token protected)
export async function getAnalyticsOverview(token) {
  try {
    const res = await fetch(`${API_BASE}/analytics/overview?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = new Error(res.status === 401 ? 'Session expired' : 'Failed to fetch analytics');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (err) {
    if (err.status === 401) throw err;
    console.warn('Analytics overview error:', err);
    return null;
  }
}

// Fetch last 30 days admin login logs (token protected)
export async function getAdminLogs(token) {
  try {
    const res = await fetch(`${API_BASE}/analytics/logs?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = new Error(res.status === 401 ? 'Session expired' : 'Failed to fetch logs');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data?.logs || [];
  } catch (err) {
    if (err.status === 401) throw err;
    console.warn('Admin logs error:', err);
    return [];
  }
}

// Fetch Live Now users (token protected)
export async function getLiveUsers(token) {
  try {
    const res = await fetch(`${API_BASE}/analytics/live?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = new Error(res.status === 401 ? 'Session expired' : 'Failed to fetch live users');
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return data?.data || null;
  } catch (err) {
    if (err.status === 401) throw err;
    console.warn('Live users error:', err);
    return null;
  }
}
