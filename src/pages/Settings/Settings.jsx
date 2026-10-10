import React, { useState, useEffect } from 'react';
import { 
  Volume2, Zap, Trash2, CheckCircle2, User, Shield, 
  MapPin, Calendar, Clock, AlertTriangle, Mail, Loader2, 
  Search, LogIn, ExternalLink, RefreshCw, Lock, KeyRound, Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import { storage } from '../../services/storage';
import { api, isEasyPassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import './Settings.css';

export function Settings() {
  const { user, setUser, updateUser, loginWithGoogle, setPassword } = useAuth();
  const { showToast } = useContextMenu();
  const { clearHistory: clearLibraryHistory } = useLibrary();
  const { 
    audioQuality, 
    setAudioQuality, 
    inactivityTimeout, 
    setInactivityTimeout,
    stableVolume,
    setStableVolume,
    isAutoplay,
    toggleAutoplay
  } = usePlayer();

  const [settings, setSettings] = useState(() => storage.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileDob, setProfileDob] = useState(user?.dob ? user.dob.split('T')[0] : '');
  const [profileCity, setProfileCity] = useState(user?.city || user?.dbCity || '');
  const [locationTracking, setLocationTracking] = useState(
    settings.locationTracking !== undefined ? Boolean(settings.locationTracking) : true
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Setup / Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [hasPasswordState, setHasPasswordState] = useState(Boolean(user?.hasPassword));
  const [passwordError, setPasswordError] = useState(null);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [deletionEmailSent, setDeletionEmailSent] = useState(false);

  // Keep profile fields in sync with user
  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.dob) setProfileDob(user.dob.split('T')[0]);
      if (user.city || user.dbCity) setProfileCity(user.city || user.dbCity);
      if (user.location_tracking_enabled !== undefined) {
        setLocationTracking(user.location_tracking_enabled === 1 || user.location_tracking_enabled === true);
      }
    }
  }, [user]);

  // Check if password exists in cloud for current user
  useEffect(() => {
    if (user?.email || user?.dbId) {
      if (user.hasPassword !== undefined) {
        setHasPasswordState(Boolean(user.hasPassword));
      } else {
        api.checkHasPassword(user.dbId || user.id, user.email).then(has => {
          setHasPasswordState(has);
        });
      }
    }
  }, [user?.email, user?.dbId, user?.hasPassword]);

  const notifySaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  // Save / Update User Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (!user) {
      showToast('Please sign in to set a password', 'error');
      return;
    }

    if (hasPasswordState && !currentPassword) {
      setPasswordError({ code: 'CURRENT_PASSWORD_REQUIRED', message: 'Please enter your current password to change it' });
      showToast('Please enter your current password', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError({ code: 'PASSWORD_TOO_SHORT', message: 'New password must be at least 6 characters long' });
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (isEasyPassword(newPassword)) {
      setPasswordError({
        code: 'EASY_PASSWORD',
        message: 'This password is too easy or common. Please choose a stronger password with letters and numbers.'
      });
      showToast('Password is too easy or common. Please choose a stronger password.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError({ code: 'PASSWORD_MISMATCH', message: 'New passwords do not match' });
      showToast('Passwords do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await setPassword(newPassword, hasPasswordState ? currentPassword : null);
      setHasPasswordState(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      showToast(hasPasswordState ? 'Password updated successfully!' : 'Password set successfully!', 'success');
      notifySaved();
    } catch (err) {
      setPasswordError({
        code: err.code || 'UNKNOWN',
        message: err.message || 'Failed to update password'
      });
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Update Generic Local Setting
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storage.saveSettings(updated);
    notifySaved();
  };

  // Handle Location Tracking Toggle
  const handleToggleLocation = async (e) => {
    const enabled = e.target.checked;
    setLocationTracking(enabled);
    updateSetting('locationTracking', enabled);

    if (user?.email || user?.dbId) {
      try {
        await api.updateUserProfile({
          userId: user.dbId || user.id,
          email: user.email,
          locationTracking: enabled
        });
      } catch {}
    }
    showToast(enabled ? 'Location personalization enabled' : 'Location tracking disabled', 'info');
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to save profile details', 'error');
      return;
    }

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      showToast('Display name cannot be empty', 'error');
      return;
    }
    if (trimmedName.length > 25) {
      showToast('Display name cannot exceed 25 characters', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.updateUserProfile({
        userId: user.dbId || user.id,
        email: user.email,
        name: trimmedName.slice(0, 25),
        dob: profileDob || null,
        city: profileCity.trim() || null,
        locationTracking
      });

      if (res && res.user) {
        const updatedUser = {
          ...user,
          name: res.user.name,
          dob: res.user.dob,
          city: res.user.city,
          location_tracking_enabled: res.user.location_tracking_enabled
        };
        if (typeof updateUser === 'function') {
          updateUser(updatedUser);
        } else if (typeof setUser === 'function') {
          setUser(updatedUser);
        }
        storage.saveUser(updatedUser);
        showToast('Profile updated successfully!', 'success');
        notifySaved();
      } else {
        showToast('Profile saved successfully', 'success');
        notifySaved();
      }
    } catch (err) {
      showToast('Failed to save profile: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Trigger 24-Hour Account Deletion Confirmation Email
  const handleRequestDeletion = async () => {
    if (!user?.email) {
      showToast('No active user email found', 'error');
      return;
    }

    setDeletingLoading(true);
    try {
      await api.requestAccountDeletion(user.dbId || user.id, user.email);
      setDeletionEmailSent(true);
      showToast('Confirmation email dispatched! Valid for 24 hours.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to dispatch deletion email', 'error');
    } finally {
      setDeletingLoading(false);
    }
  };

  // Clear Search History
  const handleClearSearchHistory = () => {
    storage.clearSearchHistory();
    showToast('All search query history removed successfully', 'success');
  };

  // Clear Playback History
  const handleClearPlaybackHistory = async () => {
    storage.clearHistory();
    if (typeof clearLibraryHistory === 'function') {
      clearLibraryHistory();
    }
    if (user?.dbId || user?.email) {
      await api.clearUserHistory(user.dbId || user.id, user.email).catch(() => {});
    }
    showToast('Listening history wiped from device and cloud', 'success');
  };

  // Clear Local Storage & Cache
  const handleClearCache = () => {
    storage.clearHistory();
    storage.clearSearchHistory();
    try {
      sessionStorage.clear();
    } catch {}
    showToast('Temporary playback cache cleared', 'success');
  };

  return (
    <div className="fs-settings-page">
      {/* Header */}
      <div className="fs-settings-header">
        <h1 className="fs-settings-title">Settings</h1>
        <p className="fs-settings-sub">
          Manage playback fidelity, account identity, privacy preferences, and storage
        </p>
        {savedNotice && (
          <div className="fs-settings-saved-banner">
            <CheckCircle2 size={16} />
            <span>Settings saved automatically</span>
          </div>
        )}
      </div>

      <div className="fs-settings-container">
        {/* ================= SECTION 1: ACCOUNT & PROFILE ================= */}
        <div className="fs-settings-section-card">
          <div className="fs-settings-section-header">
            <div className="fs-settings-section-icon-wrap">
              <User size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="fs-settings-section-heading">Account & Profile</h2>
              <p className="fs-settings-section-sub">Personalize your listener profile and account details</p>
            </div>
          </div>

          {user ? (
            <div className="fs-settings-profile-content">
              {/* User Identity Pill */}
              <div className="fs-profile-user-badge">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="fs-profile-avatar" />
                ) : (
                  <div className="fs-profile-avatar-placeholder">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="fs-profile-info">
                  <span className="fs-profile-name-text">{user.name || 'FreeSong Listener'}</span>
                  <span className="fs-profile-email-text">{user.email}</span>
                </div>
                <span className="fs-auth-pill">Verified</span>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="fs-profile-edit-grid">
                {/* Full Name */}
                <div className="fs-form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="fs-profile-name" className="fs-field-label">
                      Display Name
                    </label>
                    <span className="fs-field-helper">{profileName.length}/25 characters</span>
                  </div>
                  <input
                    id="fs-profile-name"
                    type="text"
                    className="fs-field-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name (max 25 characters)"
                    maxLength={25}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div className="fs-form-field">
                  <label htmlFor="fs-profile-dob" className="fs-field-label">
                    <Calendar size={14} />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    id="fs-profile-dob"
                    type="date"
                    className="fs-field-input"
                    value={profileDob}
                    onChange={(e) => setProfileDob(e.target.value)}
                    max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                  />
                  <span className="fs-field-helper">Used to tailor release anniversaries and music charts</span>
                </div>

                {/* City */}
                <div className="fs-form-field">
                  <label htmlFor="fs-profile-city" className="fs-field-label">
                    <MapPin size={14} />
                    <span>City / Region</span>
                  </label>
                  <input
                    id="fs-profile-city"
                    type="text"
                    className="fs-field-input"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi, Bengaluru"
                    maxLength={100}
                  />
                  <span className="fs-field-helper">Fine-tunes localized language recommendations</span>
                </div>

                {/* Save Button */}
                <div className="fs-form-submit-row">
                  <button
                    type="submit"
                    className="btn btn-primary fs-btn-save-profile"
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="fs-settings-guest-card">
              <p>Sign in with your Google account to customize your profile, date of birth, city, and synchronize playlists.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => loginWithGoogle()}
              >
                <LogIn size={16} />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= SECTION 2: SECURITY & PASSWORD ================= */}
        {user && (
          <div className="fs-settings-section-card">
            <div className="fs-settings-section-header">
              <div className="fs-settings-section-icon-wrap">
                <Lock size={20} className="text-brand" />
              </div>
              <div>
                <h2 className="fs-settings-section-heading">
                  {hasPasswordState ? 'Change Password' : 'Set Account Password'}
                </h2>
                <p className="fs-settings-section-sub">
                  {hasPasswordState
                    ? 'Update your account password or verify your current password'
                    : 'Set a password to log in directly with your email on any device without Google OAuth'}
                </p>
              </div>
            </div>

            <div className="fs-settings-password-content">
              <div className="fs-password-status-banner">
                <div className="fs-password-status-icon">
                  <KeyRound size={18} className="text-brand" />
                </div>
                <div className="fs-password-status-info">
                  <strong>
                    {hasPasswordState ? 'Password Authentication Active' : 'No Password Configured Yet'}
                  </strong>
                  <span>
                    {hasPasswordState
                      ? `Your account (${user.email}) is protected with a password. Enter your current password below to change it.`
                      : `Set a password below so you can sign into FreeSong with your email (${user.email}) on any laptop or PC without needing Google sign-in.`}
                  </span>
                </div>
                <span className={`fs-status-pill ${hasPasswordState ? 'fs-status-active' : 'fs-status-pending'}`}>
                  {hasPasswordState ? 'Protected' : 'Optional'}
                </span>
              </div>

              {passwordError && (
                <div className={`fs-auth-smart-alert ${passwordError.code === 'WRONG_PASSWORD' ? 'fs-auth-alert-danger' : 'fs-auth-alert-warning'}`}>
                  <div className="fs-auth-alert-icon-col">
                    <AlertCircle size={18} />
                  </div>
                  <div className="fs-auth-alert-body">
                    <h4 className="fs-auth-alert-title">
                      {passwordError.code === 'WRONG_PASSWORD' ? 'Wrong Current Password' : 'Password Error'}
                    </h4>
                    <p className="fs-auth-alert-text">{passwordError.message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="fs-password-edit-form">
                <div className="fs-password-inputs-row">
                  {hasPasswordState && (
                    <div className="fs-form-field">
                      <label className="fs-field-label">Current Password</label>
                      <div className={`fs-password-input-wrapper ${passwordError?.code === 'WRONG_PASSWORD' ? 'fs-input-error' : ''}`}>
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="fs-field-input"
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (passwordError) setPasswordError(null);
                          }}
                          required
                        />
                        <button
                          type="button"
                          className="fs-pw-toggle-inline"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          tabIndex={-1}
                          title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordError?.code === 'WRONG_PASSWORD' && (
                        <span className="fs-field-error-text">Password wrong: The current password you entered is incorrect</span>
                      )}
                    </div>
                  )}

                  <div className="fs-form-field">
                    <label className="fs-field-label">
                      {hasPasswordState ? 'New Password' : 'Set Account Password'}
                    </label>
                    <div className="fs-password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="fs-field-input"
                        placeholder="At least 6 characters (not easy)"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="fs-pw-toggle-inline"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="fs-form-field">
                    <label className="fs-field-label">Confirm Password</label>
                    <div className={`fs-password-input-wrapper ${passwordError?.code === 'PASSWORD_MISMATCH' ? 'fs-input-error' : ''}`}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="fs-field-input"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="fs-pw-toggle-inline"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordError?.code === 'PASSWORD_MISMATCH' && (
                      <span className="fs-field-error-text">Password wrong: Passwords do not match</span>
                    )}
                  </div>
                </div>

                <div className="fs-form-submit-row">
                  <button
                    type="submit"
                    className="btn btn-primary fs-btn-save-profile"
                    disabled={savingPassword || (hasPasswordState && !currentPassword) || !newPassword || !confirmPassword}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>{hasPasswordState ? 'Change Password' : 'Set Password'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: AUDIO & STREAMING ================= */}
        <div className="fs-settings-section-card">
          <div className="fs-settings-section-header">
            <div className="fs-settings-section-icon-wrap">
              <Volume2 size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="fs-settings-section-heading">Audio & Streaming</h2>
              <p className="fs-settings-section-sub">Configure real playback bitrates and auto-inactivity safeguards</p>
            </div>
          </div>

          {/* Real Audio Quality Setting */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Audio Quality</span>
              <span className="fs-setting-desc">
                Streams audio at the highest available YouTube Music bitrates in real-time
              </span>
            </div>
            <select
              className="fs-setting-select"
              value={audioQuality}
              onChange={(e) => {
                setAudioQuality(e.target.value);
                notifySaved();
              }}
            >
              <option value="high">High Fidelity (256kbps AAC / 1080p)</option>
              <option value="normal">Normal (128kbps Standard)</option>
              <option value="data-saver">Data Saver (64kbps Low Bandwidth)</option>
            </select>
          </div>

          {/* Auto Inactivity Timeout Setting */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Auto Inactivity Timeout</span>
              <span className="fs-setting-desc">
                Pauses playback if no interaction is detected, just like YouTube Music, to save your battery and bandwidth
              </span>
            </div>
            <select
              className="fs-setting-select"
              value={inactivityTimeout}
              onChange={(e) => {
                setInactivityTimeout(Number(e.target.value));
                notifySaved();
              }}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes (Default • Recommended)</option>
              <option value={90}>90 minutes</option>
              <option value={120}>2 hours (120 minutes)</option>
              <option value={0}>Never (Keep playing continuously)</option>
            </select>
          </div>

          {/* Autoplay Switch */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Autoplay Similar Music</span>
              <span className="fs-setting-desc">Keep infinite playback going with algorithmic related recommendations</span>
            </div>
            <label className="fs-switch">
              <input
                type="checkbox"
                checked={isAutoplay}
                onChange={() => {
                  toggleAutoplay();
                  notifySaved();
                }}
              />
              <span className="fs-slider" />
            </label>
          </div>
          {/* Stable Volume Switch */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Stable Volume</span>
              <span className="fs-setting-desc">
                Evens out loudness jumps between tracks and softens sudden blasts for consistent listening, just like YouTube Music
              </span>
            </div>
            <label className="fs-switch">
              <input
                type="checkbox"
                checked={stableVolume}
                onChange={(e) => {
                  setStableVolume(e.target.checked);
                  showToast(e.target.checked ? 'Stable volume enabled' : 'Stable volume disabled', 'info');
                }}
              />
              <span className="fs-slider" />
            </label>
          </div>
        </div>

        {/* ================= SECTION 3: PRIVACY & LOCATION ================= */}
        <div className="fs-settings-section-card">
          <div className="fs-settings-section-header">
            <div className="fs-settings-section-icon-wrap">
              <Shield size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="fs-settings-section-heading">Privacy & Location</h2>
              <p className="fs-settings-section-sub">Control location logging and personalization features</p>
            </div>
          </div>

          {/* Location Tracking Toggle */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Location Personalization</span>
              <span className="fs-setting-desc">
                Uses approximate city & country to fetch trending charts. Turn off to stop location tracking entirely.
              </span>
            </div>
            <label className="fs-switch">
              <input
                type="checkbox"
                checked={locationTracking}
                onChange={handleToggleLocation}
              />
              <span className="fs-slider" />
            </label>
          </div>

          {/* AMOLED Theme Badge */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">True AMOLED Black (#000000)</span>
              <span className="fs-setting-desc">Zero pixel power draw on OLED mobile & laptop screens</span>
            </div>
            <span className="fs-badge-active">Active</span>
          </div>
        </div>

        {/* ================= SECTION 4: HISTORY & STORAGE ================= */}
        <div className="fs-settings-section-card">
          <div className="fs-settings-section-header">
            <div className="fs-settings-section-icon-wrap">
              <Trash2 size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="fs-settings-section-heading">History & Storage</h2>
              <p className="fs-settings-section-sub">Manage and clear your recent searches, listening history, and local cache</p>
            </div>
          </div>

          {/* Clear Search History */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Clear Search History</span>
              <span className="fs-setting-desc">Remove all recent queries and search dropdown suggestions</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary fs-action-btn"
              onClick={handleClearSearchHistory}
            >
              <Search size={16} />
              <span>Clear Search History</span>
            </button>
          </div>

          {/* Clear Listening History */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Clear Playback History</span>
              <span className="fs-setting-desc">Wipe all played tracks from this device and your cloud account</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary fs-action-btn"
              onClick={handleClearPlaybackHistory}
            >
              <Trash2 size={16} />
              <span>Clear Playback History</span>
            </button>
          </div>

          {/* Clear Cache */}
          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Clear Temporary App Cache</span>
              <span className="fs-setting-desc">Reset browser session storage and cached network responses</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary fs-action-btn"
              onClick={handleClearCache}
            >
              <RefreshCw size={16} />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>

        {/* ================= DANGER ZONE: ACCOUNT DELETION ================= */}
        {user && (
          <div className="fs-settings-section-card fs-danger-section-card">
            <div className="fs-danger-zone-card">
              <div className="fs-danger-info">
                <span className="fs-danger-title">Delete FreeSong Account</span>
                <span className="fs-danger-desc">
                  Permanently erase your account, playlists, liked tracks, and history. We will dispatch a 24-hour verification link to your registered email ({user.email}).
                </span>
              </div>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => {
                  setDeletionEmailSent(false);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 size={16} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ABOUT FREESONG ================= */}
        <div className="fs-settings-about-card">
          <img src="/images/freesonglogowebp.webp" alt="FreeSong" className="fs-about-logo" />
          <div className="fs-about-info">
            <h4>FreeSong.in</h4>
            <p>Version 1.0.0 • Pure AMOLED Music Platform</p>
            <div className="fs-about-links">
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>
              <span>•</span>
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
              <span>•</span>
              <a href="/dmca" target="_blank" rel="noopener noreferrer">DMCA Disclaimer</a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACCOUNT DELETION CONFIRMATION MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fs-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="fs-delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fs-delete-modal-icon-wrap">
              <AlertTriangle size={36} className="text-danger" />
            </div>

            <h3 className="fs-delete-modal-title">Delete FreeSong Account?</h3>

            {deletionEmailSent ? (
              <div className="fs-deletion-sent-content">
                <div className="fs-deletion-sent-badge">
                  <Mail size={18} />
                  <span>Confirmation Email Sent</span>
                </div>
                <p className="fs-delete-modal-desc">
                  We have dispatched a verification link to <strong style={{ color: '#ffffff' }}>{user?.email}</strong>.
                </p>
                <div className="fs-delete-notice-box">
                  <p>
                    Please open your inbox and click the link within <strong>24 hours</strong> to permanently delete your account. If you do not click it, your account remains active and safe.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Got It, Close Window
                </button>
              </div>
            ) : (
              <div>
                <p className="fs-delete-modal-desc">
                  Are you sure you want to request account deletion for <strong style={{ color: '#ffffff' }}>{user?.email}</strong>?
                </p>

                <div className="fs-delete-notice-box">
                  <p>
                    A secure confirmation email will be sent to you. The confirmation link expires in <strong>24 hours</strong>. Upon confirmation, all your custom playlists, liked tracks, and listening history will be permanently erased.
                  </p>
                </div>

                <div className="fs-delete-modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deletingLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn-danger-confirm"
                    onClick={handleRequestDeletion}
                    disabled={deletingLoading}
                  >
                    {deletingLoading ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Send Confirmation Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Settings;
