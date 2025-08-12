
import type { Board, Player } from '../types'

// A tiny, hand-crafted "policy" that behaves like a learned model:
// - prefers center, then corners, avoids illegal moves
// - slightly biases to block opponent forks
// It returns move probabilities and the selected move.
export type PolicyResult = {
  move: number;
  probs: number[]; // length 9
}

function softmax(z: number[]): number[] {
  const m = Math.max(...z);
  const ex = z.map(v => Math.exp(v - m));
  const s = ex.reduce((a,b)=>a+b,0);
  return ex.map(v => v/s);
}

function other(p: Player): Player { return p === 'X' ? 'O' : 'X'; }

export function policyDecide(board: Board, me: Player): PolicyResult {
  // Base preferences: center > corners > edges
  const base = [0.4, 0.2, 0.4,
                0.2, 1.0, 0.2,
                0.4, 0.2, 0.4];

  // Penalize occupied, add simple tactical features
  const feats = base.slice();
  for (let i=0;i<9;i++){
    if (board[i]) feats[i] = -999; // illegal
  }

  // Try to win/block: add a small logit boost for completing/ blocking 2-in-a-row
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const L of lines){
    const cells = L.map(i => board[i]);
    const myCount = cells.filter(c => c===me).length;
    const oppCount = cells.filter(c => c===other(me)).length;
    const empties = L.filter(i => !board[i]);
    if (empties.length === 1){
      const e = empties[0];
      if (myCount === 2) feats[e] += 2.0; // win
      if (oppCount === 2) feats[e] += 1.5; // block
    }
  }

  const probs = softmax(feats);
  // pick argmax
  let best = -1, bestVal = -1;
  for (let i=0;i<9;i++){
    if (!board[i] && probs[i] > bestVal){ bestVal = probs[i]; best = i; }
  }
  return { move: best, probs };
}
