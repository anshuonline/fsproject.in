import React, { useState, useEffect } from 'react';
import { 
  User, Sparkles, Heart, ListMusic, Settings, LogOut, 
  CheckCircle2, RefreshCw, Lock, KeyRound, ChevronRight 
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import './Profile.css';

export function Profile() {
  const { likedSongs = [], playlists = [], history = [] } = useLibrary() || {};
  const { user, isAuthenticated, logout, loginWithGoogle, isGoogleLoading } = useAuth();
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [hasPasswordState, setHasPasswordState] = useState(Boolean(user?.hasPassword));

  // Reset imgError if user picture changes
  useEffect(() => {
    setImgError(false);
  }, [user?.picture]);

  // Check if account has a configured password
  useEffect(() => {
    if (user?.email || user?.dbId) {
      if (user.hasPassword !== undefined) {
        setHasPasswordState(Boolean(user.hasPassword));
      } else {
        api.checkHasPassword(user.dbId || user.id, user.email).then(has => {
          setHasPasswordState(Boolean(has));
        }).catch(() => {});
      }
    }
  }, [user?.email, user?.dbId, user?.hasPassword]);

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
      {/* Spotify-Inspired AMOLED Profile Header Card */}
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
                  <User size={44} />
                )}
              </div>
            )}
          </div>

          <div className="fs-profile-details">
            <div className="fs-profile-header-title">
              <h1 className="fs-profile-username">{displayName}</h1>
              {user?.provider === 'google' && (
                <div className="fs-profile-provider-pill" title="Signed in with Google">
                  <GoogleIcon size={14} />
                  <span>Google</span>
                </div>
              )}
              {hasPasswordState && (
                <div className="fs-profile-security-pill" title="Password login enabled">
                  <KeyRound size={13} />
                  <span>Password Active</span>
                </div>
              )}
            </div>
            <p className="fs-profile-email">{displayEmail}</p>
          </div>
        </div>

        {/* Profile Header Action Buttons */}
        <div className="fs-profile-card-actions">
          {isAuthenticated ? (
            <>
              <Link
                to="/settings"
                className="btn btn-secondary fs-profile-edit-btn"
                title="Account and playback settings"
              >
                <Settings size={15} />
                <span>Edit Profile</span>
              </Link>
              {user?.provider === 'google' && (
                <button
                  type="button"
                  className="btn btn-secondary fs-profile-switch-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  title="Switch Google account"
                >
                  <RefreshCw size={14} className={isGoogleLoading ? 'fs-spin' : ''} />
                  <span>{isGoogleLoading ? 'Switching...' : 'Switch'}</span>
                </button>
              )}
            </>
          ) : (
            <div className="fs-profile-auth-cta-group">
              <Link to="/login" className="btn btn-secondary fs-profile-login-link">
                Sign In
              </Link>
              <button
                type="button"
                className="btn btn-primary fs-profile-google-login-btn"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                title="Sign in with your Google account"
              >
                <GoogleIcon size={16} />
                <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guest Banner if not signed in */}
      {!isAuthenticated && (
        <div className="fs-profile-guest-banner">
          <div className="fs-guest-banner-info">
            <div className="fs-guest-banner-icon-wrap">
              <GoogleIcon size={26} />
            </div>
            <div>
              <h3>Connect or Create Account</h3>
              <p>Keep your playlists, liked songs, and listening history safely synchronized across all devices.</p>
            </div>
          </div>
          <div className="fs-guest-actions">
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <button
              type="button"
              className="btn btn-primary fs-guest-connect-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <span>{isGoogleLoading ? 'Connecting...' : 'Google Sign In'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Spotify-Style Stats Counter (3 Columns Horizontal Always) */}
      <div className="fs-profile-stats-row">
        <div className="fs-stat-box">
          <div className="fs-stat-icon-wrap">
            <Heart size={20} className="text-brand" />
          </div>
          <span className="fs-stat-number">{likedSongs.length}</span>
          <span className="fs-stat-label">Liked Songs</span>
        </div>

        <div className="fs-stat-box">
          <div className="fs-stat-icon-wrap">
            <ListMusic size={20} className="text-brand" />
          </div>
          <span className="fs-stat-number">{playlists.length}</span>
          <span className="fs-stat-label">Playlists</span>
        </div>

        <div className="fs-stat-box">
          <div className="fs-stat-icon-wrap">
            <Sparkles size={20} className="text-brand" />
          </div>
          <span className="fs-stat-number">{history.length}</span>
          <span className="fs-stat-label">Streamed</span>
        </div>
      </div>

      {/* Account Info & Security */}
      <div className="fs-profile-section">
        <h3 className="fs-section-title">Account Information</h3>
        <div className="fs-account-details-grid">
          <div className="fs-account-detail-card">
            <span className="fs-detail-label">Authentication</span>
            <div className="fs-detail-value">
              {user?.provider === 'google' ? (
                <>
                  <GoogleIcon size={16} />
                  <span>Google OAuth (Verified)</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <CheckCircle2 size={16} className="text-brand" />
                  <span>Email Account</span>
                </>
              ) : (
                <span>Guest / Local Profile</span>
              )}
            </div>
          </div>

          <div className="fs-account-detail-card">
            <span className="fs-detail-label">Password Login</span>
            <div className="fs-detail-value">
              {hasPasswordState ? (
                <>
                  <CheckCircle2 size={16} className="text-brand" />
                  <span>Configured (Cross-Device)</span>
                </>
              ) : isAuthenticated ? (
                <Link to="/settings" className="fs-set-pw-link">
                  <Lock size={15} />
                  <span>Set Password in Settings</span>
                </Link>
              ) : (
                <span>Not Configured</span>
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
              <span>Active (#000000)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Preferences Link */}
      <div className="fs-profile-section">
        <h3 className="fs-section-title">Preferences & Security</h3>
        <div className="fs-prefs-list">
          <Link to="/settings" className="fs-pref-item">
            <div className="fs-pref-info">
              <div className="fs-pref-icon-wrap">
                <Settings size={20} />
              </div>
              <div>
                <h4>Audio & Streaming Settings</h4>
                <p>High-fidelity bitrates, inactivity timer, autoplay recommendations</p>
              </div>
            </div>
            <ChevronRight size={18} className="fs-pref-arrow" />
          </Link>

          {isAuthenticated && (
            <Link to="/settings" className="fs-pref-item">
              <div className="fs-pref-info">
                <div className="fs-pref-icon-wrap">
                  <Lock size={20} />
                </div>
                <div>
                  <h4>Security & Password</h4>
                  <p>
                    {hasPasswordState
                      ? 'Change your password for direct email sign-in'
                      : 'Set a password to log into any device without Google OAuth'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="fs-pref-arrow" />
            </Link>
          )}
        </div>
      </div>

      {/* Spotify-Style Sign Out Section at the Very Bottom */}
      {isAuthenticated && (
        <div className="fs-profile-bottom-section">
          <button
            type="button"
            className="fs-profile-bottom-logout-btn"
            onClick={handleLogout}
            title="Sign out of FreeSong"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <span className="fs-profile-bottom-meta">
            Signed in as {displayEmail}
          </span>
        </div>
      )}
    </div>
  );
}

export default Profile;

