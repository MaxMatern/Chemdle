'use client';

import React from 'react';
import Modal from './Modal';
import { Language } from '@/data/types';
import { t } from '@/lib/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function HelpModal({ isOpen, onClose, language }: HelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('helpTitle', language)}>
      <div className="help-content">
        <p className="help-intro">
          {t('helpIntro', language)}
        </p>

        <div className="help-section">
          <h3>{t('helpColorsTitle', language)}</h3>
          <div className="help-colors">
            <div className="help-color-row">
              <span className="help-swatch help-green" />
              <div>
                <strong>{t('helpGreen', language).split(' — ')[0]}</strong> — {t('helpGreen', language).split(' — ')[1]}
              </div>
            </div>
            <div className="help-color-row">
              <span className="help-swatch help-yellow" />
              <div>
                <strong>{t('helpYellow', language).split(' — ')[0]}</strong> — {t('helpYellow', language).split(' — ')[1]}
              </div>
            </div>
            <div className="help-color-row">
              <span className="help-swatch help-red" />
              <div>
                <strong>{t('helpRed', language).split(' — ')[0]}</strong> — {t('helpRed', language).split(' — ')[1]}
              </div>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h3>{t('helpColumnsTitle', language)}</h3>
          <ul className="help-columns-list">
            <li><strong>{t('helpCol1', language).split(' — ')[0]}</strong> — {t('helpCol1', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol2', language).split(' — ')[0]}</strong> — {t('helpCol2', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol3', language).split(' — ')[0]}</strong> — {t('helpCol3', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol4', language).split(' — ')[0]}</strong> — {t('helpCol4', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol5', language).split(' — ')[0]}</strong> — {t('helpCol5', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol6', language).split(' — ')[0]}</strong> — {t('helpCol6', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol7', language).split(' — ')[0]}</strong> — {t('helpCol7', language).split(' — ')[1]}</li>
            <li><strong>{t('helpCol8', language).split(' — ')[0]}</strong> — {t('helpCol8', language).split(' — ')[1]}</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>{t('helpArrowsTitle', language)}</h3>
          <p>{t('helpArrowsDesc', language)}</p>
        </div>

        <div className="help-section">
          <h3>{t('helpEasyModeTitle', language)}</h3>
          <p>{t('helpEasyModeDesc', language)}</p>
        </div>

        <div className="help-section">
          <h3>{t('helpTipsTitle', language)}</h3>
          <ul className="help-tips">
            <li>{t('helpTip1', language)}</li>
            <li>{t('helpTip2', language)}</li>
            <li>{t('helpTip3', language)}</li>
            <li>{t('helpTip4', language)}</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
