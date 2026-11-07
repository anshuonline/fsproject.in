import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './GenreChips.css';

export const ALL_GENRES = [
  'Pop Hits',
  'Bollywood Hits',
  'Hip-Hop',
  'Lofi Beats',
  'Punjabi Pop',
  'Indie Rock',
  'R&B Hits',
  'Romantic Melodies',
  'EDM & Dance',
  'K-Pop',
  'Sufi Classics',
  'Acoustic Pop',
  'Latin Hits',
  'Ghazals',
  'Chillhop',
  'Alt Rock',
  'Synthwave',
  'Devotional & Bhakti',
  'Afrobeats',
  '90s Nostalgia',
  'Country',
  'South Indian Hits',
  'Jazz & Blues',
  'Workout Energy',
  'Classical & Instrumental',
  'Reggaeton',
  'Study Focus',
  'Heavy Metal',
  'Party Anthems',
  'Folk & Acoustic',
  'Soul & Funk',
  'Road Trip',
  'Anime & J-Pop',
  'Trap Beats',
  'Deep House',
  'Sleep & Calm',
  'Unplugged Sessions',
  'Retro Classics',
  'Ambient Chill',
  'Telugu Hits',
  'Tamil Hits',
  'Disco Vibes',
  'Sad Ballads',
  'Bhojpuri Anthems',
  'Haryanvi Hits',
  'Piano Melodies',
  'Indie Pop',
  'Hard Rock',
  'Qawwali',
  'Monsoon Melodies',
  'Coffeehouse Acoustic',
  'Lo-Fi Study',
  'Club Anthems',
  '2000s Throwback',
  'Electronic Vibes',
  'Evening Acoustic',
  'Bollywood Retro',
  'Malayalam Melodies',
  'Kannada Hits',
  'Bengali Classics',
  'Gujarati Folk',
  'Marathi Anthems',
  'Rajasthani Folk'
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GenreChips() {
  // Shuffled on mount so every session has a fresh, natural interleaved mix
  const shuffledChips = useMemo(() => shuffleArray(ALL_GENRES), []);

  return (
    <section className="fs-genre-chips-section" aria-label="Explore Music Categories">
      <div className="fs-genre-chips-container">
        {shuffledChips.map((genre) => (
          <Link
            key={genre}
            to={`/search?q=${encodeURIComponent(genre)}`}
            className="fs-genre-chip"
          >
            {genre}
          </Link>
        ))}
      </div>
    </section>
  );
}
