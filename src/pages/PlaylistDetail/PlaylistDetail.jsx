import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Play, Shuffle, ListMusic, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useLibrary } from '../../context/LibraryContext';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import './PlaylistDetail.css';

export function PlaylistDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryName = searchParams.get('name');
  const { playlists } = useLibrary();
  const { playSong } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if it's a user-created local playlist
    const local = playlists.find(p => p.id === id);
    if (local) {
      setPlaylist({
        id: local.id,
        title: local.name,
        creator: 'You',
        songs: local.songs || [],
        coverImage: null
      });
      setLoading(false);
      return;
    }

    // Otherwise fetch from ytmusic-api
    setLoading(true);
    api.getPlaylist(id).then(res => {
      if (res) {
        if (queryName && (!res.title || res.title === 'Playlist')) {
          res.title = queryName;
        }
        setPlaylist(res);
      } else {
        setPlaylist({
          id,
          title: queryName || 'Playlist',
          creator: 'Community',
          songs: []
        });
      }
      setLoading(false);
    });
  }, [id, queryName, playlists]);

  if (loading) {
    return (
      <div className="fs-pl-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading playlist tracks...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist?.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleShufflePlay = () => {
    if (playlist?.songs?.length > 0) {
      const shuffled = [...playlist.songs].sort(() => 0.5 - Math.random());
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="fs-pl-page">
      <div className="fs-pl-hero">
        <div className="fs-pl-cover">
          {playlist?.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.title} className="fs-pl-cover-img" />
          ) : (
            <ListMusic size={64} className="text-brand" />
          )}
        </div>

        <div className="fs-pl-hero-meta">
          <span className="fs-pl-type">PLAYLIST</span>
          <h1 className="fs-pl-title">{playlist?.title}</h1>
          <p className="fs-pl-sub">
            {playlist?.creator || 'FreeSong'} • {playlist?.songs?.length || 0} songs
          </p>

          <div className="fs-pl-actions">
            <button
              className="btn btn-primary fs-pl-play-btn"
              onClick={handlePlayAll}
              disabled={!playlist?.songs?.length}
            >
              <Play size={18} fill="#000000" />
              <span>Play All</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleShufflePlay}
              disabled={!playlist?.songs?.length}
            >
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="fs-pl-tracks-list">
        {playlist?.songs?.length === 0 ? (
          <div className="fs-pl-empty">
            <p>No songs found in this playlist.</p>
          </div>
        ) : (
          playlist?.songs?.map((song) => (
            <SongCard key={song.videoId} song={song} queueContext={playlist.songs} />
          ))
        )}
      </div>
    </div>
  );
}
