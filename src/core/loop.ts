import { TActor } from './actors/actor-types';
import { CLevel } from './level';
import { TOptions } from './options';
import { TPlayer } from './player';
import { TRenderer } from './renderer';
import { Vector } from './vector';
import { TViewport } from './viewport';

export function newLoop(
  viewport: TViewport,
  level: CLevel,
  player: TPlayer,
  renderer: TRenderer,
  options: TOptions,
): () => void {
  const { collisions } = level;
  let lastTime = performance.now();

  return function run(): void {
    const now = performance.now();
    const deltaSeconds = (now - lastTime) / 1000;

    level.content.forEach((actor) => {
      if (!actor.shouldBeDeleted) actor.update(now, deltaSeconds);
    });

    const movingActors: TActor[] = level.content.filter(
      (actor) => !actor.shouldBeDeleted && !Vector.isZero(actor.velocity) && actor.body,
    );

    movingActors.forEach((actor) => {
      const { body, velocity, speed } = actor;

      body!.x += speed * velocity.x * deltaSeconds;
      body!.y += speed * velocity.y * deltaSeconds;
    });

    collisions.update();
    movingActors.forEach((actor) => {
      const body = actor.body!;

      for (const otherBody of collisions.getPotentials(body)) {
        if (collisions.areBodiesColliding(body, otherBody)) {
          if (body && actor && !actor.shouldBeDeleted)
            actor.onHit(now, deltaSeconds, body, otherBody, otherBody.owner, collisions.result);
          if (otherBody && otherBody.owner && !otherBody.owner.shouldBeDeleted)
            otherBody.owner.onHit(now, deltaSeconds, body, otherBody, actor, collisions.result);
        }
      }
    });

    level.content.forEach((actor) => {
      if (actor.shouldBeDeleted) level.remove(actor);
    });

    renderer.render(now, deltaSeconds, player, options);

    lastTime = now;
    requestAnimationFrame(run);
  };
}
