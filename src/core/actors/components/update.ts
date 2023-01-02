import { CGame } from '../../game';

export type TUpdate = (now: number, deltaSeconds: number, game: CGame) => void;

export type Update = {
  update: TUpdate;
};

export function update(updateIn: TUpdate): Update {
  return {
    update: updateIn,
  };
}
