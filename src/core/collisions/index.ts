import { TVector } from '../vector';
import { CBVH } from './BVH';
import { CCircle } from './circle';
import { CPolygon } from './polygon';
import { TShape } from './proxyTypes';
import { aabbAABB, circleCircle, polygonCircle, polygonPolygon } from './SAT';

export const TAGS = {
  PLAYER: 0,
  WORLD_STATIC: 1,
  WORLD_DYNAMIC: 2,
};

export class CCollisions {
  bvh: CBVH;

  constructor(wordSize?: TVector) {
    this.bvh = new CBVH();

    if (wordSize) this.createWorldBounds(wordSize[0], wordSize[1], 200, -199);
  }

  addCircle(
    x = 0,
    y = 0,
    radius = 1,
    tag = TAGS.WORLD_STATIC,
    scale = 1,
    padding = 0,
    id = 0,
  ): CCircle {
    const body = new CCircle(x, y, radius, tag, scale, padding, id);
    this.bvh.insert(body as TShape);

    return body;
  }

  addPolygon(
    x = 0,
    y = 0,
    points = [[0, 0]],
    tag = TAGS.WORLD_STATIC,
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
    anchor: TVector = [0.5, 0.5],
    tag = TAGS.WORLD_STATIC,
    angle = 0,
    scale_x = 1,
    scale_y = 1,
    padding = 0,
  ): CPolygon {
    const points = [
      [x - width * anchor[0], y - height * anchor[0]],
      [x + width * anchor[0], y - height * anchor[0]],
      [x + width * anchor[0], y + height * anchor[0]],
      [x - width * anchor[0], y + height * anchor[0]],
    ];

    const body = new CPolygon(x, y, points, tag, angle, scale_x, scale_y, padding);
    this.bvh.insert(body as TShape);

    return body;
  }

  // Inserts bodies into the collision system
  insert(...bodies: TShape[]): CCollisions {
    for (const body of bodies) {
      this.bvh.insert(body, false);
    }

    return this;
  }

  // Removes bodies from the collision system
  remove(...bodies: TShape[]): CCollisions {
    for (const body of bodies) {
      body.markedForRemoval = true;
      this.bvh.remove(body, false);
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

  addSingleWorldBound(points: number[][], collisionPadding = 0): CPolygon {
    return this.addPolygon(0, 0, points, TAGS.WORLD_STATIC, 0, 1, 1, collisionPadding);
  }

  createWorldBounds(width: number, height: number, thickness = 10, offset = 0): CPolygon[] {
    // this is required for the status bar
    const bottomPadding = 20;
    const top = this.addSingleWorldBound([
      [offset, offset],
      [width - offset, offset],
      [width - offset, thickness + offset],
      [offset, thickness + offset],
    ]);
    const right = this.addSingleWorldBound([
      [width - thickness - offset, offset],
      [width - offset, offset],
      [width - offset, height - offset - bottomPadding],
      [width - thickness - offset, height - offset - bottomPadding],
    ]);
    const bottom = this.addSingleWorldBound([
      [offset, height - thickness - bottomPadding - offset],
      [width - offset, height - thickness - bottomPadding - offset],
      [width - offset, height - bottomPadding - offset],
      [offset, height - bottomPadding - offset],
    ]);
    const left = this.addSingleWorldBound([
      [0 + offset, offset],
      [thickness + offset, offset],
      [thickness + offset, height - bottomPadding - offset],
      [0 + offset, height - bottomPadding - offset],
    ]);

    return [top, right, bottom, left];
  }

  // eslint-disable-next-line class-methods-use-this
  areBodiesColliding(a: TShape, b: TShape, result: number[]): boolean {
    const a_polygon = a._polygon;
    const aIsStatic = a.tag !== TAGS.WORLD_STATIC;
    const bIsStatic = b.tag !== TAGS.WORLD_STATIC;
    const b_polygon = b._polygon;

    /** overlap length */
    result[0] = 0;
    /** overlap x */
    result[1] = 0;
    /** overlap y */
    result[2] = 0;

    if (
      !aIsStatic &&
      a_polygon &&
      (a._dirty_coords ||
        a.x !== a._x ||
        a.y !== a._y ||
        a.angle !== a._angle ||
        a.scale_x !== a._scale_x ||
        a.scale_y !== a._scale_y)
    ) {
      a._calculateCoords();
    }

    if (
      !bIsStatic &&
      b_polygon &&
      (b._dirty_coords ||
        b.x !== b._x ||
        b.y !== b._y ||
        b.angle !== b._angle ||
        b.scale_x !== b._scale_x ||
        b.scale_y !== b._scale_y)
    ) {
      b._calculateCoords();
    }

    if (aabbAABB(a, b)) {
      if (!aIsStatic && a_polygon && a._dirty_normals) a._calculateNormals();
      if (!bIsStatic && b_polygon && b._dirty_normals) b._calculateNormals();
      if (a_polygon) return b_polygon ? polygonPolygon(a, b, result) : polygonCircle(a, b, result);
      if (b_polygon) return polygonCircle(b, a, result, true);

      return circleCircle(a, b, result);
    }

    return false;
  }
}

export const newCollisions = (wordSize?: TVector): CCollisions => new CCollisions(wordSize);
