import { test, expect } from '@playwright/test';

test('T059 — initial load time ≤ 3000ms (SC-001)', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForSelector('#game-canvas');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThanOrEqual(3000);
});
