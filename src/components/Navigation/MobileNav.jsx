import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, Search } from 'lucide-react';
import './MobileNav.css';

export function MobileNav() {
  return (
    <nav className="fs-mobile-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `fs-mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `fs-mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/library"
        className={({ isActive }) => `fs-mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Bookmark size={20} />
        <span>Library</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => `fs-mob-nav-item ${isActive ? 'active' : ''}`}
      >
        <Search size={20} />
        <span>Search</span>
      </NavLink>
    </nav>
  );
}
