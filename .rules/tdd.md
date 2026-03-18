---
description: TDD Implementation Rules & Best Practices
---

## Core Principles

You are implementing a card matching game following **Test-Driven Development (TDD)**, **Functional Programming (FP)** principles, and **modern web standards**. Every implementation must strictly adhere to these rules.

---

## 🔴 RED-GREEN-REFACTOR CYCLE (MANDATORY)

### Rule 1: Write Tests First, Always
**YOU MUST write tests BEFORE implementation code. No exceptions.**

#### Process for Every Feature:
```
1. RED: Write a failing test
2. GREEN: Write minimal code to pass the test
3. REFACTOR: Clean up code while keeping tests green
4. REPEAT: Add next test
```

#### Example Workflow:
```typescript
// Step 1: RED - Write failing test
describe('formatTime', () => {
  it('formats zero seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00'); // Test fails (function doesn't exist)
  });
});

// Step 2: GREEN - Minimal implementation
export function formatTime(seconds: number): string {
  return '00:00'; // Hardcoded to pass test
}

// Step 3: RED - Add more specific test
it('formats 65 seconds as 01:05', () => {
  expect(formatTime(65)).toBe('01:05'); // Test fails
});

// Step 4: GREEN - Implement real logic
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Step 5: REFACTOR - Improve code quality
export function formatTime(seconds: number): string {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const remainingSeconds = Math.floor(Math.max(0, seconds) % 60);
  
  return [minutes, remainingSeconds]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}
```

### Rule 2: Test Granularity
- **Start with simplest case** (often zero, empty, or default)
- **Add one complexity at a time**
- **Each test should test ONE behavior**

#### Bad (Too Much at Once):
```typescript
it('handles all time formatting cases', () => {
  expect(formatTime(0)).toBe('00:00');
  expect(formatTime(5)).toBe('00:05');
  expect(formatTime(65)).toBe('01:05');
  expect(formatTime(3600)).toBe('60:00');
});
```

#### Good (Incremental):
```typescript
it('formats zero seconds', () => {
  expect(formatTime(0)).toBe('00:00');
});

it('formats seconds under one minute', () => {
  expect(formatTime(5)).toBe('00:05');
});

it('formats minutes and seconds', () => {
  expect(formatTime(65)).toBe('01:05');
});

it('handles times over one hour', () => {
  expect(formatTime(3600)).toBe('60:00');
});
```

### Rule 3: Test Names Must Be Descriptive
**Format:** `it('should [expected behavior] when [condition]')`

#### Bad:
```typescript
it('works', () => { ... });
it('test shuffle', () => { ... });
```

#### Good:
```typescript
it('should return empty array when given zero pairs', () => { ... });
it('should shuffle cards randomly while preserving all cards', () => { ... });
it('should throw error when pairCount is negative', () => { ... });
```

---

## 🎯 FUNCTIONAL PROGRAMMING PRINCIPLES (MANDATORY)

