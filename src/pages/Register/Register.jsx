import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import { isEasyPassword } from '../../services/api';
import './Register.css';

export function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, loginWithGoogle, isGoogleLoading, registerWithPassword } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

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
        showToast(`Account created! Welcome, ${loggedUser.name}!`, 'success');
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
    setErrorInfo(null);

    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      setErrorInfo({ code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 6 characters long', email: email.trim() });
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (isEasyPassword(password)) {
      setErrorInfo({
        code: 'EASY_PASSWORD',
        message: 'This password is too easy or common. Please choose a stronger password with letters and numbers.',
        email: email.trim()
      });
      showToast('Password is too easy or common. Please choose a stronger password.', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const user = await registerWithPassword(name.trim(), email.trim(), password);
      showToast(`Account created! Welcome, ${user.name}!`, 'success');
      navigate('/profile');
    } catch (err) {
      setErrorInfo({
        code: err.code || 'UNKNOWN',
        message: err.message || 'Registration failed. Please try again.',
        email: email.trim()
      });
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fs-auth-box">
      <h2 className="fs-auth-title">Join FreeSong.in</h2>
      <p className="fs-auth-sub">Create your music profile for unlimited playlists</p>

      {/* Google Sign In Button */}
      <button
        type="button"
        className="fs-auth-google-btn"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isRegistering}
      >
        <GoogleIcon size={18} />
        <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      <div className="fs-auth-divider">
        <span>or with email & password</span>
      </div>

      {/* Smart Error Handling */}
      {errorInfo?.code === 'ACCOUNT_EXISTS' ? (
        <div className="fs-auth-smart-alert fs-auth-alert-warning">
          <div className="fs-auth-alert-icon-col">
            <AlertCircle size={20} />
          </div>
          <div className="fs-auth-alert-body">
            <h4 className="fs-auth-alert-title">Account Already Exists</h4>
            <p className="fs-auth-alert-text">
              An account registered with <strong>{errorInfo.email}</strong> is already present.
            </p>
            <button
              type="button"
              className="btn btn-secondary fs-auth-alert-btn"
              onClick={() => navigate('/login', { state: { email: errorInfo.email } })}
            >
              <span>Sign In with this Email</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : errorInfo ? (
        <div className="fs-auth-smart-alert fs-auth-alert-danger">
          <AlertCircle size={18} />
          <span>{errorInfo.message}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="fs-auth-form">
        <div className="fs-form-group">
          <label className="fs-form-label">Full Name</label>
          <div className="fs-input-wrap">
            <User size={18} className="fs-input-icon" />
            <input
              type="text"
              className="fs-input-field"
              placeholder="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorInfo) setErrorInfo(null);
              }}
              disabled={isRegistering}
              required
            />
          </div>
        </div>

        <div className="fs-form-group">
          <label className="fs-form-label">Email address</label>
          <div className={`fs-input-wrap ${errorInfo?.code === 'ACCOUNT_EXISTS' ? 'fs-input-error' : ''}`}>
            <Mail size={18} className="fs-input-icon" />
            <input
              type="email"
              className="fs-input-field"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorInfo) setErrorInfo(null);
              }}
              disabled={isRegistering}
              required
            />
          </div>
          {errorInfo?.code === 'ACCOUNT_EXISTS' && (
            <span className="fs-field-error-text">
              An account with this email already exists.{' '}
              <button
                type="button"
                className="fs-error-inline-link"
                onClick={() => navigate('/login', { state: { email: errorInfo.email } })}
              >
                Sign in instead
              </button>
            </span>
          )}
        </div>

        <div className="fs-form-group">
          <label className="fs-form-label">Password</label>
          <div className={`fs-input-wrap ${errorInfo?.code === 'EASY_PASSWORD' || errorInfo?.code === 'PASSWORD_TOO_SHORT' ? 'fs-input-error' : ''}`}>
            <Lock size={18} className="fs-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="fs-input-field"
              placeholder="At least 6 characters (not easy)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorInfo) setErrorInfo(null);
              }}
              disabled={isRegistering}
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
          {errorInfo?.code === 'EASY_PASSWORD' && (
            <span className="fs-field-error-text">{errorInfo.message}</span>
          )}
          {errorInfo?.code === 'PASSWORD_TOO_SHORT' && (
            <span className="fs-field-error-text">{errorInfo.message}</span>
          )}
        </div>

        {/* Existing Account Highlight above submit button */}
        {errorInfo?.code === 'ACCOUNT_EXISTS' && (
          <div className="fs-auth-smart-alert fs-auth-alert-warning" style={{ marginTop: '4px' }}>
            <div className="fs-auth-alert-icon-col">
              <AlertCircle size={20} />
            </div>
            <div className="fs-auth-alert-body">
              <h4 className="fs-auth-alert-title">Account Already Exists</h4>
              <p className="fs-auth-alert-text">
                An account with <strong>{errorInfo.email}</strong> already exists on FreeSong.
              </p>
              <button
                type="button"
                className="btn btn-secondary fs-auth-alert-btn"
                onClick={() => navigate('/login', { state: { email: errorInfo.email } })}
              >
                <span>Sign In with this Email</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary fs-auth-submit"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="fs-auth-switch">
        <span>Already have an account? </span>
        <Link to="/login" className="text-brand">Sign in</Link>
      </div>
    </div>
  );
}

