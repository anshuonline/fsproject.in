import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Trash2, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import './ConfirmDelete.css';

export function ConfirmDelete() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? '' : 'No deletion token provided in link. Please use the link sent to your email.');

  const handleConfirm = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      await api.confirmAccountDeletion(token);
      setSuccess(true);

      // Clean local credentials and caches
      if (typeof logout === 'function') {
        logout().catch(() => {});
      }
      storage.clearUser();
      storage.clearHistory();
      storage.saveLikedSongs([]);
      storage.savePlaylists([]);
    } catch (err) {
      setError(err.message || 'Failed to delete account. The link may have expired (valid for 24 hours).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fs-confirm-delete-page">
      <div className="fs-confirm-delete-card">
        {/* Brand Logo */}
        <Link to="/" className="fs-confirm-delete-brand">
          <img 
            src="/images/freesonglogowebp.webp" 
            alt="FreeSong.in" 
            className="fs-confirm-delete-logo" 
          />
        </Link>

        {success ? (
          <div className="fs-delete-status-success">
            <div className="fs-delete-status-icon-wrap fs-delete-icon-green">
              <CheckCircle2 size={44} className="text-brand" />
            </div>
            <h2>Account Deleted</h2>
            <p>
              Your FreeSong account, custom playlists, liked tracks, and listening history have been permanently erased from our servers.
            </p>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Return to FreeSong Home
            </button>
          </div>
        ) : (
          <div className="fs-delete-status-prompt">
            <div className="fs-delete-status-icon-wrap fs-delete-icon-red">
              <AlertTriangle size={40} className="text-danger" />
            </div>

            <h2>Confirm Account Deletion</h2>
            
            <p className="fs-delete-warning-text">
              You are about to permanently delete your FreeSong account. All saved playlists, favorite songs, and personalized history will be completely erased.
            </p>

            <div className="fs-delete-callout">
              <p>
                <strong>24-Hour Security Token:</strong> This deletion link is verified and active. Once confirmed, this action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="fs-delete-error-banner">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="fs-delete-actions">
              <button
                type="button"
                className="btn-delete-confirm"
                onClick={handleConfirm}
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Yes, Permanently Delete My Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-delete-cancel"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Cancel & Keep My Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ConfirmDelete;
