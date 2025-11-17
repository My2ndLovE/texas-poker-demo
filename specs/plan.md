# Implementation Plan: Standalone Texas Hold'em Poker Game

**Project**: Standalone Poker Game
**Created**: 2025-11-18
**Status**: Active
**Spec Reference**: [spec.md](./spec.md)

---

## Executive Summary

Build a production-quality, single-player Texas Hold'em poker game that runs entirely in the browser. No backend, no database, no multiplayer - pure client-side gameplay with intelligent bot opponents. Players experience authentic poker mechanics with professional UI, smooth animations, and customizable settings.

**Technical Approach**: React 18 + TypeScript for UI, pure TypeScript game engine for poker logic, bot AI with three difficulty levels, state management with Zustand, comprehensive test coverage with Jest, Vite for blazing-fast development.

**Timeline**: 6-8 weeks for complete implementation (solo developer, 20-30 hours/week)

---

## Technical Context

### Technology Stack

**Frontend Framework**: React 18.3+
- **Why**: Component-based architecture perfect for complex UI (poker table, cards, actions)
- **Hooks**: useState, useEffect, useReducer for component state
- **Performance**: React.memo, useMemo, useCallback for optimization
- **Version**: Latest stable with concurrent features and improved performance

**Language**: TypeScript 5.7+
- **Why**: Type safety critical for poker logic correctness
- **Strict**: No `any` types, complete type coverage
- **Features**: Latest type inference, satisfies operator, const type parameters
- **Interfaces**: Strong typing for game state, actions, bot decisions
- **Generics**: Reusable utility functions with type safety

**State Management**: Zustand 5.x
- **Why**: Simpler than Redux, perfect for client-side state, minimal boilerplate
- **Stores**: Separate stores for game state, UI state, settings
- **Immer**: Built-in support for immutable state updates
- **DevTools**: Redux DevTools integration for debugging
- **Middleware**: Persist middleware for localStorage sync

**Build Tool**: Vite 6.x
- **Why**: Fastest dev server (<50ms HMR), optimized production builds
- **Features**: Lightning-fast ES modules, code-splitting, tree-shaking, minification
- **Plugins**: TypeScript, React, PostCSS (for Tailwind)
- **Performance**: Sub-second cold starts, instant hot reloads

**Testing Framework**: Vitest + React Testing Library + Playwright
- **Vitest**: Modern test runner (2-10x faster than Jest), native Vite integration, ESM support
- **Unit Tests**: Game logic (hand evaluation, pot calculation, bot AI)
- **Component Tests**: UI components with @testing-library/react
- **E2E Tests**: Playwright for end-to-end user flows (complete games)
- **Coverage**: Target 80% for game logic, 60% for UI
- **Why Vitest**: Same config as Vite, instant watch mode, native TypeScript

