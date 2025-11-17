import { create } from 'zustand';
import { GameEngine } from '../game-logic/engine/GameEngine';
import { Player, createPlayer } from '../game-logic/models/Player';
import { GameState } from '../game-logic/models/GameState';
import { BotPlayer, BotDifficulty } from '../bot-ai/BotPlayer';

export interface GameStatistics {
  handsPlayed: number;
  handsWon: number;
  biggestPotWon: number;
  totalWinnings: number;
  startingChips: number;
}

interface GameStore {
  engine: GameEngine | null;
  gameState: GameState | null;
  botPlayers: Map<string, BotPlayer>;
  isProcessingBots: boolean;
  statistics: GameStatistics;

  // Actions
  initializeGame: (playerName: string, numBots: number, startingChips: number, smallBlind: number, bigBlind: number, botDifficulty: BotDifficulty) => void;
  startNewHand: () => void;
  playerAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => void;
  processBotActions: () => void;
  dismissShowdown: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engine: null,
  gameState: null,
  botPlayers: new Map(),
  isProcessingBots: false,
  statistics: {
    handsPlayed: 0,
    handsWon: 0,
    biggestPotWon: 0,
    totalWinnings: 0,
    startingChips: 0,
  },

  initializeGame: (playerName, numBots, startingChips, smallBlind, bigBlind, botDifficulty) => {
    // Create human player
    const humanPlayer = createPlayer('human', playerName || 'You', startingChips, 0, false);

    // Create bot players
    const botPlayers = new Map<string, BotPlayer>();
    const allPlayers: Player[] = [humanPlayer];

    for (let i = 0; i < numBots; i++) {
      const botId = `bot-${i}`;
      const botName = `Bot ${i + 1}`;
      const bot = createPlayer(botId, botName, startingChips, i + 1, true);
      allPlayers.push(bot);

      // Create bot AI
      botPlayers.set(botId, new BotPlayer(botDifficulty));
    }

    // Create game engine
    const engine = new GameEngine(allPlayers, smallBlind, bigBlind);
    engine.startNewHand();

    set({
      engine,
      gameState: engine.getState(),
      botPlayers,
      isProcessingBots: false,
      statistics: {
        handsPlayed: 0,
        handsWon: 0,
        biggestPotWon: 0,
        totalWinnings: 0,
        startingChips,
      },
    });

    // Process bot actions if it's a bot's turn
    setTimeout(() => get().processBotActions(), 1000);
  },

  startNewHand: () => {
    try {
      const { engine, statistics } = get();
      if (!engine) return;

      // Track statistics before starting new hand
      const currentState = engine.getState();
      if (currentState?.showdownResult && currentState.showdownResult.winners) {
        const humanPlayer = currentState.players.find((p) => !p.isBot);
        if (humanPlayer) {
          const wonThisHand = currentState.showdownResult.winners.some((w) => w?.playerId === 'human');
          const potWon = wonThisHand
            ? currentState.showdownResult.winners.find((w) => w?.playerId === 'human')?.amount || 0
            : 0;

          // Ensure statistics values are valid numbers
          set({
            statistics: {
              ...statistics,
              handsPlayed: Math.max(0, statistics.handsPlayed + 1),
              handsWon: wonThisHand ? Math.max(0, statistics.handsWon + 1) : statistics.handsWon,
              biggestPotWon: Math.max(0, statistics.biggestPotWon, potWon),
              totalWinnings: Math.max(0, statistics.totalWinnings + potWon),
            },
          });
        }
      }

      engine.startNewHand();
      const newState = engine.getState();
      if (newState) {
        set({ gameState: newState, isProcessingBots: false });
      }

      // Process bot actions if needed
      setTimeout(() => get().processBotActions(), 1000);
    } catch (error) {
      console.error('Error in startNewHand:', error);
      set({ isProcessingBots: false });
    }
  },

  playerAction: (action, amount) => {
    try {
      const { engine, isProcessingBots } = get();
      if (!engine || isProcessingBots) return;

      const currentPlayer = engine.getCurrentPlayer();
      if (!currentPlayer || currentPlayer.isBot) return;

      // Validate action and amount
      if (!action || (action === 'raise' && (!amount || amount < 0 || !isFinite(amount)))) {
        console.warn('Invalid action or amount:', action, amount);
        return;
      }

      const success = engine.playerAction(currentPlayer.id, action, amount);
      if (success) {
        const newState = engine.getState();
        if (newState) {
          set({ gameState: newState });
        }

        // Process bot actions after human action
        setTimeout(() => get().processBotActions(), 800);
      }
    } catch (error) {
      console.error('Error in playerAction:', error);
    }
  },

  processBotActions: () => {
    const { engine, botPlayers, isProcessingBots } = get();
    if (!engine || isProcessingBots) return;

    set({ isProcessingBots: true });

    // Process bot actions with delays for visibility
    const processSingleBotAction = () => {
      const currentState = engine.getState();
      const currentPlayer = engine.getCurrentPlayer();

      // Stop if game is over or in showdown
      if (currentState.phase === 'showdown' || !currentPlayer) {
        set({ isProcessingBots: false });

        // Auto-start new hand after showdown
        if (currentState.phase === 'showdown' && !engine.isGameOver()) {
          setTimeout(() => get().startNewHand(), 3000);
        }
        return;
      }

      // Stop if it's human player's turn
      if (!currentPlayer.isBot) {
        set({ isProcessingBots: false, gameState: currentState });
        return;
      }

      // Bot's turn - make decision
      const botAI = botPlayers.get(currentPlayer.id);
      if (!botAI) {
        set({ isProcessingBots: false });
        return;
      }

      const decision = botAI.decideAction(currentPlayer, currentState);
      const success = engine.playerAction(currentPlayer.id, decision.action, decision.amount);

      if (success) {
        const newState = engine.getState();
        set({ gameState: newState });

        // Continue processing if still bot's turn, with delay for visibility
        setTimeout(() => processSingleBotAction(), 1200);
      } else {
        set({ isProcessingBots: false });
      }
    };

    // Start processing chain
    processSingleBotAction();
  },

  dismissShowdown: () => {
    const { engine } = get();
    if (!engine) return;

    // Clear showdown result and start new hand if game isn't over
    if (!engine.isGameOver()) {
      get().startNewHand();
    }
  },

  resetGame: () => {
    set({
      engine: null,
      gameState: null,
      botPlayers: new Map(),
      isProcessingBots: false,
      statistics: {
        handsPlayed: 0,
        handsWon: 0,
        biggestPotWon: 0,
        totalWinnings: 0,
        startingChips: 0,
      },
    });
  },
}));
