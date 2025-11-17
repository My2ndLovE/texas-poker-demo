import { useState } from 'react';
import { useMachine } from '@xstate/react';
import { pokerMachine } from './state-management/pokerMachine';
import HomePage from './presentation/pages/HomePage';
import GamePage from './presentation/pages/GamePage';
import type { GameSettings } from './types';

function App() {
  const [state, send] = useMachine(pokerMachine);
  const [settings, setSettings] = useState<GameSettings>({
    numBots: 5,
    botDifficulty: 'mixed',
    startingChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    actionTimer: 30,
    animationSpeed: 'normal',
    soundEffects: true,
    language: 'en',
  });

  const handleStartGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    send({ type: 'START_GAME', settings: newSettings });
  };

  // Determine which page to render based on state
  const isInGame = state.matches('inGame');
  const isGameOver = state.matches('gameOver');

  if (isInGame || isGameOver) {
    return (
      <GamePage
        state={state}
        send={send}
        settings={settings}
      />
    );
  }

  return (
    <HomePage
      onStartGame={handleStartGame}
      defaultSettings={settings}
    />
  );
}

export default App;
