import { Card } from './Card'

/**
 * Player status in the game
 */
export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out' | 'eliminated'

/**
 * Player action type
 */
export type PlayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in'

/**
 * Bot difficulty levels
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard'

/**
 * Options for creating a player
 */
export interface PlayerOptions {
  isBot?: boolean
  difficulty?: BotDifficulty
}

/**
 * Represents a poker player (human or bot)
 */
export class Player {
  id: string
  name: string
  chips: number
  status: PlayerStatus
  holeCards: Card[]

  // Betting state
  currentBet: number // Current bet in this betting round
  totalBet: number // Total bet in this hand (across all rounds)
  hasActed: boolean // Has acted in current betting round

  // Position state
  isDealer: boolean
  isSmallBlind: boolean
  isBigBlind: boolean

  // Bot state
  isBot: boolean
  botDifficulty?: BotDifficulty

  // Action history for current hand
  actionHistory: { action: PlayerAction; amount?: number; round?: string }[]

  constructor(id: string, name: string, chips: number, options?: PlayerOptions) {
    this.id = id
    this.name = name
    this.chips = chips
    this.status = 'active'
    this.holeCards = []

    this.currentBet = 0
    this.totalBet = 0
    this.hasActed = false

    this.isDealer = false
    this.isSmallBlind = false
    this.isBigBlind = false

    this.isBot = options?.isBot || false
    this.botDifficulty = options?.difficulty

    this.actionHistory = []
  }

  /**
   * Deal hole cards to the player
   */
  dealCards(cards: Card[]): void {
    if (cards.length !== 2) {
      throw new Error('Must deal exactly 2 hole cards')
    }
    this.holeCards = cards
  }

  /**
   * Place a bet (or add to current bet)
   */
  bet(amount: number): void {
    if (amount > this.chips) {
      throw new Error('Insufficient chips for bet')
    }

    this.chips -= amount
    this.currentBet += amount
    this.totalBet += amount
    this.hasActed = true

    // Check if all-in
    if (this.chips === 0) {
      this.status = 'all-in'
    }
  }

  /**
   * Fold the hand
   */
  fold(): void {
    this.status = 'folded'
    this.hasActed = true
  }

  /**
   * Reset for a new betting round (keeps totalBet, clears currentBet)
   */
  resetForNewRound(): void {
    this.currentBet = 0
    this.hasActed = false

    // Don't reset status if already folded or all-in
    // Active players stay active
  }

  /**
   * Reset for a new hand (complete reset except chips)
   */
  resetForNewHand(): void {
    this.holeCards = []
    this.currentBet = 0
    this.totalBet = 0
    this.hasActed = false
    this.isDealer = false
    this.isSmallBlind = false
    this.isBigBlind = false
    this.actionHistory = []

    // Reset status only if not sitting out or eliminated
    if (this.status !== 'sitting-out' && this.status !== 'eliminated') {
      this.status = 'active'
    }
  }

  /**
   * Add chips to player's stack
   */
  addChips(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
    this.chips += amount
  }

  /**
   * Check if player can act (not folded, not all-in, not sitting out)
   */
  canAct(): boolean {
    return this.status === 'active'
  }

  /**
   * Check if player has hole cards
   */
  hasCards(): boolean {
    return this.holeCards.length === 2
  }

  /**
   * Get available chips (chips not yet bet)
   */
  getAvailableChips(): number {
    return this.chips
  }

  /**
   * Record an action in history
   */
  recordAction(action: PlayerAction, amount?: number, round?: string): void {
    this.actionHistory.push({ action, amount, round })
  }

  /**
   * Clone the player (for game state snapshots)
   */
  clone(): Player {
    const cloned = new Player(this.id, this.name, this.chips, {
      isBot: this.isBot,
      difficulty: this.botDifficulty,
    })

    cloned.status = this.status
    cloned.holeCards = [...this.holeCards]
    cloned.currentBet = this.currentBet
    cloned.totalBet = this.totalBet
    cloned.hasActed = this.hasActed
    cloned.isDealer = this.isDealer
    cloned.isSmallBlind = this.isSmallBlind
    cloned.isBigBlind = this.isBigBlind
    cloned.actionHistory = [...this.actionHistory]

    return cloned
  }

  /**
   * Get player's position description
   */
  getPositionDescription(): string {
    if (this.isDealer) return 'Dealer'
    if (this.isSmallBlind) return 'Small Blind'
    if (this.isBigBlind) return 'Big Blind'
    return 'Player'
  }

  /**
   * Get a safe representation (hide hole cards if needed)
   */
  toSafeObject(hideCards = true): Partial<Player> {
    return {
      id: this.id,
      name: this.name,
      chips: this.chips,
      status: this.status,
      currentBet: this.currentBet,
      totalBet: this.totalBet,
      hasActed: this.hasActed,
      isDealer: this.isDealer,
      isSmallBlind: this.isSmallBlind,
      isBigBlind: this.isBigBlind,
      isBot: this.isBot,
      holeCards: hideCards ? [] : this.holeCards,
    }
  }
}
