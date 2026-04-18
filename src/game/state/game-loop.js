const TICK_MS = 1000 / 60; // 16.67 ms per tick at 60fps

export function createGameLoop(gameState, onTick, onRender) {
  let running = false;
  let lastTime = 0;
  let accumulator = 0;
  let rafId = null;

  function loop(now) {
    if (!running) return;
    const delta = Math.min(now - lastTime, 100); // cap delta to avoid spiral of death
    lastTime = now;
    accumulator += delta;

    while (accumulator >= TICK_MS) {
      onTick(gameState, TICK_MS / 1000);
      accumulator -= TICK_MS;
    }

    onRender(gameState);
    rafId = requestAnimationFrame(loop);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    pause() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    resume() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    },
  };
}
