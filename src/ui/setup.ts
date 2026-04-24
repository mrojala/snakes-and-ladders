import { fi } from '../i18n';
import type { PlayerCount } from '../game/state';

export function mountSetup(container: HTMLElement, onStart: (n: PlayerCount) => void): void {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'setup-wrapper';

  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = fi.title;

  const prompt = document.createElement('h2');
  prompt.className = 'setup-prompt';
  prompt.textContent = fi.setupPrompt;

  const buttons = document.createElement('div');
  buttons.className = 'setup-buttons';

  const options: Array<{ count: PlayerCount; label: string }> = [
    { count: 1, label: fi.onePlayerVsCpu },
    { count: 2, label: fi.twoPlayers },
    { count: 3, label: fi.threePlayers },
    { count: 4, label: fi.fourPlayers },
  ];

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'setup-button';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => onStart(opt.count));
    buttons.appendChild(btn);
  }

  wrapper.append(title, prompt, buttons);
  container.appendChild(wrapper);
}
