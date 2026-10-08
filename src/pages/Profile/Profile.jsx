import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Sparkles, Heart, ListMusic, Settings, LogOut, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import { Link } from 'react-router-dom';
import './Profile.css';

export function Profile() {
  const { likedSongs = [], playlists = [], history = [] } = useLibrary() || {};
  const { user, isAuthenticated, logout, loginWithGoogle, isGoogleLoading } = useAuth();
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  // Reset imgError if user picture changes
  useEffect(() => {
    setImgError(false);
  }, [user?.picture]);

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'info');
  };

  const handleGoogleSignIn = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setImgError(false);
        showToast(`Welcome, ${loggedUser.name}!`, 'success');
      }
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(err?.message || 'Google sign-in failed', 'error');
      }
    }
  };

  const displayName = user?.name || 'FreeSong Listener';
  const displayEmail = user?.email || (isAuthenticated ? 'user@freesong.in' : 'member@freesong.in');
  const hasGooglePic = Boolean(user?.picture) && !imgError;

  return (
    <div className="fs-profile-page">
      {/* Profile Card */}
      <div className="fs-profile-card">
        <div className="fs-profile-card-main">
          <div className="fs-profile-avatar-wrap">
            {hasGooglePic ? (
              <img
                src={user.picture}
                alt={displayName}
                className="fs-profile-avatar-img"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="fs-profile-avatar-circle">
                {user?.name ? (
                  <span className="fs-profile-avatar-initial">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={48} />
                )}
              </div>
            )}
          </div>

          <div className="fs-profile-details">
            <div className="fs-profile-header-title">
              <h1 className="fs-profile-username">{displayName}</h1>
              {user?.provider === 'google' && (
                <div className="fs-profile-google-badge" title="Authenticated via Google Identity">
                  <GoogleIcon size={15} />
                  <span>Google Account</span>
                </div>
              )}
            </div>
            <p className="fs-profile-email">{displayEmail}</p>
            <div className="fs-profile-tier">
              <ShieldCheck size={16} className="text-brand" />
              <span>FreeSong Premium Active (Ad-Free & AMOLED Experience)</span>
            </div>
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="fs-profile-card-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="btn btn-secondary fs-profile-action-btn"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                title="Switch or re-authenticate Google account"
              >
                <RefreshCw size={15} className={isGoogleLoading ? 'fs-spin' : ''} />
                <span>{isGoogleLoading ? 'Connecting...' : 'Switch Account'}</span>
              </button>
              <button
                type="button"
                className="btn fs-profile-logout-btn"
                onClick={handleLogout}
                title="Sign out of FreeSong"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary fs-profile-google-login-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              title="Sign in with your Google account"
            >
              <GoogleIcon size={18} />
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Banner if not signed in */}
      {!isAuthenticated && (
        <div className="fs-profile-guest-banner">
          <div className="fs-guest-banner-info">
            <GoogleIcon size={28} />
            <div>
              <h3>Connect your Google Account</h3>
              <p>Keep your playlists, liked songs, and custom history safe across all your mobile and desktop devices.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary fs-guest-connect-btn"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <span>{isGoogleLoading ? 'Connecting...' : 'Connect Now'}</span>
          </button>
        </div>
      )}

      {/* Stats Counter */}
      <div className="fs-profile-stats-row">
        <div className="fs-stat-box">
          <Heart size={24} className="text-brand" />
          <span className="fs-stat-number">{likedSongs.length}</span>
          <span className="fs-stat-label">Liked Songs</span>
        </div>

        <div className="fs-stat-box">
          <ListMusic size={24} className="text-brand" />
          <span className="fs-stat-number">{playlists.length}</span>
          <span className="fs-stat-label">Playlists</span>
        </div>

        <div className="fs-stat-box">
          <Sparkles size={24} className="text-brand" />
          <span className="fs-stat-number">{history.length}</span>
          <span className="fs-stat-label">Songs Streamed</span>
        </div>
      </div>

      {/* Account Info & Security */}
      <div className="fs-profile-section">
        <h3 className="fs-section-title">Account Information</h3>
        <div className="fs-account-details-grid">
          <div className="fs-account-detail-card">
            <span className="fs-detail-label">Authentication Method</span>
            <div className="fs-detail-value">
              {user?.provider === 'google' ? (
                <>
                  <GoogleIcon size={16} />
                  <span>Google OAuth (Verified)</span>
                </>
              ) : (
                <span>Guest / Local Profile</span>
              )}
            </div>
          </div>

          <div className="fs-account-detail-card">
            <span className="fs-detail-label">Streaming Quality</span>
            <div className="fs-detail-value">
              <CheckCircle2 size={16} className="text-brand" />
              <span>Hi-Fi Master (320kbps)</span>
            </div>
          </div>

          <div className="fs-account-detail-card">
            <span className="fs-detail-label">AMOLED True Black</span>
            <div className="fs-detail-value">
              <CheckCircle2 size={16} className="text-brand" />
              <span>Enabled (#000000)</span>
            </div>
          </div>

          <div className="fs-account-detail-card">
            <span className="fs-detail-label">Synced Status</span>
            <div className="fs-detail-value">
              <span className="text-brand font-semibold">Active & Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="fs-profile-section">
        <h3 className="fs-section-title">Preferences</h3>
        <div className="fs-prefs-list">
          <Link to="/settings" className="fs-pref-item">
            <div className="fs-pref-info">
              <Settings size={20} />
              <div>
                <h4>Audio & Streaming Settings</h4>
                <p>High quality audio stream, auto-play next track, cache options</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

