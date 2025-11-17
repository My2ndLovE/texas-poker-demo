import { create } from 'zustand';
import { GameEngine } from '../game-logic/engine/GameEngine';
import { Player, createPlayer } from '../game-logic/models/Player';
import { GameState } from '../game-logic/models/GameState';
import { BotPlayer, BotDifficulty } from '../bot-ai/BotPlayer';

interface GameStore {
  engine: GameEngine | null;
  gameState: GameState | null;
  botPlayers: Map<string, BotPlayer>;
  isProcessingBots: boolean;

  // Actions
  initializeGame: (numBots: number, startingChips: number, smallBlind: number, bigBlind: number, botDifficulty: BotDifficulty) => void;
  startNewHand: () => void;
  playerAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => void;
  processBotActions: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engine: null,
  gameState: null,
  botPlayers: new Map(),
  isProcessingBots: false,

  initializeGame: (numBots, startingChips, smallBlind, bigBlind, botDifficulty) => {
    // Create human player
    const humanPlayer = createPlayer('human', 'You', startingChips, 0, false);

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
    });

    // Process bot actions if it's a bot's turn
    setTimeout(() => get().processBotActions(), 1000);
  },

  startNewHand: () => {
    const { engine } = get();
    if (!engine) return;

    engine.startNewHand();
    set({ gameState: engine.getState(), isProcessingBots: false });

    // Process bot actions if needed
    setTimeout(() => get().processBotActions(), 1000);
  },

  playerAction: (action, amount) => {
    const { engine, isProcessingBots } = get();
    if (!engine || isProcessingBots) return;

    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.isBot) return;

    const success = engine.playerAction(currentPlayer.id, action, amount);
    if (success) {
      set({ gameState: engine.getState() });

      // Process bot actions after human action
      setTimeout(() => get().processBotActions(), 800);
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

  resetGame: () => {
    set({
      engine: null,
      gameState: null,
      botPlayers: new Map(),
      isProcessingBots: false,
    });
  },
}));
