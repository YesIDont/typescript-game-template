import {
  AActorBase,
  Actor,
  CCircle,
  Circle,
  debugDraw,
  DebugDraw,
  mouse,
  Name,
  physics,
  Physics,
  Update,
  update,
  Vector,
} from 'engine/';

export type TPlayerAimActor = AActorBase & Name & Physics<CCircle> & DebugDraw & Update;
export const playerAimActor = Actor.new<TPlayerAimActor>(
  { name: 'Player mouse aim' },
  physics(Circle(true, 0, 0, 5)),
  debugDraw({ zIndex: 100, drawType: 'stroke', color: '#ff0000' }),
  update(function (this: TPlayerAimActor): void {
    this.visible = !mouse.overUiElement;
    Vector.set(this.body, mouse.position);
  }),
);