### Rule 4: Pure Functions Everywhere
**A pure function:**
- Returns the same output for the same input (deterministic)
- Has no side effects (doesn't mutate external state)
- Doesn't depend on external mutable state

#### Bad (Impure):
```typescript
let gameState: GameState; // Global mutable state

function selectCard(card: Card): void {
  gameState.selectedCards.push(card); // Mutates global state
  gameState.moveCount++; // Side effect
}
```

#### Good (Pure):
```typescript
function selectCard(state: GameState, card: Card): GameState {
  return {
    ...state, // New object
    selectedCards: [...state.selectedCards, card], // New array
    moveCount: state.selectedCards.length === 1 ? state.moveCount + 1 : state.moveCount,
  };
}
```

### Rule 5: Immutability Always
**NEVER mutate objects or arrays. Always create new copies.**

#### Bad (Mutation):
```typescript
function flipCard(cards: Card[], cardId: string): Card[] {
  const card = cards.find(c => c.id === cardId);
  card.isFlipped = true; // MUTATION - BAD!
  return cards;
}
```

#### Good (Immutable):
```typescript
function flipCard(cards: Card[], cardId: string): Card[] {
  return cards.map(card =>
    card.id === cardId
      ? { ...card, isFlipped: true } // New object
      : card
  );
}
```

#### Better (Functional):
```typescript
const flipCard = (cards: Card[], cardId: string): Card[] =>
  cards.map(card =>
    card.id === cardId
      ? { ...card, isFlipped: true }
      : card
  );
```

### Rule 6: Function Composition Over Imperative Loops
**Prefer map, filter, reduce over for loops.**

#### Bad (Imperative):
```typescript
function getMatchedCards(cards: Card[]): Card[] {
  const matched = [];
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].isMatched) {
      matched.push(cards[i]);
    }
  }
  return matched;
}
```

#### Good (Declarative):
```typescript
const getMatchedCards = (cards: Card[]): Card[] =>
  cards.filter(card => card.isMatched);
```

#### Good (Composition):
```typescript
const isMatched = (card: Card): boolean => card.isMatched;
const isFlipped = (card: Card): boolean => card.isFlipped;

const getMatchedCards = (cards: Card[]): Card[] =>
  cards.filter(isMatched);

const getFlippedCards = (cards: Card[]): Card[] =>
  cards.filter(isFlipped);

const getActiveCards = (cards: Card[]): Card[] =>
  cards.filter(card => !isMatched(card) && !isFlipped(card));
```

### Rule 7: No Side Effects in Pure Functions
**Side effects belong in specific places:**
- Web Components (lifecycle methods, event handlers)
- Service layer (localStorage, audio)
- NOT in business logic functions

#### Bad:
```typescript
function checkForMatch(state: GameState): GameState {
  const [card1, card2] = state.selectedCards;
  
  if (card1.imageId === card2.imageId) {
    playSound('match'); // SIDE EFFECT IN PURE FUNCTION - BAD!
    return { ...state, /* ... */ };
  }
  
  return state;
}
```

#### Good:
```typescript
// Pure function - no side effects
function checkForMatch(state: GameState): {
  newState: GameState;
  soundToPlay: SoundType | null;
} {
  const [card1, card2] = state.selectedCards;
  
  if (card1.imageId === card2.imageId) {
    return {
      newState: { ...state, /* ... */ },
      soundToPlay: 'match', // Return data, don't execute
    };
  }
  
  return { newState: state, soundToPlay: null };
}

// Side effect in component
class GameBoard extends HTMLElement {
  private handleMatch() {
    const { newState, soundToPlay } = checkForMatch(this.gameState);
    this.gameState = newState;
    
    if (soundToPlay) {
      this.audioService.play(soundToPlay); // Side effect here
    }
  }
}
```

### Rule 8: Higher-Order Functions
**Use functions that take or return functions.**

#### Good:
```typescript
// Higher-order function
const createCardMatcher = (imageId: number) => (card: Card): boolean =>
  card.imageId === imageId;

// Usage
const findCardsWithImage = (cards: Card[], imageId: number): Card[] =>
  cards.filter(createCardMatcher(imageId));

// Partial application
const matchCards = (card1: Card) => (card2: Card): boolean =>
  card1.imageId === card2.imageId;

// Currying
const updateCardProperty = (property: keyof Card) => (value: any) => (card: Card): Card => ({
  ...card,
  [property]: value,
});

const flipCardTrue = updateCardProperty('isFlipped')(true);
const matchCardTrue = updateCardProperty('isMatched')(true);
```

### Rule 9: Avoid Null/Undefined - Use Type Safety
**Prefer explicit types and Maybe/Option patterns.**

#### Bad:
```typescript
function findCard(cards: Card[], id: string): Card | null {
  return cards.find(c => c.id === id) ?? null; // null is error-prone
}

const card = findCard(cards, '123');
console.log(card.imageId); // Runtime error if null!
```

#### Good:
```typescript
type Maybe<T> = T | undefined;

function findCard(cards: Card[], id: string): Maybe<Card> {
  return cards.find(c => c.id === id);
}

// Force explicit handling
const card = findCard(cards, '123');
if (card) {
  console.log(card.imageId); // Safe
}

// Or use functional approach
const getImageId = (cards: Card[], id: string): number | undefined =>
  findCard(cards, id)?.imageId;
```

#### Better (Result Type):
```typescript
type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };

function findCard(cards: Card[], id: string): Result<Card, string> {
  const card = cards.find(c => c.id === id);
  
  return card
    ? { success: true, value: card }
    : { success: false, error: `Card ${id} not found` };
}

// Usage
const result = findCard(cards, '123');
if (result.success) {
  console.log(result.value.imageId);
} else {
  console.error(result.error);
}
```

---

## 🧩 WEB COMPONENTS BEST PRACTICES (MANDATORY)

### Rule 10: Shadow DOM Always
**Every component must use Shadow DOM for encapsulation.**

```typescript
class GameCard extends HTMLElement {
  private shadow: ShadowRoot;
  
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' }); // REQUIRED
  }
}
```

### Rule 11: Component State Management
**Keep component state minimal and local. Pass data down via attributes/properties.**

#### Bad (Shared Mutable State):
```typescript
// Global state - BAD
const globalGameState = { ... };

class GameCard extends HTMLElement {
  handleClick() {
    globalGameState.selectedCards.push(this.card); // Mutation - BAD
  }
}
```

#### Good (Props Down, Events Up):
```typescript
class GameCard extends HTMLElement {
  // Data flows down via attributes
  set card(value: Card) {
    this._card = value;
    this.render();
  }
  
  // Events flow up to parent
  private handleClick() {
    this.dispatchEvent(new CustomEvent('card-selected', {
      detail: { cardId: this._card.id },
      bubbles: true,
      composed: true, // Cross shadow DOM boundary
    }));
  }
}

class GameBoard extends HTMLElement {
  connectedCallback() {
    this.addEventListener('card-selected', (e: CustomEvent) => {
      // Handle state change in parent
      const newState = selectCard(this.gameState, e.detail.cardId);
      this.gameState = newState;
      this.render();
    });
  }
}
```

### Rule 12: Lifecycle Methods
**Use appropriate lifecycle methods. Clean up in disconnectedCallback.**

```typescript
class GameBoard extends HTMLElement {
  private timerId: number | null = null;
  
  connectedCallback() {
    this.render();
    this.attachListeners();
    this.startTimer();
  }
  
  disconnectedCallback() {
    this.removeListeners();
    this.stopTimer(); // REQUIRED - prevent memory leaks
  }
  
  private startTimer() {
    this.timerId = window.setInterval(() => {
      this.updateTime();
    }, 1000);
  }
  
  private stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
```

### Rule 13: Observed Attributes
**React to attribute changes properly.**

```typescript
class GameCard extends HTMLElement {
  static get observedAttributes() {
    return ['flipped', 'matched', 'image-id'];
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'flipped':
        this.updateFlipState(newValue === 'true');
        break;
      case 'matched':
        this.updateMatchState(newValue === 'true');
        break;
      case 'image-id':
        this.updateImage(parseInt(newValue, 10));
        break;
    }
  }
}
```

### Rule 14: Render Method Pattern
**Separate render logic from state management.**

```typescript
class GameBoard extends HTMLElement {
  private gameState: GameState;
  
  // Pure render function
  private render() {
    const html = this.template(this.gameState);
    this.shadow.innerHTML = html;
    this.attachListeners(); // Re-attach after render
  }
  
  // Template function (pure)
  private template(state: GameState): string {
    return `
      <style>${this.styles()}</style>
      <div class="board">
        ${state.cards.map(card => this.cardTemplate(card)).join('')}
      </div>
    `;
  }
  
  // Card template (pure)
  private cardTemplate(card: Card): string {
    return `
      <game-card
        card-id="${card.id}"
        image-id="${card.imageId}"
        ?flipped="${card.isFlipped}"
        ?matched="${card.isMatched}"
      ></game-card>
    `;
  }
  
  // Styles (pure)
  private styles(): string {
    return `
      .board {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      }
    `;
  }
}
```

---

## 🎨 MODERN CSS BEST PRACTICES (MANDATORY)

### Rule 15: CSS Custom Properties (Variables)
**Use CSS variables for theming and reusability.**

```css
/* variables.css */
:root {
  /* Colors */
  --color-primary: #4f46e5;
  --color-secondary: #06b6d4;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-background: #ffffff;
  --color-text: #1f2937;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  
  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Easing */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* Usage */
.card {
  padding: var(--spacing-md);
  background: var(--color-background);
  transition: transform var(--duration-normal) var(--ease-in-out);
}
```

### Rule 16: Flexbox for Layouts
**Use Flexbox for one-dimensional layouts.**

#### Card Grid (Flexbox):
```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: flex-start;
}

.card {
  flex: 0 0 calc(25% - var(--spacing-md)); /* 4 columns */
  aspect-ratio: 1 / 1; /* Square cards */
  max-width: 150px;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    flex: 0 0 calc(33.333% - var(--spacing-md)); /* 3 columns */
  }
}

@media (max-width: 480px) {
  .card {
    flex: 0 0 calc(50% - var(--spacing-md)); /* 2 columns */
  }
}
```

#### Stats Layout (Flexbox):
```css
.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}
```

### Rule 17: CSS Grid for Two-Dimensional Layouts
**Use CSS Grid for complex layouts.**

```css
.game-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header"
    "board"
    "footer";
  min-height: 100vh;
  gap: var(--spacing-md);
}

.header {
  grid-area: header;
}

.board {
  grid-area: board;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.footer {
  grid-area: footer;
}
```

### Rule 18: Animations with CSS Only
**Use CSS animations and transitions. No JavaScript for animations.**

#### Card Flip Animation:
```css
.card {
  perspective: 1000px;
  transition: transform var(--duration-normal) var(--ease-in-out);
}

.card:hover:not(.matched) {
  transform: scale(1.05);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--duration-normal) var(--ease-in-out);
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--spacing-sm);
}

.card-front {
  transform: rotateY(180deg);
}

.card-back {
  transform: rotateY(0deg);
}
```

#### Match Animation:
```css
@keyframes match-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.card.matched {
  animation: match-pulse var(--duration-normal) var(--ease-in-out);
  opacity: 0.6;
  filter: grayscale(50%);
}
```

#### Modal Animation:
```css
.modal {
  opacity: 0;
  transform: translateY(-50px);
  transition: 
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.modal.visible {
  opacity: 1;
  transform: translateY(0);
}

.modal-backdrop {
  background: rgba(0, 0, 0, 0);
  transition: background var(--duration-normal) var(--ease-out);
}

.modal-backdrop.visible {
  background: rgba(0, 0, 0, 0.7);
}
```

### Rule 19: Responsive Design
**Mobile-first approach with min-width media queries.**

```css
/* Mobile first (default) */
.card-grid {
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
}

.card {
  font-size: var(--font-size-sm);
}

/* Tablet */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
  }
  
  .card {
    font-size: var(--font-size-base);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(6, 1fr); /* 6 columns */
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Rule 20: Accessibility in CSS
**Ensure proper focus states and contrast.**

```css
/* Focus visible for keyboard navigation */
*:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove outline for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-text: #000000;
    --color-background: #ffffff;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1f2937;
    --color-text: #f9fafb;
  }
}
```

### Rule 21: CSS Organization
**Organize CSS logically within Shadow DOM.**

```css
/* Component CSS structure */
<style>
  /* 1. CSS Custom Properties */
  :host {
    --card-size: 100px;
    --card-gap: 1rem;
  }
  
  /* 2. Host styles */
  :host {
    display: block;
    container-type: inline-size;
  }
  
  /* 3. Layout */
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--card-gap);
  }
  
  /* 4. Components */
  .card {
    /* ... */
  }
  
  /* 5. States */
  .card.flipped {
    /* ... */
  }
  
  .card.matched {
    /* ... */
  }
  
  /* 6. Interactions */
  .card:hover {
    /* ... */
  }
  
  .card:active {
    /* ... */
  }
  
  /* 7. Animations */
  @keyframes flip {
    /* ... */
  }
  
  /* 8. Media queries */
  @media (min-width: 768px) {
    /* ... */
  }
