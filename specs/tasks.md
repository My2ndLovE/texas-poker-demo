# Implementation Tasks: Standalone Texas Hold'em Poker Game

**Project**: Standalone Poker Game
**Created**: 2025-11-18
**Methodology**: TDD (Test-Driven Development - RED-GREEN-REFACTOR)

---

## Summary

**Total Tasks**: 187 tasks across 7 phases
**Timeline**: 6-8 weeks (solo developer, 20-30 hours/week)
**Total Estimated Hours**: 188 hours

---

## Task Breakdown by Phase

| Phase | Tasks | Hours | Description |
|-------|-------|-------|-------------|
| Phase 1 | 22 tasks | 10h | Foundation & Setup |
| Phase 2 | 62 tasks | 45h | Game Logic Core |
| Phase 3 | 32 tasks | 28h | Bot AI Implementation |
| Phase 4 | 35 tasks | 33h | UI Components |
| Phase 5 | 18 tasks | 28h | Integration & Polish |
| Phase 6 | 12 tasks | 23h | Testing & Refinement |
| Phase 7 | 6 tasks | 13h | Deployment & Launch |

---

## TDD Workflow (MANDATORY)

Every task marked with [TDD] MUST follow this cycle:

1. **RED**: Write failing test first
   ```bash
   npm run test:watch -- <test-file>.test.ts
   # Verify test FAILS with expected error message
   ```

2. **GREEN**: Write minimum code to make test pass
   ```bash
   npm run test:watch -- <test-file>.test.ts
   # Verify test PASSES
   ```

3. **REFACTOR**: Improve code while keeping tests green
   ```bash
   npm run test:cov
   # Verify coverage maintained/improved
   ```

---

## Phase 1: Foundation & Setup (Week 1)

**Goal**: Project initialized, build system working, test infrastructure ready
**Duration**: 10 hours

### Project Initialization (T001-T007)

- [ ] **T001** [1h] Initialize Vite project with React + TypeScript
  - Run `npm create vite@latest standalone-poker-game -- --template react-ts`
  - Verify dev server starts: `npm run dev`
  - Verify build succeeds: `npm run build`
  - **Acceptance**: Project builds without errors

