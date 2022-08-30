export type TAxis = 'x' | 'y';
export type TSign = -1 | 0 | 1;
export type TEmptyFunction = () => void;
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type TDrawType = 'fill' | 'stroke';
export type TDebugDrawOptions = {
  drawType: TDrawType;
  color: string;
  zIndex: number;
  alpha: number;
  getColor(): string;
};
