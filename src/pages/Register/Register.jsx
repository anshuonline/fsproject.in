import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ContextMenuContext';
import { GoogleIcon } from '../../components/Common/GoogleIcon';
import './Register.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, loginWithGoogle, isGoogleLoading, loginWithEmail } = useAuth();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    loginWithEmail(name.trim(), email.trim());
    showToast(`Account created! Welcome, ${name.trim()}!`, 'success');
    navigate('/profile');
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
        disabled={isGoogleLoading}
      >
        <GoogleIcon size={18} />
        <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      <div className="fs-auth-divider">
        <span>or with email</span>
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
              required
            />
          </div>
        </div>

        <div className="fs-form-group">
          <label className="fs-form-label">Password</label>
          <div className="fs-input-wrap">
            <Lock size={18} className="fs-input-icon" />
            <input
              type="password"
              className="fs-input-field"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary fs-auth-submit">
          <span>Create Account</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="fs-auth-switch">
        <span>Already have an account? </span>
        <Link to="/login" className="text-brand">Sign in</Link>
      </div>
    </div>
  );
}

