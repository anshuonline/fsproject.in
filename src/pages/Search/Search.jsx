import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Music, Disc, ListMusic, User } from 'lucide-react';
import { useSearchData } from './useSearchData';
import { SongCard } from '../../components/Cards/SongCard';
import { CommunityCard } from '../../components/Cards/CommunityCard';
import { LibraryCard } from '../../components/Cards/LibraryCard';
import { AlbumCard } from '../../components/Cards/AlbumCard';
import { ArtistCard } from '../../components/Cards/ArtistCard';
import './Search.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'song', label: 'Songs' },
  { id: 'album', label: 'Albums' },
  { id: 'playlist', label: 'Playlists' },
  { id: 'artist', label: 'Artists' }
];

export function Search() {
  const navigate = useNavigate();
  const { query, filterType, setFilterType, results, loading, error } = useSearchData();

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [query, filterType, loading]);

  return (
    <div className="fs-search-page">
      {/* Search Header */}
      <div className="fs-search-header">
        <h1 className="fs-search-heading">
          {query ? `Search results for "${query}"` : 'Explore & Search'}
        </h1>

        {/* Filter Chips */}
        {query && (
          <div className="fs-filter-chips">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-chip ${filterType === f.id ? 'active' : ''}`}
                onClick={() => setFilterType(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="fs-search-loading">
          <Loader2 size={32} className="spin text-brand" />
          <p>Searching YouTube Music...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !query && (
        <div className="fs-search-empty">
          <SearchIcon size={48} className="fs-search-empty-icon" />
          <h3>Type in the top bar to search</h3>
          <p>Find your favorite songs, artists, playlists, and albums.</p>
          <div className="fs-search-trending-tags">
            <span className="fs-trending-label">Trending Searches:</span>
            <div className="fs-trending-chips">
              {['Arijit Singh', 'Rockstar', 'Sidhu Moose Wala', 'Aashiqui 2', 'Bollywood Lo-Fi', 'Coke Studio', 'AP Dhillon', 'Taylor Swift'].map(term => (
                <button
                  key={term}
                  className="filter-chip"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && query && (
        <div className="fs-search-results">
          {/* Artists section (Rendered prominently for artist queries) */}
          {results.artists && results.artists.length > 0 && (
            <section className="fs-search-section">
              <h3 className="fs-section-title">Artists</h3>
              <div className="fs-artists-grid">
                {results.artists.map(artist => (
                  <ArtistCard
                    key={artist.id || artist.name}
                    artist={artist}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Songs section */}
          {results.songs && results.songs.length > 0 && (
            <section className="fs-search-section">
              <h3 className="fs-section-title">Songs</h3>
              <div className="fs-songs-list">
                {results.songs.map(song => (
                  <SongCard
                    key={song.videoId}
                    song={song}
                    queueContext={results.songs}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums section */}
          {results.albums && results.albums.length > 0 && (
            <section className="fs-search-section">
              <h3 className="fs-section-title">Albums</h3>
              <div className="fs-cards-grid">
                {results.albums.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists section */}
          {results.playlists && results.playlists.length > 0 && (
            <section className="fs-search-section">
              <h3 className="fs-section-title">Playlists</h3>
              <div className="fs-cards-grid">
                {results.playlists.map(pl => (
                  <CommunityCard
                    key={pl.id}
                    item={{
                      id: pl.id,
                      title: pl.title,
                      creator: pl.creator,
                      views: `${pl.trackCount || 'Multiple'} tracks`,
                      thumbnail: pl.thumbnail,
                      badge: (pl.creator || 'P')[0].toUpperCase()
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {results.songs?.length === 0 &&
           results.albums?.length === 0 &&
           results.playlists?.length === 0 &&
           results.artists?.length === 0 && (
            <div className="fs-search-empty">
              <Music size={40} className="fs-search-empty-icon" />
              <h3>No results found</h3>
              <p>Try searching for a different keyword or track title.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
