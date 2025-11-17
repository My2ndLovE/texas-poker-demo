import React, { useState } from 'react';
import { ActionType } from '@/utils/constants';
import { Player } from '@/game-logic/models/Player';
import { BettingRules } from '@/game-logic/rules/BettingRules';

interface ActionButtonsProps {
  player: Player;
  currentBet: number;
  minRaise: number;
  onAction: (action: ActionType, amount: number) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  player,
  currentBet,
  minRaise,
  onAction,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const bettingRules = new BettingRules();

  const availableActions = bettingRules.getAvailableActions(player, currentBet, minRaise);
  const minRaiseAmount = bettingRules.getMinRaiseAmount(player, currentBet, minRaise);
  const callAmount = bettingRules.getCallAmount(player, currentBet);

  React.useEffect(() => {
    setRaiseAmount(minRaiseAmount);
  }, [minRaiseAmount]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white mb-4 font-bold">Your Action</h3>

      <div className="flex flex-wrap gap-2">
        {availableActions.includes(ActionType.Fold) && (
          <button
            onClick={() => onAction(ActionType.Fold, 0)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
          >
            Fold
          </button>
        )}

        {availableActions.includes(ActionType.Check) && (
          <button
            onClick={() => onAction(ActionType.Check, 0)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
          >
            Check
          </button>
        )}

        {availableActions.includes(ActionType.Call) && (
          <button
            onClick={() => onAction(ActionType.Call, callAmount)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
          >
            Call ${callAmount}
          </button>
        )}

        {availableActions.includes(ActionType.Bet) && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={minRaise}
              max={player.chips}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-24 px-3 py-2 bg-gray-700 text-white rounded"
            />
            <button
              onClick={() => onAction(ActionType.Bet, raiseAmount)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition"
            >
              Bet
            </button>
          </div>
        )}

        {availableActions.includes(ActionType.Raise) && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={minRaiseAmount}
              max={player.chips}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-24 px-3 py-2 bg-gray-700 text-white rounded"
            />
            <button
              onClick={() => onAction(ActionType.Raise, raiseAmount)}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition"
            >
              Raise
            </button>
          </div>
        )}

        {availableActions.includes(ActionType.AllIn) && (
          <button
            onClick={() => onAction(ActionType.AllIn, player.chips)}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold transition animate-pulse"
          >
            All-In ${player.chips}
          </button>
        )}
      </div>
    </div>
  );
};
