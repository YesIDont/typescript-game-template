import { Health } from '../../core/actors/components';
import { AActorBase } from '../../core/actors/new-actor';
import { keys } from '../../core/input/keyboard/keyboard';
import { CLevel } from '../../core/level';
import * as UI from '../../core/user-interface';
import { emptyFn } from '../../core/utils/misc';

export function initializeGameplayUI(level: CLevel): { [key: string]: UI.TUiItem } {
  const repairPanel = UI.Panel(UI.Collapsed, UI.MaxWidth('400px'), { title: 'Repair menu' });
  const showRepairPanel = (): void => {
    const repairsTargets = level.getAllByTags('repairsTarget');
    const repairsButtons = repairsTargets.map<UI.TUiItem>((actor: AActorBase & Health) => {
      const isHurt = actor.health < actor.healthMax;
      const button = UI.Button(
        isHurt ? 'Fix' : 'All good',
        !isHurt ? UI.NoBorder : UI.Border('1px solid #444'),
        UI.Width('110px'),
      );
      if (isHurt)
        button.onclick = (): void => {
          actor.heal(1000);
          button.replaceContent(UI.Text('All good'));
        };

      return UI.Box(
        UI.Flex,
        UI.MarginBottom('10px'),
        UI.Text(`${actor.name}:`, UI.Width('130px')),
        button,
      );
    });
    const fixAllButton = UI.Button('Fix All', UI.Width('110px'), {
      onClick: function (): void {
        repairsTargets.forEach((actor: AActorBase & Health) => {
          actor.heal(1000);
        });
        repairsButtons.forEach((b) => {
          b.querySelector<UI.TUiItem>('button')?.replaceContent(UI.Text('All good'));
        });
      },
    });
    repairPanel.replaceContent(...repairsButtons, UI.Box(UI.Flex, UI.JustifyRight, fixAllButton));
    UI.show(repairPanel);
  };
  const repairButton = UI.Button('Repair [R]', { onClick: showRepairPanel });
  keys.on('pressed', 'r', showRepairPanel);

  const buildPanel = UI.Panel(UI.Collapsed, UI.MaxWidth('400px'), { title: 'Build menu' });
  const showBuildPanel = (): void => UI.show(buildPanel);
  const buildButton = UI.Button('Build [B]', { onClick: showBuildPanel });
  keys.on('pressed', 'b', showBuildPanel);

  const toolsBox = UI.Box(
    /*  UI.Collapsed, */ UI.Fixed,
    UI.Left('10px'),
    UI.Top('10px'),
    repairButton,
    buildButton,
  );

  const showServitorMessage = (message: string): void => {
    const messagePanel = UI.Panel(
      UI.MaxWidth('400px'),
      {
        title: 'Incoming Message',
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
          UI.Image(UI.Absolute, UI.Width('auto'), UI.Height('105%'), UI.Left('-50px'), {
            src: 'https://artwork.40k.gallery/wp-content/uploads/2021/02/16010123/40K-20171126062843.jpg',
          }),
        ),
        UI.Box(
          message,
          UI.MarginLeft('10px'),
          UI.Text('Bjor, Servitor', UI.Color('#7799ff'), UI.MarginTop('5px')),
        ),
      ),
    );
    messagePanel.setOnClose(() => UI.remove(messagePanel));
    UI.addToViewport(messagePanel);
  };

  const tutorialPanel = UI.Panel(
    {
      title: 'Incoming Message',
      onClose: () => {
        setTimeout(() => {
          // tutorialPanel.replaceContent(
          //   text(),
          // );
          showServitorMessage(
            `My Lord, we have received warning of incoming meteor shower. Buildings are damaged and our power plant is offline. You can order repairs in the repair menu. Click on "Repair" button to open repair menu or "R" key on your keyboard.`,
          );
          UI.show(toolsBox);
          tutorialPanel.setOnClose(emptyFn);
        }, 200);
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

  return { toolsBox, tutorialPanel, repairPanel, buildPanel };
}
