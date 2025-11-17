import { useState, useEffect } from 'react';
import { useGameStore } from '@/state-management/gameStore';
import PokerTable from '../components/game/PokerTable';
import ActionButtons from '../components/game/ActionButtons';
import ActionHistory from '../components/game/ActionHistory';
import ShowdownResult from '../components/game/ShowdownResult';
import GameOverModal from '../components/game/GameOverModal';
import HandStrength from '../components/game/HandStrength';
import SettingsMenu, { GameSettings } from '../components/game/SettingsMenu';
import GameStats from '../components/game/GameStats';

const STORAGE_KEY = 'poker-game-settings';

export default function GamePage() {
  const { gameState, initializeGame, resetGame, dismissShowdown, statistics } = useGameStore();
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(() => {
    // Load settings from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [showMobileStrength, setShowMobileStrength] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (gameSettings) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameSettings));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    }
  }, [gameSettings]);

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
    initializeGame(
      settings.playerName,
      settings.numBots,
      settings.startingChips,
      settings.smallBlind,
      settings.bigBlind,
      settings.botDifficulty
    );
  };

  const handleRestart = () => {
    resetGame();
    if (gameSettings) {
      initializeGame(
        gameSettings.playerName,
        gameSettings.numBots,
        gameSettings.startingChips,
        gameSettings.smallBlind,
        gameSettings.bigBlind,
        gameSettings.botDifficulty
      );
    }
  };

  // Show settings menu if game hasn't been initialized
  if (!gameState) {
    return <SettingsMenu onStart={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-poker-green-dark flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 shadow-lg border-b-2 border-yellow-600">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Texas Hold'em Poker
          </h1>

          <div className="flex gap-4 items-center">
            {/* Hand Number */}
            <div className="bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
              Hand #{gameState.handNumber}
            </div>

            {/* Pot */}
            <div className="bg-green-700 px-4 py-1 rounded-full font-bold flex items-center gap-1">
              <span className="text-yellow-400">$</span>
              <span>{gameState.pot}</span>
            </div>

            {/* Phase Indicator */}
            <div
              className={`px-4 py-1 rounded-full font-semibold text-xs uppercase tracking-wider ${
                gameState.phase === 'preflop'
                  ? 'bg-blue-600'
                  : gameState.phase === 'flop'
                  ? 'bg-purple-600'
                  : gameState.phase === 'turn'
                  ? 'bg-orange-600'
                  : gameState.phase === 'river'
                  ? 'bg-red-600'
                  : 'bg-yellow-600 animate-pulse'
              }`}
            >
              {gameState.phase === 'showdown' ? '🏆 Showdown' : gameState.phase}
            </div>

            {/* Blinds Info */}
            <div className="hidden lg:flex gap-2 text-xs text-gray-400">
              <span>SB: ${gameState.smallBlind}</span>
              <span>/</span>
              <span>BB: ${gameState.bigBlind}</span>
            </div>

            {/* Stats Button */}
            <div className="relative">
              <GameStats
                stats={statistics}
                currentChips={gameState.players.find((p) => !p.isBot)?.chips || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Poker Table */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Action History - desktop positioned, mobile toggleable */}
        <div className={`absolute top-4 left-4 z-10 ${showMobileHistory ? 'block' : 'hidden md:block'}`}>
          <ActionHistory actions={gameState.actionHistory} players={gameState.players} />
        </div>

        {/* Hand Strength - desktop positioned, mobile toggleable */}
        <div className={`absolute top-4 right-4 z-10 ${showMobileStrength ? 'block' : 'hidden md:block'}`}>
          <HandStrength
            holeCards={gameState.players.find((p) => !p.isBot)?.holeCards || []}
            communityCards={gameState.communityCards}
            phase={gameState.phase}
          />
        </div>

        {/* Mobile toggle buttons */}
        <div className="absolute bottom-4 left-4 z-10 flex gap-2 md:hidden">
          <button
            onClick={() => setShowMobileHistory(!showMobileHistory)}
            className={`${
              showMobileHistory ? 'bg-blue-600' : 'bg-gray-700'
            } hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 touch-manipulation`}
            aria-label="Toggle action history"
          >
            📜
          </button>
          {gameState.communityCards.length >= 3 && (
            <button
              onClick={() => setShowMobileStrength(!showMobileStrength)}
              className={`${
                showMobileStrength ? 'bg-green-600' : 'bg-gray-700'
              } hover:bg-green-500 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 touch-manipulation`}
              aria-label="Toggle hand strength"
            >
              🎯
            </button>
          )}
        </div>

        <PokerTable gameState={gameState} />
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-900 p-4">
        <ActionButtons />
      </div>

      {/* Showdown Result Modal */}
      {gameState.showdownResult && (
        <ShowdownResult result={gameState.showdownResult} players={gameState.players} onDismiss={dismissShowdown} />
      )}

      {/* Game Over Modal */}
      <GameOverModal
        humanPlayer={gameState.players.find((p) => !p.isBot)}
        allPlayers={gameState.players}
        onRestart={handleRestart}
      />
    </div>
  );
}
