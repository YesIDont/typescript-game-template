import { DebugDraw } from '../actors/components';
import { twoPI } from '../utils/math';
import { CBody } from './body';

export class CCircle extends CBody {
  radius: number;
  scale: number;

  constructor(x = 0, y = 0, radius = 0, tag = 0, scale = 1, padding = 0) {
    super(x, y, padding, tag);

    this.radius = radius;
    this.scale = scale;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { x, y, radius: radiusWithoutScale, scale, owner } = this;
    const { debugDraw } = owner as unknown as DebugDraw;
    const radius = radiusWithoutScale * scale;

    context[`${debugDraw.drawType}Style`] = debugDraw.getColor();
    context.beginPath();
    context.arc(x, y, radius, 0, twoPI);
    context[debugDraw.drawType]();
  }
}

export const Circle = (x = 0, y = 0, radius = 0, tag = 0, scale = 1, padding = 0): CCircle =>
  new CCircle(x, y, radius, tag, scale, padding);
