import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function Features() {
  return (
    <LegalLayout
      badge="PLATFORM CAPABILITIES"
      title="Platform Features - FreeSong.in"
      subtitle="FreeSong.in brings together music exploration, personalized listening tools, and performance-focused web technology to create a convenient music experience."
    >
      <div className="fs-legal-section">
        <h2>FreeSong.in Platform Features</h2>
        <p>
          FreeSong.in brings together music exploration, personalized listening tools, and performance-focused web technology to create a convenient music experience. From discovering new tracks to managing playlists, each feature is designed to make navigation simpler and music more accessible.
        </p>

        <h3>Distraction-Free Listening</h3>
        <p>
          Enjoy a cleaner listening interface designed to keep the focus on music. FreeSong.in aims to provide a streamlined playback experience with responsive controls and efficient loading, helping users navigate between tracks with minimal friction. Audio availability and playback behavior depend on the supported music source.
        </p>

        <h3>Offline Access and Content Caching</h3>
        <p>
          Browser caching helps improve loading efficiency and may make certain previously accessed resources available when connectivity is limited. Offline playback of complete music tracks depends on the availability of supported offline functionality and the permissions associated with the relevant content source.
        </p>

        <h3>Shared Listening Experiences</h3>
        <p>
          Discover music with friends through collaborative listening and sharing features. Enjoy synchronized experiences, exchange track suggestions, and enjoy music together across devices.
        </p>

        <h3>Flexible Queue Controls</h3>
        <p>
          Create a listening sequence that suits your preferences. Add tracks to the queue, adjust their order, remove selections, and navigate through upcoming music using the available player controls. These tools provide greater flexibility when managing a listening session.
        </p>

        <h3>Efficient Media Loading</h3>
        <p>
          A performance-conscious interface helps reduce unnecessary resource loading. Lightweight components and interaction-based media initialization improve responsiveness and help limit avoidable data usage, particularly on mobile connections.
        </p>

        <h3>Personalized Music Organization</h3>
        <p>
          Keep your preferred tracks organized with favorites and custom playlists, where supported. Local browser storage retains selected settings and library information between sessions, ensuring your preferences are always right where you left them.
        </p>

        <h3>Privacy-Conscious Design</h3>
        <p>
          FreeSong.in aims to handle personal information responsibly and limit unnecessary data collection. Account information is handled according to the platform's applicable privacy practices. For details about data handling, please consult our <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <h3>Performance and Reliability</h3>
        <p>
          We prioritize responsive page layouts, efficient resource utilization, and a consistent experience across supported devices. Performance optimization includes reducing unnecessary JavaScript execution, improving loading behavior, and evaluating key user-experience metrics such as Core Web Vitals.
        </p>
        <p>
          Our objective is to make music discovery and navigation convenient for users across a range of devices and network conditions.
        </p>

        <p style={{ marginTop: '32px', fontWeight: 600, fontSize: '1.15rem', color: '#ffffff' }}>
          FreeSong.in — Discover music. Explore new sounds. Make every listening session your own.
        </p>
      </div>
    </LegalLayout>
  );
}
