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
  for (const snake of SNAKES) {
    svg.appendChild(renderSnake(snake.head, snake.tail, snake.colour));
  }
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

function renderSnake(headSquare: number, tailSquare: number, colour: string): SVGGElement {
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('class', 'snake');

  const h = pixelCentre(headSquare);
  const t = pixelCentre(tailSquare);

  const dx = t.x - h.x;
  const dy = t.y - h.y;
  const len = Math.hypot(dx, dy) || 1;
  const perp = { x: -dy / len, y: dx / len };
  const curveAmount = Math.min(90, len * 0.3);
  const sign = headSquare % 2 === 0 ? 1 : -1;
  const mx = (h.x + t.x) / 2 + perp.x * curveAmount * sign;
  const my = (h.y + t.y) / 2 + perp.y * curveAmount * sign;
  const d = `M ${h.x} ${h.y} Q ${mx} ${my} ${t.x} ${t.y}`;

  const body = document.createElementNS(SVG_NS, 'path');
  body.setAttribute('d', d);
  body.setAttribute('class', 'snake-body');
  body.setAttribute('stroke', colour);
  g.appendChild(body);

  const belly = document.createElementNS(SVG_NS, 'path');
  belly.setAttribute('d', d);
  belly.setAttribute('class', 'snake-belly');
  g.appendChild(belly);

  const head = document.createElementNS(SVG_NS, 'circle');
  head.setAttribute('cx', String(h.x));
  head.setAttribute('cy', String(h.y));
  head.setAttribute('r', '18');
  head.setAttribute('class', 'snake-head');
  head.setAttribute('fill', colour);
  g.appendChild(head);

  for (const offset of [-5, 5]) {
    const eye = document.createElementNS(SVG_NS, 'circle');
    eye.setAttribute('cx', String(h.x + offset));
    eye.setAttribute('cy', String(h.y - 4));
    eye.setAttribute('r', '2.5');
    eye.setAttribute('fill', '#fff');
    g.appendChild(eye);
  }
  return g;
}
