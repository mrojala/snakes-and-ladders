export type Snake = {
  head: number;
  tail: number;
  colour: string;
  // Optional list of squares the body winds through, head → tail (inclusive).
  // When omitted the renderer falls back to a sinusoidal curve between head/tail.
  path?: readonly number[];
};
export type Ladder = { base: number; top: number };

export const SNAKES: ReadonlyArray<Snake> = [
  { head: 98, tail: 79, colour: '#c2453a', path: [98, 82, 79] },
  { head: 95, tail: 75, colour: '#3c2a6a', path: [95, 85, 75] },
  { head: 93, tail: 73, colour: '#c9a44e', path: [93, 87, 73] },
  // Big winder from top-right down across the middle to the bottom-left.
  { head: 87, tail: 24, colour: '#1a2048', path: [87, 66, 55, 46, 37, 25, 24] },
  { head: 64, tail: 60, colour: '#d94a2e', path: [64, 62, 60] },
  // Long pink snake winding down. Routes through col 2 to stay off the
  // 21→42 ladder, tucking back in to 19 only at the very end.
  { head: 62, tail: 19, colour: '#d65a8a', path: [62, 43, 38, 23, 18, 19] },
  { head: 54, tail: 34, colour: '#b88f5a', path: [54, 46, 34] },
  { head: 17, tail: 7,  colour: '#4a7a3a', path: [17, 16, 5, 6, 7] },
];

export const LADDERS: ReadonlyArray<Ladder> = [
  { base: 1,  top: 38  },
  { base: 4,  top: 14  },
  { base: 9,  top: 31  },
  { base: 21, top: 42  },
  { base: 28, top: 84  },
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
