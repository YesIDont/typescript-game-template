import { TActor, TActors } from './actor';
import { CCollisions } from './collisions';
import { TOptions } from './options';
import { TPlayer } from './player';
import { TRenderer } from './renderer';
import { Vector } from './vector';
import { TViewport } from './viewport';

export function newLoop(
  viewport: TViewport,
  collisions: CCollisions,
  actors: TActors,
  player: TPlayer,
  renderer: TRenderer,
  options: TOptions,
): () => void {
  let lastTime = performance.now();
  const x = 0;
  const y = 1;

  return function run(): void {
    const now = performance.now();
    const deltaSeconds = (now - lastTime) / 1000;

    actors.forEach((actor) => {
      actor.update(now, deltaSeconds);
    });

    const movingActors: TActor[] = actors.filter(
      (actor) => !Vector.isZero(actor.velocity) && actor.body,
    );

    movingActors.forEach((actor) => {
      const { body, velocity, speed } = actor;

      body!.x += speed * velocity[x] * deltaSeconds;
      body!.y += speed * velocity[y] * deltaSeconds;
    });

    collisions.update();
    movingActors.forEach((actor) => {
      const body = actor.body!;

      for (const otherBody of collisions.getPotentials(body)) {
        if (collisions.areBodiesColliding(body, otherBody)) {
          actor.onHit(now, deltaSeconds, body, collisions.result);
        }
      }
    });

    renderer.render(now, deltaSeconds, player, options);

    lastTime = now;
    requestAnimationFrame(run);
  };
}
