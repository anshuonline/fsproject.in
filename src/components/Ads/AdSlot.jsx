import React, { useEffect, useRef, useState } from 'react';
import { injectAdHtml, queueAdUnitInjection, currentDevice } from '../../services/adsService';
import './AdSlot.css';

// ═══════════════════════════════════════════════════════════════════════
// HARDCODED ADSTERRA UNITS — no config fetch, no DB, no panel dependency.
// Scripts render directly. Edit here to change any unit.
// ═══════════════════════════════════════════════════════════════════════

const U = {
  W728H90: `<script>
  atOptions = {
    'key' : '4a50ee1eee52c95c476154cd4848efe0',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/4a50ee1eee52c95c476154cd4848efe0/invoke.js"></script>`,
  W320H50: `<script>
  atOptions = {
    'key' : 'd41b950b9ce839eb2f788b9e25a3f970',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/d41b950b9ce839eb2f788b9e25a3f970/invoke.js"></script>`,
  W300H250: `<script>
  atOptions = {
    'key' : 'e6ecff65fcc25cd4064b4ff7af8bc342',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/e6ecff65fcc25cd4064b4ff7af8bc342/invoke.js"></script>`,
  W160H600: `<script>
  atOptions = {
    'key' : 'f53f12d8edfa281f43e7276c7070aa4f',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/f53f12d8edfa281f43e7276c7070aa4f/invoke.js"></script>`,
  NATIVE: `<script async="async" data-cfasync="false" src="https://pl31781023.profitableratecpmnetwork.com/d4ad762d4e64e13cc862cec4e707fc44/invoke.js"></script>
<div id="container-d4ad762d4e64e13cc862cec4e707fc44"></div>`,
  SOCIAL_BAR: `<script src="https://pl31781024.profitableratecpmnetwork.com/8f/2a/43/8f2a43bcad420c2d0d24fe4a00b3c484.js"></script>`
};

// Slot map — same shape the components already consume
const HARDCODED_SLOTS = {
  header_banner: { devices: 'both', scriptDesktop: U.W728H90, scriptMobile: U.W320H50 },
  infeed_shelf_1: { devices: 'both', scriptDesktop: U.W728H90, scriptMobile: U.W300H250 },
  infeed_shelf_2: { devices: 'both', scriptDesktop: U.NATIVE, scriptMobile: U.NATIVE },
  sidebar_sticky: { devices: 'desktop', scriptDesktop: U.W160H600, scriptMobile: '' },
  detail_rectangle: { devices: 'both', scriptDesktop: U.W300H250, scriptMobile: U.W300H250 },
  search_native: { devices: 'both', scriptDesktop: U.NATIVE, scriptMobile: U.NATIVE },
  playlist_infeed: { devices: 'both', scriptDesktop: U.W728H90, scriptMobile: U.W300H250 },
  player_cover_rotate: { devices: 'both', scriptDesktop: U.W300H250, scriptMobile: U.W300H250 }
};

// Amazon affiliate products (rotates when 2+ are listed)
export const AFFILIATE_PRODUCTS = [
  {
    name: 'ZEBRONICS Astra 35 Speaker',
    imageUrl: 'https://m.media-amazon.com/images/I/319RaAZHSYL._SY300_SX300_QL70_ML2_.jpg',
    amazonUrl: 'https://www.amazon.in/dp/B0DJ3FFC8R?linkCode=ll2&tag=ganatubexfree-21&linkId=4e2c7d65e0477a3caa89f1f736b0738d&ref_=as_li_ss_tl',
    priceLabel: '₹699'
  }
];

export const SOCIAL_BAR_SCRIPT = U.SOCIAL_BAR;
export const PLAYER_ROTATION_SECONDS = 5;
export const PLAYLIST_INFEED_EVERY = 5;

export function getHardcodedSlot(slotId) {
  return HARDCODED_SLOTS[slotId] || null;
}

/**
 * Ad placeholder — injects the hardcoded unit when the container is near the
 * viewport. atOptions units go through the sequential queue (fresh script
 * elements), native/social scripts inject directly.
 */
export const AdSlot = React.memo(function AdSlot({ slotId, className = '', align = 'center' }) {
  const hostRef = useRef(null);
  const slot = HARDCODED_SLOTS[slotId] || null;
  const [device, setDevice] = useState(currentDevice());
  const [visible, setVisible] = useState(false);
  const cleanupRef = useRef(null);

  // Device re-check on resize
  useEffect(() => {
    const onResize = () => setDevice(currentDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  // Inject the matching unit (desktop/mobile)
  useEffect(() => {
    if (!slot || !visible || !hostRef.current) return undefined;
    const isMobile = device === 'mobile';
    const devices = slot.devices || 'both';
    if (devices !== 'both' && devices !== device) return undefined;

    const html = isMobile ? (slot.scriptMobile || slot.scriptDesktop) : (slot.scriptDesktop || slot.scriptMobile);
    if (!html) return undefined;

    console.info(`[AdSlot] injecting "${slotId}" (${device}, ${html.includes('atOptions') ? 'atOptions-unit' : 'direct'})`);
    if (html.includes('atOptions')) {
      cleanupRef.current = queueAdUnitInjection(hostRef.current, html);
    } else {
      cleanupRef.current = injectAdHtml(hostRef.current, html);
    }
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = null;
    };
  }, [slot, visible, device, slotId]);

  if (!slot) return null;

  const devices = slot.devices || 'both';
  if (devices !== 'both' && devices !== device) return null;

  return (
    <div className={`fs-ad-slot ${className}`} data-slot={slotId} style={{ textAlign: align }} aria-hidden="true">
      <div className="fs-ad-slot-inner" ref={hostRef} />
    </div>
  );
});
