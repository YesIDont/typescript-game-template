import { newCollisions } from './core/collisions';
import { newLoop } from './core/loop';
import { options } from './core/options';
import { polyfills } from './core/polyfills';
import { newRenderer } from './core/renderer';
import { newViewport } from './core/viewport';
import { newState } from './game/state';
import { update } from './game/update';
import './sass/style.sass';

window.onload = (): void => {
  polyfills.forEach((polyfill) => polyfill());

  const collisions = newCollisions();
  const state = newState(collisions);
  const viewport = newViewport();
  const renderer = newRenderer(viewport);
  const mainLoop = newLoop(renderer, collisions, state, update, options);

  mainLoop();
};
