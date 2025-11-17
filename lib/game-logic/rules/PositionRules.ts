import { Player } from '../models/Player';
import { GameState, getActivePlayers } from '../models/GameState';

export class PositionRules {
  // Get next active player index (clockwise)
  getNextActivePlayerIndex(
    players: Player[],
    currentIndex: number,
    wrapAround: boolean = true
  ): number {
    const activePlayers = players.filter((p) => p.status !== 'eliminated');
    if (activePlayers.length === 0) return -1;

    let nextIndex = (currentIndex + 1) % players.length;
    let attempts = 0;

    while (attempts < players.length) {
      if (players[nextIndex].status !== 'eliminated') {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;

      if (!wrapAround && nextIndex <= currentIndex) {
        return -1;
      }
    }

    return -1;
  }

  // Calculate positions for a new hand
  calculatePositions(state: GameState): {
    dealerIndex: number;
    smallBlindIndex: number;
    bigBlindIndex: number;
    firstToActIndex: number;
  } {
    const activePlayers = getActivePlayers(state);
    if (activePlayers.length < 2) {
      return {
        dealerIndex: -1,
        smallBlindIndex: -1,
        bigBlindIndex: -1,
        firstToActIndex: -1,
      };
    }

    // Dealer rotates clockwise
    const dealerIndex = this.getNextActivePlayerIndex(
      state.players,
      state.dealerIndex
    );

    // Heads-up (2 players): dealer is small blind
    if (activePlayers.length === 2) {
      const smallBlindIndex = dealerIndex;
      const bigBlindIndex = this.getNextActivePlayerIndex(
        state.players,
        dealerIndex
      );
      const firstToActIndex = dealerIndex; // Dealer acts first preflop in heads-up

      return {
        dealerIndex,
        smallBlindIndex,
        bigBlindIndex,
        firstToActIndex,
      };
    }

    // 3+ players: normal rules
    const smallBlindIndex = this.getNextActivePlayerIndex(
      state.players,
      dealerIndex
    );
    const bigBlindIndex = this.getNextActivePlayerIndex(
      state.players,
      smallBlindIndex
    );
    const firstToActIndex = this.getNextActivePlayerIndex(
      state.players,
      bigBlindIndex
    ); // UTG (Under The Gun)

    return {
      dealerIndex,
      smallBlindIndex,
      bigBlindIndex,
      firstToActIndex,
    };
  }

  // Get first to act post-flop (first active player after dealer)
  getFirstToActPostFlop(state: GameState): number {
    return this.getNextActivePlayerIndex(state.players, state.dealerIndex);
  }

  // Check if all players have acted in current betting round
  havAllPlayersActed(state: GameState): boolean {
    const playersInHand = state.players.filter(
      (p) => p.status === 'active' || p.status === 'all-in'
    );

    // Need at least one player who can still act
    const canActPlayers = playersInHand.filter((p) => p.status === 'active');
    if (canActPlayers.length === 0) return true;

    // All active players must have equal bets (or be all-in)
    const maxBet = Math.max(...playersInHand.map((p) => p.currentBet));
    const allBetsEqual = playersInHand.every(
      (p) => p.currentBet === maxBet || p.status === 'all-in'
    );

    return allBetsEqual && state.currentPlayerIndex === state.lastActionIndex;
  }
}

// Singleton instance
export const positionRules = new PositionRules();
