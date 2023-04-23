import * as UI from 'engine/user-interface';
import { buttonText, customPanel } from '../custom-panel';

export const buildPanel = customPanel('collapse', UI.Collapsed, UI.MaxWidth('400px'), {
  title: 'Build menu',
  buttonText,
});
export const showBuildPanel = (): void => {
  UI.show(buildPanel);
};
