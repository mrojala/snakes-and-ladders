import type { GameState } from './state';

export type MoveEvent =
  | { type: 'stepped'; playerId: number; from: number; to: number }
  | { type: 'stayed'; playerId: number };

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// PR 2: plain forward movement with overshoot-stay. No snake/ladder effects,
// no win detection — those land in PR 3.
export function applyRoll(state: GameState, roll: number): {
  state: GameState;
  events: MoveEvent[];
} {
  const current = state.players[state.currentPlayerIndex];
  const from = current.position;
  const target = from + roll;
  const events: MoveEvent[] = [];

  let to = target;
  if (target > 100) {
    to = from;
    events.push({ type: 'stayed', playerId: current.id });
  } else {
    events.push({ type: 'stepped', playerId: current.id, from, to });
  }

  const players = state.players.map((p) =>
    p.id === current.id ? { ...p, position: to } : p,
  );
  const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    state: {
      ...state,
      players,
      currentPlayerIndex: nextIdx,
      lastRoll: roll,
    },
    events,
  };
}
