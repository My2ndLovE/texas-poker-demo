# Project Constitution: Standalone Texas Hold'em Poker Game

**Project Type**: Single-player poker game with bot opponents
**Purpose**: Production-ready Texas Hold'em implementation with complete rules and professional gameplay
**Target**: Standalone game application (no backend, no database, pure client-side)

---

## Core Principles (NON-NEGOTIABLE)

### I. Test-Driven Development (TDD)
**Commitment**: Every feature begins with failing tests

- **RED**: Write failing test first - verify expected behavior
- **GREEN**: Write minimum code to make test pass
- **REFACTOR**: Improve code quality while keeping tests green
- **Coverage**: Minimum 80% code coverage for game logic
- **No Exceptions**: Production code without tests is prohibited

**Rationale**: TDD ensures correctness of poker rules (complex domain) and prevents regression bugs

---

### II. Complete Poker Rules (No Shortcuts)
**Commitment**: Implement ALL Texas Hold'em rules correctly

**Must Include**:
- Blind posting system (small blind, big blind, heads-up rules)
- Burn cards (1 before flop, turn, river)
- Dealer button rotation and position calculations
- All betting actions (fold, check, call, bet, raise, all-in)
- Minimum raise validation
- Side pot calculation (multiple all-ins, odd chip distribution)
- Hand evaluation (all 10 hand ranks, tie-breaking)
- Showdown logic (card reveal order, mucking)
- Action timer with auto-actions
- Betting round completion detection

**Rationale**: This is a poker game - incomplete rules = broken experience

---

### III. Production-Quality Code
**Commitment**: Professional standards, not prototype code

- **TypeScript Strict Mode**: No `any` types, complete type safety
- **Modern React Patterns**: Hooks, functional components, proper state management
- **Clean Architecture**: Separation of concerns (UI, game logic, bot AI)
- **Error Handling**: Graceful failure, no unhandled exceptions
- **Performance**: Smooth animations (60fps), responsive UI (<100ms interactions)

**Rationale**: This game serves as a reference implementation

---

### IV. Bot AI Intelligence
**Commitment**: Bots that play believable poker

**Bot Levels**:
1. **Easy**: Random actions with basic logic (fold bad hands, call good hands)
2. **Medium**: Basic strategy (position awareness, pot odds consideration)
3. **Hard**: Advanced strategy (bluffing, hand reading, adaptive play)

**Bot Behavior**:
- Realistic thinking time (500ms - 3000ms delay)
- Personality traits (tight/loose, aggressive/passive)
- Memory of previous hands (basic pattern recognition)
- No cheating (bots cannot see hole cards)

**Rationale**: Single-player game needs engaging AI opponents

---

### V. User Experience Excellence
**Commitment**: Intuitive, polished, professional UI

- **Visual Design**: Clean poker table layout, professional card graphics
- **Animations**: Smooth card dealing, chip movements, winner celebrations
- **Feedback**: Clear action indicators, pot updates, hand strength hints
- **Accessibility**: Keyboard shortcuts, screen reader support, color blind modes
- **Settings**: Adjustable game speed, animation toggle, sound effects

**Rationale**: UX differentiates good poker games from great ones

---

### VI. In-Memory State Management
**Commitment**: No database, no backend, pure client-side

- **Game State**: In-memory only (Redux/Zustand for state management)
- **Persistence**: Optional localStorage for settings and statistics
- **No Network**: All computations client-side (bot AI, hand evaluation)
- **Fast**: Instant actions, no API latency

**Rationale**: Standalone game = no infrastructure dependencies

---

### VII. Localization Ready
**Commitment**: No hardcoded strings, internationalization from day 1

- **No Hardcoded Text**: All strings in localization files
- **Resource Keys**: Use `t('game.insufficient_chips')` pattern
- **Default Language**: English
- **Future Languages**: Architecture supports Vietnamese, Thai, Chinese

**Rationale**: Makes game accessible to global audiences

---

### VIII. Professional UI Standards
**Commitment**: Icon library, design system, no emojis

- **Icons**: Lucide React or similar professional library
- **No Emojis**: Use proper icons for suits, actions, buttons
- **Design System**: Consistent colors, typography, spacing
- **Responsive**: Mobile-first (320px-428px), scales up to tablet/desktop

