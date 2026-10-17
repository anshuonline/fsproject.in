import React from 'react';
import { LegalLayout } from './LegalLayout';

export function Disclaimer() {
  const currentMonthYear = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <LegalLayout
      badge="TRANSPARENCY & DISCLOSURE"
      title="Legal Disclaimer | FreeSong.in"
      subtitle="Please read this disclaimer carefully before using FreeSong (freesong.in) or our Progressive Web Application."
    >
      <div className="fs-legal-section">
        <h2>Legal Disclaimer</h2>
        <p>
          <strong>Effective Date:</strong> {currentMonthYear}<br />
          <strong>Last Updated:</strong> {currentMonthYear}
        </p>

        <p>
          Please read this disclaimer carefully before using FreeSong (<a href="https://freesong.in">freesong.in</a>) or our Progressive Web Application. By accessing or using our Service, you acknowledge and agree to the terms described below.
        </p>

        <h3>1. Platform Purpose & Informational Usage</h3>
        <p>
          FreeSong is engineered as an online music discovery, personal listening, and playlist organization interface. It is not intended to replace commercial music distribution platforms, licensing houses, or official record releases. We strongly encourage all music listeners to support artists, composers, and bands by purchasing original music, attending live concerts, and subscribing to official artist merchandise channels.
        </p>

        <h3>2. Third-Party Media Content & External Providers</h3>
        <p>
          <strong>FreeSong does not host, upload, store, or re-encode audio or video files on its servers.</strong> Media streams, metadata, preview soundbites, album artwork, and lyrical data accessible through FreeSong originate from independent third-party services and public web sources.
        </p>
        <p>
          FreeSong claims zero ownership over third-party multimedia content. All sound recordings, musical works, visual assets, and trademarks belong exclusively to their respective copyright holders. FreeSong exercises no editorial control over content hosted on external networks. If material is removed or modified on the source provider, it becomes automatically unavailable on FreeSong.
        </p>

        <h3>3. Non-Affiliation Notice</h3>
        <p>
          FreeSong is an independent project and is not affiliated with, endorsed by, sponsored by, or officially associated with any commercial streaming platforms, media corporations, or record labels. All product and company names are trademarks or registered trademarks of their respective holders. Their reference on FreeSong is strictly for identification and compatibility purposes.
        </p>

        <h3>4. "Zero Audio Ads" Clarification</h3>
        <p>
          Our commitment to "Zero Audio Ads" means that FreeSong will never inject audio commercial breaks, vocal promos, or sponsor interruptions into your music sessions. The platform is supported solely through non-intrusive visual display advertisements on the website to help offset server hosting and bandwidth costs.
        </p>

        <h3>5. Editorial Content & Music Guides</h3>
        <p>
          Articles, blog posts, workout music breakdowns, lyrics analyses, and listening guides published on FreeSong are provided solely for educational, cultural, and recreational purposes. They represent the independent opinions and analyses of our editorial team and should not be construed as professional, legal, or commercial advice.
        </p>

        <h3>6. No Warranties & Service Continuity</h3>
        <p>
          FreeSong is provided on an "as is" and "as available" basis without warranties of any kind. While we strive to maintain high uptime and seamless playback, the continuous operation of FreeSong depends upon external web sources and network infrastructure. We do not guarantee uninterrupted access, absence of technical errors, or permanent catalog availability.
        </p>

        <h3>7. Limitation of Liability</h3>
        <p>
          To the fullest extent permitted by applicable law, FreeSong, its operators, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service, including mobile cellular data charges, device compatibility issues, or third-party service modifications.
        </p>

        <h3>8. Acceptance & Inquiries</h3>
        <p>
          By using FreeSong, you signify your full acceptance of this Disclaimer. If you do not agree with any portion of this disclaimer, you must discontinue your use of the Service immediately. For any inquiries, reach out to us at <a href="mailto:support@freesong.in">support@freesong.in</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
