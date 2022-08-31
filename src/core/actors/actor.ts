import { switchCollisionResponse } from '../collisions/responses';
import { actorDefaults, actorDynamicDefaults } from './actor-defaults';
import { TActor, TNewActorProps } from './actor-types';

let ids = 0;

export function newActor<TCustomProps>(
  options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
): TActor & TCustomProps {
  const id = ids;
  ids++;
  const {
    x,
    y,
    color,
    alpha,
    drawType,
    groups,
    collisionResponse,
    radius,
    zIndex,
    ...baseOptions
  } = options;
  const { body } = options;
  const actor = {} as TActor;

  const allOptions = Object.assign({}, actorDefaults, actorDynamicDefaults, baseOptions);
  Object.entries(allOptions).forEach(([key, value]) => {
    const dynamic = actorDynamicDefaults[key];
    actor[key] = dynamic ? baseOptions[key] ?? dynamic() : value;
  });

  actor.id = id;
  actor.onHit =
    // eslint-disable-next-line @typescript-eslint/unbound-method
    options.onHit ??
    (body && collisionResponse
      ? switchCollisionResponse(collisionResponse).bind(actor)
      : actorDefaults.onHit.bind(actor));

  if (body) {
    body.id = id;
    body.owner = actor;
    if (x) body.x = x;
    if (y) body.y = y;
    if (color) body.debugDraw.color = color;
    if (drawType) body.debugDraw.drawType = drawType;
    if (alpha) body.debugDraw.alpha = alpha;
    if (radius && body.radius) body.radius = radius;
    if (zIndex != undefined) body.debugDraw.zIndex = zIndex;
  }

  return actor as TActor & TCustomProps;
}
