import { CLevel } from '../../../../core/level';
import { gameplayUi } from '../ui';

export const marsLevel = new CLevel({ name: 'Mars Base' });
marsLevel.addUi(...gameplayUi);
