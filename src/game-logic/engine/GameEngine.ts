import { Deck } from '../deck/Deck';
import { HandEvaluator } from '../evaluation/HandEvaluator';
import { PotCalculator } from '../pot/PotCalculator';
import { Player } from '../models/Player';
import { GameState, Action, createInitialGameState } from '../models/GameState';

export class GameEngine {
  private deck: Deck;
  private handEvaluator: HandEvaluator;
  private potCalculator: PotCalculator;
  private state: GameState;
  private lastToActIndex: number = -1; // Track who was last to raise/bet

  constructor(players: Player[], smallBlind: number, bigBlind: number) {
    this.deck = new Deck();
    this.handEvaluator = new HandEvaluator();
    this.potCalculator = new PotCalculator();
    this.state = createInitialGameState(players, smallBlind, bigBlind);
  }

  getState(): GameState {
    return { ...this.state };
  }

  startNewHand(): void {
    this.deck.reset();

    // Skip eliminated players when moving dealer button
    let nextDealerPos = (this.state.dealerPosition + 1) % this.state.players.length;
    let attempts = 0;
    while (this.state.players[nextDealerPos].status === 'eliminated' && attempts < this.state.players.length) {
      nextDealerPos = (nextDealerPos + 1) % this.state.players.length;
      attempts++;
    }
    this.state.dealerPosition = nextDealerPos;

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
    this.state.showdownResult = undefined;
    this.state.handNumber++;

    // Post blinds
    this.postBlinds();

    // Deal hole cards
    this.dealHoleCards();

    // Set first player to act
    // In heads-up, dealer acts first preflop (already posted SB)
    // Otherwise, player after big blind acts first
    const activePlayers = this.state.players.filter(p => p.status === 'active' || p.status === 'all-in');
    if (activePlayers.length === 2) {
      // Heads-up: dealer (small blind) acts first preflop
      this.state.currentPlayerIndex = this.getNextActivePlayerIndex(this.state.dealerPosition);
    } else {
      // Normal: player after big blind acts first
      const bbPosition = (this.state.dealerPosition + 2) % this.state.players.length;
      this.state.currentPlayerIndex = this.getNextActivePlayerIndex(bbPosition + 1);
    }

    // Big blind is last to act preflop
    const bbPosition = (this.state.dealerPosition + 2) % this.state.players.length;
    this.lastToActIndex = bbPosition;
  }

  private postBlinds(): void {
    const activePlayers = this.state.players.filter(p => p.status !== 'eliminated');

    if (activePlayers.length === 2) {
      // Heads-up: dealer posts small blind, other player posts big blind
      const sbPosition = this.state.dealerPosition;
      const bbPosition = this.getNextActivePlayerIndex(this.state.dealerPosition + 1);

      const sbPlayer = this.state.players[sbPosition];
      const bbPlayer = this.state.players[bbPosition];

      const sbAmount = Math.min(sbPlayer.chips, this.state.smallBlind);
      sbPlayer.chips -= sbAmount;
      sbPlayer.currentBet = sbAmount;
      this.state.pot += sbAmount;

      const bbAmount = Math.min(bbPlayer.chips, this.state.bigBlind);
      bbPlayer.chips -= bbAmount;
      bbPlayer.currentBet = bbAmount;
      this.state.pot += bbAmount;
      this.state.currentBet = bbAmount;

      if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';
      if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';
    } else {
      // Normal: player after dealer posts SB, next posts BB
      const sbPosition = (this.state.dealerPosition + 1) % this.state.players.length;
      const bbPosition = (this.state.dealerPosition + 2) % this.state.players.length;

      const sbPlayer = this.state.players[sbPosition];
      const bbPlayer = this.state.players[bbPosition];

      const sbAmount = Math.min(sbPlayer.chips, this.state.smallBlind);
      sbPlayer.chips -= sbAmount;
      sbPlayer.currentBet = sbAmount;
      this.state.pot += sbAmount;

      const bbAmount = Math.min(bbPlayer.chips, this.state.bigBlind);
      bbPlayer.chips -= bbAmount;
      bbPlayer.currentBet = bbAmount;
      this.state.pot += bbAmount;
      this.state.currentBet = bbAmount;

      if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';
      if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';
    }
  }

  private dealHoleCards(): void {
    this.state.players.forEach((player) => {
      if (player.status !== 'eliminated') {
        player.holeCards = this.deck.deal(2);
      }
    });
  }

  playerAction(playerId: string, actionType: 'fold' | 'check' | 'call' | 'raise', amount?: number): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    const playerIndex = this.state.players.findIndex((p) => p.id === playerId);

    if (!player || player.status !== 'active') return false;
    if (playerIndex !== this.state.currentPlayerIndex) return false; // Not player's turn

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
        if (player.currentBet < this.state.currentBet) return false;
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
        // Minimum raise is current bet + big blind (or double current bet if no prior raise)
        const minRaiseAmount = this.state.currentBet + this.state.bigBlind;

        if (!amount || amount < minRaiseAmount) return false;

        // Can't raise more than player has
        const maxRaiseAmount = player.chips + player.currentBet;
        const raiseAmount = Math.min(amount, maxRaiseAmount);

        const actualBet = raiseAmount - player.currentBet;

        player.chips -= actualBet;
        player.currentBet = raiseAmount;
        this.state.pot += actualBet;
        this.state.currentBet = raiseAmount;
        action.amount = raiseAmount;
        action.type = player.chips === 0 ? 'allin' : 'raise';

        if (player.chips === 0) player.status = 'all-in';

        // Mark this player as last to act (everyone else needs chance to respond)
        this.lastToActIndex = playerIndex;

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

