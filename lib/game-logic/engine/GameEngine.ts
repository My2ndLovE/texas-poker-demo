import { GameState, GamePhase, createInitialGameState, getActivePlayers, getPlayersInHand } from '../models/GameState';
import { Player, createPlayer, isPlayerInHand } from '../models/Player';
import { Action, createAction } from '../models/Action';
import { Deck } from '../deck/Deck';
import { positionRules } from '../rules/PositionRules';
import { bettingRules } from '../rules/BettingRules';
import { potCalculator } from '../pot/PotCalculator';
import { handEvaluator } from '../evaluation/HandEvaluator';

export class GameEngine {
  private deck: Deck;

  constructor() {
    this.deck = new Deck();
  }

  // Initialize a new game with players
  initializeGame(state: GameState, humanPlayerName: string): GameState {
    const newState = { ...state };
    newState.players = [];

    // Add human player at position 0
    newState.players.push(
      createPlayer('player-0', humanPlayerName, state.settings.startingChips, 0, false)
    );

    // Add bots
    const botNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

    for (let i = 0; i < state.settings.numBots; i++) {
      const difficulty =
        state.settings.botDifficulty === 'mixed'
          ? difficulties[i % 3]
          : state.settings.botDifficulty;

      newState.players.push(
        createPlayer(
          `bot-${i}`,
          botNames[i],
          state.settings.startingChips,
          i + 1,
          true,
          difficulty
        )
      );
    }

    newState.dealerIndex = 0;
    newState.handNumber = 0;
    newState.phase = 'waiting';

    return newState;
  }

  // Start a new hand
  startNewHand(state: GameState): GameState {
    const newState = { ...state };

    // Reset deck and shuffle
    this.deck.reset();
    this.deck.shuffle();

    // Reset player states
    newState.players = newState.players.map((p) => ({
      ...p,
      holeCards: [],
      currentBet: 0,
      totalBet: 0,
      status: p.chips > 0 ? 'active' : 'eliminated',
    }));

    // Calculate positions
    const positions = positionRules.calculatePositions(newState);
    newState.dealerIndex = positions.dealerIndex;
    newState.smallBlindIndex = positions.smallBlindIndex;
    newState.bigBlindIndex = positions.bigBlindIndex;
    newState.currentPlayerIndex = positions.firstToActIndex;

    // Post blinds
    this.postBlinds(newState);

    // Deal hole cards
    for (const player of newState.players.filter((p) => p.status !== 'eliminated')) {
      player.holeCards = this.deck.dealMultiple(2);
    }

    newState.communityCards = [];
    newState.actionHistory = [];
    newState.phase = 'preflop';
    newState.handNumber++;
    newState.lastActionIndex = positions.firstToActIndex;

    return newState;
  }

  // Post small and big blinds
  private postBlinds(state: GameState): void {
    if (state.smallBlindIndex >= 0) {
      const sbPlayer = state.players[state.smallBlindIndex];
      const sbAmount = Math.min(state.settings.smallBlind, sbPlayer.chips);
      sbPlayer.chips -= sbAmount;
      sbPlayer.currentBet = sbAmount;
      sbPlayer.totalBet = sbAmount;
      if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';
    }

    if (state.bigBlindIndex >= 0) {
      const bbPlayer = state.players[state.bigBlindIndex];
      const bbAmount = Math.min(state.settings.bigBlind, bbPlayer.chips);
      bbPlayer.chips -= bbAmount;
      bbPlayer.currentBet = bbAmount;
      bbPlayer.totalBet = bbAmount;
      state.currentBet = bbAmount;
      state.minRaise = bbAmount;
      if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';
    }
  }

