import { ChemicalElement, GuessEvaluation } from '@/data/types';
import { elements } from '@/data/elements';
import { evaluateGuess } from './comparator';

export interface CandidateResult {
  element: ChemicalElement;
  fits: boolean;
  isGuessed: boolean;
  eliminationReason?: string;
}

export function checkElementFit(
  candidate: ChemicalElement,
  evaluations: GuessEvaluation[]
): { fits: boolean; eliminationReason?: string } {
  if (evaluations.length === 0) {
    return { fits: true };
  }

  // Check if candidate itself was already guessed
  const wasGuessed = evaluations.some(e => e.element.atomicNumber === candidate.atomicNumber);
  const lastEval = evaluations[evaluations.length - 1];

  if (lastEval.isVictory) {
    if (candidate.atomicNumber === lastEval.element.atomicNumber) {
      return { fits: true };
    }
    return { fits: false, eliminationReason: 'Target element already found' };
  }

  if (wasGuessed) {
    return { fits: false, eliminationReason: 'Already guessed (not target)' };
  }

  // Compare candidate against each evaluation
  for (const ev of evaluations) {
    const guess = ev.element;
    const testEv = evaluateGuess(guess, candidate, 0);

    // 1. Period check
    if (testEv.periodGroupCell.periodState !== ev.periodGroupCell.periodState ||
        testEv.periodGroupCell.periodDirection !== ev.periodGroupCell.periodDirection) {
      const dir = ev.periodGroupCell.periodDirection === 'up' ? `> ${guess.period}` : `< ${guess.period}`;
      const reason = ev.periodGroupCell.periodState === 'correct'
        ? `Period must be ${guess.period}`
        : `Period must be ${dir}`;
      return { fits: false, eliminationReason: reason };
    }

    // 2. Group check
    if (testEv.periodGroupCell.groupState !== ev.periodGroupCell.groupState ||
        testEv.periodGroupCell.groupDirection !== ev.periodGroupCell.groupDirection) {
      const gDisplay = guess.group !== null ? `group ${guess.group}` : 'f-block';
      const reason = ev.periodGroupCell.groupState === 'correct'
        ? `Must be in ${gDisplay}`
        : ev.periodGroupCell.groupDirection === 'up'
        ? `Group must be > ${guess.group ?? 3}`
        : `Group must be < ${guess.group ?? 4}`;
      return { fits: false, eliminationReason: reason };
    }

    // 3. Block check
    if (testEv.blockCell.state !== ev.blockCell.state) {
      const reason = ev.blockCell.state === 'correct'
        ? `Must be in ${guess.block}-block`
        : `Cannot be in ${guess.block}-block`;
      return { fits: false, eliminationReason: reason };
    }

    // 4. State check
    if (testEv.stateCell.state !== ev.stateCell.state) {
      const reason = ev.stateCell.state === 'correct'
        ? `Standard state must be ${guess.standardState}`
        : `Standard state cannot be ${guess.standardState}`;
      return { fits: false, eliminationReason: reason };
    }

    // 5. Category check
    if (testEv.categoryCell.state !== ev.categoryCell.state) {
      const reason = ev.categoryCell.state === 'correct'
        ? `Category must be ${guess.category}`
        : ev.categoryCell.state === 'partial'
        ? `Category must share meta-group with ${guess.category}`
        : `Category cannot be in same meta-group as ${guess.category}`;
      return { fits: false, eliminationReason: reason };
    }

    // 6. Mass check
    if (testEv.massCell.direction !== ev.massCell.direction ||
        testEv.massCell.state !== ev.massCell.state) {
      const dir = ev.massCell.direction === 'up' ? `> ${guess.atomicMass} u` : `< ${guess.atomicMass} u`;
      const reason = ev.massCell.state === 'correct'
        ? `Mass is ~${guess.atomicMass} u`
        : `Atomic mass must be ${dir}`;
      return { fits: false, eliminationReason: reason };
    }

    // 7. Electronegativity check
    if (testEv.electronegativityCell.direction !== ev.electronegativityCell.direction ||
        testEv.electronegativityCell.state !== ev.electronegativityCell.state) {
      const dir = ev.electronegativityCell.direction === 'up' ? `> ${guess.electronegativity}` : `< ${guess.electronegativity}`;
      const reason = ev.electronegativityCell.state === 'correct'
        ? `Electronegativity is ~${guess.electronegativity}`
        : `Electronegativity must be ${dir}`;
      return { fits: false, eliminationReason: reason };
    }

    // 8. Melting point check
    if (testEv.meltingPointCell.direction !== ev.meltingPointCell.direction ||
        testEv.meltingPointCell.state !== ev.meltingPointCell.state) {
      const dir = ev.meltingPointCell.direction === 'up' ? `> ${guess.meltingPoint} K` : `< ${guess.meltingPoint} K`;
      const reason = ev.meltingPointCell.state === 'correct'
        ? `Melting point is ~${guess.meltingPoint} K`
        : `Melting point must be ${dir}`;
      return { fits: false, eliminationReason: reason };
    }
  }

  return { fits: true };
}

export function getAllCandidateResults(
  evaluations: GuessEvaluation[],
  allElements: ChemicalElement[] = elements
): CandidateResult[] {
  const guessedSet = new Set(evaluations.map(e => e.element.atomicNumber));

  return allElements.map(element => {
    const isGuessed = guessedSet.has(element.atomicNumber);
    const { fits, eliminationReason } = checkElementFit(element, evaluations);
    return {
      element,
      fits,
      isGuessed,
      eliminationReason,
    };
  });
}
