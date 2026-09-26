'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChemicalElement, StoredGameState, UserStats, GuessEvaluation } from '@/data/types';
import { elements } from '@/data/elements';
import { getDailySeed, getDailyElement } from '@/lib/dailyTarget';
import { evaluateGuess } from '@/lib/comparator';

const STORAGE_KEY = 'chemdle_storage_v1';

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
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem('elemle_storage_v1');
    }
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
  const [dailyEvaluations, setDailyEvaluations] = useState<GuessEvaluation[]>([]);
  const [dailyTarget, setDailyTarget] = useState<ChemicalElement | null>(null);

  // Random Mode state
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
  const [randomTarget, setRandomTarget] = useState<ChemicalElement | null>(null);
  const [randomEvaluations, setRandomEvaluations] = useState<GuessEvaluation[]>([]);
  const [randomGuesses, setRandomGuesses] = useState<number[]>([]);
  const [randomIsComplete, setRandomIsComplete] = useState<boolean>(false);
  const [randomIsWon, setRandomIsWon] = useState<boolean>(false);

  const latestAnimatingRow = useRef<number>(-1);

  // Initialize on mount
  useEffect(() => {
    const dayIndex = getDailySeed();
    const todaysTarget = getDailyElement(dayIndex);
    setDailyTarget(todaysTarget);

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

    setDailyEvaluations(evals);
    setGameState(stored);
    saveState(stored);
    setIsLoaded(true);
  }, []);

  // Start a new game with a random element
  const startRandomGame = useCallback(() => {
    // Pick an element different from the previous target
    const currentNum = isRandomMode ? randomTarget?.atomicNumber : dailyTarget?.atomicNumber;
    const pool = elements.filter(el => el.atomicNumber !== currentNum);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    setRandomTarget(chosen);
    setRandomGuesses([]);
    setRandomEvaluations([]);
    setRandomIsComplete(false);
    setRandomIsWon(false);
    setIsRandomMode(true);
    latestAnimatingRow.current = -1;
  }, [isRandomMode, randomTarget, dailyTarget]);

  // Return back to today's daily puzzle
  const returnToDailyGame = useCallback(() => {
    setIsRandomMode(false);
    latestAnimatingRow.current = -1;
  }, []);

  const submitGuess = useCallback(
    (element: ChemicalElement) => {
      if (isRandomMode) {
        if (!randomTarget || randomIsComplete) return;
        if (randomGuesses.includes(element.atomicNumber)) return;

        const nextGuesses = [...randomGuesses, element.atomicNumber];
        const evaluation = evaluateGuess(element, randomTarget, nextGuesses.length - 1);
        const isVictory = evaluation.isVictory;

        latestAnimatingRow.current = nextGuesses.length - 1;
        setRandomGuesses(nextGuesses);
        setRandomEvaluations(prev => [...prev, evaluation]);

        if (isVictory) {
          setRandomIsComplete(true);
          setRandomIsWon(true);
        }
        return;
      }

      // Daily Game Mode
      if (!gameState || !dailyTarget || gameState.isComplete) return;

      // Prevent duplicate guesses
      if (gameState.guesses.includes(element.atomicNumber)) return;

      const newGuesses = [...gameState.guesses, element.atomicNumber];
      const evaluation = evaluateGuess(element, dailyTarget, newGuesses.length - 1);
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
      setDailyEvaluations(prev => [...prev, evaluation]);
      setGameState(newState);
      saveState(newState);
    },
    [isRandomMode, randomTarget, randomIsComplete, randomGuesses, gameState, dailyTarget]
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

  const activeTarget = isRandomMode ? randomTarget : dailyTarget;
  const activeEvaluations = isRandomMode ? randomEvaluations : dailyEvaluations;
  const activeGuessedAtomicNumbers = isRandomMode ? randomGuesses : (gameState?.guesses ?? []);
  const activeIsComplete = isRandomMode ? randomIsComplete : (gameState?.isComplete ?? false);
  const activeIsWon = isRandomMode ? randomIsWon : (gameState?.isWon ?? false);

  return {
    isLoaded,
    gameState,
    evaluations: activeEvaluations,
    target: activeTarget,
    isRandomMode,
    startRandomGame,
    returnToDailyGame,
    submitGuess,
    updateSettings,
    guessedAtomicNumbers: activeGuessedAtomicNumbers,
    isComplete: activeIsComplete,
    isWon: activeIsWon,
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
