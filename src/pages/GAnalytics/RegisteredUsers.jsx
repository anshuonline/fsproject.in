import React, { useState, useEffect, useCallback } from 'react';
import { Users, MapPin, LoaderCircle, Search, X, ZoomIn, Calendar, Clock } from 'lucide-react';
import { getRegisteredUsers } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { Pagination } from './Pagination';
import './RegisteredUsers.css';

const PAGE_SIZE = 10;

export function RegisteredUsers() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [previewUser, setPreviewUser] = useState(null);

  const loadUsers = useCallback(async (authToken, targetPage = 1, searchQuery = '') => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getRegisteredUsers(authToken, targetPage, PAGE_SIZE, searchQuery);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
      setPage(Math.min(data.page, data.pages));
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadUsers(token, 1, search);
  }, [token, loadUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (refreshTick > 0 && token) loadUsers(token, page, search);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    loadUsers(token, 1, val);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    loadUsers(token, 1, '');
  };

  const handlePage = (p) => {
    setPage(p);
    loadUsers(token, p, search);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const getHighResPhoto = (url) => {
    if (!url) return '';
    if (url.includes('googleusercontent.com')) {
      return url.replace(/=s\d+(-c)?/i, '=s500-c');
    }
    return url;
  };

  return (
    <div className="fs-ga-users">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <div className="fs-ga-section-header-left">
            <Users size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Registered Users</h2>
            <span className="fs-ga-section-sub">{total.toLocaleString('en-IN')} users · latest first</span>
            {loading && <LoaderCircle size={14} className="fs-ga-spin" />}
          </div>

          {/* Search Box */}
          <div className="fs-ga-search-box">
            <Search size={14} className="fs-ga-search-icon" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              className="fs-ga-search-input"
            />
            {search && (
              <button
                type="button"
                className="fs-ga-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="fs-ga-list-container">
          {!loading && users.length === 0 ? (
            <p className="fs-ga-empty-text">
              {search ? 'No users matching your search' : 'No registered users yet'}
            </p>
          ) : (
            <>
              <div className="fs-ga-users-header">
                <span className="fs-ga-users-col-user">User</span>
                <span className="fs-ga-users-col-location">Location</span>
                <span className="fs-ga-users-col-joined">Joined</span>
                <span className="fs-ga-users-col-login">Last Login</span>
              </div>
              {users.map((u, i) => (
                <div key={`${u.email}-${i}`} className="fs-ga-users-row">
                  <div className="fs-ga-users-col-user">
                    <div
                      className={`fs-ga-avatar ${u.avatarUrl ? 'has-img' : 'letter'}`}
                      onClick={() => u.avatarUrl && setPreviewUser(u)}
                      title={u.avatarUrl ? 'Click to view full profile picture' : ''}
                    >
                      {u.avatarUrl ? (
                        <>
                          <img src={u.avatarUrl} alt={u.name} className="fs-ga-avatar-img" />
                          <div className="fs-ga-avatar-zoom">
                            <ZoomIn size={13} />
                          </div>
                        </>
                      ) : (
                        (u.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="fs-ga-users-user-info">
                      <span className="fs-ga-users-name truncate">{u.name}</span>
                      <span className="fs-ga-users-email truncate">{u.email}</span>
                    </div>
                  </div>
                  <div className="fs-ga-users-col-location">
                    {u.city || u.country ? (
                      <>
                        <MapPin size={13} />
                        <span className="truncate">{[u.city, u.country].filter(Boolean).join(', ')}</span>
                      </>
                    ) : (
                      <span className="fs-ga-users-unknown">Unknown</span>
                    )}
                  </div>
                  <div className="fs-ga-users-col-joined">{formatDate(u.joinedAt)}</div>
                  <div className="fs-ga-users-col-login">{formatDateTime(u.lastLoginAt)}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <Pagination
          page={page}
          pages={pages}
          total={total}
          label="users"
          pageSize={PAGE_SIZE}
          onPage={handlePage}
        />
      </div>

      {/* High-Res Full Picture Lightbox Modal */}
      {previewUser && (
        <div
          className="fs-ga-lightbox-backdrop"
          onClick={() => setPreviewUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="fs-ga-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="fs-ga-lightbox-close"
              onClick={() => setPreviewUser(null)}
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>

            <div className="fs-ga-lightbox-image-wrap">
              <img
                src={getHighResPhoto(previewUser.avatarUrl)}
                alt={previewUser.name || previewUser.email}
                className="fs-ga-lightbox-img"
              />
            </div>

            <div className="fs-ga-lightbox-info">
              <h3 className="fs-ga-lightbox-name">{previewUser.name || 'FreeSong Listener'}</h3>
              <code className="fs-ga-lightbox-email">{previewUser.email}</code>
              {previewUser.city || previewUser.country ? (
                <span className="fs-ga-lightbox-meta">
                  <MapPin size={12} />
                  {[previewUser.city, previewUser.country].filter(Boolean).join(', ')}
                </span>
              ) : null}
              <span className="fs-ga-lightbox-meta">
                <Calendar size={12} />
                Joined: {formatDate(previewUser.joinedAt)}
              </span>
              <span className="fs-ga-lightbox-meta">
                <Clock size={12} />
                Last active: {formatDateTime(previewUser.lastLoginAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisteredUsers;
