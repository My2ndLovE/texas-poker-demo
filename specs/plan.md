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

### Technology Stack (2025 Modern Stack)

**Frontend Framework**: Next.js 15 (App Router)
- **Why**: Superior to vanilla React for production apps - built-in optimization, better DX
- **Static Export**: Fully client-side (no server) via `output: 'export'`
- **Performance**: Automatic code-splitting, image optimization, font optimization
- **Routing**: File-based routing (cleaner than React Router)
- **Developer Experience**: Fast Refresh, TypeScript integration, built-in linting

**Language**: TypeScript 5.x (Strict Mode)
- **Why**: Type safety critical for poker logic correctness
- **Strict**: No `any` types, complete type coverage
- **Interfaces**: Strong typing for game state, actions, bot decisions
- **Generics**: Reusable utility functions with type safety
- **Zod**: Runtime validation for game state (catch bugs early)

**State Management**: Zustand 4.x
- **Why**: Simpler than Redux, perfect for client-side state
- **Stores**: Separate stores for game state, UI state, settings
- **Persistence**: zustand/middleware for localStorage persistence
- **DevTools**: Redux DevTools integration for debugging

**UI Framework**: Tailwind CSS + shadcn/ui
- **Tailwind**: Utility-first CSS, rapid development
- **shadcn/ui**: High-quality, accessible components (built on Radix UI)
- **Components**: Button, Modal, Slider, Tooltip - copy/paste, fully customizable
- **Accessibility**: WCAG AA compliant out-of-box
- **Theme**: Dark mode support built-in

**Animations**: Framer Motion 11.x
- **Why**: Professional game animations (cards, chips, celebrations)
- **Physics**: Spring-based animations feel natural
- **Orchestration**: Sequence complex animations (deal cards → flip → slide chips)
- **Gestures**: Drag, swipe support (future mobile version)
- **Performance**: GPU-accelerated, 60fps

**Testing Framework**: Vitest + Playwright
- **Vitest**: Modern alternative to Jest - faster, better Vite integration
- **Playwright**: E2E testing (complete poker hands, cross-browser)
- **Coverage**: Target 80% for game logic, 60% for UI
- **Visual Testing**: Screenshot comparison for UI regression

