import React, { useEffect, useRef, useState } from 'react';
import { injectAdHtml, queueAdUnitInjection, currentDevice } from '../services/adsService';
import { SLOTS, getSlotById } from './config';
import './AdSlot.css';

/**
 * Ad placeholder — injects the hardcoded unit when the app is interactive AND
 * the container is near the viewport. atOptions units go through the sequential
 * queue (fresh script elements), native/social scripts inject directly.
 * After injection the container is verified once: if the ad network produced
 * nothing (blocked, no fill, hung script) the unit is retried exactly once.
 *
 * Units & slot map: src/ads/config.js — edit there, not here.
 */
export const AdSlot = React.memo(function AdSlot({ slotId, className = '', align = 'center' }) {
  const hostRef = useRef(null);
  const slot = getSlotById(slotId);
  const [device, setDevice] = useState(currentDevice());
  const [visible, setVisible] = useState(false);
  const [armed, setArmed] = useState(false);
  const cleanupRef = useRef(null);

  // Device re-check on resize
  useEffect(() => {
    const onResize = () => setDevice(currentDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Arm only after the app is idle — ads always yield to app load, never
  // compete with hydration/first paint for network or main-thread time
  useEffect(() => {
    const arm = () => setArmed(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(arm, { timeout: 3500 });
      return () => {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(id);
      };
    }
    const t = setTimeout(arm, 2500);
    return () => clearTimeout(t);
  }, []);

  // Lazy: only inject when near the viewport
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

  // Inject the matching unit (desktop/mobile) + one-shot render verification
  useEffect(() => {
    if (!slot || !visible || !armed || !hostRef.current) return undefined;
    const isMobile = device === 'mobile';
    const devices = slot.devices || 'both';
    if (devices !== 'both' && devices !== device) return undefined;

    const html = isMobile ? (slot.scriptMobile || slot.scriptDesktop) : (slot.scriptDesktop || slot.scriptMobile);
    if (!html) return undefined;
    const host = hostRef.current;

    let verifyTimer = null;
    let retried = false;

    // If nothing rendered (adblock, no fill, hung script) — retry once
    const verify = () => {
      verifyTimer = setTimeout(() => {
        const el = hostRef.current;
        if (!el || retried) return;
        if (el.querySelector('iframe, img, ins, embed, video')) return;
        retried = true;
        console.info(`[AdSlot] empty after wait — retrying "${slotId}" once`);
        if (cleanupRef.current) cleanupRef.current();
        el.innerHTML = '';
        cleanupRef.current = html.includes('atOptions')
          ? queueAdUnitInjection(el, html, verify)
          : injectAdHtml(el, html);
      }, 6000);
    };

    console.info(`[AdSlot] injecting "${slotId}" (${device}, ${html.includes('atOptions') ? 'atOptions-unit' : 'direct'})`);
    if (html.includes('atOptions')) {
      cleanupRef.current = queueAdUnitInjection(host, html, verify);
    } else {
      cleanupRef.current = injectAdHtml(host, html);
      verify();
    }
    return () => {
      if (verifyTimer) clearTimeout(verifyTimer);
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [slot, visible, armed, device, slotId]);

  if (!slot) return null;

  const devices = slot.devices || 'both';
  if (devices !== 'both' && devices !== device) return null;

  return (
    <div className={`fs-ad-slot ${className}`} data-slot={slotId} style={{ textAlign: align }} aria-hidden="true">
      <div className="fs-ad-slot-inner" ref={hostRef} />
    </div>
  );
});
