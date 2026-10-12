import React from 'react';
import { AdSlot } from './AdSlot';
import { usePlayer } from '../context/PlayerContext';
import './DesktopFloatingAd.css';

/**
 * Desktop floating ad pill — bottom-right, above the GlobalPlayer bar.
 * Mobile ke sticky bottom strip jaisa hi look, PC ke liye. ≥901px pe dikhta
 * hai (mobile pe wahan StickyBottomAd hai), song play hone pe player ke
 * upar lift hota hai. Empty re patha hai to invisible (no empty box).
 */
export function DesktopFloatingAd() {
  const { currentSong } = usePlayer();

  return (
    <div
      className={`fs-desktop-floating-ad ${currentSong ? 'lifted' : ''}`}
      aria-hidden="true"
    >
      <AdSlot slotId="floating_desktop" />
    </div>
  );
}
