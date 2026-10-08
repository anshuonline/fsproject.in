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
  const { currentSong } = usePlayer();

  return (
    <div className={`fs-app-layout ${currentSong ? 'has-player' : ''}`}>
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* Main Body */}
      <div className="fs-layout-body">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
