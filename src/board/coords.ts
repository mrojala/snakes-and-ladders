export const BOARD_SIZE = 10;
export const VIEWBOX = 1000;
export const CELL = VIEWBOX / BOARD_SIZE;

export function squareToRowCol(n: number): { row: number; col: number } {
  const row = Math.floor((n - 1) / BOARD_SIZE);
  const inRow = (n - 1) % BOARD_SIZE;
  const col = row % 2 === 0 ? inRow : BOARD_SIZE - 1 - inRow;
  return { row, col };
}

export function pixelCentre(n: number): { x: number; y: number } {
  const { row, col } = squareToRowCol(n);
  const x = col * CELL + CELL / 2;
  const y = (BOARD_SIZE - 1 - row) * CELL + CELL / 2;
  return { x, y };
}

// Position of a square's centre as percentages of the board's own width/height.
// Handy for tokens (placed via left/top in %) so they don't depend on the SVG viewBox.
export function boardPercent(n: number): { xPct: number; yPct: number } {
  const { row, col } = squareToRowCol(n);
  const step = 100 / BOARD_SIZE;
  return {
    xPct: col * step + step / 2,
    yPct: (BOARD_SIZE - 1 - row) * step + step / 2,
  };
}
