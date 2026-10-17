import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function HowItWorks() {
  return (
    <LegalLayout
      badge="GUIDE & WORKFLOW"
      title="How It Works - Discover Music with FreeSong.in"
      subtitle="FreeSong.in makes it easier to explore music, find tracks that match your taste, and enjoy a seamless listening experience."
    >
      <div className="fs-legal-section">
        <h2>Discover Music with FreeSong.in</h2>
        <p>
          FreeSong.in makes it easier to explore music, find tracks that match your taste, and enjoy a more convenient listening experience. Whether you already know what you want to hear or are looking for something new, our platform helps you navigate music through a simple and user-friendly interface.
        </p>

        <h3>01. Find Your Music</h3>
        <p>
          Begin your journey by searching for a song, artist, album, or playlist. Enter a few words related to the music you have in mind and explore the available results. From familiar favorites to new musical interests, FreeSong.in helps you discover content that fits your preferences.
        </p>

        <h3>02. Browse and Discover</h3>
        <p>
          Explore music beyond your initial search. Visit artist profiles, browse album collections, and discover playlists featuring different styles and genres. Navigate through the available selections to find new artists, revisit popular tracks, and expand your musical horizons.
        </p>

        <h3>03. Enjoy a Seamless Listening Experience</h3>
        <p>
          Choose a track and start listening through the available player. Use playback controls to navigate between songs and manage upcoming tracks according to your preferences. The responsive interface is designed to make music accessible across desktop and mobile devices, with playback capabilities depending on the supported music source and browser.
        </p>

        <h3>04. Keep Your Favorites Organized</h3>
        <p>
          Make your music experience more personal by saving tracks and creating playlists, where supported. Organize your selections around your favorite artists, genres, moods, or daily activities. These tools help you build collections that make returning to the music you enjoy more convenient.
        </p>

        <h3>05. Share the Experience</h3>
        <p>
          Music is even better when shared. Explore available listening and sharing features to enjoy music with friends and exchange musical discoveries. Participants can share tracks and enjoy coordinated playback seamlessly across devices.
        </p>

        <h3>Start Exploring FreeSong.in</h3>
        <p>
          Your next favorite song could be just a search away. Explore the available music catalog, discover new sounds, and find a listening experience that suits your style.
        </p>
        <div className="contact-card" style={{ textAlign: 'center', marginTop: '24px' }}>
          <p>
            <Link to="/search" style={{ fontWeight: 600, fontSize: '1.1rem', marginRight: '16px' }}>Explore Music</Link> · <Link to="/features" style={{ fontWeight: 600, fontSize: '1.1rem', marginLeft: '16px' }}>Discover Our Features</Link>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
