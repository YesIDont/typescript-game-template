import { CGame } from '../game';
import { on } from '../utils/dom/dom';
import { TVector, Vector } from '../vector';

export type TMouseClickHandler = (mouse: TMouse, deltaSeconds: number, game: CGame) => void;
export type EMouseEvent = 'pressed' | 'released' | 'held';
export type EMouseButton = 'left' | 'right' | 'middle';
export type TButtonState = {
  actions: {
    pressed: TMouseClickHandler[];
    released: TMouseClickHandler[];
    held: TMouseClickHandler[];
  };
  isPressed: boolean;
  rafId: number;
};

export const newButtonState = (): TButtonState => ({
  actions: {
    pressed: [],
    released: [],
    held: [],
  },
  isPressed: false,
  rafId: -1, // -1 means: not set
});

export type TMouse = {
  game?: CGame;

  position: TVector;
  overUiElement: boolean;
  loggingOn: boolean;

  left: TButtonState;
  right: TButtonState;
  middle: TButtonState;
  moveEvents: TMouseClickHandler[];
  spawnedHandlers: { [key: string]: (event: MouseEvent) => void };

  onMouseDown(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onMove(event: MouseEvent): void;
  onRightDown(event: MouseEvent): void;

  setupHeldButtonLoop(button: TButtonState): void;
  setupEvents(game: CGame): void;
  removeEvents(): void;
  on(button: EMouseButton, eventType: EMouseEvent, handler: TMouseClickHandler): void;
};

export const mouse: TMouse = {
  game: undefined,
  position: Vector.new(),
  overUiElement: true,
  loggingOn: false,
  left: newButtonState(),
  right: newButtonState(),
  middle: newButtonState(),
  moveEvents: [],
  spawnedHandlers: {},

  on(
    this: TMouse,
    button: EMouseButton,
    eventType: EMouseEvent,
    handler: TMouseClickHandler,
  ): void {
    if (button !== 'left' && button !== 'right' && button !== 'middle') return;
    if (eventType !== 'pressed' && eventType !== 'released' && eventType !== 'held') return;
    this[button].actions[eventType].push(handler);
  },

  onMouseDown(this: TMouse, event: MouseEvent): void {
    if (!this.overUiElement) event.preventDefault();
    const { game } = this;
    if (!game) return;

    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        if (this.loggingOn) console.log('RIGHT down');
        this.right.isPressed = true;
        this.right.actions.pressed.forEach((action) => action(this, 0, game));
        break;

      case 1: // MIDDLE mouse button
        if (this.loggingOn) console.log('MIDDLE down');
        this.middle.isPressed = true;
        this.middle.actions.pressed.forEach((action) => action(this, 0, game));
        break;

      case 0:
        // LEFT mouse button
        if (this.loggingOn) console.log('LEFT down');
        this.left.isPressed = true;
        this.left.actions.pressed.forEach((action) => action(this, 0, game));
        break;

      default:
        break;
    }
    /* eslint-enable indent */
  },

  onMouseUp(this: TMouse, event: MouseEvent): void {
    if (!this.overUiElement) event.preventDefault();
    const { game } = this;
    if (!game) return;

    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        if (this.loggingOn) console.log('RIGHT up');
        this.right.isPressed = false;
        this.right.actions.released.forEach((action) => action(this, 0, game));
        break;

      case 1: // MIDDLE mouse button
        if (this.loggingOn) console.log('MIDDLE up');
        this.middle.isPressed = false;
        this.middle.actions.released.forEach((action) => action(this, 0, game));
        break;

      case 0:
        // LEFT mouse button
        if (this.loggingOn) console.log('LEFT up');
        this.left.isPressed = false;
        this.left.actions.released.forEach((action) => action(this, 0, game));
        break;

      default:
        break;
    }
    /* eslint-enable indent */
  },

  onRightDown(this: TMouse, event: MouseEvent): boolean {
    if (!this.overUiElement) event.preventDefault();

    return false;
  },

  onMove(this: TMouse, event: MouseEvent): void {
    const e = event ?? (window.event as MouseEvent);
    this.position.x = e.pageX || e.clientX || 0;
    this.position.y = e.pageY || e.clientY || 0;

    const { target } = event;
    if (target && target instanceof HTMLElement) {
      this.overUiElement = target.id != 'canvas';
    }

    const { game } = this;
    if (!game) return;

    if (this.left.isPressed) this.moveEvents.forEach((action) => action(this, 0, game));
  },

  setupHeldButtonLoop(button: TButtonState): void {
    let last = performance.now();

    const update = function (): void {
      const now = performance.now();
      const deltaSeconds = (now - last) / 1000;
      if (button.isPressed && this.game)
        button.actions.held.forEach((action) => action(this, deltaSeconds, this.game));
      last = now;
      button.rafId = requestAnimationFrame(update);
    }.bind(this);
    button.rafId = update();
  },

  setupEvents(this: TMouse, game: CGame): void {
    this.game = game;
    this.spawnedHandlers['mousedown'] = this.onMouseDown.bind(this);
    this.spawnedHandlers['mouseup'] = this.onMouseUp.bind(this);
    this.spawnedHandlers['mousemove'] = this.onMove.bind(this);
    this.spawnedHandlers['contextmenu'] = this.onRightDown.bind(this);

    for (const eventName in this.spawnedHandlers) {
      on<MouseEvent>(eventName, this.spawnedHandlers[eventName]);
    }
    if (this.left.actions.held.length > 0) this.setupHeldButtonLoop(this.left);
    if (this.right.actions.held.length > 0) this.setupHeldButtonLoop(this.right);
    if (this.middle.actions.held.length > 0) this.setupHeldButtonLoop(this.middle);
  },

  removeEvents(this: TMouse): void {
    for (const eventName in this.spawnedHandlers) {
      on<MouseEvent>(eventName, this.spawnedHandlers[eventName], true);
    }
    this.spawnedHandlers = {};

    if (this.right.rafId > -1) cancelAnimationFrame(this.right.rafId);
    if (this.left.rafId > -1) cancelAnimationFrame(this.left.rafId);
    if (this.middle.rafId > -1) cancelAnimationFrame(this.middle.rafId);
  },
};
