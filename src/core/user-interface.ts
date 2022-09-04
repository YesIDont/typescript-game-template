import { CSSProperties } from 'react';
import { get } from './utils/dom/dom';
import { emptyFn } from './utils/misc';
import { TVector, Vector } from './vector';

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
  progress?: number; // 0 - 1
  width?: string; // 0 - 1
  height?: string; // 0 - 1
  style?: CSSProperties | CSSProperties[];
  // tooltip?: TTooltipSettings;
  onClick?: (e: MouseEvent) => void;
  onClose?: () => void;
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

export type TUiItem = HTMLElement & {
  savedDisplay: string;
  anchor: TVector;
  clearContent(): void;
  replaceContent(...content: Node[]): void;
  setPosition(x: number, y: number): void;
  onClose(): void;
  setOnClose(callback: () => void): void;
  setX(x: number): void;
  setY(y: number): void;
};

export type TTagComponents = {
  options?: TTagOptions;
  content: Node[];
  cssProps: CSSProp[];
};

export const getTagArgumentsComponents = (...props: TTagArguments[]): TTagComponents => {
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

  return {
    options,
    content,
    cssProps,
  };
};

function tag(name: string, ...props: TTagArguments[]): TUiItem {
  const element = document.createElement(name);
  const { options, content, cssProps } = getTagArgumentsComponents(...props);

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

  element.className += ' animate-grow animate-pop positioned';
  const uiItem = element as TUiItem;
  uiItem.savedDisplay = element.style.display;
  uiItem.anchor = Vector.new(0.5, 0.5);
  uiItem.clearContent = (...newContent: Node[]): void => {
    uiItem.innerHTML = '';
  };
  uiItem.replaceContent = (...newContent: Node[]): void => {
    uiItem.clearContent();
    newContent.forEach((c) => uiItem.appendChild(c));
  };
  uiItem.setX = (value: number): void => {
    if (uiItem.clientWidth === 0) {
      setTimeout(() => {
        uiItem.style.left = `${value - uiItem.anchor.x * uiItem.clientWidth}px`;
      }, 100);

      return;
    }
    uiItem.style.left = `${value - uiItem.anchor.x * uiItem.clientWidth}px`;
  };

  uiItem.setY = (value: number): void => {
    if (uiItem.clientWidth === 0) {
      setTimeout(() => {
        uiItem.style.top = `${value - uiItem.anchor.x * uiItem.clientHeight}px`;
      }, 100);

      return;
    }
    uiItem.style.top = `${value - uiItem.anchor.y * uiItem.clientHeight}px`;
  };
  uiItem.setPosition = (x: number, y: number): void => {
    uiItem.setX(x);
    uiItem.setY(y);
  };
  uiItem.onClose = options?.onClose ?? emptyFn;
  uiItem.setOnClose = (callback: () => void): void => {
    uiItem.onClose = callback;
  };

  content.forEach((c) => uiItem.appendChild(c));
  cssProps
    .map(({ css }) => css)
    .forEach((prop) => {
      Object.entries(prop).forEach(([key, value]) => {
        uiItem.style[key] = value;
      });
    });

  return uiItem;
}

export const Relative = new CSSProp({ position: 'relative' });
export const Absolute = new CSSProp({ position: 'absolute' });
export const Fixed = new CSSProp({ position: 'fixed' });
export const Flex = new CSSProp({ display: 'flex' });
export const SpaceBetween = new CSSProp({ justifyContent: 'space-between' });
export const JustifyRight = new CSSProp({ justifyContent: 'right' });
export const AlignRight = new CSSProp({ textAlign: 'right' });
export const Visible = new CSSProp({ visibility: 'visible' });
export const Hidden = new CSSProp({ visibility: 'hidden' });
export const Collapsed = new CSSProp({ display: 'none' });
export const Width = (value: string): CSSProp => new CSSProp({ width: value });
export const Height = (value: string): CSSProp => new CSSProp({ height: value });
export const Left = (value: string): CSSProp => new CSSProp({ left: value });
export const Right = (value: string): CSSProp => new CSSProp({ right: value });
export const Top = (value: string): CSSProp => new CSSProp({ top: value });
export const Bottom = (value: string): CSSProp => new CSSProp({ bottom: value });
export const MaxWidth = (value: string): CSSProp => new CSSProp({ maxWidth: value });
export const MarginRight = (value: string): CSSProp => new CSSProp({ marginRight: value });
export const MarginTop = (value: string): CSSProp => new CSSProp({ marginTop: value });
export const MarginBottom = (value: string): CSSProp => new CSSProp({ marginBottom: value });
export const Background = (value: string): CSSProp => new CSSProp({ background: value });
export const Border = (value: string): CSSProp => new CSSProp({ border: value });

export function addToViewport(...content: HTMLElement[]): void {
  const ui = get('#ui');
  if (ui) content.forEach((i) => ui.appendChild(i));
}

export function remove(element: HTMLElement): void {
  element.parentElement?.removeChild(element);
}

export function show(element: HTMLElement): void {
  element.style.display = (element as HTMLElement & { savedDisplay: string }).savedDisplay;
  element.style.visibility = 'visible';
}

export function hide(element: HTMLElement): void {
  element.style.visibility = 'hidden';
}

export function colapse(element: HTMLElement): void {
  (element as HTMLElement & { savedDisplay: string }).savedDisplay = element.style.display;
  element.style.display = 'none';
}

export const Text = (...props: TTagArguments[]): TUiItem => tag('p', ...props);

export const Button = (...props: TTagArguments[]): TUiItem =>
  tag('button', ...applyDefaultTheme(props));

export const Box = (...props: TTagArguments[]): TUiItem => tag('div', ...props);

export const Panel = (...props: TTagArguments[]): TUiItem => {
  const options = getOptionsFromProps(props);
  const title = options?.title;
  const CloseButton = Button('Close');
  const buttonsArea = Box(
    Flex,
    JustifyRight,
    MarginTop('15px'),
    CloseButton,
    // Button('Next >'),
  );
  const titleBar = Box(
    Flex,
    SpaceBetween,
    MarginBottom('15px'),
    Text(title ?? '') /* , Box(Button('X')) */,
  );
  const panel = Box(titleBar, ...applyDefaultTheme(props), buttonsArea);

  CloseButton.onclick = (): void => {
    colapse(panel);
    if (options?.onClose) options.onClose();
  };

  panel.replaceContent = (...newContent: Node[]): void => {
    panel.clearContent();
    if (title) panel.appendChild(titleBar);
    newContent.forEach((c) => panel.appendChild(c));
    if (title) panel.appendChild(buttonsArea);
  };

  panel.setOnClose = (callback: () => void): void => {
    CloseButton.onclick = (): void => {
      colapse(panel);
      callback();
    };
  };

  return panel;
};

export type TProgressBar = TUiItem & {
  setProgress(value: number): void;
};

export const ProgressBar = (...props: TTagArguments[]): TProgressBar => {
  const options = getOptionsFromProps(props);
  const width = options?.width ?? '55px';
  const height = options?.height ?? '6px';
  const progressBox = Box(
    ...props,
    Absolute,
    Left('0'),
    Top('0'),
    Bottom('0'),
    Right('0'),
    Background('red'),
  );

  const panel = Box(
    Width(width),
    Height(height),
    Border('1px solid #333'),
    Background('#8a0000'),
    Fixed,
    progressBox,
  );

  const bar = panel as TProgressBar;

  bar.setProgress = (value: number): void => {
    progressBox.style.right = `${100 - value * 100}%`;
  };

  return bar;
};
