import { LADDERS, SNAKES } from '../board/config';
import type { GameState } from './state';

export type MoveEvent =
  | { type: 'stepped'; playerId: number; from: number; to: number }
  | { type: 'bounced'; playerId: number; from: number; to: number }
  | { type: 'slid'; playerId: number; from: number; to: number }
  | { type: 'climbed'; playerId: number; from: number; to: number }
  | { type: 'won'; playerId: number };

export const FINISH = 100;

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function applyRoll(state: GameState, roll: number): {
  state: GameState;
  events: MoveEvent[];
} {
  if (state.phase === 'won') return { state, events: [] };

  const current = state.players[state.currentPlayerIndex];
  const from = current.position;
  const target = from + roll;
  const events: MoveEvent[] = [];
  let finalPos: number;

  if (target > FINISH) {
    // Bounce back from 100: overshoot by k means land at (100 − k) = (200 − target).
    finalPos = 2 * FINISH - target;
    events.push({ type: 'bounced', playerId: current.id, from, to: finalPos });
  } else {
    finalPos = target;
    events.push({ type: 'stepped', playerId: current.id, from, to: finalPos });
  }

  const snake = SNAKES.find((s) => s.head === finalPos);
  const ladder = LADDERS.find((l) => l.base === finalPos);
  if (snake) {
    events.push({ type: 'slid', playerId: current.id, from: finalPos, to: snake.tail });
    finalPos = snake.tail;
  } else if (ladder) {
    events.push({ type: 'climbed', playerId: current.id, from: finalPos, to: ladder.top });
    finalPos = ladder.top;
  }

  if (finalPos === FINISH) {
    events.push({ type: 'won', playerId: current.id });
  }

  const players = state.players.map((p) =>
    p.id === current.id ? { ...p, position: finalPos } : p,
  );
  const hasWon = finalPos === FINISH;
  const winner = hasWon ? players.find((p) => p.id === current.id) ?? null : null;

  return {
    state: {
      ...state,
      players,
      lastRoll: roll,
      phase: hasWon ? 'won' : 'idle',
      winner,
      currentPlayerIndex: hasWon
        ? state.currentPlayerIndex
        : (state.currentPlayerIndex + 1) % state.players.length,
    },
    events,
  };
}
