import { boardPercent } from '../board/coords';

export type TokensLayer = {
  element: HTMLDivElement;
  placeAt: (playerId: number, position: number) => void;
  animatePath: (playerId: number, path: number[], stepMs?: number) => Promise<void>;
};

export function createTokensLayer(colours: readonly string[]): TokensLayer {
  const layer = document.createElement('div');
  layer.className = 'tokens-layer';

  const tokens: HTMLDivElement[] = colours.map((colour, id) => {
    const t = document.createElement('div');
    t.className = 'token';
    t.style.backgroundColor = colour;
    t.dataset.playerId = String(id);
    const { dx, dy } = clusterOffset(id, colours.length);
    t.style.setProperty('--offset-x', `${dx}px`);
    t.style.setProperty('--offset-y', `${dy}px`);
    layer.appendChild(t);
    return t;
  });

  function placeAt(playerId: number, position: number): void {
    const t = tokens[playerId];
    if (position === 0) {
      // Start zone: evenly distributed along the row just below the board.
      const slots = colours.length;
      const gap = 80 / Math.max(slots, 1);
      t.style.left = `${10 + playerId * gap + gap / 2}%`;
      t.style.top = `108%`;
    } else {
      const { xPct, yPct } = boardPercent(position);
      t.style.left = `${xPct}%`;
      t.style.top = `${yPct}%`;
    }
  }

  async function animatePath(playerId: number, path: number[], stepMs = 180): Promise<void> {
    for (const pos of path) {
      placeAt(playerId, pos);
      await wait(stepMs);
    }
  }

  return { element: layer, placeAt, animatePath };
}

function clusterOffset(id: number, total: number): { dx: number; dy: number } {
  if (total <= 1) return { dx: 0, dy: 0 };
  const angle = (id / total) * Math.PI * 2 - Math.PI / 2;
  const r = 9;
  return { dx: Math.cos(angle) * r, dy: Math.sin(angle) * r };
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
