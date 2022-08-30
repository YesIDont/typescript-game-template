import { TActors } from './actors/actor';
import { TActor } from './actors/types';
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
          if (body && actor)
            actor.onHit(now, deltaSeconds, body, otherBody, otherBody.owner, collisions.result);
          if (otherBody && otherBody.owner)
            otherBody.owner.onHit(now, deltaSeconds, body, otherBody, actor, collisions.result);
        }
      }
    });

    actors.forEach((actor) => {
      if (actor.shouldBeDeleted) actors.remove(actor);
    });

    renderer.render(now, deltaSeconds, player, options);

    lastTime = now;
    requestAnimationFrame(run);
  };
}