**Rationale**: Professional appearance builds trust and quality perception

---

### IX. Mobile-First Design
**Commitment**: Touch-optimized, mobile-native experience

- **Primary Platform**: Smartphones (iPhone SE to iPhone 14 Pro Max, Android equivalents)
- **Touch Targets**: Minimum 44x44px (iOS) / 48x48dp (Android)
- **Thumb Zones**: Primary actions in bottom 25% of screen (easy reach)
- **Gestures**: Swipe, tap, long-press, pinch-zoom (not just mouse/keyboard)
- **Orientation**: Portrait AND landscape support with smooth 300ms transitions
- **Performance**: 60fps animations on iPhone 11 (A13 Bionic) and Pixel 5 (Snapdragon 765G)
- **PWA**: Installable, works offline, service worker caching
- **Assets**: <50KB images (WebP format), <500KB initial bundle (gzipped)
- **Safe Areas**: Handle notch/home indicator (env(safe-area-inset-*))
- **Haptic Feedback**: Vibration API for tactile feedback (optional, toggleable)
- **Battery**: Optimize for mobile battery life (efficient animations, reduced CPU usage)

**Rationale**: Majority of users play on mobile devices - desktop is secondary platform

---

## Architecture Principles

### Separation of Concerns

```
presentation/        → React components, UI logic (mobile-first)
├── components/      → Reusable UI primitives
│   ├── mobile/      → Mobile-specific components (BottomSheet, GestureArea, SafeArea)
│   ├── game/        → Game components (PokerTable, ActionButtons)
│   └── ui/          → Base UI (Button, Slider, Toast)
├── pages/           → Game screens (HomePage, GamePage)
├── hooks/           → Custom React hooks (useOrientation, useGesture, useHaptic)
├── gestures/        → Touch gesture recognizers
└── styles/          → Mobile-first CSS (safe-area.css, touch.css)

game-logic/          → Pure TypeScript game engine (device-agnostic)
├── engine/          → Core game loop, state machine
├── rules/           → Poker rules validation
├── evaluation/      → Hand ranking (PokerHandEvaluator integration)
└── pot/             → Pot calculation and side pots

bot-ai/              → Bot decision-making (device-agnostic)
├── strategies/      → Easy, Medium, Hard strategies
├── personality/     → Bot behavior traits (persistent across games)
└── decision/        → Action selection logic

state-management/    → Zustand stores
├── game-state/      → Current game state (cards, pot, players)
├── player-state/    → Player stats, chips, settings
└── ui-state/        → UI visibility, animations
```

### Technology Constraints

