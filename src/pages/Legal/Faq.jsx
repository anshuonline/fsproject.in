import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function Faq() {
  return (
    <LegalLayout
      badge="HELP & FAQ"
      title="Frequently Asked Questions - FreeSong.in"
      subtitle="Find answers to common questions about FreeSong.in, including music playback, browser storage, offline functionality, shared listening features, and user privacy."
    >
      <div className="fs-legal-section">
        <h2>Frequently Asked Questions</h2>
        <p>
          Find answers to common questions about FreeSong.in, including music playback, browser storage, offline functionality, shared listening features, and user privacy. This section helps you understand how the platform works and what to expect while using its services.
        </p>

        <div className="faq-item">
          <h3>Does FreeSong.in play audio advertisements?</h3>
          <p>
            FreeSong.in aims to provide a music-focused listening experience without disruptive audio advertisements inserted into playback. Display advertising may be used on certain website pages to support platform operations. The availability and behavior of advertisements depend on the relevant page and service implementation.
          </p>
        </div>

        <div className="faq-item">
          <h3>Where are my favorites and listening preferences saved?</h3>
          <p>
            Depending on the features you use, selected preferences, favorites, and playlist information may be retained using browser storage or other supported storage mechanisms. This can help preserve your settings between visits. Clearing browser data may remove locally stored information, and availability across different devices depends on whether account-based synchronization is implemented.
          </p>
        </div>

        <div className="faq-item">
          <h3>Can I listen to music without an internet connection?</h3>
          <p>
            Offline access depends on the content source and the functionality supported by FreeSong.in. Browser caching may retain certain website resources for faster loading, but this does not necessarily mean complete music tracks are available offline. Full offline playback requires an implemented caching mechanism and permission to store and play the relevant audio content.
          </p>
        </div>

        <div className="faq-item">
          <h3>How do shared listening features work?</h3>
          <p>
            Where available, shared listening tools allow users to coordinate music playback through a common session or shared link. Depending on the implemented features, users can manage playback while other participants follow the session. Synchronization accuracy and available controls depend on network conditions, the playback source, and technical implementation.
          </p>
        </div>

        <div className="faq-item">
          <h3>How can I report an issue or recommend an improvement?</h3>
          <p>
            We welcome suggestions, technical feedback, and reports of problems that affect your experience. To contact the FreeSong.in team, email <a href="mailto:support@freesong.in">support@freesong.in</a> or visit our <Link to="/contact">Contact Page</Link>. Please include a brief description of the issue and the device or browser involved when relevant.
          </p>
        </div>

        <div className="faq-item">
          <h3>Why is a music or video preview unavailable?</h3>
          <p>
            Playback or preview problems can occur because of network interruptions, browser compatibility, regional restrictions, or limitations imposed by the content provider. Try refreshing the page, checking your internet connection, or opening the content again after a short interval. Some tracks may be unavailable in certain locations or may no longer be accessible through their original source.
          </p>
        </div>

        <div className="faq-item">
          <h3>How does FreeSong.in protect my personal information?</h3>
          <p>
            We aim to handle personal information responsibly and collect only the information necessary for the platform's supported functions. If Google Sign-In is available, basic account information may be processed for authentication. Personal information is handled according to our applicable data practices and privacy commitments.
          </p>
          <p style={{ marginTop: '10px' }}>
            For details about the information we collect, how it is used, and the choices available to you, please read our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <div className="contact-card" style={{ marginTop: '32px' }}>
          <h3>Still have questions?</h3>
          <p>
            Contact us at <a href="mailto:support@freesong.in">support@freesong.in</a> or visit our <Link to="/contact">Contact Page</Link> for assistance.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
