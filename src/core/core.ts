import { newGame } from '../examples/mars-planetary-defense-department';
import '../sass/style.sass';
import { keys } from './input/keyboard/keyboard';
import { mouse } from './input/mouse';
import { newLoop } from './loop';
import { options } from './options';
import { mewPlayer } from './player';
import { polyfills } from './polyfills';
import { newRenderer } from './renderer';
import { newViewport } from './viewport';

/*

  ! - debug screen: number of actors, bodies, memory, fps etc.
  ! - simple particles (graphic effect only)
  ! - score board - API!
  ! - local save (localStorage)

*/

window.addEventListener('DOMContentLoaded', (): void => {
  polyfills.forEach((polyfill) => polyfill());

  const viewport = newViewport();
  const renderer = newRenderer();
  const player = mewPlayer();
  viewport.setupEvents();

  const level = newGame(player, viewport, renderer, mouse, keys, options);
  const mainLoop = newLoop(viewport, level, player, renderer, options);

  mouse.setupEvents();
  keys.setupEvents();

  renderer.clearRenderTargets();
  level.run(viewport, renderer, options);
  mainLoop();

  // console.log(viewport);
  // console.log(renderer);
  // console.log(collisions);
  console.log(level);
  // console.log(player);
});
