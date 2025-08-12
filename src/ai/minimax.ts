
import type { Board, Player } from '../types'

export type MinimaxResult = {
  move: number;
  nodesExpanded: number;
  bestLine: number[];
}

const lines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function winner(b: Board): Player | 'Draw' | null {
  for (const [a,c,d] of lines) {
    if (b[a] && b[a] === b[c] && b[c] === b[d]) return b[a];
  }
  if (b.every(x => x)) return 'Draw';
  return null;
}

function availableMoves(b: Board): number[] {
  const m: number[] = [];
  for (let i=0;i<9;i++) if (!b[i]) m.push(i);
  return m;
}

function clone(b: Board): Board { return [...b]; }

function other(p: Player): Player { return p === 'X' ? 'O' : 'X'; }

function scoreResult(res: Player | 'Draw' | null, maxPlayer: Player): number {
  if (res === maxPlayer) return 1;
  if (res && res !== 'Draw') return -1;
  return 0;
}

export function minimaxDecide(board: Board, player: Player): MinimaxResult {
  let nodes = 0;
  const memo = new Map<string, {score:number, best:number[]}>();

  function key(b: Board, p: Player){ return b.map(c=>c??'-').join('')+p; }

  function mm(b: Board, p: Player, maxP: Player): {score:number, best:number[]} {
    const w = winner(b);
    if (w) return { score: scoreResult(w, maxP), best: [] };
    const k = key(b,p);
    const m = memo.get(k);
    if (m) return m;

    nodes++;
    let bestMove = -1;
    let bestScore = p===maxP ? -Infinity : Infinity;
    let bestLine: number[] = [];

    for (const mv of availableMoves(b)) {
      const nb = clone(b);
      nb[mv] = p;
      const child = mm(nb, other(p), maxP);
      const sc = child.score;
      if (p===maxP) {
        if (sc > bestScore) { bestScore = sc; bestMove = mv; bestLine = [mv, ...child.best]; }
      } else {
        if (sc < bestScore) { bestScore = sc; bestMove = mv; bestLine = [mv, ...child.best]; }
      }
    }
    const res = { score: bestScore, best: bestLine };
    memo.set(k, res);
    return res;
  }

  const {best} = mm(board, player, player);
  const move = best.length ? best[0] : (availableMoves(board)[0] ?? -1);
  return { move, nodesExpanded: nodes, bestLine: best };
}
