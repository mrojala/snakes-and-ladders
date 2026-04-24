import type { Player } from '../game/state';
import { createDice } from './dice';
import { createPawnSvg } from './tokens';

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
  turn.className = 'turn-badge';

  const turnPawn = document.createElement('div');
  turnPawn.className = 'turn-pawn';
  turnPawn.appendChild(createPawnSvg());

  const turnName = document.createElement('span');
  turnName.className = 'turn-name';

  turn.append(turnPawn, turnName);

  const dice = createDice();
  dice.element.classList.add('dice--clickable');
  dice.element.setAttribute('role', 'button');
  dice.element.setAttribute('tabindex', '0');
  let canRoll = false;
  const tryRoll = () => {
    if (canRoll) onRoll();
  };
  dice.element.addEventListener('click', tryRoll);
  dice.element.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      tryRoll();
    }
  });

  const message = document.createElement('div');
  message.className = 'hud-message';

  const row = document.createElement('div');
  row.className = 'hud-row';
  row.append(turn, dice.element);

  el.append(row, message);

  return {
    element: el,
    update(current, rollable) {
      turnPawn.style.setProperty('--token-colour', current.colour);
      turnName.textContent = current.name;
      canRoll = rollable;
      dice.element.classList.toggle('dice--ready', rollable);
    },
    animateDice: dice.animate,
    setDice: dice.setValue,
    showMessage(text) {
      message.textContent = text ?? '';
    },
  };
}
