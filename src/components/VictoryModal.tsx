'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Modal from './Modal';
import { ChemicalElement, GuessEvaluation, Language } from '@/data/types';
import { getDayNumber, getTimeUntilNextDay } from '@/lib/dailyTarget';
import { Share2, Check, Link2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  t,
  getElementName,
  getElementPrimaryUse,
  getCategoryLabel,
} from '@/lib/translations';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ChemicalElement;
  evaluations: GuessEvaluation[];
  isWon: boolean;
  language: Language;
}

function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const CATEGORY_DISPLAY: Record<string, string> = {
  'alkali-metal': 'Alkali Metal',
  'alkaline-earth-metal': 'Alkaline Earth Metal',
  'transition-metal': 'Transition Metal',
  'post-transition-metal': 'Post-Transition Metal',
  'metalloid': 'Metalloid',
  'reactive-nonmetal': 'Reactive Nonmetal',
  'halogen': 'Halogen',
  'noble-gas': 'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide': 'Actinide',
};

export default function VictoryModal({
  isOpen,
  onClose,
  target,
  evaluations,
  isWon,
  language,
}: VictoryModalProps) {
  const [countdown, setCountdown] = useState('');
  const [copied, setCopied] = useState(false);

  // Confetti effect on victory
  useEffect(() => {
    if (isOpen && isWon) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#16a34a', '#ca8a04', '#3b82f6', '#8b5cf6'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#16a34a', '#ca8a04', '#3b82f6', '#8b5cf6'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isOpen, isWon]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const update = () => setCountdown(formatCountdown(getTimeUntilNextDay()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const [canNativeShare, setCanNativeShare] = useState(false);

  // Check Web Share API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const getAppUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://chemdle.vercel.app';
  }, []);

  const handleCopyLink = useCallback(async () => {
    const url = getAppUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [getAppUrl]);

  const handleNativeShare = useCallback(async () => {
    const url = getAppUrl();
    const text = t('shareMessageText', language);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Chemdle',
          text,
          url,
        });
      } catch {
        // User cancel
      }
    } else {
      handleCopyLink();
    }
  }, [getAppUrl, language, handleCopyLink]);

  if (!target) return null;

  const localizedName = getElementName(target, language);
  const localizedUse = getElementPrimaryUse(target, language);
  const localizedCategory = getCategoryLabel(target.category, language);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWon ? t('victoryTitleWin', language) : t('victoryTitleLose', language)}
    >
      <div className="victory-content">
        {/* Element Profile Card */}
        <div className="element-profile-card">
          <div className="profile-symbol-wrapper">
            <span className="profile-atomic-number">{target.atomicNumber}</span>
            <span className="profile-symbol">{target.symbol}</span>
            <span className="profile-name">{localizedName}</span>
            <span className="profile-mass">{target.atomicMass} u</span>
          </div>

          <div className="profile-details">
            <div className="profile-detail-row profile-use-row">
              <span className="profile-detail-label">{t('victoryMostUsed', language)}</span>
              <span className="profile-detail-value profile-use-value">
                {localizedUse}
              </span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('colCategory', language)}</span>
              <span className="profile-detail-value">
                {localizedCategory}
              </span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('colBlock', language)}</span>
              <span className="profile-detail-value">{target.block}-block</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">{t('colPeriodGroup', language)}</span>
              <span className="profile-detail-value">
                P: {target.period} / G: {target.group ?? 'f-block'}
              </span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Electron Config.</span>
              <span className="profile-detail-value profile-config">
                {target.electronConfiguration}
              </span>
            </div>
            {target.discoveryYear && (
              <div className="profile-detail-row">
                <span className="profile-detail-label">{t('victoryDiscovered', language)}</span>
                <span className="profile-detail-value">
                  {target.discoveryYear === 'Ancient'
                    ? t('victoryAncient', language)
                    : `${target.discoveryYear} ${t('victoryBy', language)} ${target.discoveredBy}`}
                </span>
              </div>
            )}
          </div>

          <div className="profile-fun-fact">
            <span className="fun-fact-icon">💡</span>
            <p>{target.funFact}</p>
          </div>
        </div>

        {/* Result summary */}
        <div className="victory-summary">
          {isWon ? (
            <p>
              {evaluations.length === 1
                ? t('victoryIdentifiedInSingle', language).replace('{name}', localizedName)
                : t('victoryIdentifiedIn', language)
                    .replace('{name}', localizedName)
                    .replace('{count}', String(evaluations.length))}
            </p>
          ) : (
            <p>
              {t('victoryNotFound', language).replace('{name}', localizedName)}
            </p>
          )}
        </div>

        {/* App Teilen Box */}
        <div className="app-share-box">
          <span className="app-share-label">
            <Share2 size={15} />
            {t('shareAppTitle', language)}
          </span>
          <div className="app-share-actions">
            <button
              type="button"
              className={`app-share-btn copy-link-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title={t('copyLink', language)}
            >
              {copied ? <Check size={16} /> : <Link2 size={16} />}
              <span>{copied ? t('linkCopied', language) : t('copyLink', language)}</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${t('shareMessageText', language)} ${getAppUrl()}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="app-share-btn whatsapp-btn"
              title="Per WhatsApp teilen"
            >
              <MessageCircle size={16} />
              <span>{t('shareWhatsApp', language)}</span>
            </a>

            {canNativeShare && (
              <button
                type="button"
                className="app-share-btn native-share-btn"
                onClick={handleNativeShare}
                title={t('shareNative', language)}
              >
                <Share2 size={16} />
                <span>{t('shareNative', language)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div className="next-element-countdown">
          <span className="countdown-label">{t('victoryNextIn', language)}</span>
          <span className="countdown-timer">{countdown}</span>
        </div>
      </div>
    </Modal>
  );
}
