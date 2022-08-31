import { CSSProperties } from 'react';
import { get } from './utils/dom/dom';

/*
  ! all items can have the same zIndex and only active will have +1
 */

export const theme = { current: 'theme-default' };

export type TTagOptions = {
  text?: string;
  id?: string;
  className?: string;
  theme?: string;
  title?: string;
  style?: CSSProperties | CSSProperties[];
  onClick?: (e: MouseEvent) => void;
};

class CSSProp {
  constructor(public css: CSSProperties) {}
}

export type TTagArguments = HTMLElement | TTagOptions | string | CSSProp;

export const isPropOption = (prop: TTagArguments): boolean =>
  !(prop instanceof HTMLElement) && !(prop instanceof CSSProp) && !(typeof prop == 'string');

export const getOptionsFromProps = (props: TTagArguments[]): TTagOptions | undefined => {
  const options = props.filter((p) => isPropOption(p)) as TTagOptions[];
  if (options?.length > 0) return options[0];

  return undefined;
};

export const applyDefaultTheme = (props: TTagArguments[]): TTagArguments[] => {
  const noThemeOption = props.every((prop) => {
    if (isPropOption(prop)) {
      (prop as TTagOptions).theme = theme.current;

      return false;
    }

    return true;
  });

  return noThemeOption ? [...props, { theme: theme.current }] : props;
};

function tag(name: string, ...props: TTagArguments[]): HTMLElement {
  const element = document.createElement(name);
  let options: TTagOptions | undefined;
  const content: Node[] = [];
  const cssProps: CSSProp[] = [];

  props.forEach((prop) => {
    if (prop instanceof HTMLElement) {
      content.push(prop);

      return;
    }
    if (typeof prop == 'string') {
      content.push(document.createTextNode(prop));

      return;
    }
    if (prop instanceof CSSProp) {
      cssProps.push(prop);

      return;
    }
    options = prop;
  });

  if (options) {
    const { style, text, onClick, theme: themerOverride, title, ...attributes } = options;
    if (text) element.innerHTML = text;
    if (attributes) Object.assign(element, attributes);
    if (onClick) element.onclick = onClick;
    if (themerOverride) element.className += ` ${themerOverride}`;
    if (style) {
      if (style instanceof Array) {
        style.forEach((s) => Object.assign(element.style, s));
      } //
      else Object.assign(element.style, style);
    }
  }

  content.forEach((c) => element.appendChild(c));
  cssProps
    .map(({ css }) => css)
    .forEach((prop) => {
      Object.entries(prop).forEach(([key, value]) => {
        element.style[key] = value;
      });
    });

  return element;
}

export const Fixed = new CSSProp({ position: 'fixed' });
export const Flex = new CSSProp({ display: 'flex' });
export const SpaceBetween = new CSSProp({ justifyContent: 'space-between' });
export const JustifyRight = new CSSProp({ justifyContent: 'right' });
export const AlignRight = new CSSProp({ textAlign: 'right' });
export const Visible = new CSSProp({ visibility: 'visible' });
export const Hidden = new CSSProp({ visibility: 'hidden' });
export const Left = (value: string): CSSProp => new CSSProp({ left: value });
export const Right = (value: string): CSSProp => new CSSProp({ right: value });
export const Top = (value: string): CSSProp => new CSSProp({ top: value });
export const Bottom = (value: string): CSSProp => new CSSProp({ bottom: value });
export const MaxWidth = (value: string): CSSProp => new CSSProp({ maxWidth: value });
export const MarginRight = (value: string): CSSProp => new CSSProp({ marginRight: value });
export const MarginTop = (value: string): CSSProp => new CSSProp({ marginTop: value });
export const MarginBottom = (value: string): CSSProp => new CSSProp({ marginBottom: value });

export function addToViewport(...content: HTMLElement[]): void {
  const ui = get('#ui');
  if (ui) content.forEach((i) => ui.appendChild(i));
}

export function remove(element: HTMLElement): void {
  element.parentElement?.removeChild(element);
}

export function show(element: HTMLElement): void {
  element.style.visibility = 'visible';
  element.style.display = (element as HTMLElement & { savedDisplay: string }).savedDisplay;
}

export function hide(element: HTMLElement): void {
  element.style.visibility = 'hidden';
}

export function colapse(element: HTMLElement): void {
  (element as HTMLElement & { savedDisplay: string }).savedDisplay = element.style.display;
  element.style.display = 'none';
}

export const Text = (...props: TTagArguments[]): HTMLElement => tag('p', ...props);

export const Button = (...props: TTagArguments[]): HTMLElement =>
  tag('button', ...applyDefaultTheme(props));

export const Box = (...props: TTagArguments[]): HTMLElement => tag('div', ...props);

export const Panel = (...props: TTagArguments[]): HTMLElement => {
  const title = getOptionsFromProps(props)?.title;
  const CloseButton = Button('Close');
  const panel = Box(
    Box(Flex, SpaceBetween, MarginBottom('15px'), Text(title ?? '') /* , Box(Button('X')) */),
    ...applyDefaultTheme(props),
    Box(
      Flex,
      JustifyRight,
      MarginTop('15px'),
      CloseButton,
      // Button('Next >'),
    ),
  );

  CloseButton.onclick = (): void => colapse(panel);

  return panel;
};