**Hand Evaluation Library**: poker-evaluator (https://github.com/Sukhmai/poker-evaluator)
- **Why**: Actively maintained (last update Aug 2025), native TypeScript support (89.5%)
- **Features**: 3, 5, 6, 7 card evaluation using Two Plus Two algorithm with lookup tables
- **Integration**: Native TypeScript API, no @types needed, modern ES6+ codebase
- **Performance**: 22 million hands/second (2,000x more than needed for 200+ players)
- **Maintenance**: Fork of original poker-evaluator, actively maintained with 2024-2025 updates
- **Bundle Size**: Efficient lookup table approach, includes HandRanks.dat

**UI Framework**: shadcn/ui + TailwindCSS 4.x
- **shadcn/ui**: Copy-paste accessible components (Button, Dialog, Slider, Toast)
- **Why shadcn**: Own your components, fully customizable, built on Radix UI primitives
- **TailwindCSS 4**: Latest version with native CSS, better performance, smaller builds
- **Accessibility**: WCAG 2.1 Level AA compliant out of the box
- **Saves Time**: No need to build Button, Modal, Slider from scratch

**Animation Library**: Framer Motion 12.x
- **Why**: Declarative animations, spring physics, gesture support
- **Performance**: GPU-accelerated, 60fps animations
- **Features**: Variants for sequencing, layout animations, exit animations
- **Better than CSS**: Simpler API, TypeScript support, better control
- **Use Cases**: Card dealing, chip sliding, winner celebrations, smooth transitions

**Icons**: Lucide React
- **Why**: Professional, tree-shakeable, 1400+ icons, TypeScript support
- **Usage**: Suits (♠ ♥ ♦ ♣), actions (fold, raise, all-in), UI (settings, stats)
- **No Emojis**: Professional appearance, consistent design
- **Bundle Size**: Only imports icons you use (tree-shakeable)

**Validation**: Zod
- **Why**: TypeScript-first schema validation, runtime safety
- **Use Cases**: Settings validation, game state validation, user input validation
- **Features**: Type inference (TypeScript types from schemas), composable schemas
- **Integration**: Works perfectly with React Hook Form for settings

**Form Management**: React Hook Form
- **Why**: Performant, minimal re-renders, built-in validation
- **Use Cases**: Settings panel, raise amount input, game configuration
- **Integration**: Works with Zod for schema validation
- **Better than**: Controlled components (fewer re-renders)

**Code Quality**: Biome
- **Why**: All-in-one linter + formatter (replaces ESLint + Prettier)
- **Performance**: 97% faster than ESLint, written in Rust
- **Features**: Linting, formatting, import sorting - all in one tool
- **Config**: Single biome.json file, zero config to start
- **Migration**: Can migrate from ESLint/Prettier config automatically

**Package Manager**: pnpm
- **Why**: 2-3x faster than npm, disk space efficient (hard links)
- **Features**: Strict dependency resolution, monorepo support
- **Security**: Better than npm/yarn (no phantom dependencies)
- **Disk**: Saves gigabytes with shared dependency store

**Localization**: react-i18next (optional for MVP)
- **Why**: Industry standard, supports plural forms, interpolation
- **Setup**: English default, infrastructure ready for future languages
- **Keys**: No hardcoded strings, all text via t('key') function
- **MVP**: Can defer full implementation until post-launch

---

### Key Tech Stack Improvements

**Why This Stack is Better:**

1. **Vitest vs Jest**: 2-10x faster test execution, native Vite integration, instant watch mode, same config as build tool
2. **Biome vs ESLint+Prettier**: 97% faster linting/formatting, single tool instead of two, zero config to start, written in Rust
3. **pnpm vs npm**: 2-3x faster installs, saves gigabytes of disk space, stricter dependency resolution prevents bugs
4. **shadcn/ui**: Production-ready accessible components, saves 20+ hours of UI development, fully customizable
5. **Framer Motion**: Declarative animations, easier to maintain than CSS keyframes, TypeScript support, better orchestration
6. **Vite 6**: Faster than Vite 5, sub-second cold starts, <50ms HMR, improved code-splitting
7. **Zod + React Hook Form**: Runtime validation prevents bugs, better UX, type-safe forms
8. **TailwindCSS 4**: Native CSS support, smaller builds, better performance than v3
9. **Playwright**: Most reliable E2E testing, better than Cypress for modern apps, built-in test automation
10. **TypeScript 5.7**: Latest type inference improvements, better error messages, const type parameters

**Time Savings:**
- shadcn/ui components: **~20 hours** (no need to build Button, Modal, Slider from scratch)
- Framer Motion: **~10 hours** (simpler than managing CSS animations and timing)
- Vitest: **~5 hours** (faster test feedback loop across development)
- Biome: **~3 hours** (one tool instead of configuring ESLint + Prettier)
- **Total saved: ~38 hours** (~20% of total project time)

**Developer Experience:**
- Faster feedback loops (Vitest, Vite 6, pnpm)
- Less configuration (Biome, shadcn/ui, Vitest)
- Better type safety (Zod, TypeScript 5.7)
- Easier animations (Framer Motion vs CSS keyframes)
- Modern best practices (all latest stable versions)

---

## Project Structure

```
standalone-poker-game/
├── src/
│   ├── presentation/                  # React UI layer
│   │   ├── components/
│   │   │   ├── game/                  # Game-specific components
│   │   │   │   ├── PokerTable.tsx     # Main table layout
│   │   │   │   ├── PlayerSeat.tsx     # Individual player position
│   │   │   │   ├── CommunityCards.tsx # Flop/turn/river cards
│   │   │   │   ├── PotDisplay.tsx     # Pot amount with chips visualization
│   │   │   │   ├── ActionButtons.tsx  # Fold/Call/Raise buttons
│   │   │   │   ├── RaiseSlider.tsx    # Raise amount selector
│   │   │   │   ├── ActionTimer.tsx    # Countdown timer
│   │   │   │   ├── WinnerAnnouncement.tsx # Winner celebration
│   │   │   │   ├── ActionLog.tsx      # Recent actions history
│   │   │   │   └── DealerButton.tsx   # Dealer indicator
│   │   │   ├── cards/
│   │   │   │   ├── PlayingCard.tsx    # Single card component
│   │   │   │   ├── CardBack.tsx       # Face-down card
│   │   │   │   └── CardFront.tsx      # Face-up card with suit/rank
│   │   │   ├── ui/                    # shadcn/ui components (generated)
│   │   │   │   ├── button.tsx         # Accessible button (from shadcn)
│   │   │   │   ├── dialog.tsx         # Modal dialog (from shadcn)
│   │   │   │   ├── slider.tsx         # Range input (from shadcn)
│   │   │   │   ├── tooltip.tsx        # Hover tooltip (from shadcn)
│   │   │   │   ├── toast.tsx          # Notification system (from shadcn)
│   │   │   │   ├── form.tsx           # Form components (from shadcn)
│   │   │   │   └── card.tsx           # Card container (from shadcn)
│   │   │   └── layout/
│   │   │       ├── MainMenu.tsx       # Start screen
│   │   │       ├── SettingsPanel.tsx  # Game settings
│   │   │       ├── StatsPanel.tsx     # Session statistics
│   │   │       └── GameOverScreen.tsx # End game summary
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # Main menu (Quick Play, Settings, etc.)
│   │   │   ├── GamePage.tsx           # Active game table
│   │   │   └── SettingsPage.tsx       # Full settings interface
│   │   ├── hooks/
│   │   │   ├── useGameState.ts        # Access game state from store
│   │   │   ├── useGameActions.ts      # Dispatch game actions
│   │   │   ├── useSettings.ts         # Access/modify settings
│   │   │   ├── useAnimation.ts        # Animation control
│   │   │   └── useKeyboardShortcuts.ts # Keyboard event handling
│   │   └── styles/
│   │       ├── global.css             # Global styles
│   │       ├── table.css              # Poker table specific
│   │       ├── cards.css              # Card designs
│   │       └── animations.css         # Keyframe animations
│   │
│   ├── game-logic/                    # Pure TypeScript game engine
│   │   ├── engine/
│   │   │   ├── GameEngine.ts          # Orchestrates game loop
│   │   │   ├── GameStateMachine.ts    # Phase transitions (preflop→flop→turn→river→showdown)
│   │   │   ├── ActionProcessor.ts     # Validates and applies player actions
│   │   │   ├── BettingRoundManager.ts # Detects betting round completion
│   │   │   └── HandCompletionHandler.ts # End-of-hand logic (award pot, rotate button)
│   │   ├── rules/
│   │   │   ├── BettingRules.ts        # Min/max bet validation, raise rules
│   │   │   ├── BlindRules.ts          # SB/BB posting, heads-up rules
│   │   │   ├── PositionRules.ts       # Dealer, SB, BB, UTG calculations
│   │   │   └── ShowdownRules.ts       # Card reveal order, mucking rules
│   │   ├── evaluation/
│   │   │   ├── HandEvaluator.ts       # Wrapper for poker-evaluator library
│   │   │   ├── HandComparator.ts      # Compare two hands (with tie-breaking)
│   │   │   └── BestHandFinder.ts      # Find best 5-card hand from 7 cards
│   │   ├── pot/
│   │   │   ├── PotCalculator.ts       # Calculate main pot and side pots
│   │   │   ├── PotDistributor.ts      # Award pots to winners
│   │   │   └── OddChipHandler.ts      # Distribute indivisible chips
│   │   ├── deck/
│   │   │   ├── Deck.ts                # 52-card deck, shuffle, deal, burn
│   │   │   ├── Card.ts                # Card model (rank, suit)
│   │   │   └── CardShuffler.ts        # Fisher-Yates shuffle algorithm
│   │   ├── models/
│   │   │   ├── GameState.ts           # Complete game state interface
│   │   │   ├── Player.ts              # Player model (id, name, chips, cards, status)
│   │   │   ├── Action.ts              # Player action (type, amount)
│   │   │   ├── Pot.ts                 # Pot model (main, side pots, eligible players)
│   │   │   └── Hand.ts                # Hand result (rank, cards, description)
│   │   └── validators/
│   │       ├── ActionValidator.ts     # Validate player actions
│   │       ├── ChipValidator.ts       # Validate chip amounts
│   │       └── StateValidator.ts      # Validate game state consistency
│   │
│   ├── bot-ai/                        # Bot decision-making
│   │   ├── strategies/
│   │   │   ├── EasyStrategy.ts        # Simple random-based decisions
│   │   │   ├── MediumStrategy.ts      # Basic poker strategy (position, pot odds)
│   │   │   ├── HardStrategy.ts        # Advanced strategy (hand ranges, bluffing)
│   │   │   └── StrategyInterface.ts   # Common interface for all strategies
│   │   ├── personality/
│   │   │   ├── PersonalityTraits.ts   # Tight/loose, aggressive/passive traits
│   │   │   ├── PersonalityGenerator.ts # Assign random personalities to bots
│   │   │   └── BehaviorModifier.ts    # Adjust strategy based on personality
│   │   ├── decision/
│   │   │   ├── ActionSelector.ts      # Choose action based on strategy
│   │   │   ├── BetSizer.ts            # Determine bet/raise amount
│   │   │   ├── BluffDetector.ts       # Decide when to bluff
│   │   │   └── ThinkingTimer.ts       # Realistic delay (500ms-3500ms)
│   │   ├── analysis/
│   │   │   ├── HandStrengthCalculator.ts # Evaluate hand strength (0-1 scale)
│   │   │   ├── PotOddsCalculator.ts   # Calculate pot odds vs equity
│   │   │   ├── OpponentModeler.ts     # Track opponent patterns (for Hard bots)
│   │   │   └── BoardAnalyzer.ts       # Analyze community cards (draws, made hands)
│   │   └── BotOrchestrator.ts         # Main bot controller
│   │
│   ├── state-management/              # Zustand stores
│   │   ├── gameStore.ts               # Game state (cards, pot, players, phase)
│   │   ├── settingsStore.ts           # User settings (difficulty, chips, animations)
│   │   ├── uiStore.ts                 # UI state (modals, dialogs, loading)
│   │   └── statsStore.ts              # Session statistics (hands played, win rate)
│   │
│   ├── utils/                         # Shared utilities
│   │   ├── formatters.ts              # Format numbers, chips, percentages
│   │   ├── constants.ts               # Game constants (blind levels, timeouts)
│   │   ├── logger.ts                  # Console logging wrapper
│   │   └── storage.ts                 # localStorage wrapper for settings
│   │
│   ├── localization/                  # i18n resources
│   │   ├── i18n.ts                    # i18next configuration
│   │   ├── en/                        # English translations
│   │   │   ├── game.json              # Game-related text
│   │   │   ├── ui.json                # UI labels and buttons
│   │   │   └── errors.json            # Error messages
│   │   ├── vi/                        # Vietnamese (future)
│   │   └── th/                        # Thai (future)
│   │
│   ├── assets/                        # Static assets
│   │   ├── images/
│   │   │   ├── cards/                 # Card images (PNG/SVG)
│   │   │   ├── avatars/               # Bot avatars
│   │   │   ├── chips/                 # Chip graphics
│   │   │   └── table/                 # Table textures
│   │   └── sounds/                    # Sound effects (optional)
│   │       ├── card-deal.mp3
│   │       ├── chip-slide.mp3
│   │       ├── win-celebration.mp3
│   │       └── timer-tick.mp3
│   │
│   ├── App.tsx                        # Root component
│   ├── main.tsx                       # Entry point (React render)
│   └── vite-env.d.ts                  # Vite type definitions
│
├── tests/                             # Test files (mirror src structure)
│   ├── unit/
│   │   ├── game-logic/                # Game engine tests
│   │   │   ├── HandEvaluator.test.ts  # Hand ranking tests (200+ cases)
│   │   │   ├── PotCalculator.test.ts  # Side pot tests (50+ edge cases)
│   │   │   ├── BettingRules.test.ts   # Min raise, all-in validation
│   │   │   └── GameStateMachine.test.ts # Phase transitions
│   │   └── bot-ai/                    # Bot AI tests
│   │       ├── EasyStrategy.test.ts   # Verify Easy bot behavior
│   │       ├── MediumStrategy.test.ts # Verify Medium bot behavior
│   │       └── HardStrategy.test.ts   # Verify Hard bot behavior
│   ├── integration/
│   │   ├── CompleteHand.test.ts       # Full hand flow (preflop→showdown)
│   │   ├── MultiplayerAllIn.test.ts   # 3+ player all-in scenarios
│   │   ├── HeadsUpRules.test.ts       # 2-player special rules
│   │   └── BotVsBot.test.ts           # Bot-only games (validate balance)
│   └── components/
│       ├── PokerTable.test.tsx        # Table rendering tests
│       ├── ActionButtons.test.tsx     # Button interactions
│       └── RaiseSlider.test.tsx       # Slider validation
│
├── public/                            # Public assets (served as-is)
│   ├── index.html                     # HTML entry point
│   └── favicon.ico                    # App icon
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md                # Technical architecture guide
│   ├── GAME_RULES.md                  # Poker rules reference
│   ├── BOT_AI.md                      # Bot strategy documentation
│   └── DEVELOPMENT.md                 # Development setup guide
│
├── .github/                           # GitHub configuration
│   └── workflows/
│       ├── test.yml                   # Run tests on push
│       └── deploy.yml                 # Deploy to GitHub Pages
│
├── package.json                       # NPM dependencies and scripts
├── tsconfig.json                      # TypeScript configuration (strict mode)
├── vite.config.ts                     # Vite build configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── jest.config.js                     # Jest test configuration
├── .eslintrc.js                       # ESLint rules
├── .prettierrc                        # Prettier formatting
├── README.md                          # Project overview and setup
└── CLAUDE.md                          # Instructions for Claude Code
```

**Structure Rationale**:
- **Clear Separation**: UI (presentation), game logic (pure TypeScript), bot AI (decision-making)
- **Testability**: Pure functions in game logic easy to unit test without UI dependencies
- **Scalability**: Modular structure allows adding features (new bot strategies, game modes) without refactoring
- **Type Safety**: TypeScript strict mode across all modules ensures correctness

---

## Phase 0: Technology Decisions & Research

### 0.1 Hand Evaluation Library Selection

**Decision**: Use **poker-evaluator** by Sukhmai (https://github.com/Sukhmai/poker-evaluator)

**Rationale**:
- **Actively maintained**: Last commit August 2025 (3 months ago), 3 commits in 2024
- **Native TypeScript**: 89.5% TypeScript codebase, no need for @types package
- **Modern fork**: Updated version of the proven Two Plus Two algorithm implementation
- **Excellent performance**: 22 million hands/second on modern hardware
- **Proven algorithm**: Two Plus Two with lookup table (battle-tested approach)
- **Clean API**: Synchronous evaluation, simple integration
- **Mobile-friendly**: Pure computation, no async overhead

**Integration**:
```typescript
// src/game-logic/evaluation/HandEvaluator.ts
import { evaluateHand, compareHands } from 'poker-evaluator';

export class HandEvaluator {
  evaluateHand(cards: Card[]): HandResult {
    // Convert Card[] to poker-evaluator format (e.g., "As", "Kh")
    const cardStrings = cards.map(c => `${c.rank}${c.suit.toLowerCase()}`);

    // Evaluate best 5-card hand from 7 cards
    const result = evaluateHand(cardStrings);

    return {
      rank: this.mapHandTypeToRank(result.handType),
      description: result.handName,
      value: result.value,
      handRank: result.handRank
    };
  }

  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    // Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
    const h1Strings = hand1Cards.map(c => `${c.rank}${c.suit.toLowerCase()}`);
    const h2Strings = hand2Cards.map(c => `${c.rank}${c.suit.toLowerCase()}`);

    const h1 = evaluateHand(h1Strings);
    const h2 = evaluateHand(h2Strings);

    // Lower value = stronger hand in Two Plus Two algorithm
    if (h1.value < h2.value) return 1;
    if (h1.value > h2.value) return -1;
    return 0;
  }

  private mapHandTypeToRank(handType: number): HandRank {
    // poker-evaluator handType: 0-9
    // 0 = High Card, 1 = Pair, ..., 9 = Straight Flush
    return handType as HandRank;
  }
}
```

**Advantages**:
- **Native TypeScript**: Better IDE support, type safety out of the box
- **Actively maintained**: Recent updates, bug fixes, modern dependencies
- **Modern codebase**: ES6+, clean architecture, up-to-date practices
- **Same proven algorithm**: Two Plus Two lookup table (used in production poker sites)
- **Synchronous API**: No async/await complexity
- **Works everywhere**: Browser and Node.js support

**Performance Reality Check**:
- poker-evaluator: 22 million hands/second (exceptional)
- Your use case: ~10,000 evaluations/second max (200 players, peak load)
- Headroom: 2,200x more performance than needed
- Conclusion: Performance is NOT a bottleneck, focus on code quality and maintainability

**Why This Over pokersolver**:
- Native TypeScript vs wrapper types (@types/pokersolver)
- Actively maintained (2025) vs last update 2021
- Modern ES6+ codebase vs older JavaScript patterns
- Same excellent performance for real-world use
- Better long-term support and bug fixes

**Alternatives Considered**:
- **pokersolver**: Good but lacks native TypeScript, not actively maintained (last update 2021)
- **PokerHandEvaluator (WebAssembly)**: Overkill performance, unnecessary complexity
- **Original poker-evaluator (chenosaurus)**: Abandoned since 2017, Sukhmai's fork is the maintained version
- **phe (JS port)**: Low adoption, unmaintained

---

### 0.2 Side Pot Calculation Algorithm

**Decision**: Iterative algorithm sorting players by bet amount

**Algorithm**:
```typescript
// src/game-logic/pot/PotCalculator.ts
export function calculateSidePots(players: Player[]): PotStructure {
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
      // Players from index i onwards are eligible
      const eligiblePlayers = activePlayers.slice(i);
      const potAmount = contribution * eligiblePlayers.length;

      pots.push({
        amount: potAmount,
        eligiblePlayerIds: eligiblePlayers.map(p => p.id)
      });
    }

    previousBet = currentBet;
  }

  return {
    mainPot: pots[0]?.amount || 0,
    sidePots: pots.slice(1),
    totalPot: pots.reduce((sum, pot) => sum + pot.amount, 0)
  };
}
```

**Example** (3 players, different all-in amounts):
- Player A: $25 all-in
- Player B: $75 all-in
- Player C: $100 call

**Pots**:
1. Main pot: $75 ($25 × 3) - eligible: A, B, C
2. Side pot 1: $100 ($50 × 2) - eligible: B, C
3. Side pot 2: $25 - eligible: C only

**Rationale**: Handles unlimited all-in scenarios correctly, proven algorithm used in online poker

---

### 0.3 Bot AI Strategy Design

**Easy Bot** (Target 35-40% win rate):
- **Preflop**: Fold if hand < 20% equity (7-2, 8-3, etc.), call/raise if pairs or A-K/A-Q
- **Post-flop**: Check/call frequently, rarely bluff (10% of time)
- **No Awareness**: Ignores position, pot odds, opponent patterns
- **Thinking Time**: 500ms-2000ms random delay

**Medium Bot** (Target 45-50% win rate):
- **Preflop**: Position-aware (tight early, loose late), folds weak hands from early position
- **Post-flop**: Considers pot odds (calls if equity > pot odds), bluffs 25% of time in position
- **Basic Patterns**: Notices if opponent folds often (bluffs more), tightens if opponent aggressive
- **Thinking Time**: 1000ms-3000ms (longer on tough decisions)

**Hard Bot** (Target 55-60% win rate):
- **Preflop**: Advanced hand ranges by position, 3-bet bluffs with suited connectors
- **Post-flop**: Implied odds calculation, bet sizing tells (small = strong, large = bluff), reads opponent ranges
- **Adaptive**: Exploits player tendencies (bluffs tight players, value bets calling stations)
- **Bluffing**: Strategic bluffing on scary boards (e.g., 4-to-a-straight on river), folds to re-raises
- **Thinking Time**: 1500ms-3500ms (varies by decision complexity)

**Bot Personality Traits**:
```typescript
// src/bot-ai/personality/PersonalityTraits.ts
interface BotPersonality {
  tightness: number;    // 0-1: 0 = very loose, 1 = very tight
  aggression: number;   // 0-1: 0 = passive, 1 = aggressive
  bluffFrequency: number; // 0-1: 0 = never bluff, 1 = bluff often
  adaptability: number; // 0-1: 0 = static, 1 = highly adaptive
}

// Example: Tight-aggressive bot (TAG)
const tagBot: BotPersonality = {
  tightness: 0.7,      // Plays fewer hands
  aggression: 0.8,     // Bets/raises often when playing
  bluffFrequency: 0.3, // Moderate bluffing
  adaptability: 0.6    // Adjusts somewhat to opponents
};
```

**Bot Validation**: Run 1000-hand simulation (bots only), verify win rate distribution matches targets

---

### 0.4 State Management Architecture

**Decision**: Zustand with separate stores

**Game Store** (src/state-management/gameStore.ts):
```typescript
interface GameState {
  phase: 'menu' | 'playing' | 'game-over';
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  players: Player[];
  communityCards: Card[];
  pot: PotStructure;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  deck: Card[];
  burnedCards: Card[];
  actionHistory: Action[];
}

export const useGameStore = create<GameState>((set) => ({
  // ... initial state

  // Actions
  startNewGame: (settings: GameSettings) => set(state => {
    // Initialize game with settings
  }),

  dealCards: () => set(state => {
    // Deal hole cards to all players
  }),

  applyAction: (action: Action) => set(state => {
    // Process player action, update state
  }),

  advancePhase: () => set(state => {
    // Move to next phase (flop→turn→river→showdown)
  }),

  completeHand: () => set(state => {
    // Award pot, rotate dealer, start next hand
  })
}));
```

**Settings Store** (src/state-management/settingsStore.ts):
```typescript
interface Settings {
  numBots: number;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  startingChips: number;
  blindLevel: { small: number; big: number };
  actionTimer: number; // seconds
  animationSpeed: 'slow' | 'normal' | 'fast' | 'off';
  soundEffects: boolean;
  cardBackDesign: string;
  language: 'en' | 'vi' | 'th' | 'zh';
}

export const useSettingsStore = create(persist<Settings>((set) => ({
  // ... default settings

  updateSettings: (newSettings: Partial<Settings>) => set(state => ({
    ...state,
    ...newSettings
  }))
}), {
  name: 'poker-game-settings', // localStorage key
  storage: createJSONStorage(() => localStorage)
}));
```

**UI Store** (src/state-management/uiStore.ts):
```typescript
interface UIState {
  isSettingsOpen: boolean;
  isStatsOpen: boolean;
  showWinnerAnnouncement: boolean;
  winnerData: WinnerData | null;
  toast: { message: string; type: 'info' | 'error' | 'success' } | null;
}
```

**Rationale**: Zustand is lighter than Redux, perfect for client-side, built-in persist for settings

---

### 0.5 Animation Strategy

**Approach**: Framer Motion for declarative, GPU-accelerated animations

**Card Dealing Animation** (Framer Motion):
```typescript
// src/presentation/components/cards/PlayingCard.tsx
import { motion } from 'framer-motion';

const PlayingCard: React.FC<{ card: Card; position: Position }> = ({ card, position }) => {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
      animate={{ scale: 1, opacity: 1, x: position.x, y: position.y }}
      transition={{
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="playing-card"
    >
      {/* Card content */}
    </motion.div>
  );
};
```

**Chip Movement** (Framer Motion):
```typescript
// src/presentation/components/game/ChipStack.tsx
import { motion } from 'framer-motion';

const ChipStack: React.FC<{ amount: number; targetPosition: Position }> = ({ amount, targetPosition }) => {
  return (
    <motion.div
      initial={{ x: 0, y: 0 }}
      animate={{ x: targetPosition.x, y: targetPosition.y }}
      transition={{
        duration: 0.4,
        ease: "easeInOut"
      }}
      className="chip-stack"
    >
      {/* Chip graphics */}
    </motion.div>
  );
};
```

**Sequential Animations** (Dealing to multiple players):
```typescript
// src/presentation/components/game/CommunityCards.tsx
import { motion, AnimatePresence } from 'framer-motion';

const CommunityCards: React.FC = () => {
  const { communityCards, gamePhase } = useGameStore();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15 // Delay between each card
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.5, opacity: 0, y: -100 },
    show: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      className="community-cards"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {communityCards.map((card, i) => (
          <motion.div
            key={card.id}
            variants={cardVariants}
            layout // Smooth repositioning on add/remove
          >
            <PlayingCard card={card} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
```

**Winner Celebration**:
```typescript
const WinnerAnnouncement: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="winner-celebration"
    >
      <motion.h2
        animate={{
          scale: [1, 1.1, 1],
          textShadow: [
            "0 0 0px #ffd700",
            "0 0 20px #ffd700",
            "0 0 0px #ffd700"
          ]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        You Win!
      </motion.h2>
    </motion.div>
  );
};
```

**Animation Settings** (Speed Control):
```typescript
// src/state-management/settingsStore.ts
const animationSpeed = {
  off: 0,      // No animations
  fast: 0.5,   // 50% duration
  normal: 1.0, // 100% duration
  slow: 2.0    // 200% duration
};

// Apply globally to all Framer Motion animations
const duration = baselineuration * animationSpeed[settings.animationSpeed];
```

**Advantages of Framer Motion**:
- **Declarative**: No manual class toggling or setTimeout management
- **TypeScript**: Full type safety for animation props
- **Layout Animations**: Automatic smooth transitions when elements move
- **Gestures**: Built-in drag, hover, tap support for future interactivity
- **Performance**: GPU-accelerated, 60fps, automatically uses `transform` and `opacity`
- **Orchestration**: Easy sequencing with `staggerChildren` and variants
- **Exit Animations**: AnimatePresence handles unmounting animations

**Performance**: Framer Motion automatically optimizes animations, uses hardware acceleration, and batches DOM updates

---

### 0.6 Testing Strategy

**Unit Tests** (game logic):
- Hand evaluation: 200+ test cases (all hand types, tie-breaking, kickers)
- Pot calculation: 50+ side pot scenarios (2-9 players, various all-in amounts)
- Betting rules: Min raise validation, all-in edge cases
- Bot AI: Decision-making for each difficulty level

**Integration Tests** (full game flows):
- Complete hand: Preflop → flop → turn → river → showdown
- Heads-up rules: Special blind posting, action order
- Multiple all-ins: Correct side pot creation and distribution
- Tie scenarios: Split pots, odd chip distribution

**Component Tests** (UI):
- Action buttons: Click handlers, disabled states
- Raise slider: Min/max validation, quick-bet buttons
- Timer: Countdown, auto-action on expiration

**Test Framework Setup**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // For React components
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8', // Faster than istanbul
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    },
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}']
  }
});
```

**TDD Workflow**:
1. **RED**: Write failing test
2. **GREEN**: Write minimum code to pass
3. **REFACTOR**: Clean up while keeping tests green

---

## Phase 1: Foundation & Setup (Week 1)

### Goals
- Project initialized with all dependencies
- Build system working (Vite + TypeScript + React)
- Test infrastructure ready (Jest + React Testing Library)
- Basic project structure created
- Linting and formatting configured
- Development environment verified

### Deliverables
1. **Project Initialization**
   - Install pnpm globally: `npm install -g pnpm`
   - Run `pnpm create vite@latest texas-poker-demo -- --template react-ts`
   - Install core dependencies: `pnpm add react@18.3 react-dom@18.3`
   - Install Zustand: `pnpm add zustand`
   - Install Tailwind: `pnpm add -D tailwindcss@4 postcss autoprefixer`
   - Install shadcn/ui: `pnpm dlx shadcn@latest init` (sets up components)
   - Install Framer Motion: `pnpm add framer-motion`
   - Install Lucide React: `pnpm add lucide-react`
   - Install poker-evaluator: `pnpm add poker-evaluator` (Sukhmai's actively maintained fork)
   - Install Zod: `pnpm add zod`
   - Install React Hook Form: `pnpm add react-hook-form @hookform/resolvers`
   - Install i18next (optional): `pnpm add react-i18next i18next`

2. **Test Infrastructure**
   - Install Vitest: `pnpm add -D vitest @vitest/ui`
   - Install React Testing Library: `pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`
   - Install Playwright: `pnpm add -D @playwright/test`
   - Configure vitest.config.ts with coverage thresholds (c8 or istanbul)
   - Configure playwright.config.ts for E2E tests
   - Create test utilities (setup file, custom matchers)

3. **Build Configuration**
   - Configure vite.config.ts (plugins, build options, code-splitting)
   - Configure tsconfig.json (strict mode, paths, exclude)
   - Configure Tailwind CSS (tailwind.config.ts, global styles with @layer)
   - Configure shadcn/ui (components.json for customization)

4. **Code Quality Tools**
   - Install Biome: `pnpm add -D @biomejs/biome`
   - Initialize Biome: `pnpm biome init`
   - Configure biome.json (linting + formatting rules)
   - Remove ESLint/Prettier if present (Biome replaces both)
   - Add pre-commit hooks: `pnpm add -D husky lint-staged`

5. **Project Structure**
   - Create folder structure (src/presentation, src/game-logic, src/bot-ai, tests/)
   - Create placeholder files with TypeScript interfaces
   - Set up barrel exports (index.ts files)

6. **Documentation**
   - Write README.md (project overview, setup, scripts)
   - Write ARCHITECTURE.md (high-level design)
   - Write CLAUDE.md (instructions for Claude Code)

7. **Verification**
   - Run `pnpm dev` - dev server starts successfully (<1s cold start)
   - Run `pnpm build` - production build succeeds
   - Run `pnpm test` - Vitest suite runs (even if empty)
   - Run `pnpm test:ui` - Vitest UI opens in browser
   - Run `pnpm biome check` - no linting/formatting errors
   - Run `pnpm biome format --write .` - formats all files
   - Verify hot module replacement (edit component, see instant update <50ms)

**Acceptance Criteria**:
- [x] Project builds without errors in both dev and production modes
- [x] Vitest suite runs and reports coverage (even if 0%)
- [x] Biome linting and formatting configured and working
- [x] shadcn/ui components accessible via CLI
- [x] Folder structure matches plan.md specification
- [x] README.md provides clear setup instructions
- [x] Git repository initialized with .gitignore
- [x] pnpm lockfile committed

**Estimated Time**: 8-10 hours

---

## Phase 2: Game Logic Core (Week 2-3)

### Goals
- Implement core poker rules (complete, no shortcuts)
- Hand evaluation working (all 10 hand ranks)
- Side pot calculation accurate (unlimited all-ins)
- Betting validation correct (min raise, all-in rules)
- Game state machine (phase transitions)
- 80%+ test coverage for game logic

### Deliverables

**Deck & Cards**:
- [TDD] Card model (rank, suit, toString())
- [TDD] Deck class (52 cards, shuffle with Fisher-Yates, deal, burn)
- [TDD] Shuffle randomness test (Chi-square test for distribution)

**Hand Evaluation**:
- [TDD] HandEvaluator service (wrapper for poker-evaluator with native TypeScript support)
- [TDD] 200+ test cases (all hand types, tie-breaking, kickers)
- [TDD] HandComparator (compare two hands, return winner)
- [TDD] Edge cases (wheel straight A-2-3-4-5, suited vs unsuited)

**Pot Calculation**:
- [TDD] PotCalculator (main pot + side pots algorithm)
- [TDD] 50+ test cases (2-9 players, various all-in scenarios)
- [TDD] OddChipHandler (distribute indivisible chips to correct player)
- [TDD] Pot distribution validation (total chips conserved)

**Betting Rules**:
- [TDD] BettingRules service (validate fold, check, call, raise, all-in)
- [TDD] Min raise calculation (double previous bet/raise)
- [TDD] All-in special cases (< min raise doesn't reopen betting)
- [TDD] Bet validation (cannot bet more than stack, cannot check if bet exists)

**Blind Posting**:
- [TDD] BlindRules service (calculate SB/BB positions, post blinds)
- [TDD] Heads-up special rules (dealer = SB)
- [TDD] Insufficient chips for blind (partial blind, all-in)

**Game State Machine**:
- [TDD] GameStateMachine (phase transitions: preflop → flop → turn → river → showdown → hand-complete)
- [TDD] BettingRoundManager (detect when betting round ends)
- [TDD] ActionProcessor (apply action to game state)
- [TDD] Position calculations (dealer, SB, BB, UTG, first-to-act post-flop)

**Player Management**:
- [TDD] Player model (id, name, chips, cards, status)
- [TDD] Seat assignment (6-9 seat table, assign player and bots)
- [TDD] Player elimination (remove when chips = 0)

**Integration Tests**:
- [TDD] Complete hand flow (6 players, preflop → showdown)
- [TDD] Heads-up flow (2 players, special rules)
- [TDD] Multi-player all-in (3+ players, side pots)
- [TDD] All fold except one (early hand end)

**Acceptance Criteria**:
- [x] All poker rules implemented correctly (verified by tests)
- [x] Hand evaluation accurate for all 10 hand types
- [x] Side pot calculation correct for any number of all-ins
- [x] Betting validation prevents all invalid actions
- [x] Game state machine transitions correctly through all phases
- [x] 80%+ code coverage for game logic modules
- [x] Zero game-breaking bugs in integration tests

**Estimated Time**: 40-50 hours

---

## Phase 3: Bot AI Implementation (Week 4)

### Goals
- Three bot difficulty levels (Easy, Medium, Hard)
- Realistic decision-making for each level
- Personality traits add variety to bot behavior
- Bots play believable poker (not predictable, not cheating)
- Bot win rates balanced (Easy: 35-40%, Medium: 45-50%, Hard: 55-60%)

### Deliverables

**Strategy Interfaces**:
- [TDD] StrategyInterface (common interface for all bot strategies)
- [TDD] Action selection contract (getAction(gameState, playerId) => Action)

**Easy Bot**:
- [TDD] EasyStrategy (simple rules: fold weak, call strong, rare bluffs)
- [TDD] Hand strength evaluation (preflop: pairs > A-K > A-Q > ... > 7-2)
- [TDD] Thinking timer (500ms-2000ms random delay)
- [TDD] Win rate validation (35-40% in 1000-hand simulation)

**Medium Bot**:
- [TDD] MediumStrategy (position awareness, pot odds, occasional bluffs)
- [TDD] Position-based hand ranges (tight early, loose late)
- [TDD] Pot odds calculator (call if equity > pot odds)
- [TDD] Bluff frequency (25% of time in position)
- [TDD] Basic pattern recognition (notices if opponent folds often)
- [TDD] Thinking timer (1000ms-3000ms)
- [TDD] Win rate validation (45-50% in 1000-hand simulation)

**Hard Bot**:
- [TDD] HardStrategy (advanced: hand ranges, implied odds, adaptation)
- [TDD] Hand range modeling (estimates opponent range by actions)
- [TDD] Implied odds calculation (considers future betting rounds)
- [TDD] Strategic bluffing (bluffs on scary boards, folds to re-raises)
- [TDD] Bet sizing tells (small = strong, large = bluff)
- [TDD] Opponent adaptation (exploits tight/loose players)
- [TDD] Thinking timer (1500ms-3500ms, varies by decision complexity)
- [TDD] Win rate validation (55-60% in 1000-hand simulation)

**Personality Traits**:
- [TDD] PersonalityGenerator (assign random traits to bots)
- [TDD] BehaviorModifier (adjust strategy based on personality)
- [TDD] Trait combinations (tight-aggressive, loose-passive, etc.)

**Bot Orchestrator**:
- [TDD] BotOrchestrator (main controller for all bots)
- [TDD] Strategy selection (assign difficulty to each bot)
- [TDD] Thinking timer management (delay before action)
- [TDD] Action execution (call GameEngine with bot decision)

**Analysis Tools**:
- [TDD] HandStrengthCalculator (evaluate hand strength 0-1)
- [TDD] PotOddsCalculator (pot odds vs equity)
- [TDD] BoardAnalyzer (identify draws, made hands)

**Bot vs Bot Simulation**:
- [TDD] 1000-hand simulation (bots only, no human)
- [TDD] Win rate analysis (verify distribution matches targets)
- [TDD] Behavior validation (bots don't always play the same)

**Acceptance Criteria**:
- [x] Three bot difficulties implemented with distinct strategies
- [x] Bot win rates balanced and validated through simulation
- [x] Bots play believably (realistic delays, variety in actions)
- [x] Bots never cheat (cannot see hole cards)
- [x] Personality traits add variety without breaking balance
- [x] 80%+ code coverage for bot AI modules

**Estimated Time**: 25-30 hours

---

## Phase 4: UI Components (Week 5)

### Goals
- Professional poker table interface
- All game elements rendered correctly
- Smooth animations (60fps)
- Responsive layout (1366x768 minimum)
- Accessibility (keyboard, screen reader, color blind mode)

### Deliverables

**Base UI Components**:
- [Test] Button (primary, secondary, disabled states)
- [Test] Modal (overlay, close button, focus trap)
- [Test] Slider (range input for raise amounts)
- [Test] Tooltip (hover hint, position smart)
- [Test] Toast (notification system, auto-dismiss)

**Card Components**:
- [Test] PlayingCard (renders card with suit and rank)
- [Test] CardBack (face-down card design)
- [Test] CardFront (face-up card with styling)
- [Test] Card animations (flip, deal, highlight)
- [Test] Card accessibility (screen reader announces card)

**Game Components**:
- [Test] PokerTable (elliptical table layout, felt texture)
- [Test] PlayerSeat (avatar, name, chips, cards, status)
- [Test] CommunityCards (flop/turn/river display with animations)
- [Test] PotDisplay (pot amount with chip graphics)
- [Test] ActionButtons (Fold, Call, Raise - disabled states)
- [Test] RaiseSlider (min/max validation, quick-bet buttons)
- [Test] ActionTimer (countdown with visual progress)
- [Test] WinnerAnnouncement (celebration animation, hand rank)
- [Test] ActionLog (scrollable history of recent actions)
- [Test] DealerButton (indicator next to current dealer)

**Layout Components**:
- [Test] MainMenu (Quick Play, Settings, Exit buttons)
- [Test] GamePage (main game view with table and controls)
- [Test] SettingsPanel (all settings with live preview)
- [Test] StatsPanel (session statistics, charts)
- [Test] GameOverScreen (summary, Play Again button)

**Custom Hooks**:
- [Test] useGameState (access game state from Zustand)
- [Test] useGameActions (dispatch actions to game engine)
- [Test] useSettings (get/set user settings)
- [Test] useAnimation (control animation playback)
- [Test] useKeyboardShortcuts (F=fold, C=call, R=raise, etc.)

**Styling**:
- Tailwind CSS classes for layout
- Custom CSS for poker-specific styles (table, cards, chips)
- Keyframe animations (card dealing, chip sliding, winner celebration)
- Responsive design (1920x1080 to 1366x768)
- Dark mode support (optional)

**Acceptance Criteria**:
- [x] All UI components render correctly without visual bugs
- [x] Animations smooth at 60fps (verified by DevTools FPS meter)
- [x] Interface responsive (scales from 1920x1080 to 1366x768)
- [x] Keyboard shortcuts work for all actions
- [x] Screen reader compatibility (ARIA labels)
- [x] Color blind mode available (patterned suits)
- [x] Component test coverage ≥60%

**Estimated Time**: 30-35 hours

---

## Phase 5: Integration & Polish (Week 6)

### Goals
- Connect UI to game logic (full integration)
- Game loop working end-to-end
- Settings persist to localStorage
- Performance optimized (no lag, smooth animations)
- All edge cases handled gracefully
- Ready for playtesting

### Deliverables

**Game Loop Integration**:
- Connect PokerTable to game store (real-time state updates)
- Wire ActionButtons to ActionProcessor (player actions trigger state changes)
- Integrate BotOrchestrator (bots make decisions automatically)
- Implement game loop (hand start → actions → phase advance → showdown → next hand)

**Animation Sequencing**:
- Choreograph card dealing (deal to each player sequentially)
- Choreograph chip movements (bets slide to pot one at a time)
- Choreograph winner celebration (highlight winning hand, award chips)
- Add delays for readability (pause between phases, delay before next hand)

**Settings Integration**:
- Load settings from localStorage on app start
- Apply settings to game (bot difficulty, starting chips, animation speed)
- Save settings on change (debounced writes to localStorage)
- Settings validation (prevent invalid configurations)

**Statistics Tracking**:
- Track hands played, hands won, win rate, total chips won/lost
- Update statistics after each hand
- Display current stats on player panel
- Show session summary on game end
- Optionally persist stats to localStorage

**Error Handling**:
- Validate all user inputs (bet amounts, raise amounts)
- Display user-friendly error messages (toast notifications)
- Handle edge cases gracefully (insufficient chips, invalid actions)
- Log errors to console for debugging

**Performance Optimization**:
- Use React.memo for expensive components (PokerTable, PlayerSeat)
- Use useMemo/useCallback to prevent unnecessary re-renders
- Code-split heavy modules (bot AI, hand evaluation)
- Lazy load non-critical components (settings, stats)
- Optimize animation performance (use transform, will-change)

**Accessibility**:
- Ensure keyboard navigation works everywhere (Tab, Enter, Escape)
- Announce game state changes to screen readers (ARIA live regions)
- Test with screen reader (NVDA, JAWS, or VoiceOver)
- Verify color contrast (WCAG AA compliance)
- Add focus indicators for keyboard users

**Localization**:
- Extract all hardcoded strings to localization files
- Use t('key') for all user-facing text
- Support language switching (English → Vietnamese)
- Test translations (ensure no text overflow)

**Testing**:
- End-to-end tests (complete hands with all scenarios)
- Performance benchmarks (action response <100ms)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Regression tests (ensure old features still work)

**Acceptance Criteria**:
- [x] Game playable end-to-end (Quick Play → complete hand → game over)
- [x] All user actions trigger correct state changes
- [x] Bots make decisions automatically without human intervention
- [x] Animations smooth and synchronized (60fps)
- [x] Settings persist across browser sessions
- [x] Performance targets met (<100ms actions, 60fps animations)
- [x] Accessibility tested and working (keyboard, screen reader)
- [x] Zero hardcoded strings (all text via i18n)
- [x] No game-breaking bugs

**Estimated Time**: 25-30 hours

---

## Phase 6: Testing & Refinement (Week 7)

### Goals
- Comprehensive test coverage (80% game logic, 60% UI)
- All edge cases tested and working
- Playtesting with real users
- Bug fixes and polish
- Documentation complete

### Deliverables

**Unit Test Coverage**:
- 200+ tests for hand evaluation (all hand types, tie-breaking)
- 50+ tests for side pot calculation (2-9 players, various scenarios)
- 30+ tests for betting validation (min raise, all-in, invalid actions)
- 40+ tests for game state machine (phase transitions, edge cases)
- 30+ tests for bot AI (decision-making, win rate validation)

**Integration Test Coverage**:
- Complete hand flows (6-player game, heads-up, multi-player all-in)
- Edge case scenarios (all fold, all all-in, insufficient blinds)
- Bot-only games (validate AI balance, no cheating)
- Settings validation (all combinations work correctly)

**UI Component Test Coverage**:
- Action buttons (click handlers, disabled states, keyboard shortcuts)
- Raise slider (validation, quick-bet buttons, min/max enforcement)
- Timer (countdown, auto-action on expiration)
- Animations (verify CSS classes applied, duration correct)

**Regression Test Suite**:
- 20+ smoke tests (critical paths must always work)
- Run on every commit (CI/CD integration)
- Fail fast on regression bugs

**Playtesting**:
- Recruit 10+ poker players to play 5+ hands each
- Collect feedback (UI clarity, bot believability, bugs found)
- Identify pain points (confusing UI, unclear actions, slow animations)
- Measure metrics (session length, hands per minute, win rate)

**Bug Fixes**:
- Fix all critical bugs (game-breaking, incorrect poker rules)
- Fix high-priority bugs (visual issues, performance problems)
- Defer low-priority bugs (nice-to-have features, minor polish)

**Performance Testing**:
- Benchmark action processing (<100ms target)
- Profile animation performance (60fps target)
- Memory leak check (play 100 hands, monitor memory usage)
- Load time testing (Time to Interactive <3s)

**Cross-Browser Testing**:
- Chrome 90+ (primary target)
- Firefox 90+
- Safari 14+
- Edge 90+
- Verify no visual bugs, all features work

**Documentation**:
- Update README.md (setup, scripts, deployment)
- Write ARCHITECTURE.md (technical design, key decisions)
- Write GAME_RULES.md (poker rules reference)
- Write BOT_AI.md (bot strategy explanation)
- Write DEVELOPMENT.md (how to add features, extend bot AI)

**Acceptance Criteria**:
- [x] Test coverage ≥80% for game logic, ≥60% for UI
- [x] All critical bugs fixed
- [x] Playtesting feedback incorporated
- [x] Performance targets met
- [x] Cross-browser compatibility verified
- [x] Documentation complete and accurate

**Estimated Time**: 20-25 hours

---

## Phase 7: Deployment & Launch (Week 8)

### Goals
- Production build optimized
- Deploy to GitHub Pages or Vercel
- CI/CD pipeline set up
- Launch announcement
- Post-launch monitoring

### Deliverables

**Production Build**:
- Run `npm run build` - verify no errors
- Optimize bundle size (code-splitting, tree-shaking)
- Minify code and assets
- Generate source maps (for debugging)
- Test production build locally (`npm run preview`)

**Deployment**:
- Choose hosting platform (GitHub Pages or Vercel)
- Configure deployment settings (build command, output directory)
- Set up custom domain (optional)
- Deploy production build
- Verify deployed app works correctly

**CI/CD Pipeline**:
- Create GitHub Actions workflow
- Run tests on every push
- Run linting on every push
- Deploy to production on main branch
- Notify on build failures

**Launch Checklist**:
- [x] All tests passing
- [x] Production build successful
- [x] App deployed and accessible
- [x] Documentation complete
- [x] README.md includes live demo link
- [x] Bug reporting instructions clear

**Post-Launch Monitoring**:
- Monitor browser console errors (Sentry, LogRocket)
- Track user engagement (Google Analytics, session length)
- Collect user feedback (GitHub Issues, feedback form)
- Plan next iteration based on feedback

**Acceptance Criteria**:
- [x] Production build <2MB (optimized)
- [x] App deployed and accessible publicly
- [x] CI/CD pipeline running successfully
- [x] Documentation includes deployment guide
- [x] README.md updated with live demo link

**Estimated Time**: 10-15 hours

---

## Risk Mitigation

### Risk: Incorrect Poker Rules
**Impact**: High - Breaks core gameplay experience
**Mitigation**:
- Comprehensive test suite (200+ test cases)
- Manual verification against official poker rules
- Playtesting with experienced poker players
- Reference implementation: poker-evaluator library (Two Plus Two algorithm, actively maintained, 22M hands/sec)

### Risk: Poor Bot AI (Too Easy or Too Hard)
**Impact**: Medium - Reduces replayability and engagement
**Mitigation**:
- Bot vs bot simulation (1000 hands) to validate win rates
- Playtesting with real users (collect feedback on bot difficulty)
- Adjustable difficulty settings (Easy/Medium/Hard/Mixed)
- Iterative tuning (adjust bot strategy based on feedback)

### Risk: Performance Issues (Lag, Stuttering Animations)
**Impact**: Medium - Degrades user experience
**Mitigation**:
- Use GPU-accelerated animations (transform, opacity)
- Profile with Chrome DevTools (identify bottlenecks)
- Optimize React renders (React.memo, useMemo, useCallback)
- Test on target hardware (5-year-old laptops)

### Risk: Scope Creep (Adding Multiplayer, Tournaments, etc.)
**Impact**: High - Delays launch, increases complexity
**Mitigation**:
- Strict adherence to constitution (standalone game only)
- Out-of-scope list documented in spec.md
- Defer all non-MVP features to post-launch

### Risk: Cross-Browser Compatibility Issues
**Impact**: Medium - Excludes users on certain browsers
**Mitigation**:
- Target modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+)
- Use standard web APIs (no experimental features)
- Test on all target browsers before launch
- Polyfills for minor compatibility issues

---

## Success Metrics

### Technical Metrics
- **Test Coverage**: ≥80% game logic, ≥60% UI
- **Performance**: <100ms action response, 60fps animations
- **Build Size**: <2MB optimized production bundle
- **Load Time**: Time to Interactive <3 seconds

### Gameplay Metrics
- **Rule Correctness**: 100% accurate poker rules (verified by tests)
- **Bot Balance**: Medium bots win 45-50% vs Easy bots in simulation
- **Session Length**: Average >15 minutes (measured in playtesting)

### User Experience Metrics
- **UI Clarity**: 95%+ playtesters understand interface without explanation
- **Accessibility**: WCAG AA compliant (verified by automated testing)
- **Cross-Browser**: Works on 100% of target browsers

---

## Timeline Summary

| Phase | Duration | Hours | Deliverable |
|-------|----------|-------|-------------|
| Phase 0 | N/A | 8h | Research & technology decisions |
| Phase 1 | Week 1 | 10h | Foundation & setup (project init, build config) |
| Phase 2 | Week 2-3 | 45h | Game logic core (poker rules, hand eval, pots) |
| Phase 3 | Week 4 | 28h | Bot AI (Easy/Medium/Hard strategies) |
| Phase 4 | Week 5 | 33h | UI components (table, cards, buttons, animations) |
| Phase 5 | Week 6 | 28h | Integration & polish (connect UI to logic) |
| Phase 6 | Week 7 | 23h | Testing & refinement (playtesting, bug fixes) |
| Phase 7 | Week 8 | 13h | Deployment & launch (production build, CI/CD) |
| **Total** | **8 weeks** | **188h** | **Complete standalone poker game** |

**Assumptions**:
- Solo developer working 20-30 hours/week
- Experienced with React, TypeScript, and poker rules
- No major blockers or scope changes

---

## Next Steps

1. **Review & Approve**: Review this plan with stakeholders (if any)
2. **Set Up Project**: Execute Phase 1 (foundation & setup)
3. **Begin Development**: Start Phase 2 (game logic core)
4. **Use SpecKit**: Run `/speckit.tasks` to generate detailed task breakdown

---

**Plan Version**: 2.0 (Modern Tech Stack Update)
**Last Updated**: 2025-11-17
**Status**: Ready for implementation
**Tech Stack**: React 18.3 + TypeScript 5.7 + Vite 6 + Vitest + shadcn/ui + Framer Motion + Zustand 5 + pnpm + Biome
**Hand Evaluator**: poker-evaluator (Sukhmai) - Native TypeScript, actively maintained (Aug 2025), 22M hands/sec
**Major Changes from v1.3**:
- Replaced Jest with Vitest (2-10x faster)
- Replaced ESLint+Prettier with Biome (97% faster)
- Replaced npm with pnpm (2-3x faster, disk efficient)
- Added shadcn/ui (saves ~20 hours of UI development)
- Added Framer Motion (declarative animations)
- Added Zod + React Hook Form (type-safe validation)
- Upgraded to Vite 6, TailwindCSS 4, TypeScript 5.7, Zustand 5
- **Estimated time saved: ~38 hours (~20% reduction)**
