import { CSSProperties } from 'react';
import { CGame } from './game';
import { get } from './utils/dom/dom';
import { emptyFn } from './utils/misc';
import { TVector, Vector } from './vector';

/*
  ! all items can have the same zIndex and only active will have +1
 */

export const theme = { current: 'theme-default' };

export type TRootUiElement = HTMLDivElement & { game: CGame };

export type TTagOptions = {
  text?: string;
  id?: string;
  className?: string;
  theme?: string;
  title?: string;
  progress?: number; // 0 - 1
  x?: number;
  y?: number;
  width?: string; // 0 - 1
  height?: string; // 0 - 1
  relativePosition?: TVector;
  radiusAdjustment?: TVector;
  color?: string; // 0 - 1
  style?: CSSProperties | CSSProperties[];
  src?: string;
  alt?: string;
  type?: string;
  buttonText?: string;
  // tooltip?: TTooltipSettings;
  onClick?: (e: MouseEvent) => void;
  onClose?: () => void;
  beginPlay?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onCollapse?: () => void;
  onRemove?: () => void;
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
  relativePosition: TVector;
  radiusAdjustment: TVector;
  class: {
    add(className: string): void;
    replace(className: string, newValue: string): void;
    remove(className: string): void;
  };
  clearContent(): void;
  replaceContent(...content: Node[]): void;
  setPosition(x: number, y: number): void;
  onClose(): void;
  onShow?: () => void;
  onHide?: () => void;
  onCollapse?: () => void;
  onRemove?: () => void;
  setOnClose(callback: () => void): void;
  setX(x: number): void;
  setY(y: number): void;
  beginPlay?: () => void;
};

export type TTagComponents = {
  options?: TTagOptions;
  content: Node[];
  cssProps: CSSProp[];
};

