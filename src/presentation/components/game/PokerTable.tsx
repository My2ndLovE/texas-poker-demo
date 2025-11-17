import { GameState } from '@/game-logic/models/GameState';
import PlayerCard from '../cards/PlayerCard';
import CommunityCards from '../cards/CommunityCards';

interface PokerTableProps {
  gameState: GameState;
}

export default function PokerTable({ gameState }: PokerTableProps) {

  return (
    <div className="relative w-full max-w-6xl aspect-[16/9] bg-poker-green rounded-full border-8 border-amber-900 shadow-2xl">
      {/* Community Cards */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CommunityCards cards={gameState.communityCards} pot={gameState.pot} />
      </div>

      {/* Players */}
      <div className="absolute inset-0">
        {gameState.players.map((player, index) => {
          // Position players around the table
          const isHuman = player.id === 'human';
          const angle = (index / gameState.players.length) * 2 * Math.PI - Math.PI / 2;
          const radiusX = 45; // percentage
          const radiusY = 40; // percentage
          const left = 50 + radiusX * Math.cos(angle);
          const top = 50 + radiusY * Math.sin(angle);

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <PlayerCard
                player={player}
                isCurrentPlayer={gameState.currentPlayerIndex === index}
                isDealer={gameState.dealerPosition === index}
                showCards={isHuman || gameState.phase === 'showdown'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
