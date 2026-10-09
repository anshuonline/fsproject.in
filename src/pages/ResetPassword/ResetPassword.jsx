import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ContextMenuContext';
import './ResetPassword.css';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No security reset token found. Please open the link directly from your email.');
      return;
    }

    api.verifyResetToken(token)
      .then((data) => {
        if (data?.valid) {
          setTokenValid(true);
          setUserEmail(data.email || '');
          setUserName(data.name || '');
        } else {
          setTokenValid(false);
          setTokenError(data?.error || 'Invalid or expired password reset link.');
        }
      })
      .catch((err) => {
        setTokenValid(false);
        setTokenError(err.message || 'Invalid or expired password reset link (exceeded 24 hours).');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setIsSuccess(true);
      showToast('Password reset successfully! You can now sign in.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fs-auth-box fs-reset-box">
      {verifying ? (
        <div className="fs-reset-state-wrap">
          <Loader2 size={36} className="spin text-brand" />
          <h3>Verifying Security Link...</h3>
          <p>Please wait while we validate your one-time password reset token.</p>
        </div>
      ) : !tokenValid ? (
        <div className="fs-reset-state-wrap">
          <div className="fs-reset-error-icon">
            <AlertTriangle size={36} className="text-danger" />
          </div>
          <h3>Reset Link Expired or Invalid</h3>
          <p>{tokenError}</p>
          <div className="fs-reset-notice-box">
            Password reset links expire after 24 hours for security. Please request a new link from the login screen.
          </div>
          <Link to="/login" className="btn btn-primary fs-reset-action-btn">
            Back to Sign In
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="fs-reset-state-wrap">
          <div className="fs-reset-success-icon">
            <CheckCircle2 size={40} className="text-brand" />
          </div>
          <h3>Password Reset Complete!</h3>
          <p>
            Your FreeSong account password has been successfully updated. You can now log into your account using your email and new password.
          </p>
          <Link to="/login" className="btn btn-primary fs-reset-action-btn">
            <span>Proceed to Sign In</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <h2 className="fs-auth-title">Create New Password</h2>
          <p className="fs-auth-sub">
            {userEmail ? `Setting password for ${userEmail}` : 'Enter your new account password'}
          </p>

          <form onSubmit={handleSubmit} className="fs-auth-form">
            <div className="fs-form-group">
              <label className="fs-form-label">New Password</label>
              <div className="fs-input-wrap">
                <Lock size={18} className="fs-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="fs-input-field"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="fs-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="fs-form-group">
              <label className="fs-form-label">Confirm Password</label>
              <div className="fs-input-wrap">
                <Lock size={18} className="fs-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="fs-input-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary fs-auth-submit"
              disabled={submitting || !newPassword || !confirmPassword}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="fs-auth-switch">
            <Link to="/login" className="text-brand">Back to Sign In</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default ResetPassword;
