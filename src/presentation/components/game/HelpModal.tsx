import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <span>❓</span>
              How to Play
            </h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">⌨️ Keyboard Shortcuts</h3>
            <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 bg-gray-700 rounded font-mono text-yellow-300 font-bold">F</kbd>
                <span>Fold your hand</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 bg-gray-700 rounded font-mono text-yellow-300 font-bold">C</kbd>
                <span>Check or Call</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 bg-gray-700 rounded font-mono text-yellow-300 font-bold">R</kbd>
                <span>Raise or Bet</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 bg-gray-700 rounded font-mono text-yellow-300 font-bold">A</kbd>
                <span>Go All-In</span>
              </div>
            </div>
          </section>

          {/* Game Rules */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">🃏 Texas Hold'em Rules</h3>
            <div className="bg-gray-800 p-4 rounded-lg space-y-3">
              <p><strong className="text-yellow-300">Objective:</strong> Win chips by making the best 5-card poker hand or forcing opponents to fold.</p>

              <p><strong className="text-yellow-300">Gameplay:</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Blinds:</strong> Small Blind ($5) and Big Blind ($10) are posted</li>
                <li><strong>Hole Cards:</strong> Each player gets 2 private cards</li>
                <li><strong>Preflop Betting:</strong> Players can fold, call, raise, or go all-in</li>
                <li><strong>The Flop:</strong> 3 community cards are dealt, another betting round</li>
                <li><strong>The Turn:</strong> 4th community card is dealt, another betting round</li>
                <li><strong>The River:</strong> 5th community card is dealt, final betting round</li>
                <li><strong>Showdown:</strong> Best hand wins! (or last player standing)</li>
              </ol>
            </div>
          </section>

          {/* Hand Rankings */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">🏆 Hand Rankings (Best to Worst)</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
              <ol className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <strong className="text-yellow-300">Royal Flush:</strong>
                  <span className="text-gray-300">A♠ K♠ Q♠ J♠ 10♠</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <strong className="text-yellow-300">Straight Flush:</strong>
                  <span className="text-gray-300">5 cards in sequence, same suit</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <strong className="text-yellow-300">Four of a Kind:</strong>
                  <span className="text-gray-300">K♠ K♥ K♦ K♣</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🏠</span>
                  <strong className="text-yellow-300">Full House:</strong>
                  <span className="text-gray-300">Three of a kind + Pair</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <strong className="text-yellow-300">Flush:</strong>
                  <span className="text-gray-300">5 cards, same suit</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">📏</span>
                  <strong className="text-yellow-300">Straight:</strong>
                  <span className="text-gray-300">5 cards in sequence</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🎲</span>
                  <strong className="text-yellow-300">Three of a Kind:</strong>
                  <span className="text-gray-300">J♠ J♥ J♦</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <strong className="text-yellow-300">Two Pair:</strong>
                  <span className="text-gray-300">9♠ 9♥ 5♦ 5♣</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🎰</span>
                  <strong className="text-yellow-300">One Pair:</strong>
                  <span className="text-gray-300">A♠ A♥</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🃏</span>
                  <strong className="text-yellow-300">High Card:</strong>
                  <span className="text-gray-300">Highest card wins</span>
                </li>
              </ol>
            </div>
          </section>

          {/* Position Badges */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">🎯 Position Badges</h3>
            <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-white text-black text-sm font-bold rounded-full border-2 border-yellow-400">D</span>
                <span><strong>Dealer</strong> (button)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-yellow-500 text-black text-sm font-bold rounded-full">SB</span>
                <span><strong>Small Blind</strong> ($5)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-red-500 text-white text-sm font-bold rounded-full">BB</span>
                <span><strong>Big Blind</strong> ($10)</span>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">💡 Pro Tips</h3>
            <div className="bg-gray-800 p-4 rounded-lg space-y-2">
              <p>• <strong>Position matters:</strong> Acting last gives you more information</p>
              <p>• <strong>Pot odds:</strong> Use preset buttons (½ Pot, Pot, 2x Pot) for strategic betting</p>
              <p>• <strong>Don't play every hand:</strong> Fold weak hands to save chips</p>
              <p>• <strong>Watch the action log:</strong> Track what opponents are doing</p>
              <p>• <strong>All-in wisely:</strong> Going all-in puts all your chips at risk!</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
