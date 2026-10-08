import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Disc, Loader2, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';
import { SongCard } from '../../components/Cards/SongCard';
import './AlbumDetail.css';

export function AlbumDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryName = searchParams.get('name') || '';
  const { playSong } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAlbum = () => {
    setLoading(true);
    setError(null);
    api.getAlbum(id, queryName)
      .then(res => {
        if (!res || res.error) {
          setError(res?.error || 'Failed to load album tracks');
        } else {
          setAlbum(res);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error loading album');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="fs-album-loading">
        <Loader2 size={36} className="spin text-brand" />
        <p>Loading album tracks...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="fs-album-error-state">
        <Disc size={48} className="text-muted" />
        <h3>Unable to load album</h3>
        <p>{error || 'Album tracks could not be loaded from YouTube Music.'}</p>
        <div className="fs-album-error-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn btn-primary" onClick={loadAlbum}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
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
          <span className="fs-album-type">{album?.isSingle ? 'SINGLE / SOUNDTRACK' : 'ALBUM'}</span>
          <h1 className="fs-album-title">{album?.title}</h1>
          <p className="fs-album-sub">
            {album?.artist} • {album?.year || 'Release'} • {album?.isSingle ? `${album?.songs?.length || 0} tracks (Soundtrack Collection)` : `${album?.songs?.length || 0} tracks`}
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
              className="btn btn-secondary fs-album-shuffle-btn"
              onClick={handleShufflePlay}
              disabled={!album?.songs?.length}
            >
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spotify-Style Track List Container */}
      <div className="fs-album-tracks-container">
        {album?.songs?.length > 0 && (
          <div className="fs-pl-table-header">
            <span className="fs-pl-th fs-pl-th-num">#</span>
            <span className="fs-pl-th fs-pl-th-title">TITLE</span>
            <span className="fs-pl-th fs-pl-th-album">ALBUM</span>
            <span className="fs-pl-th fs-pl-th-time">
              <Clock size={16} />
            </span>
          </div>
        )}

        <div className="fs-album-tracklist">
          {album?.songs?.length === 0 ? (
            <div className="fs-album-empty">No tracks available for this album.</div>
          ) : (
            album?.songs?.map((song, index) => (
              <SongCard
                key={song.videoId || index}
                song={song}
                queueContext={album.songs}
                index={index}
                showAlbum={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
