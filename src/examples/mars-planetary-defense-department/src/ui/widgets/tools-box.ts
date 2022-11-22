import { keys } from '../../../../../core/input/keyboard/keyboard';
import * as UI from '../../../../../core/user-interface';
import { showBuildPanel } from './build-panel';
import { showRepairPanel } from './repair-panel';

export const repairButton = UI.Button('Repair [R]', { onClick: showRepairPanel });
// ! keys should be setup in onKey event like the above onClick
keys.on('pressed', 'r', showRepairPanel);

const buildButton = UI.Button('Build [B]', { onClick: showBuildPanel });
keys.on('pressed', 'b', showBuildPanel);

export const toolsBox = UI.Box(
  /*  UI.Collapsed, */ UI.Fixed,
  UI.Left('10px'),
  UI.Top('10px'),
  repairButton,
  buildButton,
);
