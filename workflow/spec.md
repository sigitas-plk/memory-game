# Memory Card Matching Game – Platform‑Agnostic Functional Specification

## 1. Overview
A browser‑based memory card matching game built as a Progressive Web App (PWA).  
The application is composed of custom web components that manage game state, settings, statistics, and victory handling. All logic is pure, deterministic, and can be re‑implemented in any language or platform (e.g., Zig, Rust, Go) that can run in a browser environment or be compiled to WebAssembly.

## 2. Core Functional Requirements

| ID   | Requirement                     | Description |
|------|--------------------------------|-------------|
| FR‑01 | Game Initialization | On page load the app reads persisted settings (pair count, flip delay) from `localStorage`. If no settings exist, defaults `{ pairCount: 6, flipDelay: 1.0 }` are used. A shuffled deck of `pairCount × 2` cards is created, the board grid is rendered, the move counter is set to 0, and the timer is idle. |
| FR‑02 | Card Interaction | Clicking (or tapping) a face‑down, unmatched card flips it face‑up with a CSS 3‑D animation. While two cards are face‑up, further clicks are ignored until the evaluation finishes. |
| FR‑03 | Match Logic | When two cards are face‑up: <br>• **Match** – if their `imageId` values are equal, both cards become permanently matched (visual dimming) and remain face‑up. <br>• **Mismatch** – if `imageId` differs, both stay face‑up for the configured **flip delay** (seconds) then automatically flip back face‑down. |
| FR‑04 | Game State Management | The system tracks: <br>• `phase` – one of `idle`, `playing`, `checking`, `completed`. <br>• `cards` – list of card objects (`id`, `imageId`, `isFlipped`, `isMatched`, `position`). <br>• `selectedCards` – array of currently face‑up cards (max 2). <br>• `moveCount` – increments after each pair of selections. <br>• `startTime` – timestamp of the first flip (null until first move). <br>• `elapsedTime` – seconds since `startTime`. <br>State changes are emitted via a custom event `state‑updated`. |
| FR‑05 | Victory Detection | When every card’s `isMatched` flag is true, the `phase` changes to `completed` and a `game‑completed` event is dispatched. |
| FR‑06 | Victory Modal | A full‑screen modal overlays the board, showing total moves and formatted elapsed time (`MM:SS`). It contains a **Restart** button that triggers a full game reset while preserving current settings. |
| FR‑07 | Settings Management | Users can modify: <br>• **Pair Count** – integer 2 – 12. <br>• **Flip Delay** – decimal 0.5 – 2.0 seconds. <br>Changes are saved to `localStorage` immediately. Changing **Pair Count** forces a new board; changing **Flip Delay** affects the current game’s mismatch delay. |
| FR‑08 | Responsive Layout | The board calculates the minimal `rows × columns` grid that fits `pairCount × 2` cards while keeping each card ≥ 60 px. The layout adapts to portrait/landscape and scales down gracefully on small viewports. |
| FR‑09 | Progressive Web App | The app provides a `manifest.json` and a Service Worker that caches all static assets, enabling full offline play after the first load. An install prompt appears on supported browsers. |
| FR‑10 | Timer | A per‑second timer starts on the first card flip, increments `elapsedTime`, and updates the `<game‑stats>` display. The timer stops when the game reaches `completed` or when the user navigates away to the Settings view. |
| FR‑11 | Restart Flow | Clicking **Restart** in the victory modal removes the current board component, creates a fresh board, reapplies persisted settings, resets move counter and timer, and switches to the game view. |
| FR‑12 | Settings View Navigation | Switching to Settings pauses the current game, clears any active timer, resets the board, and displays the Settings component. Returning to the game view restores the board using the latest persisted settings. |
| FR‑13 | Accessibility | All interactive elements are keyboard accessible (Tab, Enter/Space), have appropriate ARIA labels, and meet WCAG 2.1 Level AA (contrast ≥ 4.5:1, focus indicators, no meaning conveyed by colour alone). |
| FR‑14 | Error Handling | Asset‑loading failures, `localStorage` errors, Service Worker registration problems, or component exceptions are caught, logged, and shown to the user via a non‑blocking toast or fallback UI. The app never crashes. |

