import React, { useState, useRef, useMemo } from 'react';
import { X, Trash2, Music, MoreVertical, Loader2, Volume2, History as HistoryIcon } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useContextMenu } from '../../context/ContextMenuContext';
import { useProgressiveList } from '../../hooks/useProgressiveList';
import { isGrayPlaceholder, buildThumbFallbacks, advanceThumb } from '../../utils/imageFallback';
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
  const [showPrev, setShowPrev] = useState(false);
  const bodyRef = useRef(null);

  const safeIndex = (queueIndex >= 0 && queueIndex < queue.length) ? queueIndex : 0;
  const isLargeQueue = queue.length > 40;

  // Memoize slices so array references remain stable across re-renders
  const prevTracks = useMemo(() => {
    return isLargeQueue && safeIndex > 0 ? queue.slice(0, safeIndex) : [];
  }, [isLargeQueue, queue, safeIndex]);

  const currentTrack = isLargeQueue ? queue[safeIndex] : null;

  const upcomingTracks = useMemo(() => {
    return isLargeQueue ? queue.slice(safeIndex + 1) : [];
  }, [isLargeQueue, queue, safeIndex]);

  // Progressive rendering for upcoming tracks in large queue to eliminate drawer freeze
  const {
    visibleItems: visibleUpcoming,
    visibleCount: visibleUpcomingCount,
    hasMore: hasMoreUpcoming,
    sentinelRef
  } = useProgressiveList(upcomingTracks, {
    initialBatch: 30,
    batchSize: 30,
    rootRef: bodyRef,
    resetKey: `${safeIndex}-${queue.length}`
  });

  if (!isQueueOpen) return null;

  const renderQueueRow = (song, actualIdx, isCurrent = false) => {
    if (!song) return null;
    const thumbPrimary = song.thumbnail || (song.videoId ? `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg` : '/images/freesonglogowebp.webp');
    const thumbCandidates = buildThumbFallbacks(thumbPrimary, song.videoId);
    const advance = (img) => advanceThumb(img, thumbCandidates, '/images/freesonglogowebp.webp');

    return (
      <div
        key={`${song.videoId}-${actualIdx}`}
        className={`fs-queue-row ${isCurrent ? 'current' : ''}`}
        onClick={() => playSong(song, queue)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMenu(song, e);
        }}
      >
        <div className="fs-queue-idx">
          {isCurrent ? <Volume2 size={14} className="text-brand" /> : actualIdx + 1}
        </div>
        <img
          src={thumbPrimary}
          alt={song.title}
          className="fs-queue-thumb"
          referrerPolicy="no-referrer"
          onError={(e) => advance(e.currentTarget)}
          onLoad={(e) => {
            if (isGrayPlaceholder(e.currentTarget)) advance(e.currentTarget);
          }}
        />
        <div className="fs-queue-meta">
          <span className={`fs-queue-song-title truncate ${isCurrent ? 'text-green' : ''}`}>
            {song.title}
          </span>
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
            removeFromQueue(actualIdx);
          }}
          title="Remove from queue"
          aria-label="Remove from queue"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

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

        <div className="fs-queue-body" ref={bodyRef}>
          {queue.length === 0 ? (
            <div className="fs-queue-empty">
              <Music size={40} className="fs-empty-icon" />
              <p>Your queue is empty</p>
              <span>Add songs from search or playlists to listen next</span>
            </div>
          ) : !isLargeQueue ? (
            /* Standard direct queue for small/medium lists (<= 40 tracks) */
            <div className="fs-queue-items-list">
              {queue.map((song, idx) => renderQueueRow(song, idx, idx === safeIndex))}
            </div>
          ) : (
            /* Spotify-style Partitioned Queue for Large Lists (1,500+ tracks) */
            <div className="fs-queue-items-list">
              {/* Previous Played Tracks Toggle */}
              {prevTracks.length > 0 && (
                <div className="fs-queue-prev-section">
                  <button
                    type="button"
                    className="fs-queue-section-toggle"
                    onClick={() => setShowPrev(!showPrev)}
                  >
                    <HistoryIcon size={13} />
                    <span>{showPrev ? 'Hide played tracks' : `Previously played (${prevTracks.length})`}</span>
                  </button>

                  {showPrev && (
                    <div className="fs-queue-prev-list">
                      {prevTracks.map((song, idx) => renderQueueRow(song, idx, false))}
                    </div>
                  )}
                </div>
              )}

              {/* Now Playing Section */}
              {currentTrack && (
                <div className="fs-queue-group">
                  <div className="fs-queue-section-label">NOW PLAYING</div>
                  {renderQueueRow(currentTrack, safeIndex, true)}
                </div>
              )}

              {/* Next In Queue Section */}
              {upcomingTracks.length > 0 && (
                <div className="fs-queue-group">
                  <div className="fs-queue-section-label">
                    NEXT IN QUEUE ({upcomingTracks.length})
                  </div>
                  {visibleUpcoming.map((song, i) => {
                    const actualIdx = safeIndex + 1 + i;
                    return renderQueueRow(song, actualIdx, false);
                  })}

                  {/* Scroll Sentinel for progressive chunk loading */}
                  {hasMoreUpcoming && (
                    <div ref={sentinelRef} className="fs-queue-progressive-loader">
                      <Loader2 size={14} className="spin text-brand" />
                      <span>Loading more ({visibleUpcomingCount} of {upcomingTracks.length})...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
