import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useProgressiveList
 * High-performance progressive rendering hook for large track lists (1,500+ items).
 * Renders an initial batch (default 40 items) and progressively reveals more
 * as the user scrolls near the bottom sentinel.
 *
 * Designed with strict throttling and reference stability to prevent
 * any flickering, layout bouncing, or re-render loops.
 *
 * @param {Array} items - The source list of items
 * @param {Object} [options]
 * @param {number} [options.initialBatch=40] - Items to render on initial load
 * @param {number} [options.batchSize=40] - Items to append on each scroll trigger
 * @param {string} [options.rootMargin='300px'] - Preload margin ahead of scroll
 * @param {React.RefObject} [options.rootRef=null] - Scroll container ref (null = window)
 * @param {any} [options.resetKey=null] - Explicit key to trigger a reset (e.g. search query, playlist id)
 */
export function useProgressiveList(items = [], options = {}) {
  const {
    initialBatch = 40,
    batchSize = 40,
    rootMargin = '300px',
    rootRef = null,
    resetKey = null
  } = options;

  const safeItems = Array.isArray(items) ? items : [];
  const itemsLength = safeItems.length;

  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const sentinelRef = useRef(null);

  // Synchronous refs for state values to avoid recreating observer on every render
  const visibleCountRef = useRef(visibleCount);
  visibleCountRef.current = visibleCount;

  const itemsLengthRef = useRef(itemsLength);
  itemsLengthRef.current = itemsLength;

  const isThrottledRef = useRef(false);

  // Track previous resetKey and itemsLength to only reset when genuinely intended
  const prevResetKeyRef = useRef(resetKey);
  const prevLengthRef = useRef(itemsLength);

  useEffect(() => {
    const keyChanged = prevResetKeyRef.current !== resetKey;
    const lengthChanged = prevLengthRef.current !== itemsLength;

    if (keyChanged || lengthChanged) {
      prevResetKeyRef.current = resetKey;
      prevLengthRef.current = itemsLength;
      setVisibleCount(initialBatch);
      visibleCountRef.current = initialBatch;
    }
  }, [resetKey, itemsLength, initialBatch]);

  const loadMore = useCallback(() => {
    if (isThrottledRef.current) return;
    if (visibleCountRef.current >= itemsLengthRef.current) return;

    isThrottledRef.current = true;
    setVisibleCount(prev => {
      const next = Math.min(itemsLengthRef.current, prev + batchSize);
      visibleCountRef.current = next;
      return next;
    });

    // Throttled latch release prevents tight loop rapid firing
    setTimeout(() => {
      isThrottledRef.current = false;
    }, 150);
  }, [batchSize]);

  const loadAll = useCallback(() => {
    setVisibleCount(itemsLengthRef.current);
    visibleCountRef.current = itemsLengthRef.current;
  }, []);

  // Stable IntersectionObserver that observes the sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const rootElement = rootRef?.current || null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: rootElement,
        rootMargin,
        threshold: 0.05
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [rootRef?.current, rootMargin, loadMore]);

  const safeVisibleCount = Math.min(visibleCount, itemsLength);
  const visibleItems = safeItems.slice(0, safeVisibleCount);
  const hasMore = safeVisibleCount < itemsLength;

  return {
    visibleItems,
    visibleCount: safeVisibleCount,
    totalCount: itemsLength,
    hasMore,
    sentinelRef,
    loadMore,
    loadAll
  };
}
