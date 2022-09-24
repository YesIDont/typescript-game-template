import { TKeysAll } from './keys-types';

export type TKeyAction = (deltaSeconds: number) => void;
export type TKeyActionsMap = Map<TKeysAll, TKeyAction>;
export type TKeys = {
  downActions: TKeyActionsMap;
  upActions: TKeyActionsMap;
  heldActions: TKeyActionsMap;
  isKeyLoggingOn: boolean;
  on(key: TKeysAll, event: string, action: TKeyAction): void;
  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  setupEvents(): void;
};

export const keys: TKeys = {
  downActions: new Map<TKeysAll, TKeyAction>(),
  upActions: new Map<TKeysAll, TKeyAction>(),
  heldActions: new Map<TKeysAll, TKeyAction>(),
  isKeyLoggingOn: true,

  on(this: TKeys, key: TKeysAll, event: string, action: TKeyAction): void {
    /* eslint-disable indent */
    switch (event) {
      case 'down':
        this.downActions.set(key, action);
        break;

      case 'up':
        this.upActions.set(key, action);
        break;

      case 'held':
        this.heldActions.set(key, action);
        break;

      default:
        break;
    }
    /* eslint-enable indent */
  },

  onKeyDown(this: TKeys, event: KeyboardEvent): void {
    const action = this.downActions.get(event.key.toLowerCase() as TKeysAll);
    if (action) action(0);

    if (this.isKeyLoggingOn) {
      /*
        Key prop will return symbol produced by the OS rather then
        some kind of id of the physical button pressed on keyboard.
      */
      // console.log('event: key down: ', event);
      console.log('event.key: ', event.key);
    }
  },

  onKeyUp(this: TKeys, event: KeyboardEvent): void {
    const action = this.upActions.get(event.key.toLowerCase() as TKeysAll);
    if (action) action(0);

    if (this.isKeyLoggingOn) {
      /*
        Key prop will return symbol produced by the OS rather then
        some kind of id of the physical button pressed on keyboard.
      */
      // console.log('event: key up: ', event);
      console.log('event.key: ', event.key);
    }
  },

  setupEvents(this: TKeys): void {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    const { heldActions } = this;
    if (heldActions.size !== 0) {
      let last = performance.now();
      const loop = function (): void {
        const now = performance.now();
        const deltaSeconds = (now - last) / 1000;
        heldActions.forEach((action) => action(deltaSeconds));
        last = now;

        requestAnimationFrame(loop);
      };

      loop();
    }
  },
};