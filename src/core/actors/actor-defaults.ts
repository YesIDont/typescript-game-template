import { emptyFn } from '../utils/misc';
import { TVector, Vector } from '../vector';
import { TActorDefaults } from './actor-types';

export const actorDefaults: TActorDefaults = {
  id: 0,
  name: 'New Actor',
  body: undefined,
  level: undefined,
  rotation: 0,
  speed: 0,
  maxSpeed: 1000,
  color: `#000`,
  visible: true,
  collides: true,
  shouldBeDeleted: false,
  beginPlay: emptyFn,
  update: emptyFn,
  onScreenLeave: emptyFn,
  onHit: emptyFn,
};

export const actorDynamicDefaults = {
  velocity: (): TVector => Vector.new(),
};
