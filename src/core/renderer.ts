import { TActor } from './actors/actor-types';
import { TOptions } from './options';
import { TPlayer } from './player';
import { getCanvas } from './utils/dom/get-canvas';
import { getWindowInnerSize } from './utils/dom/get-window-inner-size';

export type TRenderSettings = {
  backgroundColor?: string;
};

export type TRenderer = {
  settings: TRenderSettings;
  addRenderTarget(entity: TActor): void;
  removeRenderTarget(entity: TActor): void;
  clearRenderTargets(): void;
  render(now: number, deltaSeconds: number, player: TPlayer, options: TOptions): void;
};

export function newRenderer(): TRenderer {
  const [canvas, context] = getCanvas();
  const renderables: TActor[] = [];
  const settings: TRenderSettings = {
    backgroundColor: undefined,
  };

  function addRenderTarget(entity: TActor): void {
    renderables.push(entity);
  }

  function removeRenderTarget(actor: TActor): void {
    const index = renderables.findIndex((r) => r.id == actor.id);
    if (index > -1) renderables.splice(index, 1);
  }

  function clearRenderTargets(): void {
    renderables.length = 0;
  }

  const resize = (): void => {
    const size = getWindowInnerSize();
    canvas.width = size.x;
    canvas.height = size.y;
  };

  resize();
  window.addEventListener('resize', resize);

  function render(now: number, deltaSeconds: number, player: TPlayer, options: TOptions): void {
    if (options.debugDraw) {
      if (settings.backgroundColor) {
        context.fillStyle = settings.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#000';
      } else context.clearRect(0, 0, canvas.width, canvas.height);

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
    settings,
    addRenderTarget,
    removeRenderTarget,
    clearRenderTargets,
    render,
  };
}
