import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Music2, Sparkles, Zap, Gauge, Users2, Eye } from 'lucide-react';

const iconStyle = { display: 'flex', alignItems: 'center', gap: 8 };

export function AboutUs() {
  return (
    <LegalLayout
      badge="ABOUT FREESONG.IN"
      title="About FreeSong.in"
      subtitle="FreeSong.in is a free, web-based music discovery and streaming interface built for people who simply want to press play — no paywalls, no clutter, no compromises."
    >
      <div className="fs-legal-section">
        <h2>1. Who We Are</h2>
        <p>
          <strong>FreeSong.in</strong> is an independent music platform created by a small team of passionate music lovers and web engineers. Our story began with a familiar frustration: modern music apps have become heavy, subscription-locked, and cluttered with interruptions — while the web itself is more than capable of delivering a beautiful, instant listening experience.
        </p>
        <p>
          So we built one. FreeSong.in is a fast, true-AMOLED web application that lets anyone search, discover, and play millions of tracks — Bollywood, Punjabi, regional Indian music, international hits, film soundtracks, and indie finds — directly in the browser, on any device, for free.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Our Mission</h2>
        <div className="fs-legal-highlight-box">
          <p>
            <strong>Our mission is simple:</strong> make music discovery on the web instant, honest, and free — while always respecting the artists, labels, and platforms that make the music possible.
          </p>
        </div>
        <p>
          We believe access to music should not depend on the device you own or the subscription you can afford. At the same time, we believe creators deserve to be paid — which is exactly why our platform is engineered around official, rights-respecting delivery rather than file distribution.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>3. How FreeSong.in Works — Full Transparency</h2>
        <p>
          We publish this openly on every page of our site because trust matters:
        </p>
        <ul>
          <li>
            <strong>Official embedded playback:</strong> all music is streamed through the official <strong>YouTube IFrame Player API</strong> and <strong>YouTube API Services</strong>, exactly as YouTube makes them available to any website. Every play supports artists through YouTube's existing monetization systems.
          </li>
          <li>
            <strong>No media hosting:</strong> FreeSong.in does not host, upload, store, convert, or distribute any audio or video files. Our servers handle search, metadata, and user features — never music files.
          </li>
          <li>
            <strong>Public metadata only:</strong> track titles, artwork, and artist information come from public APIs, refreshed continuously so charts and releases stay current.
          </li>
          <li>
            <strong>On-device personalization:</strong> your playlists, likes, history, and preferences live in your own browser's local storage. Create an account only if you want to sync them across devices.
          </li>
        </ul>
        <p>
          For the complete picture, read our <a href="/disclaimer" style={{ color: 'var(--color-primary)' }}>Disclaimer</a>, <a href="/dmca" style={{ color: 'var(--color-primary)' }}>DMCA & Copyright Policy</a>, and <a href="/privacy" style={{ color: 'var(--color-primary)' }}>Privacy Policy</a>.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. What We Offer</h2>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Zap size={18} color="var(--color-primary)" />
              100% Free Listening
            </span>
            <span className="fs-legal-card-desc">
              Unlimited music without subscriptions, credit cards, or forced sign-ups. The service is supported by unobtrusive advertising — never by selling your data.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Music2 size={18} color="var(--color-primary)" />
              Massive, Living Catalog
            </span>
            <span className="fs-legal-card-desc">
              Millions of tracks with live charts, latest releases, artist radio, mood shelves, and single/soundtrack enrichment so a one-song release is never a dead end.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Gauge size={18} color="var(--color-primary)" />
              Built for Speed
            </span>
            <span className="fs-legal-card-desc">
              A performance-obsessed architecture delivers near-instant search and playback, smooth on 375px phones and 4K desktops alike.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Eye size={18} color="var(--color-primary)" />
              True AMOLED Dark Mode
            </span>
            <span className="fs-legal-card-desc">
              A hand-crafted pure #000000 interface — maximum battery savings on OLED screens and genuinely comfortable night listening.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Sparkles size={18} color="var(--color-primary)" />
              Synced Lyrics & Full Player
            </span>
            <span className="fs-legal-card-desc">
              Karaoke-style synchronized lyrics with click-to-seek, a persistent bottom player, queue management, and a full-screen experience on every device.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={iconStyle}>
              <Users2 size={18} color="var(--color-primary)" />
              Personal Library
            </span>
            <span className="fs-legal-card-desc">
              Create custom playlists, follow artists, build favorites, and revisit your listening history — synced across devices with a free account.
            </span>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>5. Our Values</h2>
        <ul>
          <li><strong>Respect for creators:</strong> playback flows only through official channels where rights holders are compensated and retain full control.</li>
          <li><strong>Privacy by default:</strong> minimal collection, on-device storage, and clear disclosure of every cookie — see our <a href="/cookie-policy" style={{ color: 'var(--color-primary)' }}>Cookie & Local Storage Policy</a>.</li>
          <li><strong>Honesty over hype:</strong> we openly describe how the platform works, what we store, and what we don't do.</li>
          <li><strong>Accessibility:</strong> a free, lightweight experience designed to work on modest hardware and slow networks across India and beyond.</li>
        </ul>
      </div>

      <div className="fs-legal-section">
        <h2>6. Our Commitment to Quality</h2>
        <p>
          We continuously refine our infrastructure, caching, and recommendation quality to keep playback latency low and discovery genuinely useful. Whether you are here for chart-toppers, film soundtracks, devotional classics, lo-fi study sessions, or regional folk, our goal is the same: an uncompromised listening experience that loads in seconds and never gets in the way of the music.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>7. Talk to Us</h2>
        <p>
          FreeSong.in improves through community feedback. Whether it's a bug report, a feature idea, a partnership proposal, or a rights-holder inquiry, our team reads every message.
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            General Inquiries: <a href="mailto:contact@freesong.in" style={{ color: 'var(--color-primary)' }}>contact@freesong.in</a><br />
            Technical Support: <a href="mailto:support@freesong.in" style={{ color: 'var(--color-primary)' }}>support@freesong.in</a><br />
            Contact Form: <a href="/contact" style={{ color: 'var(--color-primary)' }}>freesong.in/contact</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
