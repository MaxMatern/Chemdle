'use client';

import React from 'react';
import { BarChart3, HelpCircle, Settings, Sparkles } from 'lucide-react';
import { Language } from '@/data/types';
import { t } from '@/lib/translations';

interface NavbarProps {
  dayNumber: number;
  easyMode: boolean;
  language: Language;
  isRandomMode?: boolean;
  onToggleEasyMode: () => void;
  onOpenHelp: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

function ChemdleLogo() {
  return (
    <div className="navbar-logo-badge" title="Chemdle">
      <svg
        width="42"
        height="42"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="navbar-flask-svg"
        aria-hidden="true"
      >
        <defs>
          {/* Intense vibrant chemistry gradients */}
          <linearGradient id="flaskGlassOutline" x1="10" y1="5" x2="38" y2="43" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#00f5d4" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          <linearGradient id="flaskLiquidGrad" x1="12" y1="18" x2="36" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f5d4" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="flaskGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Flask Glass Body — Strong, iconic Erlenmeyer silhouette */}
        <path
          d="M20 6V15L10.8 35.2C9.5 38 11.6 41.5 14.8 41.5H33.2C36.4 41.5 38.5 38 37.2 35.2L28 15V6H20Z"
          fill="rgba(0, 245, 212, 0.16)"
          stroke="url(#flaskGlassOutline)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Flask Lip / Rim with solid crisp white and cyan highlight */}
        <rect x="17" y="4" width="14" height="3.5" rx="1.75" fill="#ffffff" />
        <rect x="19" y="5" width="10" height="1.5" rx="0.75" fill="#00f5d4" />

        {/* Chemical Liquid / Potion */}
        <path
          d="M13.8 28.5C16.8 26.8 20.4 29 24 28C27.6 27 31.2 29.2 34.2 28.5L35.8 35.2C36.7 37.3 35.1 40 32.8 40H15.2C12.9 40 11.3 37.3 12.2 35.2L13.8 28.5Z"
          fill="url(#flaskLiquidGrad)"
        />

        {/* Liquid Surface Meniscus Wave */}
        <path
          d="M13.5 28.5C16.8 26.8 20.4 29.2 24 28C27.6 26.8 31.2 29.2 34.5 28.5"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Glass reflection highlight on left shoulder */}
        <path
          d="M14.5 34.5L19.5 22.5"
          stroke="rgba(255, 255, 255, 0.55)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Rising Animated Chemical Bubbles */}
        <circle cx="18" cy="34" r="2.2" fill="#ffffff">
          <animate attributeName="cy" values="37;29;37" dur="2.1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.95;0.3" dur="2.1s" repeatCount="indefinite" />
        </circle>
        <circle cx="28.5" cy="33" r="2.6" fill="#ffffff">
          <animate attributeName="cy" values="37;26;37" dur="1.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="23.5" cy="23" r="1.7" fill="#00f5d4">
          <animate attributeName="cy" values="27;14;27" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="12" r="1.3" fill="#ffffff">
          <animate attributeName="cy" values="16;7;16" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export default function Navbar({
  dayNumber,
  easyMode,
  language,
  isRandomMode = false,
  onToggleEasyMode,
  onOpenHelp,
  onOpenStats,
  onOpenSettings,
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <ChemdleLogo />
          <div className="navbar-title-group">
            <h1 className="navbar-title">
              <span className="brand-chem">CHEM</span><span className="brand-dle">DLE</span>
            </h1>
            <span className={`navbar-subtitle ${isRandomMode ? 'random-badge' : ''}`}>
              {isRandomMode ? `🎲 ${t('randomModeBadge', language)}` : `${t('dayPrefix', language)}${dayNumber}`}
            </span>
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
