import { fi } from '../i18n';

export type PlayerCount = 1 | 2 | 3 | 4;
export type Phase = 'idle' | 'animating' | 'won';

export type Player = {
  id: number;       // 0..3
  name: string;
  colour: string;
  isCpu: boolean;
  position: number; // 0 = start (off-board), 1..100 on board
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  lastRoll: number | null;
  phase: Phase;
  winner: Player | null;
};

export type GameChoice =
  | { mode: 'players'; count: PlayerCount }
  | { mode: 'auto' };

export const PLAYER_COLOURS = ['#e03a3a', '#2b78e6', '#4aa53a', '#f2c832'] as const;

export function newGame(choice: GameChoice): GameState {
  const players: Player[] = [];

  if (choice.mode === 'auto') {
    players.push(makePlayer(0, fi.aiName(1), true));
    players.push(makePlayer(1, fi.aiName(2), true));
  } else if (choice.count === 1) {
    players.push(makePlayer(0, fi.playerName(1), false));
    players.push(makePlayer(1, fi.computerName, true));
  } else {
    for (let i = 0; i < choice.count; i++) {
      players.push(makePlayer(i, fi.playerName(i + 1), false));
    }
  }

  return {
    players,
    currentPlayerIndex: 0,
    lastRoll: null,
    phase: 'idle',
    winner: null,
  };
}

function makePlayer(id: number, name: string, isCpu: boolean): Player {
  return { id, name, colour: PLAYER_COLOURS[id], isCpu, position: 0 };
}
