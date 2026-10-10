import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, Play, Loader2, Music2, X, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { getArtworkFallback } from '../../utils/imageFallback';
import { usePlayer } from '../../context/PlayerContext';
import './PlayerSearch.css';

const MemoRow = memo(function MemoRow({ song, onPlay }) {
  return (
    <div
      className="fs-ps-result-row"
      onClick={() => onPlay(song)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onPlay(song);
      }}
    >
      <div className="fs-ps-result-thumb-wrap">
        <img
          src={
            song.thumbnail ||
            (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '')
          }
          alt={song.title}
          className="fs-ps-result-thumb"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const currentSrc = e.currentTarget.src || '';
            if (song.videoId && !currentSrc.includes('i.ytimg.com')) {
              e.currentTarget.src = `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
            } else {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getArtworkFallback(song.title);
            }
          }}
        />
        <div className="fs-ps-result-hover-play">
          <Play size={16} fill="#000000" />
        </div>
      </div>
      <div className="fs-ps-result-meta">
        <span className="fs-ps-result-title truncate">{song.title}</span>
        <span className="fs-ps-result-artist truncate">{song.artist}</span>
      </div>
      <span className="fs-ps-result-duration">
        {song.durationText || (song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : '')}
      </span>
      <div className="fs-ps-result-play-icon">
        <Play size={14} />
      </div>
    </div>
  );
});

export function PlayerSearch({ onPlayed }) {
  const { playSong } = usePlayer();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null); // null = suggestion mode, array = results mode
  const [searchedQuery, setSearchedQuery] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [searching, setSearching] = useState(false);
  const reqIdRef = useRef(0);
  const debounceRef = useRef(null);

  // Live suggestions while typing (suggestion mode only, debounced 300ms)
  useEffect(() => {
    if (results !== null) return;
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setSuggestions([]);
      setSuggesting(false);
      return;
    }
    setSuggesting(true);
    debounceRef.current = setTimeout(async () => {
      const id = ++reqIdRef.current;
      const res = await api.getSearchSuggestions(q).catch(() => []);
      if (id !== reqIdRef.current) return; // stale response guard
      setSuggestions(res || []);
      setSuggesting(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, results]);

  const runSearch = useCallback(async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed) return;
    const id = ++reqIdRef.current;
    setQuery(trimmed);
    setSearchedQuery(trimmed);
    setSearching(true);
    setResults([]);
    const res = await api.search(trimmed, 'song', 20).catch(() => ({ songs: [] }));
    if (id !== reqIdRef.current) return; // stale response guard
    setResults(res?.songs || []);
    setSearching(false);
  }, []);

  const handlePlay = useCallback((song) => {
    if (!song?.videoId) return;
    // Radio-style: queue starts with the song, autoplay radio appends related tracks
    playSong(song, [song]);
    if (onPlayed) onPlayed();
  }, [playSong, onPlayed]);

  const backToSuggestions = () => {
    setResults(null);
    setSuggestions([]);
    setSearching(false);
  };

  const clearAll = () => {
    setQuery('');
    setResults(null);
    setSuggestions([]);
    setSearching(false);
    setSuggesting(false);
  };

  const inResultsMode = results !== null;

  return (
    <div className="fs-ps-panel">
      {/* Search Input */}
      <div className="fs-ps-input-wrap">
        {inResultsMode ? (
          <button className="fs-ps-back-btn" onClick={backToSuggestions} aria-label="Back to suggestions" title="Back">
            <ArrowLeft size={17} />
          </button>
        ) : (
          <Search size={17} className="fs-ps-input-icon" />
        )}
        <input
          type="text"
          className="fs-ps-input"
          placeholder="Search songs to play..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch(query);
            if (e.key === 'Escape') e.currentTarget.blur();
          }}
          autoFocus
        />
        {query && (
          <button className="fs-ps-clear-btn" onClick={clearAll} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
        {(suggesting || searching) && <Loader2 size={15} className="fs-ps-spin" />}
      </div>

      {/* ── Suggestion Mode ── */}
      {!inResultsMode && (
        <div className="fs-ps-suggestions">
          {!query.trim() && (
            <div className="fs-ps-hint">
              <Sparkles size={26} className="fs-ps-hint-icon" />
              <p className="fs-ps-hint-title">Search anything</p>
              <p className="fs-ps-hint-sub">
                Type a song, artist or movie name — pick a result and it starts playing instantly with a smart radio queue.
              </p>
            </div>
          )}

          {query.trim() && !suggesting && suggestions.length === 0 && (
            <div className="fs-ps-hint">
              <Music2 size={26} className="fs-ps-hint-icon" />
              <p className="fs-ps-hint-sub">No suggestions — press Enter to search anyway</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="fs-ps-suggestion-list">
              {suggestions.map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  className="fs-ps-suggestion-row"
                  onClick={() => runSearch(s)}
                >
                  <Search size={15} className="fs-ps-suggestion-icon" />
                  <span className="fs-ps-suggestion-text truncate">{s}</span>
                  <span className="fs-ps-suggestion-cta">Search</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Results Mode ── */}
      {inResultsMode && (
        <div className="fs-ps-results">
          <div className="fs-ps-results-header">
            <span className="fs-ps-results-title">
              Results for <strong>"{searchedQuery}"</strong>
            </span>
            {!searching && results.length > 0 && (
              <span className="fs-ps-results-count">{results.length} songs</span>
            )}
          </div>

          {searching ? (
            <div className="fs-ps-loading">
              <Loader2 size={26} className="fs-ps-spin" />
              <span>Finding songs...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="fs-ps-hint">
              <Music2 size={26} className="fs-ps-hint-icon" />
              <p className="fs-ps-hint-title">No songs found</p>
              <p className="fs-ps-hint-sub">Try a different spelling or a simpler keyword</p>
            </div>
          ) : (
            <div className="fs-ps-results-list">
              {results.map((song, idx) => (
                <MemoRow key={`${song.videoId}-${idx}`} song={song} onPlay={handlePlay} />
              ))}
            </div>
          )}

          {!searching && results.length > 0 && (
            <p className="fs-ps-radio-note">
              Playing any result auto-builds a radio queue of related songs
            </p>
          )}
        </div>
      )}
    </div>
  );
}