- [ ] **T002** [1h] Install core dependencies
  - Install Zustand: `npm install zustand`
  - Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`
  - Install Lucide React: `npm install lucide-react`
  - Install pokersolver: `npm install pokersolver @types/pokersolver`
  - Install i18next: `npm install react-i18next i18next`
  - **Acceptance**: All dependencies installed, no conflicts

- [ ] **T003** [1h] Configure Tailwind CSS
  - Run `npx tailwindcss init -p`
  - Configure `tailwind.config.js` (content paths, theme)
  - Add Tailwind directives to `src/index.css`
  - Verify Tailwind classes work in component
  - **Acceptance**: Tailwind styling applied

- [ ] **T004** [1h] Install and configure Jest
  - Install Jest: `npm install -D jest ts-jest @types/jest`
  - Install React Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - Create `jest.config.js` with coverage thresholds (80% game logic)
  - Create `tests/setup.ts` (test utilities)
  - **Acceptance**: `npm test` runs successfully

- [ ] **T005** [0.5h] Configure TypeScript strict mode
  - Update `tsconfig.json`:
    - Enable `"strict": true`
    - Enable `"noImplicitAny": true`
    - Enable `"strictNullChecks": true`
    - Configure path aliases: `"@/*": ["./src/*"]`
  - **Acceptance**: TypeScript compiles with strict mode

- [ ] **T006** [1h] Install and configure ESLint + Prettier
  - Install ESLint: `npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react`
  - Install Prettier: `npm install -D prettier eslint-config-prettier`
  - Create `.eslintrc.js` (TypeScript + React rules)
  - Create `.prettierrc` (formatting rules)
  - Add `lint` and `format` scripts to `package.json`
  - **Acceptance**: `npm run lint` passes with zero errors

- [ ] **T007** [0.5h] Configure Vite build settings
  - Update `vite.config.ts`:
    - Add path alias resolution (`@` → `src`)
    - Configure build options (minify, sourcemap)
    - Add code-splitting configuration
  - **Acceptance**: Production build succeeds, bundle analyzed

### Project Structure (T008-T015)

- [ ] **T008** [1h] Create folder structure
  - Create all folders per `plan.md` structure:
    - `src/presentation/components/{game,cards,ui,layout}/`
    - `src/presentation/{pages,hooks,styles}/`
    - `src/game-logic/{engine,rules,evaluation,pot,deck,models,validators}/`
    - `src/bot-ai/{strategies,personality,decision,analysis}/`
    - `src/state-management/`
    - `src/utils/`
    - `src/localization/en/`
    - `tests/{unit,integration,components}/`
    - `docs/`
  - **Acceptance**: All folders created, structure matches plan

- [ ] **T009** [0.5h] Create TypeScript type definition files
  - Create `src/game-logic/models/Card.ts` (interface only)
  - Create `src/game-logic/models/Player.ts` (interface only)
  - Create `src/game-logic/models/GameState.ts` (interface only)
  - Create `src/game-logic/models/Action.ts` (interface only)
  - Create `src/game-logic/models/Pot.ts` (interface only)
  - **Acceptance**: All interfaces compile without errors

- [ ] **T010** [0.5h] Set up barrel exports
  - Create `src/game-logic/models/index.ts` (export all models)
  - Create `src/game-logic/index.ts` (export all modules)
  - Create `src/presentation/components/index.ts` (export all components)
  - Create `src/bot-ai/index.ts` (export all strategies)
  - **Acceptance**: Can import via barrel files

- [ ] **T011** [0.5h] Create constants file
  - Create `src/utils/constants.ts`:
    - Hand ranks enum
    - Card suits and ranks
    - Blind levels presets
    - Action types enum
    - Game phases enum
  - **Acceptance**: Constants used throughout codebase

- [ ] **T012** [0.5h] Set up localStorage wrapper
  - Create `src/utils/storage.ts`:
    - `saveSettings(settings: Settings): void`
    - `loadSettings(): Settings | null`
    - `clearSettings(): void`
  - Add error handling (quota exceeded)
  - **Acceptance**: Settings save/load works

- [ ] **T013** [0.5h] Configure i18next
  - Create `src/localization/i18n.ts` (i18next config)
  - Create `src/localization/en/game.json` (game translations)
  - Create `src/localization/en/ui.json` (UI translations)
  - Create `src/localization/en/errors.json` (error messages)
  - Initialize i18next in `src/main.tsx`
  - **Acceptance**: `t('game.key')` returns English text

- [ ] **T014** [0.5h] Create logger utility
  - Create `src/utils/logger.ts`:
    - `log(message: string, data?: any): void`
    - `error(message: string, error?: Error): void`
    - `debug(message: string, data?: any): void`
  - Disable in production (use Vite env)
  - **Acceptance**: Logs visible in dev, suppressed in prod

- [ ] **T015** [0.5h] Set up Git repository
  - Initialize Git: `git init`
  - Create `.gitignore` (node_modules, dist, coverage, .env)
  - Create initial commit: "chore: initialize project"
  - **Acceptance**: Git repository initialized

### Documentation (T016-T019)

- [ ] **T016** [0.5h] Write README.md
  - Project description
  - Features list
  - Setup instructions (`npm install`, `npm run dev`)
  - Available scripts (dev, build, test, lint)
  - Technology stack
  - License (MIT)
  - **Acceptance**: README comprehensive and clear

- [ ] **T017** [0.5h] Write CLAUDE.md
  - Project overview for Claude Code
  - Key principles (TDD, no emojis, localization)
  - File structure explanation
  - Common tasks (add feature, run tests)
  - **Acceptance**: Claude Code can understand project

- [ ] **T018** [0.5h] Write ARCHITECTURE.md
  - High-level architecture diagram
  - Module responsibilities
  - Data flow (user action → state → UI)
  - Technology choices rationale
  - **Acceptance**: Architecture documented

- [ ] **T019** [0.5h] Create DEVELOPMENT.md
  - How to add new bot strategy
  - How to add new poker rule
  - How to add new UI component
  - Testing guidelines
  - **Acceptance**: Development guide complete

### Verification (T020-T022)

- [ ] **T020** [0.5h] Verify build pipeline
  - Run `npm run dev` - dev server starts <1 second
  - Run `npm run build` - production build succeeds
  - Run `npm run preview` - preview production build
  - **Acceptance**: All scripts work without errors

- [ ] **T021** [0.5h] Verify testing pipeline
  - Run `npm test` - test runner works (even if no tests)
  - Run `npm run test:cov` - coverage report generated
  - Run `npm run test:watch` - watch mode works
  - **Acceptance**: Testing infrastructure functional

- [ ] **T022** [0.5h] Verify linting pipeline
  - Run `npm run lint` - ESLint checks code
  - Run `npm run format` - Prettier formats code
  - Fix any linting errors found
  - **Acceptance**: Code passes all linting rules

**Phase 1 Acceptance Criteria**:
- [x] Project builds successfully (dev and prod)
- [x] Test suite runs (Jest + React Testing Library)
- [x] Linting passes with zero errors
- [x] Folder structure matches plan
- [x] Documentation complete (README, CLAUDE, ARCHITECTURE)
- [x] Git repository initialized

---

## Phase 2: Game Logic Core (Week 2-3)

**Goal**: Implement complete poker rules, hand evaluation, pot calculation
**Duration**: 45 hours

### Deck & Cards (T023-T030) [8h]

- [ ] **T023** [TDD] [1h] Create Card model
  - **RED**: Write test `tests/unit/game-logic/Card.test.ts`
    - Test card creation (rank, suit)
    - Test toString() method
    - Test equality comparison
  - **GREEN**: Implement `src/game-logic/models/Card.ts`
  - **REFACTOR**: Clean up types
  - **Acceptance**: All card tests pass

- [ ] **T024** [TDD] [1h] Create Deck class
  - **RED**: Write test `tests/unit/game-logic/Deck.test.ts`
    - Test deck initialization (52 cards)
    - Test deck contains all cards (4 suits × 13 ranks)
  - **GREEN**: Implement `src/game-logic/deck/Deck.ts`
  - **REFACTOR**: Use constants for suits/ranks
  - **Acceptance**: Deck creates 52 unique cards

- [ ] **T025** [TDD] [2h] Implement Fisher-Yates shuffle
  - **RED**: Write test in `Deck.test.ts`
    - Test shuffle modifies deck order
    - Test shuffle randomness (Chi-square test with 10,000 shuffles)
  - **GREEN**: Implement `shuffle()` in Deck class
  - **REFACTOR**: Extract to CardShuffler service
  - **Acceptance**: Shuffle passes randomness test

- [ ] **T026** [TDD] [1h] Implement deal method
  - **RED**: Write test in `Deck.test.ts`
    - Test dealing reduces deck size
    - Test dealt cards are removed from deck
    - Test dealing when deck empty throws error
  - **GREEN**: Implement `deal(count: number): Card[]`
  - **REFACTOR**: Add validation
  - **Acceptance**: Deal works correctly

- [ ] **T027** [TDD] [1h] Implement burn method
  - **RED**: Write test in `Deck.test.ts`
    - Test burn removes one card
    - Test burned card not dealt later
  - **GREEN**: Implement `burn(): Card`
  - **REFACTOR**: Track burned cards
  - **Acceptance**: Burn works correctly

- [ ] **T028** [TDD] [1h] Implement reset method
  - **RED**: Write test in `Deck.test.ts`
    - Test reset restores 52 cards
    - Test reset shuffles deck
  - **GREEN**: Implement `reset(): void`
  - **REFACTOR**: Reuse initialization logic
  - **Acceptance**: Reset works correctly

- [ ] **T029** [0.5h] Add Card utility functions
  - Create `src/game-logic/deck/CardUtils.ts`
  - Implement `cardToString(card: Card): string` (e.g., "Ah", "Kd")
  - Implement `stringToCard(str: string): Card`
  - Add tests in `tests/unit/game-logic/CardUtils.test.ts`
  - **Acceptance**: Conversion functions work

- [ ] **T030** [0.5h] Refactor and verify deck module
  - Review all Deck tests (ensure 100% coverage)
  - Refactor duplicated code
  - Add JSDoc comments
  - **Acceptance**: Deck module complete, tested, documented

### Hand Evaluation (T031-T038) [10h]

- [ ] **T031** [TDD] [2h] Set up pokersolver wrapper
  - **RED**: Write test `tests/unit/game-logic/HandEvaluator.test.ts`
    - Test evaluating Royal Flush
    - Test evaluating High Card
  - **GREEN**: Create `src/game-logic/evaluation/HandEvaluator.ts`
    - Wrap pokersolver library
    - Convert Card[] to pokersolver format
    - Return HandResult interface
  - **REFACTOR**: Add type safety
  - **Acceptance**: Basic hand evaluation works

- [ ] **T032** [TDD] [3h] Test all 10 hand ranks
  - **RED**: Write tests for all hand types (100+ test cases):
    - Royal Flush (10 cases)
    - Straight Flush (10 cases)
    - Four of a Kind (10 cases)
    - Full House (10 cases)
    - Flush (10 cases)
    - Straight (15 cases, including wheel: A-2-3-4-5)
    - Three of a Kind (10 cases)
    - Two Pair (10 cases)
    - One Pair (10 cases)
    - High Card (10 cases)
  - **GREEN**: Verify pokersolver handles all correctly
  - **REFACTOR**: Create test data generator
  - **Acceptance**: All 100+ hand tests pass

- [ ] **T033** [TDD] [2h] Test tie-breaking and kickers
  - **RED**: Write tests (50+ test cases):
    - Same pair, different kickers
    - Same two pair, kicker comparison
    - Same straight, different high cards
    - Same flush, kicker comparison
    - Full house tie-breaking
  - **GREEN**: Verify pokersolver tie-breaking
  - **REFACTOR**: Organize test cases
  - **Acceptance**: Tie-breaking works correctly

- [ ] **T034** [TDD] [1h] Implement HandComparator
  - **RED**: Write test `tests/unit/game-logic/HandComparator.test.ts`
    - Test comparing Royal Flush vs Straight Flush (Royal wins)
    - Test comparing identical hands (tie)
    - Test all hand rank combinations (45 combinations)
  - **GREEN**: Implement `src/game-logic/evaluation/HandComparator.ts`
    - `compareHands(hand1, hand2): number` (returns 1, 0, -1)
  - **REFACTOR**: Use pokersolver winners function
  - **Acceptance**: Hand comparison accurate

- [ ] **T035** [TDD] [1h] Implement BestHandFinder
  - **RED**: Write test `tests/unit/game-logic/BestHandFinder.test.ts`
    - Test finding best 5-card hand from 7 cards
    - Test edge cases (2 possible straights, choose higher)
  - **GREEN**: Implement `src/game-logic/evaluation/BestHandFinder.ts`
    - `findBestHand(cards: Card[]): HandResult`
  - **REFACTOR**: Delegate to pokersolver
  - **Acceptance**: Best hand identified correctly

- [ ] **T036** [0.5h] Create HandResult interface
  - Create `src/game-logic/models/Hand.ts`:
    - `interface HandResult { rank, description, cards, value }`
  - Add HandRank enum
  - **Acceptance**: Type-safe hand results

- [ ] **T037** [0.5h] Add hand description formatter
  - Create `src/utils/formatters.ts`:
    - `formatHandDescription(hand: HandResult): string`
    - Examples: "Royal Flush", "Full House, Kings over Tens"
  - Add tests
  - **Acceptance**: Human-readable hand descriptions

- [ ] **T038** [1h] Refactor and verify hand evaluation module
  - Review all tests (ensure 100% coverage)
  - Refactor duplicated code
  - Add JSDoc comments
  - Run performance benchmark (1000 evaluations <100ms)
  - **Acceptance**: Hand evaluation module complete

### Pot Calculation (T039-T046) [8h]

- [ ] **T039** [TDD] [2h] Implement basic pot calculation
  - **RED**: Write test `tests/unit/game-logic/PotCalculator.test.ts`
    - Test main pot (no all-ins): 3 players bet $50 each = $150 pot
    - Test pot with folds: 5 players, 2 fold, pot = bets from 3 remaining
  - **GREEN**: Implement `src/game-logic/pot/PotCalculator.ts`
    - `calculatePot(players: Player[]): number`
  - **REFACTOR**: Extract to pure function
  - **Acceptance**: Basic pot calculation works

- [ ] **T040** [TDD] [3h] Implement side pot calculation
  - **RED**: Write tests (30+ scenarios):
    - 2 players, 1 all-in: main pot only
    - 3 players, 2 different all-ins: main pot + 1 side pot
    - 3 players, 3 different all-ins: main pot + 2 side pots
    - 4 players, various all-in combinations
    - Edge case: 9 players, all different all-in amounts
  - **GREEN**: Implement side pot algorithm (per `plan.md`)
    - Sort players by bet amount
    - Calculate pots iteratively
    - Track eligible players for each pot
  - **REFACTOR**: Optimize algorithm
  - **Acceptance**: All side pot tests pass

- [ ] **T041** [TDD] [1h] Test odd chip distribution
  - **RED**: Write tests:
    - Pot = $101, split between 2 players → $50, $51
    - Odd chip goes to player closest to dealer button (clockwise)
  - **GREEN**: Implement `src/game-logic/pot/OddChipHandler.ts`
    - `distributeOddChips(pot: number, winners: Player[], dealerIndex: number): number[]`
  - **REFACTOR**: Add position calculation
  - **Acceptance**: Odd chips distributed correctly

- [ ] **T042** [TDD] [1h] Implement PotDistributor
  - **RED**: Write test `tests/unit/game-logic/PotDistributor.test.ts`
    - Test awarding main pot to single winner
    - Test splitting main pot between tied winners
    - Test awarding side pots to eligible winners
    - Test different winners for main pot and side pots
  - **GREEN**: Implement `src/game-logic/pot/PotDistributor.ts`
    - `distributePots(pots: Pot[], winners: Player[]): void`
  - **REFACTOR**: Handle edge cases
  - **Acceptance**: Pot distribution correct

- [ ] **T043** [0.5h] Create Pot models
  - Create `src/game-logic/models/Pot.ts`:
    - `interface Pot { amount, eligiblePlayerIds }`
    - `interface PotStructure { mainPot, sidePots, totalPot }`
  - **Acceptance**: Type-safe pot structures

- [ ] **T044** [0.5h] Add pot formatting utilities
  - Add to `src/utils/formatters.ts`:
    - `formatChips(amount: number): string` (e.g., "1,250")
    - `formatPot(pot: number): string` (e.g., "Pot: $1,250")
  - Add tests
  - **Acceptance**: Pot displayed in human-readable format

- [ ] **T045** [0.5h] Validate pot conservation
  - Add pot validation test:
    - Total chips before hand = total chips after hand
    - Sum of all bets = sum of all pots
  - Add assertion in PotCalculator
  - **Acceptance**: Chips never created or destroyed

- [ ] **T046** [1h] Refactor and verify pot module
  - Review all pot tests (50+ cases)
  - Ensure 100% code coverage
  - Refactor duplicated code
  - Add JSDoc comments
  - **Acceptance**: Pot module complete and tested

### Betting Rules (T047-T054) [8h]

- [ ] **T047** [TDD] [2h] Implement betting action validation
  - **RED**: Write test `tests/unit/game-logic/BettingRules.test.ts`
    - Test fold always valid
    - Test check valid only if no bet exists
    - Test call valid only if bet exists
    - Test raise requires matching current bet + additional
    - Test all-in always valid
  - **GREEN**: Implement `src/game-logic/rules/BettingRules.ts`
    - `isValidAction(action: Action, gameState: GameState, playerId: string): boolean`
  - **REFACTOR**: Extract validation per action type
  - **Acceptance**: Basic action validation works

- [ ] **T048** [TDD] [2h] Implement minimum raise validation
  - **RED**: Write tests (20+ cases):
    - First raise: must be ≥2× big blind
    - Re-raise: must be ≥2× previous raise
    - Example: bet $10, next raise must be ≥$20 (total)
    - Example: bet $10, raise to $30, next re-raise must be ≥$50 (total)
  - **GREEN**: Implement min raise calculation
    - `calculateMinRaise(gameState: GameState): number`
  - **REFACTOR**: Handle edge cases
  - **Acceptance**: Min raise validation correct

- [ ] **T049** [TDD] [2h] Implement all-in rules
  - **RED**: Write tests (15+ cases):
    - All-in with full stack always valid
    - All-in < min raise doesn't reopen betting for players who already acted
    - All-in ≥ min raise reopens betting
    - All-in with insufficient chips for blind posts partial blind
  - **GREEN**: Implement all-in validation
  - **REFACTOR**: Add reopensBetting flag
  - **Acceptance**: All-in rules correct

- [ ] **T050** [TDD] [1h] Implement bet amount validation
  - **RED**: Write tests:
    - Cannot bet more than stack
    - Cannot bet negative amount
    - Cannot bet fractional chips (if using integer chips)
  - **GREEN**: Implement `validateBetAmount(amount: number, stack: number): boolean`
  - **REFACTOR**: Add clear error messages
  - **Acceptance**: Bet amount validation works

- [ ] **T051** [TDD] [0.5h] Create Action models
  - Create `src/game-logic/models/Action.ts`:
    - `type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin'`
    - `interface Action { type, amount, playerId, timestamp }`
  - **Acceptance**: Type-safe actions

