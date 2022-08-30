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
import { Vector } from './core/vector';
import { TViewport } from './core/viewport';

/*

  ! - danger prediction - highlight targets that will hit player
  ! - laser aim
  ! - meteor shower - lots of meteors
  ! - upgradable shield batteries
  ! - shield energy meeter
  ! - shield regeneration
  ! - ammo for each type of weapon
  ! - store with
  ! - flack cannons (not controlled by player)
  ! - damage indicator in form of damage to buildings

*/

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
      body.y = viewport.size.y - groundHeight;
      body.updateSizeAsRectangle(viewport.size.x, groundHeight, true);
    },

    update(): void {
      const { body } = this;
      body.x = 0;
      body.y = viewport.size.y - groundHeight;
      body.updateSizeAsRectangle(viewport.size.x, groundHeight, true);
    },
  });

  const playerAim = actors.add({
    name: 'player aim',
    body: Circle(0, 0, 5),
    color: '#ff0000',
    zIndex: 2,
    drawType: 'stroke',
    collides: false,

    update() {
      this.body!.x = mouse.position.x;
      this.body!.y = mouse.position.y;
    },
  });

  type TABaseProps = {
    fireTimer: TTimer;
  };

  type TABase = TActor & {
    fireTimer: TTimer;
  };

  const base = actors.add<TABaseProps, TABase>({
    name: 'base',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, 30),
    color: '#007744',
    zIndex: 0,
    fireTimer: newTimer(0.25),

    update() {
      if (mouse.leftPressed) {
        const velocity = Vector.normalizedAandB(playerAim.body!, this.body!);

        const bulletProps: TNewActorProps = {
          name: `bullet`,
          body: Circle(0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC),
          x: this.body!.x,
          y: this.body!.y,
          color: '#aaddff',
          velocity,
          speed: randomInRange(200, 250),
          collisionResponse: 'slideOff',
          zIndex: -1,

          onHit() {
            // actors.remove(this);
          },
        };

        actors.spawn(bulletProps);
      }
    },
  });

  actors.add({
    name: 'base shield',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, 100),
    color: '#00bbff',
    zIndex: -1,
    drawType: 'stroke',

    onHit(now, deltaSeconds, body, otherBody, otherActor, result) {
      if (this.body.radius > base.body!.radius && otherActor.name != 'bullet')
        this.body.radius *= 0.95;
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
    spawnTimer: newTimer(0.2),
    collides: false,
    visible: false,

    update(_, deltaSeconds) {
      if (this.spawnTimer(deltaSeconds)) {
        const missleProps: TNewActorProps = {
          name: `meteor-${randomInRange(0, 100)}-${randomInRange(0, 100)}-${randomInRange(0, 100)}`,
          body: Circle(0, 0, 5, COLLISION_TAGS.WORLD_DYNAMIC),
          x: randomInRange(0, viewport.size.x),
          y: -100,
          color: '#884400',
          velocity: Vector.new(randomInRange(-0.5, 0.5), 1),
          speed: randomInRange(80, 120),
          collisionResponse: 'slideOff',

          onHit(_a, _b, body) {
            actors.remove(body.owner);
          },
        };

        actors.spawn(missleProps);
      }
    },
  });

  options.debugDraw = true;
  options.hideSystemCursor = true;
}
