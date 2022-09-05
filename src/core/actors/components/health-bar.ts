import { ProgressBar, TProgressBar } from '../../user-interface';

export type HealthBar = {
  healthBar: TProgressBar;
};

export function healthBar(width = '55px', height = '6px'): HealthBar {
  return {
    healthBar: ProgressBar({
      width,
      height,
    }),
  };
}
