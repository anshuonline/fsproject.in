import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Cast, User, X } from 'lucide-react';
import './Header.css';

export function Header({ onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <header className="fs-header">
      {/* Left: Menu & Brand */}
      <div className="fs-header-left">
        <button
          className="btn-icon fs-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="fs-brand">
          <img
            src="/images/freesonglogowebp.webp"
            alt="FreeSong.in Logo"
            className="fs-logo"
          />
          <div className="fs-brand-text">
            <span className="fs-brand-title">FreeSong</span>
            <span className="fs-brand-badge">IN</span>
          </div>
        </Link>
      </div>

      {/* Center: Search Box */}
      <div className="fs-header-center">
        <form onSubmit={handleSearch} className="fs-search-form">
          <Search size={18} className="fs-search-icon" />
          <input
            type="text"
            className="fs-search-input"
            placeholder="Search songs, albums, artists, podcasts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-icon fs-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions */}
      <div className="fs-header-right">
        <button
          className="btn-icon fs-cast-btn"
          title="Connect to a device"
          aria-label="Connect to a device"
        >
          <Cast size={20} />
        </button>

        <Link to="/profile" className="fs-user-avatar" title="Account & Settings">
          <div className="fs-avatar-placeholder">
            <User size={18} />
          </div>
        </Link>
      </div>
    </header>
  );
}
