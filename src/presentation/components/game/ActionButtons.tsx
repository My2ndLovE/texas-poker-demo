import { useState } from 'react';
import { useGameStore } from '@/state-management/gameStore';

export default function ActionButtons() {
  const { gameState, playerAction } = useGameStore();
  const [raiseAmount, setRaiseAmount] = useState(0);

  if (!gameState) return null;

  const humanPlayer = gameState.players.find((p) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (!humanPlayer || !currentPlayer || currentPlayer.isBot) {
    return (
      <div className="container mx-auto text-center text-white">
        <p>Waiting for bot actions...</p>
      </div>
    );
  }

  const callAmount = gameState.currentBet - humanPlayer.currentBet;
  const canCheck = callAmount === 0;
  const minRaise = gameState.currentBet + gameState.bigBlind; // Minimum raise is current bet + big blind
  const maxBet = humanPlayer.chips + humanPlayer.currentBet;

  // Betting presets
  const halfPot = Math.max(minRaise, Math.floor(gameState.pot / 2));
  const fullPot = Math.max(minRaise, gameState.pot);
  const twoPot = Math.max(minRaise, gameState.pot * 2);

  const handleRaise = () => {
    if (raiseAmount >= minRaise && raiseAmount <= maxBet) {
      playerAction('raise', raiseAmount);
      setRaiseAmount(0);
    }
  };

  const handlePresetBet = (amount: number) => {
    const actualAmount = Math.min(amount, maxBet);
    playerAction('raise', actualAmount);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Betting Presets - Quick action chips */}
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        <button
          onClick={() => handlePresetBet(halfPot)}
          disabled={halfPot > maxBet}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all active:scale-95 touch-manipulation min-h-[44px]"
          aria-label={`Bet half pot, ${halfPot} dollars`}
        >
          1/2 Pot (${halfPot})
        </button>
        <button
          onClick={() => handlePresetBet(fullPot)}
          disabled={fullPot > maxBet}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all active:scale-95 touch-manipulation min-h-[44px]"
          aria-label={`Bet full pot, ${fullPot} dollars`}
        >
          Pot (${fullPot})
        </button>
        <button
          onClick={() => handlePresetBet(twoPot)}
          disabled={twoPot > maxBet}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all active:scale-95 touch-manipulation min-h-[44px]"
          aria-label={`Bet double pot, ${twoPot} dollars`}
        >
          2x Pot (${twoPot})
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        {/* Fold Button */}
        <button
          onClick={() => playerAction('fold')}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[56px] min-w-[140px]"
          aria-label="Fold hand"
        >
          Fold
        </button>

        {/* Check/Call Button */}
        <button
          onClick={() => playerAction(canCheck ? 'check' : 'call')}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[56px] min-w-[140px]"
          aria-label={canCheck ? 'Check' : `Call ${callAmount} dollars`}
        >
          {canCheck ? 'Check' : `Call $${callAmount}`}
        </button>

        {/* Raise Section */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="number"
            value={raiseAmount || ''}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && handleRaise()}
            min={minRaise}
            max={maxBet}
            className="bg-gray-800 text-white px-4 py-4 rounded-lg w-full sm:w-36 text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[56px]"
            placeholder={`Min $${minRaise}`}
            aria-label={`Raise amount, minimum ${minRaise}, maximum ${maxBet}`}
          />
          <button
            onClick={handleRaise}
            disabled={raiseAmount < minRaise || raiseAmount > maxBet}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 touch-manipulation min-h-[56px] min-w-[140px]"
            aria-label="Confirm raise"
          >
            Raise
          </button>
        </div>

        {/* All-In Button */}
        <button
          onClick={() => playerAction('raise', maxBet)}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation min-h-[56px] min-w-[140px]"
          aria-label={`Go all in with ${humanPlayer.chips} dollars`}
        >
          All-In
          <span className="block text-xs font-normal opacity-90">(${humanPlayer.chips})</span>
        </button>
      </div>
    </div>
  );
}
