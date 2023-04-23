import { notNull } from '../not-null';

export const on = <TEvent = Event>(
  eventType: string,
  callack: (e: TEvent) => void,
  remove = false,
  element: Node | typeof window = document,
): void => {
  if (remove) {
    element.removeEventListener(eventType, callack as EventListener);

    return;
  }
  element.addEventListener(eventType, callack as EventListener);
};

export function get<T extends Element>(query: string): T {
  const element = notNull(document.querySelector<T>(query));

  return element;
}

get.all = <T extends Element>(query: string): T[] => {
  const elements = notNull(document.querySelectorAll<T>(query));

  return Array.from(elements);
};
