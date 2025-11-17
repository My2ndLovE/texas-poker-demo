import { create } from 'zustand'
import { Player } from '../game-logic/models/Player'
import { Card } from '../game-logic/models/Card'
import { Deck } from '../game-logic/models/Deck'
import { HandEvaluator } from '../game-logic/evaluation/HandEvaluator'
import { PotCalculator } from '../game-logic/pot-calculation/PotCalculator'
import { BettingValidator } from '../game-logic/rules/BettingValidator'
import { BotAI } from '../game-logic/ai/BotAI'

type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handComplete'

export interface ActionLog {
  playerName: string
  action: string
  amount?: number | undefined
  timestamp: number
}

interface GameState {
  // Players
  players: Player[]
  humanPlayerId: string

  // Game state
  gamePhase: GamePhase
  currentPlayerIndex: number
  dealerIndex: number

  // Cards
  deck: Deck
  communityCards: Card[]

  // Betting
  potAmount: number
  currentBet: number
  minRaise: number
  smallBlind: number
  bigBlind: number

  // Action history
  actionLog: ActionLog[]
  lastWinners: { playerId: string; amount: number; handDescription: string }[]

  // Helpers
  handEvaluator: HandEvaluator
  potCalculator: PotCalculator
  bettingValidator: BettingValidator
  botAI: BotAI

  // Actions
  initializeGame: (playerCount: number) => void
  startNewHand: () => void
  dealCards: () => void
  advancePhase: () => void
  playerAction: (action: string, amount?: number) => void
  processBotTurn: () => void
  handleShowdown: () => void
  getCurrentPlayer: () => Player | undefined
  getValidActions: () => string[]
  calculateCallAmount: () => number
  calculateMinRaise: () => number
  addActionLog: (playerName: string, action: string, amount?: number) => void
}

