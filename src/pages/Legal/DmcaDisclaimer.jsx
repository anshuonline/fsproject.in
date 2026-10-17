import React from 'react';
import { LegalLayout } from './LegalLayout';

export function DmcaDisclaimer() {
  const currentMonthYear = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <LegalLayout
      badge="COPYRIGHT & DMCA COMPLIANCE"
      title="DMCA & Copyright Policy | FreeSong.in"
      subtitle="FreeSong strictly respects the intellectual property rights of artists, record labels, composers, and copyright owners, maintaining an expedited notice-and-takedown procedure."
    >
      <div className="fs-legal-section">
        <h2>DMCA & Copyright Policy</h2>
        <p>
          <strong>Effective Date:</strong> {currentMonthYear}<br />
          <strong>Last Updated:</strong> {currentMonthYear}
        </p>

        <p>
          FreeSong ("we", "us", "our") strictly respects the intellectual property rights of artists, record labels, composers, and copyright owners, and we expect all users of our platform to do the same. In compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512), EU Copyright Directives, and applicable international copyright laws, we maintain an expedited notice-and-takedown procedure.
        </p>

        <h3>1. Platform Architecture & Safe Harbor Notice</h3>
        <p>
          FreeSong operates as an online discovery index, search aggregator, and media player interface. <strong>FreeSong does not host, upload, or store copyrighted sound recordings or media files on its servers.</strong> Audio and multimedia content streamed through FreeSong is delivered dynamically from third-party public web sources and media providers.
        </p>
        <p>
          Because media files are hosted on external third-party services, removing or restricting access on the source platform automatically eliminates availability across FreeSong. However, we take all copyright concerns seriously and will promptly disable access to allegedly infringing content on our search index upon receiving a valid notification.
        </p>

        <h3>2. 24-Hour Expedited Takedown Response</h3>
        <p>
          We are committed to reviewing and processing all valid, complete DMCA takedown notices within <strong>24 hours of receipt</strong>. We do not delay or contest legitimate claims submitted by verified copyright holders or their authorized legal representatives.
        </p>

        <h3>3. Submitting a DMCA Takedown Notice</h3>
        <p>
          To file a legally binding takedown notice with our designated copyright agent, please provide a written communication containing the following statutory details:
        </p>
        <ul className="feature-list">
          <li><strong>1. Contact Information:</strong> Your full legal name, company or organization (if applicable), mailing address, telephone number, and an active email address.</li>
          <li><strong>2. Identification of Copyrighted Work:</strong> A clear description of the copyrighted sound recording, musical composition, or album claimed to have been infringed, including registration numbers if available.</li>
          <li><strong>3. Location of Infringing Material:</strong> The exact FreeSong URL(s), search query, or track identifier sufficient to allow our team to locate and disable the specific material on our platform.</li>
          <li><strong>4. Good Faith Statement:</strong> The statement: <em>"I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</em></li>
          <li><strong>5. Statement of Accuracy:</strong> The statement: <em>"I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or an agent authorized to act on behalf of the owner of an exclusive right that is allegedly infringed."</em></li>
          <li><strong>6. Authorized Signature:</strong> A physical or electronic signature of the copyright owner or an authorized representative (typing your full legal name is legally sufficient for email submissions).</li>
        </ul>

        <h3>4. Designated Copyright Agent</h3>
        <p>Please send all formal copyright notices and DMCA communications directly to our designated team:</p>
        <div className="contact-card">
          <p><strong>Primary DMCA Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p><strong>Secondary Support Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p><strong>Platform:</strong> FreeSong (<a href="https://freesong.in">https://freesong.in</a>)</p>
        </div>

        <h3>5. Counter-Notification Procedure</h3>
        <p>
          If you believe that material you submitted or curated was removed or disabled as a result of mistake or misidentification, you may submit a formal counter-notification to our copyright agent containing your contact details, identification of the removed material, a statement under penalty of perjury of good-faith belief of error, and consent to legal jurisdiction.
        </p>

        <h3>6. Repeat Infringer Policy</h3>
        <p>
          In accordance with Section 512(i) of the DMCA and applicable global copyright laws, FreeSong enforces a strict policy that provides for the termination, in appropriate circumstances, of access, accounts, or services of users who are found to be repeat copyright infringers.
        </p>
      </div>
    </LegalLayout>
  );
}
