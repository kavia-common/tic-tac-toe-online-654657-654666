import React, { useMemo, useState, useEffect } from 'react';
import './App.css';

/**
 * Ocean Professional Tic Tac Toe
 * - Two modes: PvP and PvAI
 * - Responsive, centered layout with options panel and status display
 * - Blue & amber accents, modern visuals
 */

/* === Constants for theme and game === */
const COLORS = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  success: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

const MODES = {
  PVP: 'Two Players',
  AI: 'Play vs AI',
};

const PLAYERS = {
  X: 'X',
  O: 'O',
};

/* === Helpers: game logic === */
// PUBLIC_INTERFACE
export function calculateWinner(squares) {
  /** Determines the winner of a 3x3 Tic Tac Toe game.
   * @param {Array<string|null>} squares - 9-length array of 'X', 'O' or null
   * @returns {{winner: 'X'|'O'|null, line: number[]|null}} winner and winning line, or nulls if no winner
   */
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diags
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

// PUBLIC_INTERFACE
export function isBoardFull(squares) {
  /** Checks if board has no empty cells. */
  return squares.every((s) => s !== null);
}

// PUBLIC_INTERFACE
export function getAvailableMoves(squares) {
  /** Returns array of available indices for moves. */
  const moves = [];
  squares.forEach((v, i) => {
    if (v === null) moves.push(i);
  });
  return moves;
}

// PUBLIC_INTERFACE
export function minimax(squares, isMaximizing, aiPlayer, humanPlayer) {
  /**
   * Minimax with simple scoring for 3x3 Tic Tac Toe
   * @param {Array<string|null>} squares current board
   * @param {boolean} isMaximizing turn flag
   * @param {'X'|'O'} aiPlayer symbol for AI
   * @param {'X'|'O'} humanPlayer symbol for human
   * @returns {{score: number, move: number|null}}
   */
  const { winner } = calculateWinner(squares);
  if (winner === aiPlayer) return { score: 10, move: null };
  if (winner === humanPlayer) return { score: -10, move: null };
  if (isBoardFull(squares)) return { score: 0, move: null };

  const moves = getAvailableMoves(squares);
  let best = { score: isMaximizing ? -Infinity : Infinity, move: null };

  for (const move of moves) {
    const clone = squares.slice();
    clone[move] = isMaximizing ? aiPlayer : humanPlayer;
    const result = minimax(clone, !isMaximizing, aiPlayer, humanPlayer);
    if (isMaximizing) {
      if (result.score > best.score) best = { score: result.score, move };
    } else {
      if (result.score < best.score) best = { score: result.score, move };
    }
  }

  return best;
}

// PUBLIC_INTERFACE
export function pickBestAIMove(squares, aiPlayer) {
  /**
   * Choose the best AI move using minimax with immediate win/block checks
   * @param {Array<string|null>} squares
   * @param {'X'|'O'} aiPlayer
   * @returns {number|null} index of move
   */
  const humanPlayer = aiPlayer === PLAYERS.X ? PLAYERS.O : PLAYERS.X;

  // 1) Win if possible
  for (const idx of getAvailableMoves(squares)) {
    const test = squares.slice();
    test[idx] = aiPlayer;
    if (calculateWinner(test).winner === aiPlayer) return idx;
  }
  // 2) Block immediate human win
  for (const idx of getAvailableMoves(squares)) {
    const test = squares.slice();
    test[idx] = humanPlayer;
    if (calculateWinner(test).winner === humanPlayer) return idx;
  }
  // 3) Minimax fallback
  const { move } = minimax(squares, true, aiPlayer, humanPlayer);
  return move;
}

/* === UI Components === */
function Badge({ color = COLORS.primary, children, title }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function Panel({ children }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid rgba(17,24,39,0.08)`,
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 10px 24px rgba(37,99,235,0.08)',
      }}
    >
      {children}
    </div>
  );
}

function Square({ value, onClick, highlight, disabled }) {
  const color = value === 'X' ? COLORS.primary : value === 'O' ? COLORS.secondary : '#6b7280';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cell ${value || 'empty'}`}
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: highlight ? `${COLORS.primary}0D` : COLORS.surface,
        border: `2px solid ${highlight ? COLORS.primary : 'rgba(17,24,39,0.1)'}`,
        borderRadius: 12,
        color,
        fontWeight: 800,
        fontSize: 'clamp(28px, 6vw, 48px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform .08s ease, box-shadow .2s ease, border-color .2s ease',
        boxShadow: highlight ? `0 8px 18px rgba(37,99,235,0.15)` : '0 3px 8px rgba(0,0,0,0.06)',
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {value}
    </button>
  );
}

