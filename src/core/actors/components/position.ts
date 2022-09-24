import { TVector, Vector } from '../../vector';

export type positionSetter = (x: number, y: number) => void;
export type Position = {
  x: number;
  y: number;
  previous: TVector;
  setPosition: positionSetter;
};
export interface WithPositionSet {
  setPosition: positionSetter;
}

export function defaultPositionSet(this: Position, x = 0, y = 0): void {
  this.previous.x = this.x;
  this.previous.y = this.y;
  this.x = x;
  this.y = y;
}

export function position(
  x = 0,
  y = 0,
  customPositionSet?: positionSetter,
  useBothDefaultAndCustomSetter = true,
): Position {
  const props = { x, y, previous: Vector.new() };
  if (!customPositionSet) return { ...props, setPosition: defaultPositionSet };
  if (!useBothDefaultAndCustomSetter) return { ...props, setPosition: customPositionSet };

  return {
    ...props,
    setPosition: function (this: Position, xIn = 0, yIn = 0): void {
      defaultPositionSet.call(this, xIn, yIn);
      customPositionSet.call(this, xIn, yIn);
    },
  };
}
