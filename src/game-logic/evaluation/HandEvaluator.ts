import { Hand as PokerSolverHand } from 'pokersolver'
import { Card } from '../models/Card'

/**
 * Hand rank enum matching pokersolver ranks
 * In pokersolver: higher rank number = better hand
 */
export enum HandRank {
  HighCard = 1,
  Pair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,   // Includes Royal Flush
}

/**
 * Result of hand evaluation
 */
export interface HandResult {
  rank: HandRank
  description: string
  value: number
  cards: Card[]
}

/**
 * Wrapper for pokersolver library with clean TypeScript API
 */
export class HandEvaluator {
  /**
   * Evaluate a poker hand from 5-7 cards
   */
  evaluateHand(cards: Card[]): HandResult {
    if (cards.length < 5 || cards.length > 7) {
      throw new Error('Hand evaluation requires 5-7 cards')
    }

    // Convert to pokersolver format
    const cardStrings = cards.map(c => c.toString())

    // Evaluate using pokersolver
    const hand = PokerSolverHand.solve(cardStrings)

    return {
      rank: hand.rank as HandRank,
      description: hand.descr,
      value: hand.rank,
      cards: cards,
    }
  }

  /**
   * Compare two hands and return winner
   * @returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie
   */
  compareHands(hand1Cards: Card[], hand2Cards: Card[]): number {
    const cardStrings1 = hand1Cards.map(c => c.toString())
    const cardStrings2 = hand2Cards.map(c => c.toString())

    const h1 = PokerSolverHand.solve(cardStrings1)
    const h2 = PokerSolverHand.solve(cardStrings2)

    const winners = PokerSolverHand.winners([h1, h2])

    if (winners.length === 2) return 0 // Tie
    return winners[0] === h1 ? 1 : -1
  }

  /**
   * Find winners from multiple hands
   */
  findWinners(playerHands: { playerId: string; cards: Card[] }[]): string[] {
    if (playerHands.length === 0) return []

    const hands = playerHands.map(ph => ({
      playerId: ph.playerId,
      hand: PokerSolverHand.solve(ph.cards.map(c => c.toString())),
    }))

    const pokerSolverHands = hands.map(h => h.hand)
    const winningHands = PokerSolverHand.winners(pokerSolverHands)

    return hands
      .filter(h => winningHands.includes(h.hand))
      .map(h => h.playerId)
  }

  /**
   * Get hand rank name
   */
  getHandRankName(rank: HandRank): string {
    const names: Record<HandRank, string> = {
      [HandRank.HighCard]: 'High Card',
      [HandRank.Pair]: 'Pair',
      [HandRank.TwoPair]: 'Two Pair',
      [HandRank.ThreeOfAKind]: 'Three of a Kind',
      [HandRank.Straight]: 'Straight',
      [HandRank.Flush]: 'Flush',
      [HandRank.FullHouse]: 'Full House',
      [HandRank.FourOfAKind]: 'Four of a Kind',
      [HandRank.StraightFlush]: 'Straight Flush',
    }
    return names[rank]
  }
}
