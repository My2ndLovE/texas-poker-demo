declare module 'pokersolver' {
  export interface Card {
    value: string;
    suit: string;
  }

  export interface SolvedHand {
    name: string;
    descr: string;
    rank: number;
    cards: Card[];
    cardPool?: Card[];
  }

  export class Hand {
    static solve(cards: string[]): SolvedHand;
    static winners(hands: SolvedHand[]): SolvedHand[];
  }
}
