import { PotCalculator } from '@/game-logic/pot/PotCalculator';

interface PlayerBet {
  playerId: string;
  bet: number;
  isAllIn: boolean;
  isFolded: boolean;
}

describe('PotCalculator', () => {
  let calculator: PotCalculator;

  beforeEach(() => {
    calculator = new PotCalculator();
  });

  describe('Basic Pot Calculation', () => {
    it('should calculate simple pot with no all-ins', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 50, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 50, isAllIn: false, isFolded: false },
        { playerId: '3', bet: 50, isAllIn: false, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(150);
      expect(result.mainPot.amount).toBe(150);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '2', '3']);
      expect(result.sidePots.length).toBe(0);
    });

    it('should exclude folded players from pot eligibility', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 50, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 30, isAllIn: false, isFolded: true }, // folded
        { playerId: '3', bet: 50, isAllIn: false, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(130);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '3']);
      expect(result.mainPot.eligiblePlayerIds).not.toContain('2');
    });
  });

  describe('Single All-In (Main Pot Only)', () => {
    it('should handle one all-in player with smaller bet', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 100, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 25, isAllIn: true, isFolded: false }, // all-in $25
        { playerId: '3', bet: 100, isAllIn: false, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(225);
      expect(result.mainPot.amount).toBe(75); // $25 from each = $75
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '2', '3']);
      expect(result.sidePots.length).toBe(1);
      expect(result.sidePots[0].amount).toBe(150); // $75 from player 1 + $75 from player 3
      expect(result.sidePots[0].eligiblePlayerIds).toEqual(['1', '3']); // player 2 not eligible
    });
  });

  describe('Multiple All-Ins (Side Pots)', () => {
    it('should handle 2 different all-ins correctly', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 100, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 25, isAllIn: true, isFolded: false }, // all-in $25
        { playerId: '3', bet: 75, isAllIn: true, isFolded: false }, // all-in $75
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(200);

      // Main pot: $25 from each = $75 (all 3 players eligible)
      expect(result.mainPot.amount).toBe(75);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '2', '3']);

      // Side pot 1: ($75-$25) from player 3 + ($100-$25) from player 1 = $50 + $75 = $125
      expect(result.sidePots.length).toBe(1);
      expect(result.sidePots[0].amount).toBe(125); // ($75-$25)*1 + ($100-$25)*1 + $50 from player 1
      expect(result.sidePots[0].eligiblePlayerIds).toEqual(['1', '3']); // player 2 not eligible
    });

    it('should handle 3 different all-ins correctly', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 100, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 25, isAllIn: true, isFolded: false }, // all-in $25
        { playerId: '3', bet: 75, isAllIn: true, isFolded: false }, // all-in $75
        { playerId: '4', bet: 50, isAllIn: true, isFolded: false }, // all-in $50
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(250);

      // Main pot: $25 * 4 = $100 (all 4 players eligible)
      expect(result.mainPot.amount).toBe(100);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '2', '3', '4']);

      // Side pot 1: ($50-$25) * 3 = $75 (players 1, 3, 4 eligible)
      expect(result.sidePots.length).toBe(2);
      expect(result.sidePots[0].amount).toBe(75);
      expect(result.sidePots[0].eligiblePlayerIds).toEqual(['1', '3', '4']);

      // Side pot 2: ($75-$50) * 2 + ($100-$50) * 1 = $50 + $50 = $100 (players 1, 3 eligible)
      expect(result.sidePots[1].amount).toBe(75); // ($75-$50) + ($100-$50)
      expect(result.sidePots[1].eligiblePlayerIds).toEqual(['1', '3']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all players all-in with same amount', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 50, isAllIn: true, isFolded: false },
        { playerId: '2', bet: 50, isAllIn: true, isFolded: false },
        { playerId: '3', bet: 50, isAllIn: true, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(150);
      expect(result.mainPot.amount).toBe(150);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '2', '3']);
      expect(result.sidePots.length).toBe(0);
    });

    it('should handle one player folded, others all-in', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 100, isAllIn: true, isFolded: false },
        { playerId: '2', bet: 50, isAllIn: false, isFolded: true }, // folded
        { playerId: '3', bet: 75, isAllIn: true, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(225);
      // Main pot should only include active players
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1', '3']);
    });

    it('should handle 9 players with various all-ins', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 1000, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 10, isAllIn: true, isFolded: false },
        { playerId: '3', bet: 50, isAllIn: true, isFolded: false },
        { playerId: '4', bet: 100, isAllIn: true, isFolded: false },
        { playerId: '5', bet: 200, isAllIn: true, isFolded: false },
        { playerId: '6', bet: 300, isAllIn: true, isFolded: false },
        { playerId: '7', bet: 150, isAllIn: true, isFolded: false },
        { playerId: '8', bet: 75, isAllIn: true, isFolded: false },
        { playerId: '9', bet: 25, isAllIn: false, isFolded: true }, // folded
      ];

      const result = calculator.calculatePots(players);
      const totalBets = 1000 + 10 + 50 + 100 + 200 + 300 + 150 + 75 + 25;
      expect(result.totalPot).toBe(totalBets);
      expect(result.sidePots.length).toBeGreaterThan(0);

      // Verify sum of all pots equals total
      const sumOfAllPots =
        result.mainPot.amount + result.sidePots.reduce((sum, pot) => sum + pot.amount, 0);
      expect(sumOfAllPots).toBe(totalBets);
    });

    it('should handle empty player list', () => {
      const players: PlayerBet[] = [];
      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(0);
      expect(result.mainPot.amount).toBe(0);
      expect(result.sidePots.length).toBe(0);
    });

    it('should handle single player', () => {
      const players: PlayerBet[] = [{ playerId: '1', bet: 100, isAllIn: false, isFolded: false }];

      const result = calculator.calculatePots(players);
      expect(result.totalPot).toBe(100);
      expect(result.mainPot.amount).toBe(100);
      expect(result.mainPot.eligiblePlayerIds).toEqual(['1']);
      expect(result.sidePots.length).toBe(0);
    });
  });

  describe('Pot Conservation', () => {
    it('should conserve chips: sum of pots = total bets', () => {
      const players: PlayerBet[] = [
        { playerId: '1', bet: 250, isAllIn: false, isFolded: false },
        { playerId: '2', bet: 100, isAllIn: true, isFolded: false },
        { playerId: '3', bet: 200, isAllIn: true, isFolded: false },
        { playerId: '4', bet: 150, isAllIn: true, isFolded: false },
      ];

      const result = calculator.calculatePots(players);
      const totalBets = players.reduce((sum, p) => sum + p.bet, 0);
      const sumOfPots =
        result.mainPot.amount + result.sidePots.reduce((sum, pot) => sum + pot.amount, 0);

      expect(sumOfPots).toBe(totalBets);
      expect(result.totalPot).toBe(totalBets);
    });
  });
});
