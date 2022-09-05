export type BeginPlayFn = () => void;

export type BeginPlay = {
  beginPlay: BeginPlayFn;
};

export function beginPlay(beginPlayIn: BeginPlayFn): BeginPlay {
  return {
    beginPlay: beginPlayIn,
  };
}
