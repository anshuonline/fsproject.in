import { useEffect } from 'react';

export const SITE_URL = 'https://freesong.in';
export const BRAND = 'freesong.in';
export const DEFAULT_IMAGE = '/images/freesonglogowebp.webp';

// Site-wide keyword pool: high-volume target queries first, top artists & trending songs, brand last
export const SITE_KEYWORDS = [
  'online songs',
  'free song',
  'free songs',
  'ads free song',
  'ads free songs',
  'listen songs',
  'listen free songs',
  'listen to free music unblocked',
  'unblocked music player',
  'free music streaming unblocked',
  'free music online unblocked',
  'music player unblocked',
  'listen songs online',
  'listen free songs online',
  'free songs online',
  'play songs online',
  'stream songs free',
  'free music streaming',
  'ads free music streaming',
  'free music online',
  'free streaming music',
  'ads free music player',
  'free music player',
  'music streaming app',
  'listen music online',
  'arijit singh songs',
  'shreya ghoshal songs',
  'diljit dosanjh songs',
  'sidhu moose wala songs',
  'atif aslam songs',
  'anirudh ravichander songs',
  'badshah songs',
  'neha kakkar songs',
  'karan aujla songs',
  'kk songs',
  'kishore kumar songs',
  'lata mangeshkar songs',
  'apna bana le',
  'kesariya',
  'chaleya',
  'heeriye',
  'o maahi',
  'hindi songs',
  'bollywood songs',
  'punjabi songs',
  'lofi songs',
  'bhojpuri songs',
  'haryanvi songs',
  'synced lyrics',
  'online music player',
  'web music player',
  'freesong.in'
].join(', ');

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function upsertJsonLd(id, data) {
  if (!data) return;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  try {
    el.textContent = typeof data === 'string' ? data : JSON.stringify(data);
  } catch (e) {}
}

export function removeJsonLd(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Apply full on-page SEO: title (brand always trails), description, keywords,
// robots, canonical, Open Graph & Twitter cards
export function applySeo({ title, description, keywords, path = '', image = DEFAULT_IMAGE, noindex = false }) {
  if (title) document.title = title;

  if (description) upsertMeta('name', 'description', description);
  upsertMeta('name', 'keywords', keywords || SITE_KEYWORDS);
  upsertMeta('name', 'robots', noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  const url = `${SITE_URL}${path || window.location.pathname}`;
  upsertCanonical(url);

  upsertMeta('property', 'og:title', title || document.title);
  if (description) upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', image);

  upsertMeta('name', 'twitter:title', title || document.title);
  if (description) upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);
}

// React hook for per-page & dynamic SEO (album/artist/playlist titles + dynamic schema)
export function useSeo(config) {
  const { title, description, keywords, path, image, noindex, jsonLd, jsonLdId = 'dynamic-seo-jsonld' } = config || {};
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    applySeo({ title, description, keywords, path, image, noindex });
    if (jsonLd) {
      upsertJsonLd(jsonLdId, jsonLd);
    }
    return () => {
      if (jsonLd) {
        removeJsonLd(jsonLdId);
      }
    };
  }, [title, description, keywords, path, image, noindex, jsonLdStr, jsonLdId]);
}
