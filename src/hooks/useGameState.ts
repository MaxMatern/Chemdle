'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChemicalElement, StoredGameState, UserStats, GuessEvaluation } from '@/data/types';
import { elements } from '@/data/elements';
import { getDailySeed, getDailyElement } from '@/lib/dailyTarget';
import { evaluateGuess } from '@/lib/comparator';

const STORAGE_KEY = 'elemle_storage_v1';

function getDefaultStats(): UserStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {},
    lastPlayedDay: -1,
  };
}

function getDefaultState(dayIndex: number): StoredGameState {
  return {
    dayIndex,
    guesses: [],
    isComplete: false,
    isWon: false,
    stats: getDefaultStats(),
    settings: {
      colorblindMode: false,
      temperatureUnit: 'K',
      easyMode: false,
      language: 'en',
    },
  };
}

function loadState(): StoredGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredGameState;
  } catch {
    return null;
  }
}

function saveState(state: StoredGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — silently fail
  }
}

export function useGameState() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [gameState, setGameState] = useState<StoredGameState | null>(null);
  const [evaluations, setEvaluations] = useState<GuessEvaluation[]>([]);
  const [target, setTarget] = useState<ChemicalElement | null>(null);
  const latestAnimatingRow = useRef<number>(-1);

  // Initialize on mount
  useEffect(() => {
    const dayIndex = getDailySeed();
    const todaysTarget = getDailyElement(dayIndex);
    setTarget(todaysTarget);

    let stored = loadState();

    if (!stored) {
      stored = getDefaultState(dayIndex);
    } else if (stored.dayIndex !== dayIndex) {
      // New day: archive old stats, reset game
      const stats = { ...stored.stats };

      // Update streak
      if (stored.dayIndex === dayIndex - 1) {
        // Consecutive day
        if (stored.isWon) {
          // Streak continues from yesterday's win
        } else {
          stats.currentStreak = 0;
        }
      } else {
        // Skipped days — reset streak
        stats.currentStreak = 0;
      }

      stored = {
        ...getDefaultState(dayIndex),
        stats,
        settings: stored.settings,
      };
    }

    // Rebuild evaluations from stored guesses
    const evals: GuessEvaluation[] = stored.guesses.map((atomicNum, idx) => {
      const el = elements.find(e => e.atomicNumber === atomicNum);
      if (!el) throw new Error(`Unknown element with atomic number ${atomicNum}`);
      return evaluateGuess(el, todaysTarget, idx);
    });

    setEvaluations(evals);
    setGameState(stored);
    saveState(stored);
    setIsLoaded(true);
  }, []);

  const submitGuess = useCallback(
    (element: ChemicalElement) => {
      if (!gameState || !target || gameState.isComplete) return;

      // Prevent duplicate guesses
      if (gameState.guesses.includes(element.atomicNumber)) return;

      const newGuesses = [...gameState.guesses, element.atomicNumber];
      const evaluation = evaluateGuess(element, target, newGuesses.length - 1);
      const isVictory = evaluation.isVictory;

      const newStats = { ...gameState.stats };
      let isComplete = false;

      if (isVictory) {
        isComplete = true;
        newStats.gamesPlayed += 1;
        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.lastPlayedDay = gameState.dayIndex;

        const guessCount = newGuesses.length;
        newStats.guessDistribution = {
          ...newStats.guessDistribution,
          [guessCount]: (newStats.guessDistribution[guessCount] || 0) + 1,
        };
      }

      const newState: StoredGameState = {
        ...gameState,
        guesses: newGuesses,
        isComplete,
        isWon: isVictory,
        stats: newStats,
      };

      latestAnimatingRow.current = newGuesses.length - 1;
      setEvaluations(prev => [...prev, evaluation]);
      setGameState(newState);
      saveState(newState);
    },
    [gameState, target]
  );

  const updateSettings = useCallback(
    (settings: Partial<StoredGameState['settings']>) => {
      if (!gameState) return;
      const newState = {
        ...gameState,
        settings: { ...gameState.settings, ...settings },
      };
      setGameState(newState);
      saveState(newState);
    },
    [gameState]
  );

  return {
    isLoaded,
    gameState,
    evaluations,
    target,
    submitGuess,
    updateSettings,
    guessedAtomicNumbers: gameState?.guesses ?? [],
    isComplete: gameState?.isComplete ?? false,
    isWon: gameState?.isWon ?? false,
    settings: {
      colorblindMode: gameState?.settings?.colorblindMode ?? false,
      temperatureUnit: gameState?.settings?.temperatureUnit ?? 'K',
      easyMode: gameState?.settings?.easyMode ?? false,
      language: gameState?.settings?.language ?? 'en',
    },
    stats: gameState?.stats ?? getDefaultStats(),
    latestAnimatingRow,
  };
}
