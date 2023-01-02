import { CGame } from '@/core';
import { marsLevel } from './levels/level-mars';

export function newGame(): CGame {
  const game = new CGame('Mars Planetary Defense Department', [marsLevel]);

  game.options.debugDraw = true;
  game.options.hideSystemCursor = true;
  game.renderer.settings.backgroundColor = '#ffaa55';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return game;
}
