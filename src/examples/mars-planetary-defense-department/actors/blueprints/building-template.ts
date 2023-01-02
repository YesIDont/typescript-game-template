import {
  Color,
  Fixed,
  healthBarWidget,
  Text,
  TProgressBar,
  Width,
  ZIndex,
} from 'core/user-interface';
import {
  AActorBase,
  Attachment,
  attachments,
  beginPlay,
  BeginPlayFn,
  CBody,
  CCircle,
  CGame,
  CPolygon,
  debugDraw,
  DebugDraw,
  EOnHitResponseType,
  health,
  Health,
  HealthBar,
  name,
  Name,
  physics,
  Physics,
  Position,
  position,
  tags,
  TNewActorProps,
  TVector,
  Update,
  Vector,
} from 'engine/';
import { AShield, shieldTemplate, TShieldDefaults } from './shield-template';

export type TBuilding = AActorBase &
  Name &
  Health &
  HealthBar &
  Position &
  Physics<CCircle> &
  DebugDraw &
  BeginPlayFn &
  Update & { shield?: AShield };

export const buildingHealthBar = (relativePosition?: TVector, color?: string): TProgressBar =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  healthBarWidget(Width('55px'), {
    relativePosition: relativePosition ?? Vector.new(0, -30),
    radiusAdjustment: Vector.new(0, -1),
    isRelativelyPositioned: true,
    color: color ?? 'red',
  });

export const buildingBaseBeginPlay = function (building: TBuilding, game: CGame): void {
  building.healthBar = building.attachments[0] as unknown as TProgressBar;
  building.heal(0);
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  building.setPosition(game.viewport.widthHalf + building.x, game.viewport.height + building.y);
};

export function buildingTemplate(
  nameIn: string,
  x = 0,
  y = 0,
  rootBody: CCircle | CPolygon,
  color: string,
  healthIn: number,
  startHealthAlpha = 0.5,
  shieldOptions?: Partial<TShieldDefaults>,
  attachmentsIn: Attachment[] = [buildingHealthBar()],
): TNewActorProps<TBuilding> {
  const buildingAttachments = attachments(
    ...attachmentsIn,
    Text(nameIn, Fixed, Color('#fff'), ZIndex(2), {
      relativePosition: Vector.new(0, -15),
      radiusAdjustment: Vector.new(0, -1),
      isRelativelyPositioned: true,
      color: color ?? 'red',
    }),
  );

  const buildingPhysics = physics(
    rootBody,
    EOnHitResponseType.slideOff,
    function onHit(
      this: TBuilding,
      _now: number,
      _deltaSeconds: number,
      _body: CBody,
      otherBody: CBody,
      otherActor: AActorBase,
    ) {
      if (otherActor.name != 'bullet') {
        this.receiveDamage((otherBody as CCircle).radius ?? 1);
      }
    },
  );

  // prettier-ignore
  const buildingShield = {
    shield: shieldOptions
      ? shieldTemplate(x, y, {
        maxPower: shieldOptions.maxPower ?? 70,
        regenerationBoost: shieldOptions.regenerationBoost ?? 8,
        cooldownTime: shieldOptions.cooldownTime ?? 1,
        afterHitCooldown: shieldOptions.afterHitCooldown ?? 2,
      })
      : undefined,
  }

  return [
    name(nameIn),
    tags('repairsTarget'),
    position(x, y),
    health(healthIn, healthIn * startHealthAlpha),
    buildingAttachments,
    buildingPhysics,
    buildingShield,
    debugDraw({ zIndex: 0, drawType: 'fill', color }),
    beginPlay(function (this: TBuilding, _now: number, _deltaSeconds: number, game: CGame) {
      buildingBaseBeginPlay(this, game);
    }),
  ] as TNewActorProps<TBuilding>;
}
