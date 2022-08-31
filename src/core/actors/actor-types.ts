import { TShape } from '../collisions/proxyTypes';
import { TCollisionResponse, TCollisionResponseName } from '../collisions/responses';
import { CLevel } from '../level';
import { TDrawType } from '../types/base-types';
import { TVector } from '../vector';

export type TActor = {
  id: number;
  level?: CLevel;
  body?: TShape;
  name: string;
  velocity: TVector;
  rotation: number; // radians
  speed: number;
  maxSpeed: number;
  color: string; // hex
  visible: boolean;
  collides: boolean;
  shouldBeDeleted: boolean;
  beginPlay(): void;
  update(now: number, deltaSeconds: number): void;
  onScreenLeave(now: number, deltaSeconds: number): void;
  onHit: TCollisionResponse;
};

export type TActorDynamicDefaults = 'velocity';
export type TActorDefaults = Omit<TActor, TActorDynamicDefaults>;

export type TNewActorProps = Partial<TActor> & {
  x?: number;
  y?: number;
  groups?: string[];
  radius?: number;
  zIndex?: number;
  drawType?: TDrawType;
  collisionResponse?: TCollisionResponseName;
  alpha?: number;
};
