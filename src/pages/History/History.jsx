import React from 'react';
import { History as HistoryIcon, Trash2, Play, Music } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import './History.css';

export function History() {
  const { history, clearHistory } = useLibrary();
  const { playSong } = usePlayer();

  const handlePlayAll = () => {
    if (history.length > 0) {
      playSong(history[0], history);
    }
  };

  return (
    <div className="fs-history-page">
      <div className="fs-history-header">
        <div className="fs-history-title-group">
          <h1 className="fs-history-title">Listening History</h1>
          <p className="fs-history-subtitle">Recently played tracks and sessions on FreeSong.in</p>
        </div>

        {history.length > 0 && (
          <div className="fs-history-actions">
            <button className="btn btn-primary" onClick={handlePlayAll}>
              <Play size={16} fill="#000000" />
              <span>Resume History</span>
            </button>
            <button className="btn btn-secondary" onClick={clearHistory}>
              <Trash2 size={16} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      <div className="fs-history-list">
        {history.length === 0 ? (
          <div className="fs-history-empty">
            <HistoryIcon size={44} className="text-brand" />
            <h3>No listening history yet</h3>
            <p>Songs you stream will appear here so you can easily replay them.</p>
          </div>
        ) : (
          history.map(song => (
            <SongCard key={song.videoId} song={song} queueContext={history} />
          ))
        )}
      </div>
    </div>
  );
}
