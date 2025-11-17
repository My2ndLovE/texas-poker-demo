import { BettingRules } from '@/game-logic/rules/BettingRules';
import { Player, createPlayer } from '@/game-logic/models/Player';
import { ActionType, PlayerStatus } from '@/utils/constants';

describe('BettingRules', () => {
  let rules: BettingRules;

  beforeEach(() => {
    rules = new BettingRules();
  });

  describe('canCheck', () => {
    it('should allow check when no bet exists', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0 };
      const currentBet = 0;

      expect(rules.canCheck(player, currentBet)).toBe(true);
    });

    it('should not allow check when bet exists', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0 };
      const currentBet = 50;

      expect(rules.canCheck(player, currentBet)).toBe(false);
    });

    it('should allow check when player has matched current bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 50 };
      const currentBet = 50;

      expect(rules.canCheck(player, currentBet)).toBe(true);
    });
  });

  describe('canCall', () => {
    it('should allow call when bet exists', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 50;

      expect(rules.canCall(player, currentBet)).toBe(true);
    });

    it('should not allow call when no bet exists', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0 };
      const currentBet = 0;

      expect(rules.canCall(player, currentBet)).toBe(false);
    });

    it('should not allow call when player already matched bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 50 };
      const currentBet = 50;

      expect(rules.canCall(player, currentBet)).toBe(false);
    });
  });

  describe('canRaise', () => {
    it('should allow raise when player has enough chips', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 50;
      const minRaise = 50;

      expect(rules.canRaise(player, currentBet, minRaise)).toBe(true);
    });

    it('should not allow raise when player cannot meet minimum raise', () => {
      const player = { ...createPlayer('p1', 'Player', 75, 0, false), currentBet: 0, chips: 75 };
      const currentBet = 50;
      const minRaise = 50; // Need 100 total, player only has 75

      expect(rules.canRaise(player, currentBet, minRaise)).toBe(false);
    });
  });

  describe('getCallAmount', () => {
    it('should return difference between current bet and player bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 20 };
      const currentBet = 50;

      expect(rules.getCallAmount(player, currentBet)).toBe(30);
    });

    it('should return 0 when player already matched bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 50 };
      const currentBet = 50;

      expect(rules.getCallAmount(player, currentBet)).toBe(0);
    });

    it('should return player chips when calling would go all-in', () => {
      const player = { ...createPlayer('p1', 'Player', 20, 0, false), currentBet: 0, chips: 20 };
      const currentBet = 50;

      expect(rules.getCallAmount(player, currentBet)).toBe(20);
    });
  });

  describe('getMinRaiseAmount', () => {
    it('should require at least double the current bet for first raise', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0 };
      const currentBet = 50;
      const minRaise = 50;

      const minAmount = rules.getMinRaiseAmount(player, currentBet, minRaise);
      expect(minAmount).toBe(100); // 50 + 50
    });

    it('should add minimum raise to current bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0 };
      const currentBet = 100;
      const minRaise = 50;

      const minAmount = rules.getMinRaiseAmount(player, currentBet, minRaise);
      expect(minAmount).toBe(150); // 100 + 50
    });

    it('should account for player current bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 50 };
      const currentBet = 100;
      const minRaise = 50;

      const minAmount = rules.getMinRaiseAmount(player, currentBet, minRaise);
      expect(minAmount).toBe(100); // 150 - 50 already bet
    });
  });

  describe('isValidRaise', () => {
    it('should accept raise meeting minimum', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 50;
      const minRaise = 50;
      const raiseAmount = 100;

      expect(rules.isValidRaise(player, currentBet, minRaise, raiseAmount)).toBe(true);
    });

    it('should reject raise below minimum', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 50;
      const minRaise = 50;
      const raiseAmount = 75; // Below 100 minimum

      expect(rules.isValidRaise(player, currentBet, minRaise, raiseAmount)).toBe(false);
    });

    it('should accept all-in raise even if below minimum', () => {
      const player = { ...createPlayer('p1', 'Player', 80, 0, false), currentBet: 0, chips: 80 };
      const currentBet = 50;
      const minRaise = 50;
      const raiseAmount = 80; // Below 100 minimum but all-in

      expect(rules.isValidRaise(player, currentBet, minRaise, raiseAmount)).toBe(true);
    });

    it('should reject raise exceeding player chips', () => {
      const player = { ...createPlayer('p1', 'Player', 80, 0, false), currentBet: 0, chips: 80 };
      const currentBet = 50;
      const minRaise = 50;
      const raiseAmount = 150;

      expect(rules.isValidRaise(player, currentBet, minRaise, raiseAmount)).toBe(false);
    });
  });

  describe('willBeAllIn', () => {
    it('should detect all-in when bet equals chips', () => {
      const player = { ...createPlayer('p1', 'Player', 100, 0, false), currentBet: 0, chips: 100 };
      const betAmount = 100;

      expect(rules.willBeAllIn(player, betAmount)).toBe(true);
    });

    it('should not detect all-in when chips remain', () => {
      const player = { ...createPlayer('p1', 'Player', 200, 0, false), currentBet: 0, chips: 200 };
      const betAmount = 100;

      expect(rules.willBeAllIn(player, betAmount)).toBe(false);
    });

    it('should account for current bet', () => {
      const player = { ...createPlayer('p1', 'Player', 50, 0, false), currentBet: 50, chips: 50 };
      const betAmount = 100; // Total 100, but already bet 50

      expect(rules.willBeAllIn(player, betAmount)).toBe(true);
    });
  });

  describe('getAvailableActions', () => {
    it('should offer fold, check when no bet', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 0;
      const minRaise = 10;

      const actions = rules.getAvailableActions(player, currentBet, minRaise);

      expect(actions).toContain(ActionType.Fold);
      expect(actions).toContain(ActionType.Check);
      expect(actions).toContain(ActionType.Bet);
      expect(actions).not.toContain(ActionType.Call);
    });

    it('should offer fold, call, raise when bet exists', () => {
      const player = { ...createPlayer('p1', 'Player', 1000, 0, false), currentBet: 0, chips: 1000 };
      const currentBet = 50;
      const minRaise = 50;

      const actions = rules.getAvailableActions(player, currentBet, minRaise);

      expect(actions).toContain(ActionType.Fold);
      expect(actions).toContain(ActionType.Call);
      expect(actions).toContain(ActionType.Raise);
      expect(actions).not.toContain(ActionType.Check);
    });

    it('should offer all-in when player cannot meet minimum raise', () => {
      const player = { ...createPlayer('p1', 'Player', 30, 0, false), currentBet: 0, chips: 30 };
      const currentBet = 50;
      const minRaise = 50;

      const actions = rules.getAvailableActions(player, currentBet, minRaise);

      expect(actions).toContain(ActionType.Fold);
      expect(actions).toContain(ActionType.AllIn);
      expect(actions).not.toContain(ActionType.Raise);
    });
  });
});
