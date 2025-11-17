import React, { useState, useEffect } from 'react';
import { ActionType } from '@/utils/constants';
import { Player } from '@/game-logic/models/Player';
import { BettingRules } from '@/game-logic/rules/BettingRules';

interface ActionButtonsProps {
  player: Player;
  currentBet: number;
  minRaise: number;
  onAction: (action: ActionType, amount: number) => void;
  potSize?: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  player,
  currentBet,
  minRaise,
  onAction,
  potSize = 0,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const bettingRules = new BettingRules();

  const availableActions = bettingRules.getAvailableActions(player, currentBet, minRaise);
  const minRaiseAmount = bettingRules.getMinRaiseAmount(player, currentBet, minRaise);
  const callAmount = bettingRules.getCallAmount(player, currentBet);

  React.useEffect(() => {
    setRaiseAmount(minRaiseAmount);
  }, [minRaiseAmount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          if (availableActions.includes(ActionType.Fold)) {
            onAction(ActionType.Fold, 0);
          }
          break;
        case 'c':
          if (availableActions.includes(ActionType.Check)) {
            onAction(ActionType.Check, 0);
          } else if (availableActions.includes(ActionType.Call)) {
            onAction(ActionType.Call, callAmount);
          }
          break;
        case 'r':
          if (availableActions.includes(ActionType.Raise)) {
            onAction(ActionType.Raise, raiseAmount);
          } else if (availableActions.includes(ActionType.Bet)) {
            onAction(ActionType.Bet, raiseAmount);
          }
          break;
        case 'a':
          if (availableActions.includes(ActionType.AllIn)) {
            onAction(ActionType.AllIn, player.chips);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [availableActions, callAmount, raiseAmount, player.chips, onAction]);

  // Preset bet amounts
  const presetBets = [
    { label: 'Min', value: minRaiseAmount },
    { label: '1/2 Pot', value: Math.min(Math.floor(potSize / 2), player.chips) },
    { label: 'Pot', value: Math.min(potSize, player.chips) },
    { label: '2x Pot', value: Math.min(potSize * 2, player.chips) },
  ].filter(bet => bet.value >= minRaiseAmount && bet.value <= player.chips);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-2xl border-2 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-bold flex items-center gap-2">
          <span>🎮</span>
          Your Action
        </h3>
        <div className="text-xs text-gray-400">
          Shortcuts: [F]old [C]heck/Call [R]aise [A]ll-in
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Fold Button */}
        {availableActions.includes(ActionType.Fold) && (
          <button
            onClick={() => onAction(ActionType.Fold, 0)}
            className="px-8 py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
          >
            <span className="text-lg">❌</span> Fold <span className="text-xs opacity-75">[F]</span>
          </button>
        )}

        {/* Check Button */}
        {availableActions.includes(ActionType.Check) && (
          <button
            onClick={() => onAction(ActionType.Check, 0)}
            className="px-8 py-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
          >
            <span className="text-lg">✓</span> Check <span className="text-xs opacity-75">[C]</span>
          </button>
        )}

        {/* Call Button */}
        {availableActions.includes(ActionType.Call) && (
          <button
            onClick={() => onAction(ActionType.Call, callAmount)}
            className="px-8 py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
          >
            <span className="text-lg">📞</span> Call ${callAmount} <span className="text-xs opacity-75">[C]</span>
          </button>
        )}

        {/* Bet/Raise Section */}
        {(availableActions.includes(ActionType.Bet) || availableActions.includes(ActionType.Raise)) && (
          <div className="w-full bg-gray-800 p-4 rounded-lg border border-yellow-500">
            {/* Preset Buttons */}
            {presetBets.length > 0 && (
              <div className="flex gap-2 mb-3">
                {presetBets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setRaiseAmount(preset.value)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
                  >
                    {preset.label}: ${preset.value}
                  </button>
                ))}
              </div>
            )}

            {/* Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Amount: ${raiseAmount}</span>
                <span className="text-gray-400">Max: ${player.chips}</span>
              </div>
              <input
                type="range"
                min={minRaiseAmount}
                max={player.chips}
                step={Math.max(1, Math.floor((player.chips - minRaiseAmount) / 100))}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            {/* Number Input and Button */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minRaiseAmount}
                max={player.chips}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 bg-gray-700 text-white text-lg rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 outline-none"
              />
              {availableActions.includes(ActionType.Raise) && (
                <button
                  onClick={() => onAction(ActionType.Raise, raiseAmount)}
                  className="px-8 py-3 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
                >
                  <span className="text-lg">⬆️</span> Raise <span className="text-xs opacity-75">[R]</span>
                </button>
              )}
              {availableActions.includes(ActionType.Bet) && (
                <button
                  onClick={() => onAction(ActionType.Bet, raiseAmount)}
                  className="px-8 py-3 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg"
                >
                  <span className="text-lg">💰</span> Bet <span className="text-xs opacity-75">[R]</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* All-In Button */}
        {availableActions.includes(ActionType.AllIn) && (
          <button
            onClick={() => onAction(ActionType.AllIn, player.chips)}
            className="px-8 py-4 bg-gradient-to-br from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-bold transition transform hover:scale-105 shadow-lg animate-pulse"
          >
            <span className="text-lg">🎲</span> All-In ${player.chips} <span className="text-xs opacity-75">[A]</span>
          </button>
        )}
      </div>
    </div>
  );
};
