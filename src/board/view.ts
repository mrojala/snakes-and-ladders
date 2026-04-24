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
    svg.appendChild(renderSnake(snake.head, snake.tail, snake.colour, i, snake.path));
  });
  return svg;
}

type Pt = { x: number; y: number };

// Smooth curve through waypoints using chained quadratic beziers with midpoint
// endpoints. Guarantees tangent continuity between segments.
function smoothPath(pts: readonly Pt[]): string {
  if (pts.length === 0) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 1) return d;
  if (pts.length === 2) return `${d} L ${pts[1].x} ${pts[1].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const ctrl = pts[i];
    const next = pts[i + 1];
    const endX = (ctrl.x + next.x) / 2;
    const endY = (ctrl.y + next.y) / 2;
    d += ` Q ${ctrl.x} ${ctrl.y} ${endX} ${endY}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

// Walk the polyline at a fixed arc-length spacing, returning sample points
// and their local tangents. Used for placing cross-stripes on the body.
function sampleAtSpacing(pts: readonly Pt[], spacing: number): Array<{ p: Pt; tx: number; ty: number }> {
  const out: Array<{ p: Pt; tx: number; ty: number }> = [];
  let remaining = spacing;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const dirX = dx / len;
    const dirY = dy / len;
    let pos = 0;
    while (pos + remaining <= len) {
      pos += remaining;
      out.push({
        p: { x: a.x + dirX * pos, y: a.y + dirY * pos },
        tx: dirX,
        ty: dirY,
      });
      remaining = spacing;
    }
    remaining -= len - pos;
  }
  return out;
}

// When a snake has no explicit path, bow the midpoint perpendicular to the
// head→tail line so the body has a gentle organic curve. Returns three
// waypoints (head, bowed midpoint, tail) for the smooth-bezier renderer.
function bowedWaypoints(head: Pt, tail: Pt): Pt[] {
  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const mid = { x: (head.x + tail.x) / 2, y: (head.y + tail.y) / 2 };
  const bow = Math.min(38, len * 0.18);
  const sign = head.x < tail.x ? 1 : -1;
  return [head, { x: mid.x + px * bow * sign, y: mid.y + py * bow * sign }, tail];
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
  pathSquares?: readonly number[],
): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', 'snake');

  const head = pixelCentre(headSquare);
  const tail = pixelCentre(tailSquare);

  const waypoints: Pt[] =
    pathSquares && pathSquares.length >= 2
      ? pathSquares.map((n) => pixelCentre(n))
      : bowedWaypoints(head, tail);

  const d = smoothPath(waypoints);

  const bodyOutline = document.createElementNS(SVG_NS, 'path');
  bodyOutline.setAttribute('d', d);
  bodyOutline.setAttribute('class', 'snake-outline');
  g.appendChild(bodyOutline);

  const body = document.createElementNS(SVG_NS, 'path');
  body.setAttribute('d', d);
  body.setAttribute('class', 'snake-body');
  body.setAttribute('stroke', colour);
  g.appendChild(body);

  // Cross-stripes at regular arc-length intervals along the waypoint polyline.
  const pattern = STRIPE_PATTERNS[index % STRIPE_PATTERNS.length];
  for (const s of sampleAtSpacing(waypoints, pattern.spacing)) {
    const perpX = -s.ty;
    const perpY = s.tx;
    const stripe = document.createElementNS(SVG_NS, 'line');
    stripe.setAttribute('x1', String(s.p.x + perpX * pattern.halfBand));
    stripe.setAttribute('y1', String(s.p.y + perpY * pattern.halfBand));
    stripe.setAttribute('x2', String(s.p.x - perpX * pattern.halfBand));
    stripe.setAttribute('y2', String(s.p.y - perpY * pattern.halfBand));
    stripe.setAttribute('class', 'snake-stripe');
    stripe.setAttribute('stroke', pattern.colour);
    stripe.setAttribute('stroke-width', String(pattern.width));
    g.appendChild(stripe);
  }

  // Head orientation from the first segment's tangent.
  const firstNext = waypoints[1] ?? tail;
  const bodyDx = firstNext.x - head.x;
  const bodyDy = firstNext.y - head.y;
  const bodyLen = Math.hypot(bodyDx, bodyDy) || 1;
  const bodyDirX = bodyDx / bodyLen;
  const bodyDirY = bodyDy / bodyLen;
  const tongueDx = -bodyDirX;
  const tongueDy = -bodyDirY;
  const perpX = -bodyDirY;
  const perpY = bodyDirX;
  const headAngle = (Math.atan2(bodyDirY, bodyDirX) * 180) / Math.PI;

  const headEl = document.createElementNS(SVG_NS, 'ellipse');
  headEl.setAttribute('cx', String(head.x));
  headEl.setAttribute('cy', String(head.y));
  headEl.setAttribute('rx', '22');
  headEl.setAttribute('ry', '15');
  headEl.setAttribute('class', 'snake-head');
  headEl.setAttribute('fill', colour);
  headEl.setAttribute('transform', `rotate(${headAngle} ${head.x} ${head.y})`);
  g.appendChild(headEl);

  // Forked tongue out the front of the head.
  const tongueBase = { x: head.x + tongueDx * 20, y: head.y + tongueDy * 20 };
  const tongueFork = { x: head.x + tongueDx * 30, y: head.y + tongueDy * 30 };
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

  // Eyes on the forehead.
  for (const side of [-1, 1]) {
    const ex = head.x + tongueDx * 6 + perpX * side * 6;
    const ey = head.y + tongueDy * 6 + perpY * side * 6;
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
