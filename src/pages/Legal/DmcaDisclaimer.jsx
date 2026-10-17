import React from 'react';
import { LegalLayout } from './LegalLayout';
import { ShieldAlert, Mail, ExternalLink, FileSearch } from 'lucide-react';

const link = { color: 'var(--color-primary)' };

export function DmcaDisclaimer() {
  return (
    <LegalLayout
      badge="COPYRIGHT & DMCA COMPLIANCE"
      title="DMCA & Copyright Policy"
      subtitle="FreeSong.in respects the intellectual property rights of artists, labels, publishers, and rights holders worldwide, and we respond promptly to valid notices under the Digital Millennium Copyright Act (17 U.S.C. § 512)."
    >
      <div className="fs-legal-section">
        <h2>1. Our Commitment to Copyright</h2>
        <p>
          FreeSong.in has been built as a music <strong>discovery and playback interface</strong>, not a distribution platform. We believe creators deserve to be paid for their work, and our architecture is deliberately designed to respect that principle.
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>Hosting Disclosure:</strong> FreeSong.in does <u>not</u> host, upload, store, convert, transcode, or distribute any audio or video files on its own servers. All playback is delivered through the official, publicly available <strong>YouTube IFrame Player API</strong> and <strong>YouTube Data API Services</strong>, exactly as YouTube provides them to any website.
          </p>
        </div>
        <p>
          Because all media streams directly from YouTube's own servers and players, royalties and monetization from every playback are handled by YouTube and the respective rights holders through YouTube's established partner and Content ID systems. When an artist, label, or publisher earns revenue on YouTube, that same economy applies to playback initiated from FreeSong.in.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. How Content Appears on FreeSong.in</h2>
        <p>
          For full transparency, content reaches our platform through these channels only:
        </p>
        <ul>
          <li><strong>Public metadata lookups:</strong> titles, artwork, durations, and artist information retrieved via the official YouTube Data API for publicly listed videos.</li>
          <li><strong>Official embedded playback:</strong> audio is played only through YouTube's standard IFrame embed, which rights holders can disable or restrict at any time from their own YouTube Studio settings.</li>
          <li><strong>Algorithmic radio & charts:</strong> playback queues sourced from YouTube Music's public chart endpoints and official radio queue APIs.</li>
        </ul>
        <p>
          If a rights holder restricts or removes a video on YouTube, it automatically becomes unavailable on FreeSong.in as well. There is no separate copy to remove on our side.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>3. Filing a DMCA Takedown Notice</h2>
        <p>
          If you are a copyright owner, or authorized to act on behalf of one, and you believe content indexed or made playable through FreeSong.in infringes your copyright, please submit a written notification that includes <strong>all</strong> of the following elements, as required by 17 U.S.C. § 512(c)(3):
        </p>
        <ol>
          <li>A <strong>physical or electronic signature</strong> of the copyright owner or a person authorized to act on their behalf.</li>
          <li><strong>Identification of the copyrighted work</strong> claimed to have been infringed, or a representative list if multiple works are involved.</li>
          <li><strong>Identification of the material</strong> claimed to be infringing, including the specific FreeSong.in URL(s) and, where applicable, the underlying YouTube video URL(s), sufficient for us to locate it.</li>
          <li>Your <strong>full contact information</strong>: legal name, mailing address, telephone number, and email address.</li>
          <li>A statement of <strong>good-faith belief</strong> that the identified use is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement, <strong>made under penalty of perjury</strong>, that the information in your notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
        </ol>
        <p>
          Notices that are incomplete, illegible, or sent to the wrong address may delay processing. Complete notices sent to the designated agent below are typically reviewed within <strong>24–48 business hours</strong>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. Our Response to Valid Notices</h2>
        <p>
          Upon receiving a complete and valid DMCA notice, we will:
        </p>
        <ul>
          <li>Remove or permanently de-index the identified material from FreeSong.in search, charts, and recommendation surfaces.</li>
          <li>Document the notice in our internal compliance log.</li>
          <li>Notify the affected party (where applicable) of the action taken.</li>
        </ul>
        <p>
          If you are the subject of a DMCA notice and believe your material was removed by mistake or misidentification, you may submit a <strong>counter-notification</strong> containing your signature, identification of the removed material and its prior location, a statement under penalty of perjury that you have a good-faith belief the removal was a mistake, and your consent to the jurisdiction of the appropriate court. Valid counter-notifications will be processed in accordance with 17 U.S.C. § 512(g).
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>5. Designated DMCA Agent</h2>
        <p>
          Please send all copyright notices, counter-notifications, and related correspondence to our designated agent:
        </p>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="var(--color-primary)" />
              DMCA Notice Desk
            </span>
            <span className="fs-legal-card-desc">
              Dedicated channel for copyright owners and their authorized representatives. Every notice is acknowledged and reviewed within 24–48 business hours.
            </span>
            <a href="mailto:dmca@freesong.in" className="fs-legal-card-link">
              dmca@freesong.in
            </a>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="var(--color-primary)" />
              YouTube Direct Removal
            </span>
            <span className="fs-legal-card-desc">
              Fastest option: since all media originates from YouTube, filing a copyright takedown directly with YouTube removes the source video — and it immediately disappears from FreeSong.in too.
            </span>
            <a
              href="https://www.youtube.com/copyright_complaint_form"
              target="_blank"
              rel="noopener noreferrer"
              className="fs-legal-card-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              YouTube Copyright Portal <ExternalLink size={12} />
            </a>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSearch size={16} color="var(--color-primary)" />
              Content Verification
            </span>
            <span className="fs-legal-card-desc">
              Rights holders can request a report of the FreeSong.in URLs referencing their works to verify coverage before filing.
            </span>
            <a href="mailto:dmca@freesong.in?subject=Content%20Verification%20Request" className="fs-legal-card-link">
              Request a URL Report
            </a>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>6. Repeat Infringer Policy</h2>
        <p>
          In accordance with the DMCA and other applicable laws, FreeSong.in maintains and enforces a policy under which users, queries, tags, and indexing patterns associated with repeated infringement are permanently blacklisted from our platform. We keep records of all valid takedown notices and act on repeat activity in appropriate circumstances.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Misuse of the DMCA Process</h2>
        <p>
          Please note that under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing — or was removed by mistake — may be liable for damages, including costs and legal fees. We ask that all notices be submitted in good faith and verified before filing.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>8. General Legal Notice</h2>
        <p>
          This DMCA Policy forms part of our <a href="/terms" style={link}>Terms of Service</a> and should be read together with our <a href="/disclaimer" style={link}>Disclaimer</a>. FreeSong.in operates as a service provider with respect to third-party content and asserts no claim of ownership over any third-party recordings, compositions, or artwork referenced on the platform.
        </p>
        <p>
          For non-copyright legal matters, contact <a href="mailto:legal@freesong.in" style={link}>legal@freesong.in</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
