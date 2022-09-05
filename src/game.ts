// Here is the place for custom game logic

import {
  beginPlay,
  debugDraw,
  health,
  healthBar,
  movement,
  name,
  physics,
  position,
  TABeginPlay,
  TADebugDraw,
  TAHealth,
  TAHealthBar,
  TAMovement,
  TAName,
  TAPhysics,
  TAPosition,
  TAUpdate,
  update,
} from './core/actors/components';
import { TActor, TNewActorProps } from './core/actors/new-actor';
import { CCircle, Circle } from './core/collisions/circle';
import { CPolygon, Rectangle } from './core/collisions/polygon';
import { EOnHitResponseType } from './core/collisions/responses';
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
  Collapsed,
  Fixed,
  Left,
  MaxWidth,
  Panel,
  show,
  Text,
  Top,
} from './core/user-interface';
import { pulseValue } from './core/utils/animations';
import { lerpColor } from './core/utils/colors';
import { mapRangeClamped, randomInRange } from './core/utils/math';
import { emptyFn } from './core/utils/misc';
import { newTimer } from './core/utils/timer';
import { Vector } from './core/vector';
import { TViewport } from './core/viewport';

/*

  ! PLANETARY DEFENSE DEPARTMENT

  - syren informing of incomming attack
  - auto guns with range that can be improved
  - supplies delivered ever now and than, animation of shuttle image landing with supplies
    and leaving without payload
  - flashing dots - lights on buildings
  - supply comming from earth every [time], where player chooses what comes in next supply
  - shields capacity
  - danger prediction - highlight targets that will hit player
  - laser aim
  - meteor shower - lots of meteors
  - upgradable shield batteries
  - shield energy meeter
  - shield regeneration
  - ammo for each type of weapon
  - store with
  - flack cannons (not controlled by player)
  - damage indicator in form of damage to buildings
  - auto cannons!
  - drops of ground troops & ways to defend against them
  - ground impact craters
  - orbital bombardment - missles from the sky
  - some say these meteors showers where not a natural phenomena

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
  renderer.settings.backgroundColor = '#ffaa55';
  const groundHeight = 100;

  const level = new CLevel({ name: 'Tutorial level' }, viewport, renderer, options, viewport.size);

  const repairPanel = Panel(Collapsed, MaxWidth('400px'), { title: 'Repair menu' });
  const repairButton = Button('Repair [R]', {
    className: 'pulse-black-infinite',
    onClick: () => {
      show(repairPanel);
    },
  });
  const buildButton = Button('Build', Collapsed, { onClick: () => console.log('open build menu') });
  const toolsBox = Box(Collapsed, Fixed, Left('20px'), Top('20px'), repairButton, buildButton);

  const tutorialPanel = Panel(
    {
      title: 'Tutorial',
      onClose: () => {
        setTimeout(() => {
          tutorialPanel.replaceContent(
            Text(`Your buildings are damaged. Click on the repair button to opne repair menu.`),
          );
          show(tutorialPanel);
          show(toolsBox);
          tutorialPanel.setOnClose(emptyFn);
        }, 200);
      },
    },
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
    Text(`Let me know once this is done, we'll talk supplies order we need to make afterwards.`),
    Text(`My name is Chase, private Chase.`),
    Text(`Over and out.`),
  );

  level.beginPlay = function (): void {
    addToViewport(toolsBox, tutorialPanel, repairPanel);
  };

  type TGroundActor = TActor & TAName & TAPhysics<CPolygon> & TADebugDraw & TABeginPlay & TAUpdate;

  const groundUpdate = function (this: TGroundActor): void {
    const { body } = this;
    body.x = 0;
    body.y = viewport.size.y - groundHeight;
    body.updateSizeAsRectangle(viewport.size.x, groundHeight, true);
  };

  level.add<TGroundActor>(
    name('ground'),
    physics(Rectangle(), EOnHitResponseType.slideOff),
    debugDraw({ color: '#220000', zIndex: 10 }),
    beginPlay(groundUpdate),
    update(groundUpdate),
  );

  type TPlayerAimActor = TActor & TAName & TAPhysics<CCircle> & TADebugDraw & TAUpdate;

  const playerAim = level.add<TPlayerAimActor>(
    name('player mouse aim'),
    physics(Circle(0, 0, 5), EOnHitResponseType.slideOff),
    debugDraw({ zIndex: 100, drawType: 'stroke', color: '#ff0000' }),
    update(function (this: TPlayerAimActor): void {
      this.visible = !mouse.overUiElement;
      Vector.set(this.body, mouse.position);
    }),
  );

  type TBuilding = TActor &
    TAName &
    TAHealth &
    TAHealthBar &
    TAPhysics<CCircle> &
    TADebugDraw &
    TABeginPlay &
    TAUpdate;

  type TBullet = TActor &
    TAName &
    TAPhysics<CCircle> &
    TAPosition &
    TAMovement &
    TADebugDraw &
    TAUpdate;

  const buildingTemplate = (
    nameIn: string,
    color: string,
    healthIn: number,
    x: number,
    y: number,
    radius: number,
  ): TNewActorProps<TBuilding> =>
    [
      name(nameIn),
      physics(
        Circle(x, y, radius),
        EOnHitResponseType.slideOff,
        function onHit(this: TBuilding, now, deltaSeconds, body, otherBody, otherActor, result) {
          if (otherActor.name != 'bullet') {
            this.receiveDamage(otherBody.radius ?? 1);
          }
        },
      ),
      health(healthIn, healthIn * 0.5),
      healthBar(),
      debugDraw({ zIndex: 0, drawType: 'fill', color }),
      beginPlay(function (this: TBuilding) {
        this.healthBar.setX(this.body.x);
        this.healthBar.setY(this.body.y - this.body.radius - 15);
        this.healthBar.setProgress(0.5);
      }),
    ] as TNewActorProps<TBuilding>;

  const mainBuilding = level.add<TBuilding>(
    ...buildingTemplate(
      'Building 01',
      '#fff',
      100,
      viewport.size.x / 2,
      viewport.size.y - groundHeight - 5,
      30,
    ),
    update(function (this: TBuilding) {
      if (!mouse.overUiElement && mouse.leftPressed) {
        const bullet = level.spawn<TBullet>(
          name(`bullet`),
          physics(Circle(0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC), EOnHitResponseType.slideOff),
          debugDraw({ zIndex: -1, drawType: 'fill', color: '#fff' }),
          position(this.body.x, this.body.y),
          movement(randomInRange(200, 250)),
        );
        level.fireInDirection(bullet, Vector.unitFromAandB(playerAim.body, this.body));
      }
    }),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      'Building 02',
      '#edc',
      60,
      viewport.size.x / 2 - 45,
      viewport.size.y - groundHeight + 5,
      20,
    ),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      'Building 03',
      '#ddd',
      70,
      viewport.size.x / 2 + 45,
      viewport.size.y - groundHeight + 5,
      28,
    ),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      'Building 03',
      '#ffe',
      50,
      viewport.size.x / 2 + 65,
      viewport.size.y - groundHeight + 5,
      18,
    ),
  );

  const shieldComponent = {
    afterHitCooldownTimer: newTimer(5),
    regeneratesAfterHit: false,
    shieldMaxPower: 120,
    shieldPower: 120,
    regenerationBoost: 2,
    cooldownTime: 5,
    shieldColor: '#00bbff',
  };

  type TShield = TActor & TAName & TADebugDraw & TAPhysics & TAUpdate & typeof shieldComponent;

  level.add<TShield>(
    shieldComponent,
    name('Base Shield'),
    debugDraw({ color: shieldComponent.shieldColor, alpha: 0.5, zIndex: -1, drawType: 'fill' }),
    physics(
      Circle(
        viewport.size.x / 2,
        viewport.size.y - groundHeight + 10,
        shieldComponent.shieldMaxPower,
      ),
      EOnHitResponseType.slideOff,
      function onHit(this: TShield, now, deltaSeconds, body, otherBody, otherActor, result) {
        if (this.body.radius > mainBuilding.body.radius && otherActor.name != 'bullet') {
          this.shieldPower -= otherActor.name == 'meteor' ? otherBody.radius : 2;
          this.body.radius = this.shieldPower;
          this.regeneratesAfterHit = true;
          this.afterHitCooldownTimer.reset();
          this.debugDraw.color = '#ff0000';
        }
      },
    ),
    update(function (this: TShield, now: number, deltaSeconds: number) {
      this.debugDraw.alpha = mapRangeClamped(this.shieldPower, 0, this.shieldMaxPower, 0, 0.3);
      if (this.regeneratesAfterHit) {
        if (this.afterHitCooldownTimer.update(deltaSeconds)) {
          this.regeneratesAfterHit = false;
          this.debugDraw.color = this.shieldColor;

          return;
        }

        const timerAlpha = this.afterHitCooldownTimer.getAlpha();
        this.debugDraw.color = lerpColor('#ff0000', this.shieldColor, timerAlpha);

        return;
      }

      if (this.shieldPower < this.shieldMaxPower) {
        this.shieldPower += deltaSeconds * this.regenerationBoost;
        this.body.radius = this.shieldPower;
        this.debugDraw.color = lerpColor(this.shieldColor, '#00dd77', pulseValue());

        return;
      }

      if (this.shieldPower > this.shieldMaxPower) {
        this.body.radius = this.shieldPower = this.shieldMaxPower;
        this.debugDraw.color = this.shieldColor;
      }
    }),
  );

  const meteorSpawnerComponent = {
    spawnTimer: newTimer(0.1),
    // waveTimer: newTimer(30),
    isOn: true,
    intensity: 0.5,
  };

  type TMeteorSpawner = TActor & TAName & TAUpdate & typeof meteorSpawnerComponent;
  type TMeteor = TActor & TAName & TAUpdate & TAPosition & TAMovement;

  level.add<TMeteorSpawner>(
    meteorSpawnerComponent,
    name('meteors spawner'),
    update(function (this: TMeteorSpawner, now, deltaSeconds) {
      if (this.isOn && this.spawnTimer.update(deltaSeconds)) {
        const meteor = level.spawn<TMeteor>(
          { name: 'meteor' },
          physics(
            Circle(0, 0, randomInRange(1, 6), COLLISION_TAGS.WORLD_DYNAMIC),
            EOnHitResponseType.slideOff,
            function onHit(this: TMeteor, _a, _b, body, _c, otherActor) {
              if (otherActor.name != 'meteor') level.remove(body.owner);
            },
          ),
          debugDraw({ color: '#662200', zIndex: 50 }),
          position(randomInRange(0, viewport.size.x), -100),
          movement(randomInRange(90, 130)),
        );
        level.fireInDirection(meteor, Vector.new(randomInRange(-0.6, -0.15), 1));
      }
    }),
  );

  return level;
}
