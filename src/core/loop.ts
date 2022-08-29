import { TGameState, TGameStateUpdate } from '../game/state';
import { CCollisions } from './collisions';
import { TOptions } from './options';
import { TRenderer } from './renderer';

export function newLoop(
  renderer: TRenderer,
  collisions: CCollisions,
  state: TGameState,
  update: TGameStateUpdate,
  options: TOptions,
): () => void {
  let lastTime = performance.now();

  return function run(): void {
    const now = performance.now();
    const deltaSeconds = (now - lastTime) / 1000;

    update(now, deltaSeconds, collisions, state, options);
    renderer.render(now, deltaSeconds, state);

    lastTime = now;
    requestAnimationFrame(run);
  };
}
