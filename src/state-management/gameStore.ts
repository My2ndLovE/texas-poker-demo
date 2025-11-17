import { create } from 'zustand';
import { GameEngine } from '../game-logic/engine/GameEngine';
import { Player, createPlayer } from '../game-logic/models/Player';
import { GameState } from '../game-logic/models/GameState';
import { BotPlayer, BotDifficulty } from '../bot-ai/BotPlayer';

interface GameStore {
  engine: GameEngine | null;
  gameState: GameState | null;
  botPlayers: Map<string, BotPlayer>;

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
    });

    // Process bot actions if it's a bot's turn
    setTimeout(() => get().processBotActions(), 1000);
  },

  startNewHand: () => {
    const { engine } = get();
    if (!engine) return;

    engine.startNewHand();
    set({ gameState: engine.getState() });

    // Process bot actions if needed
    setTimeout(() => get().processBotActions(), 1000);
  },

  playerAction: (action, amount) => {
    const { engine } = get();
    if (!engine) return;

    const currentPlayer = engine.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.isBot) return;

    engine.playerAction(currentPlayer.id, action, amount);
    set({ gameState: engine.getState() });

    // Process bot actions
    setTimeout(() => get().processBotActions(), 500);
  },

  processBotActions: () => {
    const { engine, botPlayers } = get();
    if (!engine) return;

    let currentPlayer = engine.getCurrentPlayer();
    const gameState = engine.getState();

    // Process all consecutive bot actions
    while (currentPlayer && currentPlayer.isBot && gameState.phase !== 'showdown') {
      const botAI = botPlayers.get(currentPlayer.id);
      if (!botAI) break;

      // Bot decides action
      const decision = botAI.decideAction(currentPlayer, gameState);

      // Execute action
      engine.playerAction(currentPlayer.id, decision.action, decision.amount);

      // Get next player
      currentPlayer = engine.getCurrentPlayer();

      // Update state
      set({ gameState: engine.getState() });

      // Small delay between bot actions for visibility
      if (currentPlayer?.isBot) {
        // In real implementation, use setTimeout for async processing
        // For now, continue synchronously
      }
    }

    // Check if hand is over
    if (gameState.phase === 'showdown') {
      // Auto-start new hand after delay
      setTimeout(() => {
        const state = get();
        if (state.engine && !state.engine.isGameOver()) {
          state.startNewHand();
        }
      }, 3000);
    }
  },

  resetGame: () => {
    set({
      engine: null,
      gameState: null,
      botPlayers: new Map(),
    });
  },
}));
