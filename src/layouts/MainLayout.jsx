import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Navigation/Header';
import { Sidebar } from '../components/Navigation/Sidebar';
import { MobileNav } from '../components/Navigation/MobileNav';
import { GlobalPlayer } from '../components/Player/GlobalPlayer';
import { FullScreenPlayer } from '../components/Player/FullScreenPlayer';
import { MiniPlayer } from '../components/Player/MiniPlayer';
import { QueueDrawer } from '../components/Player/QueueDrawer';
import { GlobalContextMenu } from '../components/Common/GlobalContextMenu';
import { EditPlaylistModal } from '../components/Common/EditPlaylistModal';
import { InactivityModal } from '../components/Common/InactivityModal';
import { ShortcutIndicator } from '../components/Common/ShortcutIndicator';
import { Toast } from '../components/Common/Toast';
import { Footer } from '../components/Navigation/Footer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { trackVisit, trackPresence } from '../services/analyticsService';
import { AdSlot, StickyBottomAd, SOCIAL_BAR_SCRIPT, ALL_AD_UNITS_HTML } from '../ads';
import { injectAdHtml, prewarmAdConnections } from '../services/adsService';
import './MainLayout.css';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 901 : true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('fs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const { currentSong } = usePlayer();

  // Global keyboard shortcuts (Space, arrows, Ctrl+K)
  useKeyboardShortcuts();

  // Track desktop breakpoint to prevent mobile from ever getting stuck in collapsed rail
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 901);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to top on navigation & close mobile drawer if open
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSidebarOpen(false);
  }, [location.pathname]);

  // Daily visit tracking (guest vs registered, re-fires on login)
  useEffect(() => {
    trackVisit(isAuthenticated ? user : null);
  }, [isAuthenticated]);

  // Live presence heartbeat (online status + now playing, every 60s — also when tab is hidden,
  // so background listeners stay visible in Live Now)
  useEffect(() => {
    const sendPresence = () => {
      trackPresence(isAuthenticated ? user : null, currentSong);
    };
    sendPresence();
    const interval = setInterval(sendPresence, 60000);

    // Screen locked / tab switched / app backgrounded: browsers throttle timers,
    // so fire an instant keepalive presence ping the moment visibility changes —
    // the last-known song stays fresh in the admin Live Now panel.
    const onVisibility = () => sendPresence();
    const onPageHide = () => sendPresence();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [currentSong, isAuthenticated, user]);

  const effectiveCollapsed = isDesktop && isSidebarCollapsed;

  // Ads are hidden on the analytics admin area
  const isAdminArea = location.pathname.startsWith('/ganalytics');

  // Sidebar sticky rail — desktop >= 1400px only (hardcoded slot always on)
  const [hasAdRail, setHasAdRail] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1400 : false
  );
  useEffect(() => {
    if (isAdminArea) {
      setHasAdRail(false);
      return undefined;
    }
    const onResize = () => setHasAdRail(window.innerWidth >= 1400);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isAdminArea]);

  // Social Bar — global floating script, injected once on mount (hardcoded)
  useEffect(() => {
    if (isAdminArea) return undefined;
    const host = document.createElement('div');
    host.id = 'fs-social-bar-host';
    host.style.display = 'none';
    document.body.appendChild(host);
    const cleanup = injectAdHtml(host, SOCIAL_BAR_SCRIPT);
    return () => {
      cleanup();
      document.getElementById('fs-social-bar-host')?.remove();
    };
  }, [isAdminArea]);

  // Prewarm ad-network connections (DNS/TLS) after idle — faster ad fill with
  // zero perf cost (link hints only, no fetches, never blocks the app)
  useEffect(() => {
    if (isAdminArea) return undefined;
    prewarmAdConnections(ALL_AD_UNITS_HTML);
    return undefined;
  }, [isAdminArea]);

  const handleCloseSidebar = React.useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = React.useCallback(() => {
    if (window.innerWidth >= 901) {
      setIsSidebarCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('fs_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, []);

  return (
    <div
      className={`fs-app-layout ${currentSong ? 'has-player' : ''} ${
        effectiveCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />

      {/* Header banner strip (hidden on the analytics admin area) */}
      {!isAdminArea && <AdSlot slotId="header_banner" className="fs-ad-slot--header" />}

      {/* Main Body */}
      <div className={`fs-layout-body ${hasAdRail ? 'has-ad-rail' : ''} ${!isAdminArea ? 'has-header-ad' : ''}`}>
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          isCollapsed={effectiveCollapsed}
        />

        {/* Page Content Outlet & Footer */}
        <main className="fs-main-content">
          <Outlet />
          <Footer />
        </main>

        {/* Desktop sticky ad rail (≥1400px, only when enabled) */}
        {hasAdRail && (
          <aside className="fs-ad-rail" aria-hidden="true">
            <AdSlot slotId="sidebar_sticky" className="fs-ad-slot--sidebar" />
          </aside>
        )}
      </div>

      {/* Global Overlays & Players */}
      <GlobalPlayer />
      <MiniPlayer />
      <FullScreenPlayer />
      <QueueDrawer />
      <MobileNav />
      <GlobalContextMenu />
      <EditPlaylistModal />
      <InactivityModal />
      <ShortcutIndicator />
      <Toast />
    </div>
  );
}
