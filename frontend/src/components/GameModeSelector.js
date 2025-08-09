import React, { useState } from 'react';

const GameModeSelector = ({ onSelectMode, playerName, setPlayerName }) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);

  const handleModeSelection = (mode) => {
    setSelectedMode(mode);
    setShowNameInput(true);
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      onSelectMode(selectedMode);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && playerName.trim()) {
      handleStartGame();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {!showNameInput ? (
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Game Mode</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => handleModeSelection('ai')}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-3 group"
            >
              <span className="text-2xl">🤖</span>
              <div>
                <div>Play vs AI</div>
                <div className="text-sm opacity-80">Challenge our smart AI opponent</div>
              </div>
            </button>

            <button
              onClick={() => handleModeSelection('multiplayer')}
              className="w-full btn-secondary py-4 text-lg flex items-center justify-center space-x-3 group"
            >
              <span className="text-2xl">👥</span>
              <div>
                <div>Online Multiplayer</div>
                <div className="text-sm opacity-80">Play with friends online</div>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="text-red-500 text-lg">✘</span>
                <span>High Quality Graphics</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-blue-500 text-lg">○</span>
                <span>Smooth Animations</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedMode === 'ai' ? '🤖 AI Game Setup' : '👥 Multiplayer Setup'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your awesome name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                autoFocus
                maxLength={20}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 btn-outline"
              >
                Back
              </button>
              <button
                onClick={handleStartGame}
                disabled={!playerName.trim()}
                className="flex-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Game 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-white opacity-75 text-sm max-w-lg">
        <p className="mb-2">✨ <strong>AI Mode:</strong> Play against our intelligent AI with 3 difficulty levels!</p>
        <p>🌐 <strong>Multiplayer:</strong> Share room codes with friends and play in real-time!</p>
      </div>
    </div>
  );
};

export default GameModeSelector;