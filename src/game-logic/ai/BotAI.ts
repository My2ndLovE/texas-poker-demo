import { Player } from '../models/Player'
import { Card } from '../models/Card'

/**
 * Simple bot AI for poker decisions
 * Uses basic hand strength and position-based strategy
 */
export class BotAI {
  /**
   * Decide what action to take
   */
  decideAction(
    player: Player,
    currentBet: number,
    potSize: number,
    communityCards: Card[],
    gamePhase: string
  ): { action: string; amount?: number } {
    const handStrength = this.evaluateHandStrength(player.holeCards, communityCards, gamePhase)
    const callAmount = currentBet - player.currentBet
    const chipRatio = callAmount / player.chips // How much of stack needed to call

    // Easy bot (35-40% win rate) - Simple rules
    if (player.botDifficulty === 'easy') {
      return this.easyBotDecision(handStrength, callAmount)
    }

    // Medium bot (45-50% win rate) - Position aware
    if (player.botDifficulty === 'medium') {
      return this.mediumBotDecision(handStrength, callAmount, chipRatio, potSize, player)
    }

    // Hard bot (55-60% win rate) - Advanced strategy
    return this.hardBotDecision(handStrength, callAmount, chipRatio, potSize, player, gamePhase)
  }

  /**
   * Easy bot - Very simple rules
   */
  private easyBotDecision(
    handStrength: number,
    callAmount: number
  ): { action: string; amount?: number } {
    // No bet to call - check or bet
    if (callAmount === 0) {
      if (handStrength > 0.6) {
        return { action: 'bet', amount: Math.floor(Math.random() * 100) + 50 }
      }
      return { action: 'check' }
    }

    // Facing a bet
    if (handStrength > 0.7) {
      // Strong hand - raise
      return { action: 'raise', amount: callAmount * 2 }
    } else if (handStrength > 0.4) {
      // Decent hand - call
      return { action: 'call' }
    } else {
      // Weak hand - fold
      return { action: 'fold' }
    }
  }

  /**
   * Medium bot - Position aware, pot odds
   */
  private mediumBotDecision(
    handStrength: number,
    callAmount: number,
    chipRatio: number,
    potSize: number,
    player: Player
  ): { action: string; amount?: number } {
    const potOdds = callAmount / (potSize + callAmount)
    const hasPosition = player.isDealer // Simplified position check

    // No bet to call
    if (callAmount === 0) {
      if (handStrength > 0.65) {
        const betSize = hasPosition ? potSize * 0.75 : potSize * 0.5
        return { action: 'bet', amount: Math.min(Math.floor(betSize), player.chips) }
      }
      return { action: 'check' }
    }

    // Consider pot odds
    if (handStrength > potOdds + 0.1) {
      // Good pot odds
      if (handStrength > 0.75) {
        return { action: 'raise', amount: Math.min(callAmount * 2.5, player.chips) }
      }
      return { action: 'call' }
    }

    // Bad pot odds
    if (chipRatio < 0.1 && handStrength > 0.3) {
      // Cheap to call, might as well
      return { action: 'call' }
    }

    return { action: 'fold' }
  }

  /**
   * Hard bot - Advanced strategy with bluffs
   */
  private hardBotDecision(
    handStrength: number,
    callAmount: number,
    chipRatio: number,
    potSize: number,
    player: Player,
    gamePhase: string
  ): { action: string; amount?: number } {
    const potOdds = callAmount / (potSize + callAmount)
    const hasPosition = player.isDealer
    const isLateGame = gamePhase === 'turn' || gamePhase === 'river'

    // Bluff frequency (10% of time with weak hands)
    const shouldBluff = Math.random() < 0.1 && handStrength < 0.3

    // No bet to call
    if (callAmount === 0) {
      if (shouldBluff || handStrength > 0.6) {
        const betSize = hasPosition ? potSize * 0.8 : potSize * 0.6
        return { action: 'bet', amount: Math.min(Math.floor(betSize), player.chips) }
      }
      return { action: 'check' }
    }

    // Facing a bet
    if (shouldBluff && hasPosition && isLateGame) {
      // Bluff raise in position
      return { action: 'raise', amount: Math.min(callAmount * 3, player.chips) }
    }

    // Strong hand strategy
    if (handStrength > 0.8) {
      if (chipRatio < 0.3) {
        // Big raise with strong hand
        return { action: 'raise', amount: Math.min(Math.floor(potSize * 1.5), player.chips) }
      } else {
        // Just call to keep them in (slowplay)
        return { action: 'call' }
      }
    }

    // Good pot odds
    if (handStrength > potOdds + 0.05) {
      if (handStrength > 0.7) {
        return { action: 'raise', amount: Math.min(callAmount * 2.5, player.chips) }
      }
      return { action: 'call' }
    }

    // Marginal decision
    if (chipRatio < 0.05 && handStrength > 0.25) {
      return { action: 'call' }
    }

    return { action: 'fold' }
  }

