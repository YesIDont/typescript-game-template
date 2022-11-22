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
} from '../../core/actors/components';
import { Attachment, attachments } from '../../core/actors/components/attachments';
import { tags } from '../../core/actors/components/tags';
import { AActor, AActorBase, TNewActorProps } from '../../core/actors/new-actor';
import { CCircle, Circle } from '../../core/collisions/circle';
import { CPolygon, Rectangle } from '../../core/collisions/polygon';
import { EOnHitResponseType } from '../../core/collisions/responses';
import { COLLISION_TAGS } from '../../core/collisions/utils';
import { CGame } from '../../core/game';
import { TKeys } from '../../core/input/keyboard/keyboard';
import { TMouse } from '../../core/input/mouse';
import { CLevel } from '../../core/level';
import { TOptions } from '../../core/options';
import { TPlayer } from '../../core/player';
import { TRenderer } from '../../core/renderer';
import {
  Color,
  Fixed,
  healthBarWidget,
  Text,
  TProgressBar,
  Width,
  ZIndex,
} from '../../core/user-interface';
import { pulseValue } from '../../core/utils/animations';
import { lerpColor } from '../../core/utils/colors';
import { mapRangeClamped, randomInRange } from '../../core/utils/math';
import { newTimer, TTimer } from '../../core/utils/timer';
import { TVector, Vector } from '../../core/vector';
import { TViewport } from '../../core/viewport';
import { marsLevel } from './src/levels/mars';

const game = new CGame();

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
  const groundHeight = 10;

  type AGround = AActor<Physics<CPolygon> & DebugDraw & BeginPlayFn & Update>;
  const groundUpdate = function (this: AGround): void {
    const { body } = this;
    body.x = 0;
    body.y = viewport.height - groundHeight;
    body.updateSizeAsRectangle(viewport.width, groundHeight, true);
  };

  marsLevel.add<AGround>(
    { name: 'ground' },
    physics<CPolygon>(Rectangle(), EOnHitResponseType.slideOff),
    debugDraw({ color: '#220000', zIndex: 10 }),
    beginPlay(groundUpdate),
    update(groundUpdate),
  );

  type TPlayerAimActor = AActorBase & Name & Physics<CCircle> & DebugDraw & Update;
  const playerAim = marsLevel.add<TPlayerAimActor>(
    { name: 'player mouse aim' },
    physics(Circle(true, 0, 0, 5)),
    debugDraw({ zIndex: 100, drawType: 'stroke', color: '#ff0000' }),
    update(function (this: TPlayerAimActor): void {
      this.visible = !mouse.overUiElement;
      Vector.set(this.body, mouse.position);
    }),
  );

  type TBullet = AActorBase & Name & Physics<CCircle> & Position & Movement & DebugDraw & Update;
  const gunPosition = Vector.new(viewport.width / 2, viewport.height - groundHeight);
  mouse.on('left', 'held', () => {
    if (!mouse.overUiElement) {
      const bullet = marsLevel.spawn<TBullet>(
        name(`bullet`),
        physics(Circle(true, 0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC), EOnHitResponseType.slideOff),
        debugDraw({ zIndex: -1, drawType: 'fill', color: '#fff' }),
        position(gunPosition.x, gunPosition.y),
        movement(randomInRange(200, 250)),
      );
      marsLevel.fireInDirection(bullet, Vector.unitFromTwoVectors(playerAim.body, gunPosition));
    }
  });

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
    return marsLevel.add<AShield>(
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
        function onHit(this: AShield, now, deltaSeconds, body, otherBody, otherActor) {
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
          this.debugDraw.color = lerpColor(shield.color, '#00dd77', pulseValue(1.5));

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
      tags('repairsTarget'),
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

      return powerDrawn;
    },
  };

  type APowerPlant = TBuilding & { energyProductionStatus: TProgressBar } & typeof powerPlantProps;
  marsLevel.add<APowerPlant>(
    ...buildingTemplate(
      viewport.widthHalf - 220,
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

  const mainBuilding = marsLevel.add<TBuilding>(
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
  );

  marsLevel.add<TBuilding>(
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

  marsLevel.add<TBuilding>(
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

  marsLevel.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf + 70,
      viewport.height - groundHeight + 5,
      'B-04',
      Circle(true, 0, 0, 18),
      '#ffe',
      50,
    ),
  );

  marsLevel.add<TBuilding>(
    ...buildingTemplate(
      viewport.widthHalf + 220,
      viewport.height - groundHeight + 5,
      'Ammo Factory',
      Circle(true, 0, 0, 18),
      '#ff5500',
      50,
      0.5,
      {
        maxPower: 70,
        regenerationBoost: 4,
        cooldownTime: 6,
        afterHitCooldown: 7,
      },
    ),
  );

  const nextMeteorSpawnInSeconds = 1;
  const meteorSpawnerComponent = {
    spawnTimer: newTimer(nextMeteorSpawnInSeconds),
    isOn: true,
  };

  type TMeteorSpawner = AActorBase & Name & Update & typeof meteorSpawnerComponent;
  type TMeteor = AActorBase & Name & Update & DebugDraw & Position & Movement;

  marsLevel.add<TMeteorSpawner>(
    meteorSpawnerComponent,
    name('meteors spawner'),
    update(function (this: TMeteorSpawner, now, deltaSeconds) {
      if (this.isOn && this.spawnTimer.update(deltaSeconds)) {
        const meteor = marsLevel.spawn<TMeteor>(
          { name: 'meteor' },
          physics(
            Circle(true, 0, 0, randomInRange(1, 4), COLLISION_TAGS.WORLD_DYNAMIC),
            EOnHitResponseType.slideOff,
            function onHit(this: TMeteor, _a, _b, body, _c, otherActor) {
              if (otherActor.name != 'meteor') marsLevel.remove(body.owner);
            },
          ),
          debugDraw({ color: '#662200', zIndex: 50 }),
          position(randomInRange(0, viewport.width + 600), -100),
          movement(randomInRange(90, 130)),
        );
        marsLevel.fireInDirection(meteor, Vector.new(randomInRange(-0.5, -0.03), 1));
      }
    }),
  );

  return marsLevel;
}
