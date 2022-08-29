import { TGameState } from '../game/state';
import { TRenderTarget } from '../types/base-types';
import { getCanvas } from './utils/dom/get-canvas';
import { getWindowInnerSize } from './utils/dom/get-window-inner-size';
import { TViewport } from './viewport';

export type TRenderer = {
  addRenderTarget(entity: TRenderTarget): void;
  render(now: number, deltaSeconds: number, state: TGameState): void;
};

export function newRenderer(viewport: TViewport): TRenderer {
  const [canvas, context] = getCanvas();
  const renderables: TRenderTarget[] = [];

  function addRenderTarget(entity: TRenderTarget): void {
    renderables.push(entity);
  }

  const resize = (): void => {
    const size = getWindowInnerSize();
    canvas.width = size[0];
    canvas.height = size[1];
  };

  resize();
  window.addEventListener('resize', resize);

  function render(now: number, deltaSeconds: number, state: TGameState): void {
    renderables.forEach((i) => {
      //
    });
  }

  return {
    addRenderTarget,
    render,
  };
}
