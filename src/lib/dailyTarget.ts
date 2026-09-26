import { ChemicalElement } from '@/data/types';
import { elements } from '@/data/elements';

// Epoch origin: September 26, 2026 UTC (Day 1 of Chemdle)
const EPOCH_YEAR = 2026;
const EPOCH_MONTH = 8; // September (0-indexed: 0=Jan, 8=Sep)
const EPOCH_DAY = 26;

// Master seed for the deterministic cycle shuffle
const MASTER_SALT = 49;

/**
 * Compute a deterministic day index based on UTC date.
 * Day 0 = September 26, 2026 (displays as Day #1).
 * Increments by +1 each UTC day at midnight.
 */
export function getDailySeed(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const epochOrigin = new Date(Date.UTC(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY)).getTime();
  const diff = utcDate.getTime() - epochOrigin;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Deterministic pseudo-random selection of the secret element.
 * Elements are shuffled in 118-day non-repeating cycles using a seeded
 * Mulberry32 PRNG and Fisher-Yates shuffle.
 * Every element appears exactly once per cycle before reshuffling.
 */
export function getDailyElement(dayIndex: number): ChemicalElement {
  const pool = [...elements];
  const poolSize = pool.length;

  const cycle = Math.floor(dayIndex / poolSize);
  const offset = ((dayIndex % poolSize) + poolSize) % poolSize;

  // Mulberry32 PRNG seeded per cycle
  let s = (MASTER_SALT ^ Math.imul(cycle + 1, 0x9e3779b9)) >>> 0;
  function rand(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Deterministic Fisher-Yates permutation
  const permutation = [...pool];
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = permutation[i];
    permutation[i] = permutation[j];
    permutation[j] = temp;
  }

  return permutation[offset];
}

/**
 * Returns the current day's target element.
 */
export function getTodaysTarget(): ChemicalElement {
  const dayIndex = getDailySeed();
  return getDailyElement(dayIndex);
}

/**
 * Get the absolute day number for display (e.g., "Day #1" for today).
 * Days continuously add up indefinitely.
 */
export function getDayNumber(): number {
  return getDailySeed() + 1; // 1-indexed for display
}

/**
 * Milliseconds until next UTC midnight.
 */
export function getTimeUntilNextDay(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime() - now.getTime();
}