- [ ] **T052** [TDD] [0.5h] Implement ActionValidator service
  - **RED**: Write test `tests/unit/game-logic/ActionValidator.test.ts`
  - **GREEN**: Create `src/game-logic/validators/ActionValidator.ts`
    - Wrap BettingRules
    - Return validation result with error message
  - **REFACTOR**: Add detailed error messages
  - **Acceptance**: Validation service works

- [ ] **T053** [0.5h] Add betting action utilities
  - Create `src/utils/bettingUtils.ts`:
    - `getValidActions(gameState: GameState, playerId: string): ActionType[]`
    - Returns array of valid actions for UI
  - Add tests
  - **Acceptance**: Valid actions computed correctly

- [ ] **T054** [1h] Refactor and verify betting rules module
  - Review all betting tests (40+ cases)
  - Ensure 100% code coverage
  - Refactor duplicated code
  - Add JSDoc comments
  - **Acceptance**: Betting rules module complete

### Blind Posting (T055-T060) [5h]

- [ ] **T055** [TDD] [2h] Implement position calculation
  - **RED**: Write test `tests/unit/game-logic/PositionRules.test.ts`
    - Test dealer position
    - Test small blind position (left of dealer)
    - Test big blind position (left of SB)
    - Test Under The Gun (left of BB)
    - Test first-to-act post-flop (first active left of dealer)
  - **GREEN**: Implement `src/game-logic/rules/PositionRules.ts`
    - `getSmallBlindPosition(dealerIndex: number, numPlayers: number): number`
    - `getBigBlindPosition(dealerIndex: number, numPlayers: number): number`
    - `getUTGPosition(dealerIndex: number, numPlayers: number): number`
    - `getFirstToActPostFlop(dealerIndex: number, players: Player[]): number`
  - **REFACTOR**: Handle eliminated players (skip empty seats)
  - **Acceptance**: Position calculation correct

- [ ] **T056** [TDD] [1h] Implement heads-up special rules
  - **RED**: Write test in `PositionRules.test.ts`
    - Test dealer = small blind in heads-up
    - Test non-dealer = big blind in heads-up
    - Test dealer acts first preflop, last post-flop
  - **GREEN**: Update position functions for heads-up
  - **REFACTOR**: Extract heads-up logic
  - **Acceptance**: Heads-up rules correct

- [ ] **T057** [TDD] [1h] Implement blind posting
  - **RED**: Write test `tests/unit/game-logic/BlindRules.test.ts`
    - Test posting small blind deducts from stack
    - Test posting big blind deducts from stack
    - Test blinds added to pot
  - **GREEN**: Implement `src/game-logic/rules/BlindRules.ts`
    - `postSmallBlind(player: Player, amount: number): void`
    - `postBigBlind(player: Player, amount: number): void`
  - **REFACTOR**: Update player state and pot
  - **Acceptance**: Blind posting works

- [ ] **T058** [TDD] [0.5h] Handle insufficient chips for blind
  - **RED**: Write test in `BlindRules.test.ts`
    - Test player with $5 posts $10 blind → posts $5, goes all-in
    - Test all-in blind player remains in hand
  - **GREEN**: Implement partial blind logic
  - **REFACTOR**: Mark player as all-in
  - **Acceptance**: Partial blind works

- [ ] **T059** [0.5h] Create Position models
  - Create `src/game-logic/models/Position.ts`:
    - `enum Position { Dealer, SmallBlind, BigBlind, UTG, EarlyPosition, MiddlePosition, LatePosition }`
  - Add position name formatter
  - **Acceptance**: Type-safe positions

- [ ] **T060** [1h] Refactor and verify blind module
  - Review all position/blind tests
  - Ensure 100% code coverage
  - Add JSDoc comments
  - **Acceptance**: Blind posting module complete

### Game State Machine (T061-T068) [12h]

- [ ] **T061** [TDD] [2h] Create GameState model
  - Create `src/game-logic/models/GameState.ts`:
    - Complete interface (players, pot, phase, currentPlayerIndex, etc.)
  - Add initial state generator
  - Add state validator (consistency checks)
  - **Acceptance**: Type-safe game state

- [ ] **T062** [TDD] [3h] Implement phase transitions
  - **RED**: Write test `tests/unit/game-logic/GameStateMachine.test.ts`
    - Test preflop → flop (burn 1, deal 3)
    - Test flop → turn (burn 1, deal 1)
    - Test turn → river (burn 1, deal 1)
    - Test river → showdown
    - Test showdown → hand-complete
  - **GREEN**: Implement `src/game-logic/engine/GameStateMachine.ts`
    - `advancePhase(state: GameState): GameState`
  - **REFACTOR**: Extract phase transition logic
  - **Acceptance**: Phase transitions correct

- [ ] **T063** [TDD] [2h] Implement betting round completion detection
  - **RED**: Write tests (15+ cases):
    - All players acted and bets equal → round complete
    - Not all players acted yet → round continues
    - Bets not equal → round continues
    - Only 1 player active (all others folded) → round complete, hand ends
    - All players all-in → round complete, fast-forward to showdown
  - **GREEN**: Implement `src/game-logic/engine/BettingRoundManager.ts`
    - `isBettingRoundComplete(state: GameState): boolean`
  - **REFACTOR**: Handle edge cases
  - **Acceptance**: Betting round detection correct

- [ ] **T064** [TDD] [2h] Implement next player calculation
  - **RED**: Write tests:
    - Current player → next active player clockwise
    - Skip folded players
    - Skip all-in players
    - Wrap around table (player 8 → player 0)
  - **GREEN**: Implement in GameStateMachine
    - `getNextPlayerToAct(state: GameState): number`
  - **REFACTOR**: Handle eliminated players
  - **Acceptance**: Next player calculation correct

- [ ] **T065** [TDD] [1h] Implement ActionProcessor
  - **RED**: Write test `tests/unit/game-logic/ActionProcessor.test.ts`
    - Test applying fold action
    - Test applying call action
    - Test applying raise action
  - **GREEN**: Implement `src/game-logic/engine/ActionProcessor.ts`
    - `applyAction(state: GameState, action: Action): GameState`
  - **REFACTOR**: Use immutable updates
  - **Acceptance**: Actions applied correctly

- [ ] **T066** [TDD] [1h] Implement hand completion
  - **RED**: Write test `tests/unit/game-logic/HandCompletionHandler.test.ts`
    - Test awarding pot to winner
    - Test updating player stacks
    - Test rotating dealer button
    - Test eliminating players with 0 chips
  - **GREEN**: Implement `src/game-logic/engine/HandCompletionHandler.ts`
    - `completeHand(state: GameState, winners: Player[]): GameState`
  - **REFACTOR**: Clean up state
  - **Acceptance**: Hand completion works

- [ ] **T067** [0.5h] Add state consistency validation
  - Create `src/game-logic/validators/StateValidator.ts`:
    - Validate pot = sum of all bets
    - Validate no duplicate cards
    - Validate stacks ≥ 0
  - Add assertions in GameStateMachine
  - **Acceptance**: Invalid states caught early

- [ ] **T068** [1h] Refactor and verify state machine module
  - Review all state machine tests (30+ cases)
  - Ensure 100% code coverage
  - Add JSDoc comments
  - **Acceptance**: State machine module complete

### Integration Tests (T069-T075) [12h]

- [ ] **T069** [TDD] [4h] Test complete 6-player hand
  - **RED**: Write test `tests/integration/CompleteHand.test.ts`
    - Initialize game (6 players, 1000 chips each)
    - Post blinds ($5/$10)
    - Deal hole cards
    - Preflop betting (UTG folds, 3 players call, 1 raises, 2 call)
    - Flop dealt (burn, 3 cards), betting (check, bet, call, fold)
    - Turn dealt (burn, 1 card), betting (check, bet, call)
    - River dealt (burn, 1 card), betting (check, bet, call)
    - Showdown (compare hands, award pot)
    - Verify pot distributed correctly
    - Verify dealer button rotated
  - **GREEN**: Integrate all modules (Deck, HandEvaluator, PotCalculator, GameStateMachine)
  - **REFACTOR**: Extract test utilities
  - **Acceptance**: Complete hand works end-to-end

- [ ] **T070** [TDD] [2h] Test heads-up game
  - **RED**: Write test `tests/integration/HeadsUp.test.ts`
    - Initialize 2-player game
    - Verify dealer = SB, opponent = BB
    - Verify dealer acts first preflop
    - Verify dealer acts last post-flop
    - Play complete hand
  - **GREEN**: Verify all modules handle heads-up
  - **REFACTOR**: Reuse test utilities
  - **Acceptance**: Heads-up game works correctly

- [ ] **T071** [TDD] [2h] Test multi-player all-in
  - **RED**: Write test `tests/integration/MultiplayerAllIn.test.ts`
    - Initialize game, 3 players go all-in with different amounts ($25, $75, $100)
    - Verify main pot and 2 side pots created
    - Play to showdown
    - Verify pots awarded to correct players
  - **GREEN**: Integrate side pot calculation with hand evaluation
  - **REFACTOR**: Test various all-in scenarios
  - **Acceptance**: Multi-player all-in works

- [ ] **T072** [TDD] [1h] Test all fold except one
  - **RED**: Write test `tests/integration/AllFoldExceptOne.test.ts`
    - Initialize game, 5 players fold preflop
    - Verify remaining player wins immediately
    - Verify cards not revealed
    - Verify pot awarded without showdown
  - **GREEN**: Integrate early hand termination
  - **REFACTOR**: Test at different phases (preflop, flop, turn, river)
  - **Acceptance**: Early termination works

