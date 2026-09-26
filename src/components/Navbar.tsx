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

function ChemdleLogo() {
  return (
    <div className="navbar-logo-badge" title="Chemdle">
      <svg
        width="40"
        height="40"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="navbar-flask-svg"
        aria-hidden="true"
      >
        <defs>
          {/* Intense vibrant chemistry gradients */}
          <linearGradient id="chemFlaskGlass" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#00f5d4" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          <linearGradient id="chemPotion" x1="12" y1="20" x2="36" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f5d4" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <radialGradient id="atomCoreGlow" cx="24" cy="22" r="9" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#00f5d4" />
            <stop offset="100%" stopColor="#00f5d4" stopOpacity="0" />
          </radialGradient>
          <filter id="intenseNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Flask Glass Body with vivid, high-contrast outline */}
        <path
          d="M20 6V15L11.5 34.5C10.2 37.5 12.4 41 15.6 41H32.4C35.6 41 37.8 37.5 36.5 34.5L28 15V6H20Z"
          fill="rgba(0, 245, 212, 0.22)"
          stroke="url(#chemFlaskGlass)"
          strokeWidth="3.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Flask Rim / Flange with bright solid highlight */}
        <rect x="17.5" y="4" width="13" height="3.5" rx="1.75" fill="#ffffff" />
        <rect x="19" y="5" width="10" height="1.5" rx="0.75" fill="#00f5d4" />

        {/* Chemical Liquid — Vibrant glowing emerald-cyan potion */}
        <path
          d="M14.5 28C17 26.5 20.5 28.5 24 27.5C27.5 26.5 31 28.5 33.5 28L35.2 34.5C36.1 36.8 34.4 39.5 31.9 39.5H16.1C13.6 39.5 11.9 36.8 12.8 34.5L14.5 28Z"
          fill="url(#chemPotion)"
        />

        {/* Liquid Surface Meniscus — Bright crisp wave */}
        <path
          d="M14.2 28C17.2 26.3 20.8 28.8 24 27.5C27.2 26.2 30.8 28.8 33.8 28"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Rising Laboratory Bubbles with bright reflections */}
        <circle cx="18" cy="33.5" r="2.2" fill="#ffffff">
          <animate attributeName="cy" values="36;29;36" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="28.5" cy="32" r="2.6" fill="#ffffff">
          <animate attributeName="cy" values="36;26;36" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="23" cy="22" r="1.6" fill="#00f5d4">
          <animate attributeName="cy" values="27;17;27" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Orbiting Atomic Electron Ring — Tilted, vibrant purple/pink */}
        <ellipse
          cx="24"
          cy="22"
          rx="15"
          ry="6.5"
          stroke="#c084fc"
          strokeWidth="2.2"
          fill="none"
          transform="rotate(-28 24 22)"
          opacity="0.95"
        />
        {/* Electron Particles */}
        <circle cx="36.5" cy="17.5" r="2.4" fill="#00f5d4" filter="url(#intenseNeonGlow)">
          <animate attributeName="r" values="2;3;2" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="11.5" cy="26.5" r="2" fill="#facc15">
          <animate attributeName="r" values="1.6;2.5;1.6" dur="1.7s" repeatCount="indefinite" />
        </circle>

        {/* Glowing Central Nucleus */}
        <circle cx="24" cy="22" r="4.5" fill="url(#atomCoreGlow)" />
        <circle cx="24" cy="22" r="2.5" fill="#ffffff" />
      </svg>
    </div>
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
          <ChemdleLogo />
          <div className="navbar-title-group">
            <h1 className="navbar-title">
              <span className="brand-chem">CHEM</span><span className="brand-dle">DLE</span>
            </h1>
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
