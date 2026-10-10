import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio, User, LoaderCircle, Music2, MapPin, RefreshCw
} from 'lucide-react';
import { getLiveUsers } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { Pagination } from './Pagination';
import './LiveNow.css';

const PAGE_SIZE = 8;

export function LiveNow() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [listPage, setListPage] = useState(1);

  const loadLive = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getLiveUsers(authToken);
      setLive(data);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  // Initial load + auto-refresh every 30 seconds
  useEffect(() => {
    if (!token) return;
    loadLive(token);
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadLive(token);
    }, 30000);
    return () => clearInterval(interval);
  }, [token, loadLive]);

  // Manual refresh from header
  useEffect(() => {
    if (refreshTick > 0 && token) loadLive(token);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

  // Always display Indian Standard Time regardless of device/server timezone
  const formatTimeIST = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };
  const formatDateIST = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' });
  };

  const playingUsers = (live?.users || []).filter(u => u.currentSong);

  // Live list pagination (keep current page stable across auto-refresh, clamp when list shrinks)
  const liveUsers = live?.users || [];
  const listPages = Math.max(1, Math.ceil(liveUsers.length / PAGE_SIZE));
  useEffect(() => {
    if (listPage > listPages) setListPage(listPages);
  }, [listPages, listPage]);
  const pageUsers = liveUsers.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);

  const guestLabel = (visitorId) => {
    const short = (visitorId || '').replace('guest_', '').split('_')[0];
    return `Guest ${short ? `• ${short.slice(0, 6)}` : ''}`;
  };

  return (
    <div className="fs-ga-live">
      {/* Live Stat Cards */}
      <div className="fs-ga-stats-grid cols-3">
        <div className="fs-ga-stat-card">
          <div className="fs-ga-stat-icon-wrap live-online">
            <Radio size={20} />
            <span className="fs-ga-live-pulse-dot" />
          </div>
          <p className="fs-ga-stat-label">Total Online</p>
          <p className="fs-ga-stat-value">{formatNumber(live?.totalOnline)}</p>
        </div>
        <div className="fs-ga-stat-card">
          <div className="fs-ga-stat-icon-wrap guests"><User size={20} /></div>
          <p className="fs-ga-stat-label">Guests Online</p>
          <p className="fs-ga-stat-value">{formatNumber(live?.guestsOnline)}</p>
        </div>
        <div className="fs-ga-stat-card">
          <div className="fs-ga-stat-icon-wrap registered"><User size={20} /></div>
          <p className="fs-ga-stat-label">Registered Online</p>
          <p className="fs-ga-stat-value">{formatNumber(live?.registeredOnline)}</p>
        </div>
      </div>

      {/* Now Playing Right Now */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Music2 size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Now Playing Right Now</h2>
          <span className="fs-ga-section-sub">{playingUsers.length} {playingUsers.length === 1 ? 'listener' : 'listeners'} streaming</span>
          {loading && <LoaderCircle size={14} className="fs-ga-spin" />}
        </div>
        {playingUsers.length === 0 ? (
          <div className="fs-ga-live-np-empty">
            <Music2 size={28} />
            <p>Koi gana play nahi ho raha right now</p>
          </div>
        ) : (
          <div className="fs-ga-live-np-grid">
            {playingUsers.map((u, i) => (
              <div key={`np-${u.visitorId}-${i}`} className="fs-ga-live-np-card">
                <img src={u.currentSong.thumbnail} alt={u.currentSong.title} className="fs-ga-live-np-thumb" loading="lazy" />
                <div className="fs-ga-live-np-body">
                  <span className="fs-ga-live-np-title truncate">{u.currentSong.title}</span>
                  <span className="fs-ga-live-np-artist truncate">{u.currentSong.artist}</span>
                  <div className="fs-ga-live-np-meta">
                    <span className={`fs-ga-badge ${u.type}`}>
                      {u.type === 'registered' ? (u.name || 'Registered') : 'Guest'}
                    </span>
                    {u.city && (
                      <span className="fs-ga-live-np-location truncate"><MapPin size={11} /> {u.city}</span>
                    )}
                  </div>
                </div>
                <Music2 size={14} className="fs-ga-live-np-eq" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Listeners List */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Radio size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Live Listeners</h2>
          <span className="fs-ga-section-sub">
            {lastUpdated ? `Updated ${formatTimeIST(lastUpdated)} IST · ${liveUsers.length} online` : 'Active in last 5 minutes'}
          </span>
          {loading && <LoaderCircle size={14} className="fs-ga-spin" />}
        </div>

        <div className="fs-ga-list-container">
          {liveUsers.length === 0 ? (
            <p className="fs-ga-empty-text">No one is online right now — check back in a bit</p>
          ) : (
            <>
              <div className="fs-ga-live-header">
                <span className="fs-ga-live-col-user">User</span>
                <span className="fs-ga-live-col-location">Location</span>
                <span className="fs-ga-live-col-song">Now Playing</span>
                <span className="fs-ga-live-col-seen">Last Seen</span>
              </div>
              {pageUsers.map((u, i) => (
                <div key={`${u.visitorId}-${i}`} className="fs-ga-live-row">
                  {/* User */}
                  <div className="fs-ga-live-col-user">
                    <div className={`fs-ga-avatar ${u.type === 'registered' ? 'letter' : 'icon'}`}>
                      {u.type === 'registered' ? (u.name || 'U').charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <div className="fs-ga-live-user-info">
                      <span className="fs-ga-live-user-name truncate">
                        {u.type === 'registered' ? u.name : guestLabel(u.visitorId)}
                      </span>
                      <span className={`fs-ga-badge ${u.type}`}>
                        {u.type === 'registered' ? 'Registered' : 'Guest'}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="fs-ga-live-col-location">
                    {u.city || u.country ? (
                      <>
                        <MapPin size={13} />
                        <span className="truncate">
                          {[u.city, u.country].filter(Boolean).join(', ')}
                        </span>
                      </>
                    ) : (
                      <span className="fs-ga-live-unknown">Unknown</span>
                    )}
                  </div>

                  {/* Now Playing */}
                  <div className="fs-ga-live-col-song">
                    {u.currentSong ? (
                      <>
                        <img src={u.currentSong.thumbnail} alt="" className="fs-ga-live-song-thumb" loading="lazy" />
                        <div className="fs-ga-live-song-info">
                          <span className="fs-ga-live-song-title truncate">{u.currentSong.title}</span>
                          <span className="fs-ga-live-song-artist truncate">{u.currentSong.artist}</span>
                        </div>
                        <Music2 size={14} className="fs-ga-live-playing-icon" />
                      </>
                    ) : (
                      <span className="fs-ga-live-idle">Idle</span>
                    )}
                  </div>

                  {/* Last Seen */}
                  <div className="fs-ga-live-col-seen">
                    <span className="fs-ga-live-seen-time">{formatTimeIST(u.lastSeenAt)} IST</span>
                    <span className="fs-ga-live-seen-date">{formatDateIST(u.lastSeenAt)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <Pagination
          page={listPage}
          pages={listPages}
          total={liveUsers.length}
          label="online users"
          pageSize={PAGE_SIZE}
          onPage={setListPage}
        />
      </div>
    </div>
  );
}
