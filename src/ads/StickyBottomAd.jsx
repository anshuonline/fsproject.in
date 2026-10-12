import React from 'react';
import { AdSlot } from './AdSlot';
import { usePlayer } from '../context/PlayerContext';
import './StickyBottomAd.css';

/**
 * Mobile sticky bottom banner — the MELBET-style footer ad.
 * Sits directly above the bottom nav, and lifts up above the floating
 * player card whenever a song is loaded/playing (transition animated).
 * Mobile only (config slot is devices:'mobile', CSS hides on desktop).
 */
export function StickyBottomAd() {
  const { currentSong } = usePlayer();

  return (
    <div
      className={`fs-sticky-bottom-ad ${currentSong ? 'lifted' : ''}`}
      aria-hidden="true"
    >
      <AdSlot slotId="sticky_bottom" />
    </div>
  );
}
