import React from 'react';
import { LegalLayout } from './LegalLayout';
import { HardDrive, Settings2, ShieldCheck, Megaphone } from 'lucide-react';

const link = { color: 'var(--color-primary)' };

export function CookiePolicy() {
  return (
    <LegalLayout
      badge="COOKIE & STORAGE DISCLOSURE"
      title="Cookie & Local Storage Policy"
      subtitle="This policy explains exactly how FreeSong.in uses cookies, browser storage, and local device storage — what we store, why we store it, and how you stay in control."
    >
      <div className="fs-legal-section">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that websites place on your device when you visit them. They are widely used to make websites work efficiently, remember preferences, analyze usage, and support advertising. Alongside cookies, modern websites use related browser technologies such as <code>localStorage</code>, <code>sessionStorage</code>, and similar device storage, which serve comparable purposes.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. How FreeSong.in Uses Cookies & Storage</h2>
        <p>
          We use cookies and browser storage in four clearly defined categories:
        </p>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="var(--color-primary)" />
              Strictly Necessary
            </span>
            <span className="fs-legal-card-desc">
              Required for the site to function — session integrity, security tokens, load balancing, and abuse prevention. These cannot be disabled without breaking core features.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings2 size={16} color="var(--color-primary)" />
              Preferences & Functionality
            </span>
            <span className="fs-legal-card-desc">
              Remember your choices — selected genres, followed artists, liked songs, playlists, playback queue, volume level, and theme — so the app feels like yours on every visit.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HardDrive size={16} color="var(--color-primary)" />
              Analytics & Performance
            </span>
            <span className="fs-legal-card-desc">
              Aggregate, privacy-conscious measurement of page views, playback performance, and error rates — used only to improve speed and reliability, never to build individual profiles.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} color="var(--color-primary)" />
              Advertising
            </span>
            <span className="fs-legal-card-desc">
              Set by advertising partners such as Google AdSense to deliver and measure ads, cap frequency, and (where you consent) personalize the ads you see.
            </span>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>3. Local Storage — What Stays on Your Device</h2>
        <p>
          A core design principle of FreeSong.in is <strong>on-device privacy</strong>: most of your personalization data is stored in your browser's <code>localStorage</code> and never transmitted to us unless you explicitly create an account to sync it. Depending on the features you use, your browser may locally store:
        </p>
        <ul>
          <li>Onboarding taste selections (genres and artists you picked).</li>
          <li>Your liked songs, custom playlists, and followed artists.</li>
          <li>Recently played history and listening activity.</li>
          <li>Playback preferences such as volume level and queue state.</li>
          <li>Interface settings and cached artwork for faster loading.</li>
        </ul>
        <p>
          This data remains entirely under your control. Clearing your browser's site data removes it permanently, and it is never sold or shared with third parties.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. Third-Party Cookies</h2>
        <p>
          Some cookies on FreeSong.in are set by trusted third parties:
        </p>
        <ul>
          <li>
            <strong>Google (YouTube & AdSense):</strong> The embedded YouTube player and Google advertising services may set their own cookies to enable playback, remember player settings, and serve or measure ads. Google's handling of this data is described in the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>Google Privacy Policy</a>.
          </li>
          <li>
            <strong>Advertising partners:</strong> Where personalized advertising is consented to, partner vendors may use cookies to show relevant ads across sites. You can review these vendors at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={link}>aboutads.info/choices</a>.
          </li>
        </ul>
        <p>
          We do not control third-party cookies. Their lifespan, purpose, and management are governed by each provider's own policies.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>5. Your Choices & How to Manage Cookies</h2>
        <p>You have several simple ways to stay in control:</p>
        <ul>
          <li><strong>Consent banner:</strong> Where required by law, we show a consent banner on your first visit. You can accept all, reject non-essential, or customize categories — and change your mind at any time from this banner.</li>
          <li><strong>Browser settings:</strong> Every modern browser (Chrome, Firefox, Safari, Edge) lets you view, delete, and block cookies via its privacy settings. Instructions are available in your browser's help documentation.</li>
          <li><strong>Clear site data:</strong> Clearing cookies and site data for freesong.in removes all locally stored preferences in one step.</li>
          <li><strong>Ad personalization opt-outs:</strong> Adjust Google ads at <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" style={link}>adssettings.google.com</a>, or opt out of industry tracking at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={link}>aboutads.info/choices</a> and <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" style={link}>optout.networkadvertising.org</a>.</li>
        </ul>
        <p>
          Please note: blocking strictly necessary cookies or clearing all site data may reset your preferences and affect features such as saved playlists and playback continuity.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>6. Do We Track You Across Other Sites?</h2>
        <p>
          No. FreeSong.in does not track your browsing across other websites, and we do not build cross-site behavioral profiles ourselves. Any cross-site advertising measurement that may occur is performed by third-party ad vendors under their own policies and only where you have consented.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Cookie & Local Storage Policy to reflect changes in our practices, technologies, or legal requirements. The "Last Updated" date at the top of this page always reflects the current version. Material changes may also be announced within the Service.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>8. Questions?</h2>
        <p>
          If anything about our use of cookies or storage is unclear, we are happy to explain:
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            Email: <a href="mailto:privacy@freesong.in" style={link}>privacy@freesong.in</a><br />
            Support: <a href="mailto:support@freesong.in" style={link}>support@freesong.in</a><br />
            Related pages: <a href="/privacy" style={link}>Privacy Policy</a> · <a href="/terms" style={link}>Terms of Service</a> · <a href="/disclaimer" style={link}>Disclaimer</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
