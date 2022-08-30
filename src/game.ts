// Here is the place for custom game logic

import { TActors } from './core/actors/actor';
import { TActor, TNewActorProps } from './core/actors/types';
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
  const groundHeight = 200;

  actors.add({
    name: 'ground',
    body: Rectangle(),
    color: '#443322',
    collisionResponse: 'slideOff',

    beginPlay() {
      const { body } = this;
      body.x = 0;
      body.y = viewport.size[1] - groundHeight;
      body.updateSizeAsRectangle(viewport.size[0], groundHeight, true);
    },

    update(): void {
      const { body } = this;
      body.x = 0;
      body.y = viewport.size[1] - groundHeight;
      body.updateSizeAsRectangle(viewport.size[0], groundHeight, true);
    },
  });

  actors.add({
    name: 'base',
    body: Circle(viewport.size[0] / 2, viewport.size[1] - groundHeight, 30),
    color: '#007744',
    zIndex: 0,
  });

  actors.add({
    name: 'base shield',
    body: Circle(viewport.size[0] / 2, viewport.size[1] - groundHeight, 100),
    color: '#00bbff',
    zIndex: -1,
    drawType: 'stroke',

    onHit() {
      this.body.radius *= 0.95;
    },
  });

  type TAMissleProps = {
    spawnTimer: TTimer;
  };

  type TAMissle = TActor & {
    spawnTimer: TTimer;
  };

  actors.add<TAMissleProps, TAMissle>({
    name: 'missle spawner',
    spawnTimer: newTimer(0.2),
    collides: false,
    visible: false,

    update(_, deltaSeconds) {
      if (this.spawnTimer(deltaSeconds)) {
        const a = randomInRange(-0.4, 0.4);

        const missleTemplate: TNewActorProps = {
          name: 'missile',
          body: Circle(0, 0, 5, COLLISION_TAGS.WORLD_DYNAMIC),
          color: '#ff0000',
          velocity: [a, 1],
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
