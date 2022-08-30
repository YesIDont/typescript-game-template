import { array } from './array';
import { CCollisions } from './collisions';
import { TShape } from './collisions/proxyTypes';
import { switchCollisionResponse, TCollisionResponseName } from './collisions/responses';
import { TCollisionResult } from './collisions/types';
import { TRenderer } from './renderer';
import { TDrawType } from './types/base-types';
import { TVector } from './vector';

let ids = 0;

export const actorDefaults = {
  id: 0 as number,
  name: 'New Actor' as string,
  body: undefined as TShape | undefined,
  velocity: [0, 0] as TVector,
  turn: [0, 0] as TVector,
  turnRate: 0 as number,
  speed: 0 as number,
  maxSpeed: 0 as number,
  color: '#000' as string,
  visible: true as boolean,
  collides: true as boolean,
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
  onHit(now: number, deltaSeconds: number, body: TShape, result: TCollisionResult): void {
    //
  },
};

export type TActor = typeof actorDefaults;

export type TNewActorProps = {
  id?: number;
  x?: number;
  y?: number;
  name?: string;
  groups?: string[];
  body?: TShape | undefined;
  velocity?: TVector;
  turn?: TVector;
  turnRate?: number;
  speed?: number;
  maxSpeed?: number;
  color?: string;
  drawType?: TDrawType;
  visible?: boolean;
  collides?: boolean;
  collisionResponse?: TCollisionResponseName;
  beginPlay?(): void;
  update?(now: number, deltaSeconds: number): void;
  onHit?(now: number, deltaSeconds: number, body: TShape, result: TCollisionResult): void;
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
      const { x, y, color, drawType, groups, collisionResponse, ...baseOptions } = options;
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
        if (x) body.x = x;
        if (y) body.y = y;
        if (color) body.debugDraw.color = color;
        if (drawType) body.debugDraw.drawType = drawType;
        body.owner = actor;
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
