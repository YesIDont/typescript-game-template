import { TUpdate } from './update';

export type BeginPlayFn = TUpdate;

export type BeginPlay = {
  beginPlay: BeginPlayFn;
};

export function beginPlay(beginPlayIn: BeginPlayFn): BeginPlay {
  return {
    beginPlay: beginPlayIn,
  };
}
