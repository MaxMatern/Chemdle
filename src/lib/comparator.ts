import {
  ChemicalElement,
  ElementCategory,
  FeedbackState,
  Direction,
  CellComparison,
  PeriodGroupCell,
  GuessEvaluation,
} from '@/data/types';

// ——————————————————————————————————
// Meta-group classification for Category
// ——————————————————————————————————

const METALS: ElementCategory[] = [
  'alkali-metal',
  'alkaline-earth-metal',
  'transition-metal',
  'post-transition-metal',
  'lanthanide',
  'actinide',
];

const NONMETALS: ElementCategory[] = [
  'reactive-nonmetal',
  'halogen',
  'noble-gas',
];

const METALLOIDS: ElementCategory[] = ['metalloid'];

function getMetaGroup(cat: ElementCategory): 'metal' | 'nonmetal' | 'metalloid' {
  if (METALS.includes(cat)) return 'metal';
  if (NONMETALS.includes(cat)) return 'nonmetal';
  return 'metalloid';
}

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Alkali Metal',
  'alkaline-earth-metal': 'Alkaline Earth',
  'transition-metal': 'Transition Metal',
  'post-transition-metal': 'Post-trans. Metal',
  'metalloid': 'Metalloid',
  'reactive-nonmetal': 'Reactive Nonmetal',
  'halogen': 'Halogen',
  'noble-gas': 'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide': 'Actinide',
};

// ——————————————————————————————————
// Direction helper
// ——————————————————————————————————

function getDirection(target: number, guess: number): Direction {
  if (target > guess) return 'up';
  if (target < guess) return 'down';
  return 'none';
}

// ——————————————————————————————————
// Column comparators
// ——————————————————————————————————

function compareElement(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  const isMatch = guess.atomicNumber === target.atomicNumber;
  return {
    value: `${guess.symbol} - ${guess.name}`,
    state: isMatch ? 'correct' : 'incorrect',
    label: `[${guess.atomicNumber}]`,
  };
}

function compareCategory(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  if (guess.category === target.category) {
    return {
      value: CATEGORY_LABELS[guess.category],
      state: 'correct',
    };
  }

  const guessGroup = getMetaGroup(guess.category);
  const targetGroup = getMetaGroup(target.category);

  // Metalloids match both metals and nonmetals under partial tolerance
  const isPartial =
    guessGroup === targetGroup ||
    guessGroup === 'metalloid' ||
    targetGroup === 'metalloid';

  return {
    value: CATEGORY_LABELS[guess.category],
    state: isPartial ? 'partial' : 'incorrect',
  };
}

function comparePeriodGroup(guess: ChemicalElement, target: ChemicalElement): PeriodGroupCell {
  const periodMatch = guess.period === target.period;
  const periodDirection = getDirection(target.period, guess.period);

  // Handle null groups (f-block): treat null as "no group"
  const guessGroup = guess.group;
  const targetGroup = target.group;
  let groupMatch = false;
  let groupDirection: Direction = 'none';

  if (guessGroup !== null && targetGroup !== null) {
    groupMatch = guessGroup === targetGroup;
    groupDirection = getDirection(targetGroup, guessGroup);
  } else if (guessGroup === null && targetGroup === null) {
    groupMatch = true;
    groupDirection = 'none';
  } else {
    // One is null, one isn't — mismatch
    groupMatch = false;
    // Direction: f-block is conventionally between groups 3 and 4
    if (guessGroup === null && targetGroup !== null) {
      groupDirection = targetGroup > 3 ? 'up' : 'down';
    } else if (guessGroup !== null && targetGroup === null) {
      groupDirection = guessGroup > 3 ? 'down' : 'up';
    }
  }

  const periodState: FeedbackState = periodMatch ? 'correct' : 'incorrect';
  const groupState: FeedbackState = groupMatch ? 'correct' : 'incorrect';

  // Composite evaluation
  let overallState: FeedbackState = 'incorrect';
  if (periodMatch && groupMatch) {
    overallState = 'correct';
  } else if (periodMatch || groupMatch) {
    overallState = 'partial';
  } else {
    // Check ±1 proximity
    const periodClose = Math.abs(target.period - guess.period) <= 1;
    const groupClose =
      guessGroup !== null &&
      targetGroup !== null &&
      Math.abs(targetGroup - guessGroup) <= 1;
    if (periodClose && groupClose) {
      overallState = 'partial';
    }
  }

  const groupDisplay = guessGroup !== null ? `G: ${guessGroup}` : 'G: f-block';
  const display = `P: ${guess.period} | ${groupDisplay}`;

  return {
    periodState,
    periodDirection,
    groupState,
    groupDirection,
    overallState,
    display,
  };
}

