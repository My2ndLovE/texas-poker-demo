import { Card } from '@/game-logic/models/Card';
import { HandEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import { HandRank } from '@/utils/constants';

export enum HandStrengthLevel {
  VeryWeak = 0,
  Weak = 1,
  Medium = 2,
  Strong = 3,
  VeryStrong = 4,
}

export class HandStrengthAnalyzer {
  private evaluator: HandEvaluator;

  constructor() {
    this.evaluator = new HandEvaluator();
  }

  // Analyze preflop hand strength (pocket cards only)
  analyzePreflopStrength(holeCards: Card[]): HandStrengthLevel {
    if (holeCards.length !== 2) return HandStrengthLevel.VeryWeak;

    const [card1, card2] = holeCards;
    const rank1 = this.getRankValue(card1.rank);
    const rank2 = this.getRankValue(card2.rank);
    const isPair = rank1 === rank2;
    const isSuited = card1.suit === card2.suit;
    const highCard = Math.max(rank1, rank2);
    const lowCard = Math.min(rank1, rank2);
    const gap = highCard - lowCard;

    // Premium pairs (AA-QQ)
    if (isPair && highCard >= 12) return HandStrengthLevel.VeryStrong;

    // Strong pairs (JJ-99)
    if (isPair && highCard >= 9) return HandStrengthLevel.Strong;

    // Medium pairs (88-22)
    if (isPair) return HandStrengthLevel.Medium;

    // AK, AQ (suited or unsuited)
    if (highCard === 14 && lowCard >= 12) {
      return isSuited ? HandStrengthLevel.VeryStrong : HandStrengthLevel.Strong;
    }

    // AJ, AT, KQ
    if ((highCard === 14 && lowCard >= 10) || (highCard === 13 && lowCard === 12)) {
      return isSuited ? HandStrengthLevel.Strong : HandStrengthLevel.Medium;
    }

    // Suited connectors or one-gappers
    if (isSuited && gap <= 2 && highCard >= 8) {
      return HandStrengthLevel.Medium;
    }

    // High cards
    if (highCard >= 11) return HandStrengthLevel.Weak;

    return HandStrengthLevel.VeryWeak;
  }

  // Analyze postflop hand strength with community cards
  analyzePostflopStrength(holeCards: Card[], communityCards: Card[]): HandStrengthLevel {
    if (communityCards.length < 3) {
      return this.analyzePreflopStrength(holeCards);
    }

    const allCards = [...holeCards, ...communityCards];
    const result = this.evaluator.evaluateHand(allCards);

    switch (result.rank) {
      case HandRank.RoyalFlush:
        return HandStrengthLevel.VeryStrong;

      case HandRank.StraightFlush:
      case HandRank.FourOfAKind:
        return HandStrengthLevel.VeryStrong;

      case HandRank.FullHouse:
      case HandRank.Flush:
        return HandStrengthLevel.Strong;

      case HandRank.Straight:
      case HandRank.ThreeOfAKind:
        return HandStrengthLevel.Medium;

      case HandRank.TwoPair:
        return HandStrengthLevel.Medium;

      case HandRank.OnePair:
        return HandStrengthLevel.Weak;

      case HandRank.HighCard:
      default:
        return HandStrengthLevel.VeryWeak;
    }
  }

  private getRankValue(rank: string): number {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
    };
    return values[rank] ?? 0;
  }
}