  /**
   * Evaluate hand strength (0-1 scale)
   * This is a simplified heuristic - real poker equity calculation is complex
   */
  private evaluateHandStrength(
    holeCards: Card[],
    communityCards: Card[],
    gamePhase: string
  ): number {
    if (holeCards.length !== 2) return 0

    const card1 = holeCards[0]!
    const card2 = holeCards[1]!

    // Preflop strength (based on starting hand charts)
    if (gamePhase === 'preflop' || communityCards.length === 0) {
      return this.evaluatePreflopStrength(card1, card2)
    }

    // Post-flop: simplified evaluation
    // In reality, would use Monte Carlo simulation or lookup tables
    const preflopBase = this.evaluatePreflopStrength(card1, card2)
    const boardTexture = this.evaluateBoardTexture(communityCards)

    // Combine preflop strength with board texture (simplified)
    return Math.min(1, preflopBase * 0.6 + boardTexture * 0.4)
  }

  /**
   * Evaluate preflop hand strength
   */
  private evaluatePreflopStrength(card1: Card, card2: Card): number {
    const val1 = card1.getValue()
    const val2 = card2.getValue()
    const isPair = val1 === val2
    const isSuited = card1.suit === card2.suit
    const highCard = Math.max(val1, val2)
    const lowCard = Math.min(val1, val2)
    const gap = highCard - lowCard

    // Premium pairs
    if (isPair) {
      if (highCard >= 13) return 0.95 // AA, KK
      if (highCard >= 11) return 0.85 // QQ, JJ
      if (highCard >= 9) return 0.75 // TT, 99
      if (highCard >= 7) return 0.65 // 88, 77
      return 0.55 // Small pairs
    }

    // High cards
    if (highCard >= 13) {
      // Ace
      if (lowCard >= 12) return isSuited ? 0.82 : 0.78 // AK
      if (lowCard >= 11) return isSuited ? 0.75 : 0.68 // AQ
      if (lowCard >= 10) return isSuited ? 0.68 : 0.62 // AJ
      if (lowCard >= 9) return isSuited ? 0.62 : 0.55 // AT
      if (isSuited) return 0.45 + (lowCard / 100) // Suited ace
      return 0.35 + (lowCard / 100) // Offsuit ace
    }

    if (highCard >= 12) {
      // King
      if (lowCard >= 11) return isSuited ? 0.72 : 0.65 // KQ
      if (lowCard >= 10) return isSuited ? 0.65 : 0.58 // KJ
      if (isSuited) return 0.40 + (lowCard / 100)
      return 0.30 + (lowCard / 100)
    }

    // Connected cards
    if (gap <= 1 && highCard >= 9) {
      return isSuited ? 0.55 : 0.45 // Connected broadways
    }

    if (gap <= 2 && isSuited && highCard >= 8) {
      return 0.48 // Suited connectors
    }

    // Weak hands
    if (highCard <= 8 && gap >= 3) {
      return 0.25 // Trash
    }

    return 0.35 // Default for other hands
  }

  /**
   * Evaluate board texture (simplified)
   */
  private evaluateBoardTexture(communityCards: Card[]): number {
    if (communityCards.length === 0) return 0.5

    // Count high cards on board
    const highCards = communityCards.filter((c) => c.getValue() >= 10).length
    const pairOnBoard = this.hasPairOnBoard(communityCards)
    const flushPossible = this.hasFlushDraw(communityCards)

    let texture = 0.5

    // High cards on board favor high card hands
    texture += highCards * 0.05

    // Paired board is dangerous
    if (pairOnBoard) texture -= 0.1

    // Flush possible is dangerous
    if (flushPossible) texture -= 0.1

    return Math.max(0.1, Math.min(0.9, texture))
  }

  /**
   * Check if board has a pair
   */
  private hasPairOnBoard(cards: Card[]): boolean {
    const values = cards.map((c) => c.getValue())
    return new Set(values).size < values.length
  }

  /**
   * Check if flush draw is possible
   */
  private hasFlushDraw(cards: Card[]): boolean {
    if (cards.length < 3) return false
    const suits = cards.map((c) => c.suit)
    const suitCounts = new Map<string, number>()

    suits.forEach((suit) => {
      suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1)
    })

    return Array.from(suitCounts.values()).some((count) => count >= 3)
  }

  /**
   * Get thinking time in milliseconds (simulate human-like thinking)
   */
  getThinkingTime(difficulty?: string): number {
    const base = difficulty === 'hard' ? 2000 : difficulty === 'medium' ? 1500 : 1000
    const variance = Math.random() * 1000
    return base + variance
  }
}
