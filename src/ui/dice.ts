const DOTS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

export type Dice = {
  element: HTMLDivElement;
  setValue: (n: number) => void;
  animate: (finalValue: number) => Promise<void>;
};

export function createDice(): Dice {
  const el = document.createElement('div');
  el.className = 'dice';
  setFace(el, 1);

  return {
    element: el,
    setValue(n) {
      setFace(el, n);
    },
    async animate(finalValue) {
      const frameMs = 70;
      const totalMs = 600;
      const frames = Math.floor(totalMs / frameMs);
      el.classList.add('dice-rolling');
      for (let i = 0; i < frames; i++) {
        setFace(el, 1 + Math.floor(Math.random() * 6));
        await wait(frameMs);
      }
      setFace(el, finalValue);
      el.classList.remove('dice-rolling');
      el.classList.add('dice-pop');
      await wait(260);
      el.classList.remove('dice-pop');
    },
  };
}

function setFace(el: HTMLElement, n: number) {
  el.textContent = '';
  for (const [x, y] of DOTS[n] ?? []) {
    const d = document.createElement('span');
    d.className = 'dice-dot';
    d.style.left = `${x}%`;
    d.style.top = `${y}%`;
    el.appendChild(d);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
