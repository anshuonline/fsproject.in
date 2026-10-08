import React, { useState } from 'react';
import { X, Sparkles, Shield, AlertCircle, Loader2, Music2, Cloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from './GoogleIcon';
import './GoogleSignInModal.css';

export function GoogleSignInModal() {
  const { isGoogleModalOpen, closeGoogleModal, loginWithGoogle, isGoogleLoading } = useAuth();
  const { showToast } = useToast();
  const [errorMsg, setErrorMsg] = useState('');

  if (!isGoogleModalOpen) return null;

  const handleSignIn = async () => {
    setErrorMsg('');
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        showToast(`Welcome back, ${loggedUser.name}!`, 'success');
        closeGoogleModal();
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Popup was closed before completing.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console. Add your domain under Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Another sign-in popup is already open.');
      } else {
        setErrorMsg(err.message || 'Unable to sign in with Google. Please try again.');
      }
    }
  };

  return (
    <div className="fs-google-modal-overlay" onClick={closeGoogleModal}>
      <div
        className="fs-google-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fs-google-modal-title"
      >
        {/* Header */}
        <div className="fs-google-modal-header">
          <div className="fs-google-brand-badge">
            <GoogleIcon size={26} />
            <span className="fs-google-brand-title">Sign in with Google</span>
          </div>
          <button
            type="button"
            className="btn-icon fs-google-close-btn"
            onClick={closeGoogleModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="fs-google-modal-sub" id="fs-google-modal-title">
          Connect your official Google Account to access real cloud sync, personalized playlists, and your authentic Google profile on FreeSong.in.
        </p>

        {/* Feature Highlights */}
        <div className="fs-google-features">
          <div className="fs-google-feature-item">
            <div className="fs-google-feature-icon">
              <Sparkles size={16} />
            </div>
            <div className="fs-google-feature-text">
              <strong>Official Profile & Avatar</strong>
              <span>Use your genuine Google account picture and display name</span>
            </div>
          </div>
          <div className="fs-google-feature-item">
            <div className="fs-google-feature-icon">
              <Cloud size={16} />
            </div>
            <div className="fs-google-feature-text">
              <strong>Cloud Library Sync</strong>
              <span>Keep your liked songs, custom playlists, and listening history safe</span>
            </div>
          </div>
          <div className="fs-google-feature-item">
            <div className="fs-google-feature-icon">
              <Music2 size={16} />
            </div>
            <div className="fs-google-feature-text">
              <strong>AMOLED Dark Streaming</strong>
              <span>Unlimited high-fidelity audio with seamless background playback</span>
            </div>
          </div>
        </div>

        {/* Error notice if sign-in fails */}
        {errorMsg && (
          <div className="fs-google-error-banner">
            <AlertCircle size={16} className="fs-google-error-icon" />
            <div className="fs-google-error-text">{errorMsg}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="fs-google-action-box">
          <button
            type="button"
            className="fs-google-primary-btn"
            onClick={handleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={18} className="fs-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security Footer */}
        <div className="fs-google-security-footer">
          <Shield size={14} className="text-brand" />
          <span>Secured with Firebase Auth & Google Identity • FreeSong.in</span>
        </div>
      </div>
    </div>
  );
}
