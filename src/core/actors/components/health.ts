import { clamp, mapRangeClamped } from '../../utils/math';
import { AActorBase } from '../new-actor';
import { HealthBar } from './health-bar';

export type Health = {
  health: number;
  healthMax: number;
  receiveDamage(amount: number): void;
  heal(amount: number): void;
};

export function health(healthMaxIn = 0, healthIn?: number): Health {
  function receiveDamage(this: AActorBase & Health & HealthBar, amount: number): void {
    this.health = clamp(this.health - amount, 0, this.healthMax);
    if (this.healthBar) {
      this.healthBar.setProgress(mapRangeClamped(this.health, 0, this.healthMax));
    }
  }
  function heal(this: AActorBase & Health & HealthBar, amount: number): void {
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