**Hand Evaluation Library**: pokersolver (https://github.com/goldfire/pokersolver)
- **Why**: Battle-tested with 2,700+ weekly downloads, used by 1,100+ repos, proven reliability
- **Features**: 5-7 card evaluation, hand ranking, comparison, supports multiple game types
- **Integration**: Simple synchronous API, TypeScript types via @types/pokersolver
- **Performance**: 500k-1M hands/second (50-100x more than needed)
- **Adoption**: 414 GitHub stars, 7+ years production use, zero runtime dependencies
- **Stability**: Mature, stable API - poker hand evaluation is a solved problem

**Type Safety & Validation**: Zod 3.x
- **Why**: Runtime validation for game state, settings, actions
- **Safety**: Catch invalid states at runtime
- **TypeScript**: Infer types from schemas (DRY principle)
- **Error Messages**: User-friendly validation errors

**Icons**: Lucide React
- **Why**: Professional, tree-shakeable, 1000+ icons
- **Usage**: Suits (♠ ♥ ♦ ♣), actions (fold, raise, all-in), UI (settings, stats)
- **No Emojis**: Professional appearance, consistent design

**Localization**: react-i18next 14.x
- **Why**: Industry standard, supports plural forms, interpolation
- **Setup**: English default, infrastructure ready for Vietnamese, Thai, Chinese
- **Keys**: No hardcoded strings, all text via t('key') function

**Component Utilities**:
- **class-variance-authority (cva)**: Type-safe component variants
- **clsx**: Conditional className composition
- **tailwind-merge**: Merge Tailwind classes without conflicts

---

## Project Structure (Next.js 15)

```
texas-poker-game/
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Home page (main menu)
│   ├── game/
│   │   └── page.tsx                   # Game page (poker table)
│   ├── settings/
│   │   └── page.tsx                   # Settings page
│   ├── globals.css                    # Global styles (Tailwind)
│   └── providers.tsx                  # Client providers (Zustand, i18n)
│
├── components/                        # React components
│   ├── game/                          # Game-specific components
│   │   ├── poker-table.tsx            # Main table layout
│   │   ├── player-seat.tsx            # Individual player position
│   │   ├── community-cards.tsx        # Flop/turn/river cards
│   │   ├── pot-display.tsx            # Pot amount with chips visualization
│   │   ├── action-buttons.tsx         # Fold/Call/Raise buttons
│   │   ├── raise-slider.tsx           # Raise amount selector
│   │   ├── action-timer.tsx           # Countdown timer
│   │   ├── winner-announcement.tsx    # Winner celebration
│   │   ├── action-log.tsx             # Recent actions history
│   │   └── dealer-button.tsx          # Dealer indicator
│   ├── cards/
│   │   ├── playing-card.tsx           # Single card component
│   │   ├── card-back.tsx              # Face-down card
│   │   └── card-front.tsx             # Face-up card with suit/rank
│   ├── ui/                            # shadcn/ui components (copy/paste)
│   │   ├── button.tsx                 # Styled button (Radix)
│   │   ├── dialog.tsx                 # Modal/Dialog (Radix)
│   │   ├── slider.tsx                 # Range input (Radix)
│   │   ├── tooltip.tsx                # Hover tooltip (Radix)
│   │   ├── toast.tsx                  # Notification system (Radix)
│   │   └── ...                        # Other shadcn/ui components
│   └── layout/
│       ├── main-menu.tsx              # Start screen
│       ├── settings-panel.tsx         # Game settings
│       ├── stats-panel.tsx            # Session statistics
│       └── game-over-screen.tsx       # End game summary
│
├── lib/                               # Core logic (non-React)
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
│   │   │   ├── HandEvaluator.ts       # Wrapper for pokersolver library
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
│   ├── stores/                        # Zustand stores
│   │   ├── game-store.ts              # Game state (cards, pot, players, phase)
│   │   ├── settings-store.ts          # User settings (difficulty, chips, animations)
│   │   ├── ui-store.ts                # UI state (modals, dialogs, loading)
│   │   └── stats-store.ts             # Session statistics (hands played, win rate)
│   │
│   ├── schemas/                       # Zod validation schemas
│   │   ├── game-state.schema.ts       # Game state validation
│   │   ├── settings.schema.ts         # Settings validation
│   │   └── action.schema.ts           # Action validation
│   │
│   └── utils/                         # Shared utilities
│       ├── formatters.ts              # Format numbers, chips, percentages
│       ├── constants.ts               # Game constants (blind levels, timeouts)
│       ├── logger.ts                  # Console logging wrapper
│       ├── storage.ts                 # localStorage wrapper for settings
│       └── cn.ts                      # Tailwind class merge utility
│
├── hooks/                             # Custom React hooks
│   ├── use-game-state.ts              # Access game state from store
│   ├── use-game-actions.ts            # Dispatch game actions
│   ├── use-settings.ts                # Access/modify settings
│   ├── use-animation.ts               # Animation control (Framer Motion)
│   └── use-keyboard-shortcuts.ts      # Keyboard event handling
│
├── locales/                           # i18n resources
│   ├── i18n.ts                        # i18next configuration
│   ├── en/                            # English translations
│   │   ├── game.json                  # Game-related text
│   │   ├── ui.json                    # UI labels and buttons
│   │   └── errors.json                # Error messages
│   ├── vi/                            # Vietnamese (future)
│   └── th/                            # Thai (future)
│
├── public/                            # Static assets
│   ├── images/
│   │   ├── cards/                     # Card images (PNG/SVG)
│   │   ├── avatars/                   # Bot avatars
│   │   ├── chips/                     # Chip graphics
│   │   └── table/                     # Table textures
│   └── sounds/                        # Sound effects (optional)
│       ├── card-deal.mp3
│       ├── chip-slide.mp3
│       ├── win-celebration.mp3
│       └── timer-tick.mp3
│
├── __tests__/                         # Test files (Vitest + Playwright)
│   ├── unit/
│   │   ├── game-logic/                # Game engine tests
│   │   │   ├── hand-evaluator.test.ts # Hand ranking tests (200+ cases)
│   │   │   ├── pot-calculator.test.ts # Side pot tests (50+ edge cases)
│   │   │   ├── betting-rules.test.ts  # Min raise, all-in validation
│   │   │   └── game-state-machine.test.ts # Phase transitions
│   │   └── bot-ai/                    # Bot AI tests
│   │       ├── easy-strategy.test.ts  # Verify Easy bot behavior
│   │       ├── medium-strategy.test.ts # Verify Medium bot behavior
│   │       └── hard-strategy.test.ts  # Verify Hard bot behavior
│   ├── integration/
│   │   ├── complete-hand.test.ts      # Full hand flow (preflop→showdown)
│   │   ├── multiplayer-all-in.test.ts # 3+ player all-in scenarios
│   │   ├── heads-up-rules.test.ts     # 2-player special rules
│   │   └── bot-vs-bot.test.ts         # Bot-only games (validate balance)
│   ├── e2e/                           # Playwright E2E tests
│   │   ├── complete-game.spec.ts      # Play complete game
│   │   ├── settings.spec.ts           # Test settings changes
│   │   └── keyboard-shortcuts.spec.ts # Test keyboard controls
│   └── components/
│       ├── poker-table.test.tsx       # Table rendering tests
│       ├── action-buttons.test.tsx    # Button interactions
│       └── raise-slider.test.tsx      # Slider validation
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
│       └── deploy.yml                 # Deploy to Vercel/Cloudflare
│
├── package.json                       # NPM dependencies and scripts
├── tsconfig.json                      # TypeScript configuration (strict mode)
├── next.config.js                     # Next.js configuration (static export)
├── tailwind.config.ts                 # Tailwind CSS configuration
├── components.json                    # shadcn/ui configuration
├── vitest.config.ts                   # Vitest test configuration
├── playwright.config.ts               # Playwright E2E configuration
├── .eslintrc.json                     # ESLint rules (Next.js defaults)
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

**Decision**: Use **pokersolver** (https://github.com/goldfire/pokersolver)

**Rationale**:
- **Industry standard**: 2,700+ weekly downloads, used by 1,100+ repositories
- **Battle-tested**: 414 GitHub stars, 7+ years of production use validates reliability
- **Proven stability**: If there were bugs, they'd be known after 7 years - it just works
- **Large community**: More Stack Overflow answers, tutorials, and support available
- **Zero dependencies**: Lightweight, no supply chain risk
- **Simple API**: Clean, synchronous evaluation - no complexity
- **TypeScript support**: Official @types/pokersolver package provides full type safety
- **Mature codebase**: Poker hand evaluation is a solved problem - doesn't need updates

**Integration**:
```typescript
// src/game-logic/evaluation/HandEvaluator.ts
import { Hand } from 'pokersolver';

export class HandEvaluator {
  evaluateHand(cards: Card[]): HandResult {
    // Convert Card[] to pokersolver format (e.g., "As", "Kh")
    const cardStrings = cards.map(c => `${c.rank}${c.suit.toLowerCase()}`);

    // Evaluate best 5-card hand from 7 cards
    const hand = Hand.solve(cardStrings);

    return {
      rank: this.mapRankToEnum(hand.rank),
      description: hand.descr,
      cards: hand.cards,
      value: hand.rank
    };
  }

  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    // Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
    const h1 = Hand.solve(hand1Cards.map(c => `${c.rank}${c.suit.toLowerCase()}`));
    const h2 = Hand.solve(hand2Cards.map(c => `${c.rank}${c.suit.toLowerCase()}`));

    const winners = Hand.winners([h1, h2]);
    if (winners.length === 2) return 0; // Tie
    return winners[0] === h1 ? 1 : -1;
  }

  private mapRankToEnum(rank: number): HandRank {
    // Map pokersolver rank to internal enum
    // 0 = High Card, 1 = Pair, ..., 9 = Straight Flush
    return rank as HandRank;
  }
}
```

**Advantages**:
- **Reliability over novelty**: Battle-tested by 1,100+ repos means all edge cases found
- **Community support**: 2,700 weekly downloads = help available when needed
- **Stable API**: Won't break on updates, predictable behavior
- **Production-proven**: Used in real poker applications for years
- **TypeScript DX**: @types package provides excellent IDE support and type safety
- **Zero risk**: Mature library with known behavior - no surprises

**Performance Reality Check**:
- pokersolver: ~500k-1M hands/second (more than sufficient)
- Your use case: ~10,000 evaluations/second max (200 players, peak load)
- Headroom: 50-100x more performance than needed
- Conclusion: Performance is NOT a bottleneck, reliability and community support matter more

**Why "Not Actively Maintained" is OK**:
- Poker hand evaluation rules **never change** - it's a solved algorithm
- No security risks (pure computation, no network/IO, no dependencies)
- All edge cases already discovered after 7 years
- "Stable" is better than "actively updated" for mature algorithms
- Works perfectly as-is - doesn't need updates

**Alternatives Considered**:
- **poker-evaluator (Sukhmai fork)**: Native TypeScript BUT only 298 downloads/week (9x less), 11 stars (37x less), very small community, higher risk of abandonment
- **PokerHandEvaluator (WebAssembly)**: Overkill performance, unnecessary complexity, async overhead
- **Original poker-evaluator (chenosaurus)**: Abandoned since 2017, unmaintained
- **phe (JS port)**: Low adoption, unmaintained, 3x slower than C version

**Final Decision**: **Reliability > TypeScript purity**. For a production poker game supporting 200 players, battle-tested stability and large community support outweigh the minor convenience of native TypeScript.

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

**Approach**: Framer Motion for professional game animations

**Card Dealing Animation**:
```typescript
// components/cards/playing-card.tsx
import { motion } from 'framer-motion';

