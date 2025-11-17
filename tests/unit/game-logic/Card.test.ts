import { Card, Rank, Suit } from '@/game-logic/models/Card';

describe('Card Model', () => {
  it('should create a card with rank and suit', () => {
    const card: Card = { rank: 'A', suit: 'h' };
    expect(card.rank).toBe('A');
    expect(card.suit).toBe('h');
  });

  it('should convert card to string format', () => {
    const { cardToString } = require('@/game-logic/models/Card');
    expect(cardToString({ rank: 'A', suit: 'h' })).toBe('Ah');
    expect(cardToString({ rank: 'K', suit: 's' })).toBe('Ks');
    expect(cardToString({ rank: 'T', suit: 'd' })).toBe('Td');
  });

  it('should convert string to card', () => {
    const { stringToCard } = require('@/game-logic/models/Card');
    const card = stringToCard('Ah');
    expect(card.rank).toBe('A');
    expect(card.suit).toBe('h');
  });

  it('should throw error for invalid card string', () => {
    const { stringToCard } = require('@/game-logic/models/Card');
    expect(() => stringToCard('X')).toThrow('Invalid card string: X');
    expect(() => stringToCard('Ahh')).toThrow('Invalid card string: Ahh');
  });
});
