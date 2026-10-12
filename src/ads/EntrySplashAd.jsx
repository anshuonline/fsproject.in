import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { injectAdHtml } from '../services/adsService';
import {
  ENTRY_SPLASH_UNIT,
  ENTRY_SPLASH_SECONDS,
  ENTRY_SPLASH_COOLDOWN_HOURS
} from './config';
import './EntrySplashAd.css';

// ─── Entry Splash Ad (HilltopAds MultiTag 300x250) ───────────────────────────
// Site pe entry ke waqt dikhta hai — 24 ghante me sirf EK baar (AdSense
// rewarded-style cap, cooldown config.js me tunable). 6s forced view + ad
// load, uske baad skip/close unlock. Jab tak config.js me ENTRY_SPLASH_UNIT
// khaali hai, ye kabhi render nahi hota.

const SEEN_KEY = 'fs_entry_splash_seen';
const COOLDOWN_MS = ENTRY_SPLASH_COOLDOWN_HOURS * 60 * 60 * 1000;

function seenRecently() {
  try {
    const ts = Number(localStorage.getItem(SEEN_KEY));
    if (!ts) return false;
    return Date.now() - ts < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {}
}

export function EntrySplashAd() {
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' && !!ENTRY_SPLASH_UNIT && !seenRecently()
  );
  const [countdown, setCountdown] = useState(ENTRY_SPLASH_SECONDS);
  const [adReady, setAdReady] = useState(false);
  const hostRef = useRef(null);
  const cleanupRef = useRef(null);

  const handleClose = React.useCallback(() => setOpen(false), []);
  // Skip sirf tab: countdown pura + ad load ho chuka (ya load hone ka
  // timeout nikal chuka — blocked/no-fill me user ko trap nahi karte)
  const canClose = countdown <= 0 && adReady;

  // Pehli render pe hi "seen" mark — refresh mid-ad pe splash dobara na aaye
  useEffect(() => {
    if (open) markSeen();
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return undefined;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown]);

  // Ad unit inject — HilltopAds ka loader script apni iframe khud banata hai
  useEffect(() => {
    if (!open || !hostRef.current || !ENTRY_SPLASH_UNIT) return undefined;
    const host = hostRef.current;
    // Injection se pehle <body> ke direct children note karo, taaki ad network
    // ne jo NAYA element body pe chipkaya ho use pehchan sakein
    const baseline = new Set(Array.from(document.body.children));
    cleanupRef.current = injectAdHtml(host, ENTRY_SPLASH_UNIT);

    // Kuch zones (Video Slider jaise) apna creative modal ke bajaye <body> pe
    // floating (position:fixed) chipka dete hain — aise creative ko dhoond ke
    // modal ke andar kheench lo, positioning normalize karo aur 300x250 me fit
    let tries = 0;
    const puller = setInterval(() => {
      tries += 1;
      if (!hostRef.current) {
        clearInterval(puller);
        return;
      }
      if (host.querySelector('iframe, ins, embed, video, img')) {
        setAdReady(true); // creative load ho gaya — ab skip unlock ho sakta hai
        clearInterval(puller);
        return;
      }
      const stray = Array.from(document.body.children).find((el) => {
        if (baseline.has(el) || !(el instanceof HTMLElement)) return false;
        if (el.contains(host)) return false;
        return (
          el.tagName === 'IFRAME' ||
          el.tagName === 'INS' ||
          el.tagName === 'VIDEO' ||
          (el.tagName === 'DIV' && el.querySelector('iframe, video'))
        );
      });
      if (stray) {
        const w = stray.offsetWidth || stray.getBoundingClientRect().width;
        const h = stray.offsetHeight || stray.getBoundingClientRect().height;
        stray.style.position = 'relative';
        stray.style.top = 'auto';
        stray.style.right = 'auto';
        stray.style.bottom = 'auto';
        stray.style.left = 'auto';
        stray.style.margin = '0';
        stray.style.zIndex = 'auto';
        host.appendChild(stray);
        const scale = Math.min(1, 300 / w, 250 / h);
        if (scale < 1) {
          stray.style.transformOrigin = 'center center';
          stray.style.transform = `scale(${scale})`;
        }
        clearInterval(puller);
      } else if (tries >= 25) {
        clearInterval(puller); // 10s — kuch aaya hi nahi (no fill / blocked)
      }
    }, 400);

    // Safety valve: 12s tak ad load na ho to bhi skip unlock — kabhi stuck na ho
    const safety = setTimeout(() => setAdReady(true), 12000);

    return () => {
      clearInterval(puller);
      clearTimeout(safety);
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [open]);

  // Splash ke dauran background scroll lock
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape se close — sirf countdown ke baad
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && countdown <= 0) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, countdown, handleClose]);

  if (!open) return null;

  return (
    <div className="fs-entry-splash-backdrop" role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="fs-entry-splash" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`fs-entry-splash-corner ${canClose ? 'closable' : ''}`}
          onClick={canClose ? handleClose : undefined}
          aria-label={canClose ? 'Close ad' : `Ad closes in ${countdown} seconds`}
          disabled={!canClose}
        >
          {canClose ? <X size={16} /> : countdown}
        </button>

        <span className="fs-entry-splash-label">Advertisement</span>

        <div className="fs-entry-splash-ad-host" ref={hostRef} aria-hidden="true" />

        <button
          type="button"
          className={`fs-entry-splash-skip ${canClose ? 'active' : ''}`}
          onClick={canClose ? handleClose : undefined}
          disabled={!canClose}
        >
          {canClose ? 'Skip Ad' : countdown > 0 ? `Please wait ${countdown}s` : 'Loading ad…'}
        </button>
      </div>
    </div>
  );
}
