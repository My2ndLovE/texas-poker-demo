import type {
  ActionType,
  GamePhase,
  GameSettings,
  GameState,
  Player,
  PlayerAction,
  PlayerType,
} from '@/types';
import { Deck } from '../deck/Deck';
import { handEvaluator } from '../evaluation/HandEvaluator';
import { potCalculator } from '../pot/PotCalculator';
import { bettingRules } from '../rules/BettingRules';

/**
 * GameEngine manages the complete poker game state and logic
 */
export class GameEngine {
  private state: GameState;
  private deck: Deck;

  constructor() {
    this.deck = Deck.createAndShuffle();
    this.state = this.createInitialState();
  }

  /**
   * Initialize a new game with settings
   */
  initializeGame(settings: GameSettings, humanPlayerName = 'You'): void {
    const players = this.createPlayers(settings, humanPlayerName);

    this.state = {
      phase: 'preflop' as GamePhase,
      players,
      communityCards: [],
      pot: { mainPot: 0, sidePots: [], totalPot: 0 },
      currentPlayerIndex: 0,
      dealerIndex: Math.floor(Math.random() * players.length),
      smallBlindAmount: settings.blindLevel.small,
      bigBlindAmount: settings.blindLevel.big,
      minimumRaise: settings.blindLevel.big,
      deck: [],
      burnedCards: [],
      actionHistory: [],
      handNumber: 1,
      lastAggressorIndex: -1,
      bettingRoundStartIndex: 0,
    };

    this.startNewHand();
  }

  /**
   * Start a new hand
   */
  startNewHand(): void {
    // Reset deck
    this.deck.reset();

    // Reset players for new hand
    this.state.players = this.state.players
      .filter((p) => p.chips > 0) // Remove eliminated players
      .map((p) => ({
        ...p,
        holeCards: [],
        currentBet: 0,
        totalBet: 0,
        status: 'active' as const,
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false,
        lastAction: undefined,
        lastActionAmount: undefined,
      }));

    // Check for game over
    if (this.state.players.length <= 1) {
      this.state.phase = 'game-over' as GamePhase;
      return;
    }

    // Rotate dealer button
    this.state.dealerIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    this.state.players[this.state.dealerIndex].isDealer = true;

    // Reset game state
    this.state.communityCards = [];
    this.state.pot = { mainPot: 0, sidePots: [], totalPot: 0 };
    this.state.actionHistory = [];
    this.state.phase = 'preflop' as GamePhase;
    this.state.minimumRaise = this.state.bigBlindAmount;

    // Post blinds
    this.postBlinds();

    // Deal hole cards
    this.dealHoleCards();

    // Set first player to act (left of big blind)
    const firstPlayerIndex = this.getPlayerIndexLeftOf(this.getBigBlindIndex());
    this.state.currentPlayerIndex = firstPlayerIndex;
    this.state.bettingRoundStartIndex = firstPlayerIndex;
    // For preflop, BB is the last aggressor (they posted the big blind)
    this.state.lastAggressorIndex = this.getBigBlindIndex();
  }

