import { ProgressBar, TProgressBar } from '../../user-interface';

export type TAHealthBar = {
  healthBar: TProgressBar;
};

export function healthBar(width = '55px', height = '6px'): TAHealthBar {
  return {
    healthBar: ProgressBar({
      width,
      height,
    }),
  };
}
