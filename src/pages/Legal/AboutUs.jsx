import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function AboutUs() {
  const currentYear = new Date().getFullYear();

  return (
    <LegalLayout
      badge="ABOUT FREESONG.IN"
      title="About FreeSong.in - Music Discovery Platform"
      subtitle="FreeSong.in is a music discovery and listening platform designed to make exploring music simple, accessible, and seamless."
    >
      <div className="fs-legal-section">
        <h2>About FreeSong.in</h2>
        <p>
          FreeSong.in is a music discovery and listening platform designed to make exploring music simple, accessible, and seamless. Our focus is on delivering an intuitive listening experience through efficient music search, convenient playlist management, streamlined playback controls, and a privacy-conscious approach to technology.
        </p>

        <h3>Our Mission</h3>
        <p>
          At FreeSong.in, we believe discovering and enjoying music should be straightforward, enjoyable, and free from unnecessary distractions. We prioritize usability, responsive performance, and intuitive navigation to help listeners find the music they love with minimal effort.
        </p>
        <p>
          What began as an initiative to build a fast, browser-based music platform has evolved into a comprehensive music discovery experience. FreeSong.in brings together music search, artist and album exploration, playlist tools, synchronized listening features, and features designed to make music discovery more convenient across desktop and mobile devices.
        </p>

        <h3>What We Offer</h3>
        <h4>Music Discovery and Search</h4>
        <p>
          Explore a broad selection of music through search and discovery tools designed to help you find songs, artists, albums, and playlists. Discover music across different genres, moods, eras, and listening preferences, along with regularly updated selections of trending tracks and new releases.
        </p>

        <h4>Playlists and Playback Controls</h4>
        <p>
          Organize your listening experience with personalized playlists, saved favorites, and flexible queue management. FreeSong.in provides convenient tools for organizing music and retaining selected preferences across sessions, where supported by your browser and device.
        </p>

        <h4>Synchronized Listening Features</h4>
        <p>
          Enjoy music together through collaborative listening tools and shared queues. Experience coordinated playback with real-time controls, subject to feature availability and playback-source limitations.
        </p>

        <h4>Music Guides and Editorial Content</h4>
        <p>
          Discover original articles, music exploration guides, playlist recommendations, genre introductions, and practical listening tips published by the FreeSong.in team. Our editorial content is designed to help users explore different musical styles, discover artists, and make more informed listening choices.
        </p>

        <h3>Our Commitment to Privacy</h3>
        <p>
          We recognize the importance of protecting user privacy. FreeSong.in aims to limit data collection to information reasonably necessary to provide and maintain its services. Where authentication is available, this may include basic account information, such as your name and email address.
        </p>
        <p>
          We do not sell personal information to third parties or build behavioral profiles for advertising purposes. Where technically feasible, preferences and listening-related settings may be stored locally on your device to improve convenience and reduce unnecessary data transmission.
        </p>
        <p>
          Our data practices are subject to the applicable features, service providers, and technologies used by the platform. For complete information about data collection, usage, and your rights, please review our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
        </p>

        <h3>Technology and Performance</h3>
        <p>
          FreeSong.in is developed using modern web technologies, with progressive web application capabilities and service-worker-based caching where supported. Our technical approach emphasizes responsive interfaces, efficient resource loading, and a smooth experience across a range of devices and network conditions.
        </p>
        <p>
          We also work to make our editorial content accessible to search engines through appropriate page rendering and indexing practices. Regional discovery features and bandwidth-conscious loading help support a more accessible experience for listeners with different preferences and connectivity conditions.
        </p>
        <p>
          Playback availability, offline functionality, and supported features may depend on the browser, device, network, and underlying music source.
        </p>

        <h3>Get in Touch</h3>
        <p>
          We value feedback from our users and welcome questions, feature suggestions, bug reports, and partnership inquiries. Your feedback helps us identify opportunities to improve the platform and deliver a more reliable music discovery experience.
        </p>
        <div className="contact-card">
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p>You can also visit our <Link to="/contact">Contact Page</Link> for further assistance.</p>
        </div>
        <p style={{ marginTop: '24px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          © {currentYear} FreeSong.in. All rights reserved.
        </p>
      </div>
    </LegalLayout>
  );
}
