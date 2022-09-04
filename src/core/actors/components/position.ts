export type TAPosition = {
  x: number;
  y: number;
};

export function position(x = 0, y = 0): TAPosition {
  return {
    x,
    y,
  };
}
