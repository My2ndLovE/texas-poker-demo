import { Deck } from '../deck/Deck';
import { HandEvaluator } from '../evaluation/HandEvaluator';
import { PotCalculator } from '../pot/PotCalculator';
import { GameState, Action, createInitialGameState } from '../models/GameState';
import { GamePhase } from '@/utils/constants';

  private deck: Deck;
  private handEvaluator: HandEvaluator;
  // private potCalculator: PotCalculator;
  private state: GameState;

  constructor(players: Player[], smallBlind: number, bigBlind: number) {
    this.deck = new Deck();
    this.handEvaluator = new HandEvaluator();
    // this.potCalculator = new PotCalculator();
    this.state = createInitialGameState(players, smallBlind, bigBlind);
  }

  getState(): GameState {
    return { ...this.state };
  }

  startNewHand(): void {
    // Reset deck
    this.deck.reset();

    // Move dealer button
    this.state.dealerPosition = (this.state.dealerPosition + 1) % this.state.players.length;

    // Reset players
    this.state.players.forEach((player) => {
      player.holeCards = [];
      player.currentBet = 0;
      if (player.chips > 0) {
        player.status = 'active';
      } else {
        player.status = 'eliminated';
      }
    });

    // Reset state
    this.state.communityCards = [];
    this.state.pot = 0;
    this.state.currentBet = 0;
    this.state.phase = 'preflop';
    this.state.actionHistory = [];
    this.state.handNumber++;

    // Post blinds
    this.postBlinds();

    // Deal hole cards
    this.dealHoleCards();

    // Set first player to act (after big blind)
    this.state.currentPlayerIndex = this.getNextActivePlayerIndex(
      (this.state.dealerPosition + 3) % this.state.players.length
    );
  }

  private postBlinds(): void {
    const sbPosition = (this.state.dealerPosition + 1) % this.state.players.length;
    const bbPosition = (this.state.dealerPosition + 2) % this.state.players.length;

    const sbPlayer = this.state.players[sbPosition];
    const bbPlayer = this.state.players[bbPosition];

    // Post small blind
    const sbAmount = Math.min(sbPlayer.chips, this.state.smallBlind);
    sbPlayer.chips -= sbAmount;
    sbPlayer.currentBet = sbAmount;
    this.state.pot += sbAmount;

    // Post big blind
    const bbAmount = Math.min(bbPlayer.chips, this.state.bigBlind);
    bbPlayer.chips -= bbAmount;
    bbPlayer.currentBet = bbAmount;
    this.state.pot += bbAmount;
    this.state.currentBet = bbAmount;

    // Mark as all-in if necessary
    if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';
    if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';
  }

  private dealHoleCards(): void {
    // Deal 2 cards to each active player
    this.state.players.forEach((player) => {
      if (player.status !== 'eliminated') {
        player.holeCards = this.deck.deal(2);
      }
    });
  }

  playerAction(playerId: string, actionType: 'fold' | 'check' | 'call' | 'raise', amount?: number): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.status !== 'active') return false;

    const action: Action = {
      playerId,
      type: actionType,
      amount: amount || 0,
      timestamp: Date.now(),
    };

    switch (actionType) {
      case 'fold':
        player.status = 'folded';
        this.state.actionHistory.push(action);
        break;

      case 'check':
        if (player.currentBet < this.state.currentBet) return false; // Cannot check
        this.state.actionHistory.push(action);
        break;

      case 'call': {
        const callAmount = Math.min(
          this.state.currentBet - player.currentBet,
          player.chips
        );
        player.chips -= callAmount;
        player.currentBet += callAmount;
        this.state.pot += callAmount;
        action.amount = callAmount;

        if (player.chips === 0) player.status = 'all-in';
        this.state.actionHistory.push(action);
        break;
      }

      case 'raise': {
        if (!amount || amount < this.state.currentBet * 2) return false; // Invalid raise
        const raiseAmount = Math.min(amount, player.chips + player.currentBet);
        const actualBet = raiseAmount - player.currentBet;

        player.chips -= actualBet;
        player.currentBet = raiseAmount;
        this.state.pot += actualBet;
        this.state.currentBet = raiseAmount;
        action.amount = raiseAmount;
        action.type = player.chips === 0 ? 'allin' : 'raise';

        if (player.chips === 0) player.status = 'all-in';
        this.state.actionHistory.push(action);
        break;
      }
    }

    // Move to next player
    this.state.currentPlayerIndex = this.getNextActivePlayerIndex(this.state.currentPlayerIndex + 1);

    // Check if betting round complete
    if (this.isBettingRoundComplete()) {
      this.advancePhase();
    }

    return true;
  }

  private isBettingRoundComplete(): boolean {
    const activePlayers = this.state.players.filter(
      (p) => p.status === 'active' || p.status === 'all-in'
    );

    if (activePlayers.length <= 1) return true;

    // Check if all active players have matched the current bet
    const allMatched = this.state.players.every((p) => {
      if (p.status === 'folded' || p.status === 'eliminated') return true;
      if (p.status === 'all-in') return true;
      return p.currentBet === this.state.currentBet;
    });

    return allMatched;
  }

  private advancePhase(): void {
    // Reset current bets
    this.state.players.forEach((p) => (p.currentBet = 0));
    this.state.currentBet = 0;

    switch (this.state.phase) {
      case 'preflop':
        this.deck.burn();
        this.state.communityCards = this.deck.deal(3); // Flop
        this.state.phase = 'flop';
        break;

      case 'flop':
        this.deck.burn();
        this.state.communityCards.push(...this.deck.deal(1)); // Turn
        this.state.phase = 'turn';
        break;

      case 'turn':
        this.deck.burn();
        this.state.communityCards.push(...this.deck.deal(1)); // River
        this.state.phase = 'river';
        break;

      case 'river':
        this.state.phase = 'showdown';
        this.resolveShowdown();
        return;

      case 'showdown':
        // Should not reach here
        return;
    }

    // Set first player to act (after dealer)
    this.state.currentPlayerIndex = this.getNextActivePlayerIndex(this.state.dealerPosition + 1);
  }

  private resolveShowdown(): void {
    const activePlayers = this.state.players.filter((p) => p.status !== 'folded' && p.status !== 'eliminated');

    if (activePlayers.length === 1) {
      // Only one player left, they win
      activePlayers[0].chips += this.state.pot;
      return;
    }

    // Evaluate hands
    const hands = activePlayers.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...this.state.communityCards],
    }));

    const winners = this.handEvaluator.determineWinners(hands);

    // Distribute pot (simplified - equal split for now)
    const winAmount = Math.floor(this.state.pot / winners.length);
    winners.forEach((winnerId) => {
      const winner = this.state.players.find((p) => p.id === winnerId);
      if (winner) {
        winner.chips += winAmount;
      }
    });
  }

  private getNextActivePlayerIndex(startIndex: number): number {
    let index = startIndex % this.state.players.length;
    let count = 0;

    while (count < this.state.players.length) {
      const player = this.state.players[index];
      if (player.status === 'active') {
        return index;
      }
      index = (index + 1) % this.state.players.length;
      count++;
    }

    return startIndex; // Fallback
  }

  getCurrentPlayer(): Player | null {
    return this.state.players[this.state.currentPlayerIndex] || null;
  }

  isGameOver(): boolean {
    const playersWithChips = this.state.players.filter((p) => p.chips > 0);
    return playersWithChips.length <= 1;
  }
}
