import { CBody } from './body';
import { CBVHBranch } from './BVHBranch';
import { CCircle } from './circle';
import { CPolygon } from './polygon';
import { TShape } from './proxyTypes';

const branchPool: CBVHBranch[] = [];
const { min, max } = Math;

export class CBVH {
  root: CBVHBranch | TShape | undefined;
  bodies: CBody[];
  boundsColor = '#bbb';

  constructor() {
    this.root = undefined;
    this.bodies = [];
  }

  // Inserts a body into the BVH
  insert(shape: CBody, updating = false): void {
    const isPolygon = shape._polygon;
    if (!updating) {
      this.bodies.push(shape);
    }

    const body_x = shape.x;
    const body_y = shape.y;

    if (
      isPolygon &&
      ((shape as CPolygon)._dirty_coords ||
        (shape as CPolygon).x !== (shape as CPolygon)._x ||
        (shape as CPolygon).y !== (shape as CPolygon)._y ||
        (shape as CPolygon).angle !== (shape as CPolygon)._angle ||
        (shape as CPolygon).scale_x !== (shape as CPolygon)._scale_x ||
        (shape as CPolygon).scale_y !== (shape as CPolygon)._scale_y)
    ) {
      (shape as CPolygon)._calculateCoords();
    }

    const padding = shape._bvh_padding;
    const radius = isPolygon ? 0 : (shape as CCircle).radius * (shape as CCircle).scale;
    const body_min_x = (isPolygon ? (shape as CPolygon)._min_x : body_x - radius) - padding;
    const body_min_y = (isPolygon ? (shape as CPolygon)._min_y : body_y - radius) - padding;
    const body_max_x = (isPolygon ? (shape as CPolygon)._max_x : body_x + radius) + padding;
    const body_max_y = (isPolygon ? (shape as CPolygon)._max_y : body_y + radius) + padding;

    shape._bvh_min_x = body_min_x;
    shape._bvh_min_y = body_min_y;
    shape._bvh_max_x = body_max_x;
    shape._bvh_max_y = body_max_y;

    let current = this.root;

    if (!current) {
      this.root = shape;

      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // Branch
      if (current._bvh_branch) {
        const left = current._bvh_left as TShape;
        /** Get left AABB */
        const {
          _bvh_min_x: left_min_x,
          _bvh_min_y: left_min_y,
          _bvh_max_x: left_max_x,
          _bvh_max_y: left_max_y,
        } = left;

        /** Simulate new left AABB by extending it with newCircle AABB */
        const left_new_min_x = min(body_min_x, left_min_x);
        const left_new_min_y = min(body_min_y, left_min_y);
        const left_new_max_x = max(body_max_x, left_max_x);
        const left_new_max_y = max(body_max_y, left_max_y);

        const left_volume = (left_max_x - left_min_x) * (left_max_y - left_min_y);
        const left_new_volume =
          (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
        const left_difference = left_new_volume - left_volume;

        /** Get right AABB */
        const right = current._bvh_right! as TShape;
        const {
          _bvh_min_x: right_min_x,
          _bvh_min_y: right_min_y,
          _bvh_max_x: right_max_x,
          _bvh_max_y: right_max_y,
        } = right;

        /** Simulate new right AABB by extending it with newCircle AABB */
        const right_new_min_x = min(body_min_x, right_min_x);
        const right_new_min_y = min(body_min_y, right_min_y);
        const right_new_max_x = max(body_max_x, right_max_x);
        const right_new_max_y = max(body_max_y, right_max_y);

        const right_volume = (right_max_x - right_min_x) * (right_max_y - right_min_y);
        const right_new_volume =
          (right_new_max_x - right_new_min_x) * (right_new_max_y - right_new_min_y);
        const right_difference = right_new_volume - right_volume;

        current._bvh_min_x = min(left_new_min_x, right_new_min_x);
        current._bvh_min_y = min(left_new_min_y, right_new_min_y);
        current._bvh_max_x = max(left_new_max_x, right_new_max_x);
        current._bvh_max_y = max(left_new_max_y, right_new_max_y);

        current = left_difference <= right_difference ? left : right;
      }
      // Leaf
      else {
        const grandparent = current._bvh_parent;
        const {
          _bvh_min_x: parent_min_x,
          _bvh_min_y: parent_min_y,
          _bvh_max_x: parent_max_x,
          _bvh_max_y: parent_max_y,
        } = current;
        // eslint-disable-next-line no-multi-assign
        const new_parent =
          branchPool.length > 0
            ? branchPool.pop()!
            : /* prettier-ignore */ {
              _bvh_parent: undefined,
              _bvh_left: undefined,
              _bvh_right: undefined,
              _bvh_min_x: 0,
              _bvh_min_y: 0,
              _bvh_max_x: 0,
              _bvh_max_y: 0,
              _bvh_branch: true,
            };
        shape._bvh_parent = new_parent;
        current._bvh_parent = new_parent;

        new_parent._bvh_parent = grandparent;
        new_parent._bvh_left = current;
        new_parent._bvh_right = shape;
        new_parent._bvh_min_x = min(body_min_x, parent_min_x);
        new_parent._bvh_min_y = min(body_min_y, parent_min_y);
        new_parent._bvh_max_x = max(body_max_x, parent_max_x);
        new_parent._bvh_max_y = max(body_max_y, parent_max_y);

        if (!grandparent) {
          this.root = new_parent;
        } else if (grandparent._bvh_left === current) {
          grandparent._bvh_left = new_parent;
        } else {
          grandparent._bvh_right = new_parent;
        }

        break;
      }
    }
  }

  remove(shape: CBody, updating = false): void {
    if (!updating) {
      this.bodies.splice(this.bodies.indexOf(shape), 1);
    }

    if (this.root === shape) {
      this.root = undefined;

      return;
    }

    const parent = shape._bvh_parent!;
    const grandparent = parent._bvh_parent;
    const parent_left = parent._bvh_left;
    const sibling = (parent_left === shape ? parent._bvh_right : parent_left)!;

    sibling._bvh_parent = grandparent;

    if (grandparent) {
      if (grandparent._bvh_left === parent) {
        grandparent._bvh_left = sibling;
      } else {
        grandparent._bvh_right = sibling;
      }

      let branch = grandparent;

      while (branch) {
        const left = branch._bvh_left!;
        const left_min_x = left._bvh_min_x;
        const left_min_y = left._bvh_min_y;
        const left_max_x = left._bvh_max_x;
        const left_max_y = left._bvh_max_y;

        const right = branch._bvh_right!;
        const right_min_x = right._bvh_min_x;
        const right_min_y = right._bvh_min_y;
        const right_max_x = right._bvh_max_x;
        const right_max_y = right._bvh_max_y;

        branch._bvh_min_x = left_min_x < right_min_x ? left_min_x : right_min_x;
        branch._bvh_min_y = left_min_y < right_min_y ? left_min_y : right_min_y;
        branch._bvh_max_x = left_max_x > right_max_x ? left_max_x : right_max_x;
        branch._bvh_max_y = left_max_y > right_max_y ? left_max_y : right_max_y;

        branch = branch._bvh_parent as CBVHBranch;
      }
    } else {
      this.root = sibling;
    }

    branchPool.push(parent);
  }

  // Updates the BVH. Moved bodies are removed/inserted.
  update(): void {
    const { bodies } = this;
    const count = bodies.length;

    for (let i = 0; i < count; ++i) {
      const body = bodies[i];

      let update = false;

      if (!update && body.padding !== body._bvh_padding) {
        body._bvh_padding = body.padding;
        update = true;
      }

      if (!update) {
        const polygon = body._polygon;

        if (
          polygon &&
          ((body as CPolygon)._dirty_coords ||
            body.x !== (body as CPolygon)._x ||
            body.y !== (body as CPolygon)._y ||
            (body as CPolygon).angle !== (body as CPolygon)._angle ||
            (body as CPolygon).scale_x !== (body as CPolygon)._scale_x ||
            (body as CPolygon).scale_y !== (body as CPolygon)._scale_y)
        ) {
          (body as CPolygon)._calculateCoords();
        }

        const { x } = body;
        const { y } = body;
        const radius = polygon ? 0 : (body as CCircle).radius * (body as CCircle).scale;
        const min_x = polygon ? (body as CPolygon)._min_x : x - radius;
        const min_y = polygon ? (body as CPolygon)._min_y : y - radius;
        const max_x = polygon ? (body as CPolygon)._max_x : x + radius;
        const max_y = polygon ? (body as CPolygon)._max_y : y + radius;

        update =
          min_x < body._bvh_min_x ||
          min_y < body._bvh_min_y ||
          max_x > body._bvh_max_x ||
          max_y > body._bvh_max_y;
      }

      if (update) {
        this.remove(body, true);
        this.insert(body, true);
      }
    }
  }

  // Returns a list of potential collisions for a body
  potentials(body: TShape): TShape[] {
    const shapes: TShape[] = [];
    const { _bvh_min_x: min_x, _bvh_min_y: min_y, _bvh_max_x: max_x, _bvh_max_y: max_y } = body;

    let current = this.root;
    let traverse_left = true;

    if (!current || !current._bvh_branch) {
      return shapes;
    }

    while (current) {
      if (traverse_left) {
        traverse_left = false;

        let left: CBVHBranch | undefined = current._bvh_branch ? current._bvh_left : undefined;

        while (
          left &&
          left._bvh_max_x >= min_x &&
          left._bvh_max_y >= min_y &&
          left._bvh_min_x <= max_x &&
          left._bvh_min_y <= max_y
        ) {
          current = left;
          left = current._bvh_branch ? current._bvh_left : undefined;
        }
      }

      const isBranch = current._bvh_branch as unknown as TShape;
      const right: CBVHBranch | undefined = isBranch ? current._bvh_right : undefined;

      if (
        right &&
        right._bvh_max_x > min_x &&
        right._bvh_max_y > min_y &&
        right._bvh_min_x < max_x &&
        right._bvh_min_y < max_y
      ) {
        current = right;
        traverse_left = true;
      } else {
        if (!isBranch && current !== body) {
          shapes.push(current as TShape);
        }

        let parent = current._bvh_parent as TShape;

        if (parent) {
          while (parent && parent._bvh_right === current) {
            current = parent;
            parent = current._bvh_parent as TShape;
          }

          current = parent;
        } else {
          break;
        }
      }
    }

    return shapes;
  }

  /** Draw bounding volume hierarchy (without bodies) */
  draw(context: CanvasRenderingContext2D): void {
    let current = this.root;
    let traverse_left = true;

    context.strokeStyle = this.boundsColor;

    while (current) {
      if (traverse_left) {
        traverse_left = false;

        let left = current._bvh_branch ? current._bvh_left : undefined;

        while (left) {
          current = left;
          left = current._bvh_branch ? current._bvh_left : undefined;
        }
      }

      const branch = current._bvh_branch;
      const min_x = current._bvh_min_x;
      const min_y = current._bvh_min_y;
      const max_x = current._bvh_max_x;
      const max_y = current._bvh_max_y;
      const right = branch ? current._bvh_right : undefined;

      context.beginPath();
      context.moveTo(min_x, min_y);
      context.lineTo(max_x, min_y);
      context.lineTo(max_x, max_y);
      context.lineTo(min_x, max_y);
      context.lineTo(min_x, min_y);
      context.stroke();

      if (right) {
        current = right;
        traverse_left = true;
      } else {
        let parent = current._bvh_parent;

        if (parent) {
          while (parent && parent._bvh_right === current) {
            current = parent;
            parent = current._bvh_parent;
          }

          current = parent;
        } else {
          break;
        }
      }
    }
  }
}
