import { Movement } from './actors/components/movement';
import { Physics } from './actors/components/physics';
import { Position } from './actors/components/position';
import { AActor, AActorBase } from './actors/new-actor';
import { TShape } from './collisions/proxyTypes';
import { CLevel } from './level';
import { TOptions } from './options';
import { TPlayer } from './player';
import { TRenderer } from './renderer';
import { TViewport } from './viewport';

type MovingActor = AActorBase & Movement & Position & Physics;

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
      if (!actor.shouldBeDeleted && actor.update) actor.update(now, deltaSeconds);
    });

    const movingActors: AActorBase[] = level.content.filter(
      (actor: AActor<Movement & Physics>) => !actor.shouldBeDeleted && actor.speed && actor.body,
    );

    movingActors.forEach((actor: MovingActor) => {
      const { body, direction, speed } = actor;
      actor.x += speed * direction.x * deltaSeconds;
      actor.y += speed * direction.y * deltaSeconds;
      body.x = actor.x;
      body.y = actor.y;
    });

    collisions.update();
    movingActors.forEach((actor: MovingActor) => {
      const body = actor.body as TShape;
      if (!body) return;

      const potentials = collisions.getPotentials(body);

      for (const otherBody of potentials) {
        if (collisions.areBodiesColliding(body, otherBody)) {
          if (body && actor && !actor.shouldBeDeleted)
            actor.onHit(now, deltaSeconds, body, otherBody, otherBody.owner, collisions.result);
          if (
            otherBody &&
            otherBody.owner &&
            otherBody.owner.onHit &&
            !otherBody.owner.shouldBeDeleted
          )
            (otherBody.owner as MovingActor).onHit(
              now,
              deltaSeconds,
              otherBody,
              body,
              actor,
              collisions.result,
            );
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
