import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Navigation/Header';
import { Sidebar } from '../components/Navigation/Sidebar';
import { MobileNav } from '../components/Navigation/MobileNav';
import { GlobalPlayer } from '../components/Player/GlobalPlayer';
import { FullScreenPlayer } from '../components/Player/FullScreenPlayer';
import { QueueDrawer } from '../components/Player/QueueDrawer';
import { GlobalContextMenu } from '../components/Common/GlobalContextMenu';
import { EditPlaylistModal } from '../components/Common/EditPlaylistModal';
import { InactivityModal } from '../components/Common/InactivityModal';
import { Toast } from '../components/Common/Toast';
import { Footer } from '../components/Navigation/Footer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { trackVisit } from '../services/analyticsService';
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

  const effectiveCollapsed = isDesktop && isSidebarCollapsed;

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

      {/* Main Body */}
      <div className="fs-layout-body">
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
      </div>

      {/* Global Overlays & Players */}
      <GlobalPlayer />
      <FullScreenPlayer />
      <QueueDrawer />
      <MobileNav />
      <GlobalContextMenu />
      <EditPlaylistModal />
      <InactivityModal />
      <Toast />
    </div>
  );
}
