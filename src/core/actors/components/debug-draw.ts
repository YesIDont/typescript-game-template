import { alphaToHex } from '../../utils/colors';

export type TDebugDrawActorComponentProps = {
  drawType: TDrawType;
  color: string;
  zIndex: number;
  alpha: number;
  visible: boolean;
  getColor(this: TDebugDrawActorComponentProps): string;
};

export type DebugDraw = {
  debugDraw: TDebugDrawActorComponentProps;
};

export type TDrawType = 'fill' | 'stroke';
export type TDebugDrawOptions = {
  drawType?: TDrawType;
  color?: string;
  zIndex?: number;
  alpha?: number;
  visible?: boolean;
};

export function debugDraw({
  drawType,
  color,
  zIndex,
  alpha,
  visible,
}: TDebugDrawOptions = {}): DebugDraw {
  return {
    debugDraw: {
      drawType: drawType ?? 'fill',
      color: color ?? '#000',
      zIndex: zIndex ?? 1,
      alpha: alpha ?? 1,
      visible: visible ?? true,
      getColor(this: TDebugDrawActorComponentProps): string {
        return `${this.color}${this.alpha < 1 ? alphaToHex(this.alpha) : ''}`;
      },
    },
  };
}