</style>
```

---

## 📝 TESTING BEST PRACTICES

### Rule 22: Test Structure (AAA Pattern)
**Arrange, Act, Assert - Every test must follow this pattern.**

```typescript
describe('Card Shuffler', () => {
  it('should shuffle cards randomly while preserving all cards', () => {
    // ARRANGE - Set up test data
    const originalCards = createCardDeck(3); // 6 cards
    const originalIds = originalCards.map(c => c.id).sort();
    
    // ACT - Execute the function
    const shuffled = shuffleCards(originalCards);
    const shuffledIds = shuffled.map(c => c.id).sort();
    
    // ASSERT - Verify expectations
    expect(shuffledIds).toEqual(originalIds);
    expect(shuffled.length).toBe(originalCards.length);
    // Position properties should be updated
    shuffled.forEach((card, index) => {
      expect(card.position).toBe(index);
    });
  });
});
```

### Rule 23: Test Independence
**Each test must be completely independent.**

```typescript
describe('Settings Service', () => {
  // BAD - Tests depend on each other
  it('saves settings', () => {
    saveSettings({ pairCount: 8, flipDelay: 1.5, soundEnabled: true });
  });
  
  it('loads settings', () => {
    const settings = loadSettings(); // Depends on previous test!
    expect(settings.pairCount).toBe(8);
  });
  
  // GOOD - Each test is independent
  beforeEach(() => {
    localStorage.clear(); // Clean slate for each test
  });
  
  it('should save settings to localStorage', () => {
    const testSettings = { pairCount: 8, flipDelay: 1.5, soundEnabled: true };
    
    saveSettings(testSettings);
    
    const saved = localStorage.getItem('card-game-settings');
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual(testSettings);
  });
  
  it('should load settings from localStorage', () => {
    const testSettings = { pairCount: 8, flipDelay: 1.5, soundEnabled: true };
    localStorage.setItem('card-game-settings', JSON.stringify(testSettings));
    
    const loaded = loadSettings();
    
    expect(loaded).toEqual(testSettings);
  });
});
```

### Rule 24: Test Edge Cases
**Always test boundary conditions and error cases.**

```typescript
describe('validateSettings', () => {
  describe('pairCount validation', () => {
    it('should accept valid pair counts', () => {
      expect(validateSettings({ pairCount: 6 }).pairCount).toBe(6);
    });
    
    it('should clamp pair count below minimum', () => {
      expect(validateSettings({ pairCount: 1 }).pairCount).toBe(2);
      expect(validateSettings({ pairCount: 0 }).pairCount).toBe(2);
      expect(validateSettings({ pairCount: -5 }).pairCount).toBe(2);
    });
    
    it('should clamp pair count above maximum', () => {
      expect(validateSettings({ pairCount: 13 }).pairCount).toBe(12);
      expect(validateSettings({ pairCount: 100 }).pairCount).toBe(12);
    });
    
    it('should round decimal pair counts', () => {
      expect(validateSettings({ pairCount: 6.7 }).pairCount).toBe(7);
      expect(validateSettings({ pairCount: 6.3 }).pairCount).toBe(6);
    });
    
    it('should handle missing pair count with default', () => {
      expect(validateSettings({}).pairCount).toBe(6);
    });
  });
});
```

### Rule 25: Mock External Dependencies
**Never rely on real external services in tests.**

```typescript
describe('Audio Service', () => {
  let mockAudio: any;
  
  beforeEach(() => {
    // Mock HTMLAudioElement
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      currentTime: 0,
      volume: 1,
    };
    
    global.HTMLAudioElement = vi.fn(() => mockAudio) as any;
  });
  
  it('should play sound when enabled', () => {
    const audioService = new AudioService(true);
    
    audioService.play('flip');
    
    expect(mockAudio.play).toHaveBeenCalled();
  });
  
  it('should not play sound when disabled', () => {
    const audioService = new AudioService(false);
    
    audioService.play('flip');
    
    expect(mockAudio.play).not.toHaveBeenCalled();
  });
});
```

### Rule 26: Test Descriptions Are Documentation
**Test names should explain the "why", not just the "what".**

```typescript
// BAD - What but not why
it('returns true', () => { ... });
it('updates state', () => { ... });

