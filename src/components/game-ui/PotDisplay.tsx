interface PotDisplayProps {
  amount: number
  sidePots?: { amount: number; players: string[] }[]
  className?: string
}

export function PotDisplay({ amount, sidePots = [], className = '' }: PotDisplayProps) {
  const totalPot = amount + sidePots.reduce((sum, pot) => sum + pot.amount, 0)

  return (
    <div className={`${className}`}>
      {/* Main pot display */}
      <div className={`bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full px-6 py-3 shadow-2xl border-4 border-yellow-500/50 transform hover:scale-105 transition-transform ${totalPot > 0 ? 'animate-pulseGlow' : ''}`}>
        <div className="text-center">
          <div className="text-yellow-200 text-xs font-semibold uppercase tracking-wider">
            Pot
          </div>
          <div className="text-white text-2xl font-bold">
            ${totalPot.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Side pots indicator */}
      {sidePots.length > 0 && (
        <div className="mt-2 text-center">
          <div className="text-yellow-400 text-xs font-semibold">
            {sidePots.length} Side Pot{sidePots.length > 1 ? 's' : ''}
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {sidePots.map((pot, index) => (
              <div key={index} className="text-white/70 text-xs">
                Side Pot {index + 1}: ${pot.amount.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
