import { clamp } from './utils/math';
import { TVector } from './vector';
import { TViewport } from './viewport';

export type DrawType = 'fill' | 'stroke';

export class newDraw {
  context: CanvasRenderingContext2D;
  viewport: TViewport;

  constructor(context: CanvasRenderingContext2D, viewport: TViewport) {
    this.context = context;
    this.viewport = viewport;
  }
  circle(x: number, y: number, radius: number, color = '#fff', style: DrawType = 'stroke'): void {
    const { context } = this;
    const { zoom } = this.viewport;
    context[`${style as string}Style`] = color;
    context.beginPath();
    context.arc(x * zoom, y * zoom, radius * zoom, 0, Math.PI * 2);
    context[style]();
  }

  elipse(
    x: number,
    y: number,
    radius: number,
    flattening: TVector,
    angle = 0,
    color = '#fff',
    style: DrawType = 'stroke',
  ): void {
    const { context } = this;
    const { zoom } = this.viewport;

    context[`${style as string}Style`] = color;
    context.beginPath();
    const radiusScaled = radius * zoom;
    context.ellipse(
      x * zoom,
      y * zoom,
      flattening[0] * radiusScaled,
      flattening[1] * radiusScaled,
      angle,
      0,
      Math.PI * 2,
    );
    context[style]();
  }

  line(start: TVector, end: TVector, color = '#fff', thickness = 1): void {
    const { context } = this;
    const { zoom } = this.viewport;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = thickness;
    context.beginPath();
    context.moveTo(start[0] * zoom, start[1] * zoom);
    context.lineTo(end[0] * zoom, end[1] * zoom);
    context.stroke();
  }

  /* Draws corners around selected point like so:
    ___  ___
    |       |
        o
    |__   __|

  */
  rectangleSelection(
    x: number,
    y: number,
    width: number,
    color: string,
    thickness = 1,
    drawShadow = true,
  ): void {
    const { context } = this;
    const { zoom } = this.viewport;

    // add shadow by drawing the same stuff with dark color
    if (drawShadow)
      this.rectangleSelection(
        x,
        y,
        width - thickness * 0.5,
        'rgba(0, 0, 0, 0.5)',
        thickness * 3 * (1 - zoom),
        false,
      );

    const xz = x * zoom;
    const yz = y * zoom;
    const radius = clamp(width * zoom * 1.2, 15, width * 1.3);
    const margin = radius / 2;
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = thickness;

    context.moveTo(xz - radius, yz - margin);
    context.lineTo(xz - radius, yz - radius);
    context.lineTo(xz - margin, yz - radius);

    context.moveTo(xz + margin, yz - radius);
    context.lineTo(xz + radius, yz - radius);
    context.lineTo(xz + radius, yz - margin);

    context.moveTo(xz + radius, yz + margin);
    context.lineTo(xz + radius, yz + radius);
    context.lineTo(xz + margin, yz + radius);

    context.moveTo(xz - margin, yz + radius);
    context.lineTo(xz - radius, yz + radius);
    context.lineTo(xz - radius, yz + margin);

    context.stroke();
  }

  path(
    startX: number,
    startY: number,
    /* Flat array of pairs of numbers */
    path: number[],
    numberOfSteps: number,
    color = '#2299ff',
  ): void {
    if (path.length === 0) return;

    const { context } = this;
    const { zoom } = this.viewport;

    context.lineWidth = 1;
    context.strokeStyle = color;

    context.beginPath();
    context.moveTo(startX * zoom, startY * zoom);

    let i = 0;
    const length = numberOfSteps * 2;
    for (i = 0; i < length; i += 2) {
      context.lineTo(path[i] * zoom, path[i + 1] * zoom);
    }

    context.stroke();
  }
}
