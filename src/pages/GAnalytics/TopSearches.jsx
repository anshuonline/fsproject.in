import React from 'react';
import { Search, LoaderCircle } from 'lucide-react';
import { useGAnalytics } from './GAnalyticsLayout';
import './TopSearches.css';

export function TopSearches() {
  const { overview, loadingOverview } = useGAnalytics();

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

  if (loadingOverview && !overview) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading searches...</span>
      </div>
    );
  }

  const searches = overview?.last7Days?.topSearches || [];
  const maxCount = Math.max(...searches.map(s => s.count), 1);

  return (
    <div className="fs-ga-searches">
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Search size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Top Searches</h2>
          <span className="fs-ga-section-sub">Last 7 days · {searches.length} queries</span>
        </div>

        <div className="fs-ga-list-container">
          {searches.length === 0 ? (
            <p className="fs-ga-empty-text">No searches recorded yet</p>
          ) : (
            searches.map((s, i) => (
              <div key={`${s.query}-${i}`} className="fs-ga-searches-row">
                <span className="fs-ga-rank">{i + 1}</span>
                <div className="fs-ga-searches-main">
                  <div className="fs-ga-searches-top">
                    <span className="fs-ga-searches-query truncate">{s.query}</span>
                    <span className="fs-ga-searches-count">{formatNumber(s.count)} searches</span>
                  </div>
                  <div className="fs-ga-share-bar">
                    <div className="fs-ga-share-bar-fill" style={{ width: `${Math.round((s.count / maxCount) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
