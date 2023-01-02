import * as UI from 'engine/user-interface';

export const buildPanel = UI.Panel(UI.Collapsed, UI.MaxWidth('400px'), { title: 'Build menu' });
export const showBuildPanel = (): void => {
  UI.show(buildPanel);
};
