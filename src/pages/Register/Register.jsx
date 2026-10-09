import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import './Register.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, loginWithGoogle, isGoogleLoading, registerWithPassword } = useAuth();
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
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const user = await registerWithPassword(name.trim(), email.trim(), password);
      showToast(`Account created! Welcome, ${user.name}!`, 'success');
      navigate('/profile');
    } catch (err) {
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
              onChange={(e) => setName(e.target.value)}
              disabled={isRegistering}
              required
            />
          </div>
        </div>

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
              disabled={isRegistering}
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isRegistering}
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
          disabled={isRegistering || isGoogleLoading}
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

