import { handEvaluator } from '@/game-logic/evaluation/HandEvaluator';
import type { Card } from '@/types';
import { useGameStore } from '@/state-management/gameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WinnerAnnouncement() {
  const gameState = useGameStore((state) => state.gameState);
  const [showWinner, setShowWinner] = useState(false);
  const [winners, setWinners] = useState<
    Array<{ playerId: string; playerName: string; handDescription: string; amount: number }>
  >([]);

  useEffect(() => {
    if (!gameState) return;

    // Show winner announcement when hand is complete
    if (gameState.phase === 'hand-complete') {
      // Find winners from the last action history
      const activePlayers = gameState.players.filter((p) => p.status !== 'folded');

      if (activePlayers.length === 0) {
        setShowWinner(false);
        return;
      }

      // If only one player left, they won by default
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        setWinners([
          {
            playerId: winner.id,
            playerName: winner.name,
            handDescription: 'Won by default (all others folded)',
            amount: gameState.pot.totalPot,
          },
        ]);
        setShowWinner(true);
        return;
      }

      // Multiple players - evaluate hands
      try {
        const hands = activePlayers.map((p) => ({
          playerId: p.id,
          cards: [...p.holeCards, ...gameState.communityCards] as Card[],
        }));

        const winnerIds = handEvaluator.findWinners(hands);
        const winnerData = winnerIds.map((winnerId) => {
          const player = activePlayers.find((p) => p.id === winnerId);
          if (!player) return null;

          const allCards = [...player.holeCards, ...gameState.communityCards];
          const handResult = handEvaluator.evaluateHand(allCards);

          return {
            playerId: player.id,
            playerName: player.name,
            handDescription: handResult.description,
            amount: Math.floor(gameState.pot.totalPot / winnerIds.length),
          };
        });

        setWinners(winnerData.filter((w) => w !== null) as typeof winners);
        setShowWinner(true);
      } catch (error) {
        console.error('Error evaluating winners:', error);
        setShowWinner(false);
      }
    } else {
      setShowWinner(false);
    }
  }, [gameState?.phase, gameState?.pot.totalPot]);

  if (!gameState) return null;

  return (
    <AnimatePresence>
      {showWinner && winners.length > 0 && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-8 rounded-2xl shadow-2xl border-4 border-yellow-400 max-w-2xl"
            initial={{ scale: 0, rotateZ: -10 }}
            animate={{ scale: 1, rotateZ: 0 }}
            exit={{ scale: 0, rotateZ: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Trophy className="w-24 h-24 mx-auto text-yellow-200 mb-4" />
              </motion.div>

              <h1 className="text-5xl font-black text-white mb-6 uppercase">
                {winners.length === 1 ? 'Winner!' : 'Split Pot!'}
              </h1>

              {winners.map((winner, index) => (
                <div key={winner.playerId} className="mb-6 last:mb-0">
                  <p className="text-3xl font-bold text-white mb-2">{winner.playerName}</p>
                  <p className="text-xl text-yellow-200 mb-2">{winner.handDescription}</p>
                  <p className="text-4xl font-black text-green-300">${winner.amount}</p>
                  {index < winners.length - 1 && (
                    <div className="border-t-2 border-yellow-400/50 my-4" />
                  )}
                </div>
              ))}

              <p className="text-sm text-yellow-200 mt-6">Click "Next Hand" to continue playing</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
