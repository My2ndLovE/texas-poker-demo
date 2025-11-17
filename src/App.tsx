import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Texas Hold'em Poker</h1>
        <p className="text-xl mb-8">Single-player poker game with AI opponents</p>

        <div className="bg-gray-700 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl mb-4">Development Setup</h2>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-gray-300">
            Project initialized successfully!
          </p>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>Phase 1: Foundation & Setup - In Progress</p>
          <p>pokersolver | React 18 | TypeScript | Tailwind CSS | Zustand</p>
        </div>
      </div>
    </div>
  )
}

export default App
