import React from 'react';
import { ListMusic } from 'lucide-react';
import { getArtworkFallback } from '../../utils/imageFallback';
import './PlaylistCover.css';

/**
 * Helper to get clean thumbnail URL from a song object
 */
export function getSongThumbnail(song) {
  if (!song) return null;
  if (song.thumbnail) return song.thumbnail;
  if (song.thumbnails && song.thumbnails[0]?.url) return song.thumbnails[0].url;
  if (song.videoId) return `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
  return null;
}

/**
 * Helper to get playlist cover URL or collage candidates
 */
export function getPlaylistCoverUrl(playlist) {
  if (!playlist) return null;
  if (playlist.coverImage) return playlist.coverImage;
  const songs = playlist.songs || [];
  if (songs.length > 0) {
    return getSongThumbnail(songs[0]);
  }
  return null;
}

export function PlaylistCover({
  playlist,
  size = 'hero', // 'hero' | 'card' | 'sidebar' | 'modal' | 'thumb'
  className = '',
  alt
}) {
  const title = playlist?.name || playlist?.title || 'Playlist';
  const customCover = playlist?.coverImage;
  const songs = playlist?.songs || [];

  // Determine alt text
  const altText = alt || `${title} cover`;

  // Fallback icon size based on container size
  const iconSize = size === 'hero' ? 64 : size === 'card' ? 32 : size === 'sidebar' ? 16 : 24;

  // Case 1: Custom explicit cover image
  if (customCover) {
    return (
      <div className={`fs-playlist-cover-box fs-cover-${size} ${className}`}>
        <img
          src={customCover}
          alt={altText}
          className="fs-playlist-cover-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const fallback = songs[0] ? getSongThumbnail(songs[0]) : null;
            if (fallback && e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            } else {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getArtworkFallback(title);
            }
          }}
        />
      </div>
    );
  }

  // Case 2: 4 or more songs & not small sidebar -> Spotify-Style 2x2 Collage
  if (songs.length >= 4 && size !== 'sidebar' && size !== 'thumb') {
    const firstFour = songs.slice(0, 4);
    return (
      <div className={`fs-playlist-cover-box fs-cover-${size} fs-cover-grid ${className}`}>
        {firstFour.map((song, i) => {
          const thumb = getSongThumbnail(song) || getArtworkFallback(song.title);
          return (
            <div key={song.videoId || i} className="fs-cover-grid-cell">
              <img
                src={thumb}
                alt=""
                className="fs-playlist-cover-img"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getArtworkFallback(song.title);
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Case 3: 1 to 3 songs (or sidebar with songs) -> Single 1st track artwork
  if (songs.length > 0) {
    const firstThumb = getSongThumbnail(songs[0]) || getArtworkFallback(title);
    return (
      <div className={`fs-playlist-cover-box fs-cover-${size} ${className}`}>
        <img
          src={firstThumb}
          alt={altText}
          className="fs-playlist-cover-img"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getArtworkFallback(title);
          }}
        />
      </div>
    );
  }

  // Case 4: Empty playlist with 0 songs -> AMOLED brand placeholder
  return (
    <div className={`fs-playlist-cover-box fs-cover-${size} fs-cover-empty ${className}`}>
      <ListMusic size={iconSize} className="text-brand fs-cover-empty-icon" />
    </div>
  );
}
