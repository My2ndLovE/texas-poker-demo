import { useState } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onApply: (settings: GameSettings) => void
  currentSettings: GameSettings
}

export interface GameSettings {
  numberOfBots: number
  botDifficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  startingChips: number
  smallBlind: number
  bigBlind: number
  animationSpeed: 'slow' | 'normal' | 'fast'
}

export function SettingsPanel({ isOpen, onClose, onApply, currentSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<GameSettings>(currentSettings)

  if (!isOpen) return null

  const handleApply = () => {
    onApply(settings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-900 rounded-lg border-2 border-gray-700 shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Game Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Number of bots */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Number of Opponents
            </label>
            <select
              value={settings.numberOfBots}
              onChange={(e) => setSettings({ ...settings, numberOfBots: parseInt(e.target.value) })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Opponent' : 'Opponents'}
                </option>
              ))}
            </select>
          </div>

          {/* Bot difficulty */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Opponent Difficulty
            </label>
            <select
              value={settings.botDifficulty}
              onChange={(e) => setSettings({ ...settings, botDifficulty: e.target.value as any })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="easy">Easy (35-40% win rate)</option>
              <option value="medium">Medium (45-50% win rate)</option>
              <option value="hard">Hard (55-60% win rate)</option>
              <option value="mixed">Mixed (Varied difficulty)</option>
            </select>
          </div>

          {/* Starting chips */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Starting Chips
            </label>
            <select
              value={settings.startingChips}
              onChange={(e) => setSettings({ ...settings, startingChips: parseInt(e.target.value) })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value={500}>$500 (Short stack)</option>
              <option value={1000}>$1,000 (Standard)</option>
              <option value={2000}>$2,000 (Deep stack)</option>
              <option value={5000}>$5,000 (Very deep)</option>
            </select>
          </div>

          {/* Blinds */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Blind Levels
            </label>
            <select
              value={`${settings.smallBlind}-${settings.bigBlind}`}
              onChange={(e) => {
                const [sb, bb] = e.target.value.split('-').map(Number)
                setSettings({ ...settings, smallBlind: sb!, bigBlind: bb! })
              }}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="5-10">$5 / $10</option>
              <option value="10-20">$10 / $20</option>
              <option value="25-50">$25 / $50</option>
              <option value="50-100">$50 / $100</option>
            </select>
          </div>

          {/* Animation speed */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Animation Speed
            </label>
            <div className="flex gap-3">
              {['slow', 'normal', 'fast'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSettings({ ...settings, animationSpeed: speed as any })}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    settings.animationSpeed === speed
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Apply Settings
          </button>
        </div>

        {/* Note */}
        <div className="px-6 pb-4">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <p className="text-yellow-400 text-xs">
              ⚠️ Settings will take effect when you start a new hand.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
