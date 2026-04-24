import { createBoard } from '../board/view';
import { applyRoll, rollDie } from '../game/rules';
import { newGame, type GameState, type PlayerCount } from '../game/state';
import { fi } from '../i18n';
import { createHud } from './hud';
import { createTokensLayer } from './tokens';

const STEP_MS = 180;
const CPU_THINK_MS = 700;

export function mountGame(container: HTMLElement, playerCount: PlayerCount): void {
  container.innerHTML = '';
  let state: GameState = newGame(playerCount);
  let busy = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'game-wrapper';

  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = fi.title;

  const body = document.createElement('div');
  body.className = 'game-body';

  const boardFrame = document.createElement('div');
  boardFrame.className = 'board-frame';
  const boardEl = createBoard();
  const tokens = createTokensLayer(state.players.map((p) => p.colour));
  boardEl.appendChild(tokens.element);
  boardFrame.appendChild(boardEl);

  for (const p of state.players) tokens.placeAt(p.id, p.position);

  const hud = createHud(() => {
    if (!busy) void takeTurn();
  });

  body.append(boardFrame, hud.element);
  wrapper.append(title, body);
  container.appendChild(wrapper);

  refreshHud();
  scheduleCpuIfNeeded();

  async function takeTurn(): Promise<void> {
    busy = true;
    hud.showMessage(null);
    hud.update(state.players[state.currentPlayerIndex], false);

    const roll = rollDie();
    await hud.animateDice(roll);

    const { state: nextState, events } = applyRoll(state, roll);

    for (const ev of events) {
      if (ev.type === 'stepped') {
        const path: number[] = [];
        for (let p = ev.from + 1; p <= ev.to; p++) path.push(p);
        await tokens.animatePath(ev.playerId, path, STEP_MS);
      } else if (ev.type === 'stayed') {
        hud.showMessage(fi.tooHigh);
        await wait(900);
        hud.showMessage(null);
      }
    }

    state = nextState;
    busy = false;
    refreshHud();
    scheduleCpuIfNeeded();
  }

  function refreshHud(): void {
    const current = state.players[state.currentPlayerIndex];
    hud.update(current, !current.isCpu);
    if (state.lastRoll !== null) hud.setDice(state.lastRoll);
  }

  function scheduleCpuIfNeeded(): void {
    const current = state.players[state.currentPlayerIndex];
    if (!current.isCpu || busy) return;
    setTimeout(() => {
      if (!busy) void takeTurn();
    }, CPU_THINK_MS);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
