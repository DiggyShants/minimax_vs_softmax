
# Two Ways to Think: Rules vs. Learning (Starter)

A classroom‑friendly React + Vite + TypeScript demo showing the difference between:
- **Rule-based / search**: Minimax for Tic‑Tac‑Toe
- **Learned‑like policy**: a tiny, hand‑crafted softmax policy that behaves like a learned model (no heavy ML deps)

## Local Dev
```bash
npm install
npm run dev
```

## Deploy (Vercel)
1. Push this folder to a new GitHub repo.
2. On vercel.com, **Import Project** and select your repo.
3. Build command: `npm run build`  
   Output directory: `dist`
4. Deploy. That’s it.

## What to Look For
- Switch between **Rule-based (Minimax)** and **Learned (Tiny Policy)** in the dropdown.
- Inspector shows decision time and, for Minimax, **nodes expanded** and best line.  
- The policy overlays **probabilities** on the board squares.

## Stretch Ideas
- Add a Maze Runner demo (A* vs DQN).
- Replace the tiny policy with a real tf.js model (keep it small!).
- Show energy/latency trade‑offs and data‑hunger indicators.
