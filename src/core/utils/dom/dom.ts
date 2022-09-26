import { notNull } from '../not-null';

export const on = <TEvent extends Event>(
  eventType: string,
  callack: (e: TEvent) => void,
  remove = false,
  element: Node | typeof window = document,
): void => {
  if (remove) {
    element.removeEventListener(eventType, callack);

    return;
  }
  element.addEventListener(eventType, callack);
};

export function get<T extends Element>(query: string): T {
  const element = notNull(document.querySelector<T>(query));

  return element;
}
