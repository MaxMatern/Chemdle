'use client';

import React from 'react';
import { BarChart3, HelpCircle, Settings, Sparkles } from 'lucide-react';
import { Language } from '@/data/types';
import { t } from '@/lib/translations';

interface NavbarProps {
  dayNumber: number;
  easyMode: boolean;
  language: Language;
  onToggleEasyMode: () => void;
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

function AtomIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className="navbar-atom-svg"
      aria-hidden="true"
    >
      {/* Nucleus */}
      <circle cx="16" cy="16" r="3.5" fill="url(#nucleusGrad)" />
      <circle cx="16" cy="16" r="3.5" fill="url(#nucleusGrad)" opacity="0.5">
        <animate attributeName="r" values="3.5;4;3.5" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Orbital rings */}
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="url(#orbitGrad1)" strokeWidth="0.8" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 16 16;360 16 16" dur="8s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="url(#orbitGrad2)" strokeWidth="0.8" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" values="60 16 16;420 16 16" dur="10s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="16" cy="16" rx="13" ry="5" stroke="url(#orbitGrad3)" strokeWidth="0.8" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="120 16 16;480 16 16" dur="12s" repeatCount="indefinite" />
      </ellipse>
      {/* Electrons */}
      <circle r="1.5" fill="#00d4ff" opacity="0.9">
        <animateMotion dur="8s" repeatCount="indefinite">
          <mpath href="#orbit1" />
        </animateMotion>
      </circle>
      <circle r="1.3" fill="#8b5cf6" opacity="0.8">
        <animateMotion dur="10s" repeatCount="indefinite">
          <mpath href="#orbit2" />
        </animateMotion>
      </circle>
      <circle r="1.2" fill="#ec4899" opacity="0.7">
        <animateMotion dur="12s" repeatCount="indefinite">
          <mpath href="#orbit3" />
        </animateMotion>
      </circle>
      {/* Hidden paths for animateMotion */}
      <defs>
        <ellipse id="orbit1" cx="16" cy="16" rx="13" ry="5" />
        <ellipse id="orbit2" cx="16" cy="16" rx="11" ry="7" transform="rotate(60 16 16)" />
        <ellipse id="orbit3" cx="16" cy="16" rx="12" ry="4" transform="rotate(120 16 16)" />
        <radialGradient id="nucleusGrad">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#6366f1" />
        </radialGradient>
        <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
          <stop offset="50%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="orbitGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="orbitGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar({
  dayNumber,
  easyMode,
  language,
  onToggleEasyMode,
  onOpenHelp,
  onOpenStats,
  onOpenSettings,
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <AtomIcon />
          <div className="navbar-title-group">
            <h1 className="navbar-title">CHEMDLE</h1>
            <span className="navbar-subtitle">{t('dayPrefix', language)}{dayNumber}</span>
          </div>
        </div>

        <div className="navbar-right">
          <button
            onClick={onToggleEasyMode}
            className={`easy-mode-toggle-btn ${easyMode ? 'active' : ''}`}
            aria-label={t('easyMode', language)}
            title={t('easyMode', language)}
          >
            <Sparkles size={16} className="easy-mode-btn-icon" />
            <span className="easy-mode-text">{t('easyMode', language)}</span>
            <span className={`easy-mode-indicator ${easyMode ? 'on' : 'off'}`}>
              {easyMode ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={onOpenHelp}
            className="nav-btn"
            aria-label={t('howToPlay', language)}
            title={t('howToPlay', language)}
          >
            <HelpCircle size={21} />
          </button>
          <button
            onClick={onOpenStats}
            className="nav-btn"
            aria-label={t('statistics', language)}
            title={t('statistics', language)}
          >
            <BarChart3 size={21} />
          </button>
          <button
            onClick={onOpenSettings}
            className="nav-btn"
            aria-label={t('settings', language)}
            title={t('settings', language)}
          >
            <Settings size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}
