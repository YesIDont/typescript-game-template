import {
  AActorBase,
  Actor,
  CGame,
  Circle,
  COLLISION_TAGS,
  debugDraw,
  DebugDraw,
  EOnHitResponseType,
  movement,
  Movement,
  name,
  Name,
  newTimer,
  physics,
  position,
  Position,
  randomInRange,
  Update,
  update,
  Vector,
} from 'engine/';
import { marsLevel } from '../levels/level-mars';

const nextMeteorSpawnInSeconds = 1;
const meteorSpawnerComponent = {
  spawnTimer: newTimer(nextMeteorSpawnInSeconds),
  isOn: true,
};

type TMeteorSpawner = AActorBase & Name & Update & typeof meteorSpawnerComponent;
type TMeteor = AActorBase & Name & Update & DebugDraw & Position & Movement;

export const meteorSpawner = Actor.new<TMeteorSpawner>(
  meteorSpawnerComponent,
  name('meteors spawner'),
  update(function (this: TMeteorSpawner, _now: number, deltaSeconds: number, game: CGame) {
    if (this.isOn && this.spawnTimer.update(deltaSeconds)) {
      const meteor = marsLevel.spawn<TMeteor>(
        { name: 'meteor' },
        physics(
          Circle(true, 0, 0, randomInRange(1, 4), COLLISION_TAGS.WORLD_DYNAMIC),
          EOnHitResponseType.slideOff,
          function onHit(this: TMeteor, _a, _b, body, _c, otherActor) {
            if (otherActor.name != 'meteor') marsLevel.remove(body.owner);
          },
        ),
        debugDraw({ color: '#662200', zIndex: 50 }),
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        position(randomInRange(0, game.viewport.width + 600), -100),
        movement(randomInRange(90, 130)),
      );
      marsLevel.fireInDirection(meteor, Vector.new(randomInRange(-0.5, -0.03), 1));
    }
  }),
);
