import { keys as defaultKeys, mouse as defaultMouse, TKeys, TMouse } from './input';
import { CLevel } from './level';
import { newLoop } from './main-loop';
import { defaultOptions, TOptions } from './options';
import { mewPlayer } from './player';
import { polyfills } from './polyfills';
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
    public keys: TKeys = defaultKeys,
    public mouse: TMouse = defaultMouse,
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

  play(): void {
    polyfills.forEach((polyfill) => polyfill());

    this.viewport.setupEvents();
    this.mouse.setupEvents(this);
    this.keys.setupEvents();
    this.renderer.clearRenderTargets();

    const firstLevel = this.getFirstLevel();
    this.currentLevel = firstLevel;
    firstLevel.initialise(this);

    newLoop(this);

    console.log('firstLevel ------------------------------', firstLevel);
    console.log('game ------------------------------', this);
  }
}
