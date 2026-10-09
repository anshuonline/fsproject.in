import React, { useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Shelf.css';

export function Shelf({ eyebrow, title, subtitle, carousel = false, action = null, children }) {
  const rowRef = useRef(null);

  const scroll = useCallback((direction) => {
    if (!rowRef.current) return;
    const amount = Math.max(rowRef.current.clientWidth * 0.8, 320);
    rowRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  return (
    <section className="fs-shelf-block">
      <div className="fs-shelf-block-header">
        <div className="fs-shelf-block-titles">
          {eyebrow && <span className="fs-shelf-block-eyebrow">{eyebrow}</span>}
          {title && <h2 className="fs-shelf-block-title">{title}</h2>}
          {subtitle && <p className="fs-shelf-block-subtitle">{subtitle}</p>}
        </div>
        <div className="fs-shelf-block-actions">
          {action}
          {carousel && (
            <div className="fs-shelf-block-nav">
              <button
                className="fs-shelf-block-btn"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="fs-shelf-block-btn"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className={carousel ? 'fs-shelf-block-row' : 'fs-shelf-block-body'}
        ref={carousel ? rowRef : undefined}
      >
        {children}
      </div>
    </section>
  );
}
