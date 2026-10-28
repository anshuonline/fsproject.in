/**
 * FreeSong.in Server-Side Prerendering Engine
 * Generates full static HTML pages for all 30 blog posts, the blog archive, and all 10 legal/info pages.
 * Ensures Google AdSense, Search Console, and crawlers receive 100% full text and schema without needing client-side JS.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_BLOGS } from '../src/pages/Blog/data/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('[PRERENDER] dist/index.html not found! Run "vite build" first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const PRERENDER_CSS = `
<style id="fs-prerender-css">
  body { margin: 0; background-color: #000000; color: #ffffff; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  .prerender-shell { max-width: 900px; margin: 0 auto; padding: 24px 20px 80px; box-sizing: border-box; }
  .prerender-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 0 24px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .prerender-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #ffffff; font-weight: 800; font-size: 1.25rem; }
  .prerender-brand img { width: 34px; height: 34px; border-radius: 8px; }
  .prerender-brand span { color: #00c853; }
  .prerender-nav { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
  .prerender-nav a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: color 0.15s; }
  .prerender-nav a:hover, .prerender-nav a.active { color: #00c853; }
  .prerender-crumbs { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: rgba(255,255,255,0.5); margin-bottom: 24px; flex-wrap: wrap; }
  .prerender-crumbs a { color: rgba(255,255,255,0.6); text-decoration: none; }
  .prerender-crumbs a:hover { color: #00c853; }
  .prerender-crumbs span.current { color: #ffffff; font-weight: 600; }
  .prerender-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; background: rgba(0, 200, 83, 0.14); border: 1px solid rgba(0, 200, 83, 0.35); color: #00c853; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
  .prerender-title { font-size: clamp(1.85rem, 4.5vw, 2.5rem); font-weight: 800; line-height: 1.25; margin: 0 0 16px; color: #ffffff; letter-spacing: -0.02em; }
  .prerender-lede { font-size: 1.05rem; line-height: 1.65; color: rgba(255,255,255,0.7); margin: 0 0 24px; }
  .prerender-meta-box { display: flex; align-items: center; gap: 16px; padding: 12px 18px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 32px; font-size: 0.85rem; color: rgba(255,255,255,0.7); flex-wrap: wrap; }
  .prerender-meta-box strong { color: #ffffff; }
  .prerender-body { font-size: 1.05rem; line-height: 1.8; color: rgba(255,255,255,0.85); }
  .prerender-body h2 { font-size: 1.55rem; color: #ffffff; margin: 38px 0 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; }
  .prerender-body h3 { font-size: 1.25rem; color: #ffffff; margin: 28px 0 12px; font-weight: 600; }
  .prerender-body h4 { font-size: 1.1rem; color: #00c853; margin: 20px 0 10px; font-weight: 600; }
  .prerender-body p { margin: 0 0 18px; }
  .prerender-body ul, .prerender-body ol { margin: 0 0 22px; padding-left: 24px; }
  .prerender-body li { margin-bottom: 8px; line-height: 1.7; }
  .prerender-body strong { color: #ffffff; }
  .prerender-body a { color: #00c853; text-decoration: none; border-bottom: 1px dotted #00c853; }
  .prerender-body a:hover { color: #00e676; border-bottom-color: #00e676; }
  .prerender-cta { background: linear-gradient(135deg, rgba(0, 200, 83, 0.12) 0%, rgba(13, 13, 13, 0.9) 100%); border: 1px solid rgba(0, 200, 83, 0.3); border-radius: 16px; padding: 32px; text-align: center; margin: 48px 0; }
  .prerender-cta h3 { margin: 0 0 8px; font-size: 1.4rem; color: #ffffff; font-weight: 700; }
  .prerender-cta p { margin: 0 0 20px; color: rgba(255,255,255,0.7); font-size: 0.95rem; }
  .prerender-cta-btn { display: inline-block; background: #00c853; color: #000000; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: background 0.15s, transform 0.15s; }
  .prerender-cta-btn:hover { background: #00e676; transform: translateY(-2px); }
  .prerender-footer { margin-top: 64px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.5); }
  .prerender-footer-links { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px; }
  .prerender-footer a { color: rgba(255,255,255,0.6); text-decoration: none; }
  .prerender-footer a:hover { color: #00c853; }
  .prerender-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 32px; }
  .prerender-card { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: border-color 0.18s, transform 0.18s; }
  .prerender-card:hover { border-color: rgba(0, 200, 83, 0.4); transform: translateY(-2px); }
  .prerender-card-meta { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .prerender-card-category { color: #00c853; }
  .prerender-card-title { font-size: 1.12rem; font-weight: 700; margin: 0 0 10px; color: #ffffff; line-height: 1.35; }
  .prerender-card-desc { font-size: 0.85rem; color: rgba(255,255,255,0.65); line-height: 1.55; margin: 0 0 14px; flex-grow: 1; }
  .prerender-card-cta { color: #00c853; font-size: 0.82rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
  .prerender-contact-box { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0; }
  .prerender-contact-box p { margin: 8px 0; }
  @media (max-width: 640px) {
    .prerender-shell { padding: 18px 16px 60px; }
    .prerender-title { font-size: 1.65rem; }
    .prerender-header { flex-direction: column; align-items: flex-start; }
    .prerender-body { font-size: 0.98rem; }
  }
</style>
`;

function replaceHeadTags(html, { title, description, canonicalUrl, ogType = 'website', jsonLd }) {
  let modified = html;

  // Replace Title
  modified = modified.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Replace Meta Description
  if (modified.includes('name="description"')) {
    modified = modified.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  } else {
    modified = modified.replace('</head>', `    <meta name="description" content="${escapeHtml(description)}" />\n  </head>`);
  }

  // Replace Canonical Link
  if (modified.includes('rel="canonical"')) {
    modified = modified.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    modified = modified.replace('</head>', `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  // Replace OpenGraph Title & Description
  modified = modified.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  modified = modified.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  modified = modified.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  modified = modified.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);

  // Replace Twitter Title & Description
  modified = modified.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  modified = modified.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);

  // Inject Prerender CSS & JSON-LD
  let headExtras = PRERENDER_CSS;
  if (jsonLd) {
    headExtras += `\n<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>\n`;
  }
  modified = modified.replace('</head>', `${headExtras}</head>`);

  return modified;
}

function writePage(subPath, htmlContent) {
  const targetDir = path.join(DIST_DIR, subPath);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFile, htmlContent, 'utf8');
}

function renderHeader(activeNav = '') {
  return `
    <header class="prerender-header">
      <a href="/" class="prerender-brand">
        <img src="/images/icon-192.png" alt="FreeSong" width="34" height="34" />
        <div>FreeSong<span>.in</span></div>
      </a>
      <nav class="prerender-nav">
        <a href="/">Home</a>
        <a href="/explore">Explore</a>
        <a href="/blog"${activeNav === 'blog' ? ' class="active"' : ''}>Articles &amp; Guides</a>
        <a href="/about"${activeNav === 'about' ? ' class="active"' : ''}>About</a>
        <a href="/faq"${activeNav === 'faq' ? ' class="active"' : ''}>FAQ</a>
        <a href="/contact"${activeNav === 'contact' ? ' class="active"' : ''}>Contact</a>
      </nav>
    </header>
  `;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="prerender-footer">
      <div class="prerender-footer-links">
        <a href="/">Home</a> ·
        <a href="/explore">Explore</a> ·
        <a href="/blog">Music Guides</a> ·
        <a href="/about">About Us</a> ·
        <a href="/how-it-works">How It Works</a> ·
        <a href="/features">Features</a> ·
        <a href="/privacy">Privacy Policy</a> ·
        <a href="/terms">Terms of Service</a> ·
        <a href="/dmca">DMCA Policy</a> ·
        <a href="/disclaimer">Disclaimer</a> ·
        <a href="/cookie-policy">Cookie Policy</a> ·
        <a href="/faq">FAQ</a> ·
        <a href="/contact">Contact</a>
      </div>
      <p>© ${year} FreeSong.in — All rights reserved. Zero audio ads music streaming platform.</p>
    </footer>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERATE ALL 30 BLOG POST PAGES
// ─────────────────────────────────────────────────────────────────────────────
console.log(`[PRERENDER] Starting generation for ${ALL_BLOGS.length} blog posts...`);

let countBlogs = 0;
for (const blog of ALL_BLOGS) {
  const canonicalUrl = `https://freesong.in/blog/${blog.slug}`;
  const pageTitle = `${blog.title} — FreeSong.in Guides`;
  const pageDesc = blog.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": pageDesc,
    "image": ["https://freesong.in/images/freesonglogowebp.webp"],
    "datePublished": "2025-01-15T00:00:00Z",
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "FreeSong Editorial Team",
      "url": "https://freesong.in/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FreeSong.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://freesong.in/images/icon-192.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  const sectionsHtml = blog.sections.map(section => {
    if (section.h2) return `<h2>${escapeHtml(section.h2)}</h2>`;
    if (section.h3) return `<h3>${escapeHtml(section.h3)}</h3>`;
    if (section.p) return `<p>${escapeHtml(section.p)}</p>`;
    if (section.ul) {
      return `<ul>${section.ul.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }
    return '';
  }).join('\n');

  // Related posts (pick next 3)
  const currentIndex = ALL_BLOGS.findIndex(b => b.slug === blog.slug);
  const related = [
    ALL_BLOGS[(currentIndex + 1) % ALL_BLOGS.length],
    ALL_BLOGS[(currentIndex + 2) % ALL_BLOGS.length],
    ALL_BLOGS[(currentIndex + 3) % ALL_BLOGS.length]
  ];

  const relatedHtml = `
    <div style="margin-top: 48px;">
      <h3 style="font-size: 1.3rem; margin-bottom: 20px; color: #ffffff;">Keep Reading &amp; Discover More Music</h3>
      <div class="prerender-grid">
        ${related.map(r => `
          <a href="/blog/${r.slug}" class="prerender-card">
            <div class="prerender-card-meta">
              <span class="prerender-card-category">${escapeHtml(r.category)}</span>
              <span>•</span>
              <span>${escapeHtml(r.readTime)}</span>
            </div>
            <h4 class="prerender-card-title">${escapeHtml(r.title)}</h4>
            <p class="prerender-card-desc">${escapeHtml(r.description)}</p>
            <span class="prerender-card-cta">Read Guide →</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  const articleInnerHtml = `
  <div class="prerender-shell">
    ${renderHeader('blog')}

    <div class="prerender-crumbs">
      <a href="/">Home</a>
      <span>›</span>
      <a href="/blog">Articles &amp; Guides</a>
      <span>›</span>
      <span class="current">${escapeHtml(blog.title)}</span>
    </div>

    <article>
      <div class="prerender-badge">${escapeHtml(blog.category)}</div>
      <h1 class="prerender-title">${escapeHtml(blog.title)}</h1>
      <p class="prerender-lede">${escapeHtml(blog.description)}</p>

      <div class="prerender-meta-box">
        <span>By <strong>FreeSong Editorial</strong></span>
        <span>•</span>
        <span>${escapeHtml(blog.readTime)}</span>
        <span>•</span>
        <span>Published in ${escapeHtml(blog.category)}</span>
      </div>

      <div class="prerender-body">
        ${sectionsHtml}
      </div>

      <div class="prerender-cta">
        <h3>Stream Your Favorite Music Online Free</h3>
        <p>Listen to millions of Hindi, Bollywood, Punjabi and International songs with zero audio ads and live synced lyrics on FreeSong.in.</p>
        <a href="/" class="prerender-cta-btn">Start Listening Now</a>
      </div>

      ${relatedHtml}
    </article>

    ${renderFooter()}
  </div>
  `;

  let postHtml = replaceHeadTags(baseHtml, {
    title: pageTitle,
    description: pageDesc,
    canonicalUrl,
    ogType: 'article',
    jsonLd
  });

  postHtml = postHtml.replace('<div id="root"></div>', `<div id="root">${articleInnerHtml}</div>`);
  writePage(path.join('blog', blog.slug), postHtml);
  countBlogs++;
}

console.log(`[PRERENDER] Successfully generated ${countBlogs} blog post pages.`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. GENERATE /blog ARCHIVE INDEX PAGE
// ─────────────────────────────────────────────────────────────────────────────
{
  const canonicalUrl = 'https://freesong.in/blog';
  const pageTitle = 'Music Discovery Guides & Articles — FreeSong.in';
  const pageDesc = 'Explore 30+ practical guides on music discovery, playlist curation, audio quality, genres, and independent artists on FreeSong.in.';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDesc,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Organization",
      "name": "FreeSong.in",
      "url": "https://freesong.in/"
    }
  };

  const blogCardsHtml = ALL_BLOGS.map(b => `
    <a href="/blog/${b.slug}" class="prerender-card">
      <div class="prerender-card-meta">
        <span class="prerender-card-category">${escapeHtml(b.category)}</span>
        <span>•</span>
        <span>${escapeHtml(b.readTime)}</span>
      </div>
      <h2 class="prerender-card-title">${escapeHtml(b.title)}</h2>
      <p class="prerender-card-desc">${escapeHtml(b.description)}</p>
      <span class="prerender-card-cta">Read Guide →</span>
    </a>
  `).join('\n');

  const archiveInnerHtml = `
  <div class="prerender-shell">
    ${renderHeader('blog')}

    <div class="prerender-crumbs">
      <a href="/">Home</a>
      <span>›</span>
      <span class="current">Articles &amp; Guides</span>
    </div>

    <div style="background: linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(13, 13, 13, 0.6) 100%); border: 1px solid rgba(0, 200, 83, 0.2); border-radius: 16px; padding: 36px 30px; margin-bottom: 36px;">
      <div class="prerender-badge">Editorial &amp; Guides</div>
      <h1 class="prerender-title" style="margin-bottom: 12px;">Music Discovery Guides &amp; Practical Articles</h1>
      <p class="prerender-lede" style="margin-bottom: 0;">Practical reading for listeners, audiophiles, and creators. Discover how to build sustainable listening systems, explore new genres, optimize sound quality, and understand music deeply.</p>
    </div>

    <div class="prerender-grid">
      ${blogCardsHtml}
    </div>

    <div class="prerender-cta" style="margin-top: 56px;">
      <h3>Ready to Experience Music Differently?</h3>
      <p>Stream endless songs ads-free with real-time lyrics, curated playlists, and true AMOLED dark mode.</p>
      <a href="/" class="prerender-cta-btn">Listen on FreeSong.in</a>
    </div>

    ${renderFooter()}
  </div>
  `;

  let archiveHtml = replaceHeadTags(baseHtml, {
    title: pageTitle,
    description: pageDesc,
    canonicalUrl,
    ogType: 'website',
    jsonLd
  });

  archiveHtml = archiveHtml.replace('<div id="root"></div>', `<div id="root">${archiveInnerHtml}</div>`);
  writePage('blog', archiveHtml);
  console.log('[PRERENDER] Successfully generated /blog index page.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERATE ALL 10 LEGAL & INFORMATIONAL PAGES
// ─────────────────────────────────────────────────────────────────────────────
const LEGAL_PAGES = [
  {
    slug: 'privacy',
    title: 'Privacy Policy | FreeSong.in',
    badge: 'PRIVACY & DATA PROTECTION',
    subtitle: 'At FreeSong.in, we take your privacy seriously. Learn how we collect, protect, and respect your data.',
    description: 'FreeSong.in Privacy Policy. Learn about our privacy-first design, zero user tracking, cookie policies, and personal data protection principles.',
    content: `
      <h2>Privacy Policy</h2>
      <p><strong>Effective Date:</strong> ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}<br>
      <strong>Last Updated:</strong> ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}</p>

      <p>At <strong>FreeSong.in</strong>, we take your privacy seriously. Please read this Privacy Policy to learn how we treat your personal data. By using or accessing our Services in any manner, you acknowledge that you accept the practices and policies outlined below, and you hereby consent that we will collect, use, and share your information as described in this Privacy Policy.</p>

      <h3>What this Privacy Policy Covers</h3>
      <p>This Privacy Policy covers how we treat Personal Data that we gather when you access or use our Services. "Personal Data" means any information that identifies or relates to a particular individual. This policy does not cover the practices of companies we do not own or control or individuals we do not manage.</p>

      <h3>Personal Data We Collect</h3>
      <h4>1. Information You Provide to Us</h4>
      <ul>
        <li><strong>Account Information:</strong> When you sign in using Google authentication or create an account, we collect only your email address and name. We do not access, store, or collect any other information from your Google account.</li>
        <li><strong>User Content:</strong> Information you provide when creating playlists, saving favorites, or leaving feedback.</li>
        <li><strong>Usage Data:</strong> Information about how you interact with our Services, including playlist actions and playback preferences.</li>
      </ul>

      <h4>2. Information Collected Automatically</h4>
      <ul>
        <li><strong>Device Information:</strong> Device type, operating system, and browser version used to access the application.</li>
        <li><strong>Log Data:</strong> Diagnostic logs containing IP addresses, access timestamps, and request routes for debugging security and server stability.</li>
      </ul>

      <h4>3. Local Storage and Cookies</h4>
      <p>We use browser local storage (LocalStorage) to enhance your listening experience without requiring persistent tracking:</p>
      <ul>
        <li>Your favorite tracks and custom user playlists.</li>
        <li>Your audio quality selections and UI theme settings.</li>
        <li>Your recent listening history and queue status.</li>
      </ul>

      <h3>Advertising & Google AdSense Disclosure</h3>
      <p>FreeSong.in uses Google AdSense to serve non-intrusive display banners. Google, as a third-party vendor, uses cookies to serve ads based on your visit to this and other websites. You may opt out of personalized advertising by visiting Google Ads Settings.</p>

      <h3>Contact Information</h3>
      <p>If you have any questions or concerns regarding our privacy policies, please email us at <a href="mailto:support@freesong.in">support@freesong.in</a>.</p>
    `
  },
  {
    slug: 'terms',
    title: 'Terms of Service | FreeSong.in',
    badge: 'USER AGREEMENT & POLICIES',
    subtitle: 'These Terms of Service constitute a legally binding agreement between you and FreeSong.in.',
    description: 'Read the Terms of Service for FreeSong.in. Understand your rights, acceptable use policies, copyright guidelines, and platform limitations.',
    content: `
      <h2>Terms of Service</h2>
      <p><strong>Effective Date:</strong> ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}</p>

      <p>Welcome to <strong>FreeSong.in</strong>. These Terms of Service ("Terms") constitute a legally binding agreement between you and FreeSong.in regarding your use of our website, applications, and streaming features.</p>

      <h3>Acceptance of Terms</h3>
      <p>By accessing or using FreeSong.in in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these Terms, please discontinue use of our service immediately.</p>

      <h3>Description of Service</h3>
      <p>FreeSong.in is a free music discovery and streaming platform designed to provide an ad-free audio listening experience with live synced lyrics. We aggregate publicly available music metadata and streams from third-party media sources to enable discovery, playlist organization, and synchronized listening.</p>
      <ul>
        <li>Search and explore songs, artists, albums, and playlists.</li>
        <li>Stream high-fidelity music with real-time synchronized karaoke lyrics.</li>
        <li>Organize your music library with personal playlists and favorites.</li>
        <li>Read editorial guides, music discovery articles, and industry breakdowns.</li>
      </ul>

      <h3>Third-Party Content and Copyright</h3>
      <p>FreeSong.in does not host, upload, or store copyrighted audio files on its own servers. All audio streams and album art are retrieved dynamically from authorized third-party public web APIs and content providers. All trademarks, logos, and copyrights belong to their respective owners.</p>

      <h3>User Conduct</h3>
      <p>You agree not to use the platform for any illegal activities, attempt to disrupt server operations, reverse-engineer proprietary code, or systematically scrape large amounts of data without explicit permission.</p>

      <h3>Disclaimers & Limitation of Liability</h3>
      <p>FreeSong.in is provided on an "as is" and "as available" basis without warranties of any kind. Under no circumstances shall FreeSong.in be liable for indirect, incidental, or consequential damages resulting from the use or inability to use the platform.</p>
    `
  },
  {
    slug: 'dmca',
    title: 'DMCA & Copyright Policy | FreeSong.in',
    badge: 'COPYRIGHT & DMCA COMPLIANCE',
    subtitle: 'FreeSong strictly respects intellectual property rights and maintains an expedited 24-hour notice-and-takedown procedure.',
    description: 'DMCA and Copyright compliance statement for FreeSong.in. Instructions for copyright owners to submit takedown notices with expedited response.',
    content: `
      <h2>DMCA & Copyright Policy</h2>
      <p><strong>Effective Date:</strong> ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}</p>

      <p>FreeSong.in respects the intellectual property rights of artists, composers, labels, and publishers. In compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright legislation, we maintain an expedited 24-hour notice-and-takedown procedure.</p>

      <h3>Platform Architecture & Safe Harbor Notice</h3>
      <p>FreeSong.in operates as an online discovery search engine and media interface. <strong>FreeSong.in does not host, store, or upload sound recordings to its servers.</strong> Media streams and artwork originate dynamically from third-party media networks. However, we take all copyright claims seriously and will immediately disable search index access upon receipt of a valid notice.</p>

      <h3>How to File a Takedown Notice</h3>
      <p>To file a DMCA notice, please send a written communication to our designated copyright agent with the following details:</p>
      <ul>
        <li>1. Identification of the copyrighted work claimed to have been infringed.</li>
        <li>2. The exact URL(s) or track titles on FreeSong.in where the material appears.</li>
        <li>3. Your full legal name, company or artist representation, physical address, phone number, and email address.</li>
        <li>4. A statement of good faith belief that the disputed use is not authorized by the copyright owner.</li>
        <li>5. A statement under penalty of perjury that the information provided is accurate and that you are authorized to act on behalf of the owner.</li>
        <li>6. An electronic or physical signature of the copyright owner or authorized representative.</li>
      </ul>

      <div class="prerender-contact-box">
        <p><strong>Designated DMCA Agent:</strong> FreeSong Copyright Team</p>
        <p><strong>Email:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
        <p><strong>Response Time:</strong> Within 24 business hours.</p>
      </div>
    `
  },
  {
    slug: 'disclaimer',
    title: 'Legal Disclaimer | FreeSong.in',
    badge: 'TRANSPARENCY & DISCLOSURE',
    subtitle: 'Important disclosures regarding third-party content, audio advertising policies, and service availability.',
    description: 'Legal disclaimer for FreeSong.in regarding third-party media sources, audio advertising exemptions, and content distribution limitations.',
    content: `
      <h2>Legal Disclaimer</h2>
      <p>Please read this legal disclaimer carefully before using FreeSong.in. By accessing or using our service, you acknowledge and agree to the following terms.</p>

      <h3>1. Non-Affiliation Notice</h3>
      <p>FreeSong.in is an independent music discovery platform and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with any commercial streaming service, major record label, or media corporation. All brand names and trademarks belong to their respective holders.</p>

      <h3>2. Audio Ads Free Clarification</h3>
      <p>Our commitment to "Zero Audio Ads" means we will never interrupt your listening experience with commercial audio voiceover ads. FreeSong.in is supported solely through standard, non-intrusive visual web advertisements.</p>

      <h3>3. Content Availability & Third-Party APIs</h3>
      <p>Audio playback and search results are provided via third-party web services and public media APIs. FreeSong.in does not guarantee permanent availability of any individual song, album, or artist catalog, as third-party providers may alter or remove content at their discretion.</p>
    `
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie & Local Storage Policy | FreeSong.in',
    badge: 'COOKIE & STORAGE DISCLOSURE',
    subtitle: 'Learn how FreeSong.in uses cookies and modern browser storage technologies to maintain your listening session.',
    description: 'Detailed Cookie and HTML5 Local Storage Policy for FreeSong.in explaining functional storage, analytics, and advertising preferences.',
    content: `
      <h2>Cookie & Local Storage Policy</h2>
      <p>This policy describes how FreeSong.in utilizes HTTP cookies, HTML5 Local Storage, and browser cache to deliver smooth music streaming.</p>

      <h3>What Technologies We Use</h3>
      <ul>
        <li><strong>HTML5 Local Storage:</strong> Enables saving your favorite songs, user-created playlists, audio volume, repeat/shuffle status, and dark mode preferences directly on your device.</li>
        <li><strong>Session Cookies:</strong> Temporary tokens used to manage active browsing sessions and login status.</li>
        <li><strong>Google AdSense Cookies:</strong> Used by Google to serve display ads and prevent fraud or repetitive impressions.</li>
      </ul>

      <h3>How to Control Cookies</h3>
      <p>You can choose to disable or selectively turn off cookies or local storage through your browser settings. Note that disabling local storage may prevent the music player from saving your playback progress or customized playlists.</p>
    `
  },
  {
    slug: 'about',
    title: 'About Us — FreeSong.in Music Platform',
    badge: 'ABOUT FREESONG.IN',
    subtitle: 'FreeSong.in is a free, modern music discovery platform engineered for music lovers across India and the globe.',
    description: 'Learn about FreeSong.in mission, technology stack, zero audio ads policy, live synced lyrics engine, and dedication to open music discovery.',
    content: `
      <h2>About FreeSong.in</h2>
      <p>FreeSong.in is a next-generation music streaming and discovery platform designed to make exploring music effortless, accessible, and enjoyable for everyone.</p>

      <h3>Our Mission</h3>
      <p>We believe that listening to music should be a seamless, beautiful experience without intrusive audio interruptions. Too many modern platforms lock basic features like synced lyrics, background playback, and queue management behind paywalls. FreeSong.in was created to provide a pure, distraction-free listening environment.</p>

      <h3>Key Highlights</h3>
      <ul>
        <li><strong>Zero Audio Interruptions:</strong> Enjoy uninterrupted albums and continuous music queues without jarring sponsor voiceovers.</li>
        <li><strong>Studio Audio & Synced Lyrics:</strong> Sing along with real-time word-by-word synced karaoke lyrics.</li>
        <li><strong>True AMOLED Dark Theme:</strong> Battery-saving deep black user interface designed for OLED screens and late-night listening.</li>
        <li><strong>Curated Music Guides:</strong> Original articles and essays exploring new genres, production techniques, and playlist psychology.</li>
      </ul>

      <h3>Our Team & Editorial Standards</h3>
      <p>FreeSong.in is maintained by a dedicated team of audio engineers, music curators, and open-web enthusiasts committed to speed, security, and top-tier user experience.</p>
    `
  },
  {
    slug: 'how-it-works',
    title: 'How It Works — FreeSong.in Streaming Guide',
    badge: 'GUIDE & WORKFLOW',
    subtitle: 'Understand how FreeSong.in search, streaming architecture, synced lyrics, and playlist engines work.',
    description: 'A complete step-by-step walkthrough of how FreeSong.in finds songs, delivers high quality audio, syncs lyrics, and organizes queues.',
    content: `
      <h2>How FreeSong.in Works</h2>
      <p>FreeSong.in combines high-performance web engineering with public audio APIs to deliver an ultra-fast streaming experience right in your browser.</p>

      <h3>1. Search & Intelligent Aggregation</h3>
      <p>When you enter a song title, artist, or album, FreeSong queries multiple public catalog sources simultaneously, cleaning noisy keywords and ranking results by acoustic relevance and official release status.</p>

      <h3>2. Real-Time Synced Lyrics Engine</h3>
      <p>Our synchronized lyrics engine matches tracks with time-stamped LRC metadata, highlighting every line dynamically as the vocalist sings so you can read, learn, and sing along in real time.</p>

      <h3>3. Low-Latency Media Delivery</h3>
      <p>Audio is streamed using modern progressive web codecs, ensuring smooth continuous playback even on 3G and 4G mobile connections with minimal buffering.</p>

      <h3>4. Local-First Library Persistence</h3>
      <p>Your playlists and favorites are stored securely in your browser's local database, ensuring instant access without waiting for remote server roundtrips.</p>
    `
  },
  {
    slug: 'features',
    title: 'Platform Features — FreeSong.in',
    badge: 'PLATFORM CAPABILITIES',
    subtitle: 'Explore the full spectrum of audio, visual, and discovery features available on FreeSong.in.',
    description: 'Explore all FreeSong.in capabilities: AMOLED dark mode, karaoke synced lyrics, zero audio ads, curated playlists, and lightweight PWA app.',
    content: `
      <h2>Platform Features</h2>
      <p>FreeSong.in is loaded with capabilities built for dedicated music fans and casual listeners alike:</p>

      <h3>Zero Audio Interruptions</h3>
      <p>Say goodbye to 30-second unskippable commercial breaks in the middle of your favorite playlist. FreeSong keeps your listening flow pure.</p>

      <h3>Karaoke Synced Lyrics</h3>
      <p>View real-time synchronized lyrics for Hindi, Bollywood, Punjabi, English, and regional songs with a single tap on the lyrics icon.</p>

      <h3>True AMOLED Dark Theme</h3>
      <p>Engineered with genuine #000000 pitch-black surfaces, minimizing display power consumption on mobile OLED devices and providing high visual contrast.</p>

      <h3>Progressive Web App (PWA)</h3>
      <p>Install FreeSong.in directly onto your Android, iPhone, Windows, or Mac home screen for a native app feel with zero storage clutter.</p>

      <h3>Curated Editorial & Music Guides</h3>
      <p>Read dozens of deep-dive articles covering acoustic science, playlist building, mood curation, and emerging artists.</p>
    `
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions & Help — FreeSong.in',
    badge: 'HELP & FAQ',
    subtitle: 'Get quick answers to common questions about streaming, lyrics, accounts, and supported devices.',
    description: 'Frequently Asked Questions about FreeSong.in: Is it free? How does it play music without ads? How to install PWA? Learn more here.',
    content: `
      <h2>Frequently Asked Questions</h2>

      <h3>Is FreeSong.in completely free to use?</h3>
      <p>Yes! FreeSong.in is 100% free. You can search, stream, build playlists, read synced lyrics, and browse editorial guides without paying any subscription fees.</p>

      <h3>Are there really zero audio advertisements?</h3>
      <p>Yes. We will never interrupt your listening session with recorded audio ads or sponsor interruptions. We support platform hosting costs through standard visual display banners.</p>

      <h3>Do I need an account to listen to music?</h3>
      <p>No account is required to start streaming. You can search and listen immediately. Creating a free account lets you synchronize your favorite playlists across multiple devices.</p>

      <h3>How do I view lyrics while playing a song?</h3>
      <p>Click or tap the lyrics icon (microphone or text bubble) in the bottom player bar to open the full-screen karaoke lyrics view.</p>

      <h3>Can I install FreeSong.in on my smartphone?</h3>
      <p>Yes! FreeSong.in is a Progressive Web App (PWA). Open FreeSong.in in Chrome or Safari on your phone and tap "Add to Home Screen" or "Install App" to launch it like a native app.</p>

      <h3>How do I report a bug or request a song?</h3>
      <p>You can reach our team directly at <a href="mailto:support@freesong.in">support@freesong.in</a> or submit a message through our <a href="/contact">Contact Us</a> page.</p>
    `
  },
  {
    slug: 'contact',
    title: 'Contact Us — FreeSong.in Support & Inquiries',
    badge: 'GET IN TOUCH',
    subtitle: 'We value your feedback. Contact our editorial, technical, and copyright support teams.',
    description: 'Contact FreeSong.in for support, bug reports, partnership inquiries, copyright questions, and music suggestions.',
    content: `
      <h2>Contact FreeSong.in</h2>
      <p>Have questions, feedback, or need technical assistance? Our support team is here to help.</p>

      <div class="prerender-contact-box">
        <h3>Direct Contact Channels</h3>
        <p><strong>General Support &amp; Feedback:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
        <p><strong>Copyright &amp; DMCA Notices:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
        <p><strong>Partnerships &amp; Media:</strong> <a href="mailto:support@freesong.in">support@freesong.in</a></p>
        <p><strong>Response Time:</strong> Typically within 24 to 48 hours.</p>
      </div>

      <h3>Frequently Covered Topics</h3>
      <ul>
        <li><strong>Bug Reports:</strong> Please include your browser name, device model, and the track or URL where the issue occurred.</li>
        <li><strong>Song Suggestions:</strong> Tell us about great songs, artists, or genres you would like featured in our editorial guides.</li>
        <li><strong>Feature Requests:</strong> We are constantly updating FreeSong.in and love hearing community suggestions!</li>
      </ul>
    `
  }
];

console.log(`[PRERENDER] Starting generation for ${LEGAL_PAGES.length} legal/info pages...`);

let countLegal = 0;
for (const page of LEGAL_PAGES) {
  const canonicalUrl = `https://freesong.in/${page.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": page.slug === 'about' ? 'AboutPage' : (page.slug === 'contact' ? 'ContactPage' : (page.slug === 'faq' ? 'FAQPage' : 'WebPage')),
    "name": page.title,
    "description": page.description,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Organization",
      "name": "FreeSong.in",
      "url": "https://freesong.in/"
    }
  };

  const pageInnerHtml = `
  <div class="prerender-shell">
    ${renderHeader(page.slug)}

    <div class="prerender-crumbs">
      <a href="/">Home</a>
      <span>›</span>
      <span class="current">${escapeHtml(page.title.split('|')[0].split('—')[0].trim())}</span>
    </div>

    <article>
      <div class="prerender-badge">${escapeHtml(page.badge)}</div>
      <h1 class="prerender-title">${escapeHtml(page.title.split('|')[0].split('—')[0].trim())}</h1>
      <p class="prerender-lede">${escapeHtml(page.subtitle)}</p>

      <div class="prerender-body">
        ${page.content}
      </div>

      <div class="prerender-cta">
        <h3>Stream Music Online Free on FreeSong.in</h3>
        <p>Enjoy studio audio quality, synchronized lyrics, and zero commercial audio breaks.</p>
        <a href="/" class="prerender-cta-btn">Listen Now</a>
      </div>
    </article>

    ${renderFooter()}
  </div>
  `;

  let finalHtml = replaceHeadTags(baseHtml, {
    title: page.title,
    description: page.description,
    canonicalUrl,
    ogType: 'website',
    jsonLd
  });

  finalHtml = finalHtml.replace('<div id="root"></div>', `<div id="root">${pageInnerHtml}</div>`);
  writePage(page.slug, finalHtml);
  countLegal++;
}

console.log(`[PRERENDER] Successfully generated ${countLegal} legal/info pages.`);
console.log(`[PRERENDER] Complete! Generated a total of ${countBlogs + 1 + countLegal} static HTML pages in dist/.`);
