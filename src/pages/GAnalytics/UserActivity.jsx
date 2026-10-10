import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, CalendarDays, Clock3, LoaderCircle, Search, Zap, Flame, Moon } from 'lucide-react';
import { getUserActivity } from '../../services/analyticsService';
import { useGAnalytics } from './GAnalyticsLayout';
import { ChartTooltip } from './ChartTooltip';
import './UserActivity.css';

const MODES = [
  { key: 'total', label: 'All Activity' },
  { key: 'visits', label: 'Visitors' },
  { key: 'searches', label: 'Searches' },
  { key: 'plays', label: 'Streams' }
];

const MODE_COLORS = {
  total: '0, 200, 83',
  visits: '38, 198, 218',
  searches: '255, 193, 7',
  plays: '118, 255, 3'
};

const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21];
const FULL_DAYS = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
const DOW_TO_ROW = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

function hourLabel(h) {
  return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
}

function getIstNow() {
  try {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  } catch {
    return new Date();
  }
}

export function UserActivity() {
  const { token, onSessionExpired, refreshTick } = useGAnalytics();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('total');
  const [tip, setTip] = useState(null);

  const loadActivity = useCallback(async (authToken) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getUserActivity(authToken);
      setActivity(data);
    } catch (err) {
      if (err.status === 401) onSessionExpired();
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (token) loadActivity(token);
  }, [token, loadActivity]);

  useEffect(() => {
    if (refreshTick > 0 && token) loadActivity(token);
  }, [refreshTick]); // eslint-disable-line react-hooks/exhaustive-deps

  const istNow = useMemo(() => getIstNow(), []);
  const todayRow = DOW_TO_ROW[istNow.getDay()];
  const nowHour = istNow.getHours();

  const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');
  const formatCompact = (n) => {
    const v = Number(n) || 0;
    if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return String(v);
  };

  const heat = activity?.heatmap || null;
  const matrix = heat?.cells?.[mode] || [];
  const maxVal = Math.max(heat?.max?.[mode] || 0, 1);
  const modeRgb = MODE_COLORS[mode] || MODE_COLORS.total;

  const searches = activity?.searches || null;
  const peakHourIdx = activity?.peak?.hour?.hour ?? -1;
  const dayTotals = heat?.dayTotals || [];
  const maxDayTotal = Math.max(...dayTotals.map(d => d.total), 1);

  const cellAlpha = (v) => {
    if (!v) return 0;
    return 0.18 + 0.82 * Math.min(1, v / maxVal);
  };

  const showTip = (e, payload) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTip({
      x: Math.min(Math.max(rect.left + rect.width / 2, 130), window.innerWidth - 130),
      y: Math.max(rect.top, 96),
      ...payload
    });
  };

  // Hide floating tooltip on any scroll (page or heatmap container) and on resize
  useEffect(() => {
    if (!tip) return undefined;
    const hide = () => setTip(null);
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('resize', hide, { passive: true });
    return () => {
      window.removeEventListener('scroll', hide, { capture: true });
      window.removeEventListener('resize', hide);
    };
  }, [tip]);

  if (loading && !activity) {
    return (
      <div className="fs-ga-loading">
        <LoaderCircle size={32} className="fs-ga-spin" />
        <span>Loading user activity...</span>
      </div>
    );
  }

  return (
    <div className="fs-ga-activity">
      {/* Peak Stats */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Activity size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">User Activity</h2>
          <span className="fs-ga-section-sub">When users are most active · Last 28 days</span>
        </div>
        <div className="fs-ga-stats-grid">
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap visitors"><CalendarDays size={20} /></div>
            <p className="fs-ga-stat-label">Peak Day</p>
            <p className="fs-ga-stat-value">{activity?.peak?.day?.label ? FULL_DAYS[activity.peak.day.label] || activity.peak.day.label : '—'}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap registered"><Clock3 size={20} /></div>
            <p className="fs-ga-stat-label">Peak Hour</p>
            <p className="fs-ga-stat-value">{activity?.peak?.hour?.label || '—'}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap guests"><Search size={20} /></div>
            <p className="fs-ga-stat-label">Searches · 7 Days</p>
            <p className="fs-ga-stat-value">{formatNumber(searches?.last7Days)}</p>
          </div>
          <div className="fs-ga-stat-card">
            <div className="fs-ga-stat-icon-wrap total"><Zap size={20} /></div>
            <p className="fs-ga-stat-label">Activity · 7 Days</p>
            <p className="fs-ga-stat-value">{formatNumber(activity?.totals?.activityLast7Days)}</p>
          </div>
        </div>
      </div>

      {/* Day x Hour Heatmap */}
      <div className="fs-ga-section">
        <div className="fs-ga-section-header">
          <Activity size={18} className="fs-ga-section-icon" />
          <h2 className="fs-ga-section-title">Activity Heatmap</h2>
          <span className="fs-ga-section-sub">Day × hour intensity · IST</span>
          {loading && <LoaderCircle size={16} className="fs-ga-spin fs-ga-act-header-spin" />}
        </div>

        <div className="fs-ga-act-filters">
          {MODES.map(m => (
            <button
              key={m.key}
              className={`fs-ga-act-chip ${mode === m.key ? 'active' : ''} ${m.key}`}
              onClick={() => { setMode(m.key); setTip(null); }}
            >
              <span className="fs-ga-act-chip-dot" style={{ background: `rgb(${MODE_COLORS[m.key]})` }} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="fs-ga-act-insights">
          <span className="fs-ga-act-insight">
            <Flame size={14} />
            Most active: {activity?.totals?.peakSummary || 'Not enough data yet'}
          </span>
          <span className="fs-ga-act-insight quiet">
            <Moon size={14} />
            {activity?.totals?.quietSummary || 'No activity recorded yet'}
          </span>
        </div>

        <div className="fs-ga-act-heat-card" onClick={() => setTip(null)}>
          <div className="fs-ga-act-heat-scroll" onScroll={() => setTip(null)}>
            <div className="fs-ga-act-heat-grid" onMouseLeave={() => setTip(null)}>
              <span className="fs-ga-act-heat-corner" />
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="fs-ga-act-heat-hour-label">
                  {HOUR_TICKS.includes(h) ? (h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`) : ''}
                </span>
              ))}
              {(heat?.rows || []).map((row, i) => (
                <React.Fragment key={row.dow}>
                  <span className={`fs-ga-act-heat-day-label ${i === todayRow ? 'today' : ''}`}>
                    {row.label}
                  </span>
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = matrix[i]?.[h] || 0;
                    const isPeak = activity?.peak?.cell && activity.peak.cell.dow === row.dow && activity.peak.cell.hour === h && activity.peak.cell.score > 0;
                    const isNow = i === todayRow && h === nowHour;
                    const payload = {
                      title: `${FULL_DAYS[row.label] || row.label}s · ${hourLabel(h)}`,
                      total: mode === 'total' ? v : null,
                      visits: heat?.cells?.visits?.[i]?.[h] || 0,
                      searches: heat?.cells?.searches?.[i]?.[h] || 0,
                      plays: heat?.cells?.plays?.[i]?.[h] || 0,
                      mode,
                      count: mode !== 'total' ? v : null
                    };
                    return (
                      <span
                        key={h}
                        className={`fs-ga-act-heat-cell ${isPeak ? 'peak' : ''} ${isNow ? 'now' : ''} ${v ? 'filled' : ''}`}
                        style={{ background: v ? `rgba(${modeRgb}, ${cellAlpha(v).toFixed(3)})` : undefined }}
                        onMouseEnter={(e) => showTip(e, payload)}
                        onMouseLeave={() => setTip(null)}
                        onClick={(e) => { e.stopPropagation(); showTip(e, payload); }}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="fs-ga-act-heat-legend">
            <span>Less</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map(a => (
              <span key={a} className="fs-ga-act-heat-swatch" style={{ background: `rgba(${modeRgb}, ${a})` }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Searches by Hour */}
      {searches && (
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <Search size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Searches by Hour</h2>
            <span className="fs-ga-section-sub">{formatNumber(searches.last7Days)} searches · Last 7 days</span>
          </div>
          <div className="fs-ga-act-chart-card">
            <div className="fs-ga-act-bars hours">
              {searches.byHour.map(h => (
                <div key={h.hour} className={`fs-ga-act-bar-col ${h.hour === peakHourIdx ? 'peak' : ''}`}>
                  <ChartTooltip
                    dotClass="fs-dot-visitors"
                    label={`${h.label} · All days`}
                    value={formatNumber(h.count)}
                    unit="searches"
                  />
                  <div className="fs-ga-act-bar-track">
                    <div className="fs-ga-act-bar" style={{ height: `${Math.max(2, Math.round((h.count / Math.max(...searches.byHour.map(x => x.count), 1)) * 100))}%` }} />
                  </div>
                  <span className="fs-ga-act-bar-label">{HOUR_TICKS.includes(h.hour) ? h.label : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Busiest Days */}
      {dayTotals.length > 0 && (
        <div className="fs-ga-section">
          <div className="fs-ga-section-header">
            <CalendarDays size={18} className="fs-ga-section-icon" />
            <h2 className="fs-ga-section-title">Busiest Days</h2>
            <span className="fs-ga-section-sub">Total activity per weekday · Last 28 days</span>
          </div>
          <div className="fs-ga-act-chart-card">
            <div className="fs-ga-act-bars days">
              {dayTotals.map(d => (
                <div key={d.dow} className={`fs-ga-act-bar-col days ${d.label === (activity?.peak?.day?.label || '') ? 'peak' : ''}`}>
                  <ChartTooltip
                    dotClass="fs-dot-plays"
                    label={FULL_DAYS[d.label] || d.label}
                    value={formatNumber(d.total)}
                    unit="events"
                    sublabel={`${formatCompact(d.visits)} visits · ${formatCompact(d.searches)} searches · ${formatCompact(d.plays)} streams`}
                  />
                  <span className="fs-ga-act-bar-value">{d.total > 0 ? formatCompact(d.total) : ''}</span>
                  <div className="fs-ga-act-bar-track">
                    <div className="fs-ga-act-bar days" style={{ height: `${Math.max(2, Math.round((d.total / maxDayTotal) * 100))}%` }} />
                  </div>
                  <span className="fs-ga-act-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Heatmap Tooltip */}
      {tip && (
        <div className="fs-ga-heat-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="fs-ga-heat-tip-card">
            <span className="fs-ga-heat-tip-title">{tip.title}</span>
            {tip.mode === 'total' ? (
              <>
                <span className="fs-ga-heat-tip-value">{formatNumber(tip.total)} <span className="fs-ga-heat-tip-unit">events</span></span>
                <span className="fs-ga-heat-tip-breakdown">
                  <span className="fs-ga-heat-tip-dot" style={{ background: `rgb(${MODE_COLORS.visits})` }} /> {formatNumber(tip.visits)} visits
                  <span className="fs-ga-heat-tip-dot" style={{ background: `rgb(${MODE_COLORS.searches})` }} /> {formatNumber(tip.searches)} searches
                  <span className="fs-ga-heat-tip-dot" style={{ background: `rgb(${MODE_COLORS.plays})` }} /> {formatNumber(tip.plays)} streams
                </span>
              </>
            ) : (
              <span className="fs-ga-heat-tip-value">
                {formatNumber(tip.count)} <span className="fs-ga-heat-tip-unit">{tip.mode === 'visits' ? 'visits' : tip.mode === 'searches' ? 'searches' : 'streams'}</span>
              </span>
            )}
          </div>
          <span className="fs-ga-heat-tip-arrow" />
        </div>
      )}
    </div>
  );
}

export default UserActivity;
