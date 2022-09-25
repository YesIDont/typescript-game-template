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
  tags: string[];
  shouldBeDeleted: boolean;
  body?: CCircle | CPolygon;
  onHit?: TCollisionResponse;
  // hasTags(...tags: string[]): boolean;
  beginPlay?: () => void;
  update?: (now: number, deltaSeconds: number) => void;
  onScreenLeave?: (now: number, deltaSeconds: number) => void;
};

export type TNewActorProps<T> = Partial<T>[];
export type AActor<T> = AActorBase & T;

let ids = 0;

export const Actor = {
  hasTags(actor: AActorBase, ...tags: string[]): boolean {
    return actor.tags.some((t) => tags.includes(t));
  },
  new: function newActor<T>(levelRef: CLevel, ...props: TNewActorProps<T>): AActor<T> {
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
      tags: [] as string[],
      ...props.reduce((properties, current) => {
        return { ...properties, ...current };
      }, {}),
    };

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

    return actor as AActor<T>;
  },
};