// GOOD - Explains behavior and context
it('should return true when card is not flipped or matched', () => { ... });
it('should increment move count when two cards are revealed', () => { ... });
it('should prevent card selection during checking phase to avoid race conditions', () => { ... });
```

---

## 🔄 ITERATIVE DEVELOPMENT WORKFLOW

### Rule 27: Small, Incremental Steps
**Each iteration should add ONE small piece of functionality.**

#### Example: Building `formatTime` function

**Iteration 1:**
```typescript
// Test
it('formats zero seconds', () => {
  expect(formatTime(0)).toBe('00:00');
});

// Implementation
export function formatTime(seconds: number): string {
  return '00:00';
}
```

**Iteration 2:**
```typescript
// Test
it('formats single digit seconds', () => {
  expect(formatTime(5)).toBe('00:05');
});

// Implementation
export function formatTime(seconds: number): string {
  if (seconds === 0) return '00:00';
  return `00:0${seconds}`;
}
```

**Iteration 3:**
```typescript
// Test
it('formats double digit seconds', () => {
  expect(formatTime(30)).toBe('00:30');
});

// Implementation
export function formatTime(seconds: number): string {
  if (seconds === 0) return '00:00';
  const secs = String(seconds).padStart(2, '0');
  return `00:${secs}`;
}
```

**Iteration 4:**
```typescript
// Test
it('formats minutes and seconds', () => {
  expect(formatTime(65)).toBe('01:05');
});

