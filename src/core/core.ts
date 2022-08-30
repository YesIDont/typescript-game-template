import { newGame } from '../game';
import '../sass/style.sass';
import { newActors } from './actors/actor';
import { TActor } from './actors/types';
import { newCollisions } from './collisions';
import { mouse } from './input/mouse';
import { newLoop } from './loop';
import { options } from './options';
import { mewPlayer } from './player';
import { polyfills } from './polyfills';
import { newRenderer } from './renderer';
import { on } from './utils/dom/dom';
import { newViewport } from './viewport';

window.onload = (): void => {
  polyfills.forEach((polyfill) => polyfill());

  const viewport = newViewport();
  const renderer = newRenderer(viewport);
  const collisions = newCollisions();
  const actors = newActors(renderer, collisions);
  const player = mewPlayer();

  newGame(actors, player, viewport, collisions, mouse, options);

  viewport.setupEvents();
  on('mousemove', mouse.updatePointerPosition.bind(mouse));
  collisions.createWorldBounds(viewport.size[0], viewport.size[1], 100, -500);
  actors.forEach((actor) => {
    if (actor.visible) renderer.addRenderTarget(actor);
  });
  actors.forEach((actor: TActor) => {
    if (actor.collides && actor.body) collisions.insert(actor.body);
  });
  actors.forEach((actor: TActor) => actor.beginPlay());

  if (options.hideSystemCursor) document.body.className += ' hide-system-cursor';

  const mainLoop = newLoop(viewport, collisions, actors, player, renderer, options);
  mainLoop();

  // console.log(viewport);
  // console.log(renderer);
  // console.log(collisions);
  console.log(actors);
  // console.log(player);
};
