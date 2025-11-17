# Implementation Plan: Mobile-First Texas Hold'em Poker Game

**Project**: Standalone Poker Game (Mobile-First)
**Created**: 2025-11-18
**Updated**: 2025-11-18 (Mobile-First Rewrite)
**Status**: Active
**Spec Reference**: [spec.md](./spec.md)

---

## Executive Summary

Build a production-quality, single-player Texas Hold'em poker game optimized for mobile devices (smartphones). Game runs entirely in browser as Progressive Web App (PWA) with full offline support. Players experience authentic poker mechanics through touch-optimized interface with smooth animations, intelligent bot opponents, and support for both portrait and landscape orientations.

**Technical Approach**: React 18 + TypeScript for mobile-first UI, pure TypeScript game engine for poker logic, bot AI with three difficulty levels and persistent personalities, state management with Zustand, PWA with service worker for offline play, comprehensive test coverage with Jest and Playwright, Vite for optimized mobile bundle.

**Timeline**: 8-10 weeks for complete implementation (solo developer, 25-35 hours/week)

---

## Technical Context

### Technology Stack

**Frontend Framework**: React 18.2+
- **Why**: Component-based architecture perfect for mobile UI (bottom sheets, gestures, orientation changes)
- **Hooks**: useState, useEffect, useReducer for component state
- **Performance**: React.memo, useMemo, useCallback for mobile optimization
- **Styling**: Tailwind CSS mobile-first with custom touch targets
- **Touch**: React Touch Events (onTouchStart, onTouchEnd, onTouchMove)

**Language**: TypeScript 5.x (Strict Mode)
- **Why**: Type safety critical for poker logic correctness and mobile event handling
- **Strict**: No `any` types, complete type coverage
- **Interfaces**: Strong typing for game state, actions, bot decisions, touch events
- **Generics**: Reusable utility functions with type safety

**State Management**: Zustand 4.x
- **Why**: Lighter than Redux, perfect for client-side mobile state
- **Stores**: Separate stores for game state, UI state (orientation, bottom sheets), settings
- **Immer**: Built-in support for immutable state updates
- **DevTools**: Redux DevTools integration for debugging
- **Persistence**: Built-in persist middleware for localStorage

**Build Tool**: Vite 5.x
- **Why**: Fast HMR (<100ms), optimized mobile bundles, code-splitting
- **Features**: ES modules, aggressive tree-shaking, minification, image optimization
- **Plugins**: TypeScript, React, PWA (vite-plugin-pwa), compression
- **Bundle Target**: <500KB initial (gzipped), code-split for mobile bandwidth

**PWA Support**: Vite Plugin PWA (vite-plugin-pwa)
- **Why**: Transform web app into installable PWA with offline support
- **Features**: Service worker generation, Web App Manifest, offline caching, update prompts
- **Strategy**: Precache all static assets (JS, CSS, images), runtime cache for dynamic content
- **Update Flow**: Background update, prompt user, apply on confirm

**Testing Framework**: Jest 29.x + React Testing Library + Playwright
- **Unit Tests**: Game logic (hand evaluation, pot calculation, bot AI)
- **Component Tests**: UI components (buttons, gestures, bottom sheets)
- **Integration Tests**: Full game flows (complete hands, multiple scenarios)
- **E2E Tests**: Playwright for mobile device emulation, touch testing, orientation
- **Coverage**: Target 80% for game logic, 60% for UI