// Implementation
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
```

### Rule 28: Refactor After Green
**Only refactor when all tests are passing.**

```typescript
// After all tests pass, refactor for clarity
export function formatTime(seconds: number): string {
  const clampedSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clampedSeconds / 60);
  const remainingSeconds = clampedSeconds % 60;
  
  return [minutes, remainingSeconds]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}
```

### Rule 29: Commit After Each Green Test
**Each passing test is a checkpoint.**

```bash
# After RED → GREEN cycle
git add .
git commit -m "test: add formatTime for zero seconds"

# After next RED → GREEN cycle
git add .
git commit -m "test: add formatTime for single digit seconds"

# After refactor
git add .
git commit -m "refactor: simplify formatTime with functional approach"
```

### Rule 30: One Feature at a Time
**Complete one feature fully before starting the next.**

**DON'T:**
```
❌ Start card-shuffler
❌ Start time-formatter (incomplete)
❌ Start settings-service (not started)
```

**DO:**
```
✅ Complete card-shuffler (all tests pass)
✅ Complete time-formatter (all tests pass)
✅ Complete settings-service (all tests pass)
```

---

## 🚨 ANTI-PATTERNS TO AVOID

### Anti-Pattern 1: Testing Implementation Details
```typescript
// BAD - Tests internal implementation
it('uses Array.map to transform cards', () => {
  const spy = vi.spyOn(Array.prototype, 'map');
  flipCard(cards, cardId);
  expect(spy).toHaveBeenCalled();
});

