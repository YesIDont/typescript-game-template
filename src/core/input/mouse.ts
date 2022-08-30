export type TMouseClickHandler = (m: TMouse) => void;

export type TMouse = {
  x: number;
  y: number;
  leftClickEvents: TMouseClickHandler[];
  rightClickEvents: TMouseClickHandler[];
  onLeftClick(): void;
  onRightClick(): void;
  updatePointerPosition(event: MouseEvent): void;
};

export const mouse: TMouse = {
  x: 0,
  y: 0,
  leftClickEvents: [],
  rightClickEvents: [],

  onLeftClick(this: TMouse): void {
    console.log('left click');
    this.leftClickEvents.forEach((action) => action(this));
  },

  onRightClick(this: TMouse): void {
    console.log('right click');
  },

  updatePointerPosition(this: TMouse, event: MouseEvent): void {
    const e = event ?? (window.event as MouseEvent);
    this.x = e.pageX || e.clientX || 0;
    this.y = e.pageY || e.clientY || 0;
  },
};
