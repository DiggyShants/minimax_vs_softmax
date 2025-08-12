
import React from 'react'
import type { Board } from '../types'

type Props = {
  board: Board;
  onClick: (idx: number) => void;
  bestLine?: number[];
  probs?: number[];
}

export default function Board({ board, onClick, bestLine, probs }: Props){
  return (
    <div className="grid grid-cols-3 gap-2 w-64">
      {board.map((cell, i) => {
        const inBest = bestLine?.includes(i);
        const prob = probs?.[i] ?? null;
        return (
          <button
            key={i}
            className={`h-20 rounded-xl border text-3xl font-semibold flex items-center justify-center
            ${inBest ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 dark:border-gray-700'}
            ${!cell ? 'hover:bg-gray-50 dark:hover:bg-gray-900' : ''}`}
            onClick={() => onClick(i)}
            disabled={!!cell}
            aria-label={`cell ${i}`}
            title={prob!=null ? `p=${prob.toFixed(2)}` : ''}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {cell ?? ''}
              {prob!=null && !cell && (
                <div className="absolute bottom-1 text-xs opacity-70">{prob.toFixed(2)}</div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
