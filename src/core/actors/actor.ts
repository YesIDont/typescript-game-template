import { array } from '../array';
import { CCollisions } from '../collisions';
import { switchCollisionResponse } from '../collisions/responses';
import { TRenderer } from '../renderer';
import { TActor, TNewActorProps } from './types';

let ids = 0;

export const actorDefaults: TActor = {
  id: 0,
  name: 'New Actor',
  body: undefined,
  velocity: [0, 0],
  turn: [0, 0],
  turnRate: 0,
  speed: 0,
  maxSpeed: 1000,
  color: '#000',
  visible: true,
  collides: true,
  shouldBeDeleted: false,
  beginPlay(): void {
    //
  },
  update(now: number, deltaSeconds: number): void {
    //
  },
  // !
  onScreenLeave(now: number, deltaSeconds: number): void {
    //
  },
  onHit(): void {
    //
  },
};

export type TActors = Array<TActor> & {
  groups: { [key: string]: TActor[] };
  forGrup(groupName: string, callback: (a: TActor, index: number) => void): void;
  add<TCustomProps, TCustomActor>(options?: TCustomProps & TNewActorProps): TActor & TCustomActor;
  spawn<TCustomProps, TCustomActor>(options?: TCustomProps & TNewActorProps): TActor & TCustomActor;
  remove(actor: TActor): void;
};

function newActors(renderer: TRenderer, collisions: CCollisions): TActors {
  return Object.assign([], {
    groups: {},

    forGrup(this: TActors, groupName: string, callback: (a: TActor, index: number) => void): void {
      const group = this.groups[groupName];
      if (!group) return;

      const { length } = group;

      for (let i = 0; i < length; i++) {
        callback(group[i], i);
      }
    },

    add<TCustomProps, TCustomActor>(
      this: TActors,
      options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
    ): TActor & TCustomActor {
      const id = ids;
      ids++;
      const { x, y, color, drawType, groups, collisionResponse, radius, zIndex, ...baseOptions } =
        options;
      const { body } = options;

      const actor = {} as TActor;

      const allOptions = Object.assign({}, actorDefaults, baseOptions);

      Object.entries(allOptions).forEach(([key, value]) => {
        actor[key] = value;
      });

      actor.id = id;
      actor.onHit =
        // eslint-disable-next-line @typescript-eslint/unbound-method
        options.onHit ??
        (body && collisionResponse
          ? switchCollisionResponse(collisionResponse)
          : actorDefaults.onHit.bind(actor));

      if (body) {
        body.id = id;
        body.owner = actor;
        if (x) body.x = x;
        if (y) body.y = y;
        if (color) body.debugDraw.color = color;
        if (drawType) body.debugDraw.drawType = drawType;
        if (radius && body.radius) body.radius = radius;
        if (zIndex != undefined) body.debugDraw.zIndex = zIndex;
      }

      groups?.forEach((groupName) => {
        if (!this.groups[groupName]) this.groups[groupName] = [];
        this.groups[groupName].push(actor);
      });

      this.push(actor);

      return actor as TActor & TCustomActor;
    },

    spawn<TCustomProps, TCustomActor>(
      this: TActors,
      options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
    ): TActor & TCustomActor {
      const actor = this.add(options);
      if (actor.visible) renderer.addRenderTarget(actor);
      if (actor.collides && actor.body) {
        collisions.insert(actor.body);
      }
      actor.beginPlay();

      return actor as TActor & TCustomActor;
    },

    remove(this: TActors, actor: TActor): void {
      if (actor.body) collisions.remove(actor.body);
      renderer.removeRenderTarget(actor);
      array.removeBy(this, (e) => e.id == actor.id);
      delete actor.body;
    },

    removeAll(this: TActors, id: number): void {
      array.removeAllBy(this, (e) => e.id == id);
    },

    getById(this: TActors, id: number): TActor | undefined {
      return this.find((a) => a.id == id);
    },

    getByName(this: TActors, name: string): TActor | undefined {
      return this.find((a) => a.name == name);
    },

    getAllByName(this: TActors, name: string): TActor[] {
      return this.filter((a) => a.name == name);
    },
  });
}

export { newActors };
