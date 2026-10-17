import React from 'react';
import { LegalLayout } from './LegalLayout';

const link = { color: 'var(--color-primary)' };

export function PrivacyPolicy() {
  return (
    <LegalLayout
      badge="PRIVACY & DATA PROTECTION"
      title="Privacy Policy"
      subtitle="This Privacy Policy explains, in clear and simple language, what information FreeSong.in collects, why we collect it, and the rights and choices available to you. We are fully committed to transparency and to international data protection standards."
    >
      <div className="fs-legal-section">
        <h2>1. Introduction & Scope</h2>
        <p>
          Welcome to <strong>FreeSong.in</strong> (referred to as "FreeSong", "we", "our", or "us"). FreeSong.in is an online music discovery and streaming interface that lets visitors search, explore, and play music through officially supported third-party embedded players. This Privacy Policy applies to all visitors, registered users, and other individuals who interact with our website at <code>https://freesong.in</code> and any related subdomains, features, or services.
        </p>
        <p>
          By accessing or using FreeSong.in, you acknowledge that you have read and understood the practices described in this Privacy Policy. If you do not agree with any part of this policy, please discontinue use of the website.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Information We Collect</h2>
        <p>We deliberately keep data collection to a minimum. The information we handle falls into the following categories:</p>
        <h3>2.1 Information Collected Automatically</h3>
        <p>
          Like virtually all modern websites, our servers automatically record standard technical information when you visit. This may include your IP address, browser type and version, device type, operating system, referring page, pages visited, and the date and time of each request. This data is used strictly for security monitoring, abuse prevention, debugging, and aggregate traffic analytics.
        </p>
        <h3>2.2 Information Stored Locally on Your Device</h3>
        <p>
          FreeSong.in is privacy-first by design: your musical preferences — including selected genres, followed artists, liked songs, custom playlists, listening history, recently played items, and volume settings — are stored locally in your own browser using <code>localStorage</code>. This data <strong>never leaves your device</strong> unless you voluntarily create an account, and it is never sold, rented, or shared with third parties for their own purposes. For a detailed breakdown of everything stored on your device, please read our <a href="/cookie-policy" style={link}>Cookie & Local Storage Policy</a>.
        </p>
        <h3>2.3 Information You Voluntarily Provide</h3>
        <p>
          If you choose to create an account, subscribe to updates, or contact us through our contact form or by email, we receive the information you choose to provide — typically your name, email address, and the contents of your message. Providing this information is entirely voluntary; you can browse and stream music without an account.
        </p>
        <h3>2.4 Information from Third-Party Services</h3>
        <p>
          When you play music, the embedded third-party player (such as YouTube's IFrame Player) may collect technical playback data directly under that provider's own privacy policy. FreeSong.in does not receive, store, or process your Google or YouTube account credentials.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>3. How We Use Your Information</h2>
        <p>We use the limited information described above only to:</p>
        <ul>
          <li>Operate, maintain, and improve the FreeSong.in website and its features.</li>
          <li>Personalize your experience, such as remembering your playlists, likes, and playback preferences.</li>
          <li>Monitor for security threats, fraud, spam, and abuse of our infrastructure.</li>
          <li>Analyze aggregate usage trends so we can improve performance and content discoverability.</li>
          <li>Respond to your support requests, feedback, and legal inquiries.</li>
          <li>Comply with applicable legal obligations and enforce our <a href="/terms" style={link}>Terms of Service</a>.</li>
        </ul>
        <p>
          <strong>We do not sell your personal information.</strong> We do not use your data for profiling that goes beyond what is necessary to run the service, and we do not share it with third parties except as described in this policy.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. Legal Bases for Processing (GDPR)</h2>
        <p>
          For users in the European Economic Area (EEA), United Kingdom, and Switzerland, we process personal data only when we have a valid legal basis under the General Data Protection Regulation:
        </p>
        <ul>
          <li><strong>Legitimate interest:</strong> to secure and operate our website, prevent abuse, and understand aggregate usage.</li>
          <li><strong>Consent:</strong> for non-essential cookies and personalized advertising, where you are given a clear choice to accept or decline.</li>
          <li><strong>Contract:</strong> to provide the core service you request, such as playback and account features.</li>
          <li><strong>Legal obligation:</strong> to comply with applicable laws, court orders, and regulatory requirements.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>5. Cookies & Similar Technologies</h2>
        <p>
          FreeSong.in uses cookies and browser storage technologies to keep the site functional, remember your preferences, measure aggregate traffic, and support advertising. A full, itemized explanation of every cookie category we use — and simple instructions for controlling them — is available in our dedicated <a href="/cookie-policy" style={link}>Cookie & Local Storage Policy</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>6. Google AdSense & Advertising</h2>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>Advertising Disclosure:</strong> FreeSong.in may display advertising served through Google AdSense and other reputable advertising partners. Advertising revenue allows us to keep the service free for everyone.
          </p>
        </div>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies (including the DoubleClick cookie) enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
        </p>
        <p>You have complete control over personalized advertising:</p>
        <ul>
          <li>You may opt out of personalized advertising in Google Ads at <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={link}>adssettings.google.com</a>.</li>
          <li>You may opt out of third-party vendor cookies for personalized advertising at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={link}>aboutads.info</a> or <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" style={link}>optout.networkadvertising.org</a>.</li>
          <li>Users in the EEA and UK may manage their consent choices at any time through the consent banner shown on first visit, or via their browser settings.</li>
        </ul>
        <p>
          We do not control third-party ad servers and this Privacy Policy does not cover their practices. We encourage you to review the privacy policies of any advertising partners for more detail.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. YouTube API Services</h2>
        <p>
          FreeSong.in integrates with <strong>YouTube API Services</strong> and the YouTube IFrame Player API to deliver music playback, track metadata, and search functionality. This integration means:
        </p>
        <ul>
          <li>All audio and video content is streamed directly from YouTube's official embedded players.</li>
          <li>Your use of YouTube content through our site is also governed by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={link}>YouTube Terms of Service</a> and Google's <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>Privacy Policy</a>.</li>
          <li>FreeSong.in does not collect, store, or modify YouTube authentication credentials, and we never act on your YouTube account without your explicit action.</li>
          <li>Google may collect data about your interaction with embedded YouTube players. Refer to Google's own policies for details on how that data is used and protected.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>8. Analytics & Traffic Measurement</h2>
        <p>
          We use privacy-conscious, aggregate analytics to understand which pages and features are useful to visitors. Analytics data is used in aggregate form only and is not used to build individual profiles, identify individuals, or track users across other websites.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>9. Data Retention</h2>
        <p>
          Locally stored preferences (playlists, likes, history, settings) remain on your device until you clear your browser data or delete them from within the app. Server-side log data is retained only for as long as necessary for security and operational purposes, and is automatically deleted or anonymized thereafter. Messages you send us are retained for as long as needed to resolve your inquiry and to meet legal record-keeping obligations.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>10. Data Security</h2>
        <p>
          We apply industry-standard security measures appropriate to the nature of the data we handle, including encrypted connections (HTTPS/TLS) across the site, access controls on our infrastructure, and routine review of our systems. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. We do, nonetheless, take the protection of your data seriously and strive to use commercially acceptable means to safeguard it.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>11. Your Privacy Rights</h2>
        <h3>11.1 GDPR Rights (EEA, UK & Switzerland)</h3>
        <p>If you are located in the EEA, UK, or Switzerland, you have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Right of access:</strong> request copies of the personal data we hold about you.</li>
          <li><strong>Right to rectification:</strong> request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to erasure:</strong> request deletion of your personal data under certain conditions.</li>
          <li><strong>Right to restrict processing:</strong> request that we limit how your data is used.</li>
          <li><strong>Right to object:</strong> object to processing based on legitimate interests, including direct marketing.</li>
          <li><strong>Right to data portability:</strong> receive your data in a structured, commonly used, machine-readable format.</li>
          <li><strong>Right to withdraw consent:</strong> withdraw consent at any time where processing is based on consent.</li>
        </ul>
        <h3>11.2 CCPA/CPRA Rights (California)</h3>
        <p>If you are a California resident, the California Consumer Privacy Act (as amended by the CPRA) grants you the right to:</p>
        <ul>
          <li>Request disclosure of the categories and specific pieces of personal information collected about you.</li>
          <li>Request deletion of personal information collected from you.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Opt out of the "sale" or "sharing" of personal information — <strong>FreeSong.in does not sell personal information for money</strong>, and we do not knowingly share it for cross-context behavioral advertising.</li>
          <li>Be free from discrimination for exercising any of these rights.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the details in Section 15. We will verify your request and respond within the timeframes required by applicable law.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>12. International Data Transfers</h2>
        <p>
          FreeSong.in is operated with infrastructure that may be located outside your country of residence. Where personal data is transferred across borders, we rely on appropriate safeguards such as adequacy decisions, standard contractual clauses, or equivalent legal mechanisms, and we process data only as described in this policy.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>13. Children's Privacy (COPPA)</h2>
        <p>
          FreeSong.in is not directed at children under the age of 13 (or the equivalent minimum age in your jurisdiction), and we do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@freesong.in" style={link}>privacy@freesong.in</a> and we will promptly investigate and delete such information.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>14. Do Not Track Signals</h2>
        <p>
          Some browsers offer a "Do Not Track" (DNT) preference. Because there is not yet a common understanding of how to interpret DNT signals, FreeSong.in does not currently respond to them. You can limit tracking through the cookie controls described in our <a href="/cookie-policy" style={link}>Cookie & Local Storage Policy</a> and the advertising opt-outs listed above.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>15. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or features. When we make changes, we will revise the "Last Updated" date shown at the top of this page. We encourage you to review this page periodically. Your continued use of FreeSong.in after any update constitutes acceptance of the revised policy.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>16. Contact Our Privacy Team</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please contact us:
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>FreeSong.in — Privacy & Data Protection</strong><br />
            Privacy Inquiries: <a href="mailto:privacy@freesong.in" style={link}>privacy@freesong.in</a><br />
            General Support: <a href="mailto:support@freesong.in" style={link}>support@freesong.in</a><br />
            Website: <a href="https://freesong.in" style={link}>https://freesong.in</a>
          </p>
        </div>
        <p>
          We aim to acknowledge and respond to all legitimate privacy requests within 30 days or sooner.
        </p>
      </div>
    </LegalLayout>
  );
}
