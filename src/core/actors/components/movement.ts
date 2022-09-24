import { TVector, Vector } from '../../vector';
import { AActorBase } from '../new-actor';
import { Position } from './position';

export type Move = (deltaSeconds: number) => void;
export type MovingActor = AActorBase & Movement & Position;

export type Movement = {
  speed: number;
  speedMax: number;
  direction: TVector;
  move: Move;
};

export function defaultMove(this: Movement & Position, deltaSeconds: number): void {
  this.previous.x = this.x;
  this.previous.y = this.y;
  this.x += deltaSeconds * this.speed * this.direction.x;
  this.y += deltaSeconds * this.speed * this.direction.y;
}

export function movement(speedMax = 0, direction: TVector = Vector.new()): Movement {
  return {
    speed: 0,
    speedMax,
    direction,
    move: defaultMove,
  };
}
