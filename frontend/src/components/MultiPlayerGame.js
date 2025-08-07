import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import axios from 'axios';

const MultiPlayerGame = ({ playerName, onBackToMenu }) => {
  const [gameState, setGameState] = useState({
    board: [
      ['-', '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-']
    ],
    current_player: 'X',
    game_over: false,
    winner: null,
    is_draw: false
  });
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [ws, setWs] = useState(null);
  const [roomInputValue, setRoomInputValue] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const WS_URL = BACKEND_URL.replace('http', 'ws');

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const createRoom = async () => {
    try {
      setIsCreatingRoom(true);
      const response = await axios.post(`${BACKEND_URL}/api/create-room`);
      const newRoomId = response.data.room_id;
      setRoomId(newRoomId);
      joinRoom(newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const joinRoom = (targetRoomId = roomInputValue) => {
    if (!targetRoomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    const wsConnection = new WebSocket(`${WS_URL}/api/ws/${targetRoomId}`);
    
    wsConnection.onopen = () => {
      setConnectionStatus('connected');
      setWs(wsConnection);
      setRoomId(targetRoomId);
      setIsInRoom(true);
      
      // Join the room
      wsConnection.send(JSON.stringify({
        type: 'join_room',
        player_name: playerName
      }));
    };

    wsConnection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'player_joined':
          setPlayers(prev => {
            const newPlayers = [...prev];
            if (!newPlayers.includes(message.player)) {
              newPlayers.push(message.player);
            }
            return newPlayers;
          });
          
          // Assign player symbols
          if (players.length === 0) {
            setPlayerSymbol('X'); // First player is X
          } else if (players.length === 1) {
            setPlayerSymbol('O'); // Second player is O
          }
          break;

        case 'game_update':
          setGameState(message.game_state);
          break;

        case 'game_reset':
          setGameState(message.game_state);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    };

    wsConnection.onclose = () => {
      setConnectionStatus('disconnected');
      setWs(null);
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
      alert('Failed to connect to room. Please check the room ID and try again.');
    };
  };

  const makeMove = (row, col) => {
    if (!ws || gameState.game_over || gameState.board[row][col] !== '-') {
      return;
    }

    // Check if it's the player's turn
    if (gameState.current_player !== playerSymbol) {
      return;
    }

    ws.send(JSON.stringify({
      type: 'make_move',
      row,
      col
    }));
  };

  const resetGame = () => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'reset_game'
      }));
    }
  };

  const leaveRoom = () => {
    if (ws) {
      ws.close();
    }
    setIsInRoom(false);
    setRoomId('');
    setPlayers([]);
    setPlayerSymbol(null);
    setGameState({
      board: [
        ['-', '-', '-'],
        ['-', '-', '-'],
        ['-', '-', '-']
      ],
      current_player: 'X',
      game_over: false,
      winner: null,
      is_draw: false
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    // You could add a toast notification here
    alert('Room ID copied to clipboard!');
  };

  if (!isInRoom) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="card w-full max-w-md text-center">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">👥 Multiplayer</h2>
            <button
              onClick={onBackToMenu}
              className="btn-outline text-sm px-4 py-2"
            >
              ← Back
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={createRoom}
              disabled={isCreatingRoom}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingRoom ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Room...</span>
                </div>
              ) : (
                <>🏠 Create New Room</>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={roomInputValue}
                onChange={(e) => setRoomInputValue(e.target.value.toUpperCase())}
                placeholder="Enter Room ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-center font-mono text-lg"
                maxLength={8}
              />
              <button
                onClick={() => joinRoom()}
                disabled={!roomInputValue.trim()}
                className="w-full btn-secondary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚪 Join Room
              </button>
            </div>
          </div>
        </div>

        <div className="card w-full max-w-md text-center text-sm text-gray-600">
          <h3 className="font-medium mb-2">🎮 How to Play:</h3>
          <ul className="text-left space-y-1">
            <li>• Create a room and share the Room ID with your friend</li>
            <li>• Or join an existing room using the Room ID</li>
            <li>• First player to join gets ✘, second gets ○</li>
            <li>• Take turns clicking on the board to play!</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Room Header */}
      <div className="card w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Room: <span className="room-code text-blue-600">{roomId}</span>
            </h2>
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-600">
              <span className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyRoomId}
              className="btn-outline text-sm px-4 py-2"
            >
              📋 Copy ID
            </button>
            <button
              onClick={leaveRoom}
              className="btn-outline text-sm px-4 py-2"
            >
              🚪 Leave
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">✘</div>
            <div className="text-sm text-gray-600">
              {players[0] || 'Waiting...'}
              {players[0] === playerName && ' (You)'}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">○</div>
            <div className="text-sm text-gray-600">
              {players[1] || 'Waiting...'}
              {players[1] === playerName && ' (You)'}
            </div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      {players.length < 2 ? (
        <div className="card w-full max-w-md text-center">
          <div className="text-blue-600 font-medium">
            Waiting for another player to join...
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Share the Room ID: <span className="font-mono font-bold">{roomId}</span>
          </div>
        </div>
      ) : (
        <div className="card w-full max-w-md text-center">
          {gameState.game_over ? (
            <div className={`p-4 rounded-lg ${
              gameState.winner === 'X' ? 'bg-red-100 text-red-800' :
              gameState.winner === 'O' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {gameState.winner === 'X' ? `🎉 ${players[0]} Wins! ✘` :
               gameState.winner === 'O' ? `🎉 ${players[1]} Wins! ○` :
               "🤝 It's a Draw!"}
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-700">
              {gameState.current_player === playerSymbol 
                ? "Your Turn!" 
                : `${gameState.current_player === 'X' ? players[0] : players[1]}'s Turn`
              }
              <span className="ml-2">
                {gameState.current_player === 'X' ? '✘' : '○'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      {players.length >= 2 && (
        <GameBoard
          board={gameState.board}
          onCellClick={makeMove}
          gameOver={gameState.game_over}
          winningLine={null}
          isDisabled={gameState.current_player !== playerSymbol}
        />
      )}

      {/* Controls */}
      {players.length >= 2 && (
        <div className="flex space-x-4">
          <button
            onClick={resetGame}
            className="btn-primary"
          >
            🔄 New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiPlayerGame;