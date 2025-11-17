/**
 * Type definitions for pokersolver
 * pokersolver is a JavaScript poker hand solver without official TypeScript support
 * These are custom type definitions for our project
 */

declare module 'pokersolver' {
  export interface Card {
    value: string;
    suit: string;
    rank: number;
    wildValue?: string;
  }

  export interface Hand {
    /** Name of the hand (e.g., "Royal Flush", "Pair") */
    name: string;
    /** Description of the hand */
    descr: string;
    /** Numerical rank of the hand (0-9, higher is better) */
    rank: number;
    /** Array of cards that make up this hand */
    cards: Card[];
    /** Array of cards used in the hand (5 cards) */
    cardPool: Card[];
    /** Game type used for evaluation */
    game: string;
    /** Whether this hand qualifies (for games with qualifiers) */
    qualifiesHigh(): boolean;
    /** Whether this hand qualifies for low (for hi-lo games) */
    qualifiesLow(): boolean;
    /** Compare this hand to another */
    compare(other: Hand): number;
    /** String representation of the hand */
    toString(): string;
  }

  export namespace Hand {
    /**
     * Solve a poker hand from an array of card strings
     * @param cards - Array of card strings (e.g., ['As', 'Ks', 'Qs', 'Js', 'Ts'])
     * @param game - Game type (default: 'standard')
     * @param canDisqualify - Whether the hand can be disqualified (default: false)
     * @returns The best hand
     */
    function solve(cards: string[], game?: string, canDisqualify?: boolean): Hand;

    /**
     * Determine winner(s) from an array of hands
     * @param hands - Array of hands to compare
     * @returns Array of winning hands (can be multiple in case of tie)
     */
    function winners(hands: Hand[]): Hand[];

    /**
     * Solve for Omaha high (use 2 from hand, 3 from board)
     * @param cards - Array of all cards
     * @param boardCount - Number of board cards (default: 5)
     * @param handCount - Number of hole cards (default: 4)
     * @param canDisqualify - Whether the hand can be disqualified (default: false)
     * @returns The best hand
     */
    function solveForOmaha(
      cards: string[],
      boardCount?: number,
      handCount?: number,
      canDisqualify?: boolean
    ): Hand;

    /**
     * Solve for high and low hands
     * @param cards - Array of card strings
     * @param game - Game type (default: 'standard')
     * @param canDisqualify - Whether the hand can be disqualified (default: false)
     * @returns Object with high and low hands
     */
    function solveForHighLow(
      cards: string[],
      game?: string,
      canDisqualify?: boolean
    ): { high: Hand; low: Hand | null };
  }

  export default Hand;
}
