declare module 'pokersolver' {
  export interface Card {
    value: string
    suit: string
    rank: number
    wildValue?: string
  }

  export interface HandResult {
    name: string
    descr: string
    rank: number
    cards: Card[]
    game: string
  }

  export class Hand {
    name: string
    descr: string
    rank: number
    cards: Card[]
    game: string

    static solve(cards: string[], game?: string): Hand
    static winners(hands: Hand[]): Hand[]
  }

  export const Hand: {
    solve(cards: string[], game?: string): HandResult
    winners(hands: HandResult[]): HandResult[]
  }
}