interface PlayingCardProps {
  card: Card;
  position: { x: number; y: number };
  isAnimating?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  position,
  isAnimating
}) => {
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0.5, opacity: 0 }}
      animate={{
        x: position.x,
        y: position.y,
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      }}
      className="card"
    >
      {/* Card content */}
    </motion.div>
  );
};
```

**Chip Movement Animation**:
```typescript
// components/game/pot-display.tsx
import { motion, useAnimate, stagger } from 'framer-motion';

export const PotDisplay: React.FC = () => {
  const [scope, animate] = useAnimate();

  const animateChipsToPot = async (chipAmount: number) => {
    await animate(
      '.chip',
      {
        x: [0, 200],
        y: [0, -50],
        opacity: [1, 1, 0.8],
      },
      {
        duration: 0.4,
        ease: 'easeInOut',
        delay: stagger(0.05) // Chips animate one after another
      }
    );
  };

  return (
    <div ref={scope} className="pot-container">
      {/* Pot content */}
    </div>
  );
};
```

**Winner Celebration Animation**:
```typescript
// components/game/winner-announcement.tsx
import { motion } from 'framer-motion';

export const WinnerAnnouncement: React.FC<{ winner: Player }> = ({ winner }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25
      }}
      className="winner-banner"
    >
      <motion.h2
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {winner.name} wins!
      </motion.h2>
    </motion.div>
  );
};
```

**Animation Orchestration** (Sequential animations):
```typescript
// hooks/use-animation.ts
import { useAnimate } from 'framer-motion';

