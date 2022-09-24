import { DebugDraw, Physics } from './actors/components';
import { AActor, AActorBase } from './actors/new-actor';
import { TOptions } from './options';
import { TPlayer } from './player';
import { getCanvas } from './utils/dom/get-canvas';
import { getWindowInnerSize } from './utils/dom/get-window-inner-size';

export type TRenderSettings = {
  backgroundColor?: string;
};

export type TRenderer = {
  settings: TRenderSettings;
  addRenderTarget(entity: AActorBase): void;
  removeRenderTarget(entity: AActorBase): void;
  clearRenderTargets(): void;
  render(now: number, deltaSeconds: number, player: TPlayer, options: TOptions): void;
};

export function newRenderer(): TRenderer {
  const [canvas, context] = getCanvas();
  const renderables: AActorBase[] = [];
  const settings: TRenderSettings = {
    backgroundColor: undefined,
  };

  function addRenderTarget(entity: AActorBase): void {
    renderables.push(entity);
  }

  function removeRenderTarget(actor: AActorBase): void {
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

      const renderQueue = renderables
        .filter((a: AActor<Physics & DebugDraw>) => a.visible && a.body && a.debugDraw)
        .sort((a: AActor<Physics & DebugDraw>, b: AActor<Physics & DebugDraw>) => {
          const zA = a.debugDraw.zIndex;
          const zB = b.debugDraw.zIndex;
          if (zA < zB) return -1;
          if (zA > zB) return 1;

          return 0;
        });

      renderQueue.forEach((actor: AActorBase & Physics) => {
        actor.body?.draw(context);
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
