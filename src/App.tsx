import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { PokerTable } from './components/poker-table/PokerTable'
import { ActionButtons } from './components/actions/ActionButtons'
import { ActionLog } from './components/game-ui/ActionLog'

function App() {
  const {
    players,
    humanPlayerId,
    gamePhase,
    communityCards,
    potAmount,
    dealerIndex,
    actionLog,
    lastWinners,
    initializeGame,
    playerAction,
    getCurrentPlayer,
    getValidActions,
    calculateCallAmount,
    calculateMinRaise,
    startNewHand,
  } = useGameStore()

  // Initialize game on mount
  useEffect(() => {
    if (players.length === 0) {
      initializeGame(6)
    }
  }, [])

  const currentPlayer = getCurrentPlayer()
  const isHumanTurn = currentPlayer?.id === humanPlayerId
  const humanPlayer = players.find((p) => p.id === humanPlayerId)

  const handleAction = (action: string, amount?: number) => {
    playerAction(action, amount)
  }

  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-2xl">Initializing game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Texas Hold'em Poker</h1>
            <p className="text-gray-400 text-sm">Professional Poker Experience</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Game stats */}
            {humanPlayer && (
              <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                <div className="text-gray-400 text-xs">Your Chips</div>
                <div className="text-yellow-400 text-xl font-bold">
                  ${humanPlayer.chips.toLocaleString()}
                </div>
              </div>
            )}

            {/* New hand button */}
            <button
              onClick={() => startNewHand()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              New Hand
            </button>
          </div>
        </div>
      </header>

      {/* Main game area */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left sidebar - Action Log */}
          <aside className="w-64 flex-shrink-0">
            <ActionLog actions={actionLog} />
          </aside>

          {/* Center - Poker Table */}
          <div className="flex-1">
            <PokerTable
              players={players}
              communityCards={communityCards}
              potAmount={potAmount}
              currentPlayerId={currentPlayer?.id}
              humanPlayerId={humanPlayerId}
              gamePhase={gamePhase}
            />

            {/* Action buttons (only shown when it's human player's turn) */}
            {isHumanTurn && gamePhase !== 'handComplete' && gamePhase !== 'showdown' && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="mb-4 text-center">
                  <div className="inline-block bg-yellow-500 text-gray-900 px-6 py-2 rounded-full font-bold text-lg animate-pulse">
                    Your Turn
                  </div>
                </div>

                <ActionButtons
                  validActions={getValidActions()}
                  onAction={handleAction}
                  callAmount={calculateCallAmount()}
                  minRaise={calculateMinRaise()}
                  maxRaise={humanPlayer?.chips || 0}
                  potSize={potAmount}
                />
              </div>
            )}

            {/* Waiting message */}
            {!isHumanTurn && gamePhase !== 'handComplete' && gamePhase !== 'showdown' && (
              <div className="mt-8 text-center">
                <div className="inline-block bg-gray-800/90 backdrop-blur-sm px-8 py-4 rounded-lg border border-gray-700">
                  <div className="text-gray-400 text-sm mb-1">Waiting for</div>
                  <div className="text-white text-xl font-semibold">
                    {currentPlayer?.name || 'Player'}
                  </div>
                  <div className="mt-2">
                    <div className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                    <span className="text-gray-500 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Showdown message */}
            {gamePhase === 'showdown' && (
              <div className="mt-8 text-center">
                <div className="inline-block bg-blue-600 px-8 py-4 rounded-lg border border-blue-500 shadow-xl">
                  <div className="text-white text-2xl font-bold">Showdown!</div>
                  <div className="text-blue-200 text-sm mt-1">Revealing cards...</div>
                </div>
              </div>
            )}

            {/* Hand complete message with winners */}
            {gamePhase === 'handComplete' && lastWinners.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-block bg-green-600 px-8 py-6 rounded-lg border border-green-500 shadow-xl">
                  <div className="text-white text-2xl font-bold mb-4">
                    {lastWinners.length > 1 ? 'Split Pot!' : 'Winner!'}
                  </div>

                  {lastWinners.map((winner) => {
                    const winnerPlayer = players.find((p) => p.id === winner.playerId)
                    return (
                      <div key={winner.playerId} className="mb-3">
                        <div className="text-white text-xl font-semibold">
                          {winnerPlayer?.name}
                        </div>
                        <div className="text-green-200 text-sm">
                          {winner.handDescription}
                        </div>
                        <div className="text-yellow-300 text-lg font-bold mt-1">
                          +${winner.amount.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}

                  <button
                    onClick={() => startNewHand()}
                    className="bg-white text-green-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors mt-4"
                  >
                    Next Hand
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - placeholder for future features */}
          <aside className="w-64 flex-shrink-0">
            {/* Could add hand strength indicator here later */}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <div>
            <span className="mr-4">Dealer Position: Seat {dealerIndex + 1}</span>
            <span className="mr-4">Phase: {gamePhase}</span>
            <span>Active Players: {players.filter((p) => p.status !== 'folded').length}</span>
          </div>
          <div className="text-gray-600">
            pokersolver | React 18 | TypeScript | Tailwind CSS | Zustand
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
