import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Navigation/Header';
import { Sidebar } from '../components/Navigation/Sidebar';
import { MobileNav } from '../components/Navigation/MobileNav';
import { GlobalPlayer } from '../components/Player/GlobalPlayer';
import { FullScreenPlayer } from '../components/Player/FullScreenPlayer';
import { QueueDrawer } from '../components/Player/QueueDrawer';
import { usePlayer } from '../context/PlayerContext';
import './MainLayout.css';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('fs_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const { currentSong } = usePlayer();

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

        {/* Page Content Outlet */}
        <main className="fs-main-content">
          <Outlet />
        </main>
      </div>

      {/* Global Overlays & Players */}
      <GlobalPlayer />
      <FullScreenPlayer />
      <QueueDrawer />
      <MobileNav />
    </div>
  );
}
