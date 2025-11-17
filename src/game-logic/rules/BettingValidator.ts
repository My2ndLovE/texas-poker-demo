/**
 * Represents a betting action
 */
export interface BettingAction {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in'
  amount?: number
}

/**
 * Context needed to validate betting actions
 */
export interface BettingContext {
  currentBet: number // Current bet to match
  playerChips: number // Player's available chips
  playerCurrentBet: number // Amount player has already bet this round
  minRaise: number // Minimum raise amount (usually big blind or last raise size)
  isFirstAction: boolean // Is this the first betting action of the round
}

/**
 * Result of betting action validation
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  isAllIn?: boolean
}

/**
 * Validates betting actions according to Texas Hold'em rules
 */
export class BettingValidator {
  /**
   * Validate a betting action
   */
  validateAction(action: BettingAction, context: BettingContext): ValidationResult {
    const { type, amount } = action
    const { currentBet, playerChips, playerCurrentBet, minRaise } = context

    switch (type) {
      case 'fold':
        return { isValid: true }

      case 'check':
        return this.validateCheck(context)

      case 'call':
        return this.validateCall(context)

      case 'bet':
        return this.validateBet(amount, context)

      case 'raise':
        return this.validateRaise(amount, context)

      case 'all-in':
        return this.validateAllIn(context)

      default:
        return { isValid: false, error: 'Invalid action type' }
    }
  }

  /**
   * Validate check action
   */
  private validateCheck(context: BettingContext): ValidationResult {
    const { currentBet, playerCurrentBet } = context

    // Can check if current bet is 0 or player has already matched current bet
    if (currentBet === 0 || currentBet === playerCurrentBet) {
      return { isValid: true }
    }

    return {
      isValid: false,
      error: 'Cannot check - must call or raise to match current bet',
    }
  }

  /**
   * Validate call action
   */
  private validateCall(context: BettingContext): ValidationResult {
    const { currentBet, playerChips, playerCurrentBet } = context

    const callAmount = this.calculateCallAmount(context)

    if (callAmount === 0) {
      return { isValid: false, error: 'Cannot call - no bet to call' }
    }

    // Player can always call, even if they don't have enough chips (goes all-in)
    const isAllIn = callAmount >= playerChips

    return { isValid: true, isAllIn }
  }

  /**
   * Validate bet action (first bet of the round)
   */
  private validateBet(amount: number | undefined, context: BettingContext): ValidationResult {
    const { currentBet, playerChips, minRaise } = context

    if (currentBet > 0) {
      return { isValid: false, error: 'Bet already exists - use raise instead' }
    }

    if (amount === undefined) {
      return { isValid: false, error: 'Bet amount required' }
    }

    if (amount < minRaise) {
      return { isValid: false, error: `Bet must be at least ${minRaise} (minimum bet)` }
    }

    if (amount > playerChips) {
      return { isValid: false, error: 'Bet amount exceeds available chips' }
    }

    const isAllIn = amount === playerChips

    return { isValid: true, isAllIn }
  }

  /**
   * Validate raise action
   */
  private validateRaise(
    amount: number | undefined,
    context: BettingContext
  ): ValidationResult {
    const { currentBet, playerChips, playerCurrentBet, minRaise } = context

    if (amount === undefined) {
      return { isValid: false, error: 'Raise amount required' }
    }

    const minRaiseAmount = this.calculateMinRaise(context)
    const callAmount = currentBet - playerCurrentBet
    const totalNeeded = amount

    // Check if player has enough chips
    if (totalNeeded > playerChips) {
      return { isValid: false, error: 'Raise amount exceeds available chips (insufficient chips)' }
    }

    // Allow all-in even if below minimum raise
    const isAllIn = totalNeeded === playerChips

    if (!isAllIn && amount < minRaiseAmount) {
      return {
        isValid: false,
        error: `Raise must be at least ${minRaiseAmount} (minimum raise is ${minRaise})`,
      }
    }

    return { isValid: true, isAllIn }
  }

  /**
   * Validate all-in action
   */
  private validateAllIn(context: BettingContext): ValidationResult {
    const { playerChips } = context

    if (playerChips === 0) {
      return { isValid: false, error: 'Cannot go all-in - no chips remaining' }
    }

    return { isValid: true, isAllIn: true }
  }

  /**
   * Get list of valid actions for current context
   */
  getValidActions(context: BettingContext): BettingAction['type'][] {
    const { currentBet, playerChips } = context
    const actions: BettingAction['type'][] = ['fold']

    // Can always go all-in if have chips
    if (playerChips > 0) {
      actions.push('all-in')
    }

    if (currentBet === 0) {
      // No current bet - can check or bet
      actions.push('check')
      if (playerChips > 0) {
        actions.push('bet')
      }
    } else {
      // Current bet exists - can call or raise
      const callAmount = this.calculateCallAmount(context)

      if (callAmount <= playerChips) {
        actions.push('call')
      } else {
        // Can call as all-in
        actions.push('call')
      }

      const minRaiseAmount = this.calculateMinRaise(context)
      if (playerChips >= minRaiseAmount) {
        actions.push('raise')
      }
    }

    return actions
  }

  /**
   * Calculate the amount needed to call
   */
  calculateCallAmount(context: BettingContext): number {
    const { currentBet, playerChips, playerCurrentBet } = context

    const callAmount = currentBet - playerCurrentBet

    // Cap at player's available chips
    return Math.min(callAmount, playerChips)
  }

  /**
   * Calculate minimum raise amount
   */
  calculateMinRaise(context: BettingContext): number {
    const { currentBet, minRaise } = context

    if (currentBet === 0) {
      // First bet of the round
      return minRaise
    }

    // Minimum raise is currentBet + minRaise
    return currentBet + minRaise
  }

  /**
   * Calculate maximum raise amount (all chips)
   */
  calculateMaxRaise(context: BettingContext): number {
    return context.playerChips
  }
}
