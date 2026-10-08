import React from 'react';
import { User, ShieldCheck, Sparkles, Heart, ListMusic, Settings, LogOut } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Link } from 'react-router-dom';
import './Profile.css';

export function Profile() {
  const { likedSongs, playlists, history } = useLibrary();

  return (
    <div className="fs-profile-page">
      {/* Profile Card */}
      <div className="fs-profile-card">
        <div className="fs-profile-avatar-wrap">
          <div className="fs-profile-avatar-circle">
            <User size={48} />
          </div>
          <div className="fs-profile-vip-badge">
            <Sparkles size={12} />
            <span>VIP</span>
          </div>
        </div>

        <div className="fs-profile-details">
          <h1 className="fs-profile-username">FreeSong Listener</h1>
          <p className="fs-profile-email">member@freesong.in</p>
          <div className="fs-profile-tier">
            <ShieldCheck size={16} className="text-brand" />
            <span>FreeSong Premium Active (Ad-Free & AMOLED Experience)</span>
          </div>
        </div>
      </div>

      {/* Stats Counter */}
      <div className="fs-profile-stats-row">
        <div className="fs-stat-box">
          <Heart size={24} className="text-brand" />
          <span className="fs-stat-number">{likedSongs.length}</span>
          <span className="fs-stat-label">Liked Songs</span>
        </div>

        <div className="fs-stat-box">
          <ListMusic size={24} className="text-brand" />
          <span className="fs-stat-number">{playlists.length}</span>
          <span className="fs-stat-label">Playlists</span>
        </div>

        <div className="fs-stat-box">
          <Sparkles size={24} className="text-brand" />
          <span className="fs-stat-number">{history.length}</span>
          <span className="fs-stat-label">Songs Streamed</span>
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="fs-profile-section">
        <h3 className="fs-section-title">Preferences</h3>
        <div className="fs-prefs-list">
          <Link to="/settings" className="fs-pref-item">
            <div className="fs-pref-info">
              <Settings size={20} />
              <div>
                <h4>Audio & Streaming Settings</h4>
                <p>High quality audio stream, auto-play next track, cache options</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
