// ─── ManageAds client service ────────────────────────────────────────────────
// Lag-free by design: the ad config is fetched AFTER the app has fully loaded
// (idle callback), slots inject their scripts only when near the viewport
// (IntersectionObserver inside AdSlot), and every network/style touch is async
// so the UI never blocks or shifts.

const API_BASE = '/api';

let configPromise = null;
let cachedConfig = null;

function whenAppIdle(fn) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 4000 });
  } else {
    setTimeout(fn, 2500);
  }
}

// Fetch the enabled ad slots + affiliate products once, after app load
export function loadAdConfig(force = false) {
  if (cachedConfig && !force) return Promise.resolve(cachedConfig);
  if (configPromise && !force) return configPromise;

  configPromise = new Promise((resolve) => {
    whenAppIdle(async () => {
      try {
        const res = await fetch(`${API_BASE}/ads/config`, { cache: 'no-store' });
        const data = await res.json();
        cachedConfig = data?.config || { slots: [], affiliates: [], settings: {} };
      } catch {
        cachedConfig = { slots: [], affiliates: [], settings: {} };
      }
      resolve(cachedConfig);
    });
  });
  return configPromise;
}

export function getCachedAdConfig() {
  return cachedConfig;
}

export async function getSlot(slotId) {
  const config = await loadAdConfig();
  return (config.slots || []).find(s => s.slotId === slotId) || null;
}

export async function getAffiliates() {
  const config = await loadAdConfig();
  return (config.affiliates || []).filter(a => a.amazonUrl);
}

export async function getAdSetting(key, fallback) {
  const config = await loadAdConfig();
  const val = parseInt(config.settings?.[key], 10);
  return Number.isFinite(val) && val > 0 ? val : fallback;
}

export function currentDevice() {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= 850 ? 'mobile' : 'desktop';
}

/**
 * Inject raw ad HTML (e.g. Adsterra unit code) into a container so that
 * <script> tags actually EXECUTE — innerHTML alone never runs scripts.
 * Returns a cleanup function that removes everything it added.
 */
export function injectAdHtml(container, html) {
  if (!container || !html) return () => {};
  const added = [];
  try {
    const tpl = document.createElement('div');
    tpl.innerHTML = html;
    const nodes = Array.from(tpl.childNodes);
    nodes.forEach(node => {
      let realNode = node;
      if (node.nodeName === 'SCRIPT') {
        realNode = document.createElement('script');
        Array.from(node.attributes).forEach(attr => realNode.setAttribute(attr.name, attr.value));
        if (node.src) {
          realNode.src = node.src;
        } else {
          realNode.textContent = node.textContent;
        }
        realNode.async = node.getAttribute('async') !== null ? true : realNode.async;
      }
      container.appendChild(realNode);
      added.push(realNode);
    });
  } catch (e) {
    console.warn('Ad inject failed:', e);
  }
  return () => {
    added.forEach(n => {
      try { n.remove(); } catch {}
    });
    if (container) container.innerHTML = '';
  };
}
