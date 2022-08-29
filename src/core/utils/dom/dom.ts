import { notNull } from '../not-null';

export const on = (eventType: string, callack: () => void, element: Node = document): void =>
  element.addEventListener(eventType, callack);

export function get<T extends Element>(query: string): T {
  const element = notNull(document.querySelector<T>(query));

  return element;
}
