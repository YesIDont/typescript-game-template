export type TTimer = (dt: number) => boolean;

export function newTimer(from = 1, to = undefined): TTimer {
  let nextUpdateIn = to ? Math.random() * (to - from) + from : from;
  let counter = 0;

  if (to !== undefined)
    return function update(deltaTime: number): boolean {
      counter += deltaTime;
      if (counter >= nextUpdateIn) {
        counter = 0;

        nextUpdateIn = Math.random() * (to - from) + from;

        return true;
      }

      return false;
    };

  return function update(deltaTime: number): boolean {
    counter += deltaTime;
    if (counter >= nextUpdateIn) {
      counter = 0;

      return true;
    }

    return false;
  };
}
