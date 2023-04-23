import * as UI from 'engine/user-interface';
import { KeyboardEvent } from 'react';
import { get, getOptionsFromProps, on } from '../../../core';

export const buttonText = 'Close [C]';
export type TCloseMethod = 'collapse' | 'hide' | 'remove';

export const customPanel = (
  closeMethod: TCloseMethod,
  ...props: UI.TTagArguments[]
): UI.TUiItem => {
  const panel = UI.Panel(...props, { buttonText });
  const { onClose } = getOptionsFromProps(props) ?? {};

  // prettier-ignore
  const closeOrRemove = (e: KeyboardEvent): void => {
    if (e.key !== 'c') return;
    if (!panel.className.includes('active')) return;

    /* eslint-disable indent */
    switch(closeMethod) {
      case 'collapse':
        // onClose?.();
        UI.collapse(panel); break;
      case 'hide':
        // onClose?.();
        UI.hide(panel); break;
      case 'remove':
        UI.remove(panel); break;
      default:
    break;

    }
    /* eslint-enable indent */
  }

  on('keydown', closeOrRemove);

  panel.onShow = (): void => {
    get.all<UI.TUiItem>('.panel').forEach((p) => {
      p.class.remove('active');
    });
    panel.class.add('active');
    on('keydown', closeOrRemove);
  };
  panel.onHide = (): void => {
    on('keydown', closeOrRemove, true);
    panel.class.remove('active');
  };
  panel.onCollapse = (): void => {
    on('keydown', closeOrRemove, true);
    panel.class.remove('active');
  };

  return panel;
};
