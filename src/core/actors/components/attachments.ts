import { CCircle } from '../../collisions/circle';
import { TVector } from '../../vector';
import { MovingActor } from './movement';
import { WithPositionSet } from './position';

export interface WithRelativePosition {
  relativePosition: TVector;
  radiusAdjustment: TVector;
  isRelativelyPositioned: boolean;
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

export function updateActorAttachments(actor: MovingActor): void {
  actor.attachments?.forEach((item: Attachment) => {
    if (!item.isRelativelyPositioned) {
      return;
    }

    let { x, y } = item.relativePosition;

    // ! you need actor boudns not radius (the body isn't avilalbe here)
    const { x: xA, y: yA } = item.radiusAdjustment;
    if (xA != 0 && (actor as unknown as CCircle).radius) {
      x += (actor as unknown as CCircle).radius * xA;
    }
    if (yA != 0 && (actor as unknown as CCircle).radius) {
      y += (actor as unknown as CCircle).radius * yA;
    }
    if (item.setPosition) {
      item.setPosition(actor.x + x, actor.y + y);

      return;
    }
    if (item.x !== undefined && item.y !== undefined) {
      item.x = actor.x + x;
      item.y = actor.y + y;
    }
  });
}
