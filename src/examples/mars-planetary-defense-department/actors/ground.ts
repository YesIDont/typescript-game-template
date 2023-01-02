import {
  AActor,
  Actor,
  beginPlay,
  BeginPlayFn,
  CGame,
  CPolygon,
  DebugDraw,
  debugDraw,
  EOnHitResponseType,
  Physics,
  physics,
  Rectangle,
  Update,
  update,
} from 'engine/';

export const groundHeight = 30;

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

export const groundActor = Actor.new<AGround>(
  { name: 'ground' },
  physics<CPolygon>(Rectangle(), EOnHitResponseType.slideOff),
  debugDraw({ color: '#220000', zIndex: 10 }),
  beginPlay(groundUpdate),
  update(groundUpdate),
);
