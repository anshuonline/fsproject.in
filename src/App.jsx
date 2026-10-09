import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { LibraryProvider } from './context/LibraryContext';
import { ContextMenuProvider } from './context/ContextMenuContext';
import { PWAProvider } from './context/PWAContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { Home } from './pages/Home/Home';
import { Explore } from './pages/Explore/Explore';
import { Library } from './pages/Library/Library';
import { Search } from './pages/Search/Search';
import { Favorites } from './pages/Favorites/Favorites';
import { PlaylistDetail } from './pages/PlaylistDetail/PlaylistDetail';
import { AlbumDetail } from './pages/AlbumDetail/AlbumDetail';
import { ArtistDetail } from './pages/ArtistDetail/ArtistDetail';
import { Followed } from './pages/Followed/Followed';
import { History } from './pages/History/History';
import { Profile } from './pages/Profile/Profile';
import { Settings } from './pages/Settings/Settings';
import { GAnalyticsLayout, Dashboard, LiveNow, RegisteredUsers, TopSearches, TopSongs, AdminLogs } from './pages/GAnalytics';
import { ConfirmDelete } from './pages/ConfirmDelete/ConfirmDelete';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { ResetPassword } from './pages/ResetPassword/ResetPassword';
import { PrivacyPolicy, TermsOfService, DmcaDisclaimer, AboutUs, ContactUs } from './pages/Legal';
import { ScrollToTop } from './components/Common/ScrollToTop';
import { SharedSongHandler } from './components/Common/SharedSongHandler';

export default function App() {
  // Suppress native browser context menu app-wide (custom GlobalContextMenu
  // handles right-click on cards/player). Editable fields keep native paste/copy.
  useEffect(() => {
    const suppressNativeMenu = (e) => {
      const t = e.target;
      const isEditable =
        t instanceof HTMLElement &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (!isEditable) e.preventDefault();
    };
    document.addEventListener('contextmenu', suppressNativeMenu, true);
    return () => document.removeEventListener('contextmenu', suppressNativeMenu, true);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ContextMenuProvider>
        <AuthProvider>
          <LibraryProvider>
            <PlayerProvider>
              <SharedSongHandler />
              <PWAProvider>
                <Routes>
                  {/* Main Application with Sidebar, Header, and Player */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/watch" element={<Home />} />
                    <Route path="/song/:id" element={<Home />} />
                    <Route path="/track/:id" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/playlist/:id" element={<PlaylistDetail />} />
                    <Route path="/album/:id" element={<AlbumDetail />} />
                    <Route path="/artist/:id" element={<ArtistDetail />} />
                    <Route path="/followed" element={<Followed />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* GAnalytics (Admin only, hidden from navigation) */}
                    <Route path="/ganalytics" element={<GAnalyticsLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="live" element={<LiveNow />} />
                      <Route path="users" element={<RegisteredUsers />} />
                      <Route path="searches" element={<TopSearches />} />
                      <Route path="songs" element={<TopSongs />} />
                      <Route path="logs" element={<AdminLogs />} />
                    </Route>
                    <Route path="/confirm-delete" element={<ConfirmDelete />} />

                    {/* Legal, AdSense & Policy Routes */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/dmca" element={<DmcaDisclaimer />} />
                    <Route path="/copyright" element={<Navigate to="/dmca" replace />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                  </Route>

                  {/* Auth Pages */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* Fallback to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PWAProvider>
            </PlayerProvider>
          </LibraryProvider>
        </AuthProvider>
      </ContextMenuProvider>
    </BrowserRouter>
  );
}
