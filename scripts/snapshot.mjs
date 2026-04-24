#!/usr/bin/env node
// Quick Playwright helper so the LLM can screenshot the dev server for self-verification.
// Usage: node scripts/snapshot.mjs <url> <out.png> [action...]
//   action forms:
//     click:<selector>
//     text:<substring>     (clicks first element whose text contains substring)
//     wait:<ms>
//     waitFor:<selector>   (waits up to 120s for selector to appear)
//     rolls:<n>            (clicks "Heitä noppaa" n times, waiting between each)

import { chromium } from 'playwright';

const [, , url = 'http://localhost:5199/', out = 'tmp-snapshot.png', ...actions] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1400 } });
await page.goto(url);

for (const action of actions) {
  if (action.startsWith('click:')) {
    await page.click(action.slice('click:'.length));
  } else if (action.startsWith('text:')) {
    const txt = action.slice('text:'.length);
    await page.getByText(txt, { exact: false }).first().click();
  } else if (action.startsWith('wait:')) {
    await page.waitForTimeout(Number(action.slice('wait:'.length)));
  } else if (action.startsWith('waitFor:')) {
    await page.waitForSelector(action.slice('waitFor:'.length), { timeout: 120_000 });
  } else if (action.startsWith('rolls:')) {
    const n = Number(action.slice('rolls:'.length));
    for (let i = 0; i < n; i++) {
      await page.getByRole('button', { name: 'Heitä noppaa' }).click({ trial: false }).catch(() => {});
      await page.waitForTimeout(2200); // dice anim ~600ms + up to 6 steps * 180ms + safety
    }
  } else {
    console.warn(`Unknown action: ${action}`);
  }
}

await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`Wrote ${out}`);
