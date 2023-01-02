import {
  AActor,
  beginPlay,
  BeginPlayFn,
  CGame,
  CLevel,
  CPolygon,
  debugDraw,
  DebugDraw,
  EOnHitResponseType,
  physics,
  Physics,
  Rectangle,
  Update,
  update,
} from '@/core';
import { gameplayUi } from '../ui';

export const marsLevel = new CLevel({ name: 'Mars Base' });
marsLevel.addUi(...gameplayUi);

export const groundHeight = 10;

type AGround = AActor<Physics<CPolygon> & DebugDraw & BeginPlayFn & Update>;
const groundUpdate = function (
  this: AGround,
  _now: number,
  _deltaSeconds: number,
  game: CGame,
): void {
  const { body } = this;
  body.x = 0;
  body.y = game.viewport.height - groundHeight;
  body.updateSizeAsRectangle(game.viewport.width, groundHeight, true);
};

marsLevel.add<AGround>(
  { name: 'ground' },
  physics<CPolygon>(Rectangle(), EOnHitResponseType.slideOff),
  debugDraw({ color: '#220000', zIndex: 10 }),
  beginPlay(groundUpdate),
  update(groundUpdate),
);
