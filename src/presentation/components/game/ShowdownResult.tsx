import { ShowdownResult as ShowdownResultType } from '@/game-logic/models/GameState';
import { Player } from '@/game-logic/models/Player';
import Confetti from './Confetti';

interface ShowdownResultProps {
  result: ShowdownResultType;
  players: Player[];
  onDismiss: () => void;
}

export default function ShowdownResult({ result, players, onDismiss }: ShowdownResultProps) {
  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown';
  };

  // Check if human player won and the pot was significant
  const humanWinner = result.winners.find((w) => w.playerId === 'human');
  const showConfetti = humanWinner !== undefined && humanWinner.amount >= 100;

  return (
    <>
      <Confetti show={showConfetti} />
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border-2 border-yellow-500 animate-slideUp">
        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl animate-bounce">🏆</div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">
          {result.winners.length === 1 ? 'Winner!' : 'Split Pot!'}
        </h2>

        {/* Winners List */}
        <div className="space-y-4">
          {result.winners.map((winner, index) => (
            <div
              key={`${winner.playerId}-${index}`}
              className="bg-gray-700 rounded-lg p-4 border-2 border-yellow-600 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-white">{getPlayerName(winner.playerId)}</span>
                <span className="text-2xl font-bold text-green-400">+${winner.amount}</span>
              </div>

              <div className="text-yellow-300 font-semibold text-lg mb-1">{winner.handName}</div>

              <div className="text-gray-300 text-sm">{winner.handDescription}</div>
            </div>
          ))}
        </div>

        {/* Total Pot */}
        <div className="mt-6 text-center">
          <div className="text-gray-400 text-sm">Total Pot</div>
          <div className="text-3xl font-bold text-yellow-400">
            ${result.winners.reduce((sum, w) => sum + w.amount, 0)}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onDismiss}
          className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          Continue → Next Hand
        </button>

        {/* Auto-dismiss hint */}
        <div className="mt-3 text-center text-gray-500 text-xs">
          Auto-continuing in 3 seconds...
        </div>
        </div>
      </div>
    </>
  );
}
