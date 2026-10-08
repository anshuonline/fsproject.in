import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="fs-auth-layout">
      <div className="fs-auth-header">
        <Link to="/" className="fs-auth-brand">
          <img src="/images/freesonglogowebp.webp" alt="FreeSong.in" className="fs-auth-logo" />
          <span className="fs-auth-brand-name">FreeSong.in</span>
        </Link>
      </div>

      <div className="fs-auth-body">
        <Outlet />
      </div>

      <div className="fs-auth-footer">
        <p>© {new Date().getFullYear()} FreeSong.in • Modern AMOLED Music Streaming</p>
      </div>
    </div>
  );
}