// GOOD - Tests behavior
it('returns new array with specified card flipped', () => {
  const result = flipCard(cards, cardId);
  const flipped = result.find(c => c.id === cardId);
  expect(flipped?.isFlipped).toBe(true);
  expect(result).not.toBe(cards); // Immutability
});
```

### Anti-Pattern 2: Mutation
```typescript
// BAD - Mutates input
function flipCard(card: Card): Card {
  card.isFlipped = true; // MUTATION!
  return card;
}

// GOOD - Returns new object
const flipCard = (card: Card): Card => ({
  ...card,
  isFlipped: true,
});
```

### Anti-Pattern 3: Large Functions
```typescript
// BAD - Does too much
function handleCardClick(cardId: string): void {
  const card = cards.find(c => c.id === cardId);
  if (!card || card.isFlipped || card.isMatched) return;
  
  selectedCards.push(card);
  card.isFlipped = true;
  moveCount++;
  
  if (selectedCards.length === 2) {
    if (selectedCards[0].imageId === selectedCards[1].imageId) {
      selectedCards[0].isMatched = true;
      selectedCards[1].isMatched = true;
      playSound('match');
    } else {
      setTimeout(() => {
        selectedCards[0].isFlipped = false;
        selectedCards[1].isFlipped = false;
        playSound('mismatch');
      }, 1000);
    }
    selectedCards = [];
  }
}

