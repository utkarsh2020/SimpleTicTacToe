import React, { useState } from 'react';
import GameModeSelector from './components/GameModeSelector';
import SinglePlayerGame from './components/SinglePlayerGame';
import MultiPlayerGame from './components/MultiPlayerGame';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [playerName, setPlayerName] = useState('');

  const handleBackToMenu = () => {
    setGameMode(null);
    setPlayerName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2 animate-pulse-slow">
            🎮 Tic Tac Toe 🎮
          </h1>
          <p className="text-lg sm:text-xl text-white opacity-90">
            Play with AI or Challenge Friends Online!
          </p>
        </header>

        {!gameMode && (
          <GameModeSelector 
            onSelectMode={setGameMode} 
            playerName={playerName}
            setPlayerName={setPlayerName}
          />
        )}

        {gameMode === 'ai' && (
          <SinglePlayerGame 
            playerName={playerName}
            onBackToMenu={handleBackToMenu}
          />
        )}

        {gameMode === 'multiplayer' && (
          <MultiPlayerGame 
            playerName={playerName}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </div>
    </div>
  );
}

export default App;