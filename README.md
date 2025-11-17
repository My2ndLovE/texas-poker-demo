# Standalone Texas Hold'em Poker Game

A production-quality, mobile-first Texas Hold'em poker game playable entirely in the browser. Play against intelligent bot opponents with complete poker rules, smooth animations, and professional gameplay experience.

## ✨ Features

- 🎴 **Complete Texas Hold'em Rules**: All poker rules correctly implemented
- 🤖 **Intelligent Bot Opponents**: Three difficulty levels (Easy, Medium, Hard)
- 📱 **Mobile-First Design**: Optimized for smartphones, tablets, and desktop
- 🎨 **Professional UI**: Beautiful poker table with smooth animations
- 🔄 **Offline Play**: Works offline after first load (PWA)
- ♿ **Accessible**: WCAG 2.1 Level AA compliant
- 🎯 **Touch Optimized**: Haptic feedback, large touch targets, swipe gestures

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

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

## 📦 Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run type-check` - Check TypeScript types

## 🏗️ Technology Stack

- **Frontend**: React 18.2 + TypeScript 5.x (strict mode)
- **State Management**: Zustand 4.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Testing**: Jest 30.x + React Testing Library
- **Hand Evaluator**: pokersolver (battle-tested, 2,700+ weekly downloads)
- **Icons**: Lucide React
- **Localization**: react-i18next

## 📱 Platform Support

- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Firefox Mobile 90+, Samsung Internet 14+
- **Desktop**: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Screen Sizes**: Mobile (375px+), Tablet (768px+), Desktop (1366px+)

## 🎮 How to Play

1. Click "Quick Play" to start a game
2. Play against 5 bot opponents (configurable 1-8)
3. Use touch controls on mobile or keyboard shortcuts on desktop
4. Win chips by making the best poker hand!

### Keyboard Shortcuts (Desktop)

- `F` - Fold
- `C` - Call/Check
- `R` - Raise
- `A` - All-In
- `Enter` - Confirm action
- `Escape` - Cancel/Close

### Touch Gestures (Mobile)

- **Tap** - Select action
- **Drag** - Adjust raise amount
- **Swipe Up** - View action history
- **Swipe Down** - Dismiss modals
- **Pinch** - Zoom cards

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### Coverage Targets

- Game Logic: ≥80%
- UI Components: ≥60%

## 📚 Documentation

- [PRD (Product Requirements Document)](./specs/spec.md)
- [Implementation Plan](./specs/plan.md)
- [Task Breakdown](./specs/tasks.md)
- Architecture Guide: `./docs/ARCHITECTURE.md` (coming soon)
- Game Rules Reference: `./docs/GAME_RULES.md` (coming soon)
- Bot AI Documentation: `./docs/BOT_AI.md` (coming soon)

## 🤝 Contributing

This is a solo development project for demonstration purposes. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own poker game.

## 🙏 Acknowledgments

- [pokersolver](https://github.com/goldfire/pokersolver) - Hand evaluation library
- React team for an excellent framework
- All open-source contributors

---

**Version**: 1.0.0 (Mobile-First)
**Status**: In Development
**Last Updated**: 2025-11-18
