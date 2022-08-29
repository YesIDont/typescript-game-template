export class CBVHBranch {
  _bvh_parent: CBVHBranch | undefined;
  _bvh_branch: boolean;
  _bvh_left: CBVHBranch | undefined;
  _bvh_right: CBVHBranch | undefined;
  _bvh_min_x: number;
  _bvh_min_y: number;
  _bvh_max_x: number;
  _bvh_max_y: number;

  constructor(isBranch = true) {
    this._bvh_parent = undefined;
    this._bvh_branch = isBranch;
    this._bvh_left = undefined;
    this._bvh_right = undefined;
    this._bvh_min_x = 0;
    this._bvh_min_y = 0;
    this._bvh_max_x = 0;
    this._bvh_max_y = 0;
  }
}
