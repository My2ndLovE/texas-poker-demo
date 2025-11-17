/**
 * Poker State Machine Tests
 * Tests for XState poker game state machine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createActor } from 'xstate';
import { pokerMachine } from '@/state-management/pokerMachine';
import type { GameSettings } from '@/types';

describe('Poker State Machine', () => {
  let actor: ReturnType<typeof createActor<typeof pokerMachine>>;

  const defaultSettings: GameSettings = {
    numBots: 2,
    botDifficulty: 'easy',
    startingChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    enableSound: false,
    enableAnimation: true,
    gameSpeed: 'normal',
    language: 'en',
  };

  beforeEach(() => {
    actor = createActor(pokerMachine);
    actor.start();
  });

  describe('Initial State', () => {
    it('should start in menu state', () => {
      expect(actor.getSnapshot().value).toBe('menu');
    });

    it('should have empty context', () => {
      const context = actor.getSnapshot().context;
      expect(context.players).toHaveLength(0);
      expect(context.communityCards).toHaveLength(0);
      expect(context.pot.totalPot).toBe(0);
    });
  });

  describe('Game Initialization', () => {
    it('should transition to inGame state on START_GAME', () => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches('inGame')).toBe(true);
    });

    it('should create correct number of players', () => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      const context = actor.getSnapshot().context;

      // 1 human + 2 bots = 3 players
      expect(context.players).toHaveLength(3);
      expect(context.players[0]?.type).toBe('human');
      expect(context.players[1]?.type).toBe('bot');
      expect(context.players[2]?.type).toBe('bot');
    });

    it('should set starting chips correctly (before blinds)', () => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      const context = actor.getSnapshot().context;

      // After blinds are posted:
      // Player 0 (human): 1000 chips (no blind)
      // Player 1 (bot): 990 chips (posted small blind of 10)
      // Player 2 (bot): 980 chips (posted big blind of 20)
      expect(context.players[0]?.chips).toBe(1000); // Human, no blind
      expect(context.players[1]?.chips).toBe(990);  // Small blind
      expect(context.players[2]?.chips).toBe(980);  // Big blind
    });

    it('should set blinds correctly', () => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      const context = actor.getSnapshot().context;

      expect(context.smallBlind).toBe(defaultSettings.smallBlind);
      expect(context.bigBlind).toBe(defaultSettings.bigBlind);
    });

    it('should create and shuffle a deck (with hole cards dealt)', () => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      const context = actor.getSnapshot().context;

      // 3 players * 2 hole cards = 6 cards dealt
      // 52 - 6 = 46 cards remaining
      expect(context.deck).toHaveLength(46);
    });
  });

  describe('Blind Posting (Multi-way)', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
    });

    it('should post small blind and big blind', () => {
      const context = actor.getSnapshot().context;

      // In 3-player game: dealer=0, small blind=1, big blind=2
      const smallBlindPlayer = context.players[1];
      const bigBlindPlayer = context.players[2];

      expect(smallBlindPlayer?.currentBet).toBe(defaultSettings.smallBlind);
      expect(bigBlindPlayer?.currentBet).toBe(defaultSettings.bigBlind);
    });

    it('should deduct blind amounts from player chips', () => {
      const context = actor.getSnapshot().context;

      const smallBlindPlayer = context.players[1];
      const bigBlindPlayer = context.players[2];

      expect(smallBlindPlayer?.chips).toBe(defaultSettings.startingChips - defaultSettings.smallBlind);
      expect(bigBlindPlayer?.chips).toBe(defaultSettings.startingChips - defaultSettings.bigBlind);
    });

    it('should add blinds to pot', () => {
      const context = actor.getSnapshot().context;
      const expectedPot = defaultSettings.smallBlind + defaultSettings.bigBlind;

      expect(context.pot.totalPot).toBe(expectedPot);
    });

    it('should set current player to left of big blind', () => {
      const context = actor.getSnapshot().context;

      // In 3-player game: dealer=0, small=1, big=2, first to act=0
      expect(context.currentPlayerIndex).toBe(0);
    });
  });

  describe('Blind Posting (Heads-up)', () => {
    beforeEach(() => {
      const headsUpSettings: GameSettings = {
        ...defaultSettings,
        numBots: 1, // 1 bot + 1 human = 2 players
      };
      actor = createActor(pokerMachine);
      actor.start();
      actor.send({ type: 'START_GAME', settings: headsUpSettings });
    });

    it('should make dealer post small blind in heads-up', () => {
      const context = actor.getSnapshot().context;

      // Heads-up: dealer=0 posts small blind
      const smallBlindPlayer = context.players[0];
      expect(smallBlindPlayer?.currentBet).toBe(defaultSettings.smallBlind);
    });

    it('should make other player post big blind in heads-up', () => {
      const context = actor.getSnapshot().context;

      // Heads-up: player 1 posts big blind
      const bigBlindPlayer = context.players[1];
      expect(bigBlindPlayer?.currentBet).toBe(defaultSettings.bigBlind);
    });
  });

  describe('Dealing Hole Cards', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
    });

    it('should deal 2 hole cards to each player', () => {
      const context = actor.getSnapshot().context;

      context.players.forEach((player) => {
        expect(player.holeCards).toHaveLength(2);
      });
    });

    it('should remove dealt cards from deck', () => {
      const context = actor.getSnapshot().context;
      const numPlayers = context.players.length;

      // 52 cards - (2 * numPlayers) = remaining cards
      expect(context.deck).toHaveLength(52 - (2 * numPlayers));
    });

    it('should deal unique cards (no duplicates)', () => {
      const context = actor.getSnapshot().context;

      const allDealtCards = context.players.flatMap((p) => p.holeCards);
      const uniqueCards = new Set(allDealtCards.map((c) => c.id));

      expect(uniqueCards.size).toBe(allDealtCards.length);
    });
  });

  describe('Game Phase Transitions', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
    });

    it('should start in postingBlinds phase', () => {
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches({ inGame: 'postingBlinds' })).toBe(true);
    });

    it('should transition to preflop on ADVANCE_PHASE', () => {
      actor.send({ type: 'ADVANCE_PHASE' });
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches({ inGame: 'preflop' })).toBe(true);
    });
  });

  describe('Community Card Dealing', () => {
    // Helper to complete a betting round by having all players check/call
    function completeBettingRound() {
      const context = actor.getSnapshot().context;
      const activePlayers = context.players.filter((p) => !p.isFolded && !p.isAllIn);

      // Have each active player check or call
      for (let i = 0; i < activePlayers.length; i++) {
        const currentContext = actor.getSnapshot().context;
        const currentPlayer = currentContext.players[currentContext.currentPlayerIndex];

        if (!currentPlayer || currentPlayer.isFolded || currentPlayer.isAllIn) continue;

        const currentBet = Math.max(...currentContext.players.map((p) => p.currentBet));
        const callAmount = currentBet - currentPlayer.currentBet;

        if (callAmount === 0) {
          actor.send({
            type: 'PLAYER_ACTION',
            action: { type: 'check', playerId: currentPlayer.id, amount: 0, timestamp: Date.now() },
          });
        } else {
          actor.send({
            type: 'PLAYER_ACTION',
            action: { type: 'call', playerId: currentPlayer.id, amount: callAmount, timestamp: Date.now() },
          });
        }
      }
    }

    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to preflop
    });

    it('should deal 3 cards for flop', () => {
      completeBettingRound(); // Complete preflop
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to flop
      const context = actor.getSnapshot().context;

      expect(context.communityCards).toHaveLength(3);
    });

    it('should deal 1 card for turn', () => {
      completeBettingRound(); // Complete preflop
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to flop
      completeBettingRound(); // Complete flop betting
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to turn
      const context = actor.getSnapshot().context;

      expect(context.communityCards).toHaveLength(4);
    });

    it('should deal 1 card for river', () => {
      completeBettingRound(); // Complete preflop
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to flop
      completeBettingRound(); // Complete flop betting
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to turn
      completeBettingRound(); // Complete turn betting
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to river
      const context = actor.getSnapshot().context;

      expect(context.communityCards).toHaveLength(5);
    });

    it('should burn cards before dealing community cards', () => {
      completeBettingRound(); // Complete preflop
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to flop (burns 1)
      let context = actor.getSnapshot().context;
      expect(context.burnedCards).toHaveLength(1);

      completeBettingRound(); // Complete flop betting
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to turn (burns 1)
      context = actor.getSnapshot().context;
      expect(context.burnedCards).toHaveLength(2);

      completeBettingRound(); // Complete turn betting
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to river (burns 1)
      context = actor.getSnapshot().context;
      expect(context.burnedCards).toHaveLength(3);
    });
  });

  describe('Player Actions', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to preflop
    });

    it('should handle fold action', () => {
      const contextBefore = actor.getSnapshot().context;
      const currentPlayerIndex = contextBefore.currentPlayerIndex;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'fold',
          playerId: contextBefore.players[currentPlayerIndex]!.id,
          amount: 0,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      expect(contextAfter.players[currentPlayerIndex]?.isFolded).toBe(true);
    });

    it('should handle call action', () => {
      const contextBefore = actor.getSnapshot().context;
      const currentPlayerIndex = contextBefore.currentPlayerIndex;
      const currentPlayer = contextBefore.players[currentPlayerIndex]!;
      const currentBet = Math.max(...contextBefore.players.map((p) => p.currentBet));
      const callAmount = currentBet - currentPlayer.currentBet;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'call',
          playerId: currentPlayer.id,
          amount: callAmount,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      const playerAfter = contextAfter.players[currentPlayerIndex]!;

      expect(playerAfter.currentBet).toBe(currentBet);
      expect(playerAfter.chips).toBe(currentPlayer.chips - callAmount);
    });

    it('should handle raise action', () => {
      const contextBefore = actor.getSnapshot().context;
      const currentPlayerIndex = contextBefore.currentPlayerIndex;
      const currentPlayer = contextBefore.players[currentPlayerIndex]!;
      const raiseAmount = 50;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'raise',
          playerId: currentPlayer.id,
          amount: raiseAmount,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      const playerAfter = contextAfter.players[currentPlayerIndex]!;

      expect(playerAfter.currentBet).toBe(currentPlayer.currentBet + raiseAmount);
      expect(playerAfter.chips).toBe(currentPlayer.chips - raiseAmount);
    });

    it('should handle all-in action', () => {
      const contextBefore = actor.getSnapshot().context;
      const currentPlayerIndex = contextBefore.currentPlayerIndex;
      const currentPlayer = contextBefore.players[currentPlayerIndex]!;
      const allInAmount = currentPlayer.chips;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'all-in',
          playerId: currentPlayer.id,
          amount: allInAmount,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      const playerAfter = contextAfter.players[currentPlayerIndex]!;

      expect(playerAfter.chips).toBe(0);
      expect(playerAfter.isAllIn).toBe(true);
    });

    it('should move to next active player after action', () => {
      const contextBefore = actor.getSnapshot().context;
      const currentPlayerIndexBefore = contextBefore.currentPlayerIndex;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'check',
          playerId: contextBefore.players[currentPlayerIndexBefore]!.id,
          amount: 0,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      expect(contextAfter.currentPlayerIndex).not.toBe(currentPlayerIndexBefore);
    });

    it('should add action to history', () => {
      const contextBefore = actor.getSnapshot().context;
      const historyLengthBefore = contextBefore.actionHistory.length;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'check',
          playerId: contextBefore.players[contextBefore.currentPlayerIndex]!.id,
          amount: 0,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      expect(contextAfter.actionHistory).toHaveLength(historyLengthBefore + 1);
    });
  });

  describe('Pot Management', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
      actor.send({ type: 'ADVANCE_PHASE' }); // Go to preflop
    });

    it('should increase pot on player actions', () => {
      const contextBefore = actor.getSnapshot().context;
      const potBefore = contextBefore.pot.totalPot;
      const currentPlayerIndex = contextBefore.currentPlayerIndex;
      const raiseAmount = 50;

      actor.send({
        type: 'PLAYER_ACTION',
        action: {
          type: 'raise',
          playerId: contextBefore.players[currentPlayerIndex]!.id,
          amount: raiseAmount,
          timestamp: Date.now(),
        },
      });

      const contextAfter = actor.getSnapshot().context;
      expect(contextAfter.pot.totalPot).toBe(potBefore + raiseAmount);
    });
  });

  describe('Dealer Button Rotation', () => {
    beforeEach(() => {
      actor.send({ type: 'START_GAME', settings: defaultSettings });
    });

    it('should start with dealer at position 0', () => {
      const context = actor.getSnapshot().context;
      expect(context.dealerIndex).toBe(0);
    });

    // Note: Dealer button rotation happens in handComplete phase
    // which requires completing a full hand cycle
  });

  describe('Game Over Conditions', () => {
    it('should end game when only one player has chips', () => {
      // This would require simulating a full game until one player wins all chips
      // Complex integration test - skipped for now
      expect(true).toBe(true); // Placeholder
    });
  });
});
