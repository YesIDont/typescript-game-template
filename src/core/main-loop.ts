import { updateActorAttachments } from './actors/components/attachments';
import { Movement, MovingActor } from './actors/components/movement';
import { Physics } from './actors/components/physics';
import { AActor, AActorBase } from './actors/new-actor';
import { TShape } from './collisions/proxyTypes';
import { CGame } from './game';

export function newLoop(game: CGame): () => void {
  let lastTime = performance.now();

  return function run(): void {
    const now = performance.now();
    const deltaSeconds = (now - lastTime) / 1000;
    const currentLevel = game.getCurrentLevel();
    const { collisions, content } = currentLevel;

    content.forEach((actor) => {
      if (!actor.shouldBeDeleted && actor.update) actor.update(now, deltaSeconds, game);
    });

    const movingActors: AActorBase[] = content.filter(
      (actor: AActor<Movement & Physics>) => !actor.shouldBeDeleted && actor.speed && actor.body,
    );

    movingActors.forEach((actor: MovingActor) => {
      actor.move(deltaSeconds);
      if (actor.attachments && actor.attachments.length > 0) updateActorAttachments(actor);
    });

    collisions.update();
    movingActors.forEach((actor: MovingActor & Physics) => {
      const body = actor.body as TShape;
      if (!body) return;

      const potentials = collisions.getPotentials(body);

      for (const otherBody of potentials) {
        if (collisions.areBodiesColliding(body, otherBody)) {
          if (body && actor && !actor.shouldBeDeleted) {
            actor.onHit(now, deltaSeconds, body, otherBody, otherBody.owner, collisions.result);
          }

          if (
            !otherBody ||
            !otherBody.owner ||
            !otherBody.owner.onHit ||
            otherBody.owner.shouldBeDeleted
          ) {
            return;
          }

          (otherBody.owner as MovingActor & Physics).onHit(
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

    content.forEach((actor) => {
      if (actor.shouldBeDeleted) currentLevel.remove(actor);
    });

    game.renderer.render(now, deltaSeconds, game.player, game.options);

    lastTime = now;
    requestAnimationFrame(run);
  };
}
