import { ChemicalElement } from '@/data/types';
import { elements } from '@/data/elements';

/**
 * Compute a deterministic day index based on UTC date.
 * Epoch origin: January 1, 2026 UTC.
 */
export function getDailySeed(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const epochOrigin = new Date(Date.UTC(2026, 0, 1)).getTime(); // Jan 1, 2026
  return Math.floor((utcDate.getTime() - epochOrigin) / (1000 * 60 * 60 * 24));
}

/**
 * SplitMix32 PRNG — deterministic pseudo-random selection of today's element.
 * Restricts the secret pool to elements with atomicNumber <= 98.
 */
export function getDailyElement(dayIndex: number): ChemicalElement {
  const pool = elements.filter(e => e.atomicNumber >= 1 && e.atomicNumber <= 98);

  let h = (dayIndex ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  const randInt = (h ^ (h >>> 16)) >>> 0;

  const targetIndex = randInt % pool.length;
  return pool[targetIndex];
}

/**
 * Returns the current day's target element.
 */
export function getTodaysTarget(): ChemicalElement {
  const dayIndex = getDailySeed();
  return getDailyElement(dayIndex);
}

/**
 * Get the absolute day number for display (e.g., "Day #268").
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
