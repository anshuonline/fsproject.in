import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ExternalLink,
  Headphones,
  Volume2,
  Sparkles,
  Disc,
  ListMusic,
  Zap
} from 'lucide-react';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fs-footer" aria-label="Site Footer">
      <div className="fs-footer-inner">
        {/* ─── Top Brand Row (Badges Removed) ─── */}
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

          {/* Column 4: Popular Search Queries */}
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

          {/* Column 5: Legal & Information */}
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

        {/* ─── SEO Section: Why FreeSong.in? ─── */}
        <section className="fs-footer-why-section" aria-label="Why FreeSong.in">
          <div className="fs-footer-why-header">
            <span className="fs-footer-why-badge">#1 ONLINE MUSIC STREAMING</span>
            <h2 className="fs-footer-why-title">
              Why FreeSong<span>.in</span>? — Unlimited Free Music & Ads-Free Streaming
            </h2>
            <p className="fs-footer-why-subtitle">
              FreeSong.in is your all-in-one free music streaming platform. Discover millions of Hindi, Bollywood, Punjabi, and international hits with zero subscription fees, uninterrupted playback, and high-fidelity sound.
            </p>
          </div>

          <div className="fs-footer-why-cards">
            {/* Card 1: 100% Free Music */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <Headphones size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">FREE MUSIC STREAMING</span>
              </div>
              <h3 className="fs-footer-why-card-title">100% Free Music Online</h3>
              <p className="fs-footer-why-card-text">
                Stream unlimited songs online for free without monthly subscription charges or credit cards. Listen to full albums, chartbusters, and new song releases with zero fees.
              </p>
            </div>

            {/* Card 2: Ads Free Music */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <Volume2 size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">ADS FREE MUSIC</span>
              </div>
              <h3 className="fs-footer-why-card-title">Ads-Free Music Experience</h3>
              <p className="fs-footer-why-card-text">
                Say goodbye to annoying audio advertisements interrupting your favorite tracks. Enjoy continuous, uninterrupted music playback for workouts, work sessions, and road trips.
              </p>
            </div>

            {/* Card 3: High-Fidelity Audio */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <Sparkles size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">HIGH QUALITY AUDIO</span>
              </div>
              <h3 className="fs-footer-why-card-title">Studio HD Sound Quality</h3>
              <p className="fs-footer-why-card-text">
                Experience high-bitrate crystal clear audio with enhanced dynamic range, punchy deep bass, and pristine vocals. Tuned perfectly for headphones, home theaters, and car stereos.
              </p>
            </div>

            {/* Card 4: Millions of Songs */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <Disc size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">BOLLYWOOD & PUNJABI</span>
              </div>
              <h3 className="fs-footer-why-card-title">Unlimited Songs & Daily Hits</h3>
              <p className="fs-footer-why-card-text">
                Explore a vast library featuring top artists like Arijit Singh, Diljit Dosanjh, Sidhu Moose Wala, Shreya Ghoshal, and Badshah, alongside 90s retro melodies and viral trending singles.
              </p>
            </div>

            {/* Card 5: Clone & Custom Playlists */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <ListMusic size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">PLAYLIST CLONER</span>
              </div>
              <h3 className="fs-footer-why-card-title">Clone & Edit Custom Playlists</h3>
              <p className="fs-footer-why-card-text">
                Save any community playlist as an editable clone in your library with one click. Add or remove tracks, customize titles, and generate automatic 2x2 photo collage covers.
              </p>
            </div>

            {/* Card 6: AMOLED Dark Mode */}
            <div className="fs-footer-why-card">
              <div className="fs-footer-why-card-top">
                <div className="fs-footer-why-card-icon">
                  <Zap size={22} className="text-brand" />
                </div>
                <span className="fs-footer-why-card-tag">AMOLED BATTERY SAVING</span>
              </div>
              <h3 className="fs-footer-why-card-title">True AMOLED Dark Mode</h3>
              <p className="fs-footer-why-card-text">
                Crafted in pure AMOLED black (#000000) to save mobile battery life and reduce eye strain. Fully installable PWA app for Android, iOS, Windows, and macOS devices.
              </p>
            </div>
          </div>

          {/* Popular SEO Search Tags */}
          <div className="fs-footer-seo-tags-wrap">
            <span className="fs-footer-seo-tags-label">POPULAR MUSIC SEARCHES:</span>
            <div className="fs-footer-seo-tags">
              <Link to="/search?q=free+music+streaming" className="fs-footer-tag-pill">Free Music Streaming</Link>
              <Link to="/search?q=ads+free+music" className="fs-footer-tag-pill">Ads Free Music</Link>
              <Link to="/search?q=listen+songs+online" className="fs-footer-tag-pill">Listen Songs Online</Link>
              <Link to="/search?q=new+bollywood+songs" className="fs-footer-tag-pill">New Bollywood Songs</Link>
              <Link to="/search?q=punjabi+songs+free" className="fs-footer-tag-pill">Punjabi Songs Free</Link>
              <Link to="/search?q=free+hindi+songs" className="fs-footer-tag-pill">Hindi Songs Stream</Link>
              <Link to="/search?q=free+music+player" className="fs-footer-tag-pill">Free Music Player</Link>
              <Link to="/search?q=lofi+chill+songs" className="fs-footer-tag-pill">Lo-Fi Chill Music</Link>
              <Link to="/search?q=bhojpuri+hit+songs" className="fs-footer-tag-pill">Bhojpuri Hit Songs</Link>
              <Link to="/search?q=90s+evergreen+hindi" className="fs-footer-tag-pill">90s Evergreen Retro</Link>
              <Link to="/search?q=gym+workout+music" className="fs-footer-tag-pill">Gym Workout Music</Link>
              <Link to="/search?q=romantic+love+songs" className="fs-footer-tag-pill">Romantic Love Songs</Link>
            </div>
          </div>
        </section>

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
