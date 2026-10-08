import React from 'react';
import { LegalLayout } from './LegalLayout';

export function TermsOfService() {
  return (
    <LegalLayout
      badge="USER AGREEMENT & POLICIES"
      title="Terms of Service"
      subtitle="Please read these Terms of Service carefully before accessing or using FreeSong.in. By using the platform, you agree to comply with all terms stated herein."
    >
      <div className="fs-legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using <strong>FreeSong.in</strong> (the "Service"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you disagree with any part of these terms, you are prohibited from using or accessing this site.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Permitted Use & Service Nature</h2>
        <p>
          FreeSong.in is an online music indexing, discovery, and web player platform designed to provide users with legal, embedded music streaming via legitimate third-party APIs.
        </p>
        <p>
          You agree to use FreeSong.in only for lawful, personal, non-commercial purposes. You may not:
        </p>
        <ul>
          <li>Use automated scripts, bots, spiders, or scrapers to extract audio files, data, or stream tokens.</li>
          <li>Circumvent or attempt to disable any security, DRM, or access controls.</li>
          <li>Rip, download, capture, re-broadcast, or commercially redistribute audio streams provided through the Service.</li>
          <li>Interfere with the normal operation, server capacity, or user experience of other users.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>3. Third-Party Services & Content Disclaimer</h2>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>YouTube API Compliance Notice:</strong> FreeSong.in utilizes the YouTube API Services to display track information, search queries, and stream authorized audio via standard YouTube embedded playback.
          </p>
        </div>
        <p>
          All audio, video, album artwork, and artist metadata displayed or streamed via FreeSong.in remain the property and copyright of their respective owners and content distributors. FreeSong.in does not claim ownership over any third-party intellectual property.
        </p>
        <p>
          By using FreeSong.in, you acknowledge and agree that content is hosted on YouTube servers and is governed by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>YouTube Terms of Service</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. Intellectual Property Rights</h2>
        <p>
          The FreeSong.in name, logo, custom user interface design tokens, proprietary CSS frameworks, algorithmic recommendation engine, and client-side code are the exclusive intellectual property of FreeSong.in. You may not copy, reverse engineer, or redistribute our platform code without express prior written consent.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>5. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. FreeSong.in makes no warranties, expressed or implied, regarding:
        </p>
        <ul>
          <li>Uninterrupted or error-free streaming availability.</li>
          <li>Accuracy, reliability, or completeness of lyrics and track metadata.</li>
          <li>Availability of specific songs or artists in every geographic region.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall FreeSong.in, its directors, developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Termination of Access</h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>8. Governing Law & Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>9. Contact Information</h2>
        <p>
          For inquiries or clarifications regarding these Terms of Service, please contact us at:
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            Email: <a href="mailto:legal@freesong.in" style={{ color: 'var(--color-primary)' }}>legal@freesong.in</a><br />
            General Support: <a href="mailto:support@freesong.in" style={{ color: 'var(--color-primary)' }}>support@freesong.in</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
