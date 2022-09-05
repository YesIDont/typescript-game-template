export type Position = {
  x: number;
  y: number;
};

export function position(x = 0, y = 0): Position {
  return {
    x,
    y,
  };
}
