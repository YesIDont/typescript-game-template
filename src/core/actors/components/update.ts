export type TUpdate = (now: number, deltaSeconds: number) => void;

export type TAUpdate = {
  update: TUpdate;
};

export function update(updateIn: TUpdate): TAUpdate {
  return {
    update: updateIn,
  };
}
