import { CBody } from '../collisions/body';
import { TCollisionResponse } from '../collisions/responses';
import { CLevel } from '../level';
import { TAHealth, TAHealthBar } from './components';
import { TADebugDraw } from './components/debug-draw';
import { TAMovement } from './components/movement';
import { TAName } from './components/name';
import { TAPhysics } from './components/physics';
import { TAUpdate } from './components/update';

export type TActor = {
  id: number;
  name: string;
  level: CLevel;
  body?: CBody;
  visible: boolean;
  shouldBeDeleted: boolean;
  beginPlay?: () => void;
  update?: (now: number, deltaSeconds: number) => void;
  onScreenLeave?: (now: number, deltaSeconds: number) => void;
  onHit?: TCollisionResponse;
} & Partial<TAName & TAPhysics & TADebugDraw & TAUpdate & TAMovement & TAHealth & TAHealthBar>;

export type TNewActorProps<T> = Partial<T>[];

let ids = 0;

export function newActor<T>(levelRef: CLevel, ...props: TNewActorProps<T>): T {
  const id = ids;
  ids++;

  const actor = {
    id,
    name: `Actor${id}`,
    level: levelRef,
    visible: true,
    shouldBeDeleted: false,
    ...props.reduce((properties, current) => {
      return { ...properties, ...current };
    }, {}),
  } as TActor & T;

  if (actor.body) actor.body.owner = actor;

  return actor;
}
