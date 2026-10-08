import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Register.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    navigate('/');
  };

  return (
    <div className="fs-auth-box">
      <h2 className="fs-auth-title">Join FreeSong.in</h2>
      <p className="fs-auth-sub">Create your music profile for unlimited playlists</p>

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
