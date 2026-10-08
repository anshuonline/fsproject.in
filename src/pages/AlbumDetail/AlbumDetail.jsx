import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Shuffle, Disc, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import './AlbumDetail.css';

export function AlbumDetail() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAlbum(id).then(res => {
      setAlbum(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="fs-album-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading album details...</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (album?.songs?.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const handleShufflePlay = () => {
    if (album?.songs?.length > 0) {
      const shuffled = [...album.songs].sort(() => 0.5 - Math.random());
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="fs-album-page">
      <div className="fs-album-hero">
        <div className="fs-album-cover">
          {album?.coverImage ? (
            <img src={album.coverImage} alt={album.title} className="fs-album-cover-img" />
          ) : (
            <Disc size={64} className="text-brand" />
          )}
        </div>

        <div className="fs-album-meta">
          <span className="fs-album-type">ALBUM</span>
          <h1 className="fs-album-title">{album?.title}</h1>
          <p className="fs-album-sub">
            {album?.artist} • {album?.year || 'Release'} • {album?.songs?.length || 0} tracks
          </p>

          <div className="fs-album-actions">
            <button
              className="btn btn-primary fs-album-play-btn"
              onClick={handlePlayAll}
              disabled={!album?.songs?.length}
            >
              <Play size={18} fill="#000000" />
              <span>Play All</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleShufflePlay}
              disabled={!album?.songs?.length}
            >
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fs-album-tracklist">
        {album?.songs?.length === 0 ? (
          <div className="fs-album-empty">No tracks available for this album.</div>
        ) : (
          album?.songs?.map((song) => (
            <SongCard key={song.videoId} song={song} queueContext={album.songs} />
          ))
        )}
      </div>
    </div>
  );
}
