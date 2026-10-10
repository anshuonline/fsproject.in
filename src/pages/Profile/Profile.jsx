import React, { useState, useEffect } from 'react';
import { 
  User, Sparkles, Heart, ListMusic, Settings, LogOut, 
  CheckCircle2, RefreshCw, Lock, KeyRound, ChevronRight 
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import { api } from '../../services/api';
import { formatCompactNumber } from '../../utils/formatNumber';
import { Link } from 'react-router-dom';
import './Profile.css';

const QUALITY_LABELS = {
  high: 'High Fidelity (256kbps AAC / 1080p)',
  normal: 'Normal (128kbps Standard)',
  'data-saver': 'Data Saver (64kbps)'
};

export function Profile() {
  const { likedSongs = [], playlists = [], history = [] } = useLibrary() || {};
  const { user, isAuthenticated, logout, loginWithGoogle, isGoogleLoading } = useAuth();
  const { audioQuality } = usePlayer();
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [hasPasswordState, setHasPasswordState] = useState(Boolean(user?.hasPassword));
  const [totalPlays, setTotalPlays] = useState(() =>
    user?.totalPlays !== undefined ? Number(user.totalPlays) : null
  );

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

  // Fetch lifetime total plays (survives the 100-song history cap)
  useEffect(() => {
    if (user?.dbId || user?.id || user?.email) {
      api.getUserStats(user.dbId || user.id, user.email).then(total => {
        if (total !== null) setTotalPlays(total);
      }).catch(() => {});
    }
  }, [user?.dbId, user?.id, user?.email]);

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
      <div className="fs-profile-header-card">
        <div className="fs-profile-header-hero">
          <div className="fs-profile-avatar-wrapper">
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

          <div className="fs-profile-hero-content">
            <span className="fs-profile-kicker">PROFILE</span>
            <h1 className="fs-profile-username">{displayName}</h1>
            <p className="fs-profile-email">{displayEmail}</p>

            {/* Dedicated Status Badges Row (Clean Spotify Pills below email) */}
            <div className="fs-profile-status-pills">
              {user?.provider === 'google' && (
                <span className="fs-status-pill fs-status-pill-google">
                  <GoogleIcon size={13} />
                  <span>Google Account</span>
                </span>
              )}
              {hasPasswordState ? (
                <span className="fs-status-pill fs-status-pill-password">
                  <CheckCircle2 size={13} />
                  <span>Password Active</span>
                </span>
              ) : isAuthenticated ? (
                <Link to="/settings" className="fs-status-pill fs-status-pill-link">
                  <KeyRound size={13} />
                  <span>Set Password</span>
                </Link>
              ) : null}
            </div>

            {/* Profile Action Buttons */}
            <div className="fs-profile-action-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/settings" className="fs-profile-pill-btn fs-btn-outline">
                    <Settings size={14} />
                    <span>Edit Profile</span>
                  </Link>
                  {user?.provider === 'google' && (
                    <button
                      type="button"
                      className="fs-profile-pill-btn fs-btn-ghost"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      title="Switch Google account"
                    >
                      <RefreshCw size={13} className={isGoogleLoading ? 'fs-spin' : ''} />
                      <span>{isGoogleLoading ? 'Switching...' : 'Switch'}</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="fs-profile-guest-cta-row">
                  <Link to="/login" className="fs-profile-pill-btn fs-btn-outline">
                    Sign In
                  </Link>
                  <button
                    type="button"
                    className="fs-profile-pill-btn fs-btn-brand"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    <GoogleIcon size={14} />
                    <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Banner if not signed in */}
      {!isAuthenticated && (
        <div className="fs-profile-guest-banner">
          <div className="fs-guest-banner-info">
            <div className="fs-guest-banner-icon-wrap">
              <GoogleIcon size={24} />
            </div>
            <div>
              <h3>Connect or Create Account</h3>
              <p>Keep your playlists, liked songs, and listening history synchronized across devices.</p>            </div>
          </div>
          <div className="fs-guest-actions">
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Spotify-Style Segmented Stats Card */}
      <div className="fs-profile-stats-card">
        <div className="fs-stat-item">
          <div className="fs-stat-icon-wrap">
            <Heart size={18} className="text-brand" />
          </div>
          <div className="fs-stat-meta">
            <span className="fs-stat-number">{formatCompactNumber(likedSongs.length)}</span>
            <span className="fs-stat-label">Liked Songs</span>
          </div>
        </div>

        <div className="fs-stat-separator" />

        <div className="fs-stat-item">
          <div className="fs-stat-icon-wrap">
            <ListMusic size={18} className="text-brand" />
          </div>
          <div className="fs-stat-meta">
            <span className="fs-stat-number">{formatCompactNumber(playlists.length)}</span>
            <span className="fs-stat-label">Playlists</span>
          </div>
        </div>

        <div className="fs-stat-separator" />

        <div className="fs-stat-item">
          <div className="fs-stat-icon-wrap">
            <Sparkles size={18} className="text-brand" />
          </div>
          <div className="fs-stat-meta">
            {/* DB lifetime counter only — local history is capped at 100 and must never cap this stat */}
            <span className="fs-stat-number">{formatCompactNumber(totalPlays ?? history.length ?? 0)}</span>
            <span className="fs-stat-label">Streamed</span>
          </div>
        </div>
      </div>

      {/* Account Information (Structured Spotify Settings Style) */}
      <div className="fs-profile-group">
        <h3 className="fs-group-header">Account Information</h3>
        <div className="fs-group-container">
          <div className="fs-group-row">
            <div className="fs-row-left">
              <span className="fs-row-label">Authentication</span>
            </div>
            <div className="fs-row-right">
              {user?.provider === 'google' ? (
                <span className="fs-meta-tag fs-tag-google">
                  <GoogleIcon size={13} />
                  <span>Google OAuth (Verified)</span>
                </span>
              ) : isAuthenticated ? (
                <span className="fs-meta-tag fs-tag-brand">
                  <CheckCircle2 size={13} />
                  <span>Email Account</span>
                </span>
              ) : (
                <span className="fs-meta-tag">Guest / Local Profile</span>
              )}
            </div>
          </div>

          <div className="fs-group-row">
            <div className="fs-row-left">
              <span className="fs-row-label">Password Login</span>
            </div>
            <div className="fs-row-right">
              {hasPasswordState ? (
                <span className="fs-meta-tag fs-tag-brand">
                  <CheckCircle2 size={13} />
                  <span>Configured (Cross-Device)</span>
                </span>
              ) : isAuthenticated ? (
                <Link to="/settings" className="fs-row-action-link">
                  <Lock size={13} />
                  <span>Set Password in Settings</span>
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="fs-meta-tag">Not Configured</span>
              )}
            </div>
          </div>

          <div className="fs-group-row">
            <div className="fs-row-left">
              <span className="fs-row-label">Streaming Quality</span>
            </div>
            <div className="fs-row-right">
              <span className="fs-meta-tag fs-tag-brand">
                <CheckCircle2 size={13} />
                <span>{QUALITY_LABELS[audioQuality] || QUALITY_LABELS.high}</span>
              </span>
            </div>
          </div>

          <div className="fs-group-row">
            <div className="fs-row-left">
              <span className="fs-row-label">Theme Experience</span>
            </div>
            <div className="fs-row-right">
              <span className="fs-meta-tag fs-tag-brand">
                <CheckCircle2 size={13} />
                <span>AMOLED True Black</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences & Security (Structured Spotify List Items) */}
      <div className="fs-profile-group">
        <h3 className="fs-group-header">Preferences & Security</h3>
        <div className="fs-group-container">
          <Link to="/settings" className="fs-group-row fs-group-row-link">
            <div className="fs-row-left">
              <div className="fs-row-icon-box">
                <Settings size={18} />
              </div>
              <div className="fs-row-text">
                <h4>Audio & Playback Settings</h4>
                <p>High-fidelity bitrates, sleep timer, autoplay recommendations</p>
              </div>
            </div>
            <ChevronRight size={18} className="fs-row-arrow" />
          </Link>

          {isAuthenticated && (
            <Link to="/settings" className="fs-group-row fs-group-row-link">
              <div className="fs-row-left">
                <div className="fs-row-icon-box">
                  <Lock size={18} />
                </div>
                <div className="fs-row-text">
                  <h4>Security & Password</h4>
                  <p>
                    {hasPasswordState
                      ? 'Change your password for direct email sign-in'
                      : 'Set a password to log into any device without Google OAuth'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="fs-row-arrow" />
            </Link>
          )}
        </div>
      </div>

      {/* Spotify-Style Minimal Sign Out Button at Bottom */}
      {isAuthenticated && (
        <div className="fs-profile-logout-footer">
          <button
            type="button"
            className="fs-profile-logout-pill-btn"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
          <p className="fs-profile-logout-caption">
            Signed in as {displayEmail}
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;
