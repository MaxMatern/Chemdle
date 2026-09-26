'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { getDayNumber } from '@/lib/dailyTarget';
import { Language } from '@/data/types';
import { t } from '@/lib/translations';
import { Dices, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ElementSearchBar from '@/components/ElementSearchBar';
import GuessGrid from '@/components/GuessGrid';
import PeriodicTable from '@/components/PeriodicTable';
import HelpModal from '@/components/HelpModal';
import StatsModal from '@/components/StatsModal';
import SettingsModal from '@/components/SettingsModal';
import VictoryModal from '@/components/VictoryModal';

export default function GameApp() {
  const {
    isLoaded,
    evaluations,
    target,
    isRandomMode,
    startRandomGame,
    returnToDailyGame,
    submitGuess,
    updateSettings,
    guessedAtomicNumbers,
    isComplete,
    isWon,
    settings,
    stats,
    latestAnimatingRow,
  } = useGameState();

  const [helpOpen, setHelpOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [hasShownVictory, setHasShownVictory] = useState(false);

  const currentLanguage: Language = settings.language || 'en';

  const handleStartRandomGame = useCallback(() => {
    setHasShownVictory(false);
    setVictoryOpen(false);
    startRandomGame();
  }, [startRandomGame]);

  const handleReturnToDaily = useCallback(() => {
    setVictoryOpen(false);
    returnToDailyGame();
  }, [returnToDailyGame]);

  // Auto-open victory modal when game completes
  useEffect(() => {
    if (isComplete && !hasShownVictory && isLoaded) {
      // Delay to let flip animations finish
      const timer = setTimeout(() => {
        setVictoryOpen(true);
        setHasShownVictory(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasShownVictory, isLoaded]);

  // If already completed on load, show immediately
  useEffect(() => {
    if (isLoaded && isComplete && evaluations.length > 0) {
      setHasShownVictory(true);
      // Small delay for mount
      const timer = setTimeout(() => setVictoryOpen(true), 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const handleToggleColorblind = useCallback(() => {
    updateSettings({ colorblindMode: !settings.colorblindMode });
  }, [settings.colorblindMode, updateSettings]);

  const handleToggleTemperature = useCallback(() => {
    updateSettings({
      temperatureUnit: settings.temperatureUnit === 'K' ? 'C' : 'K',
    });
  }, [settings.temperatureUnit, updateSettings]);

  const handleToggleEasyMode = useCallback(() => {
    updateSettings({
      easyMode: !settings.easyMode,
    });
  }, [settings.easyMode, updateSettings]);

  const handleSelectLanguage = useCallback((lang: Language) => {
    updateSettings({ language: lang });
  }, [updateSettings]);

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-atom">⚛️</div>
        <p>{currentLanguage === 'de' ? 'Elemente werden geladen...' : 'Loading elements...'}</p>
      </div>
    );
  }

  return (
    <div className={`game-container ${settings.colorblindMode ? 'colorblind-mode' : ''}`}>
      <Navbar
        dayNumber={getDayNumber()}
        easyMode={Boolean(settings.easyMode)}
        language={currentLanguage}
        isRandomMode={isRandomMode}
        onToggleEasyMode={handleToggleEasyMode}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="game-main">
        {isRandomMode && (
          <div className="random-mode-banner">
            <div className="random-mode-badge-pill">
              <Dices size={15} />
              <span>{t('randomModeActiveNotice', currentLanguage)}</span>
            </div>
            <button
              type="button"
              className="return-daily-link-btn"
              onClick={handleReturnToDaily}
              title={t('backToDaily', currentLanguage)}
            >
              <Calendar size={14} />
              <span>{t('backToDaily', currentLanguage)}</span>
            </button>
          </div>
        )}

        <ElementSearchBar
          onSelect={submitGuess}
          guessedAtomicNumbers={guessedAtomicNumbers}
          disabled={isComplete}
          language={currentLanguage}
        />

        {settings.easyMode && (
          <PeriodicTable
            evaluations={evaluations}
            onSelectElement={submitGuess}
            disabled={isComplete}
            colorblindMode={settings.colorblindMode}
            language={currentLanguage}
          />
        )}

        <GuessGrid
          evaluations={evaluations}
          colorblindMode={settings.colorblindMode}
          temperatureUnit={settings.temperatureUnit}
          latestRowIndex={latestAnimatingRow.current}
          language={currentLanguage}
        />

        {isComplete && (
          <div className="completed-actions-row">
            <button
              className="view-result-btn"
              onClick={() => setVictoryOpen(true)}
            >
              🏆 {currentLanguage === 'de' ? 'Ergebnis anzeigen' : 'View Result'}
            </button>

            <button
              className="play-random-action-btn"
              onClick={handleStartRandomGame}
            >
              <Dices size={16} />
              <span>
                {isRandomMode
                  ? t('playAnotherRandom', currentLanguage)
                  : t('playRandomElement', currentLanguage)}
              </span>
            </button>

            {isRandomMode && (
              <button
                className="return-daily-action-btn"
                onClick={handleReturnToDaily}
              >
                <Calendar size={15} />
                <span>{t('backToDaily', currentLanguage)}</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        language={currentLanguage}
      />
      <StatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={stats}
        language={currentLanguage}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        colorblindMode={settings.colorblindMode}
        temperatureUnit={settings.temperatureUnit}
        easyMode={Boolean(settings.easyMode)}
        language={currentLanguage}
        onToggleColorblind={handleToggleColorblind}
        onToggleTemperature={handleToggleTemperature}
        onToggleEasyMode={handleToggleEasyMode}
        onSelectLanguage={handleSelectLanguage}
      />
      {target && (
        <VictoryModal
          isOpen={victoryOpen}
          onClose={() => setVictoryOpen(false)}
          target={target}
          evaluations={evaluations}
          isWon={isWon}
          language={currentLanguage}
          isRandomMode={isRandomMode}
          onStartRandomGame={handleStartRandomGame}
          onReturnToDaily={handleReturnToDaily}
        />
      )}
    </div>
  );
}