**Hand Evaluation Library**: [PokerHandEvaluator](https://github.com/HenryRLee/PokerHandEvaluator)
- **Why**: Extremely fast C++ evaluator (perfect for mobile performance), battle-tested
- **Features**: 7-card evaluation, 5-card evaluation, optimized lookup tables
- **Integration**: Use WASM bindings if available, otherwise TypeScript port of algorithm
- **Fallback**: Pure TypeScript implementation based on algorithm (for wider browser support)

**Icons**: Lucide React
- **Why**: Professional, tree-shakeable, lightweight, 1000+ icons
- **Usage**: Card suits, actions (fold, raise, all-in), UI (settings, stats, gestures)
- **Size**: Only used icons bundled (tree-shaking), <20KB total for needed icons
- **No Emojis**: Professional appearance, consistent design

**Localization**: react-i18next
- **Why**: Industry standard, supports plural forms, interpolation, mobile context
- **Setup**: English default, infrastructure ready for Vietnamese, Thai, Chinese
- **Keys**: No hardcoded strings, all text via t('key') function
- **Loading**: Lazy load language files (only load active language)

**Gesture Recognition**: Custom implementation (React Touch Events + Hammer.js alternative)
- **Why**: Native touch events for swipe, tap, long-press, pinch-zoom
- **Patterns**: Swipe-left (fold), swipe-up (raise), double-tap (hand strength), long-press (menu)
- **Cancellation**: Reverse direction to cancel, threshold-based (>50px, >200ms)
- **Conflicts**: Prevent gesture conflicts with native browser scrolling

**Haptic Feedback**: Vibration API
- **Why**: Enhance mobile UX with tactile feedback for actions
- **Patterns**: Light (button tap), medium (card deal), heavy (win pot)
- **Support**: iOS 13+, Android Chrome 32+, feature detection with graceful fallback
- **Control**: Toggle in settings, respect device Silent/Do Not Disturb mode

---

## Project Structure

```
mobile-poker-game/
├── src/
│   ├── presentation/                     # React UI layer (mobile-first)
│   │   ├── components/
│   │   │   ├── game/                     # Game-specific components
│   │   │   │   ├── PokerTable.tsx        # Responsive table (portrait/landscape)
│   │   │   │   ├── PlayerSeat.tsx        # Mobile-optimized player position
│   │   │   │   ├── CommunityCards.tsx    # Touch-friendly card display
│   │   │   │   ├── PotDisplay.tsx        # Mobile pot visualization
│   │   │   │   ├── ActionButtons.tsx     # Large touch targets (48px+)
│   │   │   │   ├── RaiseSlider.tsx       # Touch-optimized slider (60px thumb)
│   │   │   │   ├── ActionTimer.tsx       # Mobile countdown (20s default)
│   │   │   │   ├── WinnerAnnouncement.tsx # Mobile celebration overlay
│   │   │   │   ├── ActionLog.tsx         # Bottom sheet with action history
│   │   │   │   ├── DealerButton.tsx      # Dealer indicator
│   │   │   │   └── HandStrengthBadge.tsx # Double-tap hand indicator
│   │   │   ├── cards/
│   │   │   │   ├── PlayingCard.tsx       # Mobile card (50-60px base)
│   │   │   │   ├── CardBack.tsx          # Card back designs (5 options)
│   │   │   │   └── CardFront.tsx         # Card with suit patterns (Deuteranopia)
│   │   │   ├── mobile/                   # Mobile-specific components
│   │   │   │   ├── BottomSheet.tsx       # Mobile-native bottom sheet
│   │   │   │   ├── GestureArea.tsx       # Touch gesture recognizer
│   │   │   │   ├── PortraitLayout.tsx    # Portrait game layout
│   │   │   │   ├── LandscapeLayout.tsx   # Landscape game layout
│   │   │   │   ├── TouchFeedback.tsx     # Visual + haptic feedback wrapper
│   │   │   │   ├── SafeArea.tsx          # Handle notch/safe areas
│   │   │   │   └── OrientationHandler.tsx # Orientation change controller
│   │   │   ├── ui/                       # Reusable UI primitives
│   │   │   │   ├── Button.tsx            # Touch-optimized button (48px min)
│   │   │   │   ├── IconButton.tsx        # Icon-only button
│   │   │   │   ├── Slider.tsx            # Touch slider with large thumb
│   │   │   │   ├── Tooltip.tsx           # Mobile tooltip
│   │   │   │   ├── Toast.tsx             # Mobile toast notifications
│   │   │   │   ├── SegmentedControl.tsx  # iOS-style segmented control
│   │   │   │   ├── Stepper.tsx           # Number stepper for settings
│   │   │   │   └── Toggle.tsx            # Touch-friendly toggle switch
│   │   │   └── layout/
│   │   │       ├── MainMenu.tsx          # Mobile start screen
│   │   │       ├── SettingsSheet.tsx     # Settings as bottom sheet
│   │   │       ├── StatsSheet.tsx        # Statistics bottom sheet
│   │   │       ├── GameOverOverlay.tsx   # Full-screen game over
│   │   │       └── InstallPrompt.tsx     # PWA install prompt
│   │   ├── pages/
│   │   │   ├── HomePage.tsx              # Main menu (Quick Play, Settings)
│   │   │   ├── GamePage.tsx              # Active game (portrait/landscape aware)
│   │   │   └── OfflinePage.tsx           # Offline indicator page
│   │   ├── hooks/
│   │   │   ├── useGameState.ts           # Access game state from store
│   │   │   ├── useGameActions.ts         # Dispatch game actions
│   │   │   ├── useSettings.ts            # Access/modify settings
│   │   │   ├── useOrientation.ts         # Detect orientation changes
│   │   │   ├── useGesture.ts             # Touch gesture recognition
│   │   │   ├── useHaptic.ts              # Haptic feedback control
│   │   │   ├── useSafeArea.ts            # Safe area insets (notch)
│   │   │   ├── useOnline.ts              # Online/offline status
│   │   │   ├── useBatteryOptimization.ts # Battery saver detection
│   │   │   └── usePWA.ts                 # PWA install prompt control
│   │   ├── gestures/
│   │   │   ├── SwipeRecognizer.ts        # Swipe gesture logic
│   │   │   ├── TapRecognizer.ts          # Single/double tap logic
│   │   │   ├── LongPressRecognizer.ts    # Long-press logic
│   │   │   ├── PinchRecognizer.ts        # Pinch-zoom logic
│   │   │   └── GestureTypes.ts           # Gesture type definitions
│   │   └── styles/
│   │       ├── global.css                # Global mobile-first styles
│   │       ├── table.css                 # Poker table (portrait/landscape)
│   │       ├── cards.css                 # Card designs and animations
│   │       ├── animations.css            # Mobile-optimized animations
│   │       ├── touch.css                 # Touch feedback styles
│   │       └── safe-area.css             # Safe area handling (notch)
│   │
│   ├── game-logic/                       # Pure TypeScript game engine (device-agnostic)
│   │   ├── engine/
│   │   │   ├── GameEngine.ts             # Orchestrates game loop
│   │   │   ├── GameStateMachine.ts       # Phase transitions
│   │   │   ├── ActionProcessor.ts        # Validates and applies actions
│   │   │   ├── BettingRoundManager.ts    # Detects round completion
│   │   │   └── HandCompletionHandler.ts  # End-of-hand logic
│   │   ├── rules/
│   │   │   ├── BettingRules.ts           # Min/max bet validation
│   │   │   ├── BlindRules.ts             # SB/BB posting, heads-up rules
│   │   │   ├── PositionRules.ts          # Dealer, SB, BB calculations
│   │   │   └── ShowdownRules.ts          # Card reveal order, mucking
│   │   ├── evaluation/
│   │   │   ├── HandEvaluator.ts          # Wrapper for PokerHandEvaluator
│   │   │   ├── PokerHandEvaluatorWASM.ts # WASM bindings (if available)
│   │   │   ├── PokerHandEvaluatorTS.ts   # TypeScript port (fallback)
│   │   │   ├── HandComparator.ts         # Compare two hands
│   │   │   └── BestHandFinder.ts         # Find best 5 from 7 cards
│   │   ├── pot/
│   │   │   ├── PotCalculator.ts          # Main pot and side pots
│   │   │   ├── PotDistributor.ts         # Award pots to winners
│   │   │   └── OddChipHandler.ts         # Distribute odd chips (last aggressor position)
│   │   ├── deck/
│   │   │   ├── Deck.ts                   # 52-card deck, shuffle, deal, burn
│   │   │   ├── Card.ts                   # Card model (rank, suit)
│   │   │   └── CardShuffler.ts           # Fisher-Yates shuffle
│   │   ├── models/
│   │   │   ├── GameState.ts              # Complete game state
│   │   │   ├── Player.ts                 # Player model
│   │   │   ├── Action.ts                 # Player action
│   │   │   ├── Pot.ts                    # Pot model
│   │   │   └── Hand.ts                   # Hand result
│   │   └── validators/
│   │       ├── ActionValidator.ts        # Validate actions
│   │       ├── ChipValidator.ts          # Validate chip amounts
│   │       └── StateValidator.ts         # Validate state consistency
│   │
│   ├── bot-ai/                           # Bot decision-making (device-agnostic)
│   │   ├── strategies/
│   │   │   ├── EasyStrategy.ts           # Simple random decisions
│   │   │   ├── MediumStrategy.ts         # Basic poker strategy
│   │   │   ├── HardStrategy.ts           # Advanced strategy
│   │   │   └── StrategyInterface.ts      # Common interface
│   │   ├── personality/
│   │   │   ├── PersonalityTraits.ts      # Tight/loose, aggressive/passive
│   │   │   ├── PersonalityGenerator.ts   # Assign random personalities
│   │   │   ├── PersonalityPersistence.ts # Save bot personalities to localStorage
│   │   │   └── BehaviorModifier.ts       # Adjust strategy by personality
│   │   ├── decision/
│   │   │   ├── ActionSelector.ts         # Choose action
│   │   │   ├── BetSizer.ts               # Determine bet amount
│   │   │   ├── BluffDetector.ts          # Decide when to bluff
│   │   │   └── ThinkingTimer.ts          # Realistic delay
│   │   ├── analysis/
│   │   │   ├── HandStrengthCalculator.ts # Evaluate hand strength (0-1)
│   │   │   ├── PotOddsCalculator.ts      # Calculate pot odds
│   │   │   ├── OpponentModeler.ts        # Track opponent patterns
│   │   │   └── BoardAnalyzer.ts          # Analyze community cards
│   │   └── BotOrchestrator.ts            # Main bot controller
│   │
│   ├── state-management/                 # Zustand stores
│   │   ├── gameStore.ts                  # Game state (cards, pot, players)
│   │   ├── settingsStore.ts              # User settings (persist to localStorage)
│   │   ├── uiStore.ts                    # UI state (orientation, bottom sheets)
│   │   └── statsStore.ts                 # Session statistics
│   │
│   ├── pwa/                              # PWA-specific code
│   │   ├── service-worker.ts             # Service worker entry point
│   │   ├── sw-config.ts                  # SW configuration
│   │   ├── cache-strategy.ts             # Caching strategies
│   │   ├── update-manager.ts             # Update detection and prompts
│   │   └── install-prompt.ts             # Install prompt logic
│   │
│   ├── utils/                            # Shared utilities
│   │   ├── formatters.ts                 # Format numbers, chips, %
│   │   ├── constants.ts                  # Game constants
│   │   ├── logger.ts                     # Console logging wrapper
│   │   ├── storage.ts                    # localStorage wrapper
│   │   ├── device.ts                     # Device detection utilities
│   │   ├── vibration.ts                  # Haptic feedback wrapper
│   │   └── performance.ts                # Performance monitoring
│   │
│   ├── localization/                     # i18n resources
│   │   ├── i18n.ts                       # i18next configuration
│   │   └── en/                           # English translations
│   │       ├── game.json                 # Game-related text
│   │       ├── ui.json                   # UI labels and buttons
│   │       └── errors.json               # Error messages
│   │
│   ├── assets/                           # Static assets (optimized for mobile)
│   │   ├── images/
│   │   │   ├── cards/                    # Card images (WebP, <10KB each)
│   │   │   ├── avatars/                  # Bot avatars (WebP, <5KB each)
│   │   │   ├── chips/                    # Chip graphics (WebP, <5KB each)
│   │   │   ├── table/                    # Table textures (WebP, <20KB)
│   │   │   └── icons/                    # App icons (various sizes for PWA)
│   │   └── sounds/                       # Sound effects (MP3/AAC, <50KB each)
│   │       ├── card-deal.mp3
│   │       ├── chip-slide.mp3
│   │       ├── win-celebration.mp3
│   │       ├── timer-tick.mp3
│   │       ├── button-tap.mp3
│   │       └── table-tap.mp3
│   │
│   ├── App.tsx                           # Root component
│   ├── main.tsx                          # Entry point
│   └── vite-env.d.ts                     # Vite type definitions
│
├── public/                               # Public assets
│   ├── manifest.json                     # Web App Manifest
│   ├── robots.txt                        # SEO
│   ├── icons/                            # PWA icons (multiple sizes)
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── splash/                           # Splash screens (iOS)
│       ├── splash-640x1136.png           # iPhone SE
│       ├── splash-750x1334.png           # iPhone 8
│       ├── splash-1242x2208.png          # iPhone 8 Plus
│       └── splash-1125x2436.png          # iPhone X/11/12
│
├── tests/                                # Test files
│   ├── unit/
│   │   ├── game-logic/                   # Game engine tests
│   │   │   ├── HandEvaluator.test.ts     # Hand ranking tests (200+)
│   │   │   ├── PotCalculator.test.ts     # Side pot tests (50+)
│   │   │   ├── BettingRules.test.ts      # Min raise, all-in validation
│   │   │   └── GameStateMachine.test.ts  # Phase transitions
│   │   ├── bot-ai/                       # Bot AI tests
│   │   │   ├── EasyStrategy.test.ts
│   │   │   ├── MediumStrategy.test.ts
│   │   │   └── HardStrategy.test.ts
│   │   └── gestures/                     # Gesture recognition tests
│   │       ├── SwipeRecognizer.test.ts
│   │       ├── TapRecognizer.test.ts
│   │       └── LongPressRecognizer.test.ts
│   ├── integration/
│   │   ├── CompleteHand.test.ts          # Full hand flow
│   │   ├── MultiplayerAllIn.test.ts      # 3+ player all-in
│   │   ├── HeadsUpRules.test.ts          # 2-player special rules
│   │   └── OrientationChange.test.ts     # Portrait↔landscape
│   ├── e2e/                              # Playwright E2E tests
│   │   ├── mobile-gameplay.spec.ts       # Touch interactions
│   │   ├── gestures.spec.ts              # Swipe, tap, long-press
│   │   ├── orientation.spec.ts           # Rotation testing
│   │   ├── offline.spec.ts               # Offline functionality
│   │   └── pwa-install.spec.ts           # PWA installation
│   └── components/
│       ├── PokerTable.test.tsx           # Table rendering
│       ├── ActionButtons.test.tsx        # Button interactions
│       ├── RaiseSlider.test.tsx          # Slider validation
│       └── BottomSheet.test.tsx          # Bottom sheet behavior
│
├── docs/                                 # Documentation
│   ├── ARCHITECTURE.md                   # Technical architecture
│   ├── GAME_RULES.md                     # Poker rules reference
│   ├── BOT_AI.md                         # Bot strategy documentation
│   ├── MOBILE_UX.md                      # Mobile UX patterns
│   └── DEVELOPMENT.md                    # Development setup guide
│
├── .github/                              # GitHub configuration
│   └── workflows/
│       ├── test.yml                      # Run tests on push
│       ├── lighthouse.yml                # Lighthouse CI for performance
│       └── deploy.yml                    # Deploy to hosting
│
├── package.json                          # NPM dependencies and scripts
├── tsconfig.json                         # TypeScript configuration (strict)
├── vite.config.ts                        # Vite build configuration
├── tailwind.config.js                    # Tailwind CSS (mobile-first)
├── postcss.config.js                     # PostCSS plugins
├── jest.config.js                        # Jest test configuration
├── playwright.config.ts                  # Playwright E2E configuration
├── .eslintrc.js                          # ESLint rules
├── .prettierrc                           # Prettier formatting
├── README.md                             # Project overview and setup
└── CLAUDE.md                             # Instructions for Claude Code
```

**Structure Rationale**:
- **Mobile-First**: UI components optimized for touch, portrait/landscape layouts, bottom sheets
- **Separation**: UI (presentation), game logic (pure TypeScript), bot AI (decision-making)
- **PWA Support**: Service worker, manifest, offline caching, update management
- **Gesture Support**: Dedicated gesture recognizers for swipe, tap, long-press, pinch
- **Testability**: Pure functions in game logic, E2E tests for mobile gestures
- **Type Safety**: TypeScript strict mode across all modules

---

## Phase 0: Technology Decisions & Research

### 0.1 Hand Evaluation Library Integration

**Decision**: Use **[PokerHandEvaluator](https://github.com/HenryRLee/PokerHandEvaluator)** (C++ evaluator)

**Rationale**:
- Extremely fast evaluation (optimized lookup tables)
- Battle-tested and accurate
- 7-card and 5-card support
- Open source, well-maintained

**Integration Options**:

**Option A: WASM Bindings** (Preferred if available)
```typescript
// src/game-logic/evaluation/PokerHandEvaluatorWASM.ts
import wasmModule from 'poker-hand-evaluator-wasm';

export class HandEvaluatorWASM {
  private evaluator: any;

  async init() {
    this.evaluator = await wasmModule();
  }

  evaluateHand(cards: Card[]): HandResult {
    // Convert cards to evaluator format
    const cardInts = cards.map(c => this.cardToInt(c));

    // Call WASM function
    const rank = this.evaluator.evaluate7(cardInts);

    return this.rankToHandResult(rank);
  }
}
```

**Option B: TypeScript Port** (Fallback)
- Port the C++ algorithm to TypeScript
- Use same lookup table approach
- Pre-generate lookup tables at build time
- Verify accuracy against reference implementation

**Performance Target**:
- <1ms for hand evaluation (mobile-critical)
- Support for 1000+ evaluations/second (batch bot simulations)

---

### 0.2 Side Pot Calculation Algorithm

**Algorithm**: Iterative sorting by bet amount (as per user clarification)

```typescript
// src/game-logic/pot/PotCalculator.ts
export function calculateSidePots(players: Player[], lastAggressor: string): PotStructure {
  // Filter active players (not folded, has bet)
  const activePlayers = players.filter(p => !p.folded && p.totalBet > 0);

  // Sort by total bet amount (ascending)
  activePlayers.sort((a, b) => a.totalBet - b.totalBet);

  const pots: SidePot[] = [];
  let previousBet = 0;

  for (let i = 0; i < activePlayers.length; i++) {
    const currentBet = activePlayers[i].totalBet;
    const contribution = currentBet - previousBet;

    if (contribution > 0) {
      const eligiblePlayers = activePlayers.slice(i);
      const potAmount = contribution * eligiblePlayers.length;

      pots.push({
        amount: potAmount,
        eligiblePlayerIds: eligiblePlayers.map(p => p.id)
      });
    }

    previousBet = currentBet;
  }

  // Handle odd chip distribution (to earlier position relative to last aggressor)
  if (pots.length > 0) {
    pots.forEach(pot => {
      if (pot.amount % pot.eligiblePlayerIds.length !== 0) {
        // Calculate odd chip recipient
        const oddChipRecipient = getEarliestPosition(
          pot.eligiblePlayerIds,
          lastAggressor,
          players
        );
        pot.oddChipRecipient = oddChipRecipient;
      }
    });
  }

  return {
    mainPot: pots[0]?.amount || 0,
    sidePots: pots.slice(1),
    totalPot: pots.reduce((sum, pot) => sum + pot.amount, 0)
  };
}
```

**Odd Chip Distribution** (User Clarification):
- Odd chips go to player in **earlier position relative to last aggressor**
- If no aggressor (all check), first player left of button receives odd chip

---

### 0.3 Bot AI Strategy Design

**Bot Personalities**: Persist across games (user clarification)
- Bot "Sarah" always exhibits same traits (e.g., tight-aggressive)
- Stored in localStorage with bot name as key
- Generated once on first encounter, reused thereafter

**Easy Bot** (Win rate varies in mixed games):
- Preflop: Fold if hand < 20% equity, call/raise if pairs or A-K/A-Q
- Post-flop: Check/call frequently, rarely bluff (10% of time)
- No position awareness
- Thinking time: 500ms-2000ms random delay

**Medium Bot** (Win rate varies in mixed games):
- Preflop: Position-aware (tight early, loose late)
- Post-flop: Considers pot odds (calls if equity > pot odds), bluffs 25% of time in position
- Basic pattern recognition
- Thinking time: 1000ms-3000ms

**Hard Bot** (Win rate varies in mixed games):
- Preflop: Advanced hand ranges by position, 3-bet bluffs
- Post-flop: Implied odds calculation, bet sizing tells, adaptive to player
- Strategic bluffing on scary boards
- Thinking time: 1500ms-3500ms

**Bot Personality Persistence**:
```typescript
// src/bot-ai/personality/PersonalityPersistence.ts
export class PersonalityPersistence {
  private storageKey = 'poker-bot-personalities';

  getPersonality(botName: string): BotPersonality {
    const personalities = this.loadPersonalities();

    if (!personalities[botName]) {
      // Generate new personality for this bot
      personalities[botName] = PersonalityGenerator.generate();
      this.savePersonalities(personalities);
    }

    return personalities[botName];
  }

  private loadPersonalities(): Record<string, BotPersonality> {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  private savePersonalities(personalities: Record<string, BotPersonality>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(personalities));
  }
}
```

---

### 0.4 Mobile-First CSS Strategy

**Approach**: Mobile-first Tailwind with custom breakpoints

**Breakpoints**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      // Mobile-first: Base styles for 320px
      'xs': '375px',   // iPhone SE and up
      'sm': '428px',   // Large phones (iPhone 14 Pro Max)
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Tablet landscape / small laptop
      'xl': '1280px',  // Desktop (secondary)
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch-target': '48px',  // Minimum touch target (Android)
        'touch-target-ios': '44px',  // Minimum touch target (iOS)
      },
      minWidth: {
        'touch-target': '48px',
        'touch-target-ios': '44px',
      },
    },
  },
};
```

**Mobile-First CSS Pattern**:
```css
/* Base styles: 320px mobile */
.card {
  width: 50px;
  height: 70px;
  font-size: 12px;
}