## 3. Abstract Data Model

- **GameSettings** – `{ pairCount: number, flipDelay: number }`
- **Card** – `{ id: string, imageId: number, isFlipped: boolean, isMatched: boolean, position: number }`
- **GameState** – `{ phase: string, cards: Card[], selectedCards: Card[], moveCount: number, startTime: number|null, elapsedTime: number }`
- **GameStats** – `{ moves: number, elapsed: string }` (elapsed formatted as `MM:SS`)
- **GridDimensions** – `{ rows: number, columns: number }`

All data are plain JavaScript objects; persistence uses the browser’s `localStorage`.

## 4. Business Logic Details

1. **Grid Calculation** – Given `pairCount`, compute the smallest `rows × columns` that holds `pairCount × 2` cards while keeping each cell ≥ 60 px. Prefer more columns than rows for landscape orientation.  
2. **Card Shuffling** – Create ordered pairs of cards, assign each a unique UUID, then randomise the order with the Fisher‑Yates algorithm. After shuffling, set each card’s `position` to its index in the array.  
3. **Time Formatting** – Convert a non‑negative integer number of seconds to a zero‑padded `MM:SS` string (`0` → `00:00`). Values < 0 are treated as 0.  
4. **Settings Service** – Load settings from `localStorage`; on error or missing data, fall back to defaults. Validation clamps `pairCount` to `[2,12]` and `flipDelay` to `[0.5,2.0]`. Save writes the validated object back, wrapped in `try/catch`.  
5. **Game State Service** – Pure functions:  
   - `createInitialState(settings)`: builds a fresh `GameState` with a shuffled deck.  
   - `canSelectCard(state, card)`: returns `false` if the card is already flipped/matched, if two cards are already selected, or if `phase` is `checking`/`completed`.  
   - `selectCard(state, card)`: flips the card, starts the timer on first selection, moves to `checking` when two cards are selected, increments `moveCount`.  
   - `checkForMatch(state)`: if selected cards match, mark them as `isMatched`; otherwise schedule a flip‑back after `flipDelay`. In both cases increment `moveCount` and clear `selectedCards`. If all cards are matched, set `phase` to `completed`.  
   - `resetMismatchedCards(state)`: flips back mismatched cards after the delay.  
   - `updateElapsedTime(state)`: calculates `(Date.now() - startTime) / 1000` and updates `elapsedTime` (no update after `completed`).  
6. **Timer Management** – Implemented in the root component (`game-app`): on the first flip, start a `setInterval` (1 s) that calls `updateElapsedTime` and updates the `<game-stats>` attributes. Clear the interval when the game ends or when navigating to Settings.

## 5. Component Contracts (Technology‑Agnostic)

| Component | Public API / Attributes | Events Emitted | Core Responsibilities |
|-----------|------------------------|----------------|-----------------------|
| **game-app** (root) | Internal `currentView` (`game`|`settings`). Methods: `startTimer()`, `stopTimer()`. | `state-updated`, `game-completed`, `settings-changed` (bubbled from children). | Orchestrates navigation, starts/stops the global timer, passes persisted settings to children, handles restart flow. |
| **game-board** | Attributes: `pair-count`, `flip-delay`. Methods: `applySettings(settings)`, `resetGame()`, `incrementTime()`, `getState()`. | `state-updated`, `game-completed`, `card-selected` (from children). | Renders the card grid, holds its own `GameState` via the Game State Service, processes card clicks, emits state changes. |
| **game-card** | Attributes: `card-id`, `image-id`, `flipped`, `matched`. | `card-selected` (detail `{ cardId }`). | Displays front/back images, runs flip animation, disables interaction when `matched` or `flipped`. |
| **game-stats** | Attributes: `move-count`, `elapsed-time`. | – | Shows move counter and formatted timer; updates when attributes change. |
| **game-settings** | No external attributes (reads from Settings Service). | `settings-changed` (detail `{ settings, newGame }`). | UI for adjusting `pairCount` and `flipDelay`; validates input, persists changes, notifies parent. |
| **victory-modal** | Attributes: `visible`, `moves`, `elapsed-time`. | `restart`. | Overlays the board on win, displays final stats, blocks interaction, signals restart request. |
| **service-worker** | (registered automatically) | – | Caches all static assets for offline operation, serves from cache when offline, updates cache on new deployments. |

