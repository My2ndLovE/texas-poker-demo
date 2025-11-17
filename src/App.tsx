import GamePage from './presentation/pages/GamePage';
import ErrorBoundary from './presentation/components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <GamePage />
    </ErrorBoundary>
  );
}

export default App;
