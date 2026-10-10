import React, { useState, useEffect, useCallback } from 'react';
import { Users, MapPin, LoaderCircle } from 'lucide-react';
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

  const loadUsers = useCallback(async (authToken, targetPage = 1) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getRegisteredUsers(authToken, targetPage, PAGE_SIZE);
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
    if (token) loadUsers(token, 1);
  }, [token, loadUsers]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadUsers(token, page);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePage = (p) => {
    setPage(p);
    loadUsers(token, p);
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

  return (
    <div className="fs-ga-users">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Users size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Registered Users</h2>
          <span className="fs-ga-section-sub">{total.toLocaleString('en-IN')} users · latest first</span>
          {loading && <LoaderCircle size={14} className="fs-ga-spin" />}
        </div>

        <div className="fs-ga-list-container">
          {!loading && users.length === 0 ? (
            <p className="fs-ga-empty-text">No registered users yet</p>
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
                    <div className="fs-ga-avatar letter">
                      {(u.name || 'U').charAt(0).toUpperCase()}
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
    </div>
  );
}

export default RegisteredUsers;
