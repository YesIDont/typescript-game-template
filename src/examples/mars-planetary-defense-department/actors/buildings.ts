import { Actor, Circle } from 'engine/';
import { buildingTemplate, TBuilding } from './blueprints/building-template';
import { groundHeight } from './ground';

export const mainBuilding = Actor.new<TBuilding>(
  ...buildingTemplate('B-01', 0, -groundHeight + 5, Circle(true, 0, 0, 40), '#fff', 100, 0.3, {
    maxPower: 160,
    regenerationBoost: 8,
    cooldownTime: 3,
    afterHitCooldown: 4,
  }),
);

export const building02 = Actor.new<TBuilding>(
  ...buildingTemplate('B-02', -45, -groundHeight + 5, Circle(true, 0, 0, 20), '#edc', 60, 0.4),
);

export const building03 = Actor.new<TBuilding>(
  ...buildingTemplate('B-03', 35, -groundHeight + 5, Circle(true, 0, 0, 28), '#ddd', 70, 0.7),
);

export const building04 = Actor.new<TBuilding>(
  ...buildingTemplate('B-04', 70, -groundHeight + 5, Circle(true, 0, 0, 18), '#ffe', 50),
);

export const ammoFactoryBuilding = Actor.new<TBuilding>(
  ...buildingTemplate(
    'Ammo Factory',
    220,
    -groundHeight + 5,
    Circle(true, 0, 0, 18),
    '#ff5500',
    50,
    0.5,
    {
      maxPower: 70,
      regenerationBoost: 4,
      cooldownTime: 6,
      afterHitCooldown: 7,
    },
  ),
);
