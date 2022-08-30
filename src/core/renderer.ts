import { TActor } from './actors/types';
import { TOptions } from './options';
import { TPlayer } from './player';
import { getCanvas } from './utils/dom/get-canvas';
import { getWindowInnerSize } from './utils/dom/get-window-inner-size';
import { TViewport } from './viewport';

export type TRenderer = {
  addRenderTarget(entity: TActor): void;
  removeRenderTarget(entity: TActor): void;
  render(now: number, deltaSeconds: number, player: TPlayer, options: TOptions): void;
};

export function newRenderer(viewport: TViewport): TRenderer {
  const [canvas, context] = getCanvas();
  const renderables: TActor[] = [];

  function addRenderTarget(entity: TActor): void {
    renderables.push(entity);
  }

  function removeRenderTarget(actor: TActor): void {
    const index = renderables.findIndex((r) => r.id == actor.id);
    if (index > -1) renderables.splice(index, 1);
  }

  const resize = (): void => {
    const size = getWindowInnerSize();
    canvas.width = size[0];
    canvas.height = size[1];
  };

  resize();
  window.addEventListener('resize', resize);

  function render(now: number, deltaSeconds: number, player: TPlayer, options: TOptions): void {
    if (options.debugDraw) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      renderables.sort((a, b) => {
        const zA = a.body!.debugDraw.zIndex;
        const zB = b.body!.debugDraw.zIndex;
        if (zA < zB) return -1;
        if (zA > zB) return 1;

        return 0;
      });

      renderables.forEach((actor: TActor) => {
        if (!actor.body) return;
        actor.body.draw(context);
      });
    }
  }

  return {
    addRenderTarget,
    removeRenderTarget,
    render,
  };
}
