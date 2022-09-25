import { CBody } from '../collisions/body';
import { CCircle } from '../collisions/circle';
import { CPolygon } from '../collisions/polygon';
import { TCollisionResponse } from '../collisions/responses';
import { CLevel } from '../level';
import { Physics } from './components';
import { Attachment } from './components/attachments';

export type AActorBase = {
  id: number;
  name: string;
  level: CLevel;
  visible: boolean;
  hasAttachments: boolean;
  isRelativelyPositioned: boolean;
  attachments: Attachment[];
  body?: CCircle | CPolygon;
  shouldBeDeleted: boolean;
  onHit?: TCollisionResponse;
  beginPlay?: () => void;
  update?: (now: number, deltaSeconds: number) => void;
  onScreenLeave?: (now: number, deltaSeconds: number) => void;
};

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
    attachments: [] as Attachment[],
    visible: true,
    shouldBeDeleted: false,
    hasAttachments: false,
    isRelativelyPositioned: false,
    ...props.reduce((properties, current) => {
      return { ...properties, ...current };
    }, {}),
  } as AActor<T>;

  const actorWithPhysics = actor as unknown as AActorBase & Physics<CBody>;
  if (actorWithPhysics.body) {
    actorWithPhysics.body.owner = actor;
    if (actorWithPhysics.body?.isRelativelyPositioned) {
      actorWithPhysics.attachments.push(actorWithPhysics.body);
    }
  }

  if (actor.attachments && actor.attachments.length > 0) {
    actor.hasAttachments = true;
  }

  return actor;
}
