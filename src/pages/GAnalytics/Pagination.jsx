import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('…');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('…');
  items.push(total);
  return items;
}

// Spotify-style pagination: "Showing X–Y of Z" + numbered pills with ellipsis
export function Pagination({ page, pages, total, label = 'items', pageSize = 10, onPage }) {
  const totalPages = Math.max(1, Number(pages) || 1);
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const totalCount = Number(total) || 0;
  const size = Math.max(1, Number(pageSize) || 10);

  if (totalPages <= 1 || totalCount === 0) return null;

  const shownFrom = (currentPage - 1) * size + 1;
  const shownTo = Math.min(currentPage * size, totalCount);

  const go = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPage?.(p);
  };

  return (
    <nav className="fs-ga-pagination" aria-label="Pagination">
      <span className="fs-ga-pagination-info">
        Showing {shownFrom.toLocaleString('en-IN')}–{shownTo.toLocaleString('en-IN')} of {totalCount.toLocaleString('en-IN')} {label}
      </span>
      <div className="fs-ga-pagination-controls">
        <button
          type="button"
          className="fs-ga-pagination-btn nav"
          disabled={currentPage <= 1}
          onClick={() => go(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {getPageItems(currentPage, totalPages).map((item, i) => (
          item === '…' ? (
            <span key={`gap-${i}`} className="fs-ga-pagination-gap">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`fs-ga-pagination-btn ${item === currentPage ? 'active' : ''}`}
              onClick={() => go(item)}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
            >
              {item}
            </button>
          )
        ))}
        <button
          type="button"
          className="fs-ga-pagination-btn nav"
          disabled={currentPage >= totalPages}
          onClick={() => go(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