    // If only 0-1 active players, round is complete
    if (activePlayers.length <= 1) return true;

    // Check if all active players have matched the current bet
    const allMatched = this.state.players.every((p) => {
      if (p.status === 'folded' || p.status === 'eliminated') return true;
      if (p.status === 'all-in') return true;
      return p.currentBet === this.state.currentBet;
    });

    if (!allMatched) return false;

    // Additionally, check that action has returned to last raiser
    // (everyone has had chance to act after last raise)
    if (this.lastToActIndex >= 0) {
      // If we've cycled back past the last raiser, round is complete
      const nextPlayer = this.getNextActivePlayerIndex(this.lastToActIndex + 1);
      return this.state.currentPlayerIndex === nextPlayer;
    }

    return allMatched;
  }

  private advancePhase(): void {
    // Reset current bets for next betting round
    this.state.players.forEach((p) => (p.currentBet = 0));
    this.state.currentBet = 0;
    this.lastToActIndex = -1;

    switch (this.state.phase) {
      case 'preflop':
        this.deck.burn();
        this.state.communityCards = this.deck.deal(3);
        this.state.phase = 'flop';
        break;

      case 'flop':
        this.deck.burn();
        this.state.communityCards.push(...this.deck.deal(1));
        this.state.phase = 'turn';
        break;

      case 'turn':
        this.deck.burn();
        this.state.communityCards.push(...this.deck.deal(1));
        this.state.phase = 'river';
        break;

      case 'river':
        this.state.phase = 'showdown';
        this.resolveShowdown();
        return;

      case 'showdown':
        return;
    }

    // Set first player to act (first active player after dealer)
    this.state.currentPlayerIndex = this.getNextActivePlayerIndex(this.state.dealerPosition + 1);
  }

  private resolveShowdown(): void {
    const activePlayers = this.state.players.filter((p) => p.status !== 'folded' && p.status !== 'eliminated');

    // Track all winners for display
    const allWinners: Array<{ playerId: string; handName: string; handDescription: string; amount: number }> = [];

    if (activePlayers.length === 1) {
      // Only one player remaining - they win by default
      const winner = activePlayers[0];
      const winAmount = this.state.pot;
      winner.chips += winAmount;

      allWinners.push({
        playerId: winner.id,
        handName: 'Winner',
        handDescription: 'Won by default (all others folded)',
        amount: winAmount,
      });

      this.state.pot = 0;
      this.state.showdownResult = {
        winners: allWinners,
        timestamp: Date.now(),
      };
      return;
    }

    // Calculate pots with side pots
    const playerBets = this.state.players.map(p => ({
      playerId: p.id,
      bet: p.currentBet,
      isAllIn: p.status === 'all-in',
      isFolded: p.status === 'folded' || p.status === 'eliminated',
    }));

    const potStructure = this.potCalculator.calculatePots(playerBets);

    // Evaluate hands
    const hands = activePlayers.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...this.state.communityCards],
    }));

    // Evaluate each hand for display
    const handEvaluations = new Map<string, { name: string; description: string }>();
    hands.forEach((hand) => {
      const result = this.handEvaluator.evaluateHand(hand.cards);
      handEvaluations.set(hand.playerId, {
        name: result.name,
        description: result.description,
      });
    });

    // Determine winners for main pot
    const mainPotWinners = this.handEvaluator.determineWinners(
      hands.filter(h => potStructure.mainPot.eligiblePlayerIds.includes(h.playerId))
    );

    // Distribute main pot
    if (mainPotWinners.length > 0) {
      const mainPotShare = Math.floor(potStructure.mainPot.amount / mainPotWinners.length);
      mainPotWinners.forEach((winnerId) => {
        const winner = this.state.players.find((p) => p.id === winnerId);
        const handInfo = handEvaluations.get(winnerId);

        if (winner) {
          winner.chips += mainPotShare;
          allWinners.push({
            playerId: winnerId,
            handName: handInfo?.name || 'Unknown',
            handDescription: handInfo?.description || '',
            amount: mainPotShare,
          });
        }
      });
    }

    // Distribute side pots
    potStructure.sidePots.forEach((sidePot) => {
      const eligibleHands = hands.filter(h => sidePot.eligiblePlayerIds.includes(h.playerId));
      if (eligibleHands.length === 0) return;

      const sidePotWinners = this.handEvaluator.determineWinners(eligibleHands);
      if (sidePotWinners.length === 0) return; // Prevent division by zero

      const sidePotShare = Math.floor(sidePot.amount / sidePotWinners.length);

      sidePotWinners.forEach((winnerId) => {
        const winner = this.state.players.find((p) => p.id === winnerId);
        const handInfo = handEvaluations.get(winnerId);

        if (winner) {
          winner.chips += sidePotShare;

          // Check if this winner already won main pot, add to their total
          const existingWinner = allWinners.find(w => w.playerId === winnerId);
          if (existingWinner) {
            existingWinner.amount += sidePotShare;
          } else {
            allWinners.push({
              playerId: winnerId,
              handName: handInfo?.name || 'Unknown',
              handDescription: handInfo?.description || '',
              amount: sidePotShare,
            });
          }
        }
      });
    });

    this.state.pot = 0;
    this.state.showdownResult = {
      winners: allWinners,
      timestamp: Date.now(),
    };
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

    return startIndex;
  }

  getCurrentPlayer(): Player | null {
    return this.state.players[this.state.currentPlayerIndex] || null;
  }

  isGameOver(): boolean {
    const playersWithChips = this.state.players.filter((p) => p.chips > 0);
    return playersWithChips.length <= 1;
  }
}
