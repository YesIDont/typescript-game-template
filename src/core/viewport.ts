import { TAxis, TSign } from '../types/base-types';
import { on } from './utils/dom/dom';
import { getWindowInnerSize } from './utils/dom/get-window-inner-size';
import { clamp, flerp, sign } from './utils/math';
import { TVector, Vector } from './vector';

export type TViewport = {
  zoom: number;
  pointer: TVector;
  pointerLastPosition: TVector;
  size: TVector;
  sizeHalf: TVector;
  offset: TVector;
  focusPoint: TVector;
  updateViewportSize(): void;
  moveViewport(deltaSeconds: number, direction: TSign, axis: TAxis): void;
  moveViewportLerp(this: TViewport, deltaSeconds: number, direction: TSign, axis: TAxis): void;
  setFocusPoint(point: TVector): void;
  followFocus(deltaSeconds?: number, speed?: number): void;
  followFocusLerp(deltaSeconds: number, speed: number): void;
  screenCoordsToWorldSpace(point: TVector, out: TVector): void;
  worldCoordsToScreenSpace(this: TViewport, x: number, y: number): TVector;
  updatePointerPosition(event: MouseEvent): void;
  getPointerWorldPosition(this: TViewport): TVector;
  setZoom(direction: number, multiplier: number): number;
  setupEvents(): void;
};

const x = 0;
const y = 1;

export function newViewport(): TViewport {
  const pointer = Vector.new();
  const pointerLastPosition = Vector.new();
  const focusPoint = Vector.new();
  const size = Vector.new();
  const sizeHalf = Vector.new();
  const offset = Vector.new();
  const movementSpeed = 500;
  const minZoom = 0.000001;
  const maxZoom = 1;

  function updateViewportSize(): void {
    const [width, height] = getWindowInnerSize();

    Vector.set(size, width, height);
    Vector.set(sizeHalf, width * 0.5, height * 0.5);
  }

  updateViewportSize();

  return {
    zoom: 0.000002,
    size,
    sizeHalf,
    offset,
    focusPoint,
    pointer,
    pointerLastPosition,
    updateViewportSize,

    moveViewport(this: TViewport, deltaSeconds: number, direction: TSign, axis: TAxis): void {
      const distance = (movementSpeed * direction * deltaSeconds) / (1 - this.zoom);
      // offset[axis] = lerp(offset[axis], offset[axis] + distance, deltaSeconds, 10);

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      offset[axis] = offset[axis] + distance;
    },

    moveViewportLerp(this: TViewport, deltaSeconds: number, direction: TSign, axis: TAxis): void {
      const distance = (movementSpeed * direction * deltaSeconds) / (1 - this.zoom);

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      offset[axis] = flerp(offset[axis], offset[axis] + distance, deltaSeconds, 10);
    },

    /** Set position of given game object as focus point. */
    setFocusPoint(this: TViewport, point: TVector): void {
      focusPoint[x] = point[x];
      focusPoint[y] = point[y];
    },

    followFocus(this: TViewport, deltaSeconds = 0.0001, speed = 10000): void {
      offset[x] = size[x] * 0.5 - this.focusPoint[x] * this.zoom;
      offset[y] = size[y] * 0.5 + this.focusPoint[y] * this.zoom;
    },

    followFocusLerp(this: TViewport, deltaSeconds = 0.0001, speed = 10000): void {
      offset[x] = flerp(offset[x], size[x] * 0.5 - focusPoint[x] * this.zoom, deltaSeconds, speed);
      offset[y] = flerp(offset[y], size[y] * 0.5 + focusPoint[y] * this.zoom, deltaSeconds, speed);
    },

    screenCoordsToWorldSpace(this: TViewport, point: TVector, out: TVector): void {
      out[x] = -(offset[x] - point[x]) / this.zoom;
      out[y] = -(size[y] - offset[y] - point[y]) / this.zoom;
    },

    worldCoordsToScreenSpace(this: TViewport, xIn: number, yIn: number): TVector {
      const nx = offset[x] + xIn * this.zoom;
      const ny = size[y] - offset[y] + yIn * this.zoom;

      return [nx, ny];
    },

    updatePointerPosition(event: MouseEvent): void {
      const e = event ?? (window.event as MouseEvent);
      pointer[x] = e.pageX || e.clientX || 0;
      pointer[y] = e.pageY || e.clientY || 0;
    },

    getPointerWorldPosition(this: TViewport): TVector {
      const position: TVector = [0, 0];
      this.screenCoordsToWorldSpace(pointer, position);

      return position;
    },

    setZoom(this: TViewport, direction: number, multiplier = 1): number {
      let { zoom } = this;

      // Browsers can set deltaY/X to 1/-1 or other numbers, safe way
      // to deal with this is to use Math.sign() to just take roll direction
      const delta = sign(direction) * zoom * 0.1 * multiplier;
      zoom = clamp(zoom - delta, minZoom, maxZoom);

      this.zoom = zoom;
      this.followFocus(1, 1);

      return zoom;
    },

    setupEvents(): void {
      on('resize', updateViewportSize, window as unknown as Node);
      on('mousemove', this.updatePointerPosition.bind(this));
    },
  };
}
