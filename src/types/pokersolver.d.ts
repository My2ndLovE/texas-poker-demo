declare module 'pokersolver' {
  export interface SolvedHand {
    name: string;
    descr: string;
    cards: string[];
    rank: number;
  }

  export class Hand {
    static solve(cards: string[]): SolvedHand;
    static winners(hands: SolvedHand[]): SolvedHand[];
  }
}