export const useGameAnimation = () => {
  const [scope, animate] = useAnimate();

  const playHandSequence = async () => {
    // 1. Deal cards to each player
    await animate('.player-card', { opacity: [0, 1] }, { delay: stagger(0.1) });

    // 2. Reveal flop
    await animate('.flop-card', { rotateY: [180, 0] }, { delay: stagger(0.1) });

    // 3. Chips to pot
    await animate('.chip', { x: [0, 200] }, { duration: 0.3 });
  };

  return { scope, playHandSequence };
};
```

**Animation Settings**:
- **Off**: `animate={false}` - instant updates, no transitions
- **Fast**: `duration: 0.2` - 2.5x speed
- **Normal**: `duration: 0.4-0.5` - default smooth animations
- **Slow**: `duration: 0.8-1.0` - cinematic feel

**Performance Optimizations**:
- Framer Motion uses GPU-accelerated transforms
- `layout` prop for automatic layout animations
- `layoutId` for shared element transitions
- `AnimatePresence` for exit animations
- `useReducedMotion` hook respects OS accessibility settings

---

### 0.6 Testing Strategy

**Unit Tests** (Vitest - game logic):
- Hand evaluation: 200+ test cases (all hand types, tie-breaking, kickers)
- Pot calculation: 50+ side pot scenarios (2-9 players, various all-in amounts)
- Betting rules: Min raise validation, all-in edge cases
- Bot AI: Decision-making for each difficulty level

**Integration Tests** (full game flows):
- Complete hand: Preflop → flop → turn → river → showdown
- Heads-up rules: Special blind posting, action order
- Multiple all-ins: Correct side pot creation and distribution
- Tie scenarios: Split pots, odd chip distribution

**Component Tests** (React Testing Library):
- Action buttons: Click handlers, disabled states
- Raise slider: Min/max validation, quick-bet buttons
- Timer: Countdown, auto-action on expiration

**E2E Tests** (Playwright):
- Complete game flow: Start game → play hands → win/lose
- Settings changes: Modify settings, verify applied
- Keyboard shortcuts: Test all keyboard controls
- Cross-browser: Chrome, Firefox, Safari

**Test Framework Setup**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      include: [
        'lib/game-logic/**/*.ts',
        'lib/bot-ai/**/*.ts',
        'components/**/*.tsx',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
      ],
    },
  },
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**TDD Workflow**:
1. **RED**: Write failing test
2. **GREEN**: Write minimum code to pass
3. **REFACTOR**: Clean up while keeping tests green

---

## Phase 1: Foundation & Setup (Week 1)

### Goals
- Project initialized with Next.js 15 and all dependencies
- Build system working (Next.js + TypeScript + React)
- Test infrastructure ready (Vitest + Playwright)
- shadcn/ui components installed
- Basic project structure created
- Linting and formatting configured
- Development environment verified

### Deliverables
1. **Project Initialization**
   - Run `npx create-next-app@latest texas-poker-game --typescript --tailwind --app --src-dir=false`
   - Configure Next.js for static export in next.config.js
   - Install Zustand: `npm install zustand`
   - Install Framer Motion: `npm install framer-motion`
   - Install Lucide React: `npm install lucide-react`
   - Install pokersolver: `npm install pokersolver @types/pokersolver`
   - Install i18next: `npm install react-i18next i18next`
   - Install Zod: `npm install zod`
   - Install shadcn/ui: `npx shadcn-ui@latest init`
   - Install utilities: `npm install clsx tailwind-merge class-variance-authority`

2. **shadcn/ui Components**
   - Install Button: `npx shadcn-ui@latest add button`
   - Install Dialog: `npx shadcn-ui@latest add dialog`
   - Install Slider: `npx shadcn-ui@latest add slider`
   - Install Tooltip: `npx shadcn-ui@latest add tooltip`
   - Install Toast: `npx shadcn-ui@latest add toast`
   - Install Card: `npx shadcn-ui@latest add card`
   - Install Tabs: `npx shadcn-ui@latest add tabs`

3. **Test Infrastructure**
   - Install Vitest: `npm install -D vitest @vitest/ui`
   - Install Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`
   - Install Playwright: `npm install -D @playwright/test`
   - Configure vitest.config.ts with coverage thresholds
   - Configure playwright.config.ts for E2E tests
   - Create test utilities (setup file, custom matchers)

