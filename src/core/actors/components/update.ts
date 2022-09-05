export type TUpdate = (now: number, deltaSeconds: number) => void;

export type Update = {
  update: TUpdate;
};

export function update(updateIn: TUpdate): Update {
  return {
    update: updateIn,
  };
}
