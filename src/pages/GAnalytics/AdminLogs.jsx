import React, { useState, useEffect, useCallback } from 'react';
import { FileClock, ShieldAlert, MapPin, LoaderCircle } from 'lucide-react';
import { getAdminLogs } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { Pagination } from './Pagination';
import './AdminLogs.css';

const PAGE_SIZE = 15;

export function AdminLogs() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async (authToken, targetPage = 1) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getAdminLogs(authToken, targetPage, PAGE_SIZE);
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setPage(Math.min(data.page, data.pages));
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadLogs(token, 1);
  }, [token, loadLogs]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadLogs(token, page);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePage = (p) => {
    setPage(p);
    loadLogs(token, p);
  };

  const formatLogDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="fs-ga-logs">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <FileClock size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Admin Login Logs</h2>
          <span className="fs-ga-section-sub">Last 30 days · {total.toLocaleString('en-IN')} entries</span>
          {loading && <LoaderCircle size={14} className="fs-ga-spin" />}
        </div>

        <div className="fs-ga-list-container">
          {logs.length === 0 ? (
            <p className="fs-ga-empty-text">No admin login activity in the last 30 days</p>
          ) : (
            <>
              <div className="fs-ga-logs-header">
                <span className="fs-ga-logs-col-admin">Admin</span>
                <span className="fs-ga-logs-col-date">Date & Time</span>
                <span className="fs-ga-logs-col-ip">IP Address</span>
                <span className="fs-ga-logs-col-status">Status</span>
              </div>
              {logs.map((log, i) => (
                <div key={`${log.loggedInAt}-${i}`} className={`fs-ga-logs-row ${log.status === 'failed' ? 'failed' : ''}`}>
                  <div className="fs-ga-logs-col-admin">
                    <div className="fs-ga-avatar letter">
                      {(log.adminId || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span className="fs-ga-logs-admin-id">{log.adminId || 'Unknown'}</span>
                  </div>
                  <div className="fs-ga-logs-col-date">{formatLogDate(log.loggedInAt)}</div>
                  <div className="fs-ga-logs-col-ip">
                    <MapPin size={12} />
                    {log.ip || '—'}
                    {log.city ? <span className="fs-ga-logs-city">{log.city}</span> : null}
                  </div>
                  <div className="fs-ga-logs-col-status">
                    {log.status === 'failed' ? (
                      <span className="fs-ga-badge failed"><ShieldAlert size={12} /> Failed</span>
                    ) : (
                      <span className="fs-ga-badge success">Success</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <Pagination
          page={page}
          pages={pages}
          total={total}
          label="entries"
          pageSize={PAGE_SIZE}
          onPage={handlePage}
        />
      </div>
    </div>
  );
}
