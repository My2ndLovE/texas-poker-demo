import { PotCalculator } from '@/game-logic/pot/PotCalculator';
import { Player, createPlayer } from '@/game-logic/models/Player';
import { PlayerStatus } from '@/utils/constants';

describe('PotCalculator', () => {
  let calculator: PotCalculator;

  beforeEach(() => {
    calculator = new PotCalculator();
  });

  describe('simple pot calculation', () => {
    it('should calculate simple pot with no all-ins', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 1000, 0, false), currentBet: 100, totalBet: 100 },
        { ...createPlayer('p2', 'Player 2', 1000, 1, true), currentBet: 100, totalBet: 100 },
        { ...createPlayer('p3', 'Player 3', 1000, 2, true), currentBet: 100, totalBet: 100 },
      ];

      const pot = calculator.calculatePot(players);

      expect(pot.mainPot).toBe(300);
      expect(pot.sidePots).toHaveLength(0);
      expect(pot.totalPot).toBe(300);
    });

    it('should exclude folded players', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 1000, 0, false), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
        { ...createPlayer('p2', 'Player 2', 1000, 1, true), currentBet: 0, totalBet: 50, status: PlayerStatus.Folded },
        { ...createPlayer('p3', 'Player 3', 1000, 2, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      expect(pot.totalPot).toBe(250);
    });
  });

  describe('single all-in', () => {
    it('should create side pot when one player is all-in for less', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 0, 0, false), currentBet: 50, totalBet: 50, status: PlayerStatus.AllIn },
        { ...createPlayer('p2', 'Player 2', 50, 1, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
        { ...createPlayer('p3', 'Player 3', 50, 2, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      // Main pot: 50 * 3 = 150 (all players)
      expect(pot.mainPot).toBe(150);
      expect(pot.mainPotEligiblePlayers).toEqual(['p1', 'p2', 'p3']);

      // Side pot: 50 * 2 = 100 (p2, p3)
      expect(pot.sidePots).toHaveLength(1);
      expect(pot.sidePots[0].amount).toBe(100);
      expect(pot.sidePots[0].eligiblePlayerIds).toEqual(['p2', 'p3']);

      expect(pot.totalPot).toBe(250);
    });
  });

  describe('multiple all-ins', () => {
    it('should create multiple side pots with 3 different all-in amounts', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 0, 0, false), currentBet: 25, totalBet: 25, status: PlayerStatus.AllIn },
        { ...createPlayer('p2', 'Player 2', 0, 1, true), currentBet: 75, totalBet: 75, status: PlayerStatus.AllIn },
        { ...createPlayer('p3', 'Player 3', 0, 2, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      // Main pot: 25 * 3 = 75
      expect(pot.mainPot).toBe(75);
      expect(pot.mainPotEligiblePlayers).toEqual(['p1', 'p2', 'p3']);

      // First side pot: (75-25) * 2 = 100
      expect(pot.sidePots[0].amount).toBe(100);
      expect(pot.sidePots[0].eligiblePlayerIds).toEqual(['p2', 'p3']);

      // Second side pot: (100-75) * 1 = 25
      expect(pot.sidePots[1].amount).toBe(25);
      expect(pot.sidePots[1].eligiblePlayerIds).toEqual(['p3']);

      expect(pot.totalPot).toBe(200);
    });

    it('should handle 4 players with varying all-in amounts', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 0, 0, false), currentBet: 10, totalBet: 10, status: PlayerStatus.AllIn },
        { ...createPlayer('p2', 'Player 2', 0, 1, true), currentBet: 30, totalBet: 30, status: PlayerStatus.AllIn },
        { ...createPlayer('p3', 'Player 3', 0, 2, true), currentBet: 50, totalBet: 50, status: PlayerStatus.AllIn },
        { ...createPlayer('p4', 'Player 4', 0, 3, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      // Main pot: 10 * 4 = 40
      expect(pot.mainPot).toBe(40);

      // Side pot 1: (30-10) * 3 = 60
      expect(pot.sidePots[0].amount).toBe(60);
      expect(pot.sidePots[0].eligiblePlayerIds).toEqual(['p2', 'p3', 'p4']);

      // Side pot 2: (50-30) * 2 = 40
      expect(pot.sidePots[1].amount).toBe(40);
      expect(pot.sidePots[1].eligiblePlayerIds).toEqual(['p3', 'p4']);

      // Side pot 3: (100-50) * 1 = 50
      expect(pot.sidePots[2].amount).toBe(50);
      expect(pot.sidePots[2].eligiblePlayerIds).toEqual(['p4']);

      expect(pot.totalPot).toBe(190);
    });
  });

  describe('edge cases', () => {
    it('should handle all players all-in with same amount', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 0, 0, false), currentBet: 100, totalBet: 100, status: PlayerStatus.AllIn },
        { ...createPlayer('p2', 'Player 2', 0, 1, true), currentBet: 100, totalBet: 100, status: PlayerStatus.AllIn },
        { ...createPlayer('p3', 'Player 3', 0, 2, true), currentBet: 100, totalBet: 100, status: PlayerStatus.AllIn },
      ];

      const pot = calculator.calculatePot(players);

      expect(pot.mainPot).toBe(300);
      expect(pot.sidePots).toHaveLength(0);
      expect(pot.totalPot).toBe(300);
    });

    it('should handle player with zero bet who folded', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 1000, 0, false), currentBet: 0, totalBet: 0, status: PlayerStatus.Folded },
        { ...createPlayer('p2', 'Player 2', 1000, 1, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
        { ...createPlayer('p3', 'Player 3', 1000, 2, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      expect(pot.totalPot).toBe(200);
    });

    it('should handle mixed all-in and folded players', () => {
      const players: Player[] = [
        { ...createPlayer('p1', 'Player 1', 0, 0, false), currentBet: 50, totalBet: 50, status: PlayerStatus.AllIn },
        { ...createPlayer('p2', 'Player 2', 0, 1, true), currentBet: 100, totalBet: 100, status: PlayerStatus.Folded },
        { ...createPlayer('p3', 'Player 3', 0, 2, true), currentBet: 150, totalBet: 150, status: PlayerStatus.Active },
      ];

      const pot = calculator.calculatePot(players);

      // Main pot: 50 * 2 = 100 (p1, p3 only - p2 folded)
      expect(pot.mainPot).toBe(100);

      // Side pot: 100 * 1 = 100 (only p3)
      expect(pot.sidePots).toHaveLength(1);
      expect(pot.sidePots[0].amount).toBe(100);
      expect(pot.sidePots[0].eligiblePlayerIds).toEqual(['p3']);

      expect(pot.totalPot).toBe(300); // includes folded player's bet
    });
  });
});
