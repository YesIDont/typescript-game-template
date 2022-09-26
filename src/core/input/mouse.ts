import { on } from '../utils/dom/dom';
import { TVector, Vector } from '../vector';

export type TMouseClickHandler = (m: TMouse) => void;
export type EMouseEvent = 'pressed' | 'released' | 'held';
export type EMouseButton = 'left' | 'right' | 'middle';
export type TMouseEventHandler = (e: MouseEvent) => void;
export type TButtonState = {
  actions: {
    down: TMouseClickHandler[];
    up: TMouseClickHandler[];
    held: TMouseClickHandler[];
  };
  isPressed: boolean;
};

export const newButtonState = (): TButtonState => ({
  actions: {
    down: [],
    up: [],
    held: [],
  },
  isPressed: false,
});

export type TMouse = {
  position: TVector;
  overUiElement: boolean;
  loggingOn: boolean;

  left: TButtonState;
  right: TButtonState;
  middle: TButtonState;
  moveEvents: TMouseClickHandler[];

  onMouseDown(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
  onMove(event: MouseEvent): void;
  onRightDown(event: MouseEvent): void;

  setupEvents(): void;
  on(button: EMouseButton, eventType: EMouseEvent, handler: TMouseEventHandler): void;
};

export const mouse: TMouse = {
  position: Vector.new(),
  overUiElement: true,
  loggingOn: false,
  left: newButtonState(),
  right: newButtonState(),
  middle: newButtonState(),
  moveEvents: [],

  on(button: EMouseButton, eventType: EMouseEvent, handler: TMouseEventHandler): void {},

  onMouseDown(this: TMouse, event: MouseEvent): void {
    if (!this.overUiElement) event.preventDefault();

    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        if (this.loggingOn) console.log('RIGHT down');
        this.right.isPressed = true;
        break;

      case 1: // MIDDLE mouse button
        if (this.loggingOn) console.log('MIDDLE down');
        this.middle.isPressed = true;
        break;

      default:
        // LEFT mouse button
        if (this.loggingOn) console.log('LEFT down');
        this.left.isPressed = true;
        break;
    }
    /* eslint-enable indent */
  },

  onMouseUp(this: TMouse, event: MouseEvent): void {
    if (!this.overUiElement) event.preventDefault();

    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        if (this.loggingOn) console.log('RIGHT up');
        this.right.isPressed = false;
        break;

      case 1: // MIDDLE mouse button
        if (this.loggingOn) console.log('MIDDLE up');
        this.middle.isPressed = false;
        break;

      default:
        // LEFT mouse button
        if (this.loggingOn) console.log('LEFT up');
        this.left.isPressed = false;
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

    if (this.left.isPressed) this.moveEvents.forEach((action) => action(this));
  },

  setupEvents(): void {
    on('mousedown', this.onMouseDown.bind(this));
    on('mouseup', this.onMouseUp.bind(this));
    on('mousemove', this.onMove.bind(this));
    on('contextmenu', this.onRightDown.bind(this));
  },
};
