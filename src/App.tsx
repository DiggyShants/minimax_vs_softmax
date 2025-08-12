
import React, { useMemo, useState } from 'react'
import type { Board, Player } from './types'
import BoardView from './components/Board'
import { minimaxDecide } from './ai/minimax'
import { policyDecide } from './ai/tinyPolicy'

type Mode = 'Rule-based (Minimax)' | 'Learned (Tiny Policy)'

const emptyBoard: Board = Array(9).fill(null)

function winner(b: Board): Player | 'Draw' | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,c,d] of lines) {
    if (b[a] && b[a] === b[c] && b[c] === b[d]) return b[a]!;
  }
  if (b.every(x => x)) return 'Draw';
  return null;
}

function other(p: Player): Player { return p === 'X' ? 'O' : 'X'; }

export default function App(){
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [human, setHuman] = useState<Player>('X');
  const [mode, setMode] = useState<Mode>('Rule-based (Minimax)');
  const [nodesExpanded, setNodesExpanded] = useState(0);
  const [decisionMs, setDecisionMs] = useState<number>(0);
  const [bestLine, setBestLine] = useState<number[]|undefined>(undefined);
  const [probs, setProbs] = useState<number[]|undefined>(undefined);
  const turn = useMemo(() => {
    const xCount = board.filter(c=>c==='X').length;
    const oCount = board.filter(c=>c==='O').length;
    return xCount===oCount ? 'X' : 'O';
  }, [board]);

  const w = winner(board);

  const reset = () => {
    setBoard(emptyBoard);
    setNodesExpanded(0);
    setDecisionMs(0);
    setBestLine(undefined);
    setProbs(undefined);
  }

  const makeAIMove = () => {
    const me: Player = other(human);
    if (winner(board) || turn !== me) return;

    const t0 = performance.now();
    if (mode === 'Rule-based (Minimax)'){
      const { move, nodesExpanded, bestLine } = minimaxDecide(board, me);
      const t1 = performance.now();
      setDecisionMs(t1 - t0);
      setNodesExpanded(nodesExpanded);
      setBestLine(bestLine);
      setProbs(undefined);
      if (move>=0){
        const nb = [...board];
        nb[move] = me;
        setBoard(nb);
      }
    } else {
      const { move, probs } = policyDecide(board, me);
      const t1 = performance.now();
      setDecisionMs(t1 - t0);
      setNodesExpanded(0);
      setBestLine(undefined);
      setProbs(probs);
      if (move>=0){
        const nb = [...board];
        nb[move] = me;
        setBoard(nb);
      }
    }
  }

  const handleClick = (i: number) => {
    if (w) return;
    if (board[i]) return;
    if (turn !== human) return;
    const nb = [...board];
    nb[i] = human;
    setBoard(nb);
    // Let AI move next tick to allow state update / re-render
    setTimeout(makeAIMove, 50);
  }

  const status = w ? (w==='Draw' ? 'Draw!' : `${w} wins!`) : `${turn}'s turn`;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-6">
      <header className="max-w-3xl w-full">
        <h1 className="text-2xl font-bold">Two Ways to Think: Rules vs. Learning</h1>
        <p className="text-sm opacity-80 mt-1">Play Tic‑Tac‑Toe against a rule-based Minimax planner or a tiny learned-like policy. Watch the inspector to see how each decides.</p>
      </header>

      <main className="grid md:grid-cols-[auto,1fr] gap-8 w-full max-w-5xl">
        <section className="flex flex-col items-center gap-3">
          <BoardView board={board} onClick={handleClick} bestLine={bestLine} probs={probs} />
          <div className="flex gap-2">
            <button className="button" onClick={reset}>Reset</button>
            <button className="button" onClick={() => { setHuman(h=>h==='X'?'O':'X'); reset(); }}>Human: {human}</button>
            <select
              className="button"
              value={mode}
              onChange={(e)=>{ setMode(e.target.value as Mode); reset(); }}
              aria-label="Mode"
            >
              <option>Rule-based (Minimax)</option>
              <option>Learned (Tiny Policy)</option>
            </select>
          </div>
          <div className="text-lg font-semibold">{status}</div>
        </section>

        <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 h-fit">
          <h2 className="font-semibold mb-2">Inspector</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="opacity-70">Mode</dt><dd>{mode}</dd>
            <dt className="opacity-70">Human plays</dt><dd>{human}</dd>
            <dt className="opacity-70">Decision time</dt><dd>{decisionMs.toFixed(2)} ms</dd>
            <dt className="opacity-70">Nodes expanded</dt><dd>{nodesExpanded}</dd>
          </dl>
          <div className="mt-3 text-sm opacity-80">
            {mode === 'Rule-based (Minimax)' ? (
              <p>
                Minimax searches the game tree to choose a move. <strong>Nodes expanded</strong> shows how many states it examined. The highlighted squares show its current best line (principal variation).
              </p>
            ) : (
              <p>
                The tiny policy picks moves from a <strong>probability distribution</strong> (shown on each square). It doesn’t search; it recognizes patterns and acts directly.
              </p>
            )}
          </div>
        </aside>
      </main>

      <footer className="opacity-70 text-sm mt-8">
        Tip: switch who goes first and compare decision time & behavior between modes.
      </footer>
    </div>
  )
}
