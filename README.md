# Texas Hold'em Poker Game

A production-quality, standalone Texas Hold'em poker game built with React, TypeScript, and intelligent bot opponents.

## Features

- **Complete Texas Hold'em Rules**: All poker rules correctly implemented including:
  - Blind posting (small blind, big blind, heads-up rules)
  - Burn cards before flop, turn, and river
  - Dealer button rotation
  - All betting actions (fold, check, call, bet, raise, all-in)
  - Side pot calculation for multiple all-ins
  - Hand evaluation (all 10 hand ranks with tie-breaking)

- **Intelligent Bot Opponents**: Three difficulty levels
  - **Easy**: Random-based decisions (35-40% win rate)
  - **Medium**: Position-aware with pot odds (45-50% win rate)
  - **Hard**: Advanced strategy with implied odds and bluffing (55-60% win rate)

- **Professional UI**:
  - Clean poker table layout
  - Playing card components
  - Smooth transitions
  - Responsive design

- **Client-Side Only**: No backend, no database - runs 100% in the browser

## Tech Stack

- **React 18.2** - UI framework
- **TypeScript 5.x** - Type safety (strict mode)
- **Zustand 4.x** - State management
- **Tailwind CSS** - Styling
- **Vite 5.x** - Build tool
- **poker-evaluator** - Hand evaluation
- **Jest + React Testing Library** - Testing (73 tests, all passing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:cov
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Game Rules

### Texas Hold'em Basics

1. Each player receives 2 hole cards (face down)
2. Five community cards are dealt in stages:
   - Flop: 3 cards
   - Turn: 1 card
   - River: 1 card
3. Players make the best 5-card hand from their 2 hole cards + 5 community cards
4. Betting rounds occur after each stage
5. Best hand wins the pot (or last player standing if all others fold)

### Hand Rankings (Highest to Lowest)

1. Royal Flush (A-K-Q-J-T same suit)
2. Straight Flush (5 cards in sequence, same suit)
3. Four of a Kind
4. Full House (3 of a kind + pair)
5. Flush (5 cards same suit)
6. Straight (5 cards in sequence)
7. Three of a Kind
8. Two Pair
9. One Pair
10. High Card

## Project Structure

```
src/
├── game-logic/          # Pure TypeScript game engine
│   ├── engine/          # Game state machine
│   ├── rules/           # Betting and position rules
│   ├── evaluation/      # Hand evaluation
│   ├── pot/             # Pot and side pot calculation
│   ├── deck/            # Card deck with Fisher-Yates shuffle
│   └── models/          # TypeScript interfaces
├── bot-ai/              # Bot decision-making
│   ├── strategies/      # Easy, Medium, Hard strategies
│   └── analysis/        # Hand strength analysis
├── presentation/        # React components
│   ├── components/      # UI components
│   └── pages/           # Game pages
├── state-management/    # Zustand stores
├── utils/               # Constants and utilities
└── localization/        # i18n support
```

## Test Coverage

- **73 passing tests** covering:
  - Deck operations (Fisher-Yates shuffle)
  - Hand evaluation (all 10 ranks + royal flush detection)
  - Pot calculation (single and multiple side pots)
  - Betting rules (24 test cases)
  - Position rules (heads-up and multi-player)

## Configuration

Game settings can be adjusted in the start menu:

- **Player Name**: Your display name
- **Bot Count**: 1-8 bot opponents
- **Starting Chips**: $500, $1,000, $2,000, or $5,000
- **Bot Difficulty**: Easy, Medium, or Hard

## Development

### Code Quality

- **TypeScript Strict Mode**: No `any` types allowed
- **ESLint + Prettier**: Code formatting enforced
- **TDD Approach**: Tests written before implementation

### Key Implementation Details

- **Hand Evaluator**: Uses `poker-evaluator` library (Two Plus Two algorithm)
- **Side Pots**: Correctly handles multiple all-ins with proper eligibility
- **Bot AI**: Position-aware with pot odds and implied odds calculations
- **State Management**: Zustand for simple, performant state updates

## Known Limitations

- No multiplayer support (single-player only)
- No tournament mode (cash game only)
- No persistent game state (game resets on page refresh)
- No sound effects (deferred to post-MVP)
- Desktop/laptop optimized (mobile support planned)

## Future Enhancements

- Tournament mode
- Hand history and statistics
- Customizable table themes
- Sound effects and music
- Mobile responsive design
- Replay functionality

## License

MIT License - feel free to use this project for learning or as a starting point for your own poker game.

## Acknowledgments

- Built following TDD principles from the PRD spec-kit
- Hand evaluation powered by `poker-evaluator` library
- Inspired by professional poker rules and strategies

---

**Enjoy playing Texas Hold'em Poker!** 🃏♠️♥️♦️♣️
