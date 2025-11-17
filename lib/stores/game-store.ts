import { create } from 'zustand';
import { GameState, createInitialGameState, createDefaultSettings } from '../game-logic/models/GameState';
import { Action } from '../game-logic/models/Action';
import { gameEngine } from '../game-logic/engine/GameEngine';
import { simpleBot } from '../bot-ai/SimpleBot';

interface GameStore extends GameState {
  // Actions
  startGame: (playerName: string) => void;
  startNewHand: () => void;
  processPlayerAction: (action: Action) => void;
  processBotActions: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...createInitialGameState(createDefaultSettings()),

  // Start a new game
  startGame: (playerName: string) => {
    set((state) => {
      let newState = gameEngine.initializeGame(state, playerName);
      newState = gameEngine.startNewHand(newState);
      return newState;
    });

    // Process bot actions if needed
    setTimeout(() => get().processBotActions(), 1000);
  },

  // Start a new hand
  startNewHand: () => {
    set((state) => gameEngine.startNewHand(state));
    setTimeout(() => get().processBotActions(), 1000);
  },

  // Process a player action
  processPlayerAction: (action: Action) => {
    set((state) => gameEngine.processAction(state, action));

    // Check if hand is complete
    const currentState = get();
    if (currentState.phase === 'complete') {
      // Wait then start new hand
      setTimeout(() => {
        get().startNewHand();
      }, 3000);
    } else {
      // Process bot actions
      setTimeout(() => get().processBotActions(), 500);
    }
  },

  // Process bot actions automatically
  processBotActions: () => {
    const state = get();

    // Skip if game is complete or waiting
    if (state.phase === 'complete' || state.phase === 'waiting') {
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];

    // If current player is a bot, decide and process action
    if (currentPlayer && currentPlayer.isBot && currentPlayer.status === 'active') {
      const action = simpleBot.decideAction(state, currentPlayer);

      // Add realistic delay
      const delay = 500 + Math.random() * 1500;
      setTimeout(() => {
        get().processPlayerAction(action);
      }, delay);
    }
  },

  // Reset game to initial state
  resetGame: () => {
    set(createInitialGameState(createDefaultSettings()));
  },
}));