export const getTagArgumentsComponents = (...props: TTagArguments[]): TTagComponents => {
  const options: TTagOptions = {};
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
    Object.assign(options, prop);
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
  const uiItem = element as TUiItem;

  if (options) {
    const {
      style,
      text,
      onClick,
      onShow,
      onHide,
      onCollapse,
      onRemove,
      theme: themerOverride,
      title,
      x,
      y,
      relativePosition,
      radiusAdjustment,
      ...attributes
    } = options;

    if (text) element.innerHTML = text;
    if (attributes) Object.assign(element, attributes);
    if (onClick) element.onclick = onClick;

    if (onShow) uiItem.onShow = onShow;
    if (onHide) uiItem.onHide = onHide;
    if (onCollapse) uiItem.onCollapse = onCollapse;
    if (onRemove) uiItem.onRemove = onRemove;
    uiItem.relativePosition = relativePosition ?? Vector.new(0, 0);
    uiItem.radiusAdjustment = radiusAdjustment ?? Vector.new(0, 0);
    if (x || y)
      uiItem.beginPlay = function (this: TUiItem): void {
        setTimeout(() => {
          if (x) this.style.left = `${x}px`;
          if (y) this.style.top = `${y}px`;
        }, 100);
      };
    if (themerOverride) element.className += ` ${themerOverride}`;
    if (style) {
      if (style instanceof Array) {
        style.forEach((s) => Object.assign(element.style, s));
      } //
      else Object.assign(element.style, style);
    }
  }

  element.className += ' animate-grow animate-pop positioned';
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

  uiItem.class = {
    add(className: string): void {
      uiItem.className += ` ${className}`;
    },
    replace(className: string, newValue: string): void {
      uiItem.className = uiItem.className.replace(className, newValue);
    },
    remove(className: string): void {
      uiItem.class.replace(className, '');
    },
  };

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
export const Color = (value: string): CSSProp => new CSSProp({ color: value });
export const Overflow = (value: string): CSSProp => new CSSProp({ overflow: value });
export const Width = (value: string): CSSProp => new CSSProp({ width: value });
export const Height = (value: string): CSSProp => new CSSProp({ height: value });
export const MaxHeight = (value: string): CSSProp => new CSSProp({ maxHeight: value });
export const MinWidth = (value: string): CSSProp => new CSSProp({ minWidth: value });
export const MinHeight = (value: string): CSSProp => new CSSProp({ minHeight: value });
export const Left = (value: string): CSSProp => new CSSProp({ left: value });
export const Right = (value: string): CSSProp => new CSSProp({ right: value });
export const Top = (value: string): CSSProp => new CSSProp({ top: value });
export const Bottom = (value: string): CSSProp => new CSSProp({ bottom: value });
export const MaxWidth = (value: string): CSSProp => new CSSProp({ maxWidth: value });
export const MarginRight = (value: string): CSSProp => new CSSProp({ marginRight: value });
export const MarginLeft = (value: string): CSSProp => new CSSProp({ marginLeft: value });
export const MarginTop = (value: string): CSSProp => new CSSProp({ marginTop: value });
export const MarginBottom = (value: string): CSSProp => new CSSProp({ marginBottom: value });
export const PaddingTop = (value: string): CSSProp => new CSSProp({ paddingTop: value });
export const PaddingBottom = (value: string): CSSProp => new CSSProp({ paddingBottom: value });
export const Background = (value: string): CSSProp => new CSSProp({ background: value });
export const Border = (value: string): CSSProp => new CSSProp({ border: value });
export const BorderTop = (value: string): CSSProp => new CSSProp({ borderTop: value });
export const BorderBottom = (value: string): CSSProp => new CSSProp({ borderBottom: value });
export const NoBorder = new CSSProp({ border: 'none' });
export const ZIndex = (value: number): CSSProp => new CSSProp({ zIndex: value });

export function addToViewport(...content: HTMLElement[]): void {
  const ui = get('#ui');
  if (ui) {
    (content as TUiItem[]).forEach((i) => {
      ui.appendChild(i);
      if (
        i.className.includes('panel') &&
        i.style.display !== 'none' &&
        i.style.visibility !== 'hidden'
      ) {
        get.all<TUiItem>('.panel').forEach((p) => {
          p.class.remove('active');
        });
        i.class.add('active');

        return;
      }

      i.class.remove('active');
    });
  }
}

export function remove(element: HTMLElement): void {
  element.parentElement?.removeChild(element);
  (element as TUiItem).onRemove?.();
}

export function show(element: HTMLElement): void {
  element.style.display = (element as HTMLElement & { savedDisplay: string }).savedDisplay;
  element.style.visibility = 'visible';
  (element as TUiItem).onShow?.();
}

export function hide(element: HTMLElement): void {
  element.style.visibility = 'hidden';
  (element as TUiItem).onHide?.();
}

export function collapse(element: HTMLElement): void {
  (element as HTMLElement & { savedDisplay: string }).savedDisplay = element.style.display;
  element.style.display = 'none';
  (element as TUiItem).onCollapse?.();
}

export const Text = (...props: TTagArguments[]): TUiItem => tag('p', ...props);

export const Button = (...props: TTagArguments[]): TUiItem => {
  const button = tag('button', { type: 'button' }, ...applyDefaultTheme(props));
  // button.type = 'button';

  return button;
};

export const Box = (...props: TTagArguments[]): TUiItem => tag('div', ...props);

export const Image = (...props: TTagArguments[]): TUiItem => tag('img', ...props);

export const Panel = (...props: TTagArguments[]): TUiItem => {
  const options = getOptionsFromProps(props);
  const { title, buttonText, onClose, className } = options ?? {};
  const CloseButton = Button(buttonText ?? 'Close');
  const buttonsArea = Box(
    Flex,
    JustifyRight,
    MarginTop('10px'),
    CloseButton,
    BorderTop('1px solid #555'),
    PaddingTop('10px'),
    // Button('Next >'),
  );
  const titleBar = Box(
    Flex,
    SpaceBetween,
    MarginBottom('10px'),
    Text(title ?? ''),
    BorderBottom('1px solid #555'),
    PaddingBottom('10px'),
  );
  const newPanel = Box(titleBar, ...applyDefaultTheme(props), buttonsArea, ZIndex(10), {
    className: 'panel' + (className ?? ''),
  });

  CloseButton.onclick = (): void => {
    collapse(newPanel);
    if (onClose) onClose();
  };

  newPanel.replaceContent = (...newContent: Node[]): void => {
    newPanel.clearContent();
    if (title) newPanel.appendChild(titleBar);
    newContent.forEach((c) => newPanel.appendChild(c));
    if (title) newPanel.appendChild(buttonsArea);
  };

  newPanel.setOnClose = (callback: () => void): void => {
    CloseButton.onclick = (): void => {
      collapse(newPanel);
      callback();
    };
  };

  return newPanel;
};

export type TProgressBar = TUiItem & {
  setProgress(value: number): void;
};

export const ProgressBar = (...props: TTagArguments[]): TProgressBar => {
  const options = getOptionsFromProps(props);
  const width = options?.width ?? '55px';
  const height = options?.height ?? '6px';
  const progressBox = Box(
    Absolute,
    Left('0'),
    Top('0'),
    Bottom('0'),
    Right('0'),
    Background(options?.color ?? 'red'),
  );

  const newPanel = Box(
    Width(width),
    Height(height),
    Border('1px solid #333'),
    Background('#222'),
    Fixed,
    progressBox,
    ...props,
  );

  const bar = newPanel as TProgressBar;

  bar.setProgress = (value: number): void => {
    progressBox.style.right = `${100 - value * 100}%`;
  };

  return bar;
};

export const healthBarWidget = ProgressBar;
