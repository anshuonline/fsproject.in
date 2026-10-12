// ─── Ad injection service ─────────────────────────────────────────────────────
// Lag-free by design: slots inject their scripts only when near the viewport
// (IntersectionObserver inside AdSlot) and every script touch is async so the
// UI never blocks or shifts. Units are hardcoded in AdSlot.jsx.

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

// ── Sequential injection queue ───────────────────────────────────────────────
// Adsterra "IFRAME SYNC" units share a global `atOptions` variable. If two
// units initialize simultaneously they overwrite each other and only one ad
// renders (with the wrong size). Queueing makes every unit's invoke.js read
// the correct atOptions before the next unit loads — no srcdoc hacks needed.

let adInjectionQueue = Promise.resolve();

async function runUnitInjection(container, html) {
  const tpl = document.createElement('div');
  tpl.innerHTML = html;
  const nodes = Array.from(tpl.childNodes);
  for (const node of nodes) {
    if (node.nodeName === 'SCRIPT') {
      // CRITICAL: never re-append a script node parsed from innerHTML — it
      // will NOT execute (already-started semantics), leaving `atOptions`
      // unset. Always create a FRESH script element.
      const script = document.createElement('script');
      Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      if (node.src) {
        script.src = node.src;
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = resolve;
          container.appendChild(script);
          // Safety valve: never let a hung ad network block the queue
          setTimeout(resolve, 8000);
        });
      } else {
        script.textContent = node.textContent;
        container.appendChild(script); // executes synchronously, sets atOptions
      }
    } else {
      container.appendChild(node);
    }
  }
}

// ── Prewarm: DNS/TLS warm-up for ad network hosts ────────────────────────────
// Runs after the app is idle. Pure <link rel="preconnect"> hints — no fetches,
// no main-thread work, zero perf impact. Slotted units then load their
// invoke.js over an already-open connection (much faster first fill).

function whenAppIdle(fn) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 4000 });
  } else {
    setTimeout(fn, 2500);
  }
}

export function prewarmAdConnections(unitHtmlList) {
  if (typeof document === 'undefined') return;
  whenAppIdle(() => {
    try {
      const origins = new Set();
      (unitHtmlList || []).forEach((html) => {
        if (!html) return;
        const re = /(?:src|href)\s*=\s*["'](https?:\/\/[^/"'\s]+)/g;
        let m;
        while ((m = re.exec(html)) !== null) origins.add(m[1]);
      });
      origins.forEach((origin) => {
        if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
        const dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = origin;
        document.head.appendChild(dns);
      });
    } catch {}
  });
}

/**
 * Queue an Adsterra atOptions unit. Returns a cleanup function.
 * `onSettled` fires once the unit's scripts finished loading (or gave up) —
 * used by AdSlot to verify an actual render and retry empty slots once.
 */
export function queueAdUnitInjection(container, html, onSettled) {
  if (!container || !html) {
    if (onSettled) onSettled();
    return () => {};
  }
  let cleaned = false;
  adInjectionQueue = adInjectionQueue
    .then(() => runUnitInjection(container, html))
    .catch((e) => console.warn('Ad unit inject failed:', e))
    .then(() => {
      if (!cleaned && onSettled) onSettled();
    });
  return () => {
    cleaned = true;
    try { container.innerHTML = ''; } catch {}
  };
}

export function currentDevice() {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= 850 ? 'mobile' : 'desktop';
}
