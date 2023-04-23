import { emptyFn } from 'engine/';
import * as UI from 'engine/user-interface';
import { buttonText, customPanel } from '../custom-panel';
import { showServitorMessage } from './show-servitor-message';
import { toolsBox } from './tools-box';

export const tutorialPanel = customPanel(
  'remove',
  {
    title: 'Incoming Message',
    buttonText,
    onClose: () => {
      setTimeout(() => {
        showServitorMessage(
          `My Lord, we have received warning of incoming meteor shower. Buildings are damaged and our power plant is offline. You can order repairs in the repair console. Click on "Repair" button to open repair menu or "R" key on your keyboard.`,
        );
        UI.show(toolsBox);
        tutorialPanel.setOnClose(emptyFn);
      }, 100);
    },
  },
  UI.MaxWidth('400px'),
  UI.Text(
    `Welcome Commander, you have finally arrived. Your shuttle had quite the trouble getting here. We use to say that no one gets on this god forsaken planet without any trouble.`,
  ),
  UI.Text(
    'And speaking of which - there is a meteor shower closing in and our main defense is not yet online after recent events. There are some repairs that need to be made and I believe we finally have enough materials to build shield generator.',
  ),
  UI.Text(
    'Please, follow this servitor, his name is Bjor, he will be your personal assistant down here as long as you need him. His speech module have been broken for some time now, but he can leave you messages on your comms channel. Feel free to consult him whenever you need.',
  ),
  UI.Text(`Let me know once this is done, we'll talk supplies order we need to make afterwards.`),
  UI.Text(`My name is Chase, private Chase.`),
  UI.Text(`Over and out.`),
);