  /**
   * Process a player action
   */
  processAction(playerId: string, actionType: ActionType, amount = 0): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // Validate action
    const validation = bettingRules.validateAction(
      player,
      { type: actionType, amount },
      this.state,
    );

    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid action');
    }

    // Execute action
    this.executeAction(player, actionType, amount);

    // Record action on player (for UI feedback)
    player.lastAction = actionType;
    player.lastActionAmount = amount;

    // Record action in history
    const action: PlayerAction = {
      playerId,
      type: actionType,
      amount,
      timestamp: Date.now(),
    };
    this.state.actionHistory.push(action);
    this.state.lastAction = action;

    // Update pot
    this.state.pot = potCalculator.calculatePots(this.state.players);

    // Move to next player or next phase
    if (this.isBettingRoundComplete()) {
      this.advancePhase();
    } else {
      this.moveToNextPlayer();
    }
  }

  /**
   * Execute a player action (modify player state)
   */
  private executeAction(player: Player, actionType: ActionType, amount: number): void {
    switch (actionType) {
      case 'fold':
        player.status = 'folded';
        break;

      case 'check':
        // No chips change
        break;

      case 'call': {
        const currentBet = bettingRules.getCurrentBet(this.state);
        const callAmount = Math.min(currentBet - player.currentBet, player.chips);
        player.chips -= callAmount;
        player.currentBet += callAmount;
        player.totalBet += callAmount;
        if (player.chips === 0) {
          player.status = 'all-in';
        }
        break;
      }

      case 'bet':
      case 'raise': {
        const betAmount = Math.min(amount, player.chips);
        player.chips -= betAmount;
        player.currentBet += betAmount;
        player.totalBet += betAmount;

        // Update minimum raise
        const currentBet = bettingRules.getCurrentBet(this.state);
        const raiseSize = player.currentBet - currentBet;
        this.state.minimumRaise = raiseSize;

        // Mark this player as the last aggressor (everyone must act after them)
        const playerIndex = this.state.players.findIndex((p) => p.id === player.id);
        this.state.lastAggressorIndex = playerIndex;

        if (player.chips === 0) {
          player.status = 'all-in';
        }
        break;
      }

      case 'all-in': {
        const allInAmount = player.chips;
        const currentBet = bettingRules.getCurrentBet(this.state);
        player.currentBet += allInAmount;
        player.totalBet += allInAmount;
        player.chips = 0;
        player.status = 'all-in';

        // If all-in is more than current bet, player is the aggressor
        if (player.currentBet > currentBet) {
          const playerIndex = this.state.players.findIndex((p) => p.id === player.id);
          this.state.lastAggressorIndex = playerIndex;
        }
        break;
      }
    }
  }

  /**
   * Post small and big blinds
   */
  private postBlinds(): void {
    const sbIndex = this.getPlayerIndexLeftOf(this.state.dealerIndex);
    const bbIndex = this.getPlayerIndexLeftOf(sbIndex);

    const sbPlayer = this.state.players[sbIndex];
    const bbPlayer = this.state.players[bbIndex];

    // Small blind
    const sbAmount = Math.min(this.state.smallBlindAmount, sbPlayer.chips);
    sbPlayer.chips -= sbAmount;
    sbPlayer.currentBet = sbAmount;
    sbPlayer.totalBet = sbAmount;
    sbPlayer.isSmallBlind = true;
    if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';

    // Big blind
    const bbAmount = Math.min(this.state.bigBlindAmount, bbPlayer.chips);
    bbPlayer.chips -= bbAmount;
    bbPlayer.currentBet = bbAmount;
    bbPlayer.totalBet = bbAmount;
    bbPlayer.isBigBlind = true;
    if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';
  }

  /**
   * Deal hole cards to all active players
   */
  private dealHoleCards(): void {
    for (const player of this.state.players) {
      if (player.status !== 'eliminated') {
        player.holeCards = this.deck.deal(2);
      }
    }
  }

  /**
   * Check if betting round is complete
   */
  private isBettingRoundComplete(): boolean {
    const activePlayers = this.state.players.filter(
      (p) => p.status === 'active' || p.status === 'all-in',
    );

    if (activePlayers.length === 1) {
      return true; // Only one player left
    }

    const playersWhoCanAct = this.state.players.filter((p) => p.status === 'active');
    if (playersWhoCanAct.length === 0) {
      return true; // All remaining players are all-in
    }

    // Check if all players have matched the current bet
    const currentBet = bettingRules.getCurrentBet(this.state);
    const allBetsEqual = playersWhoCanAct.every((p) => p.currentBet === currentBet);

    if (!allBetsEqual) {
      return false; // Someone hasn't matched the bet yet
    }

    // All bets are equal. Now check if everyone has had a chance to act.
    // The round is complete if we've reached the last aggressor (or gone full circle if no aggressor)
    const currentPlayerIndex = this.state.currentPlayerIndex;

    // If there was an aggressor (someone bet/raised), action must return to them
    if (this.state.lastAggressorIndex !== -1) {
      // Check if the next player to act would be the aggressor or someone past them
      const nextPlayerIndex = this.getNextActivePlayerIndex(currentPlayerIndex);
      if (nextPlayerIndex === -1) {
        return true; // No more active players
      }

      // If next player is the aggressor and all bets are equal, round is complete
      // (The aggressor doesn't need to act again if no one raised after them)
      return nextPlayerIndex === this.state.lastAggressorIndex;
    }

    // No aggressor (everyone checked). Round complete if we've gone full circle.
    // Check if the next player to act would be at or past the starting position
    const nextPlayerIndex = this.getNextActivePlayerIndex(currentPlayerIndex);
    if (nextPlayerIndex === -1) {
      return true; // No more active players
    }

    // If we've wrapped around to or past the start position, everyone has acted
    return (
      this.hasWrappedAround(
        this.state.bettingRoundStartIndex,
        currentPlayerIndex,
        nextPlayerIndex,
      ) || nextPlayerIndex === this.state.bettingRoundStartIndex
    );
  }

  /**
   * Check if we've wrapped around from start through current to next
   */
  private hasWrappedAround(start: number, current: number, next: number): boolean {
    // If next < current, we wrapped around
    // And if next >= start, we've completed the circle
    return current >= start && next < current && next >= start;
  }

  /**
   * Get the next active player index (or -1 if none)
   */
  private getNextActivePlayerIndex(fromIndex: number): number {
    let nextIndex = (fromIndex + 1) % this.state.players.length;
    let checked = 0;

    while (checked < this.state.players.length) {
      const player = this.state.players[nextIndex];
      if (player.status === 'active') {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % this.state.players.length;
      checked++;
    }

    return -1; // No active players found
  }

  /**
   * Advance to next game phase
   */
  private advancePhase(): void {
    // Reset current bets for next round
    this.state.players.forEach((p) => {
      p.currentBet = 0;
    });

    // Reset betting round tracking for new round
    this.state.lastAggressorIndex = -1;

    switch (this.state.phase) {
      case 'preflop':
        this.dealFlop();
        break;
      case 'flop':
        this.dealTurn();
        break;
      case 'turn':
        this.dealRiver();
        break;
      case 'river':
        this.showdown();
        break;
      case 'showdown':
        this.completeHand();
        break;
    }
  }

  /**
   * Deal the flop (3 community cards)
   */
  private dealFlop(): void {
    this.deck.burn();
    this.state.communityCards = this.deck.deal(3);
    this.state.phase = 'flop' as GamePhase;
    const firstPlayerIndex = this.getPlayerIndexLeftOf(this.state.dealerIndex);
    this.state.currentPlayerIndex = firstPlayerIndex;
    this.state.bettingRoundStartIndex = firstPlayerIndex;
  }

  /**
   * Deal the turn (4th community card)
   */
  private dealTurn(): void {
    this.deck.burn();
    const turnCard = this.deck.dealOne();
    this.state.communityCards.push(turnCard);
    this.state.phase = 'turn' as GamePhase;
    const firstPlayerIndex = this.getPlayerIndexLeftOf(this.state.dealerIndex);
    this.state.currentPlayerIndex = firstPlayerIndex;
    this.state.bettingRoundStartIndex = firstPlayerIndex;
  }

  /**
   * Deal the river (5th community card)
   */
  private dealRiver(): void {
    this.deck.burn();
    const riverCard = this.deck.dealOne();
    this.state.communityCards.push(riverCard);
    this.state.phase = 'river' as GamePhase;
    const firstPlayerIndex = this.getPlayerIndexLeftOf(this.state.dealerIndex);
    this.state.currentPlayerIndex = firstPlayerIndex;
    this.state.bettingRoundStartIndex = firstPlayerIndex;
  }

  /**
   * Showdown - determine winner(s) and distribute pot
   */
  private showdown(): void {
    this.state.phase = 'showdown' as GamePhase;

    const activePlayers = this.state.players.filter((p) => p.status !== 'folded');

    if (activePlayers.length === 1) {
      // Only one player left, they win without showing cards
      const winner = activePlayers[0];
      winner.chips += this.state.pot.totalPot;
      return;
    }

    // Evaluate all hands
    const hands = activePlayers.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...this.state.communityCards],
    }));

    // Distribute main pot
    const mainPotData = {
      amount: this.state.pot.mainPot,
      eligiblePlayerIds: activePlayers.map((p) => p.id),
    };
    const mainWinners = handEvaluator.findWinners(hands);
    const mainDistribution = potCalculator.distributePot(
      mainPotData,
      mainWinners,
      this.state.dealerIndex,
      this.state.players,
    );

    // Apply main pot winnings
    for (const [playerId, amount] of mainDistribution.entries()) {
      const player = this.state.players.find((p) => p.id === playerId);
      if (player) player.chips += amount;
    }

    // Distribute side pots
    for (const sidePot of this.state.pot.sidePots) {
      const eligibleHands = hands.filter((h) => sidePot.eligiblePlayerIds.includes(h.playerId));
      const sideWinners = handEvaluator.findWinners(eligibleHands);
      const sideDistribution = potCalculator.distributePot(
        sidePot,
        sideWinners,
        this.state.dealerIndex,
        this.state.players,
      );

      for (const [playerId, amount] of sideDistribution.entries()) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (player) player.chips += amount;
      }
    }
  }

  /**
   * Complete the hand and prepare for next
   */
  private completeHand(): void {
    this.state.phase = 'hand-complete' as GamePhase;
    this.state.handNumber++;

    // Start new hand after delay (handled by UI)
  }

  /**
   * Move to next active player
   */
  private moveToNextPlayer(): void {
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    let checked = 0;

    while (checked < this.state.players.length) {
      const player = this.state.players[nextIndex];
      if (player.status === 'active') {
        this.state.currentPlayerIndex = nextIndex;
        return;
      }
      nextIndex = (nextIndex + 1) % this.state.players.length;
      checked++;
    }

    // No active players, move to next phase
    this.advancePhase();
  }

  /**
   * Get index of player left of given index
   */
  private getPlayerIndexLeftOf(index: number): number {
    return (index + 1) % this.state.players.length;
  }

  /**
   * Get big blind player index
   */
  private getBigBlindIndex(): number {
    return this.getPlayerIndexLeftOf(this.getPlayerIndexLeftOf(this.state.dealerIndex));
  }

  /**
   * Create players from settings
   */
  private createPlayers(settings: GameSettings, humanPlayerName: string): Player[] {
    const players: Player[] = [];

    // Create human player
    players.push({
      id: 'human',
      name: humanPlayerName,
      type: 'human' as PlayerType,
      chips: settings.startingChips,
      holeCards: [],
      currentBet: 0,
      totalBet: 0,
      status: 'active',
      seatIndex: 0,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
    });

    // Create bot players
    const botNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    for (let i = 0; i < settings.numBots && i < botNames.length; i++) {
      let difficulty: 'easy' | 'medium' | 'hard';
      if (settings.botDifficulty === 'mixed') {
        difficulty = (['easy', 'medium', 'hard'] as const)[i % 3];
      } else {
        difficulty = settings.botDifficulty;
      }

      players.push({
        id: `bot-${i}`,
        name: botNames[i],
        type: 'bot' as PlayerType,
        chips: settings.startingChips,
        holeCards: [],
        currentBet: 0,
        totalBet: 0,
        status: 'active',
        seatIndex: i + 1,
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false,
        botDifficulty: difficulty,
        botPersonality: {
          tightness: 0.5 + Math.random() * 0.3,
          aggression: 0.4 + Math.random() * 0.4,
          bluffFrequency: 0.2 + Math.random() * 0.3,
          adaptability: 0.3 + Math.random() * 0.5,
        },
      });
    }

    return players;
  }

  /**
   * Create initial empty state
   */
  private createInitialState(): GameState {
    return {
      phase: 'menu' as GamePhase,
      players: [],
      communityCards: [],
      pot: { mainPot: 0, sidePots: [], totalPot: 0 },
      currentPlayerIndex: 0,
      dealerIndex: 0,
      smallBlindAmount: 5,
      bigBlindAmount: 10,
      minimumRaise: 10,
      deck: [],
      burnedCards: [],
      actionHistory: [],
      handNumber: 0,
      lastAggressorIndex: -1,
      bettingRoundStartIndex: 0,
    };
  }

  /**
   * Get current game state (read-only)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Get current player
   */
  getCurrentPlayer(): Player | undefined {
    return this.state.players[this.state.currentPlayerIndex];
  }
}
