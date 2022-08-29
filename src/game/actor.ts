import { array } from '../core/array';
import { CCircle } from '../core/collisions/circle';
import { TShape } from '../core/collisions/proxyTypes';
import { TVector } from '../core/vector';

let ids = 0;

export type TActor = {
  id: number;
  name: string;
  body: TShape;
  velocity: TVector;
  turn: TVector;
  turnRate: number;
  speed: number;
  maxSpeed: number;
};

export type TActors = Array<TActor> & {
  groups: { [key: string]: TActor[] };
  forGrup(groupName: string, callback: (a: TActor, index: number) => void): void;
  add(): TActor;
  remove(id: number): void;
};

export type TNewActorProps = {
  name?: string;
  body?: TShape;
  velocity?: TVector;
  turn?: TVector;
  turnRate?: number;
  speed?: number;
  maxSpeed?: number;
  groups?: string[];
};

function newActors(): TActors {
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

    add(this: TActors, options: TNewActorProps = {}): TActor {
      const id = ++ids;
      const actor = {
        id,
        name: options.name ?? `Actor nr ${id}`,
        body: options.body ?? (new CCircle() as TShape),
        velocity: options.velocity ?? [0, 0],
        turn: options.turn ?? [0, 0],
        turnRate: options.turnRate ?? 0,
        speed: options.speed ?? 0,
        maxSpeed: options.maxSpeed ?? 0,
      };

      if (options.groups) {
        options.groups.forEach((groupName) => {
          if (!this.groups[groupName]) this.groups[groupName] = [];
          this.groups[groupName].push(actor);
        });
      }

      this.push(actor);

      return actor;
    },

    remove(this: TActors, id: number): void {
      array.removeBy(this, (e) => e.id == id);
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
  });
}

export { newActors };
