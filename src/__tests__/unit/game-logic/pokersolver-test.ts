import { Hand } from 'pokersolver'

// Quick test to see pokersolver's actual rank values
const testHands = [
  { name: 'High Card', cards: ['As', 'Kh', '9d', '7c', '3s'] },
  { name: 'Pair', cards: ['Ts', 'Th', '7d', '5c', '3s'] },
  { name: 'Two Pair', cards: ['Js', 'Jh', '9d', '9c', '4s'] },
  { name: 'Three of a Kind', cards: ['Qs', 'Qh', 'Qd', '8c', '5s'] },
  { name: 'Straight', cards: ['9s', '8h', '7d', '6c', '5s'] },
  { name: 'Flush', cards: ['Kd', 'Jd', '9d', '7d', '5d'] },
  { name: 'Full House', cards: ['Ks', 'Kh', 'Kd', 'Ts', 'Th'] },
  { name: 'Four of a Kind', cards: ['As', 'Ah', 'Ad', 'Ac', 'Ks'] },
  { name: 'Straight Flush', cards: ['9h', '8h', '7h', '6h', '5h'] },
  { name: 'Royal Flush', cards: ['As', 'Ks', 'Qs', 'Js', 'Ts'] },
]

console.log('Pokersolver rank values:')
testHands.forEach(test => {
  const hand = Hand.solve(test.cards)
  console.log(`${test.name}: rank=${hand.rank}, desc="${hand.descr}"`)
})
