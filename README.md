# Texas Hold'em Poker - Single Player Game

A standalone Texas Hold'em poker game built with React, TypeScript, and pokersolver. Play against AI opponents with varying difficulty levels.

## Features

- ✅ Complete Texas Hold'em poker rules implementation
- 🤖 AI opponents with Easy, Medium, and Hard difficulty levels
- 📊 Hand strength indicator with equity calculations
- 💾 Auto-save game state to localStorage
- 📱 Responsive design (desktop, tablet, mobile landscape)
- 🎯 TDD approach with 80%+ test coverage target

## Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Hand Evaluation**: pokersolver (battle-tested, 2,700+ weekly downloads)
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── game-logic/           # Core poker game logic
│   ├── models/          # Data models (Card, Player, etc.)
│   ├── rules/           # Poker rules implementation
│   ├── evaluation/      # Hand evaluation using pokersolver
│   ├── pot-calculation/ # Pot and side pot calculations
│   └── state-machine/   # Game phase management
├── bot-ai/              # Bot AI strategies
│   ├── strategy/        # Easy/Medium/Hard strategies
│   ├── personality/     # Bot personality traits
│   └── analysis/        # Opponent stat tracking
├── state-management/    # Zustand stores
├── presentation/        # React components
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── styles/         # CSS modules
│   └── hooks/          # Custom React hooks
├── utils/              # Utility functions
└── __tests__/          # Test files
    ├── unit/           # Unit tests
    ├── integration/    # Integration tests
    └── e2e/           # End-to-end tests
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Development Workflow

This project follows **Test-Driven Development (TDD)**:

1. **RED**: Write failing test first
2. **GREEN**: Write minimum code to make test pass
3. **REFACTOR**: Improve code while keeping tests green

## Implementation Phases

- ✅ **Phase 1**: Foundation & Setup (10h) - Current
- ⏳ **Phase 2**: Game Logic Core (48h)
- ⏳ **Phase 3**: Bot AI Implementation (30h)
- ⏳ **Phase 4**: UI Components (39h)
- ⏳ **Phase 5**: Integration & Polish (31.5h)
- ⏳ **Phase 6**: Testing & Refinement (23h)
- ⏳ **Phase 7**: Deployment & Launch (13h)

**Total Estimated Time**: 202.5 hours (8-9 weeks for solo developer)

## Design Decisions

### Why pokersolver?

- **Battle-tested**: 2,700+ weekly downloads, used by 1,100+ repos
- **Proven reliability**: 7+ years of production usage
- **Perfect performance**: 500k-1M hands/sec (50-100x more than needed)
- **Simple API**: Synchronous, no WebAssembly complexity
- **Community support**: Large user base, well-documented

### Why Simple Equity Calculator?

For MVP, we use:
- **Preflop**: Precomputed equity table (169 starting hands) - Accurate
- **Post-flop**: Hand strength approximation - Good enough for learning

Future enhancement: Add exact Monte Carlo simulation for post-flop equity

## Contributing

This is a solo development project for learning purposes. Contributions are welcome!

## License

MIT

## Project Status

🚧 **Phase 1: Foundation & Setup** - In Progress

Next: Implement core game logic (deck, cards, hand evaluation)
