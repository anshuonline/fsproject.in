import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { AFFILIATE_PRODUCTS } from './AdSlot';
import './AffiliateSticker.css';

/**
 * YouTube-Shorts-style Amazon product sticker (hardcoded products).
 * Rotates through AFFILIATE_PRODUCTS with a soft crossfade.
 */
export const AffiliateSticker = React.memo(function AffiliateSticker({ position = 'bottom-left', className = '' }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const products = AFFILIATE_PRODUCTS.filter(p => p.amazonUrl);

  // Rotate only when there is something to rotate and the tab is visible
  useEffect(() => {
    if (products.length < 2) return undefined;
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setFading(true);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % products.length);
        setFading(false);
      }, 320);
    }, 18000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;
  const product = products[index % products.length];

  return (
    <a
      href={product.amazonUrl}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={`fs-affiliate-sticker fs-affiliate-sticker--${position} ${className} ${fading ? 'fading' : ''}`}
      aria-label={`View ${product.name} on Amazon (sponsored)`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="fs-affiliate-thumb">
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </span>
      <span className="fs-affiliate-info">
        <span className="fs-affiliate-tag">Sponsored</span>
        <span className="fs-affiliate-name">{product.name}</span>
        {product.priceLabel && <span className="fs-affiliate-price">{product.priceLabel}</span>}
      </span>
      <ExternalLink size={14} className="fs-affiliate-arrow" />
    </a>
  );
});
