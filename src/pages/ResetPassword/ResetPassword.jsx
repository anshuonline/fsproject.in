import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { api, isEasyPassword } from '../../services/api';
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
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
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError({
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password must be at least 6 characters long.'
      });
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
      setPasswordError({
        code: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match. Please ensure both passwords match.'
      });
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setIsSuccess(true);
      showToast('Password reset successfully! You can now sign in.', 'success');
    } catch (err) {
      setPasswordError({
        code: err.code || 'RESET_FAILED',
        message: err.message || 'Failed to reset password'
      });
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

          {passwordError && (
            <div className={`fs-auth-smart-alert ${passwordError.code === 'PASSWORD_MISMATCH' || passwordError.code === 'PASSWORD_TOO_SHORT' ? 'fs-auth-alert-danger' : 'fs-auth-alert-warning'}`}>
              <div className="fs-auth-alert-icon-col">
                <AlertCircle size={20} />
              </div>
              <div className="fs-auth-alert-body">
                <h4 className="fs-auth-alert-title">
                  {passwordError.code === 'PASSWORD_MISMATCH'
                    ? 'Passwords Do Not Match'
                    : passwordError.code === 'EASY_PASSWORD'
                    ? 'Password Too Easy'
                    : passwordError.code === 'PASSWORD_TOO_SHORT'
                    ? 'Password Too Short'
                    : 'Password Error'}
                </h4>
                <p className="fs-auth-alert-text">{passwordError.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="fs-auth-form">
            <div className="fs-form-group">
              <label className="fs-form-label">New Password</label>
              <div className={`fs-input-wrap ${passwordError?.code === 'EASY_PASSWORD' || passwordError?.code === 'PASSWORD_TOO_SHORT' ? 'fs-input-error' : ''}`}>
                <Lock size={18} className="fs-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="fs-input-field"
                  placeholder="At least 6 characters (not easy)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
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
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordError?.code === 'EASY_PASSWORD' || passwordError?.code === 'PASSWORD_TOO_SHORT') && (
                <span className="fs-field-error-text">{passwordError.message}</span>
              )}
            </div>

            <div className="fs-form-group">
              <label className="fs-form-label">Confirm Password</label>
              <div className={`fs-input-wrap ${passwordError?.code === 'PASSWORD_MISMATCH' ? 'fs-input-error' : ''}`}>
                <Lock size={18} className="fs-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="fs-input-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={submitting}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="fs-password-toggle-btn"
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
