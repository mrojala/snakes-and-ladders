import { fi } from '../i18n';
import type { GameChoice } from '../game/state';

type Option = { label: string; choice: GameChoice; modifier?: string };

export function mountSetup(container: HTMLElement, onStart: (choice: GameChoice) => void): void {
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

  const options: Option[] = [
    { label: fi.onePlayerVsCpu, choice: { mode: 'players', count: 1 } },
    { label: fi.twoPlayers,     choice: { mode: 'players', count: 2 } },
    { label: fi.threePlayers,   choice: { mode: 'players', count: 3 } },
    { label: fi.fourPlayers,    choice: { mode: 'players', count: 4 } },
    { label: fi.aiVsAi,         choice: { mode: 'auto' }, modifier: 'setup-button--auto' },
  ];

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = opt.modifier ? `setup-button ${opt.modifier}` : 'setup-button';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => onStart(opt.choice));
    buttons.appendChild(btn);
  }

  wrapper.append(title, prompt, buttons);
  container.appendChild(wrapper);
}
