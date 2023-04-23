import { CGame, CLevel } from 'engine/';
import {
  ammoFactoryBuilding,
  building02,
  building03,
  building04,
  mainBuilding,
} from '../actors/buildings';
import { groundActor } from '../actors/ground';
import { fireGun } from '../actors/gun';
import { meteorSpawner } from '../actors/meteor-spawner';
import { playerAimActor } from '../actors/player-aim';
import { powerPlantBuilding } from '../actors/power-plant';
import { gameplayUi } from '../ui';

const actors = [
  groundActor,
  mainBuilding,
  powerPlantBuilding,
  building02,
  building03,
  building04,
  ammoFactoryBuilding,
  meteorSpawner,
  playerAimActor,
];

export const marsLevel = new CLevel({ name: 'Mars Base', actors });

marsLevel.onBeginPlay = (game: CGame): void => {
  game.mouse.on('left', 'held', fireGun);
  marsLevel.addUi(...gameplayUi);
};
