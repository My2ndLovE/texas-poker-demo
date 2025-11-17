import { BettingValidator, BettingContext } from '../../../game-logic/rules/BettingValidator'

describe('BettingValidator', () => {
  let validator: BettingValidator

  beforeEach(() => {
    validator = new BettingValidator()
  })

  describe('validateAction', () => {
    describe('Fold', () => {
      it('should always allow fold', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'fold' }, context)
        expect(result.isValid).toBe(true)
      })
    })

    describe('Check', () => {
      it('should allow check when current bet is 0', () => {
        const context: BettingContext = {
          currentBet: 0,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 10,
          isFirstAction: true,
        }

        const result = validator.validateAction({ type: 'check' }, context)
        expect(result.isValid).toBe(true)
      })

      it('should allow check when player already matched current bet', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 400,
          playerCurrentBet: 100,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'check' }, context)
        expect(result.isValid).toBe(true)
      })

      it('should not allow check when player has not matched current bet', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 50,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'check' }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('must call or raise')
      })
    })

    describe('Call', () => {
      it('should allow call with sufficient chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'call' }, context)
        expect(result.isValid).toBe(true)
      })

      it('should not allow call when no bet to match', () => {
        const context: BettingContext = {
          currentBet: 0,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 10,
          isFirstAction: true,
        }

        const result = validator.validateAction({ type: 'call' }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('no bet to call')
      })

      it('should allow call as all-in when player has insufficient chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 50,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'call' }, context)
        expect(result.isValid).toBe(true)
        expect(result.isAllIn).toBe(true)
      })
    })

    describe('Raise', () => {
      it('should allow valid raise with sufficient chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'raise', amount: 200 }, context)
        expect(result.isValid).toBe(true)
      })

      it('should not allow raise below minimum', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'raise', amount: 150 }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('minimum raise')
      })

      it('should not allow raise without amount', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'raise' }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('amount required')
      })

      it('should not allow raise with insufficient chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 150,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'raise', amount: 200 }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('insufficient chips')
      })

      it('should allow raise as all-in when below minimum but all chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 120,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'raise', amount: 120 }, context)
        expect(result.isValid).toBe(true)
        expect(result.isAllIn).toBe(true)
      })
    })

    describe('Bet (first action)', () => {
      it('should allow bet when no current bet exists', () => {
        const context: BettingContext = {
          currentBet: 0,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 10,
          isFirstAction: true,
        }

        const result = validator.validateAction({ type: 'bet', amount: 50 }, context)
        expect(result.isValid).toBe(true)
      })

      it('should not allow bet below minimum', () => {
        const context: BettingContext = {
          currentBet: 0,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 10,
          isFirstAction: true,
        }

        const result = validator.validateAction({ type: 'bet', amount: 5 }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('minimum bet')
      })

      it('should not allow bet when bet already exists', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 500,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'bet', amount: 50 }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('use raise')
      })
    })

    describe('All-in', () => {
      it('should allow all-in with all remaining chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 150,
          playerCurrentBet: 0,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'all-in' }, context)
        expect(result.isValid).toBe(true)
        expect(result.isAllIn).toBe(true)
      })

      it('should not allow all-in with 0 chips', () => {
        const context: BettingContext = {
          currentBet: 100,
          playerChips: 0,
          playerCurrentBet: 100,
          minRaise: 100,
          isFirstAction: false,
        }

        const result = validator.validateAction({ type: 'all-in' }, context)
        expect(result.isValid).toBe(false)
        expect(result.error).toContain('no chips')
      })
    })
  })

  describe('getValidActions', () => {
    it('should return valid actions when facing a bet', () => {
      const context: BettingContext = {
        currentBet: 100,
        playerChips: 500,
        playerCurrentBet: 0,
        minRaise: 100,
        isFirstAction: false,
      }

      const actions = validator.getValidActions(context)

      expect(actions).toContain('fold')
      expect(actions).toContain('call')
      expect(actions).toContain('raise')
      expect(actions).toContain('all-in')
      expect(actions).not.toContain('check')
      expect(actions).not.toContain('bet')
    })

    it('should return valid actions when no bet exists', () => {
      const context: BettingContext = {
        currentBet: 0,
        playerChips: 500,
        playerCurrentBet: 0,
        minRaise: 10,
        isFirstAction: true,
      }

      const actions = validator.getValidActions(context)

      expect(actions).toContain('fold')
      expect(actions).toContain('check')
      expect(actions).toContain('bet')
      expect(actions).toContain('all-in')
      expect(actions).not.toContain('call')
      expect(actions).not.toContain('raise')
    })

    it('should return only fold and all-in when player has insufficient chips to call', () => {
      const context: BettingContext = {
        currentBet: 100,
        playerChips: 30,
        playerCurrentBet: 0,
        minRaise: 100,
        isFirstAction: false,
      }

      const actions = validator.getValidActions(context)

      expect(actions).toContain('fold')
      expect(actions).toContain('call') // Can call as all-in
      expect(actions).toContain('all-in')
      expect(actions).not.toContain('raise') // Cannot raise
    })
  })

  describe('calculateCallAmount', () => {
    it('should calculate correct call amount', () => {
      const context: BettingContext = {
        currentBet: 100,
        playerChips: 500,
        playerCurrentBet: 30,
        minRaise: 100,
        isFirstAction: false,
      }

      const amount = validator.calculateCallAmount(context)
      expect(amount).toBe(70) // 100 - 30
    })

    it('should return 0 when no bet to call', () => {
      const context: BettingContext = {
        currentBet: 0,
        playerChips: 500,
        playerCurrentBet: 0,
        minRaise: 10,
        isFirstAction: true,
      }

      const amount = validator.calculateCallAmount(context)
      expect(amount).toBe(0)
    })

    it('should cap at player chips', () => {
      const context: BettingContext = {
        currentBet: 100,
        playerChips: 50,
        playerCurrentBet: 0,
        minRaise: 100,
        isFirstAction: false,
      }

      const amount = validator.calculateCallAmount(context)
      expect(amount).toBe(50) // All remaining chips
    })
  })

  describe('calculateMinRaise', () => {
    it('should calculate minimum raise amount', () => {
      const context: BettingContext = {
        currentBet: 100,
        playerChips: 500,
        playerCurrentBet: 0,
        minRaise: 100,
        isFirstAction: false,
      }

      const amount = validator.calculateMinRaise(context)
      expect(amount).toBe(200) // currentBet + minRaise
    })

    it('should use big blind as minimum when no current bet', () => {
      const context: BettingContext = {
        currentBet: 0,
        playerChips: 500,
        playerCurrentBet: 0,
        minRaise: 10,
        isFirstAction: true,
      }

      const amount = validator.calculateMinRaise(context)
      expect(amount).toBe(10)
    })
  })
})
