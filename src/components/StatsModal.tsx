'use client';

import React from 'react';
import Modal from './Modal';
import { UserStats, Language } from '@/data/types';
import { t } from '@/lib/translations';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  language: Language;
}

export default function StatsModal({ isOpen, onClose, stats, language }: StatsModalProps) {
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // Build histogram data
  const distribution = stats.guessDistribution || {};
  const maxGuesses = Math.max(
    ...Object.keys(distribution).map(Number),
    8
  );
  const maxCount = Math.max(...Object.values(distribution), 1);

  const histogramData: { label: string; count: number }[] = [];
  for (let i = 1; i <= Math.min(maxGuesses, 12); i++) {
    histogramData.push({ label: `${i}`, count: distribution[i] || 0 });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('statistics', language)}>
      <div className="stats-content">
        <div className="stats-summary">
          <div className="stat-box">
            <span className="stat-number">{stats.gamesPlayed}</span>
            <span className="stat-label">{t('statsPlayed', language)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{winRate}%</span>
            <span className="stat-label">{t('statsWinRate', language)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.currentStreak}</span>
            <span className="stat-label">{t('statsCurrentStreak', language)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{stats.maxStreak}</span>
            <span className="stat-label">{t('statsMaxStreak', language)}</span>
          </div>
        </div>

        <div className="stats-histogram">
          <h3>{t('statsDistribution', language)}</h3>
          {stats.gamesPlayed === 0 ? (
            <p className="stats-empty">{t('statsNoData', language)}</p>
          ) : (
            <div className="histogram-bars">
              {histogramData.map(d => (
                <div key={d.label} className="histogram-row">
                  <span className="histogram-label">{d.label}</span>
                  <div className="histogram-bar-wrapper">
                    <div
                      className="histogram-bar"
                      style={{
                        width: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%`,
                      }}
                    >
                      <span className="histogram-count">{d.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
