import { twoPI } from '../utils/math';
import { CBody } from './body';

export class CCircle extends CBody {
  radius: number;
  scale: number;

  constructor(x = 0, y = 0, radius = 0, tag = 0, scale = 1, padding = 0, id = 0) {
    super(x, y, padding, tag, id);

    this.radius = radius;
    this.scale = scale;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { x, y, radius: radiusWithoutScale, scale } = this;
    const radius = radiusWithoutScale * scale;

    context.beginPath();
    context.arc(x, y, radius, 0, twoPI);
    context[this.drawType]();
  }
}