- [ ] **T073** [TDD] [1h] Test all players all-in
  - **RED**: Write test `tests/integration/AllAllIn.test.ts`
    - Initialize game, all players go all-in
    - Verify no more betting rounds
    - Fast-forward to showdown (deal flop, turn, river without betting)
    - Award pots
  - **GREEN**: Integrate fast-forward logic
  - **REFACTOR**: Handle side pots
  - **Acceptance**: All all-in works

- [ ] **T074** [TDD] [1h] Test minimum players (2 players)
  - **RED**: Write test `tests/integration/MinimumPlayers.test.ts`
    - Initialize 2-player game
    - Play 10 hands
    - Verify game continues until 1 player eliminated
  - **GREEN**: Verify game works with minimum players
  - **REFACTOR**: Test edge cases
  - **Acceptance**: 2-player game works

- [ ] **T075** [1h] Refactor and verify integration tests
  - Review all integration tests (7 test files)
  - Ensure realistic scenarios covered
  - Add test utilities for game initialization
  - **Acceptance**: Integration test suite complete

### Player Management (T076-T080) [5h]

- [ ] **T076** [TDD] [1h] Create Player model
  - Create `src/game-logic/models/Player.ts`:
    - `interface Player { id, name, chips, cards, bet, status, position }`
    - `enum PlayerStatus { Active, Folded, AllIn, Disconnected }`
  - **Acceptance**: Type-safe player model

- [ ] **T077** [TDD] [1h] Implement seat assignment
  - **RED**: Write test `tests/unit/game-logic/SeatAssignment.test.ts`
    - Test assigning human player to random seat
    - Test assigning bots to remaining seats
    - Test 6-9 seat tables
  - **GREEN**: Implement `src/game-logic/engine/SeatAssignment.ts`
    - `assignSeats(numBots: number, tableSize: number): Player[]`
  - **REFACTOR**: Generate bot names
  - **Acceptance**: Seat assignment works

- [ ] **T078** [TDD] [1h] Implement player elimination
  - **RED**: Write test `tests/unit/game-logic/PlayerElimination.test.ts`
    - Test player with 0 chips is eliminated
    - Test eliminated player removed from game
    - Test game continues with remaining players
  - **GREEN**: Implement elimination logic in HandCompletionHandler
  - **REFACTOR**: Handle dealer button skip
  - **Acceptance**: Elimination works

- [ ] **T079** [TDD] [1h] Implement bot name generator
  - **RED**: Write test `tests/unit/utils/BotNameGenerator.test.ts`
    - Test generating unique names
    - Test name pool (20+ names)
  - **GREEN**: Create `src/utils/BotNameGenerator.ts`
    - `generateBotName(): string`
    - Use predefined name list
  - **REFACTOR**: Prevent duplicate names
  - **Acceptance**: Bot names generated

- [ ] **T080** [1h] Refactor and verify player module
  - Review all player tests
  - Ensure 100% code coverage
  - Add JSDoc comments
  - **Acceptance**: Player management complete

### Final Verification (T081-T084) [5h]

- [ ] **T081** [2h] Run comprehensive test suite
  - Run `npm run test:cov`
  - Verify ≥80% coverage for game logic
  - Fix any failing tests
  - **Acceptance**: All game logic tests pass

- [ ] **T082** [1h] Code review and refactor
  - Review all game logic code
  - Remove duplicated code
  - Improve type safety (eliminate `any`)
  - Add JSDoc comments to public APIs
  - **Acceptance**: Code quality high

- [ ] **T083** [1h] Performance benchmarking
  - Run 1000 complete hands, measure time
  - Verify <1 second total (average <1ms per hand)
  - Profile hand evaluation (verify using pokersolver is fast)
  - **Acceptance**: Performance acceptable

- [ ] **T084** [1h] Documentation update
  - Update GAME_RULES.md with implemented rules
  - Document any deviations from standard poker
  - Add API documentation for core modules
  - **Acceptance**: Game logic documented

**Phase 2 Acceptance Criteria**:
- [x] All poker rules implemented correctly
- [x] Hand evaluation accurate (200+ test cases pass)
- [x] Side pot calculation correct (50+ scenarios pass)
- [x] Betting validation prevents invalid actions
- [x] Integration tests pass (complete hands work end-to-end)
- [x] Test coverage ≥80% for game logic
- [x] Zero game-breaking bugs
- [x] Documentation complete

---

## Phase 3: Bot AI Implementation (Week 4)

**Goal**: Implement three bot difficulty levels with realistic decision-making
**Duration**: 28 hours

### Strategy Infrastructure (T085-T090) [6h]

- [ ] **T085** [1h] Create StrategyInterface
  - Create `src/bot-ai/strategies/StrategyInterface.ts`:
    - `interface BotStrategy { getAction(state: GameState, playerId: string): Action }`
  - **Acceptance**: Common interface for all strategies

- [ ] **T086** [TDD] [1h] Create HandStrengthCalculator
  - **RED**: Write test `tests/unit/bot-ai/HandStrengthCalculator.test.ts`
    - Test evaluating pocket aces (very strong)
    - Test evaluating 7-2 offsuit (very weak)
    - Test strength scale 0-1
  - **GREEN**: Implement `src/bot-ai/analysis/HandStrengthCalculator.ts`
    - `calculateHandStrength(cards: Card[]): number`
    - Use preflop hand strength tables (or simple heuristic)
  - **REFACTOR**: Add caching
  - **Acceptance**: Hand strength calculation works

- [ ] **T087** [TDD] [1h] Create PotOddsCalculator
  - **RED**: Write test `tests/unit/bot-ai/PotOddsCalculator.test.ts`
    - Test calculating pot odds (pot: $100, call: $20 → odds 20%)
  - **GREEN**: Implement `src/bot-ai/analysis/PotOddsCalculator.ts`
    - `calculatePotOdds(pot: number, callAmount: number): number`
  - **REFACTOR**: Handle edge cases
  - **Acceptance**: Pot odds correct

- [ ] **T088** [TDD] [1h] Create BoardAnalyzer
  - **RED**: Write test `tests/unit/bot-ai/BoardAnalyzer.test.ts`
    - Test identifying flush draw on board
    - Test identifying straight draw
    - Test identifying paired board
  - **GREEN**: Implement `src/bot-ai/analysis/BoardAnalyzer.ts`
    - `analyzeBoard(communityCards: Card[]): BoardAnalysis`
  - **REFACTOR**: Add board texture analysis
  - **Acceptance**: Board analysis works

- [ ] **T089** [TDD] [1h] Create ThinkingTimer
  - **RED**: Write test `tests/unit/bot-ai/ThinkingTimer.test.ts`
    - Test generating random delay (500ms-2000ms)
  - **GREEN**: Implement `src/bot-ai/decision/ThinkingTimer.ts`
    - `getThinkingDelay(difficulty: Difficulty): number`
  - **REFACTOR**: Use different ranges per difficulty
  - **Acceptance**: Realistic delays generated

- [ ] **T090** [1h] Create ActionSelector base class
  - Create `src/bot-ai/decision/ActionSelector.ts`:
    - Base class with common decision-making logic
    - Template method pattern (strategies override specific methods)
  - **Acceptance**: Base class created

### Easy Bot (T091-T095) [5h]

- [ ] **T091** [TDD] [2h] Implement EasyStrategy preflop logic
  - **RED**: Write test `tests/unit/bot-ai/EasyStrategy.test.ts`
    - Test folding weak hands (< 20% preflop equity)
    - Test calling/raising strong hands (pairs, A-K, A-Q)
    - Test rarely bluffing (~10% of time)
  - **GREEN**: Implement `src/bot-ai/strategies/EasyStrategy.ts`
    - Implement `getAction()` method
    - Use simple hand strength thresholds
  - **REFACTOR**: Extract preflop hand ranges
  - **Acceptance**: Easy bot preflop logic works

- [ ] **T092** [TDD] [1h] Implement EasyStrategy post-flop logic
  - **RED**: Write tests in `EasyStrategy.test.ts`
    - Test checking/calling frequently
    - Test rarely raising
    - Test rarely bluffing
  - **GREEN**: Implement post-flop logic
    - Check if weak hand, call if strong hand
  - **REFACTOR**: Simplify decision tree
  - **Acceptance**: Easy bot post-flop logic works

- [ ] **T093** [TDD] [1h] Implement bet sizing for Easy bot
  - **RED**: Write tests in `EasyStrategy.test.ts`
    - Test raising 2-3x big blind preflop
    - Test betting 50-100% pot post-flop
  - **GREEN**: Implement `src/bot-ai/decision/BetSizer.ts`
    - `calculateBetSize(strategy: Strategy, pot: number): number`
  - **REFACTOR**: Random variation
  - **Acceptance**: Bet sizing works

- [ ] **T094** [TDD] [0.5h] Test Easy bot win rate
  - **RED**: Write test `tests/unit/bot-ai/EasyBotWinRate.test.ts`
    - Run 1000 hands (Easy bots only)
    - Verify win rate 35-40% (within ±5%)
  - **GREEN**: Tune strategy if needed
  - **REFACTOR**: Make test deterministic (seed RNG)
  - **Acceptance**: Easy bot win rate balanced

- [ ] **T095** [0.5h] Refactor and verify Easy bot
  - Review all Easy bot tests
  - Ensure 100% coverage
  - Add JSDoc comments
  - **Acceptance**: Easy bot complete

### Medium Bot (T096-T101) [8h]

- [ ] **T096** [TDD] [2h] Implement MediumStrategy preflop logic
  - **RED**: Write test `tests/unit/bot-ai/MediumStrategy.test.ts`
    - Test position awareness (tight early, loose late)
    - Test hand ranges by position
    - Test 3-betting occasionally
  - **GREEN**: Implement `src/bot-ai/strategies/MediumStrategy.ts`
    - Implement position-based hand ranges
  - **REFACTOR**: Extract position logic
  - **Acceptance**: Medium bot preflop logic works

- [ ] **T097** [TDD] [2h] Implement MediumStrategy pot odds logic
  - **RED**: Write tests in `MediumStrategy.test.ts`
    - Test calling if pot odds favorable (equity > pot odds)
    - Test folding if pot odds unfavorable
  - **GREEN**: Implement pot odds calculation in decision
  - **REFACTOR**: Estimate equity using hand strength
  - **Acceptance**: Pot odds logic works