// GOOD - Composed from small functions
const handleCardClick = (state: GameState, cardId: string): GameState => {
  const card = findCard(state.cards, cardId);
  
  if (!canSelectCard(state, card)) {
    return state;
  }
  
  return pipe(
    selectCard(card),
    maybeCheckForMatch,
    maybeIncrementMoves
  )(state);
};

// Small, testable functions
const canSelectCard = (state: GameState, card: Maybe<Card>): boolean =>
  card !== undefined && 
  !card.isFlipped && 
  !card.isMatched && 
  state.selectedCards.length < 2;

const selectCard = (card: Card) => (state: GameState): GameState => ({
  ...state,
  cards: state.cards.map(c => 
    c.id === card.id ? { ...c, isFlipped: true } : c
  ),
  selectedCards: [...state.selectedCards, card],
});
```

### Anti-Pattern 4: Clever Code
```typescript
// BAD - "Clever" but hard to understand
const f = (c: Card[]) => c.reduce((a, b) => a + (b.isMatched ? 1 : 0), 0) === c.length;

// GOOD - Clear and explicit
const areAllCardsMatched = (cards: Card[]): boolean => {
  const matchedCount = cards.filter(card => card.isMatched).length;
  return matchedCount === cards.length;
};

// Even better - functional and clear
const isMatched = (card: Card): boolean => card.isMatched;
const areAllCardsMatched = (cards: Card[]): boolean => 
  cards.every(isMatched);
```

### Anti-Pattern 5: Mixed Concerns
```typescript
// BAD - Mixes business logic with side effects
function checkMatch(state: GameState): GameState {
  const match = state.selectedCards[0].imageId === state.selectedCards[1].imageId;
  
  if (match) {
    playSound('match'); // Side effect!
    showNotification('Match found!'); // Side effect!
    updateStats(); // Side effect!
  }
  
  return { ...state, /* ... */ };
}

// GOOD - Separates pure logic from effects
// Pure function
const checkMatch = (state: GameState): MatchResult => {
  const [card1, card2] = state.selectedCards;
  const isMatch = card1.imageId === card2.imageId;
  
  return {
    isMatch,
    newState: isMatch ? markAsMatched(state, card1, card2) : state,
  };
};

