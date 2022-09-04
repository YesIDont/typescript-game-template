import { clamp, mapRangeClamped } from '../../utils/math';
import { TActor } from '../new-actor';

export type TAHealth = {
  health: number;
  healthMax: number;
  receiveDamage(amount: number): void;
  heal(amount: number): void;
};

export function health(healthMaxIn = 0, healthIn?: number): TAHealth {
  function receiveDamage(this: TActor & TAHealth, amount: number): void {
    this.health = clamp(this.health - amount, 0, this.healthMax);
    if (this.healthBar) {
      this.healthBar.setProgress(mapRangeClamped(this.health, 0, this.healthMax));
    }
  }
  function heal(this: TActor & TAHealth, amount: number): void {
    this.health = clamp(this.health + amount, 0, this.healthMax);
    if (this.healthBar) {
      this.healthBar.setProgress(mapRangeClamped(this.health, 0, this.healthMax));
    }
  }

  return {
    health: healthIn ?? healthMaxIn,
    healthMax: healthMaxIn,
    receiveDamage,
    heal,
  };
}
