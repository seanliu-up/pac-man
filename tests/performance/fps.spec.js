import { test, expect } from '@playwright/test';

test('T064 — sustained frame rate ≥ 30fps, no frame gap > 100ms (SC-003)', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#game-canvas');

  // Start the game
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);

  // Inject a frame timestamp collector via rAF
  await page.evaluate(() => {
    window._frameTimestamps = [];
    const collect = (ts) => {
      window._frameTimestamps.push(ts);
      if (window._frameTimestamps.length < 300) {
        requestAnimationFrame(collect);
      }
    };
    requestAnimationFrame(collect);
  });

  // Wait ~5 seconds for 300 frames at 60fps
  await page.waitForTimeout(6000);

  const timestamps = await page.evaluate(() => window._frameTimestamps);
  expect(timestamps.length).toBeGreaterThan(150); // at least 30fps × 5s

  // Calculate frame deltas
  const deltas = [];
  for (let i = 1; i < timestamps.length; i++) {
    deltas.push(timestamps[i] - timestamps[i - 1]);
  }

  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const avgFps = 1000 / avgDelta;
  expect(avgFps).toBeGreaterThanOrEqual(30);

  const maxGap = Math.max(...deltas);
  expect(maxGap).toBeLessThanOrEqual(100);
});
