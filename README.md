# Texas Hold'em Poker Game

A production-quality, single-player Texas Hold'em poker game built with React, TypeScript, and XState.

## Features

- ✅ Complete Texas Hold'em poker rules implementation
- ✅ Intelligent bot opponents with 3 difficulty levels (Easy, Medium, Hard)
- ✅ Professional UI with smooth animations (Framer Motion)
- ✅ State machine-based game logic (XState v5)
- ✅ Battle-tested hand evaluation (pokersolver)
- ✅ Comprehensive test coverage (Vitest + Playwright)
- ✅ TypeScript strict mode (type safety)
- ✅ Internationalization ready (react-i18next)
- ✅ Responsive design (Tailwind CSS)

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18.2+ | UI components |
| **Language** | TypeScript 5.x | Type safety |
| **Build** | Vite 5.x | Fast dev server + bundling |
| **State** | XState v5 | Game state machine |
| **Testing** | Vitest + Playwright | Unit + E2E tests |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Animations** | Framer Motion | Professional animations |
| **Hand Eval** | pokersolver | Battle-tested hand evaluation |
| **i18n** | react-i18next | Internationalization |

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Development Tools

```bash
# Lint code
npm run lint

# Format code
npm run format

# Start Storybook (component development)
npm run storybook
```

## Project Structure

```
src/
├── presentation/           # React UI layer
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   └── styles/           # CSS styles
├── game-logic/           # Pure TypeScript game engine
│   ├── engine/           # Core game loop
│   ├── rules/            # Poker rules
│   ├── evaluation/       # Hand evaluation
│   └── pot/              # Pot calculation
├── bot-ai/               # Bot decision-making
│   ├── strategies/       # Easy, Medium, Hard strategies
│   ├── personality/      # Bot behavior traits
│   └── decision/         # Action selection
├── state-management/     # XState machines
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── locales/              # i18n translation files

tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
└── e2e/                  # End-to-end tests
```

## Architecture

This game uses **XState v5** for state management, modeling poker as a finite state machine:

```
Menu → InGame → PostBlinds → Preflop → Flop → Turn → River → Showdown → HandComplete
```

This approach ensures:
- ✅ Impossible states are eliminated (can't skip from Preflop to River)
- ✅ All state transitions are explicit and type-safe
- ✅ Visual state charts for debugging
- ✅ Time-travel debugging capabilities

## Game Rules

Complete Texas Hold'em rules implemented:
- Blind posting (small blind, big blind, heads-up rules)
- Burn cards (1 before flop, turn, river)
- Dealer button rotation
- All betting actions (fold, check, call, bet, raise, all-in)
- Minimum raise validation
- Side pot calculation (multiple all-ins)
- Hand evaluation (all 10 hand ranks)
- Tie-breaking and kicker logic
- Odd chip distribution

## Bot AI

Three difficulty levels with distinct strategies:

### Easy Bot
- Random actions with basic logic
- Folds bad hands, calls good hands
- Aggression: 0.3, Tightness: 0.3

### Medium Bot
- Basic strategy with position awareness
- Considers pot odds
- Aggression: 0.5, Tightness: 0.5

### Hard Bot
- Advanced strategy with bluffing
- Hand reading capabilities
- Adaptive play
- Aggression: 0.7, Tightness: 0.6

## Performance

- Bundle size: ~425 KB gzipped (production)
- Hand evaluation: 500k-1M hands/second
- Animations: 60fps target
- Time to Interactive: <2s

## Contributing

This is a demonstration project showcasing production-quality code practices:
- TDD (Test-Driven Development)
- TypeScript strict mode
- Comprehensive testing (80% coverage target)
- Clean architecture (separation of concerns)
- Professional UI/UX

## License

MIT

## Credits

- Hand evaluation: [pokersolver](https://github.com/goldfire/pokersolver)
- Icons: [Lucide React](https://lucide.dev/)
- Built with modern web technologies