All components use **Shadow DOM** (`mode: "open"`), dispatch **CustomEvent** objects, and react to attribute changes via `attributeChangedCallback` (or equivalent in the target platform).

## 6. Web‑Tech Section

### 6.1 Progressive Web App (PWA)

- **Manifest** (`manifest.json`) must declare `name`, `short_name`, `icons` (192 × 192 and 512 × 512), `start_url`, `display: "standalone"`, and `background_color`/`theme_color`.  
- **Service Worker** (`service-worker.js`) must:  
  1. Cache **all** files listed in the build output (`index.html`, CSS, JS, images, audio if any) during the `install` event.  
  2. Serve cached assets on `fetch` when the network is unavailable.  
  3. Perform a cache‑update strategy (e.g., stale‑while‑revalidate) on subsequent loads.  
  4. Listen for `activate` to clean old caches.  
- **Install Prompt** – Listen for the `beforeinstallprompt` event and expose a UI button that calls `prompt()`; also handle the `appinstalled` event for analytics.

### 6.2 Scripting Requirements (TypeScript)

- **Language**: All source files are written in **TypeScript** targeting **ES2020**.  
- **Compiler Configuration** (`tsconfig.json`):  
  - `"strict": true` (enables strict null checks, `noImplicitAny`, `strictFunctionTypes`, etc.).  
  - `"target": "ES2020"` and `"module": "ESNext"` to preserve native ES module syntax.  
  - `"sourceMap": true` for debugging.  
  - `"outDir": "dist"` and `"rootDir": "src"` to keep a clean output structure.  
- **Bundler**: The project uses **Vite** (or an equivalent ES‑module‑aware bundler). Vite reads the `tsconfig` paths, performs TypeScript transpilation, and bundles the app into a single `index.html` and a compiled `main.js` (with source maps).  
- **Module System**: All code uses standard **ES modules** (`import`/`export`). No CommonJS or AMD modules are used.  
- **No UI Frameworks**: The implementation relies exclusively on native **Web Components** and the **Shadow DOM**; no React, Vue, Svelte, or other frameworks are introduced.  
- **DOM Manipulation**: Must be performed with native Web APIs (`document.createElement`, `element.setAttribute`, `element.appendChild`, `element.remove`, etc.). Direct DOM string interpolation is allowed only inside component templates.  
- **Styling**: Component styles are plain **CSS** (no preprocessors). Styles are scoped to each component via the Shadow DOM. Global CSS resets are applied in a top‑level stylesheet (`reset.css`).  
- **Asynchronous APIs**: Use only standard browser timers (`setTimeout`, `setInterval`) and the Service Worker API. All timers are cleared (`clearTimeout`, `clearInterval`) when components are detached to avoid leaks.  
- **Build Scripts**:  
  - `npm run dev` (or `bun run dev`) launches Vite’s dev server with hot‑module replacement for rapid iteration.  
  - `npm run build` (or `bun run build`) produces an optimized, minified bundle with gzip compression, suitable for deployment as a PWA.  
- **Linting & Formatting**: The repository includes an **ESLint** configuration enforcing TypeScript best practices and a **Prettier** config for consistent formatting. These are run as part of the CI pipeline.  
- **Testing**: Tests are written in **Vitest** using TypeScript, ensuring type safety throughout the test suite.  

