import { TActor } from '../actors/actor-types';
import { TDebugDrawOptions } from '../types/base-types';
import { alphaToHex } from '../utils/colors';
import { TVector, Vector } from '../vector';
import { CBVHBranch } from './BVHBranch';

let ids = 0;
export class CBody extends CBVHBranch {
  id: number;
  owner: TActor;
  x: number;
  y: number;
  padding: number;
  tag: number;
  markedForRemoval: boolean;
  anchor: TVector = Vector.new();
  debugDraw: TDebugDrawOptions = {
    drawType: 'fill',
    color: '#000',
    zIndex: 1,
    alpha: 1,
    getColor(this: TDebugDrawOptions): string {
      return `${this.color}${this.alpha < 1 ? alphaToHex(this.alpha) : ''}`;
    },
  };

  _polygon: boolean; // is polygon?
  _bvh_padding: number;

  constructor(x = 0, y = 0, padding = 0, tag = 0) {
    super(false);
    this.id = ++ids;
    this.x = x;
    this.y = y;

    this.padding = padding;
    this.tag = tag;
    this.markedForRemoval = false;
    this._polygon = false;
    this._bvh_padding = padding;
  }
}
