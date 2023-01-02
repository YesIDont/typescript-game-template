import {
  AActorBase,
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
} from '@/core';
import { marsLevel } from '../levels/level-mars';

export type TPlayerAimActor = AActorBase & Name & Physics<CCircle> & DebugDraw & Update;
marsLevel.add<TPlayerAimActor>(
  { name: 'Player mouse aim' },
  physics(Circle(true, 0, 0, 5)),
  debugDraw({ zIndex: 100, drawType: 'stroke', color: '#ff0000' }),
  update(function (this: TPlayerAimActor): void {
    this.visible = !mouse.overUiElement;
    Vector.set(this.body, mouse.position);
  }),
);
