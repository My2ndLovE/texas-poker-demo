import { ActionLog as ActionLogType } from '../../store/gameStore'

interface ActionLogProps {
  actions: ActionLogType[]
  className?: string
}

export function ActionLog({ actions, className = '' }: ActionLogProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className={`bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg ${className}`}>
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
        Action History
      </h3>

      <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
        {actions.map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            className="text-sm text-gray-300 flex items-baseline gap-2 animate-fadeIn"
          >
            <span className="font-semibold text-white min-w-[80px] truncate">
              {log.playerName}:
            </span>
            <span className="text-gray-400">{log.action}</span>
            {log.amount !== undefined && log.amount > 0 && (
              <span className="text-yellow-400 font-semibold ml-auto">
                ${log.amount}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