- [ ] **T098** [TDD] [1h] Implement MediumStrategy bluffing
  - **RED**: Write tests in `MediumStrategy.test.ts`
    - Test bluffing ~25% of time in position
    - Test rarely bluffing out of position
  - **GREEN**: Implement bluff frequency calculation
  - **REFACTOR**: Use random chance with position modifier
  - **Acceptance**: Bluffing logic works

- [ ] **T099** [TDD] [1h] Implement basic opponent modeling
  - **RED**: Write test `tests/unit/bot-ai/OpponentModeler.test.ts`
    - Test tracking opponent actions (fold, call, raise frequencies)
    - Test adjusting strategy (bluff more against tight players)
  - **GREEN**: Implement `src/bot-ai/analysis/OpponentModeler.ts`
    - `trackAction(playerId: string, action: Action): void`
    - `getPlayerTendency(playerId: string): Tendency`
  - **REFACTOR**: Use simple counters
  - **Acceptance**: Basic opponent modeling works

- [ ] **T100** [TDD] [1h] Test Medium bot win rate
  - **RED**: Write test `tests/unit/bot-ai/MediumBotWinRate.test.ts`
    - Run 1000 hands (Medium vs Easy bots)
    - Verify Medium wins 45-50%
  - **GREEN**: Tune strategy if needed
  - **REFACTOR**: Make test deterministic
  - **Acceptance**: Medium bot win rate balanced

- [ ] **T101** [1h] Refactor and verify Medium bot
  - Review all Medium bot tests
  - Ensure 100% coverage
  - Add JSDoc comments
  - **Acceptance**: Medium bot complete

### Hard Bot (T102-T108) [8h]

- [ ] **T102** [TDD] [2h] Implement HardStrategy hand range modeling
  - **RED**: Write test `tests/unit/bot-ai/HardStrategy.test.ts`
    - Test estimating opponent range by actions
    - Test narrowing range as hand progresses
  - **GREEN**: Implement `src/bot-ai/strategies/HardStrategy.ts`
    - Maintain opponent range estimates
  - **REFACTOR**: Use range tables
  - **Acceptance**: Hand range modeling works

- [ ] **T103** [TDD] [2h] Implement HardStrategy implied odds
  - **RED**: Write tests in `HardStrategy.test.ts`
    - Test considering future bets (implied odds)
    - Test calling draws if implied odds favorable
  - **GREEN**: Implement implied odds calculation
  - **REFACTOR**: Estimate future pot size
  - **Acceptance**: Implied odds logic works

- [ ] **T104** [TDD] [1h] Implement HardStrategy strategic bluffing
  - **RED**: Write tests in `HardStrategy.test.ts`
    - Test bluffing on scary boards (4-to-a-straight)
    - Test folding to re-raises (bluff caught)
  - **GREEN**: Implement board-based bluffing
  - **REFACTOR**: Analyze board texture
  - **Acceptance**: Strategic bluffing works

- [ ] **T105** [TDD] [1h] Implement bet sizing tells
  - **RED**: Write tests in `HardStrategy.test.ts`
    - Test varying bet sizes (small = strong, large = bluff)
  - **GREEN**: Implement bet size variation
  - **REFACTOR**: Randomize with strategy bias
  - **Acceptance**: Bet sizing tells work

- [ ] **T106** [TDD] [1h] Implement adaptive play
  - **RED**: Write tests in `HardStrategy.test.ts`
    - Test exploiting tight players (bluff more)
    - Test exploiting loose players (value bet more)
  - **GREEN**: Integrate OpponentModeler
  - **REFACTOR**: Adjust strategy per opponent
  - **Acceptance**: Adaptive play works

- [ ] **T107** [TDD] [0.5h] Test Hard bot win rate
  - **RED**: Write test `tests/unit/bot-ai/HardBotWinRate.test.ts`
    - Run 1000 hands (Hard vs Medium bots)
    - Verify Hard wins 55-60%
  - **GREEN**: Tune strategy if needed
  - **REFACTOR**: Make test deterministic
  - **Acceptance**: Hard bot win rate balanced

- [ ] **T108** [0.5h] Refactor and verify Hard bot
  - Review all Hard bot tests
  - Ensure 100% coverage
  - Add JSDoc comments
  - **Acceptance**: Hard bot complete

### Personality & Integration (T109-T116) [5h]

- [ ] **T109** [TDD] [1h] Create PersonalityTraits model
  - Create `src/bot-ai/personality/PersonalityTraits.ts`:
    - `interface BotPersonality { tightness, aggression, bluffFrequency, adaptability }`
  - Add personality generator (random traits)
  - **Acceptance**: Type-safe personalities

- [ ] **T110** [TDD] [1h] Implement PersonalityGenerator
  - **RED**: Write test `tests/unit/bot-ai/PersonalityGenerator.test.ts`
    - Test generating random personalities
    - Test combinations (TAG, LAG, tight-passive, etc.)
  - **GREEN**: Implement `src/bot-ai/personality/PersonalityGenerator.ts`
    - `generatePersonality(): BotPersonality`
  - **REFACTOR**: Use weighted random
  - **Acceptance**: Diverse personalities generated

- [ ] **T111** [TDD] [1h] Implement BehaviorModifier
  - **RED**: Write test `tests/unit/bot-ai/BehaviorModifier.test.ts`
    - Test adjusting strategy based on personality
    - Test tight personality folds more often
    - Test aggressive personality raises more often
  - **GREEN**: Implement `src/bot-ai/personality/BehaviorModifier.ts`
    - `applyPersonality(action: Action, personality: BotPersonality): Action`
  - **REFACTOR**: Modify action probabilities
  - **Acceptance**: Personality affects behavior

- [ ] **T112** [TDD] [1h] Create BotOrchestrator
  - **RED**: Write test `tests/unit/bot-ai/BotOrchestrator.test.ts`
    - Test selecting strategy by difficulty
    - Test assigning personalities to bots
    - Test generating actions for all bots
  - **GREEN**: Implement `src/bot-ai/BotOrchestrator.ts`
    - `getBotAction(state: GameState, botId: string): Promise<Action>`
  - **REFACTOR**: Add thinking delay
  - **Acceptance**: Orchestrator works

- [ ] **T113** [TDD] [1h] Implement BluffDetector
  - **RED**: Write test `tests/unit/bot-ai/BluffDetector.test.ts`
    - Test deciding when to bluff (random chance, position, board)
  - **GREEN**: Implement `src/bot-ai/decision/BluffDetector.ts`
    - `shouldBluff(state: GameState, strategy: Strategy): boolean`
  - **REFACTOR**: Use strategy-specific thresholds
  - **Acceptance**: Bluff detection works

- [ ] **T114** [TDD] [0.5h] Test mixed difficulty bots
  - **RED**: Write test `tests/integration/MixedDifficultyBots.test.ts`
    - Run 1000 hands (2 Easy, 2 Medium, 1 Hard, 1 human)
    - Verify win rate distribution balanced
  - **GREEN**: Verify all strategies coexist
  - **REFACTOR**: Log bot decisions for analysis
  - **Acceptance**: Mixed difficulty balanced

- [ ] **T115** [0.5h] Prevent bot cheating
  - Add assertion: bots cannot access opponent hole cards
  - Sanitize game state before passing to bot strategies
  - Test that bots only see public information
  - **Acceptance**: Bots cannot cheat

- [ ] **T116** [1h] Refactor and verify bot AI module
  - Review all bot AI tests (30+ test files)
  - Ensure 100% coverage
  - Add JSDoc comments
  - **Acceptance**: Bot AI module complete

**Phase 3 Acceptance Criteria**:
- [x] Three bot difficulties implemented
- [x] Bot win rates balanced (Easy: 35-40%, Medium: 45-50%, Hard: 55-60%)
- [x] Bots play believably (realistic delays, varied actions)
- [x] Bots never cheat (cannot see hole cards)
- [x] Personality traits add variety
- [x] Test coverage ≥80% for bot AI

---

## Phase 4: UI Components (Week 5)

**Goal**: Build professional poker table interface with smooth animations
**Duration**: 33 hours

### Base UI Components (T117-T125) [9h]

- [ ] **T117** [Test] [1h] Create Button component
  - Create `src/presentation/components/ui/Button.tsx`
  - Implement variants: primary, secondary, danger, disabled
  - Add Tailwind CSS classes
  - Test `tests/components/Button.test.tsx`:
    - Test button renders with correct text
    - Test onClick handler called
    - Test disabled state prevents clicks
  - **Acceptance**: Button component works

- [ ] **T118** [Test] [1h] Create Modal component
  - Create `src/presentation/components/ui/Modal.tsx`
  - Implement overlay, close button, focus trap
  - Add animations (fade in/out)
  - Test `tests/components/Modal.test.tsx`:
    - Test modal opens/closes
    - Test clicking overlay closes modal
    - Test Escape key closes modal
  - **Acceptance**: Modal component works

- [ ] **T119** [Test] [1h] Create Slider component
  - Create `src/presentation/components/ui/Slider.tsx`
  - Implement range input with value display
  - Add min/max validation
  - Test `tests/components/Slider.test.tsx`:
    - Test slider value updates
    - Test min/max enforcement
  - **Acceptance**: Slider component works

- [ ] **T120** [Test] [1h] Create Tooltip component
  - Create `src/presentation/components/ui/Tooltip.tsx`
  - Implement hover-triggered tooltip
  - Add smart positioning (top, bottom, left, right)
  - Test `tests/components/Tooltip.test.tsx`:
    - Test tooltip appears on hover
    - Test tooltip disappears on mouse leave
  - **Acceptance**: Tooltip component works

- [ ] **T121** [Test] [1h] Create Toast component
  - Create `src/presentation/components/ui/Toast.tsx`
  - Implement notification system (info, success, error)
  - Add auto-dismiss (3 second timer)
  - Test `tests/components/Toast.test.tsx`:
    - Test toast appears with message
    - Test toast auto-dismisses
    - Test toast closeable manually
  - **Acceptance**: Toast component works

