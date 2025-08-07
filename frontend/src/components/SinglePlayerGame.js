import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import axios from 'axios';

const SinglePlayerGame = ({ playerName, onBackToMenu }) => {
  const [board, setBoard] = useState([
    ['-', '-', '-'],
    ['-', '-', '-'],
    ['-', '-', '-']
  ]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const checkWinner = (board) => {
    // Check rows
    for (let row of board) {
      if (row[0] === row[1] && row[1] === row[2] && row[0] !== '-') {
        return row[0];
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] === board[1][col] && board[1][col] === board[2][col] && board[0][col] !== '-') {
        return board[0][col];
      }
    }

    // Check diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '-') {
      return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '-') {
      return board[0][2];
    }

    return null;
  };

  const isBoardFull = (board) => {
    for (let row of board) {
      if (row.includes('-')) {
        return false;
      }
    }
    return true;
  };

  const makeMove = async (row, col) => {
    if (board[row][col] !== '-' || gameOver || currentPlayer === 'O' || isAIThinking) {
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    const boardFull = isBoardFull(newBoard);

    if (winner) {
      setWinner(winner);
      setGameOver(true);
      if (winner === 'X') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else {
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
      }
      return;
    }

    if (boardFull) {
      setIsDraw(true);
      setGameOver(true);
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // AI's turn
    setCurrentPlayer('O');
    setIsAIThinking(true);

    try {
      // Add slight delay for better UX
      setTimeout(async () => {
        const response = await axios.post(`${BACKEND_URL}/api/ai-move`, newBoard, {
          params: { difficulty }
        });

        if (response.data.row !== undefined && response.data.col !== undefined) {
          const aiBoard = newBoard.map(r => [...r]);
          aiBoard[response.data.row][response.data.col] = 'O';
          setBoard(aiBoard);

          const aiWinner = checkWinner(aiBoard);
          const aiBoardFull = isBoardFull(aiBoard);

          if (aiWinner) {
            setWinner(aiWinner);
            setGameOver(true);
            if (aiWinner === 'X') {
              setScore(prev => ({ ...prev, player: prev.player + 1 }));
            } else {
              setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
            }
          } else if (aiBoardFull) {
            setIsDraw(true);
            setGameOver(true);
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
          } else {
            setCurrentPlayer('X');
          }
        }
        setIsAIThinking(false);
      }, difficulty === 'easy' ? 500 : difficulty === 'medium' ? 1000 : 1500);
    } catch (error) {
      console.error('Error making AI move:', error);
      setIsAIThinking(false);
      setCurrentPlayer('X');
    }
  };

  const resetGame = () => {
    setBoard([
      ['-', '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-']
    ]);
    setCurrentPlayer('X');
    setGameOver(false);
    setWinner(null);
    setIsDraw(false);
    setIsAIThinking(false);
  };

  const resetScore = () => {
    setScore({ player: 0, ai: 0, draws: 0 });
    resetGame();
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getDifficultyEmoji = (level) => {
    switch (level) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '🤯';
      default: return '🤖';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Header */}
      <div className="card w-full max-w-2xl text-center">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
            🤖 vs {playerName}
          </h2>
          <button
            onClick={onBackToMenu}
            className="btn-outline text-sm px-4 py-2"
          >
            ← Back to Menu
          </button>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="text-sm text-gray-600 self-center mr-2">Difficulty:</span>
          {['easy', 'medium', 'hard'].map(level => (
            <button
              key={level}
              onClick={() => {
                if (!gameOver && !isAIThinking) {
                  setDifficulty(level);
                }
              }}
              className={`px-3 py-1 rounded-full text-white text-sm font-medium transition-all duration-200 ${
                difficulty === level
                  ? getDifficultyColor(level)
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              } ${(gameOver || isAIThinking) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={gameOver || isAIThinking}
            >
              {getDifficultyEmoji(level)} {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{score.player}</div>
            <div className="text-sm text-gray-600">You</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-600">{score.draws}</div>
            <div className="text-sm text-gray-600">Draws</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-lg font-bold text-red-600">{score.ai}</div>
            <div className="text-sm text-gray-600">AI</div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="card w-full max-w-md text-center">
        {isAIThinking ? (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>AI is thinking{getDifficultyEmoji(difficulty)}</span>
          </div>
        ) : gameOver ? (
          <div className={`p-4 rounded-lg ${
            winner === 'X' ? 'bg-green-100 text-green-800' :
            winner === 'O' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {winner === 'X' ? `🎉 ${playerName} Wins!` :
             winner === 'O' ? '🤖 AI Wins!' :
             "🤝 It's a Draw!"}
          </div>
        ) : (
          <div className="text-lg font-medium text-gray-700">
            {currentPlayer === 'X' ? `${playerName}'s Turn ✘` : "AI's Turn ○"}
          </div>
        )}
      </div>

      {/* Game Board */}
      <GameBoard
        board={board}
        onCellClick={makeMove}
        gameOver={gameOver}
        winningLine={null}
        isDisabled={currentPlayer === 'O' || isAIThinking}
      />

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={resetGame}
          className="btn-primary"
        >
          🔄 New Game
        </button>
        <button
          onClick={resetScore}
          className="btn-outline"
        >
          📊 Reset Score
        </button>
      </div>

      {/* Tips */}
      <div className="card w-full max-w-md text-center text-sm text-gray-600">
        <h3 className="font-medium mb-2">💡 Tips:</h3>
        <ul className="text-left space-y-1">
          <li>• <strong>Easy:</strong> AI makes random moves sometimes</li>
          <li>• <strong>Medium:</strong> AI is smart but makes occasional mistakes</li>
          <li>• <strong>Hard:</strong> AI plays perfectly - good luck! 🔥</li>
        </ul>
      </div>
    </div>
  );
};

export default SinglePlayerGame;