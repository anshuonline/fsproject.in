import React from 'react';
import { LegalLayout } from './LegalLayout';

const link = { color: 'var(--color-primary)' };

export function TermsOfService() {
  return (
    <LegalLayout
      badge="USER AGREEMENT & POLICIES"
      title="Terms of Service"
      subtitle="These Terms of Service form a binding agreement between you and FreeSong.in. Please read them carefully. By accessing or using the website, you confirm that you accept these Terms in full."
    >
      <div className="fs-legal-section">
        <h2>1. Agreement to These Terms</h2>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the website <strong>FreeSong.in</strong> (the "Service"), including all pages, features, and content made available through it. By creating an account, browsing, streaming, or otherwise using the Service in any way, you agree to be bound by these Terms and our <a href="/privacy" style={link}>Privacy Policy</a>.
        </p>
        <p>
          If you do not agree to all of these Terms, you must immediately stop using the Service. By using the Service, you represent that you are at least 13 years of age (or the minimum legal age in your jurisdiction) and that you have the legal capacity to enter into this agreement.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Description of the Service</h2>
        <p>
          FreeSong.in is a free, web-based music discovery and streaming interface. The Service allows visitors to search for songs, albums, and artists; browse curated charts and collections; view track information and synced lyrics; and play music through officially supported embedded third-party players — principally the YouTube IFrame Player.
        </p>
        <p>
          FreeSong.in is an independent platform. It is not affiliated with, endorsed by, or sponsored by YouTube, Google, or any record label or artist unless expressly stated.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>3. Accounts & Registration</h2>
        <ul>
          <li>You may use core features of the Service without an account. Some features, such as syncing playlists and liked songs across devices, require a free registered account.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</li>
          <li>You agree to provide accurate, current, and complete information during registration and to keep it up to date.</li>
          <li>You must notify us immediately at <a href="mailto:support@freesong.in" style={link}>support@freesong.in</a> if you suspect any unauthorized use of your account.</li>
          <li>We reserve the right to refuse registration, suspend, or terminate any account that violates these Terms or applicable law.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>4. Acceptable Use Policy</h2>
        <p>
          You agree to use the Service only for lawful, personal, non-commercial purposes. When using FreeSong.in, you must not:
        </p>
        <ul>
          <li>Use automated systems — including bots, spiders, scrapers, or offline readers — to access the Service in a manner that sends more request traffic than a human could reasonably produce, or to extract audio, metadata, or stream tokens.</li>
          <li>Attempt to rip, download, capture, record, re-broadcast, extract, or redistribute audio or video streams delivered through the Service, or circumvent any technical protection measures, DRM, or access controls.</li>
          <li>Interfere with, disrupt, or attempt to gain unauthorized access to the Service, its servers, or connected networks, including through denial-of-service attacks or vulnerability probing.</li>
          <li>Use the Service to upload, transmit, or distribute malware, spam, misleading content, or material that is unlawful, defamatory, harassing, or infringing.</li>
          <li>Misrepresent your identity or affiliation, or use the Service on behalf of another person without authorization.</li>
          <li>Resell, sublicense, or commercially exploit access to the Service without our prior written consent.</li>
        </ul>
        <p>
          Any conduct that violates this Acceptable Use Policy may result in immediate suspension or termination of access, in addition to any other remedies available under law.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>5. Third-Party Content & Services</h2>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>Transparency Notice:</strong> All music streamed through FreeSong.in is delivered via official third-party embedded players, primarily the YouTube IFrame Player API. FreeSong.in does not host, upload, or store any media files on its own servers.
          </p>
        </div>
        <p>
          All audio recordings, compositions, album artwork, artist images, and related metadata remain the property of their respective copyright owners, publishers, and rights holders. Nothing in these Terms transfers any ownership rights in third-party content to you.
        </p>
        <p>
          Your use of third-party embedded content is additionally governed by the respective providers' terms, including the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={link}>YouTube Terms of Service</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>Google Privacy Policy</a>. We are not responsible for the availability, accuracy, or practices of any third-party service.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>6. Intellectual Property</h2>
        <p>
          The FreeSong.in name, logo, trade dress, user interface design, design token system, source code, recommendation features, and original content are the exclusive property of FreeSong.in and are protected by applicable intellectual property laws. You may not copy, modify, reverse engineer, decompile, or create derivative works from any part of the Service without our express prior written consent.
        </p>
        <p>
          You are granted a limited, revocable, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes, strictly in accordance with these Terms.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Advertising</h2>
        <p>
          The Service is supported in part by advertising, which may include ads served by Google AdSense and other partners. By using the Service, you agree that advertisements may be displayed alongside content. You may manage ad personalization preferences through the controls described in our <a href="/privacy" style={link}>Privacy Policy</a> and <a href="/cookie-policy" style={link}>Cookie Policy</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis, without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Without limiting the foregoing, FreeSong.in does not warrant that:
        </p>
        <ul>
          <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
          <li>Any specific song, album, artist, or feature will be available in your region or at all.</li>
          <li>Lyrics, track metadata, charts, or recommendations will be accurate, complete, or reliable.</li>
          <li>Any defects or errors will be corrected.</li>
        </ul>
        <p>
          For a full statement of limitations regarding content, see our <a href="/disclaimer" style={link}>Disclaimer</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall FreeSong.in, its owners, developers, or affiliates be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages — including loss of profits, data, goodwill, or other intangible losses — arising out of or in connection with your use of, or inability to use, the Service.
        </p>
        <p>
          In jurisdictions where exclusions of certain warranties or liabilities are not permitted, our liability shall be limited to the smallest amount permitted by law, and in no event shall our aggregate liability exceed the amount (if any) you paid us in the twelve (12) months preceding the claim.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless FreeSong.in and its owners, developers, and affiliates from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in any way connected with your use of the Service, your violation of these Terms, or your violation of any third-party right, including any intellectual property or privacy right.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>11. Copyright & Takedown Policy</h2>
        <p>
          FreeSong.in respects the intellectual property rights of others and responds promptly to valid notices of alleged infringement. If you believe content accessible via the Service infringes your copyright, please follow the procedure described in our <a href="/dmca" style={link}>DMCA & Copyright Policy</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>12. Suspension & Termination</h2>
        <p>
          We reserve the right, at our sole discretion, to suspend, limit, or terminate your access to all or part of the Service — with or without notice — for any conduct that we, in our reasonable judgment, believe violates these Terms, harms other users, or exposes FreeSong.in to legal liability. Upon termination, the license granted to you under these Terms ceases immediately.
        </p>
        <p>
          You may stop using the Service and delete your account at any time. Provisions that by their nature should survive termination (including intellectual property, disclaimers, liability limits, and indemnification) shall survive.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>13. Modifications to the Service & These Terms</h2>
        <p>
          We continuously improve the Service and may add, change, or remove features at any time. We may also revise these Terms from time to time. When we do, we will update the "Last Updated" date at the top of this page. Material changes may also be announced within the Service. Your continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>14. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India, without regard to conflict-of-law principles. You and FreeSong.in agree to attempt good-faith resolution of any dispute before pursuing formal action, and you submit to the personal jurisdiction of the courts located in India for any proceedings arising from these Terms or your use of the Service.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>15. Severability & Entire Agreement</h2>
        <p>
          If any provision of these Terms is held to be unenforceable or invalid, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will remain in full force and effect. These Terms, together with our <a href="/privacy" style={link}>Privacy Policy</a>, <a href="/cookie-policy" style={link}>Cookie Policy</a>, <a href="/dmca" style={link}>DMCA Policy</a>, and <a href="/disclaimer" style={link}>Disclaimer</a>, constitute the entire agreement between you and FreeSong.in regarding the Service and supersede any prior understandings.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>16. Contact Information</h2>
        <p>
          Questions about these Terms of Service can be directed to:
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>FreeSong.in — Legal & Compliance</strong><br />
            Legal: <a href="mailto:legal@freesong.in" style={link}>legal@freesong.in</a><br />
            Support: <a href="mailto:support@freesong.in" style={link}>support@freesong.in</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