/* iPhone SE and up: 375px */
@media (min-width: 375px) {
  .card {
    width: 55px;
    height: 77px;
    font-size: 13px;
  }
}

/* Large phones: 428px */
@media (min-width: 428px) {
  .card {
    width: 60px;
    height: 84px;
    font-size: 14px;
  }
}

/* Tablet: 768px */
@media (min-width: 768px) {
  .card {
    width: 80px;
    height: 112px;
    font-size: 16px;
  }
}

/* Desktop: 1024px */
@media (min-width: 1024px) {
  .card {
    width: 100px;
    height: 140px;
    font-size: 18px;
  }
}
```

**Touch Targets**:
```css
/* Ensure minimum touch targets */
button, .touch-target {
  min-width: 48px;
  min-height: 48px;  /* Android guideline */
  padding: 12px;
}

@supports (-webkit-touch-callout: none) {
  /* iOS-specific: 44px minimum */
  button, .touch-target {
    min-width: 44px;
    min-height: 44px;
  }
}
```

**Safe Area Handling** (iPhone notch, Android gesture bar):
```css
/* Handle safe areas */
.action-buttons {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.header {
  padding-top: max(12px, env(safe-area-inset-top));
}
```

---

### 0.5 Touch Gesture Recognition

**Approach**: Custom implementation using React Touch Events

**Gesture Types**:
1. **Swipe Left**: Fold immediately
2. **Swipe Up**: Open raise slider
3. **Double Swipe Up**: All-in (with confirmation)
4. **Tap**: Call/Check (depending on context)
5. **Double Tap**: Show hand strength indicator
6. **Long Press** (500ms): Show action menu
7. **Pinch Zoom**: Enlarge community cards (accessibility)

**Swipe Recognition**:
```typescript
// src/presentation/gestures/SwipeRecognizer.ts
export class SwipeRecognizer {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private threshold = 50; // 50px minimum distance
  private minDuration = 200; // 200ms minimum duration
  private maxDuration = 1000; // 1000ms maximum duration

  onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }

  onTouchEnd(e: React.TouchEvent, callback: (direction: 'left' | 'right' | 'up' | 'down') => void) {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const duration = Date.now() - this.startTime;

    // Check duration bounds
    if (duration < this.minDuration || duration > this.maxDuration) {
      return; // Gesture too fast or too slow
    }

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if movement exceeds threshold
    if (absDeltaX < this.threshold && absDeltaY < this.threshold) {
      return; // Movement too small
    }

    // Determine primary direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      callback(deltaX < 0 ? 'left' : 'right');
    } else {
      // Vertical swipe
      callback(deltaY < 0 ? 'up' : 'down');
    }
  }

  // Cancel gesture if direction reversed
  onTouchMove(e: React.TouchEvent): boolean {
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const deltaX = currentX - this.startX;
    const deltaY = currentY - this.startY;

    // Check if gesture is being reversed (cancellation)
    // This allows user to cancel by swiping back
    // Implementation details depend on gesture type
    return false; // Return true if cancelled
  }
}
```

**Gesture Conflicts**:
- Prevent swipe gestures from interfering with native scroll
- Use `touch-action: none` on gesture areas
- Allow vertical scroll on settings sheet, action log

---

### 0.6 PWA Configuration

**Web App Manifest**:
```json
// public/manifest.json
{
  "name": "Texas Hold'em Poker",
  "short_name": "Poker",
  "description": "Play Texas Hold'em poker against intelligent bots offline",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a5c3a",
  "theme_color": "#1a5c3a",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "entertainment"],
  "screenshots": [
    {
      "src": "/screenshots/portrait.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/landscape.png",
      "sizes": "844x390",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

**Service Worker Strategy**:
```typescript
// src/pwa/sw-config.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache images (cards, avatars, chips)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          // Only cache successful responses
          return response.status === 200 ? response : null;
        },
      },
    ],
  })
);

// Cache audio files (sound effects)
registerRoute(
  ({ request }) => request.destination === 'audio',
  new CacheFirst({
    cacheName: 'audio',
  })
);

// Network-first for game state updates (future feature)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    networkTimeoutSeconds: 3,
  })
);
```

**Update Handling**:
```typescript
// src/pwa/update-manager.ts
import { useRegisterSW } from 'virtual:pwa-register/react';

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW registered:', registration);

      // Check for updates every hour
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const promptUpdate = () => {
    // Show user-friendly update prompt
    return needRefresh;
  };

  const applyUpdate = async () => {
    await updateServiceWorker(true);
    // Reload page to apply update
    window.location.reload();
  };

  return { promptUpdate, applyUpdate };
}
```

---

### 0.7 Orientation Handling

**Strategy**: Detect orientation changes, smoothly transition layouts

```typescript
// src/presentation/hooks/useOrientation.ts
import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth
        ? 'portrait'
        : 'landscape';

      if (newOrientation !== orientation) {
        // Pause game timers during transition
        window.dispatchEvent(new CustomEvent('orientation-changing'));

        setOrientation(newOrientation);

        // Resume timers after layout settles (300ms)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('orientation-changed'));
        }, 300);
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [orientation]);

  return orientation;
}
```

**Layout Components**:
```typescript
// src/presentation/pages/GamePage.tsx
export const GamePage: React.FC = () => {
  const orientation = useOrientation();

  return (
    <div className="game-page">
      {orientation === 'portrait' ? (
        <PortraitLayout />
      ) : (
        <LandscapeLayout />
      )}
    </div>
  );
};
```

---

### 0.8 Haptic Feedback Integration

**Vibration API Wrapper**:
```typescript
// src/utils/vibration.ts
export class HapticFeedback {
  private enabled: boolean = true;

  constructor() {
    // Check if Vibration API is supported
    this.enabled = 'vibrate' in navigator;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  light() {
    if (!this.enabled) return;
    // Light tap (10ms)
    navigator.vibrate(10);
  }

  medium() {
    if (!this.enabled) return;
    // Medium tap (20ms)
    navigator.vibrate(20);
  }

  heavy() {
    if (!this.enabled) return;
    // Heavy tap (50ms)
    navigator.vibrate(50);
  }

  success() {
    if (!this.enabled) return;
    // Success pattern (short-short-long)
    navigator.vibrate([10, 50, 10, 50, 30]);
  }

  error() {
    if (!this.enabled) return;
    // Error pattern (long-short-long)
    navigator.vibrate([30, 50, 20, 50, 30]);
  }
}

export const haptic = new HapticFeedback();
```

**Usage in Components**:
```typescript
// Button press
<Button
  onTouchStart={() => haptic.light()}
  onPress={handleAction}
>
  Call
</Button>

// Card deal
useEffect(() => {
  if (cardsDealt) {
    haptic.medium();
  }
}, [cardsDealt]);

// Win pot
useEffect(() => {
  if (wonPot) {
    haptic.success();
  }
}, [wonPot]);
```

---

## Phase 1: Foundation & Setup (Week 1)

*[Continue with phases as in original plan.md, but adapted for mobile-first...]*

Due to message length limits, I'll continue in the next message with the remaining phases and then write tasks.md and constitution.md.

Would you like me to continue writing the complete plan.md now, or shall I proceed to tasks.md and constitution.md to complete the PRD rewrite?
