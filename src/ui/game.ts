import { createBoard } from '../board/view';
import { applyRoll, FINISH, rollDie } from '../game/rules';
import { newGame, type GameChoice, type GameState } from '../game/state';
import { fi } from '../i18n';
import { createHud } from './hud';
import { createTokensLayer } from './tokens';
import { createWinOverlay } from './winScreen';

// Quick-mode knobs for Playwright runs (?fast in the URL) — everything shortens
// but the logic stays identical so regression tests and kids both see the same
// flow.
const fast = new URLSearchParams(location.search).has('fast');
const STEP_MS = fast ? 40 : 180;
const GLIDE_MS = fast ? 160 : 600;
const CPU_THINK_MS = fast ? 120 : 700;
const BOUNCE_PAUSE_MS = fast ? 120 : 260;
const LANDED_MSG_MS = fast ? 250 : 700;

export function mountGame(container: HTMLElement, choice: GameChoice, onRestart: () => void): void {
  container.innerHTML = '';
  let state: GameState = newGame(choice);
  let busy = false;
  let ended = false;

  const wrapper = document.createElement('div');
  wrapper.className = 'game-wrapper';

  const body = document.createElement('div');
  body.className = 'game-body';

  const boardColumn = document.createElement('div');
  boardColumn.className = 'board-column';

  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = fi.title;

  const boardFrame = document.createElement('div');
  boardFrame.className = 'board-frame';
  const boardEl = createBoard();
  const tokens = createTokensLayer(state.players.map((p) => ({ colour: p.colour, name: p.name })));
  boardEl.appendChild(tokens.element);
  boardFrame.appendChild(boardEl);

  for (const p of state.players) tokens.placeAt(p.id, p.position);

  const hud = createHud(() => {
    if (!busy && !ended) void takeTurn();
  });

  boardColumn.append(title, boardFrame);
  body.append(boardColumn, hud.element);
  wrapper.append(body);
  container.appendChild(wrapper);

  refreshHud();
  scheduleCpuIfNeeded();

  async function takeTurn(): Promise<void> {
    busy = true;
    hud.showMessage(null);
    hud.update(state.players[state.currentPlayerIndex], false);
    tokens.setActive(null);

    const roll = rollDie();
    await hud.animateDice(roll);

    const { state: nextState, events } = applyRoll(state, roll);

    for (const ev of events) {
      if (ev.type === 'stepped') {
        const path: number[] = [];
        for (let p = ev.from + 1; p <= ev.to; p++) path.push(p);
        await tokens.animatePath(ev.playerId, path, STEP_MS);
      } else if (ev.type === 'bounced') {
        const forward: number[] = [];
        for (let p = ev.from + 1; p <= FINISH; p++) forward.push(p);
        const backward: number[] = [];
        for (let p = FINISH - 1; p >= ev.to; p--) backward.push(p);
        await tokens.animatePath(ev.playerId, forward, STEP_MS);
        hud.showMessage(fi.bouncedBack);
        await wait(BOUNCE_PAUSE_MS);
        await tokens.animatePath(ev.playerId, backward, STEP_MS);
        await wait(LANDED_MSG_MS);
        hud.showMessage(null);
      } else if (ev.type === 'slid') {
        hud.showMessage(fi.snakeLanded);
        await tokens.glideTo(ev.playerId, ev.to, GLIDE_MS);
        await wait(LANDED_MSG_MS);
        hud.showMessage(null);
      } else if (ev.type === 'climbed') {
        hud.showMessage(fi.ladderLanded);
        await tokens.glideTo(ev.playerId, ev.to, GLIDE_MS);
        await wait(LANDED_MSG_MS);
        hud.showMessage(null);
      }
    }

    state = nextState;
    busy = false;

    if (state.phase === 'won' && state.winner) {
      ended = true;
      hud.update(state.winner, false);
      tokens.setActive(state.winner.id);
      const overlay = createWinOverlay(state.winner, onRestart);
      wrapper.appendChild(overlay);
      return;
    }

    refreshHud();
    scheduleCpuIfNeeded();
  }

  function refreshHud(): void {
    const current = state.players[state.currentPlayerIndex];
    hud.update(current, !current.isCpu);
    if (state.lastRoll !== null) hud.setDice(state.lastRoll);
    tokens.setActive(current.id);
  }

  function scheduleCpuIfNeeded(): void {
    if (ended) return;
    const current = state.players[state.currentPlayerIndex];
    if (!current.isCpu || busy) return;
    setTimeout(() => {
      if (!busy && !ended) void takeTurn();
    }, CPU_THINK_MS);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