- [ ] **T122** [Test] [1h] Create IconButton component
  - Create `src/presentation/components/ui/IconButton.tsx`
  - Use Lucide React icons
  - Add tooltips on hover
  - Test `tests/components/IconButton.test.tsx`:
    - Test icon renders
    - Test onClick handler
  - **Acceptance**: IconButton works

- [ ] **T123** [1h] Create Typography components
  - Create `src/presentation/components/ui/Typography.tsx`
  - Implement Heading, Text, Label components
  - Add Tailwind typography classes
  - **Acceptance**: Typography components work

- [ ] **T124** [1h] Create LoadingSpinner component
  - Create `src/presentation/components/ui/LoadingSpinner.tsx`
  - Implement animated spinner (CSS animation)
  - Add size variants (small, medium, large)
  - **Acceptance**: Loading spinner works

- [ ] **T125** [1h] Style base components with Tailwind
  - Add custom Tailwind classes to `tailwind.config.js`
  - Define color palette (poker green, chip colors)
  - Define animation durations
  - **Acceptance**: Consistent styling across UI

### Card Components (T126-T132) [7h]

- [ ] **T126** [Test] [2h] Create PlayingCard component
  - Create `src/presentation/components/cards/PlayingCard.tsx`
  - Implement face-up and face-down states
  - Add card graphics (suits and ranks)
  - Use Lucide React for suit icons (♠ ♥ ♦ ♣)
  - Test `tests/components/PlayingCard.test.tsx`:
    - Test card renders with correct rank/suit
    - Test face-down card hides rank/suit
    - Test accessibility (screen reader announces card)
  - **Acceptance**: Playing card renders correctly

- [ ] **T127** [Test] [1h] Create CardBack component
  - Create `src/presentation/components/cards/CardBack.tsx`
  - Design multiple card back styles (5 options)
  - Add settings selector
  - Test `tests/components/CardBack.test.tsx`:
    - Test card back renders
    - Test design selection
  - **Acceptance**: Card back designs work

- [ ] **T128** [1h] Create CardFront component
  - Create `src/presentation/components/cards/CardFront.tsx`
  - Implement rank and suit display
  - Style with colors (red for hearts/diamonds, black for clubs/spades)
  - Add color blind mode (patterns)
  - **Acceptance**: Card front displays correctly

