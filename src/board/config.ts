export type Snake = { head: number; tail: number; colour: string };
export type Ladder = { base: number; top: number };

export const SNAKES: ReadonlyArray<Snake> = [
  { head: 98, tail: 79, colour: '#c2453a' },
  { head: 95, tail: 75, colour: '#3c2a6a' },
  { head: 93, tail: 73, colour: '#c9a44e' },
  { head: 66, tail: 23, colour: '#2a2a3e' },
  { head: 62, tail: 59, colour: '#d94a2e' },
  { head: 54, tail: 34, colour: '#b88f5a' },
  { head: 17, tail: 5,  colour: '#4a7a3a' },
];

export const LADDERS: ReadonlyArray<Ladder> = [
  { base: 4,  top: 14  },
  { base: 11, top: 30  },
  { base: 21, top: 42  },
  { base: 36, top: 55  },
  { base: 51, top: 67  },
  { base: 81, top: 100 },
];

// Index 0 = bottom row (squares 1-10), 9 = top row (91-100). Matches the photo.
export const ROW_COLOURS: ReadonlyArray<string> = [
  '#d73a3a', // row 1 red
  '#d73a3a', // row 2 red
  '#e06a2a', // row 3 orange
  '#e6b038', // row 4 yellow
  '#a7d066', // row 5 light green
  '#58a858', // row 6 mid green
  '#2a6a38', // row 7 dark green
  '#7fb968', // row 8 green
  '#7ec8e3', // row 9 light blue
  '#5ab0da', // row 10 mid blue
];
