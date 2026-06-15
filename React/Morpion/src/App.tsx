import { useState } from 'react';

function App() {
  const [morpion, setMorpion] = useState({
    board: Array(9).fill(null),
    turn: 'X'
  });

  const play = (index: number) => {
    if (morpion.board[index] || checkWinner(morpion.board)) return;
    const newBoard = [...morpion.board];
    newBoard[index] = morpion.turn;
    
    setMorpion({
      board: newBoard,
      turn: morpion.turn === 'X' ? 'O' : 'X'
    });
  };

  const checkWinner = (board: any[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '5px' }}>
      {morpion.board.map((val: any, i: number) => (
        <button key={i} style={{ height: '100px' }} onClick={() => play(i)}>
          {val || '-'}
        </button>
      ))}
    </div>
  );
}

export default App;