4. **Build Configuration**
   - Configure next.config.js (static export, image optimization)
   - Configure tsconfig.json (strict mode, paths, Next.js settings)
   - Configure Tailwind CSS (tailwind.config.ts, extend theme)
   - Add custom fonts (Google Fonts via next/font)

5. **Code Quality Tools**
   - ESLint comes with Next.js (extend with stricter rules)
   - Install Prettier: `npm install -D prettier prettier-plugin-tailwindcss`
   - Configure .prettierrc (formatting rules, Tailwind sorting)
   - Add pre-commit hooks: `npm install -D husky lint-staged`

6. **Project Structure**
   - Create folder structure (app/, components/, lib/, hooks/, __tests__/)
   - Create placeholder files with TypeScript interfaces
   - Set up barrel exports where needed (index.ts files)
   - Add cn() utility for Tailwind class merging

7. **Documentation**
   - Write README.md (project overview, setup, scripts)
   - Write ARCHITECTURE.md (high-level design)
   - Write CLAUDE.md (instructions for Claude Code)
   - Add inline code comments for complex logic

8. **Verification**
   - Run `npm run dev` - Next.js dev server starts successfully
   - Run `npm run build` - static export succeeds
   - Run `npm test` - Vitest test suite runs (even if empty)
   - Run `npm run test:e2e` - Playwright E2E suite runs
   - Run `npm run lint` - no linting errors
   - Verify Fast Refresh (edit component, see instant update)

**Acceptance Criteria**:
- [x] Project builds without errors in both dev and production modes
- [x] Test suite runs and reports coverage (even if 0%)
- [x] ESLint and Prettier configured and working
- [x] Folder structure matches plan.md specification
- [x] README.md provides clear setup instructions
- [x] Git repository initialized with .gitignore

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
- [TDD] HandEvaluator service (wrapper for pokersolver with TypeScript types)
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
- Reference implementation: pokersolver library (battle-tested by 1,100+ repos, proven reliable, 7+ years production use)

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

**Plan Version**: 2.0 (Modern Stack 2025 - Next.js 15 + Framer Motion + Vitest)
**Last Updated**: 2025-11-17
**Status**: Ready for implementation
**Tech Stack**: Next.js 15, TypeScript 5, Zustand, Tailwind + shadcn/ui, Framer Motion, Vitest + Playwright, pokersolver
