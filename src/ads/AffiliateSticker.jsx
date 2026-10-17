import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import './AffiliateSticker.css';

const AFFILIATE_PRODUCTS = [
  {
    name: 'ZEBRONICS Astra 35 Speaker',
    imageUrl: 'https://m.media-amazon.com/images/I/319RaAZHSYL._SY300_SX300_QL70_ML2_.jpg',
    amazonUrl: 'https://www.amazon.in/dp/B0DJ3FFC8R?linkCode=ll2&tag=ganatubexfree-21&linkId=4e2c7d65e0477a3caa89f1f736b0738d&ref_=as_li_ss_tl',
    priceLabel: '₹699'
  }
];

/**
 * YouTube-Shorts-style Amazon product sticker.
 * Products: AFFILIATE_PRODUCTS above — rotates with a soft crossfade.
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
