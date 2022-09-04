export type TBeginPlay = () => void;

export type TABeginPlay = {
  beginPlay: TBeginPlay;
};

export function beginPlay(beginPlayIn: TBeginPlay): TABeginPlay {
  return {
    beginPlay: beginPlayIn,
  };
}
