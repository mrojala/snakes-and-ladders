import { fi } from '../i18n';
import { COLOUR_PALETTE, PLAYER_COLOURS, type GameChoice } from '../game/state';

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;

type Slot = {
  enabled: boolean;
  isAi: boolean;
  name: string;
  colour: string;
  paletteOpen: boolean;
};

function defaultSlot(i: number, enabled: boolean): Slot {
  return {
    enabled,
    isAi: false,
    name: fi.defaultPlayerNames[i],
    colour: PLAYER_COLOURS[i],
    paletteOpen: false,
  };
}

function humanize(aiName: string): string {
  return aiName.startsWith(fi.aiPrefix) ? aiName.slice(fi.aiPrefix.length) : aiName;
}

function aiify(humanName: string): string {
  return humanName.startsWith(fi.aiPrefix) ? humanName : fi.aiPrefix + humanName;
}

export function mountSetup(container: HTMLElement, onStart: (choice: GameChoice) => void): void {
  container.innerHTML = '';

  const slots: Slot[] = Array.from({ length: MAX_PLAYERS }, (_, i) =>
    defaultSlot(i, i < MIN_PLAYERS),
  );

  const wrapper = document.createElement('div');
  wrapper.className = 'setup-wrapper';

  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = fi.title;

  const presets = document.createElement('div');
  presets.className = 'setup-presets';

  const familyBtn = document.createElement('button');
  familyBtn.type = 'button';
  familyBtn.className = 'preset-button preset-button--family';
  familyBtn.textContent = fi.presetFamily;
  familyBtn.addEventListener('click', () => applyPreset('family'));

  const demoBtn = document.createElement('button');
  demoBtn.type = 'button';
  demoBtn.className = 'preset-button preset-button--demo';
  demoBtn.textContent = fi.presetDemo;
  demoBtn.addEventListener('click', () => applyPreset('demo'));

  presets.append(familyBtn, demoBtn);

  const cards = document.createElement('div');
  cards.className = 'player-cards';

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.className = 'start-button';
  startBtn.textContent = fi.startGame;
  startBtn.addEventListener('click', () => {
    const players = slots
      .filter((s) => s.enabled)
      .map((s) => ({ name: s.name.trim() || ' ', isAi: s.isAi, colour: s.colour }));
    onStart({ players });
  });

  wrapper.append(title, presets, cards, startBtn);
  container.appendChild(wrapper);

  render();

  function applyPreset(kind: 'family' | 'demo'): void {
    slots.forEach((slot, i) => {
      if (kind === 'family') {
        slot.enabled = i < MIN_PLAYERS;
        slot.isAi = false;
        slot.name = fi.defaultPlayerNames[i];
      } else {
        slot.enabled = true;
        slot.isAi = true;
        slot.name = fi.aiPrefix + fi.defaultPlayerNames[i];
      }
      slot.colour = PLAYER_COLOURS[i];
      slot.paletteOpen = false;
    });
    render();
  }

  function render(): void {
    cards.innerHTML = '';
    const enabledCount = slots.filter((s) => s.enabled).length;

    slots.forEach((slot, idx) => {
      cards.appendChild(
        slot.enabled ? renderActiveCard(idx, slot, enabledCount) : renderEmptyCard(idx),
      );
    });
  }

  function renderActiveCard(idx: number, slot: Slot, enabledCount: number): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'player-card player-card--active';
    card.style.setProperty('--slot-colour', slot.colour);

    if (enabledCount > MIN_PLAYERS) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'player-card-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', fi.removePlayer);
      remove.addEventListener('click', () => {
        slot.enabled = false;
        render();
      });
      card.appendChild(remove);
    }

    const token = document.createElement('button');
    token.type = 'button';
    token.className = 'player-card-token';
    token.setAttribute('aria-label', fi.chooseColour);
    token.addEventListener('click', () => {
      slot.paletteOpen = !slot.paletteOpen;
      render();
    });
    card.appendChild(token);

    if (slot.paletteOpen) {
      card.appendChild(renderPalette(slot));
    }

    const nameInput = document.createElement('input');
    nameInput.className = 'player-card-name';
    nameInput.type = 'text';
    nameInput.maxLength = 20;
    nameInput.value = slot.name;
    nameInput.setAttribute('aria-label', fi.defaultPlayerNames[idx]);
    nameInput.addEventListener('input', () => {
      slot.name = nameInput.value;
    });
    card.appendChild(nameInput);

    const segment = document.createElement('div');
    segment.className = 'type-segment';
    const humanBtn = document.createElement('button');
    humanBtn.type = 'button';
    humanBtn.className = 'type-pill' + (slot.isAi ? '' : ' type-pill--active');
    humanBtn.textContent = 'Ihminen';
    humanBtn.addEventListener('click', () => {
      if (!slot.isAi) return;
      slot.isAi = false;
      slot.name = humanize(slot.name);
      render();
    });
    const aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.className = 'type-pill' + (slot.isAi ? ' type-pill--active' : '');
    aiBtn.textContent = fi.aiToggle;
    aiBtn.addEventListener('click', () => {
      if (slot.isAi) return;
      slot.isAi = true;
      slot.name = aiify(slot.name);
      render();
    });
    segment.append(humanBtn, aiBtn);
    card.appendChild(segment);

    return card;
  }

  function renderPalette(slot: Slot): HTMLDivElement {
    const palette = document.createElement('div');
    palette.className = 'colour-palette';
    COLOUR_PALETTE.forEach((col) => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'colour-swatch' + (col === slot.colour ? ' colour-swatch--active' : '');
      sw.style.background = col;
      sw.setAttribute('aria-label', col);
      sw.addEventListener('click', () => {
        slot.colour = col;
        slot.paletteOpen = false;
        render();
      });
      palette.appendChild(sw);
    });
    return palette;
  }

  function renderEmptyCard(idx: number): HTMLDivElement {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'player-card player-card--empty';
    card.setAttribute('aria-label', fi.addPlayer);
    card.addEventListener('click', () => {
      slots[idx].enabled = true;
      slots[idx].isAi = false;
      slots[idx].name = fi.defaultPlayerNames[idx];
      slots[idx].colour = PLAYER_COLOURS[idx];
      render();
    });

    const plus = document.createElement('span');
    plus.className = 'empty-plus';
    plus.textContent = '+';
    card.appendChild(plus);

    const label = document.createElement('span');
    label.className = 'empty-label';
    label.textContent = fi.addPlayer.replace(/^\+\s*/, '');
    card.appendChild(label);

    return card as unknown as HTMLDivElement;
  }
}
