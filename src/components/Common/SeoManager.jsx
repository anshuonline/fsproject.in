import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo } from '../../services/seo';
import { fetchPublicSeoOverrides, fetchPublicSeoConfig } from '../../services/analyticsService';

// Inject the Google Search Console verification meta tag
function injectGscTag(content) {
  if (!content || document.head.querySelector('meta[name="google-site-verification"]')) return;
  try {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = content;
    document.head.appendChild(meta);
  } catch (e) {}
}

// Inject the GA4 gtag.js script with the admin's measurement id
function injectGtag(measurementId) {
  if (!measurementId || window.__fsGtagInjected) return;
  window.__fsGtagInjected = true;
  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() { window.dataLayer.push(arguments); };
    }
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
  } catch (e) {}
}

// Route-based SEO map: the brand "freesong.in" always trails the title.
// Private/user & admin pages are noindexed; public pages stay indexable.
const SEO_ROUTES = [
  {
    match: /^\/$/,
    path: '/',
    editable: true,
    title: 'Ads Free Music Streaming - Free Songs Online | freesong.in',
    description: 'Stream unlimited free songs on FreeSong.in - a 100% ads free music streaming platform. Enjoy Bollywood, Hindi, Punjabi, Lo-Fi & global hits in high quality audio with real-time synced lyrics, true AMOLED dark mode and zero subscriptions. No ads, no fees - just free streaming.'
  },
  {
    match: /^\/(watch|song|track)\//,
    path: '/watch • /song/:id • /track/:id',
    editable: false,
    title: 'Play Free Songs - Ads Free Music Player | freesong.in',
    description: 'Play any song ads free in high quality audio with real-time synced lyrics. Free unlimited music streaming on FreeSong.in - no ads, no subscription, pure AMOLED experience.'
  },
  {
    match: /^\/explore/,
    path: '/explore',
    editable: true,
    title: 'Explore Free Music - Trending Songs & New Releases | freesong.in',
    description: 'Explore trending chartbusters, latest releases, top artists, moods & genres - all ads free. Stream free songs across Bollywood, Punjabi, Tamil, Telugu, Lo-Fi & more with synced lyrics.'
  },
  {
    match: /^\/search/,
    path: '/search',
    editable: true,
    title: 'Search Free Songs - Ads Free Music Finder | freesong.in',
    description: 'Search millions of free songs, albums, artists & playlists instantly. Ads free streaming in high quality audio with synced lyrics on FreeSong.in.'
  },
  {
    match: /^\/playlist\//,
    path: '/playlist/:id',
    editable: false,
    title: 'Playlist - Free Music Streaming | freesong.in',
    noindex: true
  },
  {
    match: /^\/album\//,
    path: '/album/:id',
    editable: false,
    title: 'Album - Ads Free Streaming | freesong.in',
    description: 'Stream the full album ads free in high quality audio with synced lyrics. Free unlimited music streaming on FreeSong.in.'
  },
  {
    match: /^\/artist\//,
    path: '/artist/:id',
    editable: false,
    title: 'Artist Songs - Free Music Streaming | freesong.in',
    description: 'Listen to your favourite artist songs ads free with synced lyrics. Stream top tracks, albums & playlists free on FreeSong.in.'
  },
  {
    match: /^\/library/,
    path: '/library',
    editable: true,
    title: 'My Music Library - Playlists & Liked Songs | freesong.in',
    noindex: true
  },
  {
    match: /^\/favorites/,
    path: '/favorites',
    editable: true,
    title: 'Liked Songs - Your Favorite Free Music | freesong.in',
    noindex: true
  },
  {
    match: /^\/followed/,
    path: '/followed',
    editable: true,
    title: 'Followed Artists | freesong.in',
    noindex: true
  },
  {
    match: /^\/history/,
    path: '/history',
    editable: true,
    title: 'Listening History - Recently Played Songs | freesong.in',
    noindex: true
  },
  {
    match: /^\/profile/,
    path: '/profile',
    editable: true,
    title: 'My Profile | freesong.in',
    noindex: true
  },
  {
    match: /^\/settings/,
    path: '/settings',
    editable: true,
    title: 'Settings - Ads Free Music Player | freesong.in',
    noindex: true
  },
  {
    match: /^\/ganalytics/,
    path: '/ganalytics',
    editable: false,
    title: 'Admin Analytics | freesong.in',
    noindex: true
  },
  {
    match: /^\/seo/,
    path: '/seo',
    editable: false,
    title: 'SEO Manager Portal | freesong.in',
    noindex: true
  },
  {
    match: /^\/confirm-delete/,
    path: '/confirm-delete',
    editable: false,
    title: 'Confirm Account Deletion | freesong.in',
    noindex: true
  },
  {
    match: /^\/login/,
    path: '/login',
    editable: true,
    title: 'Login - Free Music Streaming Account | freesong.in',
    description: 'Log in to your FreeSong.in account to sync playlists, liked songs and listening history across devices. 100% ads free music streaming.',
    noindex: true
  },
  {
    match: /^\/register/,
    path: '/register',
    editable: true,
    title: 'Create Free Account - Ads Free Music | freesong.in',
    description: 'Create a free FreeSong.in account to sync playlists, liked songs and listening history across devices. 100% ads free music streaming, no subscription.',
    noindex: true
  },
  {
    match: /^\/reset-password/,
    path: '/reset-password',
    editable: false,
    title: 'Reset Password | freesong.in',
    noindex: true
  },
  {
    match: /^\/privacy/,
    path: '/privacy',
    editable: true,
    title: 'Privacy Policy | freesong.in',
    description: 'Read the FreeSong.in privacy policy - how we handle your data, account details, listening history and location personalization on our ads free music streaming platform.'
  },
  {
    match: /^\/terms/,
    path: '/terms',
    editable: true,
    title: 'Terms of Service | freesong.in',
    description: 'FreeSong.in terms of service - usage guidelines for our free music streaming platform with ads free songs, playlists and synced lyrics.'
  },
  {
    match: /^\/dmca/,
    path: '/dmca',
    editable: true,
    title: 'DMCA Disclaimer - Copyright Policy | freesong.in',
    description: 'FreeSong.in DMCA disclaimer and copyright policy. We host no media files - music streams directly from YouTube Music. Report copyright concerns here.'
  },
  {
    match: /^\/about/,
    path: '/about',
    editable: true,
    title: 'About FreeSong - Ads Free Streaming Platform | freesong.in',
    description: 'Learn about FreeSong.in - a free, ads free music streaming platform with millions of songs, real-time synced lyrics, true AMOLED dark mode and zero subscriptions.'
  },
  {
    match: /^\/contact/,
    path: '/contact',
    editable: true,
    title: 'Contact Us | freesong.in',
    description: 'Contact the FreeSong.in team for support, feedback, partnerships or copyright queries regarding our ads free music streaming platform.'
  }
];

