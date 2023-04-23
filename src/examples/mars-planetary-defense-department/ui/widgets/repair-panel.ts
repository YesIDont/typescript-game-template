import { AActorBase, get, Health } from 'engine/';
import * as UI from 'engine/user-interface';
import { buttonText, customPanel } from '../custom-panel';

export const repairPanel = customPanel('collapse', UI.Collapsed, UI.MaxWidth('400px'), {
  title: 'Repair menu',
  buttonText,
});

export function showRepairPanel(): void {
  const repairsTargets = get<UI.TRootUiElement>('#ui')
    .game.getCurrentLevel()
    .getAllByTags('repairsTarget');

  const repairsButtons = repairsTargets.map<UI.TUiItem>(
    (actor: AActorBase & Health): UI.TUiItem => {
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

      const box = UI.Box(
        UI.Flex,
        UI.MarginBottom('10px'),
        UI.Text(`${actor.name}:`, UI.Width('130px')),
        button,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return box;
    },
  );
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
}
