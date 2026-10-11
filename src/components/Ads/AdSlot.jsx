import React, { useEffect, useRef, useState } from 'react';
import { loadAdConfig, injectAdHtml, currentDevice } from '../../services/adsService';
import './AdSlot.css';

/**
 * Adsterra "IFRAME SYNC" units share a global `atOptions` variable — placing
 * two of them on one page makes them overwrite each other (only the last ad
 * renders, and with the wrong size). Fix: each atOptions unit renders inside
 * its own srcdoc iframe, fully isolating globals.
 */
function renderIsolated(container, html) {
  const width = (html.match(/width['"]?\s*:\s*['"]?(\d+)/) || [])[1] || 300;
  const height = (html.match(/height['"]?\s*:\s*['"]?(\d+)/) || [])[1] || 250;

  const iframe = document.createElement('iframe');
  iframe.width = String(width);
  iframe.height = String(height);
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('loading', 'lazy');
  iframe.title = 'advertisement';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.maxWidth = '100%';
  iframe.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>${html}</body></html>`;
  container.appendChild(iframe);
  return () => iframe.remove();
}

/**
 * Generic ad placeholder. Renders NOTHING (zero space, zero requests) unless:
 *   1. The slot exists + is enabled in the ManageAds panel
 *   2. The device matches the slot's target
 *   3. The container is near the viewport (lazy injection)
 * The ad config itself is fetched after app load (idle callback) — never blocks.
 */
export const AdSlot = React.memo(function AdSlot({ slotId, className = '', align = 'center' }) {
  const hostRef = useRef(null);
  const [slot, setSlot] = useState(null);
  const [device, setDevice] = useState(currentDevice());
  const [visible, setVisible] = useState(false);
  const cleanupRef = useRef(null);

  // 1. Deferred config fetch (after app load)
  useEffect(() => {
    let isCurrent = true;
    loadAdConfig().then(config => {
      if (!isCurrent) return;
      const found = (config.slots || []).find(s => s.slotId === slotId);
      if (found) setSlot(found);
    });
    return () => { isCurrent = false; };
  }, [slotId]);

  // 2. Device re-check on resize
  useEffect(() => {
    const onResize = () => setDevice(currentDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 3. Lazy: only interact when near viewport
  useEffect(() => {
    if (!slot || !hostRef.current) return undefined;
    const el = hostRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slot]);

  // 4. Inject the matching script (desktop/mobile)
  useEffect(() => {
    if (!slot || !visible || !hostRef.current) return undefined;
    const isMobile = device === 'mobile';
    const devices = slot.devices || 'both';
    if (devices !== 'both' && devices !== device) return undefined;

    const html = isMobile ? (slot.scriptMobile || slot.scriptDesktop) : (slot.scriptDesktop || slot.scriptMobile);
    if (!html) return undefined;

    // atOptions units get an isolated iframe; native/social scripts inject directly
    if (html.includes('atOptions')) {
      cleanupRef.current = renderIsolated(hostRef.current, html);
    } else {
      cleanupRef.current = injectAdHtml(hostRef.current, html);
    }
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [slot, visible, device]);

  if (!slot) return null;

  const devices = slot.devices || 'both';
  if (devices !== 'both' && devices !== device) return null;

  return (
    <div className={`fs-ad-slot ${className}`} data-slot={slotId} style={{ textAlign: align }} aria-hidden="true">
      <div className="fs-ad-slot-inner" ref={hostRef} />
    </div>
  );
});