// Watches the active route and applies on-page SEO in one central place.
// Admin-managed overrides (SEO Manager page) win over the static route map.
export function SeoManager() {
  const location = useLocation();
  const overridesRef = useRef(new Map());
  const gaIdRef = useRef(null);
  const [seoVersion, setSeoVersion] = useState(0);

  // Site-wide SEO overrides managed from the admin SEO Manager page
  useEffect(() => {
    let cancelled = false;
    fetchPublicSeoOverrides().then((overrides) => {
      if (cancelled || !overrides || !overrides.length) return;
      overridesRef.current = new Map(overrides.map(o => [o.pagePath, o]));
      setSeoVersion(v => v + 1);
    });
    return () => { cancelled = true; };
  }, []);

  // Tracking & verification config: inject GSC meta tag + GA4 script
  useEffect(() => {
    let cancelled = false;
    fetchPublicSeoConfig().then((config) => {
      if (cancelled || !config) return;
      if (config.gscVerification) injectGscTag(config.gscVerification);
      if (config.gaMeasurementId) {
        gaIdRef.current = config.gaMeasurementId;
        injectGtag(config.gaMeasurementId);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // SPA page_view tracking on every route change
  useEffect(() => {
    if (window.gtag && gaIdRef.current) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;
    const override = overridesRef.current.get(pathname);
    const route = SEO_ROUTES.find(r => r.match.test(pathname));

    if (override) {
      applySeo({
        title: override.title || route?.title,
        description: override.description || route?.description,
        keywords: override.keywords || route?.keywords,
        noindex: override.noindex === true,
        path: pathname
      });
      return;
    }

    if (route) {
      applySeo({ ...route, path: pathname });
    }
  }, [location.pathname, seoVersion]);

  return null;
}

export { SEO_ROUTES };
export default SeoManager;
