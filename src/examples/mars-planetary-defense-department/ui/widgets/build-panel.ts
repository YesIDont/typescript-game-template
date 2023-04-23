import * as UI from 'engine/user-interface';
import { buttonText } from '../custom-panel';

export const buildPanel = UI.Panel(UI.Collapsed, UI.MaxWidth('400px'), {
  title: 'Build menu',
  buttonText,
});
export const showBuildPanel = (): void => {
  UI.show(buildPanel);
};
