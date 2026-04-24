import { boardPercent } from '../board/coords';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type TokenSpec = { colour: string; name: string };

export type TokensLayer = {
  element: HTMLDivElement;
  placeAt: (playerId: number, position: number) => void;
  animatePath: (playerId: number, path: number[], stepMs?: number) => Promise<void>;
  glideTo: (playerId: number, position: number, durationMs: number) => Promise<void>;
  setActive: (playerId: number | null) => void;
  setName: (playerId: number, name: string) => void;
};

export function createTokensLayer(specs: readonly TokenSpec[]): TokensLayer {
  const layer = document.createElement('div');
  layer.className = 'tokens-layer';

  const tokens: Array<{ root: HTMLDivElement; label: HTMLSpanElement }> = specs.map((spec, id) => {
    const root = document.createElement('div');
    root.className = 'token';
    root.style.setProperty('--token-colour', spec.colour);
    root.dataset.playerId = String(id);

    root.appendChild(createPawnSvg());

    const label = document.createElement('span');
    label.className = 'token-label';
    label.textContent = spec.name;
    root.appendChild(label);

    layer.appendChild(root);
    return { root, label };
  });

  function placeAt(playerId: number, position: number): void {
    const { root } = tokens[playerId];
    if (position === 0) {
      const slots = specs.length;
      const gap = 80 / Math.max(slots, 1);
      root.style.left = `${10 + playerId * gap + gap / 2}%`;
      root.style.top = `112%`;
      root.style.setProperty('--offset-x', `0px`);
      root.style.setProperty('--offset-y', `0px`);
    } else {
      const { xPct, yPct } = boardPercent(position);
      root.style.left = `${xPct}%`;
      root.style.top = `${yPct}%`;
      const { dx, dy } = clusterOffset(playerId, specs.length);
      root.style.setProperty('--offset-x', `${dx}px`);
      root.style.setProperty('--offset-y', `${dy}px`);
    }
    // Re-append so the most recently moved token is the last DOM child,
    // which puts it on top when multiple tokens share a square.
    layer.appendChild(root);
  }

  async function animatePath(playerId: number, path: number[], stepMs = 180): Promise<void> {
    for (const pos of path) {
      placeAt(playerId, pos);
      await wait(stepMs);
    }
  }

  async function glideTo(playerId: number, position: number, durationMs: number): Promise<void> {
    const { root } = tokens[playerId];
    root.style.transition = `left ${durationMs}ms ease-in-out, top ${durationMs}ms ease-in-out`;
    placeAt(playerId, position);
    await wait(durationMs);
    root.style.transition = '';
  }

  function setActive(playerId: number | null): void {
    tokens.forEach(({ root }, id) => {
      root.classList.toggle('token--active', id === playerId);
    });
  }

  function setName(playerId: number, name: string): void {
    tokens[playerId].label.textContent = name;
  }

  return { element: layer, placeAt, animatePath, glideTo, setActive, setName };
}

function clusterOffset(id: number, total: number): { dx: number; dy: number } {
  if (total <= 1) return { dx: 0, dy: 0 };
  const angle = (id / total) * Math.PI * 2 - Math.PI / 2;
  const r = 10;
  return { dx: Math.cos(angle) * r, dy: Math.sin(angle) * r };
}

function createPawnSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'token-pawn');
  svg.setAttribute('viewBox', '0 0 60 80');
  svg.setAttribute('aria-hidden', 'true');

  // Base shadow underneath the pawn (painted first so pawn sits on top).
  const shadow = document.createElementNS(SVG_NS, 'ellipse');
  shadow.setAttribute('cx', '30');
  shadow.setAttribute('cy', '74');
  shadow.setAttribute('rx', '20');
  shadow.setAttribute('ry', '4');
  shadow.setAttribute('class', 'pawn-shadow');
  svg.appendChild(shadow);

  // Body (shoulders + base as one shape).
  const body = document.createElementNS(SVG_NS, 'path');
  body.setAttribute(
    'd',
    'M 30 34 Q 46 34 48 52 Q 50 62 46 66 Q 54 70 52 74 L 8 74 Q 6 70 14 66 Q 10 62 12 52 Q 14 34 30 34 Z',
  );
  body.setAttribute('class', 'pawn-body');
  svg.appendChild(body);

  // Head.
  const head = document.createElementNS(SVG_NS, 'circle');
  head.setAttribute('cx', '30');
  head.setAttribute('cy', '18');
  head.setAttribute('r', '13');
  head.setAttribute('class', 'pawn-head');
  svg.appendChild(head);

  // Collar (the narrow waist between head and body).
  const collar = document.createElementNS(SVG_NS, 'ellipse');
  collar.setAttribute('cx', '30');
  collar.setAttribute('cy', '34');
  collar.setAttribute('rx', '10');
  collar.setAttribute('ry', '2.5');
  collar.setAttribute('class', 'pawn-collar');
  svg.appendChild(collar);

  return svg;
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
