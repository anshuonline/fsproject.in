import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  const currentMonthYear = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <LegalLayout
      badge="PRIVACY & DATA PROTECTION"
      title="Privacy Policy | FreeSong.in"
      subtitle="At FreeSong.in, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data."
    >
      <div className="fs-legal-section">
        <h2>Privacy Policy</h2>
        <p>
          <strong>Effective Date:</strong> {currentMonthYear}<br />
          <strong>Last Updated:</strong> {currentMonthYear}
        </p>

        <p>
          At <strong>FreeSong.in</strong>, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data. By using or accessing our Services in any manner, you acknowledge that you accept the practices and policies outlined below, and you hereby consent that we will collect, use and share your information as described in this Privacy Policy.
        </p>
        <p>
          Remember that your use of FreeSong.in's Services is at all times subject to our <Link to="/terms">Terms of Service</Link>, which incorporates this Privacy Policy. Any terms we use in this Policy without defining them have the definitions given to them in the Terms of Service.
        </p>

        <h3>What this Privacy Policy Covers</h3>
        <p>
          This Privacy Policy covers how we treat Personal Data that we gather when you access or use our Services. "Personal Data" means any information that identifies or relates to a particular individual and also includes information referred to as "personally identifiable information" or "personal information" under applicable data privacy laws, rules or regulations. This Privacy Policy does not cover the practices of companies we don't own or control or people we don't manage.
        </p>

        <h3>Personal Data We Collect</h3>
        <h4>Information You Provide to Us</h4>
        <ul className="feature-list">
          <li><strong>Account Information:</strong> When you sign in using Google authentication or create an account, we collect only your email address and name. We do not access, store, or collect any other information from your Google account.</li>
          <li><strong>User Content:</strong> We collect information you provide when you create playlists, save favorites, leave feedback, or interact with our Services.</li>
          <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our Services, including songs you listen to, playlists you create, and features you use.</li>
        </ul>

        <h4>Information Collected Automatically</h4>
        <ul className="feature-list">
          <li><strong>Device Information:</strong> We collect information about the device you use to access our Services, including device type, operating system, and browser type.</li>
          <li><strong>Usage Information:</strong> We collect information about your interactions with our Services, such as pages visited, features used, and time spent on the platform.</li>
          <li><strong>Log Data:</strong> When you use our Services, we automatically collect and store certain information in our server logs, including your IP address, access times, and pages viewed.</li>
        </ul>

        <h4>Local Storage and Cookies</h4>
        <p>We use browser local storage to improve your experience and provide browser preference storage. This includes:</p>
        <ul className="feature-list">
          <li>Your favorite songs and playlists</li>
          <li>Your audio quality preferences</li>
          <li>Your recent listening history</li>
          <li>Saved preferences and playback context</li>
          <li>User preferences and settings</li>
        </ul>

        <h3>How We Use Your Personal Data</h3>
        <p>We use the Personal Data we collect to:</p>
        <ul className="feature-list">
          <li>Provide, maintain, and improve our Services, including personalized music recommendations</li>
          <li>Authenticate your identity when you sign in using Google or account credentials</li>
          <li>Save and sync your favorites, playlists, and preferences across devices</li>
          <li>Enable features like listening queues, local preferences, and custom playlists</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Send you updates about our Services (you can opt out at any time)</li>
          <li>Detect, prevent, and address technical issues and security threats</li>
          <li>Analyze usage patterns to improve our Services and develop new features</li>
        </ul>

        <h3>Google Sign-In Authentication</h3>
        <p>When you choose to sign in using Google, we use Google's OAuth 2.0 authentication service. Through this process:</p>
        <ul className="feature-list">
          <li>We only request and receive your email address and name from Google</li>
          <li>We do not access, store, or collect any other information from your Google account</li>
          <li>We do not have access to your Google account password</li>
          <li>Google's use of your information is governed by Google's Privacy Policy. We encourage you to review their privacy practices.</li>
          <li>You can revoke our access to your Google account at any time through your Google account settings</li>
        </ul>

        <h3>How We Share Your Personal Data</h3>
        <p>We do not sell your Personal Data. We may share your information in the following circumstances:</p>
        <ul className="feature-list">
          <li><strong>Service Providers:</strong> We may share your data with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer support. These providers are bound by contractual obligations to keep your data confidential.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, regulation, legal process, or governmental request.</li>
          <li><strong>Protection of Rights:</strong> We may share information to protect our rights, privacy, safety, or property, or that of our users or others.</li>
          <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
          <li><strong>With Your Consent:</strong> We may share your information with your explicit consent or at your direction.</li>
        </ul>

        <h3>Data Security</h3>
        <p>
          We implement appropriate technical and organizational measures to protect your Personal Data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee absolute security.
        </p>

        <h3>Data Retention</h3>
        <p>
          We retain your Personal Data for as long as your account is active or as needed to provide you with our Services. We may retain certain information after you close your account if retention is necessary to comply with legal obligations, resolve disputes, or enforce our agreements.
        </p>

        <h3>Your Rights and Choices</h3>
        <h4>Access and Update Your Information</h4>
        <p>You can access and update your account information through your profile settings on our platform.</p>

        <h4>Delete Your Account</h4>
        <p>
          You can request to delete your account at any time by contacting us. When you delete your account, we will delete your Personal Data, subject to certain exceptions where we are required to retain information by law.
        </p>

        <h4>Local Storage Management</h4>
        <p>
          You can clear your local storage data at any time through your browser settings. Note that clearing local storage will remove your cached preferences, and locally stored playlists.
        </p>

        <h4>Opt-Out of Communications</h4>
        <p>
          You can opt-out of receiving promotional communications from us by following the unsubscribe instructions in those communications or by contacting us directly.
        </p>

        <h3>Children's Privacy</h3>
        <p>
          Our Services are not directed to individuals under the age of 13. We do not knowingly collect Personal Data from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at <a href="mailto:support@freesong.in">support@freesong.in</a>, and we will take steps to delete such information.
        </p>

        <h3>Third-Party Services</h3>
        <p>
          Our Services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
        </p>
        <p>
          We use third-party services to provide our music streaming functionality. These services may have their own privacy policies, and we encourage you to review them.
        </p>

        <h3>Advertising and Cookies</h3>
        <p>
          FreeSong.in may display ads provided by Google AdSense. Google may use cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting Google Ads Settings at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">https://adssettings.google.com</a>. You can also learn more about how Google uses cookies for ads at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
        </p>
        <p>
          Our <Link to="/cookie-policy">Cookie Policy</Link> explains how you can control cookies and local storage in your browser. Disabling certain cookies may affect ad relevance but should not impact core playback functionality.
        </p>

        <h3>International Data Transfers</h3>
        <p>
          Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our Services, you consent to the transfer of your information to these countries.
        </p>

        <h3>Changes to This Privacy Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective date" at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h3>Contact Us</h3>
        <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
        <div className="contact-card">
          <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
          <p><strong>Website:</strong> <a href="https://freesong.in">https://freesong.in</a></p>
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          By using FreeSong.in, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and use of your information as described herein.
        </p>
      </div>
    </LegalLayout>
  );
}
