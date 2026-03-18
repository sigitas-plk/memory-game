# Card Matching Game - Development Roadmap

## Project Overview
A minimal card matching game built with web components, TypeScript, and no external dependencies. Players flip cards to find matching pairs on a square grid with smooth CSS animations.

## Tech Stack
- **Package Manager:** Bun
- **Build Tool:** Vite
- **Testing:** Vitest (unit tests with TDD approach)
- **Languages:** TypeScript for development, compiles to JavaScript
- **Architecture:** Web Components
- **Styling:** CSS with Flexbox (square grid, animations only)
- **Future:** Progressive Web App (PWA)

## Core Game Mechanics
- **Objective:** Match all pairs to win
- **Grid:** 2-12 pairs (4-24 cards) in square grid layout
- **Gameplay:**
  - Click to flip cards face-up
  - Match: Cards stay face-up but dimmed, removed from play
  - Mismatch: Cards flip back after configurable delay (0.5-2s)
  - No time limit
- **Tracking:** Move counter and elapsed time
- **Victory:** Overlay showing stats (time, moves) with "Play Again" button

## Assets Structure
```
/src
  /assets
    /images
      card-back.png
      card-front-1.png
      card-front-2.png
      ... (up to 12 unique images)
    /sounds
      flip.mp3
      match.mp3
      mismatch.mp3
      complete.mp3
```

## Game Screens
1. **Game Screen** (Landing page)
   - Card grid
   - Stats display (moves, time)
   - Settings button
   
2. **Settings Screen**
   - Number of pairs (2-12)
   - Flip-back delay (0.5-2s slider)
   - Sound effects (on/off toggle)
   - Back to game button
   - Settings persist between sessions

3. **Victory Overlay**
   - Final stats display
   - Play Again button

## Web Components Architecture

### Proposed Components
1. `<game-app>` - Root component, manages routing
2. `<game-board>` - Main game grid and logic
3. `<game-card>` - Individual card with flip animation
4. `<game-stats>` - Move counter and timer display
5. `<game-settings>` - Settings form
6. `<victory-modal>` - Win screen overlay
7. `<sound-manager>` - Audio playback controller

---

## Phase 1: Foundation & Setup
**Goal:** Set up project structure and core tooling

### Tasks
- [ ] Initialize Bun project
- [ ] Configure Vite for TypeScript + Web Components
- [ ] Set up Vitest for unit testing
- [ ] Create project folder structure (`/src`, `/assets`, `/components`)
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Create base HTML template (`index.html`)
- [ ] Set up CSS reset and base styles
- [ ] Add placeholder assets (images and sounds)

### Testing Focus
- Verify build process works
- Ensure dev server runs
- Confirm Vitest configuration

---

## Phase 2: Core Game Components (TDD)
**Goal:** Build foundational web components with tests first

### 2.1 - Game Card Component
- [ ] Write tests for `<game-card>` states (face-down, face-up, matched)
- [ ] Implement card component with Shadow DOM
- [ ] Add flip animation (CSS only)
- [ ] Handle click events
- [ ] Add matched/dimmed state styling
- [ ] Test card interaction logic

### 2.2 - Game Board Component
- [ ] Write tests for board initialization with N pairs
- [ ] Implement `<game-board>` component
- [ ] Create square grid layout with Flexbox (responsive)
- [ ] Shuffle card positions on initialization
- [ ] Implement game state management (cards array, selected cards)
- [ ] Add match/mismatch logic with delay
- [ ] Test win condition detection

### 2.3 - Stats Component
- [ ] Write tests for move counter increment
- [ ] Write tests for timer (start, pause, display)
- [ ] Implement `<game-stats>` component
- [ ] Connect to game board events
- [ ] Format time display (MM:SS)

---

## Phase 3: Settings & Persistence
**Goal:** Add configuration and state persistence

### 3.1 - Settings Component
- [ ] Write tests for settings form validation
- [ ] Implement `<game-settings>` component
- [ ] Create UI for pair count selector (2-12)
- [ ] Create delay slider (0.5-2s)
- [ ] Create sound toggle switch
- [ ] Test settings apply to game

### 3.2 - LocalStorage Persistence
- [ ] Write tests for save/load settings
- [ ] Create settings service/utility
- [ ] Save settings on change
- [ ] Load settings on app initialization
- [ ] Handle missing/corrupt data gracefully

---

## Phase 4: Sound & Polish
**Goal:** Add audio feedback and UI refinements

### 4.1 - Sound Manager
- [ ] Write tests for sound playback
- [ ] Implement `<sound-manager>` component
- [ ] Preload audio files
- [ ] Connect to game events (flip, match, mismatch, complete)
- [ ] Respect sound toggle setting
- [ ] Handle audio loading errors

### 4.2 - Victory Modal
- [ ] Write tests for modal display logic
- [ ] Implement `<victory-modal>` component
- [ ] Display final stats
- [ ] Add "Play Again" functionality (reset game)
- [ ] Add smooth entrance/exit animations

### 4.3 - UI Polish
- [ ] Refine card flip animations
- [ ] Add hover states for interactive elements
- [ ] Ensure accessibility (keyboard navigation, ARIA labels)
- [ ] Test responsive layout on mobile devices
- [ ] Add loading states for assets

---

## Phase 5: PWA Implementation
**Goal:** Make game work offline as installable PWA

### 5.1 - PWA Basics
- [ ] Create `manifest.json` (name, icons, theme colors)
- [ ] Add app icons (192x192, 512x512)
- [ ] Add theme color and background color
- [ ] Test manifest in browser DevTools

### 5.2 - Service Worker
- [ ] Write service worker for asset caching
- [ ] Cache all game assets (images, sounds, JS, CSS)
- [ ] Implement offline-first strategy
- [ ] Test offline functionality
- [ ] Handle service worker updates

### 5.3 - Install Prompt
- [ ] Detect PWA installation capability
- [ ] Add install button to settings screen
- [ ] Handle beforeinstallprompt event
- [ ] Test installation flow on mobile and desktop

### 5.4 - PWA Settings Persistence
- [ ] Migrate localStorage to work with PWA context
- [ ] Test settings persist after app installation
- [ ] Verify offline settings modification

---

## Phase 6: Testing & Optimization
**Goal:** Comprehensive testing and performance tuning

### Tasks
- [ ] Write integration tests for full game flow
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS Safari, Chrome Android)
- [ ] Optimize asset sizes (compress PNGs, audio files)
- [ ] Audit bundle size with Vite
- [ ] Test PWA with Lighthouse
- [ ] Fix accessibility issues
- [ ] Add error boundaries for component failures

---

## Development Tips

### TDD Workflow
1. Write failing test for feature
2. Implement minimum code to pass
3. Refactor and improve
4. Repeat

### Web Components Best Practices
- Use Shadow DOM for style encapsulation
- Keep components small and focused
- Use custom events for parent-child communication
- Avoid global state where possible

### Mobile Considerations
- Touch targets minimum 44x44px
- Test tap delays and double-tap zoom
- Ensure cards are easily tappable
- Test in portrait and landscape

### PWA Checklist
- Serve over HTTPS (required for PWA)
- Test offline mode thoroughly
- Verify service worker updates
- Test installation on actual devices

---

## Future Enhancements (Post-MVP)
- Multiple card themes/decks
- Leaderboard with best times
- Difficulty presets (Easy/Medium/Hard)
- Animations for matched pairs
- Share results functionality
- Multiple language support

---

## Resources
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Next Step:** Start with Phase 1 - set up your project foundation and get comfortable with the tooling before diving into TDD with web components!