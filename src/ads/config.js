// ═══════════════════════════════════════════════════════════════════════
// FreeSong Ads — SINGLE SOURCE OF TRUTH
// ─────────────────────────────────────────────────────────────────────────
// Sab kuch yahi se manage hota hai:
//   1. UNITS            → raw ad-network HTML (Adsterra atOptions / native / social)
//   2. SLOTS            → kaunsa unit kis jagah render hoga (desktop/mobile/devices)
//   3. AFFILIATE_PRODUCTS → Amazon affiliate sticker products
//   4. SETTINGS         → rotation timings
// Yahan edit karo — component files ko touch karne ki zarurat nahi.
// ═══════════════════════════════════════════════════════════════════════

// ── 1. UNITS — raw ad-network HTML ──────────────────────────────────────
export const UNITS = {
  W728H90: `<script>
  window.atOptions = {
    'key' : '4a50ee1eee52c95c476154cd4848efe0',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
  var atOptions = window.atOptions;
</script>
<script src="https://www.highrevenueformat.com/4a50ee1eee52c95c476154cd4848efe0/invoke.js"></script>`,
  W320H50: `<script>
  window.atOptions = {
    'key' : 'd41b950b9ce839eb2f788b9e25a3f970',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
  var atOptions = window.atOptions;
</script>
<script src="https://www.highrevenueformat.com/d41b950b9ce839eb2f788b9e25a3f970/invoke.js"></script>`,
  W300H250: `<script>
  window.atOptions = {
    'key' : 'e6ecff65fcc25cd4064b4ff7af8bc342',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
  var atOptions = window.atOptions;
</script>
<script src="https://www.highrevenueformat.com/e6ecff65fcc25cd4064b4ff7af8bc342/invoke.js"></script>`,
  W160H600: `<script>
  window.atOptions = {
    'key' : 'f53f12d8edfa281f43e7276c7070aa4f',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
  var atOptions = window.atOptions;
</script>
<script src="https://www.highrevenueformat.com/f53f12d8edfa281f43e7276c7070aa4f/invoke.js"></script>`,
  NATIVE: `<script async="async" data-cfasync="false" src="https://pl31781023.profitableratecpmnetwork.com/d4ad762d4e64e13cc862cec4e707fc44/invoke.js"></script>
<div id="container-d4ad762d4e64e13cc862cec4e707fc44"></div>`,
  SOCIAL_BAR: `<script src="https://pl31781024.profitableratecpmnetwork.com/8f/2a/43/8f2a43bcad420c2d0d24fe4a00b3c484.js"></script>`,
  // HilltopAds "MultiTag: Banner 300x250" — entry splash ad (EntrySplashAd.jsx).
  HILLTOP_300X250: `<script>(function(vho){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = vho || {};
s.src = "\/\/massivesalad.com\/b\/X.VLs_dzGglA0WYlWicN\/deBmP9juvZ_UElIkdPcT\/c\/1iMbTIIpxTMwjREBtRNmz\/UqxhMcjQE\/y\/N\/Qw";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`,
  // HilltopAds test zone #2 — splash pe compare karne ke liye.
  // Wapas purana chahiye to ENTRY_SPLASH_UNIT ko UNITS.HILLTOP_300X250 kar do.
  HILLTOP_300X250_V2: `<script>(function(jproub){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = jproub || {};
s.src = "\/\/massivesalad.com\/bUXAVFs.d_G\/lS0NYIWOcN\/QedmD9quSZmUVl\/ksPSTSc\/1\/MQTAI\/xzNITjMot\/NRz-UWx\/M\/j\/E\/1FNfwA";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`
};

// ── 2. SLOTS — placement map (components refer by slotId) ───────────────
// devices: 'both' | 'desktop' | 'mobile'
export const SLOTS = {
  header_banner: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W320H50 },
  // Home dynamic in-feed shelf slots — responsive: 728x90 on Desktop, 300x250 on Mobile
  infeed_shelf_1: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  infeed_shelf_2: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  infeed_shelf_3: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  infeed_shelf_4: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  infeed_shelf_5: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  infeed_shelf_6: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  sidebar_sticky: { devices: 'desktop', scriptDesktop: UNITS.W160H600, scriptMobile: '' },
  detail_rectangle: { devices: 'both', scriptDesktop: UNITS.W300H250, scriptMobile: UNITS.W300H250 },
  search_native: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  playlist_infeed: { devices: 'both', scriptDesktop: UNITS.W728H90, scriptMobile: UNITS.W300H250 },
  player_cover_rotate: { devices: 'both', scriptDesktop: UNITS.W300H250, scriptMobile: UNITS.W300H250 },
  // Mobile sticky bottom banner (above MobileNav, lifts above the player card
  // while playing) — see StickyBottomAd.jsx
  sticky_bottom: { devices: 'mobile', scriptDesktop: '', scriptMobile: UNITS.W320H50 },
  // Desktop floating pill (bottom-right, above the player bar) — mirrors the
  // mobile sticky strip so PC users bhi wahi floating ad dekhein
  floating_desktop: { devices: 'desktop', scriptDesktop: UNITS.W320H50, scriptMobile: '' }
};

export function getSlotById(slotId) {
  return SLOTS[slotId] || null;
}

// ── 3. AFFILIATE PRODUCTS — Amazon sticker (rotates when 2+) ────────────
export const AFFILIATE_PRODUCTS = [
  {
    name: 'ZEBRONICS Astra 35 Speaker',
    imageUrl: 'https://m.media-amazon.com/images/I/319RaAZHSYL._SY300_SX300_QL70_ML2_.jpg',
    amazonUrl: 'https://www.amazon.in/dp/B0DJ3FFC8R?linkCode=ll2&tag=ganatubexfree-21&linkId=4e2c7d65e0477a3caa89f1f736b0738d&ref_=as_li_ss_tl',
    priceLabel: '₹699'
  }
];

// ── 4. SETTINGS ─────────────────────────────────────────────────────────
export const SOCIAL_BAR_SCRIPT = UNITS.SOCIAL_BAR;
export const PLAYER_ROTATION_SECONDS = 5;   // full-screen player cover-ad rotation
export const PLAYLIST_INFEED_EVERY = 5;     // playlist rows between in-feed ads
export const ENTRY_SPLASH_SECONDS = 6;      // entry splash countdown (forced view)
export const ENTRY_SPLASH_COOLDOWN_HOURS = 24; // splash itne ghante baad dubara dikhe
export const ENTRY_SPLASH_UNIT = UNITS.HILLTOP_300X250_V2;

// Every unit's raw HTML — used by MainLayout to prewarm ad-network connections
export const ALL_AD_UNITS_HTML = Object.values(UNITS);
