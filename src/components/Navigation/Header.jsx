import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, User, X, History, TrendingUp, ArrowUpLeft, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const RECENT_SEARCHES_KEY = 'freesong_recent_searches';
const POPULAR_SEARCHES = [
  'Arijit Singh',
  'Rockstar',
  'Sidhu Moose Wala',
  'Aashiqui 2',
  'Bollywood Lo-Fi',
  'Coke Studio'
];

export function Header({ onToggleSidebar }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Sync searchQuery with URL query parameter on /search
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) setSearchQuery(q);
    }
  }, [location]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.getSearchSuggestions(trimmed);
        setSuggestions(results || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const saveRecentSearch = (term) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const removeRecentSearch = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const executeSearch = (term) => {
    const clean = term.trim();
    if (!clean) return;
    saveRecentSearch(clean);
    setSearchQuery(clean);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentList = searchQuery.trim() ? suggestions : recentSearches;
    if (selectedIndex >= 0 && currentList[selectedIndex]) {
      executeSearch(currentList[selectedIndex]);
    } else if (searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  };

  const handleKeyDown = (e) => {
    const currentList = searchQuery.trim()
      ? suggestions
      : (recentSearches.length > 0 ? recentSearches : POPULAR_SEARCHES);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
        return;
      }
      if (currentList.length > 0) {
        setSelectedIndex(prev => (prev < currentList.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentList.length > 0) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : currentList.length - 1));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleInsertQuery = (term, e) => {
    e.stopPropagation();
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Helper to render suggestion text with YouTube-style bolding
  const renderHighlightedText = (text, query) => {
    if (!query) return <span>{text}</span>;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return <span>{text}</span>;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);

    return (
      <span>
        {before}
        <span className="fs-suggest-match">{match}</span>
        <strong className="fs-suggest-completion">{after}</strong>
      </span>
    );
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
            alt="FreeSong Logo"
            className="fs-logo"
          />
          <span className="fs-brand-title">FreeSong</span>
        </Link>
      </div>

      {/* Center: Search Box with Smart Recommendations */}
      <div className="fs-header-center" ref={containerRef}>
        <form onSubmit={handleSubmit} className="fs-search-form">
          <Search size={18} className="fs-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="fs-search-input"
            placeholder="Search songs, albums, artists, podcasts"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
              if (!showSuggestions) setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          {isLoading && searchQuery.trim() && (
            <div className="fs-search-loading-icon">
              <Loader2 size={15} className="spin text-brand" />
            </div>
          )}
          {searchQuery && !isLoading && (
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

        {/* Smart Recommendations Dropdown */}
        {showSuggestions && (
          <div className="fs-search-dropdown" role="listbox">
            {searchQuery.trim() ? (
              // Case 1: Suggestions while typing
              suggestions.length > 0 ? (
                <div className="fs-dropdown-section">
                  {suggestions.map((item, idx) => (
                    <div
                      key={item + idx}
                      className={`fs-dropdown-item ${selectedIndex === idx ? 'selected' : ''}`}
                      onClick={() => executeSearch(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      role="option"
                      aria-selected={selectedIndex === idx}
                    >
                      <Search size={16} className="fs-item-icon" />
                      <div className="fs-item-text truncate">
                        {renderHighlightedText(item, searchQuery.trim())}
                      </div>
                      <button
                        type="button"
                        className="btn-icon fs-item-insert-btn"
                        title="Fill query"
                        onClick={(e) => handleInsertQuery(item, e)}
                      >
                        <ArrowUpLeft size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : !isLoading ? (
                <div
                  className="fs-dropdown-item fs-direct-search-item"
                  onClick={() => executeSearch(searchQuery)}
                >
                  <Search size={16} className="fs-item-icon" />
                  <div className="fs-item-text">
                    Search for "<strong>{searchQuery}</strong>"
                  </div>
                </div>
              ) : null
            ) : (
              // Case 2: When search bar is empty (Recent or Popular)
              <div className="fs-dropdown-section">
                {recentSearches.length > 0 ? (
                  <>
                    <div className="fs-dropdown-header">
                      <span>Recent Searches</span>
                      <button
                        type="button"
                        className="fs-clear-all-btn"
                        onClick={clearAllRecent}
                      >
                        Clear All
                      </button>
                    </div>
                    {recentSearches.map((item, idx) => (
                      <div
                        key={item}
                        className={`fs-dropdown-item ${selectedIndex === idx ? 'selected' : ''}`}
                        onClick={() => executeSearch(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        role="option"
                        aria-selected={selectedIndex === idx}
                      >
                        <History size={16} className="fs-item-icon fs-history-icon" />
                        <div className="fs-item-text truncate">
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-icon fs-item-remove-btn"
                          title="Remove from history"
                          onClick={(e) => removeRecentSearch(item, e)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="fs-dropdown-header">
                      <div className="fs-header-trending-title">
                        <TrendingUp size={14} className="text-brand" />
                        <span>Trending on FreeSong</span>
                      </div>
                    </div>
                    {POPULAR_SEARCHES.map((item, idx) => (
                      <div
                        key={item}
                        className={`fs-dropdown-item ${selectedIndex === idx ? 'selected' : ''}`}
                        onClick={() => executeSearch(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        role="option"
                        aria-selected={selectedIndex === idx}
                      >
                        <TrendingUp size={16} className="fs-item-icon text-brand" />
                        <div className="fs-item-text truncate">
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-icon fs-item-insert-btn"
                          title="Fill query"
                          onClick={(e) => handleInsertQuery(item, e)}
                        >
                          <ArrowUpLeft size={16} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="fs-header-right">
        <Link
          to="/profile"
          className="fs-user-avatar"
          title={user?.name ? `${user.name} (${user.email || 'Google Account'})` : 'Account & Profile'}
        >
          {user?.picture ? (
            <div className="fs-avatar-img-wrap">
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="fs-header-avatar-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
              <div className="fs-avatar-placeholder fs-avatar-fallback" style={{ display: 'none' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
            </div>
          ) : (
            <div className="fs-avatar-placeholder">
              <User size={18} />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
