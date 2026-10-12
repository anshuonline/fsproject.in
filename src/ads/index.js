// ─── FreeSong Ads module — single import point ───────────────────────────────
// Usage:
//   import { AdSlot, AffiliateSticker, SOCIAL_BAR_SCRIPT, ... } from '../ads';
// Config (units, slots, products, timings): src/ads/config.js

export { AdSlot } from './AdSlot';
export { AffiliateSticker } from './AffiliateSticker';
export { StickyBottomAd } from './StickyBottomAd';
export {
  UNITS,
  SLOTS,
  AFFILIATE_PRODUCTS,
  SOCIAL_BAR_SCRIPT,
  PLAYER_ROTATION_SECONDS,
  PLAYLIST_INFEED_EVERY,
  ALL_AD_UNITS_HTML,
  getSlotById
} from './config';
