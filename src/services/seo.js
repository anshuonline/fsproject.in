import { useEffect } from 'react';

export const SITE_URL = 'https://freesong.in';
export const BRAND = 'freesong.in';
export const DEFAULT_IMAGE = '/images/freesonglogowebp.webp';

// Site-wide keyword pool: ads-free & free-streaming variants first, brand last
export const SITE_KEYWORDS = [
  'ads free songs',
  'ads free music',
  'ads free streaming',
  'free streaming',
  'free song',
  'free songs',
  'free songs online',
  'free music streaming',
  'free music online',
  'free streaming music',
  'ads free music player',
  'free music player',
  'music streaming app',
  'listen music online',
  'hindi songs',
  'bollywood songs',
  'punjabi songs',
  'lofi songs',
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

// React hook for per-page & dynamic SEO (album/artist/playlist titles)
export function useSeo(config) {
  const { title, description, keywords, path, image, noindex } = config || {};
  useEffect(() => {
    applySeo({ title, description, keywords, path, image, noindex });
  }, [title, description, keywords, path, image, noindex]);
}
