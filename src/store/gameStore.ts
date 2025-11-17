import { create } from 'zustand'
import { Player } from '../game-logic/models/Player'
import { Card } from '../game-logic/models/Card'
import { Deck } from '../game-logic/models/Deck'
import { HandEvaluator } from '../game-logic/evaluation/HandEvaluator'
import { PotCalculator } from '../game-logic/pot-calculation/PotCalculator'
import { BettingValidator } from '../game-logic/rules/BettingValidator'

type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'handComplete'

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

  // Helpers
  handEvaluator: HandEvaluator
  potCalculator: PotCalculator
  bettingValidator: BettingValidator

  // Actions
  initializeGame: (playerCount: number) => void
  startNewHand: () => void
  dealCards: () => void
  advancePhase: () => void
  playerAction: (action: string, amount?: number) => void
  getCurrentPlayer: () => Player | undefined
  getValidActions: () => string[]
  calculateCallAmount: () => number
  calculateMinRaise: () => number
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

  // Helpers
  handEvaluator: new HandEvaluator(),
  potCalculator: new PotCalculator(),
  bettingValidator: new BettingValidator(),

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
    })

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
  },

  // Advance to next phase
  advancePhase: () => {
    const { gamePhase, deck, players, dealerIndex } = get()

    let newPhase: GamePhase = gamePhase
    const newCommunityCards: Card[] = [...get().communityCards]

    // Reset betting for new round
    players.forEach((player) => player.resetForNewRound())

    // First to act is after dealer
    const firstToAct = (dealerIndex + 1) % players.length

    switch (gamePhase) {
      case 'preflop':
        // Deal flop (burn 1, deal 3)
        deck.burn()
        newCommunityCards.push(...deck.dealMultiple(3))
        newPhase = 'flop'
        break
      case 'flop':
        // Deal turn (burn 1, deal 1)
        deck.burn()
        newCommunityCards.push(deck.deal())
        newPhase = 'turn'
        break
      case 'turn':
        // Deal river (burn 1, deal 1)
        deck.burn()
        newCommunityCards.push(deck.deal())
        newPhase = 'river'
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
  },

  // Handle player action
  playerAction: (action: string, amount?: number) => {
    const { players, currentPlayerIndex } = get()
    const currentPlayer = players[currentPlayerIndex]

    if (!currentPlayer || !currentPlayer.canAct()) {
      return
    }

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
      }
    } else {
      // No more active players, end hand
      set({ gamePhase: 'handComplete' })
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
