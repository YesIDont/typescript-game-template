import * as UI from 'engine/user-interface';

export const showServitorMessage = (message: string): void => {
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
  messagePanel.setOnClose(() => {
    UI.remove(messagePanel);
  });
  UI.addToViewport(messagePanel);
};
