import { CCollisions } from '../core/collisions';
import { TOptions } from '../core/options';
import { newActors, TActor, TActors } from './actor';

export type TGameState = {
  actors: TActors;
  player: TActor;
};

export type TGameStateUpdate = (
  now: number,
  deltaSeconds: number,
  collisions: CCollisions,
  state: TGameState,
  options: TOptions,
) => void;

export function newState(collisions: CCollisions): TGameState {
  const actors = newActors();

  const player = actors.add();

  return {
    actors,
    player,
  };
}
