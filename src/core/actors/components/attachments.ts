import { CCircle } from '../../collisions/circle';
import { TVector, Vector } from '../../vector';
import { MovingActor } from './movement';
import { WithPositionSet } from './position';

// ! for now bodies are automatically attached as attachments in new-actor.ts

export interface WithRelativePosition {
  relativePosition: TVector;
  radiusAdjustment: TVector;
}

export type Attachment = WithRelativePosition & Partial<WithPositionSet> & Partial<TVector>;

export type Attachments = {
  attachments: Attachment[];
};

export function attachments(...attached: Attachment[]): Attachments {
  return {
    attachments: [...attached],
  };
}

// export const isRelativelyPositioned = (entity: WithRelativePosition): boolean =>
//   !Vector.isZero(entity.relativePosition);

export function updateActorAttachments(actor: MovingActor): void {
  actor.attachments?.forEach((item: Attachment) => {
    let { x, y } = item.relativePosition;

    // ! you need actor bounds not radius (the body isn't available here)
    const { x: xA, y: yA } = item.radiusAdjustment ?? Vector.zero;
    const radius = (actor.body as unknown as CCircle).radius ?? undefined;

    if (xA != 0 && radius) {
      x += radius * xA;
    }
    if (yA != 0 && radius) {
      y += radius * yA;
    }

    if (!item.setPosition) throw Error('No position setter');

    item.setPosition(actor.x + x, actor.y + y);
  });
}
