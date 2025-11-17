import { Player } from '@/game-logic/models/Player';

interface GameOverModalProps {
  humanPlayer: Player | undefined;
  allPlayers: Player[];
  onRestart: () => void;
}

export default function GameOverModal({ humanPlayer, allPlayers, onRestart }: GameOverModalProps) {
  if (!humanPlayer) return null;

  const isWinner = humanPlayer.chips > 0 && allPlayers.filter(p => p.chips > 0).length === 1;
  const isEliminated = humanPlayer.chips === 0;

  if (!isWinner && !isEliminated) return null;

  // Calculate final standings
  const standings = [...allPlayers]
    .sort((a, b) => b.chips - a.chips)
    .map((player, index) => ({
      rank: index + 1,
      name: player.name,
      chips: player.chips,
      isHuman: !player.isBot,
    }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-yellow-500 animate-slideUp">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-7xl animate-bounce">
            {isWinner ? '🎉' : '😢'}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-bold text-center mb-4 ${isWinner ? 'text-yellow-400' : 'text-red-400'}`}>
          {isWinner ? 'Victory!' : 'Game Over'}
        </h2>

        {/* Message */}
        <p className="text-center text-white text-lg mb-6">
          {isWinner
            ? "Congratulations! You've won the tournament!"
            : "You've been eliminated from the game."}
        </p>

        {/* Final Standings */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-center">Final Standings</h3>
          <div className="space-y-2">
            {standings.map((player) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-2 rounded ${
                  player.isHuman ? 'bg-blue-600 bg-opacity-50' : 'bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-bold text-lg w-6">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                  </span>
                  <span className="text-white font-medium">
                    {player.name}
                    {player.isHuman && ' (You)'}
                  </span>
                </div>
                <span className="text-green-400 font-bold">${player.chips}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg"
            aria-label="Start a new game"
          >
            Play Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-all active:scale-95"
            aria-label="Refresh page"
          >
            Reset Game
          </button>
        </div>

        {/* Stats Summary */}
        {humanPlayer && (
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>You finished with ${humanPlayer.chips}</p>
            <p className="text-xs mt-1">
              {isWinner ? 'Perfect play!' : 'Better luck next time!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
