import { PositionRules } from '@/game-logic/rules/PositionRules';
import { Player, createPlayer } from '@/game-logic/models/Player';

describe('PositionRules', () => {
  let rules: PositionRules;

  beforeEach(() => {
    rules = new PositionRules();
  });

  describe('calculatePositions', () => {
    it('should assign dealer, SB, BB for 3+ players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const dealerIndex = 0;
      const positioned = rules.calculatePositions(players, dealerIndex);

      expect(positioned[0].isDealer).toBe(true);
      expect(positioned[0].isSmallBlind).toBe(false);
      expect(positioned[0].isBigBlind).toBe(false);

      expect(positioned[1].isDealer).toBe(false);
      expect(positioned[1].isSmallBlind).toBe(true);
      expect(positioned[1].isBigBlind).toBe(false);

      expect(positioned[2].isDealer).toBe(false);
      expect(positioned[2].isSmallBlind).toBe(false);
      expect(positioned[2].isBigBlind).toBe(true);
    });

    it('should handle heads-up (2 players) where dealer is SB', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
      ];

      const dealerIndex = 0;
      const positioned = rules.calculatePositions(players, dealerIndex);

      // In heads-up, dealer is also small blind
      expect(positioned[0].isDealer).toBe(true);
      expect(positioned[0].isSmallBlind).toBe(true);
      expect(positioned[0].isBigBlind).toBe(false);

      expect(positioned[1].isDealer).toBe(false);
      expect(positioned[1].isSmallBlind).toBe(false);
      expect(positioned[1].isBigBlind).toBe(true);
    });

    it('should wrap around when dealer is last player', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const dealerIndex = 2;
      const positioned = rules.calculatePositions(players, dealerIndex);

      expect(positioned[2].isDealer).toBe(true);
      expect(positioned[0].isSmallBlind).toBe(true);
      expect(positioned[1].isBigBlind).toBe(true);
    });
  });

  describe('getNextDealerIndex', () => {
    it('should move dealer to next active player', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const currentDealer = 0;
      const nextDealer = rules.getNextDealerIndex(players, currentDealer);

      expect(nextDealer).toBe(1);
    });

    it('should wrap around at end of players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const currentDealer = 2;
      const nextDealer = rules.getNextDealerIndex(players, currentDealer);

      expect(nextDealer).toBe(0);
    });
  });

  describe('getSmallBlindIndex', () => {
    it('should return player after dealer for 3+ players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const dealerIndex = 0;
      const sbIndex = rules.getSmallBlindIndex(players, dealerIndex);

      expect(sbIndex).toBe(1);
    });

    it('should return dealer for heads-up', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
      ];

      const dealerIndex = 0;
      const sbIndex = rules.getSmallBlindIndex(players, dealerIndex);

      expect(sbIndex).toBe(0); // Dealer is SB in heads-up
    });
  });

  describe('getBigBlindIndex', () => {
    it('should return 2 players after dealer for 3+ players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const dealerIndex = 0;
      const bbIndex = rules.getBigBlindIndex(players, dealerIndex);

      expect(bbIndex).toBe(2);
    });

    it('should return player after dealer for heads-up', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
      ];

      const dealerIndex = 0;
      const bbIndex = rules.getBigBlindIndex(players, dealerIndex);

      expect(bbIndex).toBe(1);
    });
  });

  describe('getFirstToActPreflop', () => {
    it('should return player after big blind for 3+ players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
        createPlayer('p4', 'Player 4', 1000, 3, true),
      ];

      const dealerIndex = 0;
      const firstToAct = rules.getFirstToActPreflop(players, dealerIndex);

      // BB is at index 2, so first to act is index 3
      expect(firstToAct).toBe(3);
    });

    it('should return dealer (SB) for heads-up', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
      ];

      const dealerIndex = 0;
      const firstToAct = rules.getFirstToActPreflop(players, dealerIndex);

      expect(firstToAct).toBe(0); // Dealer acts first preflop in heads-up
    });
  });

  describe('getFirstToActPostflop', () => {
    it('should return player after dealer for 3+ players', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
        createPlayer('p3', 'Player 3', 1000, 2, true),
      ];

      const dealerIndex = 0;
      const firstToAct = rules.getFirstToActPostflop(players, dealerIndex);

      expect(firstToAct).toBe(1); // Small blind acts first postflop
    });

    it('should return player after dealer for heads-up', () => {
      const players = [
        createPlayer('p1', 'Player 1', 1000, 0, false),
        createPlayer('p2', 'Player 2', 1000, 1, true),
      ];

      const dealerIndex = 0;
      const firstToAct = rules.getFirstToActPostflop(players, dealerIndex);

      expect(firstToAct).toBe(1); // Big blind acts first postflop in heads-up
    });
  });
});
