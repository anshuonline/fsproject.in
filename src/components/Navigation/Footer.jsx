import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Heart, ExternalLink, Headphones } from 'lucide-react';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fs-footer" aria-label="Site Footer">
      <div className="fs-footer-inner">
        {/* ─── Top Brand & Badges Row ─── */}
        <div className="fs-footer-brand-row">
          <div className="fs-footer-brand-col">
            <img
              src="/images/freesonglogowebp.webp"
              alt="FreeSong.in Logo"
              className="fs-footer-logo-img"
            />
            <div className="fs-footer-brand-meta">
              <span className="fs-footer-brand-name">
                FreeSong<span>.in</span>
              </span>
              <span className="fs-footer-tagline">
                Unlimited High-Fidelity AMOLED Music Streaming • Zero Subscription Fees
              </span>
            </div>
          </div>

          <div className="fs-footer-badges">
            <span className="fs-footer-pill-badge green">
              <ShieldCheck size={14} />
              <span>DMCA Safe Harbor Compliant</span>
            </span>
            <span className="fs-footer-pill-badge">
              <Sparkles size={14} color="var(--color-primary)" />
              <span>Google AdSense Partner</span>
            </span>
            <span className="fs-footer-pill-badge">
              <Headphones size={14} />
              <span>YouTube API Streaming</span>
            </span>
          </div>
        </div>

        {/* ─── 5 Columns Grid (GanaTube Style) ─── */}
        <div className="fs-footer-grid">
          {/* Column 1: Explore & Navigation */}
          <div className="fs-footer-column">
            <span className="fs-footer-col-title">Navigation</span>
            <ul className="fs-footer-links-list">
              <li><Link to="/" className="fs-footer-link">Home Feed</Link></li>
              <li><Link to="/explore" className="fs-footer-link">Explore Categories</Link></li>
              <li><Link to="/library" className="fs-footer-link">Your Library</Link></li>
              <li><Link to="/search" className="fs-footer-link">Search & Trending</Link></li>
              <li><Link to="/favorites" className="fs-footer-link">Liked Tracks</Link></li>
              <li><Link to="/history" className="fs-footer-link">Listening History</Link></li>
              <li><Link to="/settings" className="fs-footer-link">Audio Settings</Link></li>
            </ul>
          </div>

          {/* Column 2: Popular Genres & Languages */}
          <div className="fs-footer-column">
            <span className="fs-footer-col-title">Genres & Languages</span>
            <ul className="fs-footer-links-list">
              <li><Link to="/search?q=bollywood+songs" className="fs-footer-link">Bollywood Songs</Link></li>
              <li><Link to="/search?q=punjabi+songs" className="fs-footer-link">Punjabi Hits</Link></li>
              <li><Link to="/search?q=bhojpuri+songs" className="fs-footer-link">Bhojpuri Melodies</Link></li>
              <li><Link to="/search?q=haryanvi+songs" className="fs-footer-link">Haryanvi Anthems</Link></li>
              <li><Link to="/search?q=lofi+chill+songs" className="fs-footer-link">Lo-Fi & Chillhop</Link></li>
              <li><Link to="/search?q=indian+indie+songs" className="fs-footer-link">Indian Indie & Pop</Link></li>
              <li><Link to="/search?q=south+hindi+songs" className="fs-footer-link">South Indian Hits</Link></li>
              <li><Link to="/search?q=bhakti+songs" className="fs-footer-link">Devotional & Bhakti</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Trending Artists */}
          <div className="fs-footer-column">
            <span className="fs-footer-col-title">Top Artists</span>
            <ul className="fs-footer-links-list">
              <li><Link to="/search?q=Arijit+Singh" className="fs-footer-link">Arijit Singh</Link></li>
              <li><Link to="/search?q=Shreya+Ghoshal" className="fs-footer-link">Shreya Ghoshal</Link></li>
              <li><Link to="/search?q=Diljit+Dosanjh" className="fs-footer-link">Diljit Dosanjh</Link></li>
              <li><Link to="/search?q=Sidhu+Moose+Wala" className="fs-footer-link">Sidhu Moose Wala</Link></li>
              <li><Link to="/search?q=Atif+Aslam" className="fs-footer-link">Atif Aslam</Link></li>
              <li><Link to="/search?q=Anirudh+Ravichander" className="fs-footer-link">Anirudh Ravichander</Link></li>
              <li><Link to="/search?q=Neha+Kakkar" className="fs-footer-link">Neha Kakkar</Link></li>
              <li><Link to="/search?q=Badshah" className="fs-footer-link">Badshah</Link></li>
            </ul>
          </div>

          {/* Column 4: Popular Search Queries (GanaTube SEO) */}
          <div className="fs-footer-column">
            <span className="fs-footer-col-title">Popular Searches</span>
            <ul className="fs-footer-links-list">
              <li><Link to="/search?q=free+hindi+songs+online" className="fs-footer-link">Free Hindi Songs</Link></li>
              <li><Link to="/search?q=romantic+bollywood+songs" className="fs-footer-link">Romantic Love Songs</Link></li>
              <li><Link to="/search?q=gym+workout+music" className="fs-footer-link">Gym Workout Music</Link></li>
              <li><Link to="/search?q=party+dance+songs" className="fs-footer-link">Party Dance Songs</Link></li>
              <li><Link to="/search?q=90s+evergreen+hindi" className="fs-footer-link">90s Evergreen Retro</Link></li>
              <li><Link to="/search?q=desi+hip+hop" className="fs-footer-link">Desi Hip Hop Anthems</Link></li>
              <li><Link to="/search?q=late+night+drive+songs" className="fs-footer-link">Late Night Drive</Link></li>
              <li><Link to="/search?q=sleep+relaxing+music" className="fs-footer-link">Sleep & Relaxing</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal & AdSense Compliance */}
          <div className="fs-footer-column">
            <span className="fs-footer-col-title">Company & Legal</span>
            <ul className="fs-footer-links-list">
              <li><Link to="/about" className="fs-footer-link">About FreeSong.in</Link></li>
              <li><Link to="/contact" className="fs-footer-link">Contact Us & Support</Link></li>
              <li><Link to="/privacy" className="fs-footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="fs-footer-link">Terms of Service</Link></li>
              <li><Link to="/dmca" className="fs-footer-link">DMCA & Copyright</Link></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="fs-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Google Privacy <ExternalLink size={10} /></a></li>
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="fs-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>YouTube Terms <ExternalLink size={10} /></a></li>
            </ul>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="fs-footer-bottom-bar">
          <div className="fs-footer-copyright">
            © {currentYear} FreeSong.in. All rights reserved. Made with <Heart size={12} color="#00C853" fill="#00C853" style={{ verticalAlign: 'middle' }} /> for music lovers.
          </div>

          <div className="fs-footer-disclaimer-text">
            FreeSong.in utilizes authorized YouTube API Services for audio indexing and embedded playback. FreeSong.in does not store, host, or distribute copyrighted media files on its servers.
          </div>

          <div className="fs-footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/dmca">DMCA</Link>
            <span>•</span>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
