// Here is the place for custom game logic

import {
  beginPlay,
  BeginPlayFn,
  debugDraw,
  DebugDraw,
  health,
  Health,
  HealthBar,
  movement,
  Movement,
  name,
  Name,
  physics,
  Physics,
  position,
  Position,
  Update,
  update,
} from './core/actors/components';
import { Attachment, attachments } from './core/actors/components/attachments';
import { AActor, AActorBase, TNewActorProps } from './core/actors/new-actor';
import { CCircle, Circle } from './core/collisions/circle';
import { CPolygon, Rectangle } from './core/collisions/polygon';
import { EOnHitResponseType } from './core/collisions/responses';
import { COLLISION_TAGS } from './core/collisions/utils';
import { TKeys } from './core/input/keyboard/keyboard';
import { TMouse } from './core/input/mouse';
import { CLevel } from './core/level';
import { TOptions } from './core/options';
import { TPlayer } from './core/player';
import { TRenderer } from './core/renderer';
import {
  Absolute,
  addToViewport,
  Border,
  Box,
  Button,
  Collapsed,
  Color,
  Fixed,
  Flex,
  healthBarWidget,
  Height,
  Image,
  Left,
  MarginLeft,
  MarginTop,
  MaxHeight,
  MaxWidth,
  MinHeight,
  MinWidth,
  Overflow,
  Panel,
  Relative,
  remove,
  show,
  Text,
  Top,
  TProgressBar,
  Width,
  ZIndex,
} from './core/user-interface';
import { pulseValue } from './core/utils/animations';
import { lerpColor } from './core/utils/colors';
import { mapRangeClamped, randomInRange } from './core/utils/math';
import { emptyFn } from './core/utils/misc';
import { newTimer, TTimer } from './core/utils/timer';
import { TVector, Vector } from './core/vector';
import { TViewport } from './core/viewport';

/*

  ! PLANETARY DEFENSE DEPARTMENT

  - energy distribution like in Elite: shield, cannons etc.
  - syren informing of incoming attack
  - auto guns with range that can be improved
  - supplies delivered ever now and than, animation of shuttle image landing with supplies
    and leaving without payload
  - flashing dots - lights on buildings and antenas and satelite dishes
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
  - orbital bombardment - missiles from the sky
  - some say these meteors showers where not a natural phenomena

*/

