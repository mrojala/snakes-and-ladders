import { BOARD_SIZE, VIEWBOX, pixelCentre, squareToRowCol } from './coords';
import { LADDERS, ROW_COLOURS, SNAKES } from './config';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function createBoard(): HTMLDivElement {
  const boardEl = document.createElement('div');
  boardEl.className = 'board';

  for (let n = 1; n <= BOARD_SIZE * BOARD_SIZE; n++) {
    boardEl.appendChild(makeCell(n));
  }
  boardEl.appendChild(renderOverlay());
  return boardEl;
}

function makeCell(n: number): HTMLDivElement {
  const { row, col } = squareToRowCol(n);
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.square = String(n);
  cell.style.gridRow = String(BOARD_SIZE - row);
  cell.style.gridColumn = String(col + 1);
  cell.style.backgroundColor = ROW_COLOURS[row];

  const num = document.createElement('span');
  num.className = 'cell-number';
  num.textContent = String(n);
  cell.appendChild(num);
  return cell;
}

function renderOverlay(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'overlay');
  svg.setAttribute('viewBox', `0 0 ${VIEWBOX} ${VIEWBOX}`);

  for (const ladder of LADDERS) {
    svg.appendChild(renderLadder(ladder.base, ladder.top));
  }
  SNAKES.forEach((snake, i) => {
    svg.appendChild(renderSnake(snake.head, snake.tail, snake.colour, i));
  });
  return svg;
}

function renderLadder(baseSquare: number, topSquare: number): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', 'ladder');

  const a = pixelCentre(baseSquare);
  const b = pixelCentre(topSquare);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;

  const rail = 16;
  const a1 = { x: a.x + px * rail, y: a.y + py * rail };
  const a2 = { x: a.x - px * rail, y: a.y - py * rail };
  const b1 = { x: b.x + px * rail, y: b.y + py * rail };
  const b2 = { x: b.x - px * rail, y: b.y - py * rail };

  for (const [p, q] of [[a1, b1], [a2, b2]] as const) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(p.x));
    line.setAttribute('y1', String(p.y));
    line.setAttribute('x2', String(q.x));
    line.setAttribute('y2', String(q.y));
    line.setAttribute('class', 'ladder-rail');
    g.appendChild(line);
  }

  const rungSpacing = 32;
  const rungCount = Math.max(2, Math.floor(len / rungSpacing));
  for (let i = 1; i < rungCount; i++) {
    const t = i / rungCount;
    const s = { x: a1.x + (b1.x - a1.x) * t, y: a1.y + (b1.y - a1.y) * t };
    const e = { x: a2.x + (b2.x - a2.x) * t, y: a2.y + (b2.y - a2.y) * t };
    const rung = document.createElementNS(SVG_NS, 'line');
    rung.setAttribute('x1', String(s.x));
    rung.setAttribute('y1', String(s.y));
    rung.setAttribute('x2', String(e.x));
    rung.setAttribute('y2', String(e.y));
    rung.setAttribute('class', 'ladder-rung');
    g.appendChild(rung);
  }
  return g;
}

// Per-snake stripe patterns: bands perpendicular to the body, varied across snakes.
const STRIPE_PATTERNS: Array<{ spacing: number; width: number; halfBand: number; colour: string }> = [
  { spacing: 18, width: 4,   halfBand: 6, colour: '#f5e6c0' },
  { spacing: 24, width: 5,   halfBand: 7, colour: '#ffe8a0' },
  { spacing: 14, width: 3.5, halfBand: 6, colour: '#fff4d0' },
  { spacing: 20, width: 4.5, halfBand: 7, colour: '#e7f2e0' },
  { spacing: 26, width: 5,   halfBand: 7, colour: '#f0e0c0' },
  { spacing: 16, width: 3.5, halfBand: 5, colour: '#ffe4c8' },
];

