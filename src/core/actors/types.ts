import { TShape } from '../collisions/proxyTypes';
import { TCollisionResponse, TCollisionResponseName } from '../collisions/responses';
import { TDrawType } from '../types/base-types';
import { TVector } from '../vector';

export type TActor = {
  id: number;
  name: string;
  body: TShape | undefined;
  velocity: TVector;
  turn: TVector;
  turnRate: number;
  speed: number;
  maxSpeed: number;
  color: string;
  visible: boolean;
  collides: boolean;
  shouldBeDeleted: boolean;
  beginPlay(): void;
  update(now: number, deltaSeconds: number): void;
  onScreenLeave(now: number, deltaSeconds: number): void;
  onHit: TCollisionResponse;
};

export type TNewActorProps = {
  id?: number;
  x?: number;
  y?: number;
  name?: string;
  groups?: string[];
  body?: TShape | undefined;
  velocity?: TVector;
  turn?: TVector;
  turnRate?: number;
  speed?: number;
  maxSpeed?: number;
  radius?: number;
  zIndex?: number;
  color?: string;
  drawType?: TDrawType;
  visible?: boolean;
  collides?: boolean;
  collisionResponse?: TCollisionResponseName;
  beginPlay?(): void;
  update?(now: number, deltaSeconds: number): void;
  onHit?: TCollisionResponse;
};
