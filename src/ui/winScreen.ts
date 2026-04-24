import { fi } from '../i18n';
import type { Player } from '../game/state';

export function createWinOverlay(winner: Player, onPlayAgain: () => void): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';

  const card = document.createElement('div');
  card.className = 'win-card';

  const dot = document.createElement('div');
  dot.className = 'win-dot';
  dot.style.backgroundColor = winner.colour;

  const title = document.createElement('h2');
  title.className = 'win-title';
  title.textContent = `${fi.winner}: ${winner.name}`;

  const btn = document.createElement('button');
  btn.className = 'play-again-button';
  btn.type = 'button';
  btn.textContent = fi.playAgain;
  btn.addEventListener('click', () => onPlayAgain());

  card.append(dot, title, btn);
  overlay.appendChild(card);
  return overlay;
}
