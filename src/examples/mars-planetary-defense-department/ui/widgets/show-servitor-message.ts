import * as UI from 'engine/user-interface';
import { buttonText, customPanel } from '../custom-panel';

export const showServitorMessage = (message: string): void => {
  const messagePanel = customPanel(
    'remove',
    UI.MaxWidth('400px'),
    {
      title: 'Incoming Message',
      buttonText,
    },

    UI.Box(
      UI.Flex,
      UI.Box(
        UI.Relative,
        UI.Overflow('hidden'),
        UI.MaxHeight('125px'),
        UI.MinWidth('125px'),
        UI.MinHeight('125px'),
        UI.Border('1px solid #555'),
        UI.Image(UI.Absolute, UI.Width('auto'), UI.Height('105%'), {
          src: 'servitor.png',
        }),
      ),
      UI.Box(
        message,
        UI.MarginLeft('10px'),
        UI.Text('Bjor, Servitor', UI.Color('#7799ff'), UI.MarginTop('5px')),
      ),
    ),
  );
  messagePanel.setOnClose(() => {
    UI.remove(messagePanel);
  });
  UI.addToViewport(messagePanel);
};
