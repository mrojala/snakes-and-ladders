import { fi } from '../i18n';
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

  const rollBtn = document.createElement('button');
  rollBtn.className = 'roll-button';
  rollBtn.type = 'button';
  rollBtn.textContent = fi.rollDice;
  rollBtn.addEventListener('click', () => onRoll());

  const message = document.createElement('div');
  message.className = 'hud-message';

  const row = document.createElement('div');
  row.className = 'hud-row';
  row.append(turn, dice.element, rollBtn);

  el.append(row, message);

  return {
    element: el,
    update(current, canRoll) {
      turnPawn.style.setProperty('--token-colour', current.colour);
      turnName.textContent = current.name;
      rollBtn.disabled = !canRoll;
    },
    animateDice: dice.animate,
    setDice: dice.setValue,
    showMessage(text) {
      message.textContent = text ?? '';
    },
  };
}