### 6.3 Asset Management

- **Images** – Card backs and fronts (`card-back.png`, `card-front-1.png … card-front-12.png`) are stored under `public/assets/images/`. They are referenced via relative URLs in the component styles.  
- **Cache Strategy** – Images are cached by the Service Worker; the `Cache-Control` header should request a long max‑age (e.g., 30 days) because assets are immutable.  
- **Fallback** – If an image fails to load, the component’s `onerror` handler replaces it with a minimal SVG placeholder and logs a warning.

### 6.4 Storage

- Settings are stored under a single key (e.g., `"memory-game-settings"`). All reads/writes must be wrapped in `try/catch`. On failure, the app falls back to defaults and shows a toast: “Settings could not be saved – using defaults.”  
- No other persistent data (e.g., scores) is required.

## 7. Error Handling Strategy

1. **Asset Loading** – `onerror` on `<img>` replaces the source with a placeholder SVG and logs a warning.  
2. **LocalStorage** – All accesses are protected; on exception, defaults are used and a non‑intrusive toast notifies the user.  
3. **Service Worker** – Registration failures are caught; the app continues without offline capability.  
4. **Component Lifecycle** – `connectedCallback`/`disconnectedCallback` are wrapped in `try/catch`. On error, the component displays a minimal error message and emits `component-error`.  
5. **Global Uncaught Errors** – A `window.onerror` listener logs the error and shows a generic toast, ensuring UI remains usable.

## 8. Testing Scope

- **Unit Tests** (Vitest) for every pure function: grid calculation, card shuffling, time formatting, settings validation, each Game State Service function.  
- **Component Tests** using a DOM testing library: verify attribute ↔︎ DOM reflection, event dispatch (`card-selected`, `state-updated`, `settings-changed`), timer start/stop, victory modal visibility, and restart flow.  
- **Integration Test** simulating a full game: start, perform a series of matching/mismatching moves, win, restart, change settings mid‑game, and assert correct move count, timer, and board state.  
- **Mocks** for `localStorage`, `setInterval`/`clearInterval`, and any network fetches used by the Service Worker (if tested).  
- Aim for **≥ 80 %** line coverage; critical paths (match logic, timer, settings persistence) must be fully covered.

## 9. Implementation Checklist (High‑Level)

- [ ] Settings Service (load, save, validation).  
- [ ] Game State Service (all pure functions).  
- [ ] Grid Calculator & Card Shuffler utilities.  
- [ ] Custom elements: `game-app`, `game-board`, `game-card`, `game-stats`, `game-settings`, `victory-modal`.  
- [ ] Event wiring according to the Component Contracts table.  
- [ ] Timer logic in `game-app`.  
- [ ] PWA assets: `manifest.json`, `service-worker.js`.  
- [ ] Full keyboard accessibility and ARIA labeling.  
- [ ] Comprehensive error handling as described.  
- [ ] Unit, component, and integration tests with ≥ 80 % coverage.  
- [ ] Performance audit (Lighthouse) – first load < 1 s on 3G, interactive < 100 ms.  
- [ ] Accessibility audit – WCAG 2.1 AA compliance.

## 10. Non‑Functional Requirements

- **Performance** – Initial load < 1 s on a typical 3G connection; UI interactions respond within 100 ms.  
- **Compatibility** – Works on the latest stable releases of Chrome, Firefox, Safari, and Edge.  
- **Security** – No external script dependencies; Content‑Security‑Policy restricts sources to `self`.  
- **Accessibility** – WCAG 2.1 Level AA (contrast ≥ 4.5:1, focus indicators, proper ARIA attributes).

---  

*This specification deliberately avoids language‑specific syntax and focuses on deterministic behavior, data contracts, and interaction patterns so that the game can be rebuilt in any language or platform (e.g., Zig, Rust, Go compiled to WebAssembly) while preserving identical functionality.*