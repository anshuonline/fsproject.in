import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Music2, Sparkles, Zap, Shield, HeartHandshake, Eye } from 'lucide-react';

export function AboutUs() {
  return (
    <LegalLayout
      badge="ABOUT FREESONG.IN"
      title="About Us — Empowering Free Music Discovery"
      subtitle="FreeSong.in was built with a simple conviction: high-fidelity music streaming should be free, fast, beautiful, and accessible to everyone without paywalls."
    >
      <div className="fs-legal-section">
        <h2>1. Our Story & Purpose</h2>
        <p>
          Founded by passionate music lovers and web engineers, <strong>FreeSong.in</strong> was created to solve a modern internet problem: today's leading music apps are bloated with intrusive popups, restricted background play, forced subscription tiers, and excessive battery-draining interfaces.
        </p>
        <p>
          We set out to design a clean, true <strong>AMOLED black</strong> web application inspired by YouTube Music's high-speed responsiveness, built with React 19 and modern web standards. FreeSong.in provides effortless access to millions of tracks, official movie soundtracks, indie discoveries, and regional hits with zero friction.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>2. Core Features & What Sets Us Apart</h2>
        <div className="fs-legal-contact-card">
          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--color-primary)" />
              100% Free & No Hidden Fees
            </span>
            <span className="fs-legal-card-desc">
              Listen to unlimited music without subscription barriers, credit card requests, or mandatory sign-ups.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} color="var(--color-primary)" />
              True AMOLED Dark Mode
            </span>
            <span className="fs-legal-card-desc">
              Hand-crafted pure #000000 AMOLED interface designed for maximum OLED battery savings and comfortable night listening.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music2 size={18} color="var(--color-primary)" />
              Algorithmic Radio & Queues
            </span>
            <span className="fs-legal-card-desc">
              Intelligent radio queuing powered by YouTube Music algorithms ensures continuous, seamless playback tailored to your vibe.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--color-primary)" />
              Live Synced Lyrics
            </span>
            <span className="fs-legal-card-desc">
              Interactive, karaoke-style synchronized lyrics with automatic line scrolling and instant click-to-seek playback.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--color-primary)" />
              Privacy-First Architecture
            </span>
            <span className="fs-legal-card-desc">
              Your listening history, custom playlists, and volume preferences stay safely stored in your browser's private local storage.
            </span>
          </div>

          <div className="fs-legal-card">
            <span className="fs-legal-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HeartHandshake size={18} color="var(--color-primary)" />
              Legal & Safe Harbor Compliant
            </span>
            <span className="fs-legal-card-desc">
              Content is streamed legitimately via official YouTube embedded API players, supporting original artists and record labels.
            </span>
          </div>
        </div>
      </div>

      <div className="fs-legal-section">
        <h2>3. Our Commitment to Quality</h2>
        <p>
          We continuously optimize our server infrastructure and client caching to deliver near-instant playback latency, responsive touch controls on mobile devices, and an intuitive desktop experience. Whether you're listening to Bollywood hits, Punjabi chartbusters, Bhojpuri folk, Lo-Fi chillhop, or global pop, FreeSong.in ensures an uncompromised experience.
        </p>
      </div>

      <div className="fs-legal-section">
        <h2>4. Connect with Us</h2>
        <p>
          We are constantly refining FreeSong.in based on community feedback. If you have feature suggestions, partnership proposals, or bug reports, we would love to hear from you.
        </p>
        <div className="fs-legal-highlight-box">
          <p>
            General Inquiries: <a href="mailto:contact@freesong.in" style={{ color: 'var(--color-primary)' }}>contact@freesong.in</a><br />
            Technical Support: <a href="mailto:support@freesong.in" style={{ color: 'var(--color-primary)' }}>support@freesong.in</a>
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
