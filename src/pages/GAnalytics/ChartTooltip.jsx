import React from 'react';
import './ChartTooltip.css';

// Spotify-style chart hover tooltip: dark card with a colored dot, label and bold value
export function ChartTooltip({ dotClass = '', label, value, unit, sublabel }) {
  if (!label) return null;
  return (
    <div className="fs-ga-chart-tooltip" role="tooltip" aria-hidden="true">
      <div className="fs-ga-chart-tooltip-card">
        <span className="fs-ga-chart-tooltip-row">
          <span className={`fs-ga-chart-tooltip-dot ${dotClass}`} />
          <span className="fs-ga-chart-tooltip-label">{label}</span>
        </span>
        <span className="fs-ga-chart-tooltip-value">
          {value}
          {unit ? <span className="fs-ga-chart-tooltip-unit"> {unit}</span> : null}
        </span>
        {sublabel ? <span className="fs-ga-chart-tooltip-sublabel">{sublabel}</span> : null}
      </div>
      <span className="fs-ga-chart-tooltip-arrow" />
    </div>
  );
}

export default ChartTooltip;
