import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Eye,
  Music2,
  FileText,
  Search,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import './SeoContentSection.css';

const SEARCHABLE_CATEGORIES = [
  {
    category: 'Trending Bollywood & Hindi Hits',
    tags: [
      'New Bollywood Songs',
      'Arijit Singh Latest Hits',
      'Romantic Love Songs',
      '90s Bollywood Classics',
      'Sad Hindi Songs',
      'Bollywood Party Songs',
      'Shreya Ghoshal Hits',
      'Heartbreak Hindi Melodies'
    ]
  },
  {
    category: 'Punjabi & Regional Chartbusters',
    tags: [
      'Latest Punjabi Songs',
      'Sidhu Moose Wala All Hits',
      'Diljit Dosanjh Chartbusters',
      'Karan Aujla Songs',
      'Bhojpuri DJ Dance Songs',
      'Pawan Singh Bhojpuri Hits',
      'Haryanvi Top Songs',
      'South Hindi Dubbed Hits'
    ]
  },
  {
    category: 'Moods, Activities & Lo-Fi',
    tags: [
      'Lo-Fi Chillhop Late Night',
      'Gym Workout Motivation',
      'Long Drive Acoustic Songs',
      'Meditation & Sleep Music',
      'Coffeehouse Indie Acoustic',
      'Study & Focus Beats',
      'Rainy Day Melodies'
    ]
  },
  {
    category: 'Top Charts & Viral Anthems',
    tags: [
      'Top 50 India Trending',
      'Viral Instagram Reel Audio',
      'Global Hot 100 Hits',
      'Desi Hip Hop Anthems',
      'English Pop Chartbusters',
      'Acoustic Pop Covers'
    ]
  }
];

const FAQS = [
  {
    q: 'Is FreeSong.in 100% free to stream music?',
    a: 'Yes, FreeSong.in is completely free. We do not require credit card information, monthly subscription fees, or paid memberships. You can stream full-length songs, movie soundtracks, and customized radio stations indefinitely.'
  },
  {
    q: 'How does FreeSong.in provide high-fidelity audio without paywalls?',
    a: 'FreeSong.in leverages authorized YouTube IFrame Player APIs to index and deliver official audio streams directly from YouTube Music. This ensures maximum audio quality, seamless playback latency, and fair monetization for original creators and record labels.'
  },
  {
    q: 'Can I sing along with real-time synced lyrics?',
    a: 'Yes! FreeSong.in features real-time karaoke synchronized lyrics. When listening in Fullscreen Player, active lyrics automatically scroll to center stage. You can also click on any lyric line to jump directly to that point in the song.'
  },
  {
    q: 'How does the algorithmic queue and continuous radio work?',
    a: 'Whenever you start any track, FreeSong.in queries official YouTube Music radio queues via our backend pipeline. When your current song approaches completion, our Auto-play engine smoothly appends related tracks and artist recommendations so your listening never ends.'
  },
  {
    q: 'How does FreeSong.in respect copyright and DMCA policies?',
    a: 'FreeSong.in does not store, host, convert, or distribute audio files (MP3/WAV/AAC) on our servers. Content is embedded directly through Google and YouTube official player frameworks under Safe Harbor provisions (17 U.S.C. § 512). Copyright holders can submit formal inquiries to dmca@freesong.in.'
  }
];

const SeoContentSectionBase = function SeoContentSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(prev => (prev === idx ? -1 : idx));
  };

  return (
    <section className="fs-seo-section" aria-label="Why FreeSong.in and music directory">
      {/* ─── Header ─── */}
      <div className="fs-seo-header">
        <span className="fs-seo-eyebrow">THE PREMIER AMOLED MUSIC PORTAL</span>
        <h2 className="fs-seo-title">
          Why FreeSong.in? Unlimited, High-Fidelity AMOLED Music Streaming
        </h2>
        <p className="fs-seo-desc">
          Experience the internet's cleanest music web player. Designed with AMOLED true black aesthetics, instant search recommendations, real-time synchronized lyrics, and zero subscription walls.
        </p>
      </div>

      {/* ─── 4 Feature Pillars Grid ─── */}
      <div className="fs-seo-pillars-grid">
        <div className="fs-seo-pillar-card">
          <div className="fs-seo-pillar-icon">
            <Zap size={22} />
          </div>
          <h3 className="fs-seo-pillar-title">100% Free Streaming</h3>
          <p className="fs-seo-pillar-text">
            No subscription fees, no credit cards, and no forced logins. Enjoy unlimited playback on desktop, mobile, and tablets.
          </p>
        </div>

        <div className="fs-seo-pillar-card">
          <div className="fs-seo-pillar-icon">
            <Eye size={22} />
          </div>
          <h3 className="fs-seo-pillar-title">True AMOLED Dark Mode</h3>
          <p className="fs-seo-pillar-text">
            Engineered with deep #000000 AMOLED blacks for maximum OLED battery efficiency and eye comfort during late-night listening.
          </p>
        </div>

        <div className="fs-seo-pillar-card">
          <div className="fs-seo-pillar-icon">
            <Sparkles size={22} />
          </div>
          <h3 className="fs-seo-pillar-title">Live Synced Lyrics</h3>
          <p className="fs-seo-pillar-text">
            Sing along with karaoke synchronized lyrics that auto-scroll in real-time, plus one-tap timestamp seeking.
          </p>
        </div>

        <div className="fs-seo-pillar-card">
          <div className="fs-seo-pillar-icon">
            <Music2 size={22} />
          </div>
          <h3 className="fs-seo-pillar-title">Algorithmic Continuous Radio</h3>
          <p className="fs-seo-pillar-text">
            YouTube Music's official queue engine automatically enqueues similar songs so your music vibe never stops.
          </p>
        </div>
      </div>

      {/* ─── Searchable Keywords Directory ─── */}
      <div className="fs-seo-tags-box">
        <div className="fs-seo-tags-box-header">
          <div className="fs-seo-tags-box-title">
            <Search size={18} color="var(--color-primary)" />
            <span>Popular Search Queries & Music Directory</span>
          </div>
          <span className="fs-seo-tags-box-subtitle">
            Click any tag to search and stream instantly
          </span>
        </div>

        <div className="fs-seo-tag-categories">
          {SEARCHABLE_CATEGORIES.map((cat, cIdx) => (
            <div key={cIdx} className="fs-seo-category-row">
              <span className="fs-seo-category-label">{cat.category}</span>
              <div className="fs-seo-tag-cloud">
                {cat.tags.map((tag, tIdx) => (
                  <Link
                    key={tIdx}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="fs-seo-tag-pill"
                    title={`Listen to ${tag} on FreeSong.in`}
                  >
                    <TrendingUp size={12} color="var(--color-primary)" />
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FAQ Accordion (Schema.org Microdata) ─── */}
      <div
        className="fs-seo-faq-wrap"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <h3 className="fs-seo-faq-title">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="fs-seo-faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`fs-seo-faq-item ${isOpen ? 'open' : ''}`}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="fs-seo-faq-question"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span itemProp="name">{faq.q}</span>
                  <ChevronDown size={18} className="fs-seo-faq-chevron" />
                </button>

                {isOpen && (
                  <div
                    className="fs-seo-faq-answer"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p itemProp="text">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const SeoContentSection = React.memo(SeoContentSectionBase);
