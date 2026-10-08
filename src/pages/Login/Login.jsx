import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    navigate('/');
  };

  return (
    <div className="fs-auth-box">
      <h2 className="fs-auth-title">Welcome to FreeSong</h2>
      <p className="fs-auth-sub">Stream your favorite tracks in high-fidelity AMOLED mode</p>

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary fs-auth-submit">
          <span>Sign In</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="fs-auth-switch">
        <span>Don't have an account? </span>
        <Link to="/register" className="text-brand">Create one</Link>
      </div>
    </div>
  );
}
