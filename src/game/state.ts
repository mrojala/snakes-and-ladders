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

export type PlayerConfig = { name: string; isAi: boolean };
export type GameChoice = { players: PlayerConfig[] };

export const PLAYER_COLOURS = ['#e03a3a', '#2b78e6', '#4aa53a', '#f2c832'] as const;

export function newGame(choice: GameChoice): GameState {
  const players: Player[] = choice.players.map((p, id) => ({
    id,
    name: p.name,
    colour: PLAYER_COLOURS[id],
    isCpu: p.isAi,
    position: 0,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    lastRoll: null,
    phase: 'idle',
    winner: null,
  };
}
