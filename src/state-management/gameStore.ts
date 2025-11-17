import { create } from 'zustand';
import { GameEngine } from '@/game-logic/engine/GameEngine';
import { createBotStrategy } from '@/bot-ai/strategies/BotStrategy';
import type { GameState, GameSettings, ActionType } from '@/types';

interface GameStore {
  // State
  gameEngine: GameEngine | null;
  gameState: GameState | null;
  isProcessingAction: boolean;

  // Actions
  initializeGame: (settings: GameSettings, playerName?: string) => void;
  processPlayerAction: (playerId: string, action: ActionType, amount?: number) => void;
  processBotActions: () => Promise<void>;
  startNewHand: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameEngine: null,
  gameState: null,
  isProcessingAction: false,

  initializeGame: (settings: GameSettings, playerName: string = 'You') => {
    const engine = new GameEngine();
    engine.initializeGame(settings, playerName);

    set({
      gameEngine: engine,
      gameState: engine.getState() as GameState,
    });

    // Start bot actions if first player is bot
    setTimeout(() => {
      get().processBotActions();
    }, 1000);
  },

  processPlayerAction: (playerId: string, action: ActionType, amount: number = 0) => {
    const { gameEngine } = get();
    if (!gameEngine) return;

    set({ isProcessingAction: true });

    try {
      gameEngine.processAction(playerId, action, amount);
      set({ gameState: gameEngine.getState() as GameState });

      // Process bot actions after player action
      setTimeout(() => {
        get().processBotActions();
      }, 500);
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      set({ isProcessingAction: false });
    }
  },

  processBotActions: async () => {
    const { gameEngine, gameState } = get();
    if (!gameEngine || !gameState) return;

    // Check if we're in a phase where actions can be taken
    if (!['preflop', 'flop', 'turn', 'river'].includes(gameState.phase)) {
      return;
    }

    const currentPlayer = gameEngine.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== 'bot') {
      return;
    }

    set({ isProcessingAction: true });

    try {
      // Get bot strategy
      const difficulty = currentPlayer.botDifficulty || 'medium';
      const strategy = createBotStrategy(difficulty);

      // Get bot decision
      const decision = strategy.makeDecision(currentPlayer, gameState);

      // Wait for thinking delay
      await new Promise((resolve) => setTimeout(resolve, strategy.getThinkingDelay()));

      // Process bot action
      gameEngine.processAction(currentPlayer.id, decision.action, decision.amount);
      set({ gameState: gameEngine.getState() as GameState });

      // Continue processing if next player is also a bot
      setTimeout(() => {
        get().processBotActions();
      }, 300);
    } catch (error) {
      console.error('Error processing bot action:', error);
    } finally {
      set({ isProcessingAction: false });
    }
  },

  startNewHand: () => {
    const { gameEngine } = get();
    if (!gameEngine) return;

    gameEngine.startNewHand();
    set({ gameState: gameEngine.getState() as GameState });

    // Start bot actions
    setTimeout(() => {
      get().processBotActions();
    }, 1000);
  },

  reset: () => {
    set({
      gameEngine: null,
      gameState: null,
      isProcessingAction: false,
    });
  },
}));
