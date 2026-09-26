'use client';

import React from 'react';
import Modal from './Modal';
import { Eye, Thermometer, Sparkles, Languages } from 'lucide-react';
import { Language } from '@/data/types';
import { t } from '@/lib/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorblindMode: boolean;
  temperatureUnit: 'K' | 'C';
  easyMode: boolean;
  language: Language;
  onToggleColorblind: () => void;
  onToggleTemperature: () => void;
  onToggleEasyMode: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  colorblindMode,
  temperatureUnit,
  easyMode,
  language,
  onToggleColorblind,
  onToggleTemperature,
  onToggleEasyMode,
  onSelectLanguage,
}: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings', language)}>
      <div className="settings-content">
        {/* Language Selection Row */}
        <div className="setting-row">
          <div className="setting-info">
            <Languages size={20} />
            <div>
              <strong>{t('settingLanguageTitle', language)}</strong>
              <p>{t('settingLanguageDesc', language)}</p>
            </div>
          </div>
          <div className="lang-toggle-group" role="group" aria-label="Language selection">
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => onSelectLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'de' ? 'active' : ''}`}
              onClick={() => onSelectLanguage('de')}
              aria-pressed={language === 'de'}
            >
              DE
            </button>
          </div>
        </div>

        {/* Colorblind / High Contrast */}
        <div className="setting-row">
          <div className="setting-info">
            <Eye size={20} />
            <div>
              <strong>{t('settingColorblindTitle', language)}</strong>
              <p>{t('settingColorblindDesc', language)}</p>
            </div>
          </div>
          <button
            className={`toggle-btn ${colorblindMode ? 'toggle-on' : 'toggle-off'}`}
            onClick={onToggleColorblind}
            role="switch"
            aria-checked={colorblindMode}
            aria-label="Toggle colorblind mode"
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {/* Temperature Unit */}
        <div className="setting-row">
          <div className="setting-info">
            <Thermometer size={20} />
            <div>
              <strong>{t('settingTempTitle', language)}</strong>
              <p>{t('settingTempDesc', language)}</p>
            </div>
          </div>
          <div className="unit-toggle-group" role="group" aria-label="Temperature unit selection">
            <button
              type="button"
              className={`unit-btn ${temperatureUnit === 'K' ? 'active' : ''}`}
              onClick={() => { if (temperatureUnit !== 'K') onToggleTemperature(); }}
              aria-pressed={temperatureUnit === 'K'}
            >
              Kelvin (K)
            </button>
            <button
              type="button"
              className={`unit-btn ${temperatureUnit === 'C' ? 'active' : ''}`}
              onClick={() => { if (temperatureUnit !== 'C') onToggleTemperature(); }}
              aria-pressed={temperatureUnit === 'C'}
            >
              Celsius (°C)
            </button>
          </div>
        </div>

        {/* Easy Mode (Periodic Table) */}
        <div className="setting-row">
          <div className="setting-info">
            <Sparkles size={20} />
            <div>
              <strong>{t('settingEasyModeTitle', language)}</strong>
              <p>{t('settingEasyModeDesc', language)}</p>
            </div>
          </div>
          <button
            className={`toggle-btn ${easyMode ? 'toggle-on' : 'toggle-off'}`}
            onClick={onToggleEasyMode}
            role="switch"
            aria-checked={easyMode}
            aria-label="Toggle easy mode"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
