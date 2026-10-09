import React, { useState, useEffect, useCallback } from 'react';
import { Database, Activity, RefreshCw, X, Users, Heart, History, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ContextMenuContext';
import './DbStatusIndicator.css';

export function DbStatusIndicator() {
  const { user } = useAuth();
  const { likedSongs } = useLibrary();
  const { showToast } = useToast();

  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const data = await api.getDbStatus();
      setStatus(data);
      if (showNotification) {
        if (data.connected) {
          showToast(`Hostinger DB Connected (${data.latencyMs || 0}ms)`, 'success');
        } else {
          showToast('Database connection failed', 'error');
        }
      }
    } catch (err) {
      setStatus({ connected: false, error: err.message });
      if (showNotification) {
        showToast('Database offline', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStatus();
    // Poll DB status every 60s
    const timer = setInterval(() => {
      fetchStatus();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isConnected = status?.connected === true;
  const isChecking = isLoading || (!status && isRefreshing);

  return (
    <>
      <button
        type="button"
        className={`fs-db-indicator-btn ${isConnected ? 'connected' : isChecking ? 'checking' : 'disconnected'}`}
        onClick={() => setIsOpen(true)}
        title={
          isConnected
            ? `Hostinger MySQL Connected (${status?.latencyMs || 0}ms) — Click for diagnostics`
            : isChecking
            ? 'Checking Hostinger MySQL connection...'
            : 'Hostinger MySQL Offline — Click for details'
        }
        aria-label="Database Status"
      >
        <span
          className={`fs-db-dot ${isConnected ? 'connected' : isChecking ? 'checking' : 'disconnected'}`}
        />
        <Database size={13} />
        <span className="fs-db-label-text">
          {isConnected ? 'DB Live' : isChecking ? 'Checking...' : 'DB Offline'}
        </span>
        {isConnected && typeof status?.latencyMs === 'number' && (
          <span className="fs-db-latency">{status.latencyMs}ms</span>
        )}
      </button>

      {isOpen && (
        <div className="fs-db-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="fs-db-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fs-db-modal-title"
          >
            {/* Header */}
            <div className="fs-db-modal-header">
              <div className="fs-db-modal-title" id="fs-db-modal-title">
                <Database size={18} className="text-brand" />
                <span>Hostinger Cloud Database</span>
              </div>
              <button
                type="button"
                className="fs-db-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="fs-db-modal-body">
              {/* Status Banner */}
              <div className={`fs-db-status-banner ${isConnected ? 'connected' : 'disconnected'}`}>
                <div className="fs-db-status-left">
                  <div className="fs-db-status-icon">
                    {isConnected ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <div className="fs-db-status-title">
                      {isConnected ? 'MySQL Connected & Synchronized' : 'Database Disconnected'}
                    </div>
                    <div className="fs-db-status-sub">
                      {isConnected
                        ? `Live connection to Hostinger Remote MySQL (${status?.latencyMs || 0}ms latency)`
                        : status?.error || 'Unable to establish socket connection with database server.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="fs-db-grid">
                <div className="fs-db-stat-card">
                  <div className="fs-db-stat-label">
                    <Users size={12} />
                    <span>Registered Users</span>
                  </div>
                  <div className="fs-db-stat-val">
                    {status?.stats?.users ?? 0}
                  </div>
                </div>

                <div className="fs-db-stat-card">
                  <div className="fs-db-stat-label">
                    <Heart size={12} />
                    <span>Cloud Liked Songs</span>
                  </div>
                  <div className="fs-db-stat-val">
                    {status?.stats?.likes ?? 0}
                  </div>
                </div>

                <div className="fs-db-stat-card">
                  <div className="fs-db-stat-label">
                    <History size={12} />
                    <span>Play History Rows</span>
                  </div>
                  <div className="fs-db-stat-val">
                    {status?.stats?.history ?? 0}
                  </div>
                </div>

                <div className="fs-db-stat-card">
                  <div className="fs-db-stat-label">
                    <Database size={12} />
                    <span>User Preferences</span>
                  </div>
                  <div className="fs-db-stat-val">
                    {status?.stats?.preferences ?? 0}
                  </div>
                </div>

                <div className="fs-db-stat-card">
                  <div className="fs-db-stat-label">
                    <Activity size={12} />
                    <span>Ping Latency</span>
                  </div>
                  <div className="fs-db-stat-val">
                    {status?.latencyMs != null ? `${status.latencyMs} ms` : '—'}
                  </div>
                </div>
              </div>

              {/* User Session Info */}
              <div className="fs-db-user-box">
                <div className="fs-db-user-header">Active Client Session</div>
                <div className="fs-db-user-details">
                  <span>Logged-in Account:</span>
                  <span className="fs-db-user-badge">
                    {user?.email ? `${user.name} (${user.email})` : 'Guest Listener (Local Only)'}
                  </span>
                </div>
                {user?.email && (
                  <div className="fs-db-user-details">
                    <span>Database ID:</span>
                    <span className="font-mono text-white">
                      {user.dbId ? `#${user.dbId}` : 'Syncing...'}
                    </span>
                  </div>
                )}
                <div className="fs-db-user-details">
                  <span>Local Liked Songs:</span>
                  <span className="font-mono text-white">
                    {likedSongs?.length || 0} songs
                  </span>
                </div>
              </div>

              {/* Hostinger DB Configuration Details */}
              <div className="fs-db-info-list">
                <div className="fs-db-info-row">
                  <span className="fs-db-info-key">Remote Host</span>
                  <span className="fs-db-info-val">{status?.host || 'srv2109.hstgr.io'}</span>
                </div>
                <div className="fs-db-info-row">
                  <span className="fs-db-info-key">Database</span>
                  <span className="fs-db-info-val">{status?.database || 'u388169091_freesong'}</span>
                </div>
                <div className="fs-db-info-row">
                  <span className="fs-db-info-key">Port</span>
                  <span className="fs-db-info-val">{status?.port || 3306}</span>
                </div>
                <div className="fs-db-info-row">
                  <span className="fs-db-info-key">Provider</span>
                  <span className="fs-db-info-val">{status?.provider || 'Hostinger Cloud'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="fs-db-modal-footer">
              <button
                type="button"
                className="fs-db-refresh-btn"
                onClick={() => fetchStatus(true)}
                disabled={isRefreshing}
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Testing Ping...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
