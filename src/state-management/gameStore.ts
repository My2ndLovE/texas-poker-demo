import { create } from 'zustand';
import { GameState } from '@/game-logic/models/GameState';
import { GameEngine } from '@/game-logic/engine/GameEngine';
import { Action } from '@/game-logic/models/Action';
import { EasyBotStrategy } from '@/bot-ai/strategies/EasyBotStrategy';
import { MediumBotStrategy } from '@/bot-ai/strategies/MediumBotStrategy';
import { HardBotStrategy } from '@/bot-ai/strategies/HardBotStrategy';
import { GamePhase, PlayerStatus } from '@/utils/constants';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface SessionStats {
  handsPlayed: number;
  handsWon: number;
  biggestPot: number;
  totalWinnings: number;
  currentStreak: number;
  startingChips: number;
}

interface GameStore {
  gameState: GameState | null;
  gameEngine: GameEngine;
  botStrategies: {
    easy: EasyBotStrategy;
    medium: MediumBotStrategy;
    hard: HardBotStrategy;
  };
  botDifficulty: BotDifficulty;
  isProcessing: boolean;
  sessionStats: SessionStats;

  // Actions
  initializeGame: (playerName: string, botCount: number, startingChips: number) => void;
  startNewHand: () => void;
  processPlayerAction: (action: Action) => void;
  processBotActions: () => Promise<void>;
  setBotDifficulty: (difficulty: BotDifficulty) => void;
  updateStats: (wonAmount: number, potSize: number, isWinner: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  gameEngine: new GameEngine(),
  botStrategies: {
    easy: new EasyBotStrategy(),
    medium: new MediumBotStrategy(),
    hard: new HardBotStrategy(),
  },
  botDifficulty: 'medium',
  isProcessing: false,
  sessionStats: {
    handsPlayed: 0,
    handsWon: 0,
    biggestPot: 0,
    totalWinnings: 0,
    currentStreak: 0,
    startingChips: 0,
  },

  initializeGame: (playerName: string, botCount: number, startingChips: number) => {
    const { gameEngine } = get();

    const players = [
      { name: playerName, isBot: false, chips: startingChips },
      ...Array.from({ length: botCount }, (_, i) => ({
        name: `Bot ${i + 1}`,
        isBot: true,
        chips: startingChips,
      })),
    ];

    const gameState = gameEngine.createGame(players, 5, 10);
    set({
      gameState,
      sessionStats: {
        handsPlayed: 0,
        handsWon: 0,
        biggestPot: 0,
        totalWinnings: 0,
        currentStreak: 0,
        startingChips,
      },
    });
  },

  startNewHand: () => {
    const { gameState, gameEngine } = get();
    if (!gameState) return;

    // Check if enough players to start (minimum 2)
    const activePlayers = gameState.players.filter((p) => p.chips > 0);
    if (activePlayers.length < 2) {
      return; // Not enough players to start a hand
    }

    const newState = gameEngine.startHand(gameState);
    set({ gameState: newState });

    // Trigger bot actions if first player is bot
    setTimeout(() => {
      get().processBotActions();
    }, 1000);
  },

  processPlayerAction: (action: Action) => {
    const { gameState, gameEngine } = get();
    if (!gameState) return;

    const newState = gameEngine.processAction(gameState, action);
    set({ gameState: newState });

    // Trigger bot actions after player action
    setTimeout(() => {
      get().processBotActions();
    }, 500);
  },

  processBotActions: async () => {
    const { gameState, gameEngine, botStrategies, botDifficulty, isProcessing } = get();

    if (!gameState || isProcessing) return;
    if (gameState.phase === GamePhase.HandComplete || gameState.phase === GamePhase.Showdown) {
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // If current player is not a bot or is folded/all-in, skip
    if (
      !currentPlayer ||
      !currentPlayer.isBot ||
      currentPlayer.status === PlayerStatus.Folded ||
      currentPlayer.status === PlayerStatus.AllIn
    ) {
      return;
    }

    set({ isProcessing: true });

    // Get bot decision
    const strategy = botStrategies[botDifficulty];
    const decision = strategy.decide(currentPlayer, gameState);

    // Simulate thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

    // Process bot action
    const action: Action = {
      type: decision.action,
      playerId: currentPlayer.id,
      amount: decision.amount,
      timestamp: Date.now(),
    };

    const newState = gameEngine.processAction(gameState, action);
    set({ gameState: newState, isProcessing: false });

    // Continue with next bot if needed
    setTimeout(() => {
      get().processBotActions();
    }, 500);
  },

  setBotDifficulty: (difficulty: BotDifficulty) => {
    set({ botDifficulty: difficulty });
  },

  updateStats: (wonAmount: number, potSize: number, isWinner: boolean) => {
    const { sessionStats } = get();

    set({
      sessionStats: {
        ...sessionStats,
        handsPlayed: sessionStats.handsPlayed + 1,
        handsWon: isWinner ? sessionStats.handsWon + 1 : sessionStats.handsWon,
        biggestPot: Math.max(sessionStats.biggestPot, potSize),
        totalWinnings: sessionStats.totalWinnings + wonAmount,
        currentStreak: isWinner ? sessionStats.currentStreak + 1 : 0,
      },
    });
  },
}));
