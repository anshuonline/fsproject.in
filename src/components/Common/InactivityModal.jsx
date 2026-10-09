import React, { useEffect } from 'react';
import { Clock, Play, X, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import './InactivityModal.css';

export function InactivityModal() {
  const { isInactiveModalOpen, resumeFromInactivity, dismissInactiveModal, currentSong } = usePlayer();

  // Close on Escape key or resume on Enter/Space
  useEffect(() => {
    if (!isInactiveModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dismissInactiveModal();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        resumeFromInactivity();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInactiveModalOpen, dismissInactiveModal, resumeFromInactivity]);

  if (!isInactiveModalOpen) return null;

  return (
    <div className="fs-inactivity-backdrop" onClick={dismissInactiveModal}>
      <div 
        className="fs-inactivity-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fs-inactivity-title"
      >
        <button 
          className="fs-inactivity-close" 
          onClick={dismissInactiveModal}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Icon & Glow */}
        <div className="fs-inactivity-icon-wrap">
          <Clock size={32} className="fs-inactivity-icon" />
          <div className="fs-inactivity-icon-glow" />
        </div>

        {/* Text Details */}
        <h2 id="fs-inactivity-title" className="fs-inactivity-title">
          Are you still listening?
        </h2>
        <p className="fs-inactivity-desc">
          Playback was automatically paused due to inactivity to save your device battery and data.
        </p>

        {/* Paused Song Preview Pill */}
        {currentSong && (
          <div className="fs-inactivity-song-pill">
            {currentSong.thumbnail ? (
              <img 
                src={currentSong.thumbnail} 
                alt={currentSong.title} 
                className="fs-inactivity-song-thumb" 
              />
            ) : (
              <div className="fs-inactivity-song-thumb fs-inactivity-song-placeholder">
                <Music size={16} />
              </div>
            )}
            <div className="fs-inactivity-song-info">
              <span className="fs-inactivity-song-title">{currentSong.title}</span>
              <span className="fs-inactivity-song-artist">{currentSong.artist}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fs-inactivity-actions">
          <button 
            type="button" 
            className="fs-inactivity-btn-primary" 
            onClick={resumeFromInactivity}
            autoFocus
          >
            <Play size={18} fill="currentColor" />
            <span>Yes, keep listening</span>
          </button>

          <button 
            type="button" 
            className="fs-inactivity-btn-secondary" 
            onClick={dismissInactiveModal}
          >
            Stay paused
          </button>
        </div>
      </div>
    </div>
  );
}
