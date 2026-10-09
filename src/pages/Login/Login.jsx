import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  AlertCircle,
  UserPlus,
  KeyRound,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import { api } from '../../services/api';
import './Login.css';

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, loginWithGoogle, isGoogleLoading, loginWithPassword } = useAuth();

  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotRateLimit, setForgotRateLimit] = useState(null);
  const [forgotError, setForgotError] = useState(null);

  // Redirect to profile if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        showToast(`Welcome back, ${loggedUser.name}!`, 'success');
        navigate('/profile');
      }
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(err?.message || 'Google sign-in failed', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const user = await loginWithPassword(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/profile');
    } catch (err) {
      setLoginError({
        code: err.code || 'UNKNOWN',
        message: err.message || 'Login failed. Please check your credentials.',
        email: email.trim(),
        isGoogleUser: err.isGoogleUser
      });
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotRateLimit(null);
    setForgotError(null);

    if (!forgotEmail || !forgotEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsForgotLoading(true);
    try {
      await api.requestPasswordReset(forgotEmail.trim());
      setForgotSuccess(true);
      showToast('Password reset link sent! Check your inbox.', 'success');
    } catch (err) {
      if (err.code === 'RATE_LIMIT_EXCEEDED') {
        setForgotRateLimit({
          hoursRemaining: err.hoursRemaining || 24,
          message: err.message
        });
      } else if (err.code === 'USER_NOT_FOUND') {
        setForgotError({
          code: 'USER_NOT_FOUND',
          message: err.message
        });
      } else {
        setForgotError({
          code: 'GENERAL',
          message: err.message || 'Failed to send password reset link'
        });
      }
      showToast(err.message || 'Failed to send password reset link', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email || '');
    setForgotSuccess(false);
    setForgotRateLimit(null);
    setForgotError(null);
    setIsForgotOpen(true);
  };

  return (
    <>
      <div className="fs-auth-box">
        <h2 className="fs-auth-title">Welcome to FreeSong</h2>
        <p className="fs-auth-sub">Stream your favorite tracks in high-fidelity AMOLED mode</p>

        {/* Google Sign In Button */}
        <button
          type="button"
          className="fs-auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoggingIn}
        >
          <GoogleIcon size={18} />
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="fs-auth-divider">
          <span>or with email & password</span>
        </div>

        {/* Smart Error Feedback Banner */}
        {loginError?.code === 'USER_NOT_FOUND' ? (
          <div className="fs-auth-smart-alert fs-auth-alert-warning">
            <div className="fs-auth-alert-icon-col">
              <UserPlus size={20} />
            </div>
            <div className="fs-auth-alert-body">
              <h4 className="fs-auth-alert-title">Account Not Found</h4>
              <p className="fs-auth-alert-text">
                No FreeSong account exists for <strong>{loginError.email}</strong>.
              </p>
              <button
                type="button"
                className="btn btn-secondary fs-auth-alert-btn"
                onClick={() => navigate('/register', { state: { email: loginError.email } })}
              >
                <span>Create an Account</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : loginError?.code === 'NO_PASSWORD_SET' ? (
          <div className="fs-auth-smart-alert fs-auth-alert-info">
            <div className="fs-auth-alert-icon-col">
              <KeyRound size={20} />
            </div>
            <div className="fs-auth-alert-body">
              <h4 className="fs-auth-alert-title">Google Sign-In Account</h4>
              <p className="fs-auth-alert-text">
                This email is registered via Google and doesn't have a password yet.
              </p>
              <div className="fs-auth-alert-actions">
                <button
                  type="button"
                  className="btn btn-primary fs-auth-alert-btn"
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon size={16} />
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  className="fs-auth-alert-link"
                  onClick={() => {
                    setForgotEmail(loginError.email);
                    setForgotRateLimit(null);
                    setForgotSuccess(false);
                    setIsForgotOpen(true);
                  }}
                >
                  <span>Or set password via email link</span>
                </button>
              </div>
            </div>
          </div>
        ) : loginError?.code === 'INVALID_PASSWORD' ? (
          <div className="fs-auth-smart-alert fs-auth-alert-danger">
            <div className="fs-auth-alert-icon-col">
              <AlertCircle size={20} />
            </div>
            <div className="fs-auth-alert-body">
              <h4 className="fs-auth-alert-title">Incorrect Password</h4>
              <p className="fs-auth-alert-text">
                The password you entered does not match our records.
              </p>
              <button
                type="button"
                className="fs-auth-alert-link"
                onClick={openForgotModal}
              >
                <span>Forgot your password? Reset it here</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : loginError ? (
          <div className="fs-auth-smart-alert fs-auth-alert-danger">
            <AlertCircle size={18} />
            <span>{loginError.message}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="fs-auth-form">
          <div className="fs-form-group">
            <label className="fs-form-label">Email address</label>
            <div className="fs-input-wrap">
              <Mail size={18} className="fs-input-icon" />
              <input
                type="email"
                className="fs-input-field"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                disabled={isLoggingIn}
                required
              />
            </div>
          </div>

          <div className="fs-form-group">
            <div className="fs-form-label-row">
              <label className="fs-form-label">Password</label>
              <button
                type="button"
                className="fs-forgot-pw-link"
                onClick={openForgotModal}
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>
            <div className="fs-input-wrap">
              <Lock size={18} className="fs-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="fs-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                disabled={isLoggingIn}
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
          </div>

          <button
            type="submit"
            className="btn btn-primary fs-auth-submit"
            disabled={isLoggingIn || isGoogleLoading}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="fs-auth-switch">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-brand">Create one</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fs-modal-backdrop" onClick={() => setIsForgotOpen(false)}>
          <div className="fs-forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fs-forgot-modal-header">
              <h3>Reset Password</h3>
              <button
                type="button"
                className="btn-icon fs-forgot-close-btn"
                onClick={() => setIsForgotOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="fs-forgot-success-content">
                <div className="fs-forgot-success-icon-wrap">
                  <CheckCircle2 size={36} className="text-brand" />
                </div>
                <h4>Check Your Inbox</h4>
                <p>
                  We have dispatched a password reset link to <strong style={{ color: '#ffffff' }}>{forgotEmail}</strong>.
                </p>
                <div className="fs-forgot-notice-box">
                  <p>
                    Please click the link in your email within <strong>24 hours</strong> to set a new password. If you don't see it, check your spam/junk folder.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => setIsForgotOpen(false)}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="fs-forgot-form">
                <p className="fs-forgot-desc">
                  Enter your registered FreeSong account email and we'll dispatch a secure reset link valid for 24 hours.
                </p>

                <div className="fs-forgot-security-tag">
                  <ShieldCheck size={14} className="text-brand" />
                  <span>Security policy: Max 1 reset link per 24 hours</span>
                </div>

                {/* 24h Rate Limit Alert */}
                {forgotRateLimit && (
                  <div className="fs-auth-smart-alert fs-auth-alert-warning">
                    <div className="fs-auth-alert-icon-col">
                      <Clock size={20} />
                    </div>
                    <div className="fs-auth-alert-body">
                      <h4 className="fs-auth-alert-title">Daily Limit Reached (1 per 24 hrs)</h4>
                      <p className="fs-auth-alert-text">
                        A reset link was already sent today. For security, only 1 link per 24 hours is permitted.
                      </p>
                      <p className="fs-auth-alert-subtext">
                        Please check your inbox & spam folder, or try again in{' '}
                        <strong>{forgotRateLimit.hoursRemaining} hour{forgotRateLimit.hoursRemaining > 1 ? 's' : ''}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* User Not Found in Forgot Modal */}
                {forgotError?.code === 'USER_NOT_FOUND' && (
                  <div className="fs-auth-smart-alert fs-auth-alert-warning">
                    <div className="fs-auth-alert-icon-col">
                      <AlertCircle size={20} />
                    </div>
                    <div className="fs-auth-alert-body">
                      <h4 className="fs-auth-alert-title">Account Not Found</h4>
                      <p className="fs-auth-alert-text">
                        No FreeSong account is associated with <strong>{forgotEmail}</strong>.
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary fs-auth-alert-btn"
                        onClick={() => {
                          setIsForgotOpen(false);
                          navigate('/register', { state: { email: forgotEmail } });
                        }}
                      >
                        <span>Create FreeSong Account</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {forgotError && forgotError.code !== 'USER_NOT_FOUND' && (
                  <div className="fs-auth-smart-alert fs-auth-alert-danger">
                    <AlertCircle size={18} />
                    <span>{forgotError.message}</span>
                  </div>
                )}

                <div className="fs-form-group">
                  <label className="fs-form-label">Email address</label>
                  <div className="fs-input-wrap">
                    <Mail size={18} className="fs-input-icon" />
                    <input
                      type="email"
                      className="fs-input-field"
                      placeholder="you@domain.com"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotRateLimit) setForgotRateLimit(null);
                        if (forgotError) setForgotError(null);
                      }}
                      disabled={isForgotLoading}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="fs-forgot-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsForgotOpen(false)}
                    disabled={isForgotLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fs-forgot-submit-btn"
                    disabled={isForgotLoading || !forgotEmail || Boolean(forgotRateLimit)}
                  >
                    {isForgotLoading ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

