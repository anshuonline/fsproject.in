import React from 'react';
import { LegalLayout } from './LegalLayout';

export function CookiePolicy() {
  const currentMonthYear = `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <LegalLayout
      badge="COOKIE & STORAGE DISCLOSURE"
      title="Cookie & Local Storage Policy | FreeSong.in"
      subtitle="This Cookie & Local Storage Policy explains how FreeSong ('we', 'us', or 'our') uses standard HTTP cookies, HTML5 local storage, and browser storage technologies."
    >
      <div className="fs-legal-section">
        <h2>Cookie & Local Storage Policy</h2>
        <p>
          <strong>Effective Date:</strong> {currentMonthYear}<br />
          <strong>Last Updated:</strong> {currentMonthYear}
        </p>

        <p>
          This Cookie & Local Storage Policy explains how FreeSong ("we", "us", or "our") uses standard HTTP cookies, HTML5 local storage (LocalStorage and SessionStorage), and IndexedDB technologies on <a href="https://freesong.in">freesong.in</a> and our Progressive Web Application.
        </p>

        <h3>1. What Are Cookies and Storage Technologies?</h3>
        <ul className="feature-list">
          <li><strong>Cookies:</strong> Small alphanumeric data files placed on your device by web browsers when accessing websites. They help web applications remember session states, user preferences, and analytics data.</li>
          <li><strong>HTML5 Local Storage & IndexedDB:</strong> High-performance client-side browser storage that enables modern web apps to store data locally on your device without transmitting it over the network on every HTTP request. This enables fast, persistent playback state.</li>
        </ul>

        <h3>2. Categories of Storage and Cookies We Use</h3>
        <h4>A. Strictly Necessary & Functional Storage (Essential)</h4>
        <p>These local storage items are essential for core music playback and navigation and cannot be disabled without disrupting the player:</p>
        <ul className="feature-list">
          <li><strong>Audio Player State:</strong> Preserving current track index, playback timestamp, volume level, shuffle/repeat modes, and active queue lists so songs do not restart when navigating between pages.</li>
          <li><strong>User Interface Preferences:</strong> Saving your language selections (Hindi, Punjabi, English, etc.), audio quality preferences, and AMOLED dark mode settings.</li>
          <li><strong>Authentication State:</strong> Storing secure authentication tokens locally if you sign in to maintain your session across page reloads.</li>
        </ul>

        <h4>B. Third-Party Advertising Cookies (Google AdSense)</h4>
        <p>FreeSong displays non-intrusive visual web banners powered by Google AdSense to fund server infrastructure and bandwidth costs while keeping streaming free:</p>
        <ul className="feature-list">
          <li>Third-party vendors, including Google, use cookies (such as the DoubleClick cookie) to serve ads based on a user's prior visits to FreeSong or other websites on the internet.</li>
          <li>Google's advertising cookies enable it and its partners to serve relevant advertisements to users based on browsing behavior.</li>
          <li>Cookies are also utilized for ad frequency capping, fraud prevention, and aggregated impression reporting.</li>
        </ul>

        <h4>C. Performance & Analytics Telemetry</h4>
        <p>Lightweight, aggregated telemetry cookies help our engineering team monitor page load performance, stream error rates, and peak concurrency to guarantee high platform availability.</p>

        <h3>3. Managing and Opting Out of Cookies</h3>
        <p>You have full autonomy over how cookies and storage mechanisms are utilized on your device:</p>
        <ul className="feature-list">
          <li><strong>Opt Out of Google Personalized Ads:</strong> You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li><strong>Industry-Wide Ad Opt-Out:</strong> You can opt out of third-party advertising cookies through the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance (AboutAds)</a> or the <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance (EDAA)</a>.</li>
          <li><strong>Browser Cookie Controls:</strong> You can configure your browser (Chrome, Safari, Firefox, Edge) to block, reject, or clear cookies and local storage via your browser settings. Note that disabling local storage may cause the music player to lose playback progress or queue continuity upon page reload.</li>
        </ul>

        <h3>4. Contact Us</h3>
        <p>If you have any questions about our use of cookies or local storage technologies, please contact us at: <a href="mailto:support@freesong.in">support@freesong.in</a></p>
      </div>
    </LegalLayout>
  );
}
