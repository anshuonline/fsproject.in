import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { LibraryProvider } from './context/LibraryContext';
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
import { History } from './pages/History/History';
import { Profile } from './pages/Profile/Profile';
import { Settings } from './pages/Settings/Settings';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <LibraryProvider>
          <Routes>
            {/* Main Application with Sidebar, Header, and Player */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/library" element={<Library />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Auth Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LibraryProvider>
      </PlayerProvider>
    </BrowserRouter>
  );
}
