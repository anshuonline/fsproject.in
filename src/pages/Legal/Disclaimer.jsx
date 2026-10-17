import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Info, Globe, Scale, ListMusic } from 'lucide-react';

const link = { color: 'var(--color-primary)' };

export function Disclaimer() {
  return (
    <LegalLayout
      badge="TRANSPARENCY & DISCLOSURE"
      title="Disclaimer"
      subtitle="This Disclaimer explains the nature of the FreeSong.in service, how content is delivered, and the limits of our responsibility. We publish it openly because we believe an honest platform is a trustworthy platform."
    >
      <div className="fs-legal-section">
        <h2>1. General Information</h2>
        <p>
          The information and features provided by <strong>FreeSong.in</strong> are offered in good faith and for general informational and entertainment purposes only. While we work hard to keep the platform accurate, fast, and reliable, we make no representation or warranty of any kind — express or implied — regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or content on the Service.
        </p>
        <p>
          Your use of the Service and any reliance you place on its content is strictly at your own risk. FreeSong.in will not be liable for any loss or damage connected to the use of our website.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Nature of the Service</h2>
        <p>
          FreeSong.in is an independent <strong>music discovery and playback interface</strong>. It is important to understand exactly what the Service is — and what it is not:
        </p>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListMusic size={16} color="var(--color-primary)" />
              A Discovery Layer
            </span>
            <span className="fs-legal-card-desc">
              We help you find, organize, and enjoy music through search, curated charts, artist pages, and personalized recommendations.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} color="var(--color-primary)" />
              An Embedded Player Interface
            </span>
            <span className="fs-legal-card-desc">
              All playback is streamed from official third-party embedded players — principally the YouTube IFrame Player — provided publicly by the platform to any website.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={16} color="var(--color-primary)" />
              Not a File Host or Distributor
            </span>
            <span className="fs-legal-card-desc">
              We do not host, upload, store, convert, or distribute audio or video files. No media content of any kind resides on FreeSong.in servers.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} color="var(--color-primary)" />
              Not Affiliated with Third Parties
            </span>
            <span className="fs-legal-card-desc">
              FreeSong.in is not affiliated with, endorsed by, or sponsored by YouTube, Google, or any record label or artist unless expressly stated.
            </span>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>3. Third-Party Content & Rights</h2>
        <p>
          All songs, recordings, compositions, album artwork, artist photographs, and trademarks displayed or made playable through the Service remain the exclusive property of their respective owners. FreeSong.in claims no ownership of third-party content and displays it solely through official interfaces and public metadata.
        </p>
        <p>
          Playbacks initiated through the Service occur on the third-party platform's own terms, and any monetization or royalties are handled by that platform and the rights holders under their existing systems. Rights holders retain full control: removing or restricting a video on the source platform automatically removes it from FreeSong.in.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. External Links Disclaimer</h2>
        <p>
          The Service may contain links to external websites that are not provided or maintained by, or in any way affiliated with, FreeSong.in. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites. Links are provided for user convenience and do not constitute endorsement.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>5. Accuracy of Metadata & Lyrics</h2>
        <p>
          Track titles, artist names, album artwork, charts, recommendations, and lyrics surfaced on FreeSong.in are derived from public APIs and may occasionally be incomplete, outdated, or inaccurate. We make reasonable efforts to filter spam and correct errors, but we cannot warrant that all metadata is correct. If you spot an error, we would genuinely appreciate a report via <a href="/contact" style={link}>our contact page</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>6. No Professional Advice</h2>
        <p>
          Nothing on FreeSong.in constitutes legal, financial, or professional advice. Commentary on music, charts, or artists reflects general editorial and algorithmic curation and should not be relied upon as a substitute for professional guidance.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Errors, Omissions & Availability</h2>
        <p>
          The Service may experience downtime, feature changes, or removal of specific content due to third-party availability, regional restrictions, or technical maintenance. We do not commit to uninterrupted availability of any specific song, album, artist page, or feature, and we are not liable for any inconvenience arising from such unavailability.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>8. Advertising Disclosure</h2>
        <p>
          FreeSong.in is free to use and may be supported by advertising, including ads served through Google AdSense. Advertisements are clearly distinguishable from editorial content, and we do not hand-edit ad content. See our <a href="/privacy" style={link}>Privacy Policy</a> for details on advertising cookies and your opt-out choices.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>9. Consent & Changes</h2>
        <p>
          By using our website, you hereby consent to this Disclaimer and agree to its terms. We may update this Disclaimer from time to time; the revision date at the top of this page will always reflect the current version.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>10. Contact Us</h2>
        <p>
          If you require clarification about anything on this page, or if you are a rights holder with a concern, we welcome your message:
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            General & Support: <a href="mailto:support@freesong.in" style={link}>support@freesong.in</a><br />
            Legal & Copyright: <a href="mailto:dmca@freesong.in" style={link}>dmca@freesong.in</a><br />
            Contact Form: <a href="/contact" style={link}>freesong.in/contact</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