export function newGame(
  player: TPlayer,
  viewport: TViewport,
  renderer: TRenderer,
  mouse: TMouse,
  keys: TKeys,
  options: TOptions,
): CLevel {
  options.debugDraw = true;
  options.hideSystemCursor = true;
  renderer.settings.backgroundColor = '#ffaa55';
  const groundHeight = 100;

  const level = new CLevel(
    { name: 'Tutorial level' },
    viewport,
    renderer,
    options,
    Vector.new(viewport.width, viewport.height),
  );

  const repairPanel = Panel(Collapsed, MaxWidth('400px'), { title: 'Repair menu' });
  const showRepairPanel = (): void => show(repairPanel);
  const repairButton = Button('Repair [R]', { onClick: showRepairPanel });
  keys.on('pressed', 'r', showRepairPanel);

  const buildPanel = Panel(Collapsed, MaxWidth('400px'), { title: 'Build menu' });
  const showBuildPanel = (): void => show(buildPanel);
  const buildButton = Button('Build [B]', { onClick: showBuildPanel });
  keys.on('pressed', 'b', showBuildPanel);

  const toolsBox = Box(Collapsed, Fixed, Left('10px'), Top('10px'), repairButton, buildButton);

  const showServitorMessage = (message: string): void => {
    const messagePanel = Panel(
      MaxWidth('400px'),
      {
        title: 'Incoming Message',
      },

      Box(
        Flex,
        Box(
          Relative,
          Overflow('hidden'),
          MaxHeight('125px'),
          MinWidth('125px'),
          MinHeight('125px'),
          Border('1px solid #555'),
          Image(Absolute, Width('auto'), Height('105%'), Left('-50px'), {
            src: 'https://artwork.40k.gallery/wp-content/uploads/2021/02/16010123/40K-20171126062843.jpg',
          }),
        ),
        Box(
          message,
          MarginLeft('10px'),
          Text('Bjor, Servitor', Color('#7799ff'), MarginTop('5px')),
        ),
      ),
    );
    messagePanel.setOnClose(() => remove(messagePanel));
    addToViewport(messagePanel);
  };

  const tutorialPanel = Panel(
    {
      title: 'Incoming Message',
      onClose: () => {
        setTimeout(() => {
          // tutorialPanel.replaceContent(
          //   text(),
          // );
          showServitorMessage(
            `My Lord, we have received warning of incoming meteor shower. Buildings are damaged and our power plant is offline. You can order repairs in the repair menu. Click on "Repair" button to open repair menu or "R" key on your keyboard.`,
          );
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
      'And speaking of which - there is a meteor shower closing in and our main defense is not yet online after recent events. There are some repairs that need to be made and I believe we finally have enough materials to build shield generator.',
    ),
    Text(
      'Please, follow this servitor, his name is Bjor, he will be your personal assistant down here as long as you need him. His speech module have been broken for some time now, but he can leave you messages on your comms channel. Feel free to consult him whenever you need.',
    ),
    Text(`Let me know once this is done, we'll talk supplies order we need to make afterwards.`),
    Text(`My name is Chase, private Chase.`),
    Text(`Over and out.`),
  );

  level.beginPlay = function (): void {
    addToViewport(toolsBox, tutorialPanel, repairPanel, buildPanel);
  };

  type AGround = AActor<Physics<CPolygon> & DebugDraw & BeginPlayFn & Update>;

  const groundUpdate = function (this: AGround): void {
    const { body } = this;
    body.x = 0;
    body.y = viewport.height - groundHeight;
    body.updateSizeAsRectangle(viewport.width, groundHeight, true);
  };

  level.add<AGround>(
    { name: 'ground' },
    physics<CPolygon>(Rectangle(), EOnHitResponseType.slideOff),
    debugDraw({ color: '#220000', zIndex: 10 }),
    beginPlay(groundUpdate),
    update(groundUpdate),
  );

  type TPlayerAimActor = AActorBase & Name & Physics<CCircle> & DebugDraw & Update;

  const playerAim = level.add<TPlayerAimActor>(
    { name: 'player mouse aim' },
    physics(Circle(true, 0, 0, 5)),
    debugDraw({ zIndex: 100, drawType: 'stroke', color: '#ff0000' }),
    update(function (this: TPlayerAimActor): void {
      this.visible = !mouse.overUiElement;
      Vector.set(this.body, mouse.position);
    }),
  );

  const shieldDefaults = {
    afterHitCooldown: 5,
    regeneratesAfterHit: false,
    maxPower: 120,
    power: 0,
    regenerationBoost: 2,
    cooldownTime: 5,
    color: '#00bbff',
  };
  type TShieldDefaults = typeof shieldDefaults;

  type AShield = AActorBase &
    Name &
    DebugDraw &
    Physics &
    Update & { shield: TShieldDefaults & { afterHitCooldownTimer: TTimer } };

  const shieldTemplate = (
    x = 0,
    y = 0,
    shieldOptions: Partial<TShieldDefaults> & { afterHitCooldown?: number } = {},
  ): AShield => {
    return level.add<AShield>(
      {
        shield: {
          ...shieldDefaults,
          ...shieldOptions,
          afterHitCooldownTimer: newTimer(
            shieldOptions?.afterHitCooldown ?? shieldOptions?.afterHitCooldown,
          ),
        },
      },
      name('Base Shield'),
      debugDraw({ color: shieldDefaults.color, alpha: 0.5, zIndex: -1, drawType: 'fill' }),
      physics(
        Circle(false, x, y, shieldDefaults.maxPower),
        EOnHitResponseType.slideOff,
        function onHit(this: AShield, now, deltaSeconds, body, otherBody, otherActor, result) {
          if (this.body.radius > mainBuilding.body.radius && otherActor.name != 'bullet') {
            const { shield } = this;
            shield.power -= otherActor.name == 'meteor' ? (otherBody as CCircle).radius : 2;
            if (shield.power < 0) shield.power = 0;
            this.body.radius = shield.power;
            shield.regeneratesAfterHit = true;
            shield.afterHitCooldownTimer.reset();
            this.debugDraw.color = '#ff0000';
          }
        },
      ),
      beginPlay(function () {
        this.body.radius = this.shield.power;
      }),
      update(function (this: AShield, now: number, deltaSeconds: number) {
        const { level: levelRef, shield } = this;

        this.debugDraw.alpha = mapRangeClamped(shield.power, 0, shield.maxPower, 0, 0.3);

        // Control shield's cooldown flag and color flashing while it coolsdown
        // ! while shield is cooling down it can't regenerate
        if (shield.regeneratesAfterHit) {
          if (shield.afterHitCooldownTimer.update(deltaSeconds)) {
            shield.regeneratesAfterHit = false;
            this.debugDraw.color = shield.color;

            return;
          }

          const timerAlpha = shield.afterHitCooldownTimer.getAlpha();
          this.debugDraw.color = lerpColor('#ff0000', shield.color, timerAlpha);

          return;
        }

        // Regenerate power if there is no cooldown and power plant has power to share
        if (shield.power < shield.maxPower) {
          const powerPlantActor = levelRef.getByName('Power Plant') as APowerPlant;
          if (!powerPlantActor || powerPlantActor.empty()) return;

          shield.power += powerPlantActor.drawEnergy(deltaSeconds) * shield.regenerationBoost;
          this.body.radius = shield.power;
          this.debugDraw.color = lerpColor(shield.color, '#00dd77', pulseValue());

          return;
        }

        // Clamp power to max if regeneration went above max capacity
        if (shield.power > shield.maxPower) {
          shield.power = shield.maxPower;
          this.body.radius = shield.maxPower;
          this.debugDraw.color = shield.color;
        }
      }),
    );
  };

  type TBuilding = AActorBase &
    Name &
    Health &
    HealthBar &
    Physics<CCircle> &
    DebugDraw &
    BeginPlayFn &
    Update & { shield?: AShield };

  type TBullet = AActorBase & Name & Physics<CCircle> & Position & Movement & DebugDraw & Update;

  const buildingHealthBar = (relativePosition?: TVector, color?: string): TProgressBar =>
    healthBarWidget(Width('55px'), {
      relativePosition: relativePosition ?? Vector.new(0, -30),
      radiusAdjustment: Vector.new(0, -1),
      isRelativelyPositioned: true,
      color: color ?? 'red',
    });

  const buildingBaseBeginPlay = function (building: TBuilding): void {
    building.healthBar = building.attachments[0] as unknown as TProgressBar;
    building.heal(0);
  };

  const buildingTemplate = (
    x = 0,
    y = 0,
    nameIn: string,
    rootBody: CCircle | CPolygon,
    color: string,
    healthIn: number,
    startHealthAlpha = 0.5,
    shieldOptions?: Partial<TShieldDefaults>,
    attachmentsIn: Attachment[] = [buildingHealthBar()],
  ): TNewActorProps<TBuilding> => {
    return [
      name(nameIn),
      position(x, y),
      attachments(
        ...attachmentsIn,
        Text(nameIn, Fixed, Color('#fff'), ZIndex(2), {
          relativePosition: Vector.new(0, -15),
          radiusAdjustment: Vector.new(0, -1),
          isRelativelyPositioned: true,
          color: color ?? 'red',
        }),
      ),
      physics(
        rootBody,
        EOnHitResponseType.slideOff,
        function onHit(this: TBuilding, now, deltaSeconds, body, otherBody, otherActor, result) {
          if (otherActor.name != 'bullet') {
            this.receiveDamage((otherBody as CCircle).radius ?? 1);
          }
        },
      ),
      health(healthIn, healthIn * startHealthAlpha),
      debugDraw({ zIndex: 0, drawType: 'fill', color }),
      beginPlay(function (this: TBuilding) {
        buildingBaseBeginPlay(this);
      }),
      // prettier-ignore
      {
        shield: shieldOptions
          ? shieldTemplate(x, y, {
            maxPower: shieldOptions.maxPower ?? 70,
            regenerationBoost: shieldOptions.regenerationBoost ?? 8,
            cooldownTime: shieldOptions.cooldownTime ?? 1,
            afterHitCooldown: shieldOptions.afterHitCooldown ?? 2,
          })
          : undefined,
      },
    ] as TNewActorProps<TBuilding>;
  };

  const powerPlantProps = {
    powerLevel: 0,
    maxPower: 100,
    productionSpeed: 1,
    empty(): boolean {
      return this.powerLevel === 0;
    },
    drawEnergy(deltaSeconds: number): number {
      // no power - no draw
      if (this.powerLevel <= 0) return 0;

      this.powerLevel -= deltaSeconds;

      // if power levels where drained give only the amount above zero
      const powerDrawn =
        this.powerLevel < 0 ? deltaSeconds + (this.powerLevel as number) : deltaSeconds;
      console.log(powerDrawn);

      return powerDrawn;
    },
  };

  type APowerPlant = TBuilding & { energyProductionStatus: TProgressBar } & typeof powerPlantProps;
  level.add<APowerPlant>(
    ...buildingTemplate(
      viewport.widthHalf - 260,
      viewport.height - groundHeight + 5,
      'Power Plant',
      Circle(true, 0, 0, 18),
      '#00bbdd',
      50,
      0,
      {
        maxPower: 70,
        regenerationBoost: 8,
        cooldownTime: 1,
        afterHitCooldown: 2,
      },
      [buildingHealthBar(Vector.new(0, -30)), buildingHealthBar(Vector.new(0, -40), '#0055ff')],
    ),
    powerPlantProps,
    beginPlay(function (this: APowerPlant): void {
      buildingBaseBeginPlay(this);
      const progressBar = this.attachments[1] as TProgressBar;
      if (progressBar) {
        this.energyProductionStatus = progressBar;
        progressBar.setProgress(0);
      }
    }),
    update(function (this: APowerPlant, now: number, deltaSeconds: number) {
      // if power plant isn't destroyed produce energy
      if (this.health > 0 && this.powerLevel < this.maxPower) {
        this.powerLevel += deltaSeconds * this.productionSpeed;

        this.energyProductionStatus.setProgress(mapRangeClamped(this.powerLevel, 0, this.maxPower));
      }
    }),
  );

  const mainBuilding = level.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf,
      viewport.height - groundHeight + 5,
      'B-01',
      Circle(true, 0, 0, 40),
      '#fff',
      100,
      0.3,
      {
        maxPower: 160,
        regenerationBoost: 8,
        cooldownTime: 3,
        afterHitCooldown: 4,
      },
    ),
    update(function (this: TBuilding) {
      if (!mouse.overUiElement && mouse.leftPressed) {
        const bullet = level.spawn<TBullet>(
          name(`bullet`),
          physics(Circle(true, 0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC), EOnHitResponseType.slideOff),
          debugDraw({ zIndex: -1, drawType: 'fill', color: '#fff' }),
          position(this.body.x, this.body.y),
          movement(randomInRange(400, 450)),
        );
        level.fireInDirection(bullet, Vector.unitFromTwoVectors(playerAim.body, this.body));
      }
    }),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf - 45,
      viewport.height - groundHeight + 5,
      'B-02',
      Circle(true, 0, 0, 20),
      '#edc',
      60,
      0.4,
    ),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf + 35,
      viewport.height - groundHeight + 5,
      'B-03',
      Circle(true, 0, 0, 28),
      '#ddd',
      70,
      0.7,
    ),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf + 70,
      viewport.height - groundHeight + 5,
      'B-04',
      Circle(true, 0, 0, 18),
      '#ffe',
      50,
    ),
  );

  level.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf + 260,
      viewport.height - groundHeight + 5,
      'Ammo Factory',
      Circle(true, 0, 0, 18),
      '#ff5500',
      50,
      0.5,
      {
        maxPower: 60,
        regenerationBoost: 1,
        cooldownTime: 6,
        afterHitCooldown: 7,
      },
    ),
  );

  const meteorSpawnerComponent = {
    spawnTimer: newTimer(0.05),
    isOn: true,
  };

  type TMeteorSpawner = AActorBase & Name & Update & typeof meteorSpawnerComponent;
  type TMeteor = AActorBase & Name & Update & DebugDraw & Position & Movement;

  level.add<TMeteorSpawner>(
    meteorSpawnerComponent,
    name('meteors spawner'),
    update(function (this: TMeteorSpawner, now, deltaSeconds) {
      if (this.isOn && this.spawnTimer.update(deltaSeconds)) {
        const meteor = level.spawn<TMeteor>(
          { name: 'meteor' },
          physics(
            Circle(true, 0, 0, randomInRange(1, 4), COLLISION_TAGS.WORLD_DYNAMIC),
            EOnHitResponseType.slideOff,
            function onHit(this: TMeteor, _a, _b, body, _c, otherActor) {
              if (otherActor.name != 'meteor') level.remove(body.owner);
            },
          ),
          debugDraw({ color: '#662200', zIndex: 50 }),
          position(randomInRange(0, viewport.width + 600), -100),
          movement(randomInRange(90, 130)),
        );
        level.fireInDirection(meteor, Vector.new(randomInRange(-0.5, -0.03), 1));
      }
    }),
  );

  return level;
}
