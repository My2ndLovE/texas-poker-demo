import { Action } from '@/game-logic/models/GameState';
import { Player } from '@/game-logic/models/Player';

interface ActionHistoryProps {
  actions: Action[];
  players: Player[];
  maxItems?: number;
}

export default function ActionHistory({ actions, players, maxItems = 5 }: ActionHistoryProps) {
  // Get the most recent actions
  const recentActions = actions.slice(-maxItems).reverse();

  if (recentActions.length === 0) {
    return null;
  }

  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown';
  };

  const getActionIcon = (type: string): string => {
    switch (type) {
      case 'fold':
        return '❌';
      case 'check':
        return '✓';
      case 'call':
        return '📞';
      case 'bet':
      case 'raise':
        return '⬆️';
      case 'allin':
        return '🔥';
      default:
        return '•';
    }
  };

  const getActionColor = (type: string): string => {
    switch (type) {
      case 'fold':
        return 'text-red-400';
      case 'check':
        return 'text-gray-400';
      case 'call':
        return 'text-green-400';
      case 'bet':
      case 'raise':
        return 'text-blue-400';
      case 'allin':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatAction = (action: Action): string => {
    const { type, amount } = action;

    switch (type) {
      case 'fold':
        return 'folded';
      case 'check':
        return 'checked';
      case 'call':
        return `called $${amount}`;
      case 'bet':
        return `bet $${amount}`;
      case 'raise':
        return `raised to $${amount}`;
      case 'allin':
        return `went all-in $${amount}`;
      default:
        return type;
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg backdrop-blur-sm max-w-xs">
      <h3 className="text-white text-xs font-semibold mb-2 opacity-70">Recent Actions</h3>
      <div className="space-y-1">
        {recentActions.map((action, index) => {
          const isLatest = index === 0;
          return (
            <div
              key={`${action.playerId}-${action.timestamp}-${index}`}
              className={`flex items-center gap-2 text-xs transition-opacity ${
                isLatest ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <span className="text-lg leading-none">{getActionIcon(action.type)}</span>
              <span className="text-white font-medium">{getPlayerName(action.playerId)}</span>
              <span className={`${getActionColor(action.type)} font-semibold`}>
                {formatAction(action)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
