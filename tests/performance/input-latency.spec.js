import { test, expect } from '@playwright/test';

test('T060 — input-to-visual latency ≤ 33ms (2 frames at 60fps)', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#game-canvas');

  // Start the game by pressing Space/Enter on the START screen
  await page.keyboard.press('Space');
  await page.waitForTimeout(100); // let the PLAYING state activate

  // Capture Pac-Man pixel position before input
  const before = await page.evaluate(() => {
    const canvas = document.querySelector('#game-canvas');
    const ctx = canvas.getContext('2d');
    // Sample a pixel at Pac-Man's approximate starting position (center of canvas)
    const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
    return Array.from(data);
  });

  const inputTime = Date.now();
  await page.keyboard.down('ArrowRight');

  // Wait up to 2 frames (33ms) for a visual change
  let changed = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.waitForTimeout(10);
    const after = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
      return Array.from(data);
    });
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changed = true;
      break;
    }
  }

  const elapsed = Date.now() - inputTime;
  await page.keyboard.up('ArrowRight');

  // The visual update must happen within 33ms of input
  expect(elapsed).toBeLessThanOrEqual(33);
});
