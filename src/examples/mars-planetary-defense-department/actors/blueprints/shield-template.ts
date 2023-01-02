import {
  AActorBase,
  Actor,
  beginPlay,
  CBody,
  CCircle,
  CGame,
  Circle,
  debugDraw,
  DebugDraw,
  EOnHitResponseType,
  lerpColor,
  mapRangeClamped,
  name,
  Name,
  newTimer,
  physics,
  Physics,
  pulseValue,
  TTimer,
  Update,
  update,
} from 'engine/';
import { mainBuilding } from '../buildings';
import { APowerPlant } from '../power-plant';

export const shieldDefaults = {
  afterHitCooldown: 5,
  regeneratesAfterHit: false,
  maxPower: 120,
  power: 0,
  regenerationBoost: 2,
  cooldownTime: 5,
  color: '#00bbff',
};
export type TShieldDefaults = typeof shieldDefaults;

export type AShield = AActorBase &
  Name &
  DebugDraw &
  Physics &
  Update & { shield: TShieldDefaults & { afterHitCooldownTimer: TTimer } };

export const shieldTemplate = (
  x = 0,
  y = 0,
  shieldOptions: Partial<TShieldDefaults> & { afterHitCooldown?: number } = {},
): AShield => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Actor.new<AShield>(
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
      function onHit(
        this: AShield,
        now: number,
        deltaSeconds: number,
        body: CBody,
        otherBody: CBody,
        otherActor: AActorBase,
      ) {
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
    update(function (this: AShield, now: number, deltaSeconds: number, game: CGame) {
      const { shield } = this;
      const level = game.getCurrentLevel();

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
        const powerPlantActor = level.getByName<APowerPlant>('Power Plant');
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