function renderSnake(
  headSquare: number,
  tailSquare: number,
  colour: string,
  index: number,
): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', 'snake');

  const h = pixelCentre(headSquare);
  const t = pixelCentre(tailSquare);

  const dx = t.x - h.x;
  const dy = t.y - h.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  // Sinusoidal path: more twists and more amplitude for longer snakes.
  const twists = Math.max(2, Math.round(len / 80));
  const amplitude = Math.min(54, len * 0.2);
  const samples = Math.max(40, twists * 22);

  let d = `M ${h.x} ${h.y}`;
  let firstStepX = h.x;
  let firstStepY = h.y;
  for (let i = 1; i <= samples; i++) {
    const s = i / samples;
    const along = s * len;
    const off = amplitude * Math.sin(s * twists * Math.PI);
    const x = h.x + ux * along + px * off;
    const y = h.y + uy * along + py * off;
    d += ` L ${x} ${y}`;
    if (i === 1) {
      firstStepX = x;
      firstStepY = y;
    }
  }

  // Dark outer outline for depth.
  const bodyOutline = document.createElementNS(SVG_NS, 'path');
  bodyOutline.setAttribute('d', d);
  bodyOutline.setAttribute('class', 'snake-outline');
  g.appendChild(bodyOutline);

  const body = document.createElementNS(SVG_NS, 'path');
  body.setAttribute('d', d);
  body.setAttribute('class', 'snake-body');
  body.setAttribute('stroke', colour);
  g.appendChild(body);

  const pattern = STRIPE_PATTERNS[index % STRIPE_PATTERNS.length];
  const bandCount = Math.max(3, Math.floor(len / pattern.spacing));
  for (let i = 1; i < bandCount; i++) {
    const s = i / bandCount;
    const along = s * len;
    const off = amplitude * Math.sin(s * twists * Math.PI);
    const bx = h.x + ux * along + px * off;
    const by = h.y + uy * along + py * off;

    // Tangent via finite difference along the parametric curve.
    const nextS = Math.min(1, s + 0.005);
    const nextAlong = nextS * len;
    const nextOff = amplitude * Math.sin(nextS * twists * Math.PI);
    const tx = h.x + ux * nextAlong + px * nextOff - bx;
    const ty = h.y + uy * nextAlong + py * nextOff - by;
    const tlen = Math.hypot(tx, ty) || 1;
    const bandPerpX = -ty / tlen;
    const bandPerpY = tx / tlen;

    const stripe = document.createElementNS(SVG_NS, 'line');
    stripe.setAttribute('x1', String(bx + bandPerpX * pattern.halfBand));
    stripe.setAttribute('y1', String(by + bandPerpY * pattern.halfBand));
    stripe.setAttribute('x2', String(bx - bandPerpX * pattern.halfBand));
    stripe.setAttribute('y2', String(by - bandPerpY * pattern.halfBand));
    stripe.setAttribute('class', 'snake-stripe');
    stripe.setAttribute('stroke', pattern.colour);
    stripe.setAttribute('stroke-width', String(pattern.width));
    g.appendChild(stripe);
  }

  // Tangent at head, from head toward the first sampled point on the body.
  const bodyDx = firstStepX - h.x;
  const bodyDy = firstStepY - h.y;
  const bodyLen = Math.hypot(bodyDx, bodyDy) || 1;
  const bodyDirX = bodyDx / bodyLen;
  const bodyDirY = bodyDy / bodyLen;
  const tongueDx = -bodyDirX;
  const tongueDy = -bodyDirY;
  const headAngle = (Math.atan2(bodyDirY, bodyDirX) * 180) / Math.PI;

  const head = document.createElementNS(SVG_NS, 'ellipse');
  head.setAttribute('cx', String(h.x));
  head.setAttribute('cy', String(h.y));
  head.setAttribute('rx', '22');
  head.setAttribute('ry', '15');
  head.setAttribute('class', 'snake-head');
  head.setAttribute('fill', colour);
  head.setAttribute('transform', `rotate(${headAngle} ${h.x} ${h.y})`);
  g.appendChild(head);

  // Forked tongue extending out the front of the head.
  const tongueBase = { x: h.x + tongueDx * 20, y: h.y + tongueDy * 20 };
  const tongueFork = { x: h.x + tongueDx * 30, y: h.y + tongueDy * 30 };
  const forkAngle = Math.PI / 5;
  const cosA = Math.cos(forkAngle);
  const sinA = Math.sin(forkAngle);
  const leftX = tongueDx * cosA - tongueDy * sinA;
  const leftY = tongueDx * sinA + tongueDy * cosA;
  const rightX = tongueDx * cosA + tongueDy * sinA;
  const rightY = -tongueDx * sinA + tongueDy * cosA;
  const tip1 = { x: tongueFork.x + leftX * 6, y: tongueFork.y + leftY * 6 };
  const tip2 = { x: tongueFork.x + rightX * 6, y: tongueFork.y + rightY * 6 };
  const tongue = document.createElementNS(SVG_NS, 'path');
  tongue.setAttribute(
    'd',
    `M ${tongueBase.x} ${tongueBase.y} L ${tongueFork.x} ${tongueFork.y} ` +
      `M ${tongueFork.x} ${tongueFork.y} L ${tip1.x} ${tip1.y} ` +
      `M ${tongueFork.x} ${tongueFork.y} L ${tip2.x} ${tip2.y}`,
  );
  tongue.setAttribute('class', 'snake-tongue');
  g.appendChild(tongue);

  // Eyes sit on the forehead — offset a little toward the tongue side and off-axis.
  for (const side of [-1, 1]) {
    const ex = h.x + tongueDx * 6 + px * side * 6;
    const ey = h.y + tongueDy * 6 + py * side * 6;
    const eye = document.createElementNS(SVG_NS, 'circle');
    eye.setAttribute('cx', String(ex));
    eye.setAttribute('cy', String(ey));
    eye.setAttribute('r', '3');
    eye.setAttribute('class', 'snake-eye');
    g.appendChild(eye);

    const pupil = document.createElementNS(SVG_NS, 'circle');
    pupil.setAttribute('cx', String(ex));
    pupil.setAttribute('cy', String(ey));
    pupil.setAttribute('r', '1.2');
    pupil.setAttribute('class', 'snake-pupil');
    g.appendChild(pupil);
  }
  return g;
}
