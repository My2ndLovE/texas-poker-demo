declare module 'poker-evaluator' {
  export interface Card {
    value: string;
    suit: string;
  }

  export interface Hand {
    handType: number;
    handRank: number;
    value: number;
    handName: string;
  }

  export function evalHand(cards: string[]): Hand;
  export function winners(hands: Hand[]): Hand[];
}
