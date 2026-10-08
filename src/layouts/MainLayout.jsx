import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Navigation/Header';
import { Sidebar } from '../components/Navigation/Sidebar';
import { MobileNav } from '../components/Navigation/MobileNav';
import { GlobalPlayer } from '../components/Player/GlobalPlayer';
import { FullScreenPlayer } from '../components/Player/FullScreenPlayer';
import { QueueDrawer } from '../components/Player/QueueDrawer';
import { GlobalContextMenu } from '../components/Common/GlobalContextMenu';
import { Toast } from '../components/Common/Toast';
import { Footer } from '../components/Navigation/Footer';
import { usePlayer } from '../context/PlayerContext';
import './MainLayout.css';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('fs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const { currentSong } = usePlayer();

  // Scroll to top on navigation so user lands at top of legal/feature pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 900) {
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
  };

  return (
    <div
      className={`fs-app-layout ${currentSong ? 'has-player' : ''} ${
        isSidebarCollapsed ? 'sidebar-collapsed' : ''
      }`}
    >
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />

      {/* Main Body */}
      <div className="fs-layout-body">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
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
      <Toast />
    </div>
  );
}
