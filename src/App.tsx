import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StartMenu } from './presentation/pages/StartMenu';
import { PokerTable } from './presentation/pages/PokerTable';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartMenu />} />
        <Route path="/game" element={<PokerTable />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
