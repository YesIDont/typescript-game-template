import { CCollisions } from '../collisions';
import { switchCollisionResponse } from '../collisions/responses';
import { TRenderer } from '../renderer';
import { array } from '../utils/arrays';
import { TVector, Vector } from '../vector';
import { TActor, TActorDefaults, TNewActorProps } from './types';

let ids = 0;
const emptyFn = (): void => {};

export const actorDefaults: TActorDefaults = {
  id: 0,
  name: 'New Actor',
  body: undefined,
  rotation: 0,
  speed: 0,
  maxSpeed: 1000,
  color: `#000`,
  visible: true,
  collides: true,
  shouldBeDeleted: false,
  beginPlay: emptyFn,
  update: emptyFn,
  onScreenLeave: emptyFn,
  onHit: emptyFn,
};

const dynamicDefaults = {
  velocity: (): TVector => Vector.new(),
};

export type TActors = Array<TActor> & {
  groups: { [key: string]: TActor[] };
  forGrup(groupName: string, callback: (a: TActor, index: number) => void): void;
  add<TCustomProps>(options?: TCustomProps & TNewActorProps): TActor & TCustomProps;
  spawn<TCustomProps>(options?: TCustomProps & TNewActorProps): TActor & TCustomProps;
  remove(actor: TActor): void;
  fireInDirection(actor: TActor, A: TVector, B?: TVector): void;
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
    ): TActor & TCustomProps {
      const id = ids;
      ids++;
      const { x, y, color, drawType, groups, collisionResponse, radius, zIndex, ...baseOptions } =
        options;
      const { body } = options;
      const actor = {} as TActor;

      const allOptions = Object.assign({}, actorDefaults, dynamicDefaults, baseOptions);
      Object.entries(allOptions).forEach(([key, value]) => {
        const dynamic = dynamicDefaults[key];
        actor[key] = dynamic ? baseOptions[key] ?? dynamic() : value;
      });

      actor.id = id;
      actor.onHit =
        // eslint-disable-next-line @typescript-eslint/unbound-method
        options.onHit ??
        (body && collisionResponse
          ? switchCollisionResponse(collisionResponse).bind(actor)
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

      return actor as TActor & TCustomProps;
    },

    spawn<TCustomProps>(
      this: TActors,
      options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
    ): TActor & TCustomProps {
      const actor = this.add(options);
      if (actor.visible) renderer.addRenderTarget(actor);
      if (actor.collides && actor.body) {
        collisions.insert(actor.body);
      }
      actor.beginPlay();

      return actor;
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

    fireInDirection(this: TActors, actor: TActor, unitVector: TVector): void {
      Vector.set(actor.velocity, unitVector);
    },
  });
}

export { newActors };
