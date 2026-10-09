import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { isAuthenticated, loginWithGoogle, isGoogleLoading, loginWithPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoggingIn}
              required
            />
          </div>
        </div>

        <div className="fs-form-group">
          <label className="fs-form-label">Password</label>
          <div className="fs-input-wrap">
            <Lock size={18} className="fs-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="fs-input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
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
  );
}

