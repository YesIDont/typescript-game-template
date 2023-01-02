import { TKeys, TMouse } from './input';
import { CLevel } from './level';
import { defaultOptions, TOptions } from './options';
import { mewPlayer } from './player';
import { newRenderer } from './renderer';
import { newViewport } from './viewport';

/*
  Global game object used to pass references to game modules, levels and actors.
*/
export class CGame {
  currentLevel: CLevel | undefined;

  constructor(
    public name: string = 'New Game',
    public levels: CLevel[] = [],
    public viewport = newViewport(),
    public renderer = newRenderer(),
    public player = mewPlayer(),
    public options: TOptions = { ...defaultOptions },
    public keys: TKeys = keys,
    public mouse: TMouse = mouse,
  ) {}

  getFirstLevel(): CLevel {
    const firstLevel = this.levels[0];

    if (!firstLevel) {
      throw new Error('Could not find first level');
    }

    return firstLevel;
  }

  getCurrentLevel(): CLevel {
    const firstLevel = this.currentLevel;

    if (!firstLevel) {
      throw new Error('Could not find current level.');
    }

    return firstLevel;
  }

  run(): void {
    this.viewport.setupEvents();
    this.mouse.setupEvents(this);
    this.keys.setupEvents();
    this.renderer.clearRenderTargets();

    const firstLevel = this.getFirstLevel();
    this.currentLevel = firstLevel;

    firstLevel.run(this);
  }
}
