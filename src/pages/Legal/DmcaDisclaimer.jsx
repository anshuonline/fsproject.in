import React from 'react';
import { LegalLayout } from './LegalLayout';
import { ShieldAlert, Mail, CheckCircle2 } from 'lucide-react';

export function DmcaDisclaimer() {
  return (
    <LegalLayout
      badge="COPYRIGHT & DMCA SAFE HARBOR COMPLIANCE"
      title="DMCA Copyright & Disclaimer Policy"
      subtitle="FreeSong.in respects intellectual property rights and adheres strictly to the Digital Millennium Copyright Act (17 U.S.C. § 512)."
    >
      <div className="fs-legal-section">
        <h2>1. Important Copyright Notice & Architecture</h2>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>Zero File Hosting Disclosure:</strong> FreeSong.in does <u>NOT</u> host, upload, store, convert, or distribute any copyrighted MP3, AAC, audio, or video files on its servers.
          </p>
        </div>
        <p>
          FreeSong.in functions strictly as a modern index, search interface, and player client utilizing the official, publicly accessible <strong>YouTube IFrame Player API</strong> and <strong>YouTube API Services</strong>.
        </p>
        <p>
          All audio playback occurs through standard embedded YouTube player instances authorized by the respective copyright holders and publishers. Monetization and royalties from embedded playback are managed directly by YouTube and the associated rights holders through YouTube's Content ID and partner ecosystem.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. DMCA Safe Harbor Compliance (17 U.S.C. § 512)</h2>
        <p>
          It is the policy of FreeSong.in to expeditiously respond to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act ("DMCA"). If you are a copyright owner or an agent thereof and believe that any content linked or indexed on our site infringes upon your copyright, you may submit a notification pursuant to the DMCA.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>3. How to Submit a DMCA Takedown Notice</h2>
        <p>
          To expedite our review process, your DMCA notification must include the following information in writing:
        </p>
        <ol>
          <li>
            <strong>Physical or electronic signature</strong> of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
          </li>
          <li>
            <strong>Identification of the copyrighted work</strong> claimed to have been infringed, or a representative list of such works.
          </li>
          <li>
            <strong>Identification of the material</strong> that is claimed to be infringing, including the specific URL or FreeSong.in link where the material appears.
          </li>
          <li>
            <strong>Sufficient contact information</strong>, including your full legal name, physical address, telephone number, and email address.
          </li>
          <li>
            <strong>A statement</strong> that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
          </li>
          <li>
            <strong>A statement</strong> that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
          </li>
        </ol>
      </div>

      <div className="fs-legal-section">
        <h2>4. Designated Copyright Agent</h2>
        <p>
          Please send all DMCA notices and copyright communications to our Designated Copyright Agent:
        </p>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="var(--color-primary)" />
              DMCA Notice Desk
            </span>
            <span className="fs-legal-card-desc">
              Dedicated email for copyright owners and official representatives. Reviewed within 24–48 business hours.
            </span>
            <a href="mailto:dmca@freesong.in" className="fs-legal-card-link">
              dmca@freesong.in
            </a>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} color="var(--color-primary)" />
              YouTube Direct Takedowns
            </span>
            <span className="fs-legal-card-desc">
              Since all media originates from YouTube, filing a takedown on YouTube directly will automatically de-list the content from FreeSong.in.
            </span>
            <a
              href="https://www.youtube.com/copyright_complaint_form"
              target="_blank"
              rel="noopener noreferrer"
              className="fs-legal-card-link"
            >
              YouTube Copyright Portal →
            </a>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>5. Repeat Infringer Policy</h2>
        <p>
          In accordance with the DMCA and other applicable law, FreeSong.in maintains a strict policy of terminating or blacklisting queries, tags, and indexing for repeat infringers in appropriate circumstances.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>6. General Disclaimer</h2>
        <p>
          The materials on FreeSong.in are provided for entertainment and informational purposes only. FreeSong.in makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
        </p>
      </div>
    </LegalLayout>
  );
}
