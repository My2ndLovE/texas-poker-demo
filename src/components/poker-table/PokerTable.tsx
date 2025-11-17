import { Player } from '../../game-logic/models/Player'
import { Card as CardModel } from '../../game-logic/models/Card'
import { PlayerSeat } from '../player-seat/PlayerSeat'
import { CommunityCards } from '../cards/CommunityCards'
import { PotDisplay } from '../game-ui/PotDisplay'

interface PokerTableProps {
  players: Player[]
  communityCards: CardModel[]
  potAmount: number
  sidePots?: { amount: number; players: string[] }[] | undefined
  currentPlayerId?: string | undefined
  humanPlayerId: string
  gamePhase: string
}

// Player position layout for 6-max table
const playerPositions = [
  { top: '50%', left: '10%', transform: 'translateY(-50%)' }, // Seat 1 (left middle)
  { top: '10%', left: '20%' }, // Seat 2 (top left)
  { top: '5%', left: '42%', transform: 'translateX(-50%)' }, // Seat 3 (top center)
  { top: '10%', right: '20%' }, // Seat 4 (top right)
  { top: '50%', right: '10%', transform: 'translateY(-50%)' }, // Seat 5 (right middle)
  { bottom: '5%', left: '42%', transform: 'translateX(-50%)' }, // Seat 6 (bottom - player)
]

export function PokerTable({
  players,
  communityCards,
  potAmount,
  sidePots = [],
  currentPlayerId,
  humanPlayerId,
  gamePhase,
}: PokerTableProps) {
  return (
    <div className="relative w-full h-[800px] max-w-6xl mx-auto">
      {/* Poker table felt */}
      <div className="absolute inset-8 bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-[50%] shadow-2xl border-8 border-yellow-900/50">
        {/* Inner table border */}
        <div className="absolute inset-4 rounded-[50%] border-4 border-green-600/30"></div>

        {/* Table texture overlay */}
        <div className="absolute inset-0 rounded-[50%] opacity-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>

        {/* Center area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
          {/* Community cards */}
          {communityCards.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <CommunityCards cards={communityCards} />
            </div>
          )}

          {/* Pot display */}
          <PotDisplay amount={potAmount} sidePots={sidePots} />

          {/* Game phase indicator */}
          {gamePhase && (
            <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
              <div className="text-white text-sm font-semibold uppercase tracking-wider">
                {gamePhase}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player seats */}
      {players.map((player, index) => {
        const position = playerPositions[index] || playerPositions[0]
        const isHumanPlayer = player.id === humanPlayerId
        const isActive = player.id === currentPlayerId

        return (
          <div
            key={player.id}
            className="absolute"
            style={{
              ...position,
            }}
          >
            <PlayerSeat
              player={player}
              isCurrentPlayer={isHumanPlayer}
              isActive={isActive}
              showCards={isHumanPlayer}
              className="w-48"
            />
          </div>
        )
      })}
    </div>
  )
}
