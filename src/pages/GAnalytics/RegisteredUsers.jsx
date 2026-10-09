import React from 'react';
import { Users, MapPin, LoaderCircle } from 'lucide-react';
import { useGAnalytics } from './GAnalyticsLayout';
import './RegisteredUsers.css';

export function RegisteredUsers() {
  const { overview, loadingOverview } = useGAnalytics();

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

  if (loadingOverview && !overview) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading users...</span>
      </div>
    );
  }

  const users = overview?.registeredUsers || [];

  return (
    <div className="fs-ga-users">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Users size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Registered Users</h2>
          <span className="fs-ga-section-sub">{users.length} users · latest first</span>
        </div>

        <div className="fs-ga-list-container">
          {users.length === 0 ? (
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
      </div>
    </div>
  );
}
