import { CBody } from '../collisions/body';
import { CCircle } from '../collisions/circle';
import { CPolygon } from '../collisions/polygon';
import { TCollisionResponse } from '../collisions/responses';
import { CLevel } from '../level';
import { Physics } from './components';

export type AActorBase = {
  id: number;
  name: string;
  level: CLevel;
  body?: CCircle | CPolygon;
  visible: boolean;
  shouldBeDeleted: boolean;
  beginPlay?: () => void;
  update?: (now: number, deltaSeconds: number) => void;
  onScreenLeave?: (now: number, deltaSeconds: number) => void;
  onHit?: TCollisionResponse;
} /* & Partial<Name & Physics & DebugDraw & Update & Movement & TAHealth & TAHealthBar> */;

export type TNewActorProps<T> = Partial<T>[];
export type AActor<T> = AActorBase & T;

let ids = 0;

export function newActor<T>(levelRef: CLevel, ...props: TNewActorProps<T>): AActor<T> {
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
  } as AActor<T>;

  if ((actor as unknown as Physics<CBody>).body)
    (actor as unknown as Physics<CBody>).body.owner = actor;

  return actor;
}
