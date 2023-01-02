import { newGame } from '../examples/mars-planetary-defense-department';
import '../sass/style.sass';

/*

  ! - debug screen: number of actors, bodies, memory, fps etc.
  ! - simple particles (graphic effect only)
  ! - score board - API!
  ! - local save (localStorage)

*/

window.addEventListener('DOMContentLoaded', (): void => {
  newGame().play();
});
