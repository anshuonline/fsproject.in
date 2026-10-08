import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop guarantees that navigation across routes, query params, or links
 * instantly resets the viewport to the top of the page, preventing scroll anchoring
 * to footers or bottom content.
 */
export function ScrollToTop() {
  const { pathname, search, key } = useLocation();

  useEffect(() => {
    // Disable browser automatic scroll restoration to avoid jumping to old positions
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Immediately reset scroll on window, document, and layout container
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const mainContent = document.querySelector('.fs-main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [pathname, search, key]);

  return null;
}
