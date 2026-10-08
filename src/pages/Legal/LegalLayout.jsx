import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, FileText, Lock, AlertTriangle, Users, Mail } from 'lucide-react';
import './Legal.css';

const LEGAL_TABS = [
  { path: '/privacy', label: 'Privacy Policy', icon: Lock },
  { path: '/terms', label: 'Terms of Service', icon: FileText },
  { path: '/dmca', label: 'DMCA & Disclaimer', icon: AlertTriangle },
  { path: '/about', label: 'About FreeSong', icon: Users },
  { path: '/contact', label: 'Contact Us', icon: Mail }
];

export function LegalLayout({
  badge = 'OFFICIAL COMPLIANCE',
  title,
  subtitle,
  lastUpdated,
  children
}) {
  const displayLastUpdated = lastUpdated || `${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}`;
  return (
    <div className="fs-legal-page">
      {/* Breadcrumbs */}
      <div className="fs-legal-breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span>Legal</span>
        <ChevronRight size={14} />
        <span className="current">{title}</span>
      </div>

      {/* Header Banner */}
      <div className="fs-legal-header">
        <div className="fs-legal-badge">
          <ShieldCheck size={14} />
          <span>{badge}</span>
        </div>
        <h1 className="fs-legal-title">{title}</h1>
        {subtitle && <p className="fs-legal-subtitle">{subtitle}</p>}
        <div className="fs-legal-meta-row">
          <span>Effective & Last Updated: <strong>{displayLastUpdated}</strong></span>
          <span>•</span>
          <span>FreeSong.in Compliance & Governance</span>
        </div>
      </div>

      {/* Quick Legal Navigation Tabs */}
      <div className="fs-legal-nav-tabs">
        {LEGAL_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `fs-legal-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} />
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Legal Body */}
      <div className="fs-legal-body">
        {children}
      </div>
    </div>
  );
}
