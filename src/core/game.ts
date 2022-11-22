import { newGame } from '../examples/mars-planetary-defense-department';
import { TNewActorProps } from './actors/new-actor';
import { keys } from './input/keyboard/keyboard';
import { mouse } from './input/mouse';
import { CLevel, TNewLevelOptions } from './level';
import { newLoop } from './loop';
import { options, TOptions } from './options';
import { mewPlayer } from './player';
import { polyfills } from './polyfills';
import { newRenderer } from './renderer';
import { newViewport } from './viewport';

export class CGame {
  levels: CLevel[] = [];
  options: TOptions = { ...options };
  actorsTemplates = [];
  defaultLevel?: CLevel;

  newLevel(props: TNewLevelOptions, isDefault = false): CLevel {
    const level = new CLevel(props);
    this.levels.push(level);
    if (this.defaultLevel === undefined || isDefault) this.defaultLevel = level;

    return level;
  }

  add<T>(...options: TNewActorProps<T>): T {
    const actor = Actor.new<T>(this, ...options);
    for (const propName in actor) {
      const value = actor[propName];
      if (value instanceof HTMLElement) {
        addToViewport(value);
      }
    }

    this.content.push(actor);

    return actor;
  }

  run(): void {
    polyfills.forEach((polyfill) => polyfill());

    const startLevel = this.defaultLevel ?? new CLevel({ name: 'Default Level' });
    const viewport = newViewport();
    const renderer = newRenderer();
    const player = mewPlayer();
    viewport.setupEvents();

    newGame(player, viewport, renderer, mouse, keys, options);
    const mainLoop = newLoop(viewport, startLevel, player, renderer, options);

    mouse.setupEvents();
    keys.setupEvents();

    renderer.clearRenderTargets();
    startLevel.run(viewport, renderer, options);
    mainLoop();

    // console.log(viewport);
    // console.log(renderer);
    // console.log(collisions);
    console.log(startLevel);
    // console.log(player);
  }
}