// Effect handler (in component)
const handleMatchCheck = () => {
  const { isMatch, newState } = checkMatch(this.gameState);
  this.gameState = newState;
  
  if (isMatch) {
    this.audioService.play('match');
    this.showNotification('Match found!');
    this.updateStatsDisplay();
  }
};
```

---

## ✅ CODE REVIEW CHECKLIST

Before submitting any code, verify:

### Functional Programming
- [ ] All functions are pure (same input → same output)
- [ ] No mutations (objects/arrays are immutable)
- [ ] No side effects in business logic
- [ ] Using map/filter/reduce over for loops
- [ ] Function composition where appropriate

### Testing
- [ ] Tests written BEFORE implementation
- [ ] All tests pass (green)
- [ ] Each test is independent
- [ ] Edge cases covered
- [ ] No testing implementation details
- [ ] Descriptive test names

### Web Components
- [ ] Shadow DOM used
- [ ] Lifecycle methods implemented correctly
- [ ] Cleanup in disconnectedCallback
- [ ] Props down, events up pattern
- [ ] No global state

### CSS
- [ ] CSS variables for theming
- [ ] Flexbox/Grid for layouts
- [ ] CSS-only animations
- [ ] Mobile-first responsive
- [ ] Accessibility (focus states, contrast)
- [ ] No inline styles in JavaScript

### Code Quality
- [ ] Functions are small and focused
- [ ] Clear, descriptive names
- [ ] No magic numbers
- [ ] TypeScript types are strict
- [ ] No any types
- [ ] Comments explain "why", not "what"

---

## 🎯 IMPLEMENTATION ORDER

Follow this order for each feature:

1. **Write failing test** (RED)
2. **Write minimal code** to pass test (GREEN)
3. **Refactor** while keeping tests green
4. **Repeat** for next test case
5. **Complete feature** with all edge cases
6. **Code review** using checklist
7. **Commit** with descriptive message
8. **Move to next feature**

---

## 📚 QUICK REFERENCE

### Pure Function Template
```typescript
export const functionName = (
  input: InputType
): OutputType => {
  // No mutations
  // No side effects
  // Deterministic
  
  return result;
};
```

### Test Template
```typescript
describe('Feature Name', () => {
  describe('specific behavior', () => {
    it('should [expected behavior] when [condition]', () => {
      // ARRANGE
      const input = createTestData();
      
      // ACT
      const result = functionToTest(input);
      
      // ASSERT
      expect(result).toEqual(expected);
    });
  });
});
```

### Component Template
```typescript
class MyComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private state: ComponentState;
  
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }
  
  static get observedAttributes() {
    return ['attribute-name'];
  }
  
  connectedCallback() {
    this.render();
    this.attachListeners();
  }
  
  disconnectedCallback() {
    this.removeListeners();
    this.cleanup();
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    this.handleAttributeChange(name, newValue);
  }
  
  private render(): void {
    this.shadow.innerHTML = `
      <style>${this.styles()}</style>
      ${this.template()}
    `;
  }
  
  private template(): string {
    return `<div>Content</div>`;
  }
  
  private styles(): string {
    return `:host { display: block; }`;
  }
}

customElements.define('my-component', MyComponent);
```

---

## 🚀 REMEMBER

1. **Test First, Always**: No code without a failing test first
2. **Small Steps**: One test, one feature at a time
3. **Pure Functions**: No mutations, no side effects
4. **Immutability**: Always return new objects/arrays
5. **Composition**: Build complex behavior from simple functions
6. **Shadow DOM**: Always use for web components
7. **CSS Only**: Animations and transitions in CSS, not JS
8. **Clean Up**: Remove listeners, clear timers
9. **Descriptive**: Names should explain intent
10. **Refactor**: Only when tests are green

**When in doubt: Write a test, make it pass, refactor, repeat.**