const createPlayer = (id: string, name: string, chips: number, isBot: boolean): Player => {
  return new Player(id, name, chips, { isBot, difficulty: 'medium' })
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  players: [],
  humanPlayerId: 'player-0',
  gamePhase: 'waiting',
  currentPlayerIndex: 0,
  dealerIndex: 0,
  deck: new Deck(),
  communityCards: [],
  potAmount: 0,
  currentBet: 0,
  minRaise: 20,
  smallBlind: 10,
  bigBlind: 20,
  actionLog: [],
  lastWinners: [],

  // Helpers
  handEvaluator: new HandEvaluator(),
  potCalculator: new PotCalculator(),
  bettingValidator: new BettingValidator(),
  botAI: new BotAI(),

  // Add action to log
  addActionLog: (playerName: string, action: string, amount?: number) => {
    set((state) => ({
      actionLog: [
        ...state.actionLog.slice(-9), // Keep last 10 actions
        {
          playerName,
          action,
          amount,
          timestamp: Date.now(),
        },
      ],
    }))
  },

  // Initialize game with players
  initializeGame: (playerCount: number = 6) => {
    const players: Player[] = []

    // Human player
    players.push(createPlayer('player-0', 'You', 1000, false))

    // Bot players
    const botNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
    for (let i = 1; i < playerCount; i++) {
      players.push(createPlayer(`player-${i}`, botNames[i - 1] || `Bot ${i}`, 1000, true))
    }

    set({
      players,
      humanPlayerId: 'player-0',
      gamePhase: 'waiting',
      dealerIndex: 0,
      currentPlayerIndex: 0,
      potAmount: 0,
      currentBet: 0,
      actionLog: [],
      lastWinners: [],
    })

    // Start first hand
    get().startNewHand()
  },

  // Start a new hand
  startNewHand: () => {
    const { players, dealerIndex, smallBlind, bigBlind } = get()

    // Reset all players for new hand
    players.forEach((player) => player.resetForNewHand())

    // Move dealer button
    const newDealerIndex = (dealerIndex + 1) % players.length

    // Assign positions
    players[newDealerIndex]!.isDealer = true
    const sbIndex = (newDealerIndex + 1) % players.length
    const bbIndex = (newDealerIndex + 2) % players.length
    players[sbIndex]!.isSmallBlind = true
    players[bbIndex]!.isBigBlind = true

    // Post blinds
    players[sbIndex]!.bet(smallBlind)
    players[bbIndex]!.bet(bigBlind)

    // Create new deck
    const deck = new Deck()
    deck.shuffle()

    // First to act is after big blind
    const firstToAct = (bbIndex + 1) % players.length

    set({
      dealerIndex: newDealerIndex,
      currentPlayerIndex: firstToAct,
      gamePhase: 'waiting',
      deck,
      communityCards: [],
      potAmount: smallBlind + bigBlind,
      currentBet: bigBlind,
      minRaise: bigBlind,
      actionLog: [],
      lastWinners: [],
    })

    // Log blinds
    get().addActionLog(players[sbIndex]!.name, 'posts small blind', smallBlind)
    get().addActionLog(players[bbIndex]!.name, 'posts big blind', bigBlind)

    // Deal cards
    get().dealCards()
  },

  // Deal hole cards to all players
  dealCards: () => {
    const { players, deck } = get()

    players.forEach((player) => {
      const cards = deck.dealMultiple(2)
      player.dealCards(cards)
    })

    set({ gamePhase: 'preflop' })

    // Trigger bot turn if current player is bot
    setTimeout(() => {
      const currentPlayer = get().getCurrentPlayer()
      if (currentPlayer?.isBot) {
        get().processBotTurn()
      }
    }, 500)
  },

  // Advance to next phase
  advancePhase: () => {
    const { gamePhase, deck, players, dealerIndex } = get()

    let newPhase: GamePhase = gamePhase
    const newCommunityCards: Card[] = [...get().communityCards]

    // Reset betting for new round
    players.forEach((player) => player.resetForNewRound())

    // Find first active player after dealer
    let firstToAct = (dealerIndex + 1) % players.length
    let iterations = 0
    while (!players[firstToAct]?.canAct() && iterations < players.length) {
      firstToAct = (firstToAct + 1) % players.length
      iterations++
    }

    switch (gamePhase) {
      case 'preflop':
        // Deal flop (burn 1, deal 3)
        deck.burn()
        newCommunityCards.push(...deck.dealMultiple(3))
        newPhase = 'flop'
        get().addActionLog('Dealer', 'deals flop')
        break
      case 'flop':
        // Deal turn (burn 1, deal 1)
        deck.burn()
        newCommunityCards.push(deck.deal())
        newPhase = 'turn'
        get().addActionLog('Dealer', 'deals turn')
        break
      case 'turn':
        // Deal river (burn 1, deal 1)
        deck.burn()
        newCommunityCards.push(deck.deal())
        newPhase = 'river'
        get().addActionLog('Dealer', 'deals river')
        break
      case 'river':
        newPhase = 'showdown'
        break
      case 'showdown':
        newPhase = 'handComplete'
        break
    }

    set({
      gamePhase: newPhase,
      communityCards: newCommunityCards,
      currentBet: 0,
      currentPlayerIndex: firstToAct,
    })

    // Handle showdown
    if (newPhase === 'showdown') {
      setTimeout(() => get().handleShowdown(), 1000)
    }

    // Trigger bot turn if needed
    if (newPhase !== 'showdown' && newPhase !== 'handComplete') {
      setTimeout(() => {
        const currentPlayer = get().getCurrentPlayer()
        if (currentPlayer?.isBot) {
          get().processBotTurn()
        }
      }, 1000)
    }
  },

  // Process bot turn
  processBotTurn: () => {
    const { players, currentPlayerIndex, potAmount, communityCards, gamePhase, botAI } = get()
    const currentPlayer = players[currentPlayerIndex]

    if (!currentPlayer || !currentPlayer.isBot || !currentPlayer.canAct()) {
      return
    }

    // Get bot decision
    const decision = botAI.decideAction(
      currentPlayer,
      get().currentBet,
      potAmount,
      communityCards,
      gamePhase
    )

    // Apply thinking delay
    const thinkingTime = botAI.getThinkingTime(currentPlayer.botDifficulty)

    setTimeout(() => {
      // Double-check player is still current (user might have taken action)
      const stillCurrent = get().getCurrentPlayer()
      if (stillCurrent?.id === currentPlayer.id) {
        get().playerAction(decision.action, decision.amount)
      }
    }, thinkingTime)
  },

  // Handle showdown and determine winners
  handleShowdown: () => {
    const { players, communityCards, potAmount, handEvaluator } = get()

    const activePlayers = players.filter((p) => p.status !== 'folded')

    if (activePlayers.length === 0) {
      set({ gamePhase: 'handComplete' })
      return
    }

    // Only 1 player left (everyone else folded)
    if (activePlayers.length === 1) {
      const winner = activePlayers[0]!
      winner.chips += potAmount

      set({
        potAmount: 0,
        gamePhase: 'handComplete',
        lastWinners: [
          {
            playerId: winner.id,
            amount: potAmount,
            handDescription: 'Won (others folded)',
          },
        ],
      })

      get().addActionLog(winner.name, 'wins', potAmount)
      return
    }

    // Evaluate hands for showdown
    const handResults = activePlayers.map((player) => {
      const allCards = [...player.holeCards, ...communityCards]
      const handResult = handEvaluator.evaluateHand(allCards)
      return {
        player,
        handResult,
        handDescription: handResult.description,
      }
    })

    // Sort by hand rank (higher = better)
    handResults.sort((a, b) => {
      const comparison = handEvaluator.compareHands(
        [...a.player.holeCards, ...communityCards],
        [...b.player.holeCards, ...communityCards]
      )
      return -comparison // Reverse for descending order
    })

    // Find winners (may be multiple in case of tie)
    const bestRank = handResults[0]!.handResult.rank
    const winners = handResults.filter((r) => r.handResult.rank === bestRank)

    // Distribute pot
    const amountPerWinner = Math.floor(potAmount / winners.length)
    const remainder = potAmount % winners.length

    const winnerResults = winners.map((winner, index) => {
      const winAmount = amountPerWinner + (index < remainder ? 1 : 0)
      winner.player.chips += winAmount

      get().addActionLog(
        winner.player.name,
        `wins with ${winner.handDescription}`,
        winAmount
      )

      return {
        playerId: winner.player.id,
        amount: winAmount,
        handDescription: winner.handDescription,
      }
    })

    set({
      potAmount: 0,
      gamePhase: 'handComplete',
      lastWinners: winnerResults,
    })
  },

  // Handle player action
  playerAction: (action: string, amount?: number) => {
    const { players, currentPlayerIndex } = get()
    const currentPlayer = players[currentPlayerIndex]

    if (!currentPlayer || !currentPlayer.canAct()) {
      return
    }

    // Log action
    const actionText = action === 'call' ? 'calls' :
                       action === 'raise' ? 'raises to' :
                       action === 'bet' ? 'bets' :
                       action === 'check' ? 'checks' :
                       action === 'fold' ? 'folds' :
                       action === 'all-in' ? 'goes all-in' : action

    get().addActionLog(currentPlayer.name, actionText, amount)

    switch (action) {
      case 'fold':
        currentPlayer.fold()
        break

      case 'check':
        currentPlayer.hasActed = true
        break

      case 'call': {
        const callAmount = get().calculateCallAmount()
        if (callAmount > 0) {
          currentPlayer.bet(callAmount)
          set((state) => ({ potAmount: state.potAmount + callAmount }))
        }
        break
      }

      case 'bet':
      case 'raise':
        if (amount) {
          const { currentBet } = get()
          const additionalAmount = amount - currentPlayer.currentBet
          currentPlayer.bet(additionalAmount)
          set((state) => ({
            currentBet: amount,
            minRaise: amount - currentBet,
            potAmount: state.potAmount + additionalAmount,
          }))
        }
        break

      case 'all-in':
        const allInAmount = currentPlayer.chips
        currentPlayer.bet(allInAmount)
        set((state) => ({
          currentBet: Math.max(state.currentBet, currentPlayer.currentBet),
          potAmount: state.potAmount + allInAmount,
        }))
        break
    }

    // Move to next player
    const activePlayers = players.filter((p) => p.canAct())
    if (activePlayers.length > 0) {
      let nextIndex = (currentPlayerIndex + 1) % players.length
      let iterations = 0
      while (!players[nextIndex]?.canAct() && iterations < players.length) {
        nextIndex = (nextIndex + 1) % players.length
        iterations++
      }

      set({ currentPlayerIndex: nextIndex })

      // Check if betting round is complete
      const playersWhoNeedToAct = players.filter(
        (p) => p.canAct() && (!p.hasActed || p.currentBet < get().currentBet)
      )

      if (playersWhoNeedToAct.length === 0) {
        // Betting round complete, advance phase
        setTimeout(() => get().advancePhase(), 1000)
      } else {
        // Next player's turn
        const nextPlayer = players[nextIndex]
        if (nextPlayer?.isBot) {
          get().processBotTurn()
        }
      }
    } else {
      // No more active players, go to showdown
      setTimeout(() => get().handleShowdown(), 1000)
    }
  },

  // Get current player
  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get()
    return players[currentPlayerIndex]
  },

  // Get valid actions for current player
  getValidActions: () => {
    const currentPlayer = get().getCurrentPlayer()
    if (!currentPlayer) return []

    const context = {
      currentBet: get().currentBet,
      playerChips: currentPlayer.chips,
      playerCurrentBet: currentPlayer.currentBet,
      minRaise: get().minRaise,
      isFirstAction: !currentPlayer.hasActed,
    }

    return get().bettingValidator.getValidActions(context)
  },

  // Calculate call amount
  calculateCallAmount: () => {
    const currentPlayer = get().getCurrentPlayer()
    if (!currentPlayer) return 0

    return get().currentBet - currentPlayer.currentBet
  },

  // Calculate minimum raise
  calculateMinRaise: () => {
    const currentPlayer = get().getCurrentPlayer()
    if (!currentPlayer) return get().bigBlind

    const context = {
      currentBet: get().currentBet,
      playerChips: currentPlayer.chips,
      playerCurrentBet: currentPlayer.currentBet,
      minRaise: get().minRaise,
      isFirstAction: !currentPlayer.hasActed,
    }

    return get().bettingValidator.calculateMinRaise(context)
  },
}))