function Board({ squares, onCellClick, winningLine, disabled }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        width: 'min(92vw, 520px)',
      }}
    >
      {squares.map((v, i) => (
        <Square
          key={i}
          value={v}
          onClick={() => onCellClick(i)}
          highlight={winningLine ? winningLine.includes(i) : false}
          disabled={disabled || v !== null}
        />
      ))}
    </div>
  );
}

/* === Main App === */
// PUBLIC_INTERFACE
function App() {
  /** Main Tic Tac Toe app with Ocean Professional theme and modes. */
  const [theme, setTheme] = useState('light');
  const [mode, setMode] = useState(MODES.AI);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [aiPlaysAs, setAiPlaysAs] = useState(PLAYERS.O); // default AI = O
  const current = history[step];

  const result = useMemo(() => calculateWinner(current), [current]);
  const hasWinner = !!result.winner;
  const tie = !hasWinner && isBoardFull(current);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const statusText = useMemo(() => {
    if (hasWinner) return `Winner: ${result.winner}`;
    if (tie) return "It's a tie!";
    return `Next: ${xIsNext ? 'X' : 'O'}`;
  }, [hasWinner, tie, result, xIsNext]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggles between light and dark document data-theme. */
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE
  const newGame = (keepMode = true) => {
    /** Resets board and state; optionally retains mode. */
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setXIsNext(true);
    if (!keepMode) {
      setMode(MODES.AI);
      setAiPlaysAs(PLAYERS.O);
    }
  };

  const handleMove = (index) => {
    if (hasWinner || tie || current[index] !== null) return;
    const next = current.slice();
    next[index] = xIsNext ? PLAYERS.X : PLAYERS.O;
    const nextHistory = history.slice(0, step + 1).concat([next]);
    setHistory(nextHistory);
    setStep(nextHistory.length - 1);
    setXIsNext(!xIsNext);
  };

  // AI Move effect
  useEffect(() => {
    if (mode !== MODES.AI) return;
    if (hasWinner || tie) return;

    const aiTurn = (xIsNext ? PLAYERS.X : PLAYERS.O) === aiPlaysAs;
    if (!aiTurn) return;

    // Delay slightly for UX
    const id = setTimeout(() => {
      const move = pickBestAIMove(current, aiPlaysAs);
      if (move !== null && current[move] === null) {
        handleMove(move);
      }
    }, 350);

    return () => clearTimeout(id);
  }, [mode, xIsNext, aiPlaysAs, current, hasWinner, tie]); // eslint-disable-line react-hooks/exhaustive-deps

  const canInteract = useMemo(() => {
    if (hasWinner || tie) return false;
    if (mode === MODES.PVP) return true;
    // PvAI: disable when it's AI's turn
    const nextSymbol = xIsNext ? PLAYERS.X : PLAYERS.O;
    return nextSymbol !== aiPlaysAs;
  }, [mode, hasWinner, tie, xIsNext, aiPlaysAs]);

  const headerGradient = `linear-gradient(180deg, rgba(37,99,235,0.08), rgba(249,250,251,0))`;

  return (
    <div
      className="App"
      style={{
        minHeight: '100vh',
        background: COLORS.background,
        color: COLORS.text,
      }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            padding: '16px clamp(16px, 5vw, 28px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: headerGradient,
            borderBottom: '1px solid rgba(17,24,39,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              aria-hidden
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background:
                  'conic-gradient(from 180deg at 50% 50%, rgba(37,99,235,0.25), rgba(245,158,11,0.25))',
                border: '1px solid rgba(17,24,39,0.1)',
                display: 'grid',
                placeItems: 'center',
                color: COLORS.primary,
                fontWeight: 800,
              }}
            >
              XO
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.2 }}>
                Ocean Tic Tac Toe
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Blue & amber accents</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge color={COLORS.primary} title="Application Theme">
              Theme: Ocean Professional
            </Badge>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                position: 'static',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            display: 'grid',
            placeItems: 'center',
            padding: 'clamp(16px, 4vw, 28px)',
          }}
        >
          <div
            style={{
              width: 'min(1100px, 96vw)',
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: 'clamp(16px, 4vw, 28px)',
            }}
          >
            {/* Board Section */}
            <Panel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: 'auto auto 1fr',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>
                      Game Board
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      Click a square to make your move.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge color={COLORS.primary}>X</Badge>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>vs</span>
                    <Badge color={COLORS.secondary}>O</Badge>
                  </div>
                </div>

                {/* Status */}
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid rgba(17,24,39,0.08)`,
                    background:
                      hasWinner
                        ? `${COLORS.success}15`
                        : tie
                        ? `${COLORS.error}10`
                        : `${COLORS.primary}08`,
                    color: hasWinner ? COLORS.success : tie ? COLORS.error : COLORS.primary,
                    fontWeight: 700,
                  }}
                >
                  {statusText}
                </div>

                {/* Board */}
                <Board
                  squares={current}
                  onCellClick={handleMove}
                  winningLine={result.line}
                  disabled={!canInteract}
                />
              </div>
            </Panel>

            {/* Options Panel */}
            <Panel>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>
                    Options
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    Start new games, switch modes, and configure AI.
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: '1fr 1fr',
                  }}
                >
                  <button
                    onClick={() => newGame(true)}
                    style={{
                      background: COLORS.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
                    }}
                  >
                    ⟳ New Game
                  </button>
                  <button
                    onClick={() => {
                      setMode((m) => (m === MODES.AI ? MODES.PVP : MODES.AI));
                      newGame(true);
                    }}
                    style={{
                      background: COLORS.secondary,
                      color: '#111827',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(245,158,11,0.25)',
                    }}
                  >
                    🔁 Switch Mode
                  </button>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px dashed rgba(17,24,39,0.12)',
                    background: '#f9fafb',
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Current Mode</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Badge color={mode === MODES.AI ? COLORS.primary : '#9CA3AF'}>
                      {MODES.AI}
                    </Badge>
                    <Badge color={mode === MODES.PVP ? COLORS.primary : '#9CA3AF'}>
                      {MODES.PVP}
                    </Badge>
                  </div>
                  {mode === MODES.AI && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>AI Plays As</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            setAiPlaysAs(PLAYERS.X);
                            setXIsNext(true);
                            newGame(true);
                          }}
                          style={{
                            flex: 1,
                            background:
                              aiPlaysAs === PLAYERS.X ? COLORS.primary : 'transparent',
                            color: aiPlaysAs === PLAYERS.X ? 'white' : COLORS.primary,
                            border: `2px solid ${COLORS.primary}`,
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          AI as X
                        </button>
                        <button
                          onClick={() => {
                            setAiPlaysAs(PLAYERS.O);
                            setXIsNext(true);
                            newGame(true);
                          }}
                          style={{
                            flex: 1,
                            background:
                              aiPlaysAs === PLAYERS.O ? COLORS.secondary : 'transparent',
                            color: aiPlaysAs === PLAYERS.O ? '#111827' : COLORS.secondary,
                            border: `2px solid ${COLORS.secondary}`,
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          AI as O
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>History</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {history.map((_, move) => {
                      const desc = move ? `Go to move #${move}` : 'Go to game start';
                      const active = move === step;
                      return (
                        <button
                          key={move}
                          onClick={() => {
                            setStep(move);
                            setXIsNext(move % 2 === 0); // X starts at step 0
                          }}
                          style={{
                            background: active ? `${COLORS.primary}` : 'transparent',
                            color: active ? 'white' : COLORS.primary,
                            border: `1px solid ${COLORS.primary}`,
                            borderRadius: 999,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title={desc}
                        >
                          {move}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: '16px clamp(16px, 5vw, 28px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderTop: '1px solid rgba(17,24,39,0.06)',
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            Ocean Professional • Modern UI • Responsive
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge color={COLORS.primary}>Blue</Badge>
            <Badge color={COLORS.secondary}>Amber</Badge>
            <Badge color={COLORS.error}>Error</Badge>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