function compareBlock(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  return {
    value: guess.block,
    state: guess.block === target.block ? 'correct' : 'incorrect',
  };
}

function compareState(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  const guessState = guess.standardState === 'unknown' ? 'unknown' : guess.standardState;
  const targetState = target.standardState === 'unknown' ? 'unknown' : target.standardState;
  return {
    value: guessState.charAt(0).toUpperCase() + guessState.slice(1),
    state: guessState === targetState ? 'correct' : 'incorrect',
  };
}

function compareMass(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  const relDiff = Math.abs(target.atomicMass - guess.atomicMass) / target.atomicMass;
  const direction = getDirection(target.atomicMass, guess.atomicMass);

  let state: FeedbackState = 'incorrect';
  if (relDiff <= 0.01) state = 'correct';
  else if (relDiff <= 0.15) state = 'partial';

  return {
    value: guess.atomicMass,
    state,
    direction: state === 'correct' ? 'none' : direction,
  };
}

function compareElectronegativity(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  // Handle null cases
  if (guess.electronegativity === null && target.electronegativity === null) {
    return { value: 'N/A', state: 'correct', direction: 'none' };
  }
  if (guess.electronegativity === null || target.electronegativity === null) {
    return {
      value: guess.electronegativity !== null ? guess.electronegativity : 'N/A',
      state: 'incorrect',
      direction: 'none',
      label: guess.electronegativity === null ? 'Unknown' : undefined,
    };
  }

  const diff = Math.abs(target.electronegativity - guess.electronegativity);
  const direction = getDirection(target.electronegativity, guess.electronegativity);

  let state: FeedbackState = 'incorrect';
  if (diff <= 0.15) state = 'correct';
  else if (diff <= 0.50) state = 'partial';

  return {
    value: guess.electronegativity,
    state,
    direction: state === 'correct' ? 'none' : direction,
  };
}

function compareMeltingPoint(guess: ChemicalElement, target: ChemicalElement): CellComparison {
  // Handle null cases
  if (guess.meltingPoint === null && target.meltingPoint === null) {
    return { value: 'N/A', state: 'correct', direction: 'none' };
  }
  if (guess.meltingPoint === null || target.meltingPoint === null) {
    return {
      value: guess.meltingPoint !== null ? `${guess.meltingPoint} K` : 'N/A',
      state: 'incorrect',
      direction: 'none',
      label: guess.meltingPoint === null ? 'Unknown' : undefined,
    };
  }

  const diff = Math.abs(target.meltingPoint - guess.meltingPoint);
  const direction = getDirection(target.meltingPoint, guess.meltingPoint);

  let state: FeedbackState = 'incorrect';
  if (diff <= 50) state = 'correct';
  else if (diff <= 300) state = 'partial';

  return {
    value: `${guess.meltingPoint} K`,
    state,
    direction: state === 'correct' ? 'none' : direction,
  };
}

// ——————————————————————————————————
// Main evaluation function
// ——————————————————————————————————

export function evaluateGuess(
  guess: ChemicalElement,
  target: ChemicalElement,
  guessIndex: number
): GuessEvaluation {
  const isVictory = guess.atomicNumber === target.atomicNumber;

  return {
    id: `guess-${guessIndex}-${guess.atomicNumber}`,
    element: guess,
    elementCell: compareElement(guess, target),
    categoryCell: compareCategory(guess, target),
    periodGroupCell: comparePeriodGroup(guess, target),
    blockCell: compareBlock(guess, target),
    stateCell: compareState(guess, target),
    massCell: compareMass(guess, target),
    electronegativityCell: compareElectronegativity(guess, target),
    meltingPointCell: compareMeltingPoint(guess, target),
    isVictory,
  };
}

/**
 * Generate emoji share text for a completed game.
 */
export function generateShareText(
  evaluations: GuessEvaluation[],
  dayNumber: number
): string {
  const emojiMap: Record<FeedbackState, string> = {
    correct: '🟩',
    partial: '🟨',
    incorrect: '🟥',
    neutral: '⬜',
  };

  const lines = evaluations.map(ev => {
    return [
      emojiMap[ev.elementCell.state],
      emojiMap[ev.categoryCell.state],
      emojiMap[ev.periodGroupCell.overallState],
      emojiMap[ev.blockCell.state],
      emojiMap[ev.stateCell.state],
      emojiMap[ev.massCell.state],
      emojiMap[ev.electronegativityCell.state],
      emojiMap[ev.meltingPointCell.state],
    ].join('');
  });

  const won = evaluations.some(e => e.isVictory);
  const header = `⚗️ Elemle #${dayNumber} — ${won ? evaluations.length : 'X'}/∞`;
  return `${header}\n${lines.join('\n')}\nhttps://elemle.app`;
}
