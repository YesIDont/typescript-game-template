// Here is the place for custom game logic

import { TActor, TNewActorProps } from './core/actors/actor-types';
import { Circle } from './core/collisions/circle';
import { Rectangle } from './core/collisions/polygon';
import { COLLISION_TAGS } from './core/collisions/utils';
import { TMouse } from './core/input/mouse';
import { CLevel } from './core/level';
import { TOptions } from './core/options';
import { TPlayer } from './core/player';
import { TRenderer } from './core/renderer';
import {
  addToViewport,
  Box,
  Button,
  Fixed,
  Hidden,
  Left,
  MaxWidth,
  Panel,
  Text,
  Top,
} from './core/user-interface';
import { lerpColor } from './core/utils/colors';
import { mapRange, randomInRange, sin } from './core/utils/math';
import { newTimer, TTimer } from './core/utils/timer';
import { Vector } from './core/vector';
import { TViewport } from './core/viewport';

/*

  ! PLANETARY DEFENSE DEPARTMENT

  ! supply comming from earth every [time], where player chooses what comes in next supply
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
  ! orbital bombardment - missles from the sky

*/

export function newGame(
  player: TPlayer,
  viewport: TViewport,
  renderer: TRenderer,
  mouse: TMouse,
  options: TOptions,
): CLevel {
  options.debugDraw = true;
  options.hideSystemCursor = true;
  renderer.settings.backgroundColor = '#ddd';
  const groundHeight = 100;

  const level = new CLevel({ name: 'Tutorial level' }, renderer, options, viewport.size);
  level.beginPlay = function (): void {
    addToViewport(
      Box(
        Hidden,
        Fixed,
        Left('20px'),
        Top('20px'),
        Button('build', { onClick: () => console.log('open build menu') }),
      ),
      Panel(
        { title: 'Tutorial' },
        MaxWidth('400px'),
        Text(
          `Welcome Commander, you have finally arrived. Your shuttle had quite the trouble getting here. We use to say that no one gets on this god forsaken planet without any trouble.`,
        ),
        Text(
          'And speaking of which - there is a meteor shower closing in and our main defense is not yet online after recent events. There are some repairs that need to be made and I belive we finally have enough materials to build shield generator.',
        ),
        Text(
          'Please, follow this servitor, his name is Bjor, he will be your personal assistant down here as long as you need him. His speach module have been broken for some time now, but he can leave you messages on your comms channel. Feel free to consult him whenever you need.',
        ),
        Text(
          `Let me know once this is done, we'll talk supplies order we need to make afterwards.`,
        ),
        Text(`My name is Chase, private Chase.`),
        Text(`Over and out.`),
      ),
    );
  };

  level.add({
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

  const playerAim = level.add({
    name: 'player mouse aim',
    body: Circle(0, 0, 5),
    color: '#ff0000',
    zIndex: 2,
    drawType: 'stroke',
    collides: false,

    update() {
      this.visible = !mouse.overUiElement;
      Vector.set(this.body!, mouse.position);
    },
  });

  const base = level.add({
    name: 'base',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, 30),
    color: '#559922',
    zIndex: 0,

    update() {
      if (!mouse.overUiElement && mouse.leftPressed) {
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

        const bullet = level.spawn(bulletProps);
        level.fireInDirection(bullet, Vector.unitFromAandB(playerAim.body, this.body!));
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
  level.add<TAShieldProps>({
    name: 'base shield',
    body: Circle(viewport.size.x / 2, viewport.size.y - groundHeight + 10, shieldMaxPower),
    color: shieldColor,
    zIndex: -1,
    drawType: 'fill',
    alpha: 0.2,
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

  // ! template - enemy spawner
  // ! additional timer that starts/stops meteor shower and displays
  // ! "meteor shower warning"
  type TAMeteorSpawnerProps = {
    spawnTimer: TTimer;
    isOn: boolean;
    intensity: number;
  };

  level.add<TAMeteorSpawnerProps>({
    name: 'meteors spawner',
    spawnTimer: newTimer(0.1),
    collides: false,
    visible: false,
    isOn: false,
    intensity: 0.5,

    update(_, deltaSeconds) {
      if (this.isOn && this.spawnTimer.update(deltaSeconds)) {
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
            level.remove(body.owner);
          },
        };

        level.spawn(missleProps);
      }
    },
  });

  return level;
}