**Required**:
- TypeScript 5.x (strict mode)
- React 18+ (functional components, hooks)
- Zustand 4.x (state management)
- Testing framework (Jest + React Testing Library + Playwright for E2E)
- Build tool (Vite 5.x with PWA plugin)
- **Hand Evaluator**: [PokerHandEvaluator](https://github.com/HenryRLee/PokerHandEvaluator) (C++ with WASM or TypeScript port)
- **PWA**: vite-plugin-pwa for offline support
- **Icons**: Lucide React (no emojis)
- **Mobile Browsers**: iOS Safari 15+, Chrome Android 100+, Samsung Internet 16+

**Prohibited**:
- No external APIs or backend services
- No database (SQLite, IndexedDB discouraged - use localStorage only for settings/bot personalities)
- No WebSocket/network communication
- No server-side code
- No other hand evaluation libraries (only PokerHandEvaluator)

---

## Quality Gates

### Phase Completion Criteria

Each phase MUST pass these gates before proceeding:

1. **All tests passing** (unit + integration)
2. **Code coverage ≥80%** for game logic
3. **TypeScript compilation** with zero errors (strict mode)
4. **ESLint/Prettier** with zero errors
5. **Manual playtest** of new features
6. **Performance check** (no frame drops, <100ms actions)

### Definition of Done

A task is "Done" when:
- [ ] Tests written and passing (TDD: RED → GREEN → REFACTOR)
- [ ] Code reviewed for quality and correctness
- [ ] Documentation updated (code comments, README)
- [ ] No console errors or warnings
- [ ] Animations smooth and polished
- [ ] Feature works as specified in acceptance criteria

---

## Principles in Action

### Example: Implementing Side Pot Calculation

**Principle II (Complete Rules)** requires accurate side pot calculation.

**TDD Approach (Principle I)**:
```typescript
// RED: Write failing test first
test('should calculate side pots for 3-player all-in', () => {
  const players = [
    { id: 'A', bet: 25, stack: 0 },  // all-in $25
    { id: 'B', bet: 75, stack: 0 },  // all-in $75
    { id: 'C', bet: 100, stack: 25 } // call $100
  ];

  const pots = calculateSidePots(players);

  expect(pots.mainPot).toBe(75);  // $25 × 3
  expect(pots.sidePots).toHaveLength(2);
  expect(pots.sidePots[0]).toEqual({ amount: 100, eligible: ['B', 'C'] });
  expect(pots.sidePots[1]).toEqual({ amount: 25, eligible: ['C'] });
});

// GREEN: Implement minimum code to pass
function calculateSidePots(players) {
  // ... implementation
}

// REFACTOR: Clean up while keeping tests green
```

**Production Quality (Principle III)**:
- Type-safe implementation with interfaces
- Edge case handling (odd chips, 4+ players)
- Performance optimization (O(n log n) algorithm)

---

## Success Metrics

### Technical Metrics
- **Test Coverage**: ≥80% for game logic, ≥60% for UI
- **Performance (Mobile)**: 60fps animations on iPhone 11 and Pixel 5, <100ms action response
- **Code Quality**: Zero ESLint errors, TypeScript strict mode
- **Build Size**: <500KB initial bundle (gzipped), <1MB total with assets
- **Battery Usage**: <15% battery consumption for 30-minute session on mobile
- **Offline Support**: 100% functionality offline after first load (PWA)

### Gameplay Metrics
- **Correctness**: 100% accurate poker rules (verified by test suite)
- **Bot Quality**: Win rates vary naturally in mixed difficulty games (validated by 1000-hand simulation)
- **User Engagement (Mobile)**: Average session >20 minutes (measured via playtesting with 50+ mobile users)

### User Experience Metrics
- **Time to First Hand (Mobile)**: <15 seconds from app launch on mobile device
- **Action Clarity**: 100% of playtesters understand available actions (tested on mobile)
- **Touch Gestures**: <2% mis-recognition rate (swipe, tap, long-press)
- **Visual Polish (Mobile)**: 95%+ playtesters rate mobile UI as "professional"
- **PWA Installation**: >30% installation rate after 3 game sessions

---

## Risk Mitigation

### Risk: Incorrect Poker Rules
**Mitigation**: Comprehensive test suite with edge cases (200+ tests), manual verification against official rules

### Risk: Poor Bot AI
**Mitigation**: Playtest each bot level, iterate on strategy, validate win rates in mixed games

### Risk: Mobile Performance Issues
**Mitigation**: Profile on target devices (iPhone 11, Pixel 5), optimize animations for 60fps, battery profiling

### Risk: Touch Gesture Conflicts
**Mitigation**: Test gestures thoroughly, implement cancellation (reverse swipe), prevent conflicts with native scroll

### Risk: Poor Mobile UX
**Mitigation**: Test with real mobile users (20+ playtesters), ensure thumb zones accessible, test both orientations

### Risk: Scope Creep
**Mitigation**: Strict adherence to mobile-first standalone game scope, defer desktop optimization and multiplayer

---

## Out of Scope (Post-Launch)

The following features are explicitly EXCLUDED from initial release:

- Multiplayer/online gameplay (requires backend infrastructure)
- Tournament mode (structured blinds, elimination format, prize pools)
- Real money or cryptocurrency integration
- User accounts and profiles (persistent across devices via cloud sync)
- Leaderboards (requires backend)
- Other poker variants (Omaha, 7-Card Stud, Razz, etc.)
- Native mobile apps (iOS App Store, Google Play - current is PWA only)
- Desktop-optimized layouts (responsive design covers desktop but mobile is priority)
- Advanced statistics and hand history (VPIP, PFR, aggression factor, hand replayer)
- Multiplayer features (chat, spectator mode, friend invitations)

These may be considered for future versions but are not part of the standalone mobile game MVP.

---

**Constitution Version**: 2.0 (Mobile-First)
**Last Updated**: 2025-11-18
**Status**: Active - All principles enforced (including mobile-first)
