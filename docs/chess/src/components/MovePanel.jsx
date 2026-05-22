import React from 'react';

const PIECE_SYMBOLS = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚'
};

export function pieceSymbol(piece) {
  if (!piece) {
    return '';
  }
  return PIECE_SYMBOLS[`${piece.color}${piece.type}`] || piece.type;
}

export default function MovePanel({
  chess,
  canMove,
  myColor,
  selectedSquare,
  legalTargets,
  onSquareClick,
  gameStatus,
  turn,
  roomConnected = true,
  connectionCount = 0
}) {
  const files = 'abcdefgh';
  const ranks = myColor === 'b' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  let statusText = 'Spectating';
  if (!roomConnected) {
    statusText = 'Connecting to host peer…';
  } else if (canMove) {
    statusText = 'Your turn — click a piece, then a destination square.';
  } else if (myColor && gameStatus === 'playing') {
    statusText = turn === myColor ? 'Syncing…' : 'Waiting for opponent…';
  } else if (gameStatus === 'waiting') {
    statusText = connectionCount > 0
      ? 'Waiting for opponent to join…'
      : 'Connecting P2P link…';
  } else if (gameStatus === 'finished') {
    statusText = 'Game over.';
  }

  return (
    <section className="panel move-panel">
      <h3>Move</h3>
      <p className="move-panel__status">{statusText}</p>

      {selectedSquare ? (
        <p className="move-panel__selected">
          Selected: <strong>{selectedSquare.toUpperCase()}</strong>
          {legalTargets.length ? ` · ${legalTargets.length} legal move(s)` : ''}
        </p>
      ) : null}

      <div className="mini-board" aria-label="Chess board">
        {ranks.map((rank) => (
          <div key={rank} className="mini-board__row">
            <span className="mini-board__rank">{rank}</span>
            {files.split('').map((file) => {
              const square = `${file}${rank}`;
              const piece = chess.get(square);
              const isLight = (file.charCodeAt(0) - 97 + rank) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isTarget = legalTargets.includes(square);
              const isOwnPiece = piece && piece.color === myColor;

              return (
                <button
                  key={square}
                  type="button"
                  title={square}
                  className={[
                    'mini-board__sq',
                    isLight ? 'light' : 'dark',
                    isSelected ? 'selected' : '',
                    isTarget ? 'target' : '',
                    isOwnPiece ? 'own' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => onSquareClick(square)}
                  disabled={!canMove && !isTarget}
                >
                  {piece ? (
                    <span className={`mini-board__piece mini-board__piece--${piece.color}`}>
                      {pieceSymbol(piece)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
        <div className="mini-board__files">
          <span className="mini-board__rank" aria-hidden="true" />
          {files.split('').map((file) => (
            <span key={file} className="mini-board__file">{file}</span>
          ))}
        </div>
      </div>

      {canMove && legalTargets.length > 0 ? (
        <div className="move-targets">
          <p className="muted">Quick moves</p>
          <div className="move-targets__list">
            {legalTargets.map((square) => (
              <button
                key={square}
                type="button"
                className="secondary"
                onClick={() => onSquareClick(square)}
              >
                {selectedSquare}
                →
                {square}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