  // Process a player action
  processAction(state: GameState, action: Action): GameState {
    const newState = { ...state };
    const player = newState.players.find((p) => p.id === action.playerId);
    if (!player) return newState;

    switch (action.type) {
      case 'fold':
        player.status = 'folded';
        break;

      case 'check':
        // No chips moved
        break;

      case 'call':
        const callAmount = Math.min(action.amount, player.chips);
        player.chips -= callAmount;
        player.currentBet += callAmount;
        player.totalBet += callAmount;
        if (player.chips === 0) player.status = 'all-in';
        break;

      case 'bet':
      case 'raise':
        const raiseAmount = Math.min(action.amount, player.chips);
        player.chips -= raiseAmount;
        player.currentBet += raiseAmount;
        player.totalBet += raiseAmount;
        newState.currentBet = player.currentBet;
        newState.minRaise = raiseAmount - (newState.currentBet - raiseAmount);
        newState.lastActionIndex = newState.currentPlayerIndex;
        if (player.chips === 0) player.status = 'all-in';
        break;

      case 'all-in':
        const allInAmount = player.chips;
        player.chips = 0;
        player.currentBet += allInAmount;
        player.totalBet += allInAmount;
        player.status = 'all-in';
        if (player.currentBet > newState.currentBet) {
          newState.currentBet = player.currentBet;
        }
        break;
    }

    newState.actionHistory.push(action);

    // Move to next player
    newState.currentPlayerIndex = positionRules.getNextActivePlayerIndex(
      newState.players,
      newState.currentPlayerIndex
    );

    // Check if betting round is complete
    if (this.isBettingRoundComplete(newState)) {
      return this.advancePhase(newState);
    }

    return newState;
  }

  // Check if current betting round is complete
  private isBettingRoundComplete(state: GameState): boolean {
    const playersInHand = state.players.filter(
      (p) => p.status === 'active' || p.status === 'all-in'
    );

    if (playersInHand.length <= 1) return true;

    const activePlayers = playersInHand.filter((p) => p.status === 'active');
    if (activePlayers.length === 0) return true;

    // All players must have equal bets (or be all-in)
    const maxBet = Math.max(...playersInHand.map((p) => p.currentBet));
    return playersInHand.every((p) => p.currentBet === maxBet || p.status === 'all-in');
  }

  // Advance to next phase
  private advancePhase(state: GameState): GameState {
    const newState = { ...state };

    // Reset current bets
    newState.players.forEach((p) => {
      p.currentBet = 0;
    });
    newState.currentBet = 0;

    // Advance phase
    switch (newState.phase) {
      case 'preflop':
        this.deck.burn();
        newState.communityCards = this.deck.dealMultiple(3); // Flop
        newState.phase = 'flop';
        break;

      case 'flop':
        this.deck.burn();
        newState.communityCards.push(...this.deck.dealMultiple(1)); // Turn
        newState.phase = 'turn';
        break;

      case 'turn':
        this.deck.burn();
        newState.communityCards.push(...this.deck.dealMultiple(1)); // River
        newState.phase = 'river';
        break;

      case 'river':
        newState.phase = 'showdown';
        return this.resolveShowdown(newState);
    }

    // Set first to act post-flop
    newState.currentPlayerIndex = positionRules.getFirstToActPostFlop(newState);

    return newState;
  }

  // Resolve showdown and distribute pots
  private resolveShowdown(state: GameState): GameState {
    const newState = { ...state };

    const playersInHand = getPlayersInHand(newState);
    if (playersInHand.length === 0) {
      newState.phase = 'complete';
      return newState;
    }

    // If only one player, they win
    if (playersInHand.length === 1) {
      const winner = playersInHand[0];
      const pot = potCalculator.calculatePots(newState.players);
      winner.chips += pot.totalPot;
      newState.phase = 'complete';
      return newState;
    }

    // Evaluate hands and find winners
    const pot = potCalculator.calculatePots(newState.players);
    const playerHands = playersInHand.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...newState.communityCards],
    }));

    const winnerIds = handEvaluator.findWinners(playerHands);
    const winners = winnerIds.map((id) => ({
      playerId: id,
      handValue: 1,
    }));

    const winnings = potCalculator.distributePots(pot, winners);

    // Award winnings
    winnings.forEach((amount, playerId) => {
      const player = newState.players.find((p) => p.id === playerId);
      if (player) {
        player.chips += amount;
      }
    });

    newState.phase = 'complete';
    return newState;
  }
}

// Singleton instance
export const gameEngine = new GameEngine();
