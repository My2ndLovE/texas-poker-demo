import { Player } from '../models/Player';
import { PlayerStatus } from '@/utils/constants';

export class PositionRules {
  calculatePositions(players: Player[], dealerIndex: number): Player[] {
    const isHeadsUp = players.length === 2;

    return players.map((player, index) => {
      const isDealer = index === dealerIndex;
      const isSB = index === this.getSmallBlindIndex(players, dealerIndex);
      const isBB = index === this.getBigBlindIndex(players, dealerIndex);

      return {
        ...player,
        isDealer,
        isSmallBlind: isSB,
        isBigBlind: isBB,
      };
    });
  }

  getNextDealerIndex(players: Player[], currentDealerIndex: number): number {
    return (currentDealerIndex + 1) % players.length;
  }

  getSmallBlindIndex(players: Player[], dealerIndex: number): number {
    const isHeadsUp = players.length === 2;

    if (isHeadsUp) {
      // In heads-up, dealer is small blind
      return dealerIndex;
    }

    // Otherwise, SB is next player after dealer
    return (dealerIndex + 1) % players.length;
  }

  getBigBlindIndex(players: Player[], dealerIndex: number): number {
    const isHeadsUp = players.length === 2;

    if (isHeadsUp) {
      // In heads-up, non-dealer is big blind
      return (dealerIndex + 1) % players.length;
    }

    // Otherwise, BB is 2 positions after dealer
    return (dealerIndex + 2) % players.length;
  }

  getFirstToActPreflop(players: Player[], dealerIndex: number): number {
    const isHeadsUp = players.length === 2;

    if (isHeadsUp) {
      // In heads-up, dealer (small blind) acts first preflop
      return dealerIndex;
    }

    // Otherwise, first to act is after big blind (UTG)
    const bbIndex = this.getBigBlindIndex(players, dealerIndex);
    return (bbIndex + 1) % players.length;
  }

  getFirstToActPostflop(players: Player[], dealerIndex: number): number {
    const isHeadsUp = players.length === 2;

    if (isHeadsUp) {
      // In heads-up, big blind acts first postflop
      return (dealerIndex + 1) % players.length;
    }

    // Otherwise, small blind acts first postflop
    return this.getSmallBlindIndex(players, dealerIndex);
  }

  getNextActivePlayerIndex(
    players: Player[],
    currentIndex: number,
    foldedPlayerIds: Set<string>
  ): number {
    let nextIndex = (currentIndex + 1) % players.length;
    let iterations = 0;

    // Find next player who hasn't folded and isn't all-in
    while (
      (foldedPlayerIds.has(players[nextIndex].id) ||
        players[nextIndex].status === PlayerStatus.AllIn) &&
      iterations < players.length
    ) {
      nextIndex = (nextIndex + 1) % players.length;
      iterations++;
    }

    return nextIndex;
  }

  getActivePlayerCount(players: Player[], foldedPlayerIds: Set<string>): number {
    return players.filter((p) => !foldedPlayerIds.has(p.id)).length;
  }

  getPositionName(playerIndex: number, dealerIndex: number, playerCount: number): string {
    if (playerCount === 2) {
      return playerIndex === dealerIndex ? 'Dealer/SB' : 'BB';
    }

    const sbIndex = (dealerIndex + 1) % playerCount;
    const bbIndex = (dealerIndex + 2) % playerCount;
    const utgIndex = (dealerIndex + 3) % playerCount;

    if (playerIndex === dealerIndex) return 'Dealer';
    if (playerIndex === sbIndex) return 'Small Blind';
    if (playerIndex === bbIndex) return 'Big Blind';
    if (playerIndex === utgIndex) return 'UTG';

    // Calculate distance from dealer
    const distanceFromDealer = (playerIndex - dealerIndex + playerCount) % playerCount;

    if (distanceFromDealer === playerCount - 1) return 'Cutoff';
    if (distanceFromDealer === playerCount - 2) return 'Hijack';

    return `MP${distanceFromDealer - 2}`;
  }
}
