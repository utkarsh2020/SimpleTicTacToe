import React from 'react';

const GameBoard = ({ board, onCellClick, gameOver, winningLine, isDisabled }) => {
  const renderCell = (row, col) => {
    const cellValue = board[row][col];
    const isEmpty = cellValue === '-';
    
    return (
      <div
        key={`${row}-${col}`}
        className={`game-cell ${gameOver || isDisabled ? 'disabled' : ''} ${
          winningLine && winningLine.includes(`${row}-${col}`) ? 'winning-line' : ''
        }`}
        onClick={() => !isEmpty && !gameOver && !isDisabled ? null : onCellClick(row, col)}
      >
        {cellValue === 'X' && (
          <div className="symbol x fade-in">
            <img 
              src="https://images.unsplash.com/photo-1579894963949-95530a650650?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxYJTIwTyUyMHN5bWJvbHN8ZW58MHx8fHwxNzU0NTU4Mzc4fDA&ixlib=rb-4.1.0&q=85"
              alt="X"
              className="symbol-image"
              style={{ 
                width: '60%', 
                height: '60%',
                filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)'
              }}
            />
          </div>
        )}
        {cellValue === 'O' && (
          <div className="symbol o fade-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-blue-500 rounded-full bg-transparent flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full opacity-80"></div>
            </div>
          </div>
        )}
        {isEmpty && !gameOver && !isDisabled && (
          <div className="opacity-0 hover:opacity-30 transition-opacity duration-200">
            <div className="text-gray-400 text-2xl font-light">+</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board bg-white p-4 rounded-xl shadow-lg">
      {board.map((row, rowIndex) =>
        row.map((_, colIndex) => renderCell(rowIndex, colIndex))
      )}
    </div>
  );
};

export default GameBoard;