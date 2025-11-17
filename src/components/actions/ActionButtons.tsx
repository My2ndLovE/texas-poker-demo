import { useState } from 'react'

interface ActionButtonsProps {
  validActions: string[]
  onAction: (action: string, amount?: number) => void
  callAmount: number
  minRaise: number
  maxRaise: number
  potSize: number
  disabled?: boolean
}

export function ActionButtons({
  validActions,
  onAction,
  callAmount,
  minRaise,
  maxRaise,
  potSize,
  disabled = false,
}: ActionButtonsProps) {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false)
  const [raiseAmount, setRaiseAmount] = useState(minRaise)

  const canCheck = validActions.includes('check')
  const canCall = validActions.includes('call')
  const canBet = validActions.includes('bet')
  const canRaise = validActions.includes('raise')
  const canAllIn = validActions.includes('all-in')

  const handleRaise = () => {
    if (showRaiseSlider) {
      onAction('raise', raiseAmount)
      setShowRaiseSlider(false)
      setRaiseAmount(minRaise)
    } else {
      setShowRaiseSlider(true)
      setRaiseAmount(minRaise)
    }
  }

  const handleBet = () => {
    if (showRaiseSlider) {
      onAction('bet', raiseAmount)
      setShowRaiseSlider(false)
      setRaiseAmount(minRaise)
    } else {
      setShowRaiseSlider(true)
      setRaiseAmount(minRaise)
    }
  }

  const quickBet = (multiplier: number) => {
    const amount = Math.min(Math.floor(potSize * multiplier), maxRaise)
    setRaiseAmount(Math.max(amount, minRaise))
  }

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-700 shadow-2xl">
      {/* Raise/Bet Slider */}
      {showRaiseSlider && (canRaise || canBet) && (
        <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">
              {canRaise ? 'Raise Amount' : 'Bet Amount'}
            </span>
            <span className="text-yellow-400 font-bold text-lg">
              ${raiseAmount.toLocaleString()}
            </span>
          </div>

          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={disabled}
          />

          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Min: ${minRaise}</span>
            <span>Max: ${maxRaise}</span>
          </div>

          {/* Quick bet buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => quickBet(0.5)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors"
              disabled={disabled}
            >
              1/2 Pot
            </button>
            <button
              onClick={() => quickBet(0.75)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors"
              disabled={disabled}
            >
              3/4 Pot
            </button>
            <button
              onClick={() => quickBet(1)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-2 rounded transition-colors"
              disabled={disabled}
            >
              Pot
            </button>
            <button
              onClick={() => setRaiseAmount(maxRaise)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold py-1.5 px-2 rounded transition-colors"
              disabled={disabled}
            >
              All-In
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {/* Fold */}
        <button
          onClick={() => onAction('fold')}
          className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Fold
        </button>

        {/* Check / Call */}
        {canCheck && (
          <button
            onClick={() => onAction('check')}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Check
          </button>
        )}

        {canCall && (
          <button
            onClick={() => onAction('call')}
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <div>Call</div>
            <div className="text-sm">${callAmount}</div>
          </button>
        )}

        {/* Bet / Raise */}
        {canBet && (
          <button
            onClick={handleBet}
            className={`${
              showRaiseSlider
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-purple-600 hover:bg-purple-500'
            } active:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={disabled}
          >
            {showRaiseSlider ? 'Confirm Bet' : 'Bet'}
          </button>
        )}

        {canRaise && (
          <button
            onClick={handleRaise}
            className={`${
              showRaiseSlider
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-purple-600 hover:bg-purple-500'
            } active:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={disabled}
          >
            {showRaiseSlider ? 'Confirm Raise' : 'Raise'}
          </button>
        )}

        {/* All-In */}
        {canAllIn && !showRaiseSlider && (
          <button
            onClick={() => onAction('all-in')}
            className="bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            All-In
          </button>
        )}
      </div>

      {/* Cancel raise/bet */}
      {showRaiseSlider && (
        <button
          onClick={() => {
            setShowRaiseSlider(false)
            setRaiseAmount(minRaise)
          }}
          className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
          disabled={disabled}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
