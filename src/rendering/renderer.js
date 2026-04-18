export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mazeRenderer = null;
    this.entityRenderer = null;
    this.uiRenderer = null;
  }

  init(mazeRenderer, entityRenderer, uiRenderer) {
    this.mazeRenderer = mazeRenderer;
    this.entityRenderer = entityRenderer;
    this.uiRenderer = uiRenderer;
  }

  renderFrame(gameState) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.mazeRenderer) this.mazeRenderer.draw(ctx, gameState);
    if (this.entityRenderer) this.entityRenderer.draw(ctx, gameState);
    if (this.uiRenderer) this.uiRenderer.draw(ctx, gameState);
  }
}
