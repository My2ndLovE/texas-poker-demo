import { useGameStore } from '@/state-management/gameStore';
import { CommunityCards } from './CommunityCards';
import { PlayerSeat } from './PlayerSeat';
import { PotDisplay } from './PotDisplay';

export function PokerTable() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[16/10]">
      {/* Poker Table */}
      <div className="poker-table absolute inset-0 flex items-center justify-center">
        {/* Community Cards in Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <CommunityCards cards={gameState.communityCards} />
          <div className="mt-4">
            <PotDisplay pot={gameState.pot} />
          </div>
        </div>

        {/* Players arranged around table */}
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className="absolute"
            style={getPlayerPosition(index, gameState.players.length)}
          >
            <PlayerSeat
              player={player}
              isCurrentPlayer={index === gameState.currentPlayerIndex}
              isHuman={player.type === 'human'}
            />
          </div>
        ))}
      </div>

      {/* Game Phase Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full">
        <p className="text-white font-bold uppercase tracking-wider">{gameState.phase}</p>
      </div>

      {/* Hand Number */}
      <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded-lg">
        <p className="text-white text-sm">Hand #{gameState.handNumber}</p>
      </div>
    </div>
  );
}

/**
 * Calculate position for player seats around the elliptical table
 */
function getPlayerPosition(index: number, totalPlayers: number): React.CSSProperties {
  const angleStep = (2 * Math.PI) / totalPlayers;
  const angle = angleStep * index - Math.PI / 2; // Start from top

  // Ellipse parameters (adjusted for poker table)
  const radiusX = 45; // Horizontal radius (percentage)
  const radiusY = 35; // Vertical radius (percentage)

  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 + radiusY * Math.sin(angle);

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  };
}
