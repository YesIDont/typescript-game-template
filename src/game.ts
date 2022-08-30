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
import { lerpColor } from './core/utils/colors';
import { mapRange, randomInRange, sin } from './core/utils/math';
import { newTimer, TTimer } from './core/utils/timer';
import { Vector } from './core/vector';
import { TViewport } from './core/viewport';

/*

  ! shields capacity
  ! danger prediction - highlight targets that will hit player
  ! laser aim
  ! meteor shower - lots of meteors
  ! upgradable shield batteries
  ! shield energy meeter
  ! shield regeneration
  ! ammo for each type of weapon
  ! store with
  ! flack cannons (not controlled by player)
  ! damage indicator in form of damage to buildings
  ! auto cannons!
  ! drops of ground troops & ways to defend against them
  ! ground impact craters

*/

export function newGame(
  actors: TActors,
  player: TPlayer,
  viewport: TViewport,
  collisions: CCollisions,
  mouse: TMouse,
  options: TOptions,
): void {
  const groundHeight = 100;

  actors.add({
    name: 'ground',
    body: Rectangle(),
    color: '#000',
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
      Vector.set(this.body!, mouse.position);
    },
  });

  const base = actors.add({
    name: 'base',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, 30),
    color: '#559922',
    zIndex: 0,

    update() {
      if (mouse.leftPressed) {
        const bulletProps: TNewActorProps = {
          name: `bullet`,
          body: Circle(0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC),
          x: this.body!.x,
          y: this.body!.y,
          color: '#ffaa55',
          speed: randomInRange(200, 250),
          collisionResponse: 'slideOff',
          zIndex: -1,

          onHit() {
            // actors.remove(this);
          },
        };

        const bullet = actors.spawn(bulletProps);
        actors.fireInDirection(bullet, Vector.unitFromAandB(playerAim.body, this.body!));
      }
    },
  });

  type TAShieldProps = {
    afterHitCooldownTimer: TTimer;
    regeneratesAfterHit: boolean;
    shieldMaxPower: number;
    shieldPower: number;
    regenerationBoost: number;
    cooldownTime: number;
  };
  const regenerationBoost = 2;
  const cooldownTime = 5;
  const shieldMaxPower = 100;

  const shieldColor = '#00bbff';
  actors.add<TAShieldProps>({
    name: 'base shield',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, shieldMaxPower),
    color: shieldColor,
    zIndex: -1,
    drawType: 'fill',
    alpha: 0.25,
    afterHitCooldownTimer: newTimer(cooldownTime),
    regeneratesAfterHit: false,
    shieldPower: shieldMaxPower,
    shieldMaxPower,
    regenerationBoost,
    cooldownTime,

    update(now, deltaSeconds) {
      if (this.regeneratesAfterHit) {
        if (this.afterHitCooldownTimer.update(deltaSeconds)) {
          this.regeneratesAfterHit = false;
          this.body!.debugDraw.color = shieldColor;

          return;
        }

        const timerAlpha = this.afterHitCooldownTimer.getAlpha();
        this.body!.debugDraw.color = lerpColor('#ff0000', shieldColor, timerAlpha);

        return;
      }

      if (this.shieldPower < this.shieldMaxPower) {
        this.shieldPower += deltaSeconds * this.regenerationBoost;
        this.body!.radius = this.shieldPower;
        this.body!.debugDraw.color = lerpColor(
          shieldColor,
          '#00ff00',
          mapRange(sin(now * 0.005), -1, 1),
        );

        return;
      }

      if (this.shieldPower > this.shieldMaxPower) {
        this.body!.radius = this.shieldPower = this.shieldMaxPower;
        this.body!.debugDraw.color = shieldColor;
      }
    },

    onHit(this: TActor & TAShieldProps, now, deltaSeconds, body, otherBody, otherActor, result) {
      if (this.body!.radius > base.body.radius && otherActor.name != 'bullet') {
        this.body!.radius = this.shieldPower -= 2;
        this.regeneratesAfterHit = true;
        this.afterHitCooldownTimer.reset();
        this.body!.debugDraw.color = '#ff0000';
      }
    },
  });

  type TAMeteorProps = {
    spawnTimer: TTimer;
  };

  actors.add<TAMeteorProps>({
    name: 'meteors spawner',
    spawnTimer: newTimer(0.5, 1),
    collides: false,
    visible: false,

    update(_, deltaSeconds) {
      if (this.spawnTimer.update(deltaSeconds)) {
        const missleProps: TNewActorProps = {
          name: `meteor-${randomInRange(0, 100)}-${randomInRange(0, 100)}-${randomInRange(0, 100)}`,
          body: Circle(0, 0, randomInRange(1, 5), COLLISION_TAGS.WORLD_DYNAMIC),
          x: randomInRange(0, viewport.size.x),
          y: -100,
          color: '#884400',
          velocity: Vector.new(randomInRange(-0.6, -0.15), 1),
          speed: randomInRange(60, 90),
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
