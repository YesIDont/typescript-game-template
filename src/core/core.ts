import { newGame } from '../examples/mars-planetary-defense-department';
import '../sass/style.sass';
import { newLoop } from './main-loop';
import { polyfills } from './polyfills';

/*

  ! - debug screen: number of actors, bodies, memory, fps etc.
  ! - simple particles (graphic effect only)
  ! - score board - API!
  ! - local save (localStorage)

*/

window.addEventListener('DOMContentLoaded', (): void => {
  polyfills.forEach((polyfill) => polyfill());

  const game = newGame();
  const mainLoop = newLoop(game);
  mainLoop();
});
