import { CBody } from '../collisions/body';
import { CCircle } from '../collisions/circle';
import { CPolygon } from '../collisions/polygon';
import { TCollisionResponse } from '../collisions/responses';
import { Physics, TUpdate } from './components';
import { Attachment } from './components/attachments';

export type AActorBase = {
  id: number;
  name: string;
  visible: boolean;
  tags: string[]; // ! numeric tags for performance
  shouldBeDeleted: boolean; // ! array as queue for deletion instead of boolean
  attachments: Attachment[];
  relativePosition: { x: number; y: number };

  /* Only if relative to another actor. Parent's position will be used to position this actor along with its relative position. */
  parent?: AActorBase;
  body?: CCircle | CPolygon;
  onHit?: TCollisionResponse;
  beginPlay?: TUpdate;
  update?: TUpdate;
  onScreenLeave?: TUpdate;
};

export type TNewActorProps<T> = Partial<T>[];
export type AActor<T> = AActorBase & T;

let ids = 0;

export const Actor = {
  hasTags(actor: AActorBase, ...tags: string[]): boolean {
    return actor.tags.some((t) => tags.includes(t));
  },
  new: function newActor<T>(...props: TNewActorProps<T>): AActor<T> {
    const id = ids;
    ids++;

    const actor = {
      id,
      name: `Actor${id}`,
      attachments: [] as Attachment[],
      visible: true,
      shouldBeDeleted: false,
      isRelativelyPositioned: false,
      relativePosition: { x: 0, y: 0 },
      tags: [] as string[],
      ...props.reduce((properties, current) => {
        return { ...properties, ...current };
      }, {}),
    };

    const actorWithPhysics = actor as unknown as AActorBase & Physics<CBody>;

    if (actorWithPhysics.body) {
      actorWithPhysics.body.owner = actor;
      actorWithPhysics.attachments.push(actorWithPhysics.body);
    }

    return actor as unknown as AActor<T>;
  },
};
