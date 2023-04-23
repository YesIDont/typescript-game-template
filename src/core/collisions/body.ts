import { AActorBase } from '../actors/new-actor';
import { TVector, Vector } from '../vector';
import { CBVHBranch } from './BVHBranch';

let ids = 0;
export class CBody extends CBVHBranch {
  id: number;
  owner: AActorBase;
  x: number;
  y: number;
  relativePosition: TVector;
  radiusAdjustment: TVector;
  padding: number;
  tag: number;
  markedForRemoval: boolean;
  anchor: TVector = Vector.new();

  _polygon: boolean; // is polygon?
  _bvh_padding: number;

  constructor(x = 0, y = 0, padding = 0, tag = 0) {
    super(false);
    this.id = ++ids;
    this.x = x;
    this.y = y;
    this.relativePosition = Vector.new();
    this.radiusAdjustment = Vector.new();
    this.padding = padding;
    this.tag = tag;
    this.markedForRemoval = false;
    this._polygon = false;
    this._bvh_padding = padding;
  }

  draw(context: CanvasRenderingContext2D): void {}

  setPosition(x = 0, y = 0): void {
    this.x = x;
    this.y = y;
  }
}
