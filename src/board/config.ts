export type Snake = { head: number; tail: number; colour: string };
export type Ladder = { base: number; top: number };

export const SNAKES: ReadonlyArray<Snake> = [
  { head: 98, tail: 79, colour: '#c2453a' },
  { head: 95, tail: 75, colour: '#3c2a6a' },
  { head: 93, tail: 73, colour: '#c9a44e' },
  { head: 87, tail: 24, colour: '#1a2048' },
  { head: 64, tail: 60, colour: '#d94a2e' },
  { head: 62, tail: 19, colour: '#d65a8a' },
  { head: 54, tail: 34, colour: '#b88f5a' },
  { head: 17, tail: 7,  colour: '#4a7a3a' },
];

export const LADDERS: ReadonlyArray<Ladder> = [
  { base: 1,  top: 38  },
  { base: 4,  top: 14  },
  { base: 9,  top: 31  },
  { base: 21, top: 42  },
  { base: 28, top: 84  },
  { base: 36, top: 55  },
  { base: 51, top: 67  },
  { base: 71, top: 91  },
  { base: 80, top: 100 },
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
