export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export type StandardState = 'solid' | 'liquid' | 'gas' | 'unknown';
export type ElementBlock = 's' | 'p' | 'd' | 'f';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: ElementCategory;
  period: number;
  group: number | null; // null for Lanthanides/Actinides (f-block)
  block: ElementBlock;
  standardState: StandardState;
  atomicMass: number;
  electronegativity: number | null; // Pauling scale; null for noble gases / superheavies
  meltingPoint: number | null; // in Kelvin
  boilingPoint: number | null; // in Kelvin
  discoveryYear: number | 'Ancient';
  discoveredBy: string;
  funFact: string;
  electronConfiguration: string;
  emoji: string;
  primaryUse: string;
}

export type FeedbackState = 'correct' | 'partial' | 'incorrect' | 'neutral';
export type Direction = 'up' | 'down' | 'none';

export interface CellComparison {
  value: string | number;
  state: FeedbackState;
  direction?: Direction;
  label?: string;
}

export interface PeriodGroupCell {
  periodState: FeedbackState;
  periodDirection: Direction;
  groupState: FeedbackState;
  groupDirection: Direction;
  overallState: FeedbackState;
  display: string;
}

export interface GuessEvaluation {
  id: string;
  element: ChemicalElement;
  elementCell: CellComparison;
  categoryCell: CellComparison;
  periodGroupCell: PeriodGroupCell;
  blockCell: CellComparison;
  stateCell: CellComparison;
  massCell: CellComparison;
  electronegativityCell: CellComparison;
  meltingPointCell: CellComparison;
  isVictory: boolean;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayedDay: number;
}

export type Language = 'en' | 'de';

export interface StoredGameState {
  dayIndex: number;
  guesses: number[]; // atomic numbers guessed in order
  isComplete: boolean;
  isWon: boolean;
  stats: UserStats;
  settings: {
    colorblindMode: boolean;
    temperatureUnit: 'K' | 'C';
    easyMode?: boolean;
    language?: Language;
  };
}
