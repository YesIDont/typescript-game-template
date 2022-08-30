// Here is the place for custom game logic

import { TActors, TNewActorProps } from './core/actor';
import { CCollisions } from './core/collisions';
import { Circle } from './core/collisions/circle';
import { Rectangle } from './core/collisions/polygon';
import { COLLISION_TAGS } from './core/collisions/utils';
import { TOptions } from './core/options';
import { TPlayer } from './core/player';
import { randomInRange } from './core/utils/math';
import { newTimer, TTimer } from './core/utils/timer';
import { TViewport } from './core/viewport';

export function newGame(
  actors: TActors,
  player: TPlayer,
  viewport: TViewport,
  collisions: CCollisions,
  options: TOptions,
): void {
  //

  actors.add({
    name: 'ground',
    body: Rectangle(),
    color: '#443322',
    collisionResponse: 'slideOff',

    beginPlay() {
      const groundHeight = 200;
      const { body } = this;
      body.x = 0;
      body.y = viewport.size[1] - groundHeight;
      body.updateSizeAsRectangle(viewport.size[0], groundHeight, true);
    },

    update(): void {
      const groundHeight = 200;
      const { body } = this;
      body.x = 0;
      body.y = viewport.size[1] - groundHeight;
      body.updateSizeAsRectangle(viewport.size[0], groundHeight, true);
    },
  });

  type TAMissleProps = {
    spawnTimer: TTimer;
  };

  type TAMissle = TAMissleProps & {
    spawnTimer: TTimer;
  };

  actors.add<TAMissleProps, TAMissle>({
    name: 'missle spawner',
    spawnTimer: newTimer(),

    update(_, deltaSeconds) {
      if (this.spawnTimer(deltaSeconds)) {
        const missleTemplate: TNewActorProps = {
          name: 'missile',
          body: Circle(0, 0, 5, COLLISION_TAGS.WORLD_DYNAMIC),
          color: '#ff0000',
          velocity: [0, 1],
          speed: 100,
          collisionResponse: 'slideOff',
          onHit(_a, _b, body) {
            actors.remove(body.owner);
          },
        };
        actors.spawn({ ...missleTemplate, x: randomInRange(0, viewport.size[0]), y: 500 });
      }
    },
  });

  options.isDebugDrawOn = true;
}
