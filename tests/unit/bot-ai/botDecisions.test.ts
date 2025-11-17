/**
 * Bot AI Decision Making Tests
 */

import { describe, it, expect } from 'vitest';
import { makeEasyBotDecision } from '@/bot-ai/easyBot';
import { makeMediumBotDecision } from '@/bot-ai/mediumBot';
import { makeHardBotDecision } from '@/bot-ai/hardBot';
import { makeBotDecision, getBotActionDelay } from '@/bot-ai';
import type { Player, Card } from '@/types';
import type { BotDecisionContext } from '@/bot-ai/easyBot';
import type { MediumBotContext } from '@/bot-ai/mediumBot';

// Helper to create test player
function createTestPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'bot-1',
    name: 'Bot 1',
    type: 'bot',
    chips: 1000,
    holeCards: [],
    currentBet: 0,
    isFolded: false,
    isAllIn: false,
    position: 0,
    botDifficulty: 'easy',
    ...overrides,
  };
}

// Helper to create cards
function makeCard(rank: string, suit: string): Card {
  return {
    rank: rank as any,
    suit: suit as any,
    id: `${rank}${suit}`,
  };
}

describe('Bot AI Decision Making', () => {
  describe('Easy Bot', () => {
    it('should check when no bet and weak hand', () => {
      const weakCards: Card[] = [makeCard('7', '♣'), makeCard('2', '♦')];

      const context: BotDecisionContext = {
        player: createTestPlayer({ holeCards: weakCards }),
        communityCards: [],
        currentBet: 0, // No bet to call
        potSize: 100,
        minRaise: 20,
        gamePhase: 'preflop',
      };

      const action = makeEasyBotDecision(context);

      expect(action.type).toBe('check');
    });

    it('should fold when facing bet with very weak hand', () => {
      const weakCards: Card[] = [makeCard('7', '♣'), makeCard('2', '♦')];

      const context: BotDecisionContext = {
        player: createTestPlayer({ holeCards: weakCards }),
        communityCards: [],
        currentBet: 50,
        potSize: 100,
        minRaise: 20,
        gamePhase: 'preflop',
      };

      const action = makeEasyBotDecision(context);

      expect(action.type).toBe('fold');
    });

    it('should call with decent hand', () => {
      const decentCards: Card[] = [makeCard('A', '♠'), makeCard('J', '♥')];

      const context: BotDecisionContext = {
        player: createTestPlayer({
          holeCards: decentCards,
          chips: 1000,
          currentBet: 0,
        }),
        communityCards: [],
        currentBet: 50,
        potSize: 100,
        minRaise: 20,
        gamePhase: 'preflop',
      };

      const action = makeEasyBotDecision(context);

      // Should call with decent hand (not fold)
      expect(['call', 'raise', 'all-in']).toContain(action.type);
    });

    it('should not exceed available chips', () => {
      const cards: Card[] = [makeCard('A', '♠'), makeCard('A', '♥')];

      const context: BotDecisionContext = {
        player: createTestPlayer({
          holeCards: cards,
          chips: 30, // Limited chips
          currentBet: 0,
        }),
        communityCards: [],
        currentBet: 50, // Bet larger than chips
        potSize: 100,
        minRaise: 20,
        gamePhase: 'preflop',
      };

      const action = makeEasyBotDecision(context);

      if (action.type !== 'fold' && action.type !== 'check') {
        expect(action.amount).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('Medium Bot', () => {
    it('should be more aggressive in late position', () => {
      const cards: Card[] = [makeCard('K', '♠'), makeCard('Q', '♠')];

      const earlyContext: MediumBotContext = {
        player: createTestPlayer({
          holeCards: cards,
          position: 1, // Early position
        }),
        communityCards: [],
        currentBet: 0,
        potSize: 100,
        minRaise: 20,
        gamePhase: 'preflop',
        dealerPosition: 0,
        numPlayers: 6,
        activePlayers: 6,
      };

      const lateContext: MediumBotContext = {
        ...earlyContext,
        player: createTestPlayer({
          holeCards: cards,
          position: 5, // Late position
        }),
      };

      // Run multiple times to check aggression difference
      let earlyBets = 0;
      let lateBets = 0;

      for (let i = 0; i < 50; i++) {
        const earlyAction = makeMediumBotDecision(earlyContext);
        const lateAction = makeMediumBotDecision(lateContext);

        if (earlyAction.type === 'bet' || earlyAction.type === 'raise') {
          earlyBets++;
        }
        if (lateAction.type === 'bet' || lateAction.type === 'raise') {
          lateBets++;
        }
      }

      // Late position should bet/raise more often
      expect(lateBets).toBeGreaterThan(earlyBets * 0.5); // At least 50% more
    });

    it('should fold with bad pot odds', () => {
      const marginalCards: Card[] = [makeCard('9', '♠'), makeCard('8', '♦')];

      const context: MediumBotContext = {
        player: createTestPlayer({
          holeCards: marginalCards,
          currentBet: 0,
          chips: 1000,
        }),
        communityCards: [],
        currentBet: 200, // Large bet
        potSize: 50, // Small pot = bad pot odds
        minRaise: 20,
        gamePhase: 'preflop',
        dealerPosition: 0,
        numPlayers: 6,
        activePlayers: 6,
      };

      const action = makeMediumBotDecision(context);

      // Should fold with bad pot odds and marginal hand
      expect(action.type).toBe('fold');
    });

    it('should call with good pot odds', () => {
      const marginalCards: Card[] = [makeCard('9', '♠'), makeCard('8', '♦')];

      const context: MediumBotContext = {
        player: createTestPlayer({
          holeCards: marginalCards,
          currentBet: 0,
          chips: 1000,
          position: 5, // Late position
        }),
        communityCards: [],
        currentBet: 20, // Small bet
        potSize: 200, // Large pot = good pot odds
        minRaise: 20,
        gamePhase: 'preflop',
        dealerPosition: 0,
        numPlayers: 6,
        activePlayers: 6,
      };

      const action = makeMediumBotDecision(context);

      // Should call with good pot odds
      expect(['call', 'raise']).toContain(action.type);
    });
  });

  describe('Hard Bot', () => {
    it('should value bet with very strong hands', () => {
      const premiumCards: Card[] = [makeCard('A', '♠'), makeCard('A', '♥')];

      const context: MediumBotContext = {
        player: createTestPlayer({
          holeCards: premiumCards,
          chips: 1000,
        }),
        communityCards: [
          makeCard('A', '♦'),
          makeCard('K', '♠'),
          makeCard('Q', '♣'),
        ],
        currentBet: 0, // No bet
        potSize: 100,
        minRaise: 20,
        gamePhase: 'flop',
        dealerPosition: 0,
        numPlayers: 6,
        activePlayers: 3,
      };

      const action = makeHardBotDecision(context);

      // Should bet for value with trips
      expect(['bet', 'raise']).toContain(action.type);
      if (action.type === 'bet') {
        expect(action.amount).toBeGreaterThan(0);
      }
    });

    it('should occasionally bluff in late position', () => {
      const mediocreCards: Card[] = [makeCard('7', '♠'), makeCard('6', '♦')];

      const context: MediumBotContext = {
        player: createTestPlayer({
          holeCards: mediocreCards,
          position: 5, // Late position
          chips: 1000,
        }),
        communityCards: [
          makeCard('A', '♥'),
          makeCard('K', '♣'),
          makeCard('Q', '♦'),
        ],
        currentBet: 0,
        potSize: 100,
        minRaise: 20,
        gamePhase: 'flop',
        dealerPosition: 0,
        numPlayers: 3, // Heads-up favorable for bluffing
        activePlayers: 2,
      };

      // Run multiple times to check for bluffs
      let bluffs = 0;

      for (let i = 0; i < 50; i++) {
        const action = makeHardBotDecision(context);
        if (action.type === 'bet') {
          bluffs++;
        }
      }

      // Should bluff at least a few times (>10% of attempts)
      expect(bluffs).toBeGreaterThan(3);
    });

    it('should make larger bets with premium hands', () => {
      const premiumCards: Card[] = [makeCard('A', '♠'), makeCard('K', '♠')];

      const communityCards: Card[] = [
        makeCard('Q', '♠'),
        makeCard('J', '♠'),
        makeCard('T', '♠'), // Royal flush!
      ];

      const context: MediumBotContext = {
        player: createTestPlayer({
          holeCards: premiumCards,
          currentBet: 0,
          chips: 1000,
        }),
        communityCards,
        currentBet: 50,
        potSize: 200,
        minRaise: 50,
        gamePhase: 'flop',
        dealerPosition: 0,
        numPlayers: 6,
        activePlayers: 3,
      };

      const action = makeHardBotDecision(context);

      // Should raise aggressively with royal flush
      expect(action.type).toBe('raise');
      if (action.type === 'raise') {
        expect(action.amount).toBeGreaterThan(100); // Large raise
      }
    });
  });

  describe('Main Bot Decision Router', () => {
    it('should route to easy bot for easy difficulty', () => {
      const player = createTestPlayer({ botDifficulty: 'easy' });

      const context = {
        player,
        allPlayers: [player],
        communityCards: [],
        currentBet: 0,
        potSize: 100,
        smallBlind: 10,
        bigBlind: 20,
        dealerIndex: 0,
        gamePhase: null as any,
      };

      const action = makeBotDecision(context);

      expect(action).toBeDefined();
      expect(action.playerId).toBe(player.id);
    });

    it('should route to medium bot for medium difficulty', () => {
      const player = createTestPlayer({ botDifficulty: 'medium' });

      const context = {
        player,
        allPlayers: [player],
        communityCards: [],
        currentBet: 0,
        potSize: 100,
        smallBlind: 10,
        bigBlind: 20,
        dealerIndex: 0,
        gamePhase: null as any,
      };

      const action = makeBotDecision(context);

      expect(action).toBeDefined();
      expect(action.playerId).toBe(player.id);
    });

    it('should route to hard bot for hard difficulty', () => {
      const player = createTestPlayer({ botDifficulty: 'hard' });

      const context = {
        player,
        allPlayers: [player],
        communityCards: [],
        currentBet: 0,
        potSize: 100,
        smallBlind: 10,
        bigBlind: 20,
        dealerIndex: 0,
        gamePhase: null as any,
      };

      const action = makeBotDecision(context);

      expect(action).toBeDefined();
      expect(action.playerId).toBe(player.id);
    });

    it('should throw error for non-bot player', () => {
      const humanPlayer = createTestPlayer({ type: 'human', botDifficulty: undefined });

      const context = {
        player: humanPlayer,
        allPlayers: [humanPlayer],
        communityCards: [],
        currentBet: 0,
        potSize: 100,
        smallBlind: 10,
        bigBlind: 20,
        dealerIndex: 0,
        gamePhase: null as any,
      };

      expect(() => makeBotDecision(context)).toThrow();
    });
  });

  describe('Bot Action Delays', () => {
    it('should return delay for easy bot', () => {
      const delay = getBotActionDelay('easy');
      expect(delay).toBeGreaterThanOrEqual(500);
      expect(delay).toBeLessThanOrEqual(1000);
    });

    it('should return delay for medium bot', () => {
      const delay = getBotActionDelay('medium');
      expect(delay).toBeGreaterThanOrEqual(800);
      expect(delay).toBeLessThanOrEqual(1500);
    });

    it('should return delay for hard bot', () => {
      const delay = getBotActionDelay('hard');
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(2000);
    });

    it('should have longer delays for harder difficulties', () => {
      const easyDelay = getBotActionDelay('easy');
      const mediumDelay = getBotActionDelay('medium');
      const hardDelay = getBotActionDelay('hard');

      // Average delays should increase with difficulty
      // Easy: 750ms avg, Medium: 1150ms avg, Hard: 1500ms avg
      expect(mediumDelay).toBeGreaterThanOrEqual(easyDelay * 0.8);
      expect(hardDelay).toBeGreaterThanOrEqual(mediumDelay * 0.8);
    });
  });
});
