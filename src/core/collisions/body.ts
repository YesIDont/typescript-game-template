import { DrawType } from '../draw';
import { CBVHBranch } from './BVHBranch';

export class CBody extends CBVHBranch {
  id: number;

  // position
  x: number;
  y: number;

  padding: number;
  tag: number;

  markedForRemoval: boolean;
  drawType: DrawType = 'fill';
  _polygon: boolean;
  _bvh_padding: number;

  constructor(x = 0, y = 0, padding = 0, tag = 0, id = 0) {
    super(false);
    this.id = id;
    this.x = x;
    this.y = y;

    this.padding = padding;
    this.tag = tag;
    this.markedForRemoval = false;
    this._polygon = false;
    this._bvh_padding = padding;
  }
}
