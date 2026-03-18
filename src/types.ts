export interface GameSettings {
  /** Number of pairs (2-12) */
  pairCount: number;

  /** Delay (in seconds) before mismatched cards flip back */
  flipDelay: number;
}

/** Default game settings used when no persisted settings exist */
export const CARD_ASSETS: string[] = [
  "camera",
  "gamepad",
  "glasses",
  "joystick",
  "headphones",
  "keyboard",
  "monitor",
  "mouse",
  "notebook",
  "phone",
  "speaker",
  "usb",
];

export const BACK_IMAGE = "back";
export const DEFAULT_SETTINGS: GameSettings = {
  pairCount: 6,
  flipDelay: 1.0,
};

export interface Card {
  /** Unique identifier for this card instance */
  id: string;

  /** Image identifier (1-12), determines which image to display */
  imageId: number;

  /** Whether the card is currently face‑up */
  isFlipped: boolean;

  /** Whether the card has been matched and removed from play */
  isMatched: boolean;
}

/** Current phase of the game */
export type GamePhase =
  | "idle" // Game created, waiting for first flip
  | "playing" // Player is selecting cards
  | "checking" // Two cards selected, checking for match
  | "completed"; // All pairs matched, game won;

export interface GameState {
  /** All cards currently in the game */
  cards: Card[];

  /** Currently selected (face-up but not yet matched) cards (max 2) */
  selectedCards: Card[];

  /** Number of moves made (each move = two cards revealed) */
  moveCount: number;

  /** Unix timestamp when first card was flipped (null if not started) */
  startTime: number | null;

  /** Elapsed time in seconds since the first flip */
  elapsedTime: number;

  /** Current phase of the game */
  phase: GamePhase;

  /** Current game settings */
  settings: GameSettings;
}

/** Simple result wrapper used throughout the codebase */
export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

/** Utility type representing a value that may be null or undefined */
export type Maybe<T> = T | null | undefined;

/**
 * Game statistics for display
 */
export interface GameStats {
  /** Number of moves made */
  moves: number;

  /** Formatted time string (MM:SS) */
  time: string;
}

/**
 * Grid layout dimensions
 */
export interface GridDimensions {
  /** Number of rows in the grid */
  rows: number;

  /** Number of columns in the grid */
  columns: number;
}
