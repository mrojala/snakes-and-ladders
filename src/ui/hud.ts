import { fi } from '../i18n';
import type { Player } from '../game/state';
import { createDice } from './dice';

export type Hud = {
  element: HTMLDivElement;
  update: (current: Player, canRoll: boolean) => void;
  animateDice: (value: number) => Promise<void>;
  setDice: (value: number) => void;
  showMessage: (text: string | null) => void;
};

export function createHud(onRoll: () => void): Hud {
  const el = document.createElement('div');
  el.className = 'hud';

  const turn = document.createElement('div');
  turn.className = 'turn-label';

  const dice = createDice();

  const rollBtn = document.createElement('button');
  rollBtn.className = 'roll-button';
  rollBtn.type = 'button';
  rollBtn.textContent = fi.rollDice;
  rollBtn.addEventListener('click', () => onRoll());

  const message = document.createElement('div');
  message.className = 'hud-message';

  el.append(turn, dice.element, rollBtn, message);

  return {
    element: el,
    update(current, canRoll) {
      turn.innerHTML = '';
      const dot = document.createElement('span');
      dot.className = 'turn-dot';
      dot.style.backgroundColor = current.colour;
      const text = document.createElement('span');
      text.textContent = `${fi.turnLabel}: ${current.name}`;
      turn.append(dot, text);
      rollBtn.disabled = !canRoll;
    },
    animateDice: dice.animate,
    setDice: dice.setValue,
    showMessage(text) {
      message.textContent = text ?? '';
    },
  };
}