- [ ] **T129** [2h] Add card animations
  - Create `src/presentation/styles/cards.css`
  - Implement dealing animation (slide from deck)
  - Implement flip animation (face-down → face-up)
  - Implement highlight animation (winner's cards)
  - Use CSS keyframes
  - Test animations render smoothly
  - **Acceptance**: Card animations smooth (60fps)

- [ ] **T130** [0.5h] Create CardPlaceholder component
  - Create `src/presentation/components/cards/CardPlaceholder.tsx`
  - Render empty card slot
  - Use dashed border
  - **Acceptance**: Placeholder renders

- [ ] **T131** [0.5h] Add card size variants
  - Update PlayingCard component
  - Add size prop (small, medium, large)
  - Scale card graphics
  - **Acceptance**: Card sizes work

### Game Components (T132-T145) [12h]

- [ ] **T132** [Test] [3h] Create PokerTable component
  - Create `src/presentation/components/game/PokerTable.tsx`
  - Implement elliptical table layout (SVG or CSS)
  - Add green felt texture background
  - Arrange 6-9 player seats around table
  - Add community cards area in center
  - Add pot display prominently
  - Test `tests/components/PokerTable.test.tsx`:
    - Test table renders with correct number of seats
    - Test responsive layout
  - **Acceptance**: Poker table layout correct

- [ ] **T133** [Test] [2h] Create PlayerSeat component
  - Create `src/presentation/components/game/PlayerSeat.tsx`
  - Display: avatar, name, chip stack, cards, current bet
  - Add status indicators (folded, all-in, thinking)
  - Add dealer button indicator
  - Add SB/BB indicators during blind posting
  - Test `tests/components/PlayerSeat.test.tsx`:
    - Test player info renders
    - Test cards shown/hidden correctly
  - **Acceptance**: Player seat displays correctly

- [ ] **T134** [Test] [1h] Create CommunityCards component
  - Create `src/presentation/components/game/CommunityCards.tsx`
  - Display 0-5 community cards
  - Add card dealing animations
  - Test `tests/components/CommunityCards.test.tsx`:
    - Test cards render
    - Test animations trigger
  - **Acceptance**: Community cards display correctly

- [ ] **T135** [Test] [1h] Create PotDisplay component
  - Create `src/presentation/components/game/PotDisplay.tsx`
  - Display total pot amount
  - Add chip graphics (stacks of chips)
  - Show main pot and side pots separately
  - Animate pot increase (+$50 animation)
  - Test `tests/components/PotDisplay.test.tsx`:
    - Test pot amount updates
    - Test side pots shown
  - **Acceptance**: Pot display correct

- [ ] **T136** [Test] [1h] Create ActionButtons component
  - Create `src/presentation/components/game/ActionButtons.tsx`
  - Display Fold, Check/Call, Raise/Bet, All-In buttons
  - Disable invalid actions (e.g., cannot check if bet exists)
  - Add keyboard shortcut hints (F, C, R, A)
  - Test `tests/components/ActionButtons.test.tsx`:
    - Test buttons render
    - Test click handlers
    - Test disabled states
  - **Acceptance**: Action buttons work

- [ ] **T137** [Test] [1.5h] Create RaiseSlider component
  - Create `src/presentation/components/game/RaiseSlider.tsx`
  - Implement range slider for raise amount
  - Add quick-bet buttons (2x BB, Pot, All-In)
  - Display min/max raise amounts
  - Validate raise amount
  - Test `tests/components/RaiseSlider.test.tsx`:
    - Test slider updates value
    - Test quick-bet buttons work
    - Test validation prevents invalid amounts
  - **Acceptance**: Raise slider works

- [ ] **T138** [Test] [1h] Create ActionTimer component
  - Create `src/presentation/components/game/ActionTimer.tsx`
  - Display countdown timer (30 seconds)
  - Visual progress bar or circular progress
  - Add warning at 10 seconds (red color)
  - Test `tests/components/ActionTimer.test.tsx`:
    - Test timer counts down
    - Test timer expires triggers auto-action
  - **Acceptance**: Action timer works

- [ ] **T139** [Test] [1h] Create WinnerAnnouncement component
  - Create `src/presentation/components/game/WinnerAnnouncement.tsx`
  - Display winner name, amount won, hand rank
  - Add celebration animation (confetti or highlight)
  - Auto-dismiss after 5 seconds
  - Test `tests/components/WinnerAnnouncement.test.tsx`:
    - Test winner info renders
    - Test animation plays
  - **Acceptance**: Winner announcement works

- [ ] **T140** [Test] [1h] Create ActionLog component
  - Create `src/presentation/components/game/ActionLog.tsx`
  - Display scrollable history of recent actions
  - Format actions (e.g., "Mike raises to $40")
  - Auto-scroll to newest action
  - Test `tests/components/ActionLog.test.tsx`:
    - Test actions added to log
    - Test scroll behavior
  - **Acceptance**: Action log works

- [ ] **T141** [Test] [0.5h] Create DealerButton component
  - Create `src/presentation/components/game/DealerButton.tsx`
  - Display "D" button indicator
  - Position next to current dealer
  - Rotate when dealer changes
  - Test `tests/components/DealerButton.test.tsx`:
    - Test button renders
    - Test position updates
  - **Acceptance**: Dealer button works

### Layout Components (T142-T149) [8h]

- [ ] **T142** [Test] [2h] Create MainMenu page
  - Create `src/presentation/pages/HomePage.tsx`
  - Add "Quick Play" button (primary action)
  - Add "Settings" button
  - Add "About" button
  - Add title and logo
  - Test `tests/components/HomePage.test.tsx`:
    - Test buttons render
    - Test navigation to game
  - **Acceptance**: Main menu works

- [ ] **T143** [Test] [2h] Create GamePage
  - Create `src/presentation/pages/GamePage.tsx`
  - Integrate PokerTable component
  - Add game controls (Leave Game, Settings)
  - Layout: table center, controls top-right
  - Test `tests/components/GamePage.test.tsx`:
    - Test page renders
    - Test table visible
  - **Acceptance**: Game page layout correct

- [ ] **T144** [Test] [2h] Create SettingsPanel component
  - Create `src/presentation/components/layout/SettingsPanel.tsx`
  - Display all settings with controls:
    - Number of bots (slider 1-8)
    - Bot difficulty (dropdown: Easy/Medium/Hard/Mixed)
    - Starting chips (dropdown: 500/1000/2000/5000)
    - Blind levels (dropdown: $5/$10, $10/$20, $25/$50)
    - Action timer (dropdown: 15s/30s/60s/Off)
    - Animation speed (dropdown: Slow/Normal/Fast/Off)
    - Sound effects (toggle)
    - Card back design (image selector)
  - Add "Save" and "Cancel" buttons
  - Test `tests/components/SettingsPanel.test.tsx`:
    - Test settings render
    - Test value changes
    - Test save/cancel
  - **Acceptance**: Settings panel works

- [ ] **T145** [Test] [1h] Create StatsPanel component
  - Create `src/presentation/components/layout/StatsPanel.tsx`
  - Display session statistics:
    - Hands played
    - Hands won
    - Win rate percentage
    - Total chips won/lost
    - Biggest pot won
  - Test `tests/components/StatsPanel.test.tsx`:
    - Test stats render
    - Test stats update
  - **Acceptance**: Stats panel works

- [ ] **T146** [Test] [1h] Create GameOverScreen component
  - Create `src/presentation/components/layout/GameOverScreen.tsx`
  - Display game summary:
    - "You were eliminated" or "You won!"
    - Session statistics
    - "Play Again" button
    - "Change Settings" button
  - Test `tests/components/GameOverScreen.test.tsx`:
    - Test screen renders
    - Test buttons work
  - **Acceptance**: Game over screen works

### Custom Hooks (T147-T153) [7h]

- [ ] **T147** [Test] [1.5h] Create useGameState hook
  - Create `src/presentation/hooks/useGameState.ts`
  - Access game state from Zustand store
  - Return typed state values
  - Test `tests/hooks/useGameState.test.ts`:
    - Test hook returns game state
    - Test hook updates on state change
  - **Acceptance**: useGameState hook works

- [ ] **T148** [Test] [1.5h] Create useGameActions hook
  - Create `src/presentation/hooks/useGameActions.ts`
  - Provide action dispatchers (startGame, dealCards, applyAction, etc.)
  - Integrate with GameEngine
  - Test `tests/hooks/useGameActions.test.ts`:
    - Test actions dispatch correctly
    - Test state updates after action
  - **Acceptance**: useGameActions hook works

- [ ] **T149** [Test] [1h] Create useSettings hook
  - Create `src/presentation/hooks/useSettings.ts`
  - Access settings from Zustand store
  - Provide updateSettings function
  - Test `tests/hooks/useSettings.test.ts`:
    - Test settings loaded from localStorage
    - Test settings saved on change
  - **Acceptance**: useSettings hook works

- [ ] **T150** [Test] [1h] Create useAnimation hook
  - Create `src/presentation/hooks/useAnimation.ts`
  - Control animation playback (start, stop, speed)
  - Check animation settings (on/off, speed)
  - Test `tests/hooks/useAnimation.test.ts`:
    - Test animation control
    - Test animation speed applied
  - **Acceptance**: useAnimation hook works

- [ ] **T151** [Test] [1.5h] Create useKeyboardShortcuts hook
  - Create `src/presentation/hooks/useKeyboardShortcuts.ts`
  - Listen for keyboard events (F, C, R, A, Enter, Escape)
  - Trigger actions on key press
  - Disable shortcuts when modal open
  - Test `tests/hooks/useKeyboardShortcuts.test.ts`:
    - Test key presses trigger actions
    - Test shortcuts disabled in modals
  - **Acceptance**: Keyboard shortcuts work

- [ ] **T152** [Test] [0.5h] Create useTimer hook
  - Create `src/presentation/hooks/useTimer.ts`
  - Countdown timer with callback on expiration
  - Pause/resume functionality
  - Test `tests/hooks/useTimer.test.ts`:
    - Test timer counts down
    - Test callback on expiration
  - **Acceptance**: useTimer hook works

### Styling & Animations (T153-T158) [6h]

- [ ] **T153** [2h] Style poker table
  - Create `src/presentation/styles/table.css`
  - Elliptical table shape (CSS clip-path or SVG)
  - Green felt texture background (gradient or image)
  - Player seat positioning around table
  - Responsive layout (scale on window resize)
  - **Acceptance**: Table looks professional

- [ ] **T154** [1.5h] Implement card dealing animations
  - Update `src/presentation/styles/cards.css`
  - Cards slide from deck to player positions
  - Stagger animation (deal to each player sequentially)
  - Use CSS `animation-delay`
  - **Acceptance**: Dealing animations smooth

- [ ] **T155** [1h] Implement chip movement animations
  - Create `src/presentation/styles/chips.css`
  - Chips slide from player to pot
  - Pot amount increases with scale effect
  - Use CSS `transform` for GPU acceleration
  - **Acceptance**: Chip animations smooth

- [ ] **T156** [1h] Implement winner celebration
  - Add celebration effects to WinnerAnnouncement
  - Highlight winning hand (scale, glow effect)
  - Chips slide from pot to winner
  - Confetti or particle effect (optional)
  - **Acceptance**: Winner celebration visually appealing

- [ ] **T157** [0.5h] Optimize animation performance
  - Profile animations with Chrome DevTools (FPS meter)
  - Ensure 60fps maintained
  - Use `will-change` CSS property
  - Avoid layout thrashing (batch DOM updates)
  - **Acceptance**: Animations smooth on target hardware

**Phase 4 Acceptance Criteria**:
- [x] All UI components render correctly
- [x] Animations smooth at 60fps
- [x] Interface responsive (1920x1080 to 1366x768)
- [x] Keyboard shortcuts work
- [x] Screen reader compatibility (ARIA labels)
- [x] Color blind mode available
- [x] Component test coverage ≥60%

---

## Phase 5: Integration & Polish (Week 6)

**Goal**: Connect UI to game logic, implement game loop, optimize performance
**Duration**: 28 hours

### State Management (T158-T161) [4h]

- [ ] **T158** [2h] Create game store
  - Create `src/state-management/gameStore.ts`
  - Implement Zustand store with game state
  - Add actions: startGame, dealCards, applyAction, advancePhase, completeHand
  - Integrate GameEngine from game logic
  - Test store actions update state correctly
  - **Acceptance**: Game store manages state

- [ ] **T159** [1h] Create settings store
  - Create `src/state-management/settingsStore.ts`
  - Implement Zustand store with persist middleware
  - Add settings interface (all FR-085 to FR-094 settings)
  - Save to localStorage on change
  - Load from localStorage on app start
  - Test settings persist across sessions
  - **Acceptance**: Settings store works

- [ ] **T160** [0.5h] Create UI store
  - Create `src/state-management/uiStore.ts`
  - Manage UI state (modals open/closed, toast messages)
  - Add actions: openModal, closeModal, showToast
  - **Acceptance**: UI store manages UI state

- [ ] **T161** [0.5h] Create stats store
  - Create `src/state-management/statsStore.ts`
  - Track session statistics (hands played, win rate, etc.)
  - Update after each hand
  - Optionally persist to localStorage
  - **Acceptance**: Stats store tracks metrics

### Game Loop Integration (T162-T168) [10h]

- [ ] **T162** [2h] Implement game initialization
  - Update `useGameActions.startNewGame(settings)`
  - Initialize game state (players, deck, dealer position)
  - Deal initial hole cards
  - Post blinds
  - Start preflop betting
  - Test game starts correctly
  - **Acceptance**: Game initializes

- [ ] **T163** [2h] Integrate player actions
  - Wire ActionButtons to game store
  - Validate action before applying
  - Update game state on valid action
  - Show error toast on invalid action
  - Advance to next player
  - Test all actions (fold, call, raise) work
  - **Acceptance**: Player actions work

- [ ] **T164** [2h] Integrate bot actions
  - Call BotOrchestrator for bot turns
  - Add thinking delay (500ms-3500ms)
  - Display "thinking" indicator on bot seat
  - Apply bot action to game state
  - Advance to next player
  - Test bots make decisions automatically
  - **Acceptance**: Bot actions work

- [ ] **T165** [2h] Implement phase progression
  - Detect when betting round completes
  - Advance phase automatically (preflop → flop → turn → river → showdown)
  - Deal community cards with animations
  - Burn cards before dealing
  - Reset betting round state
  - Test phase transitions work
  - **Acceptance**: Phase progression works

- [ ] **T166** [1h] Implement hand completion
  - Evaluate hands at showdown
  - Calculate winners
  - Distribute pots (main pot and side pots)
  - Show winner announcement
  - Update player stacks
  - Rotate dealer button
  - Eliminate players with 0 chips
  - Test hand completes correctly
  - **Acceptance**: Hand completion works

- [ ] **T167** [0.5h] Implement next hand auto-start
  - Wait 3 seconds after hand completes
  - Start next hand automatically
  - Test multiple hands play in sequence
  - **Acceptance**: Next hand starts

- [ ] **T168** [0.5h] Implement game over detection
  - Detect when only 1 player remains
  - Show game over screen
  - Display session summary
  - Test game ends correctly
  - **Acceptance**: Game over works

### Animation Sequencing (T169-T173) [6h]

- [ ] **T169** [2h] Choreograph card dealing
  - Deal cards to each player sequentially (not all at once)
  - Stagger animations (100ms delay between players)
  - Use `setTimeout` or animation queue
  - Test dealing looks realistic
  - **Acceptance**: Card dealing choreographed

- [ ] **T170** [1h] Choreograph chip movements
  - Chips slide from player to pot one at a time
  - Pot amount updates after each chip movement
  - Use CSS animations with delays
  - Test chip movements smooth
  - **Acceptance**: Chip movements choreographed

- [ ] **T171** [2h] Choreograph winner celebration
  - Highlight winning hand
  - Chips slide from pot to winner
  - Show winner announcement overlay
  - Pause 3 seconds before next hand
  - Test celebration looks good
  - **Acceptance**: Winner celebration choreographed

- [ ] **T172** [0.5h] Add animation speed control
  - Use settings store to get animation speed
  - Adjust animation durations (off, fast, normal, slow)
  - Test all animation speeds work
  - **Acceptance**: Animation speed adjustable

- [ ] **T173** [0.5h] Add pause between phases
  - Pause 1 second between phases (flop → turn → river)
  - Allow players to see board changes
  - Test pauses improve readability
  - **Acceptance**: Pauses between phases

### Error Handling & Validation (T174-T177) [4h]

- [ ] **T174** [1h] Implement input validation
  - Validate all user inputs (bet amounts, raise amounts)
  - Show error toast on invalid input
  - Prevent submitting invalid actions
  - Test validation catches errors
  - **Acceptance**: Input validation works

- [ ] **T175** [1h] Implement error boundaries
  - Create error boundary component
  - Catch React component errors
  - Display user-friendly error message
  - Log errors to console
  - Test error boundary catches errors
  - **Acceptance**: Error boundary works

- [ ] **T176** [1h] Add consistency checks
  - Validate game state after each action (pot = sum of bets, no duplicate cards)
  - Throw error if inconsistency detected
  - Log detailed error for debugging
  - Test consistency checks catch bugs
  - **Acceptance**: Consistency checks work

- [ ] **T177** [1h] Handle edge cases gracefully
  - Player closes browser mid-hand → show confirmation dialog
  - Player tries to leave during their turn → show warning
  - Test edge cases handled
  - **Acceptance**: Edge cases handled

### Performance Optimization (T178-T183) [4h]

- [ ] **T178** [1h] Optimize React renders
  - Use `React.memo` for expensive components (PokerTable, PlayerSeat)
  - Use `useMemo` for expensive calculations
  - Use `useCallback` for event handlers
  - Profile with React DevTools
  - Test performance improvements
  - **Acceptance**: Renders optimized

- [ ] **T179** [1h] Code-split heavy modules
  - Lazy load settings panel (React.lazy)
  - Lazy load stats panel
  - Lazy load bot AI (only load when bots present)
  - Test code-splitting works
  - **Acceptance**: Bundle size reduced

- [ ] **T180** [1h] Optimize animation performance
  - Use GPU-accelerated properties (transform, opacity)
  - Avoid animating layout properties (width, height)
  - Profile with Chrome DevTools Performance
  - Test 60fps maintained
  - **Acceptance**: Animations optimized

- [ ] **T181** [0.5h] Measure action response time
  - Add performance timing (action click to UI update)
  - Log timing to console
  - Verify <100ms (95th percentile)
  - **Acceptance**: Action response fast

- [ ] **T182** [0.5h] Test on target hardware
  - Test on 5-year-old laptop (1366x768)
  - Verify smooth gameplay (60fps, <100ms actions)
  - Test on different browsers (Chrome, Firefox, Safari, Edge)
  - **Acceptance**: Performance acceptable

**Phase 5 Acceptance Criteria**:
- [x] Game playable end-to-end (Quick Play → complete hand → game over)
- [x] All user actions trigger correct state changes
- [x] Bots make decisions automatically
- [x] Animations smooth and synchronized (60fps)
- [x] Settings persist across sessions
- [x] Performance targets met (<100ms actions, 60fps animations)
- [x] Error handling works
- [x] No game-breaking bugs

---

## Phase 6: Testing & Refinement (Week 7)

**Goal**: Comprehensive testing, playtesting, bug fixes, polish
**Duration**: 23 hours

### Testing (T183-T188) [12h]

- [ ] **T183** [4h] Run comprehensive test suite
  - Run `npm run test:cov`
  - Review coverage report
  - Write additional tests to reach 80% game logic, 60% UI
  - Fix any failing tests
  - **Acceptance**: All tests pass, coverage targets met

- [ ] **T184** [2h] Add end-to-end tests
  - Write Playwright E2E tests:
    - Test complete game flow (start → play hand → game over)
    - Test all user actions (fold, call, raise)
    - Test settings changes persist
  - **Acceptance**: E2E tests pass

- [ ] **T185** [2h] Cross-browser testing
  - Test on Chrome 90+
  - Test on Firefox 90+
  - Test on Safari 14+
  - Test on Edge 90+
  - Document any visual bugs
  - Fix critical browser-specific issues
  - **Acceptance**: Works on all target browsers

- [ ] **T186** [2h] Accessibility testing
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Verify all elements have ARIA labels
  - Test keyboard navigation (Tab, Enter, Escape)
  - Test color contrast (WCAG AA compliance)
  - Run Lighthouse accessibility audit
  - Fix accessibility violations
  - **Acceptance**: Accessible to users with disabilities

- [ ] **T187** [1h] Performance benchmarking
  - Run Lighthouse performance audit
  - Verify Time to Interactive <3 seconds
  - Verify action processing <100ms
  - Verify 60fps animations (Chrome DevTools FPS meter)
  - **Acceptance**: Performance targets met

- [ ] **T188** [1h] Memory leak testing
  - Play 100 hands continuously
  - Monitor memory usage (Chrome DevTools Memory profiler)
  - Verify memory doesn't grow unbounded
  - Fix any memory leaks detected
  - **Acceptance**: No memory leaks

### Playtesting & Feedback (T189-T192) [6h]

- [ ] **T189** [3h] Recruit playtesters
  - Find 10+ poker players
  - Ask each to play 5+ hands
  - Observe their gameplay (note confusion points)
  - Collect feedback (survey or interview)
  - **Acceptance**: Feedback collected

- [ ] **T190** [2h] Analyze feedback
  - Identify common pain points (confusing UI, unclear actions)
  - Identify bugs reported by playtesters
  - Prioritize issues (critical, high, medium, low)
  - **Acceptance**: Issues prioritized

- [ ] **T191** [0.5h] Measure engagement metrics
  - Average session length (target >15 minutes)
  - Hands per session (target >10 hands)
  - Completion rate (% who finish a game)
  - **Acceptance**: Metrics measured

- [ ] **T192** [0.5h] Test bot believability
  - Ask playtesters to rate bot realism (1-10 scale)
  - Target: Average rating >7
  - Identify bot behaviors that feel robotic
  - **Acceptance**: Bot believability rated

### Bug Fixes & Polish (T193-T196) [5h]

- [ ] **T193** [3h] Fix critical bugs
  - Fix game-breaking bugs (crashes, incorrect rules)
  - Fix high-priority visual bugs (overlapping elements, broken animations)
  - Test fixes thoroughly
  - **Acceptance**: Critical bugs fixed

- [ ] **T194** [1h] Polish UI
  - Improve visual feedback (hover states, button press effects)
  - Refine animations (timing, easing)
  - Improve error messages (clear, actionable)
  - **Acceptance**: UI polished

- [ ] **T195** [0.5h] Improve accessibility
  - Add missing ARIA labels identified in testing
  - Improve keyboard navigation flow
  - Enhance focus indicators
  - **Acceptance**: Accessibility improved

- [ ] **T196** [0.5h] Defer low-priority issues
  - Document nice-to-have features for future
  - Document minor bugs (cosmetic issues)
  - **Acceptance**: Future work documented

**Phase 6 Acceptance Criteria**:
- [x] Test coverage ≥80% game logic, ≥60% UI
- [x] All critical bugs fixed
- [x] Playtesting feedback incorporated
- [x] Performance targets met
- [x] Cross-browser compatibility verified
- [x] Accessibility tested and improved
- [x] Documentation complete

---

## Phase 7: Deployment & Launch (Week 8)

**Goal**: Deploy to production, set up CI/CD, launch
**Duration**: 13 hours

### Production Build (T197-T200) [4h]

- [ ] **T197** [1h] Optimize production build
  - Run `npm run build`
  - Analyze bundle size (`npm run build -- --analyze`)
  - Verify bundle <2MB
  - Ensure code-splitting applied
  - Test production build locally (`npm run preview`)
  - **Acceptance**: Production build optimized

- [ ] **T198** [1h] Add build scripts
  - Add `build:prod` script (minify, sourcemap)
  - Add `build:analyze` script (bundle analyzer)
  - Add `build:preview` script (preview prod build)
  - **Acceptance**: Build scripts work

- [ ] **T199** [1h] Configure environment variables
  - Create `.env.example` (template for env vars)
  - Use Vite env vars (`import.meta.env`)
  - Test env var loading
  - **Acceptance**: Env vars configured

- [ ] **T200** [1h] Run final checks
  - Run `npm run lint` - verify zero errors
  - Run `npm run test` - verify all tests pass
  - Run `npm run build` - verify build succeeds
  - Test production build locally
  - **Acceptance**: All checks pass

### Deployment (T201-T203) [6h]

- [ ] **T201** [2h] Choose hosting platform
  - Option A: GitHub Pages (free, simple, static hosting)
  - Option B: Vercel (free, optimized for Next.js/React, CDN)
  - Option C: Netlify (free, similar to Vercel)
  - Configure deployment settings
  - Set up custom domain (optional)
  - **Acceptance**: Hosting platform configured

- [ ] **T202** [2h] Deploy to production
  - Push code to GitHub
  - Configure deployment (build command, output directory)
  - Deploy production build
  - Verify app accessible via URL
  - Test deployed app (play a hand, verify functionality)
  - **Acceptance**: App deployed and working

- [ ] **T203** [2h] Set up CI/CD pipeline
  - Create GitHub Actions workflow (`.github/workflows/ci.yml`)
  - Run tests on every push
  - Run linting on every push
  - Deploy to production on main branch
  - Add status badge to README
  - **Acceptance**: CI/CD pipeline working

### Documentation & Launch (T204-T207) [3h]

- [ ] **T204** [1h] Update documentation
  - Update README.md (add live demo link)
  - Add deployment instructions to DEVELOPMENT.md
  - Add troubleshooting section (common issues)
  - **Acceptance**: Documentation complete

- [ ] **T205** [0.5h] Create launch announcement
  - Write announcement post (describe features)
  - Add screenshots/GIFs
  - Share on relevant platforms (Reddit, Twitter, forums)
  - **Acceptance**: Announcement published

- [ ] **T206** [0.5h] Set up bug reporting
  - Create GitHub Issues template
  - Add bug report link to README
  - Add feedback form (optional, Google Form or Typeform)
  - **Acceptance**: Bug reporting set up

- [ ] **T207** [1h] Monitor post-launch
  - Monitor browser console errors (Sentry or LogRocket)
  - Track user engagement (Google Analytics, session length)
  - Respond to bug reports and feedback
  - Plan next iteration (feature roadmap)
  - **Acceptance**: Post-launch monitoring active

**Phase 7 Acceptance Criteria**:
- [x] Production build <2MB
- [x] App deployed and accessible publicly
- [x] CI/CD pipeline running
- [x] Documentation complete with live demo link
- [x] Bug reporting set up
- [x] Post-launch monitoring active

---

## Completion Checklist

### MVP Completion (After Phase 7)

- [x] **Game Rules**: All Texas Hold'em rules implemented correctly
- [x] **Hand Evaluation**: Accurate for all 10 hand ranks
- [x] **Side Pots**: Correct calculation for any number of all-ins
- [x] **Bot AI**: Three difficulty levels balanced and believable
- [x] **UI**: Professional poker table interface
- [x] **Animations**: Smooth card dealing, chip movements, winner celebrations
- [x] **Settings**: Persist to localStorage, customizable difficulty/chips/blinds
- [x] **Keyboard Shortcuts**: F=fold, C=call, R=raise, A=all-in, Enter=confirm, Escape=cancel
- [x] **Accessibility**: ARIA labels, keyboard navigation, color blind mode
- [x] **Performance**: <100ms action response, 60fps animations
- [x] **Testing**: ≥80% game logic coverage, ≥60% UI coverage
- [x] **Deployment**: Live and accessible via URL
- [x] **Documentation**: Complete (README, ARCHITECTURE, GAME_RULES, BOT_AI, DEVELOPMENT)

---

## Task Execution Notes

### Task Format

Each task follows this format:
- **Task ID**: T001, T002, etc.
- **[Markers]**:
  - `[TDD]` = Test-Driven Development required (RED-GREEN-REFACTOR)
  - `[Test]` = Write tests for component/functionality
  - `[Xh]` = Estimated hours
- **Description**: What to build
- **Acceptance**: Definition of done

### Parallel Execution

Tasks without dependencies can be executed in parallel by multiple developers or Claude Code instances. Focus on completing one phase before moving to the next.

### Progress Tracking

Use TodoWrite tool to track task completion:
- Mark tasks as `in_progress` when starting
- Mark tasks as `completed` when done
- Update estimated hours if actual time differs

---

**Tasks Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: Ready for execution
**Total Estimated Hours**: 188 hours
