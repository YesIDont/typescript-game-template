import {
  AActorBase,
  CCircle,
  CGame,
  Circle,
  COLLISION_TAGS,
  debugDraw,
  DebugDraw,
  EOnHitResponseType,
  mouse,
  movement,
  Movement,
  name,
  Name,
  physics,
  Physics,
  position,
  Position,
  randomInRange,
  TMouse,
  Update,
  Vector,
} from '@/core';
import { groundHeight, marsLevel } from '../levels/level-mars';
import { TPlayerAimActor } from './player-aim';

export type TBullet = AActorBase &
  Name &
  Physics<CCircle> &
  Position &
  Movement &
  DebugDraw &
  Update;

mouse.on('left', 'held', (_mouse: TMouse, _deltaSeconds: number, game: CGame) => {
  const level = game.getCurrentLevel();
  const playerAimActor = level.getByName<TPlayerAimActor>('Player mouse aim');

  if (!mouse.overUiElement && level && playerAimActor) {
    const gunPosition = Vector.new(game.viewport.width / 2, game.viewport.height - groundHeight);
    const bullet = marsLevel.spawn<TBullet>(
      name(`bullet`),
      physics(Circle(true, 0, 0, 2, COLLISION_TAGS.WORLD_DYNAMIC), EOnHitResponseType.slideOff),
      debugDraw({ zIndex: -1, drawType: 'fill', color: '#fff' }),
      position(gunPosition.x, gunPosition.y),
      movement(randomInRange(200, 250)),
    );
    marsLevel.fireInDirection(bullet, Vector.unitFromTwoVectors(playerAimActor.body, gunPosition));
  }
});
