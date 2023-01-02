import { Actor, beginPlay, CGame, Circle, mapRangeClamped, update, Vector } from 'engine/';
import { TProgressBar } from 'engine/user-interface';
import {
  buildingBaseBeginPlay,
  buildingHealthBar,
  buildingTemplate,
  TBuilding,
} from './blueprints/building-template';
import { groundHeight } from './ground';

const powerPlantProps = {
  powerLevel: 0,
  maxPower: 100,
  productionSpeed: 1,
  empty(): boolean {
    return this.powerLevel === 0;
  },
  drawEnergy(deltaSeconds: number): number {
    // no power - no draw
    if (this.powerLevel <= 0) return 0;

    this.powerLevel -= deltaSeconds;

    // if power levels where drained give only the amount above zero
    const powerDrawn =
      this.powerLevel < 0 ? deltaSeconds + (this.powerLevel as number) : deltaSeconds;

    return powerDrawn;
  },
};

export type APowerPlant = TBuilding & {
  energyProductionStatus: TProgressBar;
} & typeof powerPlantProps;

export const powerPlantBuilding = Actor.new<APowerPlant>(
  ...buildingTemplate(
    'Power Plant',
    -220,
    -groundHeight + 5,
    Circle(true, 0, 0, 18),
    '#00bbdd',
    50,
    0,
    {
      maxPower: 70,
      regenerationBoost: 8,
      cooldownTime: 1,
      afterHitCooldown: 2,
    },
    [buildingHealthBar(Vector.new(0, -30)), buildingHealthBar(Vector.new(0, -40), '#0055ff')],
  ),
  powerPlantProps,
  beginPlay(function (this: APowerPlant, _now: number, _deltaSeconds: number, game: CGame): void {
    buildingBaseBeginPlay(this, game);
    const progressBar = this.attachments[1] as TProgressBar;
    if (progressBar) {
      this.energyProductionStatus = progressBar;
      progressBar.setProgress(0);
    }
  }),
  update(function (this: APowerPlant, now: number, deltaSeconds: number) {
    // if power plant isn't destroyed produce energy
    if (this.health > 0 && this.powerLevel < this.maxPower) {
      this.powerLevel += deltaSeconds * this.productionSpeed;

      this.energyProductionStatus.setProgress(mapRangeClamped(this.powerLevel, 0, this.maxPower));
    }
  }),
);
