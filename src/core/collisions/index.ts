import { TVector } from '../vector';
import { CBody } from './body';
import { CBVH } from './BVH';
import { CCircle } from './circle';
import { CPolygon } from './polygon';
import { TShape } from './proxyTypes';
import { aabbAABB, circleCircle, polygonCircle, polygonPolygon } from './SAT';
import { TCollisionResult } from './types';
import { COLLISION_TAGS } from './utils';

export class CCollisions {
  bvh: CBVH;
  result: TCollisionResult = [0, 0, 0];

  constructor(wordSize?: TVector) {
    this.bvh = new CBVH();

    if (wordSize) this.createWorldBounds(wordSize.x, wordSize.y, 200, -199);
  }

  addCircle(
    x = 0,
    y = 0,
    radius = 1,
    tag = COLLISION_TAGS.WORLD_STATIC,
    scale = 1,
    padding = 0,
  ): CCircle {
    const body = new CCircle(x, y, radius, tag, scale, padding);
    this.bvh.insert(body as TShape);

    return body;
  }

  addPolygon(
    x = 0,
    y = 0,
    points = [[0, 0]],
    tag = COLLISION_TAGS.WORLD_STATIC,
    angle = 0,
    scale_x = 1,
    scale_y = 1,
    padding = 0,
  ): CPolygon {
    const body = new CPolygon(x, y, points, tag, angle, scale_x, scale_y, padding);
    this.bvh.insert(body as TShape);

    return body;
  }

  addRectangle(
    x = 0,
    y = 0,
    width = 1,
    height = 1,
    tag = COLLISION_TAGS.WORLD_STATIC,
    angle = 0,
    scale_x = 1,
    scale_y = 1,
    padding = 0,
  ): CPolygon {
    const body = new CPolygon(x, y, [], tag, angle, scale_x, scale_y, padding);
    body.updateSizeAsRectangle(width, height);
    this.bvh.insert(body as TShape);

    return body;
  }

  // Inserts bodies into the collision system
  insert(...bodies: CBody[]): CCollisions {
    for (const body of bodies) {
      this.bvh.insert(body, false);
    }

    return this;
  }

  // Removes bodies from the collision system
  remove(...bodies: CBody[]): CCollisions {
    for (const body of bodies) {
      this.bvh.remove(body);
    }

    return this;
  }

  // Updates the collision system. This should be called before any collisions are tested.
  update(): CCollisions {
    this.bvh.update();

    return this;
  }

  // Draws the bodies within the system to a CanvasRenderingContext2D's current path
  draw(context: CanvasRenderingContext2D): void {
    const { bodies } = this.bvh;
    const count = bodies.length;

    for (let i = 0; i < count; ++i) {
      bodies[i].draw(context);
    }
  }

  // Returns a list of potential collisions
  getPotentials(shape: TShape): TShape[] {
    return this.bvh.potentials(shape);
  }

  addSingleWorldBound(points: number[][]): CPolygon {
    return new CPolygon(0, 0, points);
  }

  createWorldBounds(width: number, height: number, thickness = 10, offset = 0): CPolygon[] {
    const top = this.addSingleWorldBound([
      [offset, offset],
      [width - offset, offset],
      [width - offset, thickness + offset],
      [offset, thickness + offset],
    ]);
    const right = this.addSingleWorldBound([
      [width - thickness - offset, offset],
      [width - offset, offset],
      [width - offset, height - offset],
      [width - thickness - offset, height - offset],
    ]);
    const bottom = this.addSingleWorldBound([
      [offset, height - thickness - offset],
      [width - offset, height - thickness - offset],
      [width - offset, height - offset],
      [offset, height - offset],
    ]);
    const left = this.addSingleWorldBound([
      [0 + offset, offset],
      [thickness + offset, offset],
      [thickness + offset, height - offset],
      [0 + offset, height - offset],
    ]);

    return [top, right, bottom, left];
  }

  // eslint-disable-next-line class-methods-use-this
  areBodiesColliding(a: TShape, b: TShape): boolean {
    const a_polygon = a._polygon;
    const aIsStatic = a.tag !== COLLISION_TAGS.WORLD_STATIC;
    const bIsStatic = b.tag !== COLLISION_TAGS.WORLD_STATIC;
    const b_polygon = b._polygon;
    const { result } = this;

    /** overlap length */
    result[0] = 0;
    /** overlap x */
    result[1] = 0;
    /** overlap y */
    result[2] = 0;

    if (
      !aIsStatic &&
      a_polygon &&
      ((a as CPolygon)._dirty_coords ||
        a.x !== (a as CPolygon)._x ||
        a.y !== (a as CPolygon)._y ||
        (a as CPolygon).angle !== (a as CPolygon)._angle ||
        (a as CPolygon).scale_x !== (a as CPolygon)._scale_x ||
        (a as CPolygon).scale_y !== (a as CPolygon)._scale_y)
    ) {
      (a as CPolygon)._calculateCoords();
    }

    if (
      !bIsStatic &&
      b_polygon &&
      ((b as CPolygon)._dirty_coords ||
        b.x !== (b as CPolygon)._x ||
        b.y !== (b as CPolygon)._y ||
        (b as CPolygon).angle !== (b as CPolygon)._angle ||
        (b as CPolygon).scale_x !== (b as CPolygon)._scale_x ||
        (b as CPolygon).scale_y !== (b as CPolygon)._scale_y)
    ) {
      (b as CPolygon)._calculateCoords();
    }

    if (aabbAABB(a, b)) {
      if (!aIsStatic && a_polygon && (a as CPolygon)._dirty_normals)
        (a as CPolygon)._calculateNormals();
      if (!bIsStatic && b_polygon && (b as CPolygon)._dirty_normals)
        (b as CPolygon)._calculateNormals();
      if (a_polygon)
        return b_polygon
          ? polygonPolygon(a as CPolygon, b as CPolygon, result)
          : polygonCircle(a as CPolygon, b as CCircle, result);
      if (b_polygon) return polygonCircle(b as CPolygon, a as CCircle, result, true);

      return circleCircle(a as CCircle, b as CCircle, result);
    }

    return false;
  }
}

export const newCollisions = (wordSize?: TVector): CCollisions => new CCollisions(wordSize);
