import { on } from '../utils/dom/dom';
import { TVector, Vector } from '../vector';

export type TMouseClickHandler = (m: TMouse) => void;

export type TMouse = {
  position: TVector;
  overUiElement: boolean;

  leftClickEvents: TMouseClickHandler[];
  leftPressed: boolean;
  onLeftDown(event: MouseEvent): void;
  onLeftUp(event: MouseEvent): void;

  rightClickEvents: TMouseClickHandler[];
  rightPressed: boolean;
  onRightDown(event: MouseEvent): boolean;

  middlePressed: boolean;

  onMove(event: MouseEvent): void;
  setupEvents(): void;
};

export const mouse: TMouse = {
  position: Vector.new(),
  overUiElement: true,
  leftClickEvents: [],
  rightClickEvents: [],
  leftPressed: false,
  rightPressed: false,
  middlePressed: false,

  onLeftDown(this: TMouse, event: MouseEvent): void {
    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        this.rightPressed = true;
        break;

      case 1: // MIDDLE mouse button
        this.middlePressed = true;
        break;

      default:
        // LEFT mouse button
        this.leftPressed = true;
        break;
    }
    /* eslint-enable indent */
  },

  onLeftUp(this: TMouse, event: MouseEvent): void {
    /* eslint-disable indent */
    switch (event.button) {
      case 2: // RIGHT mouse button
        this.rightPressed = false;
        break;

      case 1: // MIDDLE mouse button
        this.middlePressed = false;
        break;

      default:
        // LEFT mouse button
        this.leftPressed = false;
        break;
    }
    /* eslint-enable indent */
  },

  onRightDown(this: TMouse, event: MouseEvent): boolean {
    event.preventDefault();

    return false;
  },

  onMove(this: TMouse, event: MouseEvent): void {
    const e = event ?? (window.event as MouseEvent);
    this.position.x = e.pageX || e.clientX || 0;
    this.position.y = e.pageY || e.clientY || 0;

    if (this.leftPressed) this.leftClickEvents.forEach((action) => action(this));

    const { target } = event;
    if (target && target instanceof HTMLElement) {
      this.overUiElement = target.id != 'canvas';
    }
  },

  setupEvents(): void {
    on('mousedown', this.onLeftDown.bind(this));
    on('mouseup', this.onLeftUp.bind(this));
    on('mousemove', this.onMove.bind(this));
    on('contextmenu', this.onRightDown.bind(this));
  },
};
