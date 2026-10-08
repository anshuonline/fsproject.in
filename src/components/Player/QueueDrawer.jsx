import React from 'react';
import { X, Trash2, Music, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import './QueueDrawer.css';

export function QueueDrawer() {
  const {
    queue,
    queueIndex,
    isQueueOpen,
    setIsQueueOpen,
    playSong,
    removeFromQueue,
    clearQueue
  } = usePlayer();

  const { openMenu } = useContextMenu();

  if (!isQueueOpen) return null;

  return (
    <div className="fs-queue-drawer-wrap">
      <div className="fs-queue-backdrop" onClick={() => setIsQueueOpen(false)} />
      <div className="fs-queue-drawer">
        <div className="fs-queue-header">
          <div className="fs-queue-title-wrap">
            <h3 className="fs-queue-title">Queue</h3>
            <span className="fs-queue-count-badge">{queue.length} tracks</span>
          </div>
          <div className="fs-queue-actions">
            {queue.length > 0 && (
              <button
                className="btn-icon fs-clear-queue-btn"
                onClick={clearQueue}
                title="Clear queue"
                aria-label="Clear queue"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              className="btn-icon"
              onClick={() => setIsQueueOpen(false)}
              aria-label="Close queue"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="fs-queue-body">
          {queue.length === 0 ? (
            <div className="fs-queue-empty">
              <Music size={40} className="fs-empty-icon" />
              <p>Your queue is empty</p>
              <span>Add songs from search or playlists to listen next</span>
            </div>
          ) : (
            <div className="fs-queue-items-list">
              {queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.videoId}-${idx}`}
                    className={`fs-queue-row ${isCurrent ? 'current' : ''}`}
                    onClick={() => playSong(song, queue)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openMenu(song, e);
                    }}
                  >
                    <div className="fs-queue-idx">{idx + 1}</div>
                    <img
                      src={song.thumbnail || (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp')}
                      alt={song.title}
                      className="fs-queue-thumb"
                      referrerPolicy="no-referrer"
                    />
                    <div className="fs-queue-meta">
                      <span className="fs-queue-song-title truncate">{song.title}</span>
                      <span className="fs-queue-song-artist truncate">{song.artist}</span>
                    </div>

                    <button
                      className="btn-icon fs-queue-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMenu(song, e);
                      }}
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    <button
                      className="btn-icon fs-queue-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      title="Remove from queue"
                      aria-label="Remove from queue"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
