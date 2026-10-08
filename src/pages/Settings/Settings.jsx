import React, { useState } from 'react';
import { Volume2, Zap, Moon, Trash2, CheckCircle2 } from 'lucide-react';
import { storage } from '../../services/storage';
import './Settings.css';

export function Settings() {
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storage.saveSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleClearCache = () => {
    localStorage.removeItem('fs_history');
    alert('Playback cache cleared successfully.');
  };

  return (
    <div className="fs-settings-page">
      <div className="fs-settings-header">
        <h1 className="fs-settings-title">Settings</h1>
        <p className="fs-settings-sub">Configure playback fidelity, interface themes, and storage</p>
        {savedNotice && (
          <div className="fs-settings-saved-banner">
            <CheckCircle2 size={16} />
            <span>Settings saved automatically</span>
          </div>
        )}
      </div>

      <div className="fs-settings-sections">
        {/* Playback & Audio */}
        <div className="fs-settings-card">
          <h3 className="fs-settings-section-title">Audio & Streaming</h3>

          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Audio Quality</span>
              <span className="fs-setting-desc">Stream at optimal YouTube Music bitrates</span>
            </div>
            <select
              className="fs-setting-select"
              value={settings.audioQuality}
              onChange={(e) => updateSetting('audioQuality', e.target.value)}
            >
              <option value="high">High Fidelity (256kbps AAC)</option>
              <option value="normal">Normal (128kbps)</option>
              <option value="data-saver">Data Saver (64kbps)</option>
            </select>
          </div>

          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Autoplay Next Track</span>
              <span className="fs-setting-desc">Keep music playing similar tracks automatically</span>
            </div>
            <label className="fs-switch">
              <input
                type="checkbox"
                checked={settings.autoplay}
                onChange={(e) => updateSetting('autoplay', e.target.checked)}
              />
              <span className="fs-slider" />
            </label>
          </div>
        </div>

        {/* Display & Visuals */}
        <div className="fs-settings-card">
          <h3 className="fs-settings-section-title">Display & Appearance</h3>

          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Pure AMOLED Black (#000000)</span>
              <span className="fs-setting-desc">Maximum contrast and battery saving for OLED displays</span>
            </div>
            <span className="fs-badge-active">Enabled</span>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="fs-settings-card">
          <h3 className="fs-settings-section-title">Storage & Cache</h3>

          <div className="fs-setting-row">
            <div className="fs-setting-info">
              <span className="fs-setting-label">Clear Temporary Playback Cache</span>
              <span className="fs-setting-desc">Remove local session cache and temporary search data</span>
            </div>
            <button className="btn btn-secondary" onClick={handleClearCache}>
              <Trash2 size={16} />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="fs-settings-about">
          <img src="/images/freesonglogowebp.webp" alt="FreeSong" className="fs-about-logo" />
          <div className="fs-about-text">
            <h4>FreeSong.in</h4>
            <p>Version 1.0.0 • Pure AMOLED Music Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
