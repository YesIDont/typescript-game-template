/* This is where your game logick goes */

import { CCollisions } from '../core/collisions';
import { TOptions } from '../core/options';
import { TGameState } from './state';

export function update(
  now: number,
  deltaSeconds: number,
  collisions: CCollisions,
  state: TGameState,
  options: TOptions,
): void {
  // do game state update
}
