// Here is the place for custom game logic

import { TActors } from './core/actors/actor';
import { TActor, TNewActorProps } from './core/actors/types';
import { CCollisions } from './core/collisions';
import { Circle } from './core/collisions/circle';
import { Rectangle } from './core/collisions/polygon';
import { COLLISION_TAGS } from './core/collisions/utils';
import { TMouse } from './core/input/mouse';
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
  mouse: TMouse,
  options: TOptions,
): void {
  const groundHeight = 200;

  actors.add({
    name: 'ground',
    body: Rectangle(),
    color: '#333',
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

  const base = actors.add({
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
      if (this.body.radius > base.body!.radius) this.body.radius *= 0.95;
    },
  });

  actors.add({
    name: 'player aim',
    body: Circle(0, 0, 5),
    color: '#ff0000',
    zIndex: 2,
    drawType: 'stroke',
    collides: false,

    update() {
      this.body!.x = mouse.x;
      this.body!.y = mouse.y;
    },
  });

  type TAMeteorProps = {
    spawnTimer: TTimer;
  };

  type TAMeteor = TActor & {
    spawnTimer: TTimer;
  };

  actors.add<TAMeteorProps, TAMeteor>({
    name: 'meteors spawner',
    spawnTimer: newTimer(2),
    collides: false,
    visible: false,

    update(_, deltaSeconds) {
      if (this.spawnTimer(deltaSeconds)) {
        const a = randomInRange(-0.5, 0.5);

        const missleTemplate: TNewActorProps = {
          name: `meteor-${randomInRange(0, 100)}-${randomInRange(0, 100)}-${randomInRange(0, 100)}`,
          body: Circle(0, 0, 5, COLLISION_TAGS.WORLD_DYNAMIC),
          color: '#884400',
          velocity: [a, 1],
          speed: randomInRange(80, 120),
          collisionResponse: 'slideOff',
          onHit(_a, _b, body) {
            actors.remove(body.owner);
          },
        };
        actors.spawn({ ...missleTemplate, x: randomInRange(0, viewport.size[0]), y: -100 });
      }
    },
  });

  options.debugDraw = true;
  options.hideSystemCursor = true;
}
