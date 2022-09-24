import { ProgressBar, TProgressBar, TTagArguments } from '../../user-interface';

export type HealthBar = {
  healthBar: TProgressBar;
};

export function healthBar(...props: TTagArguments[]): HealthBar {
  return {
    healthBar: ProgressBar(...props),
  };
}
