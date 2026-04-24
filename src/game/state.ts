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

export type PlayerConfig = { name: string; isAi: boolean; colour: string };
export type GameChoice = { players: PlayerConfig[] };

// Order matches defaultPlayerNames: Anna yellow, Aino purple, Markus blue, Sonja red.
export const PLAYER_COLOURS = ['#f2c832', '#7c4fbd', '#2b78e6', '#e03a3a'] as const;

export const COLOUR_PALETTE = [
  '#e03a3a', // red
  '#f58f3a', // orange
  '#f2c832', // yellow
  '#4aa53a', // green
  '#34c8b8', // teal
  '#2b78e6', // blue
  '#7c4fbd', // purple
  '#e066c3', // magenta
  '#8a1a1a', // dark red
  '#9a6033', // brown
  '#b4b02a', // olive
  '#1e5a20', // dark green
  '#0e3a78', // navy
  '#4a2478', // indigo
  '#f8a0b8', // light pink
  '#e8e8e8', // white
] as const;

export function newGame(choice: GameChoice): GameState {
  const players: Player[] = choice.players.map((p, id) => ({
    id,
    name: p.name,
    colour: p.colour,
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
