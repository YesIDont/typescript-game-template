import { debugDraw, physics, TAPhysics } from './actors/components';
import { name } from './actors/components/name';
import { newActor, TActor, TNewActorProps } from './actors/new-actor';
import { CCollisions } from './collisions';
import { TShape } from './collisions/proxyTypes';
import { EOnHitResponseType } from './collisions/responses';
import { TOptions } from './options';
import { TRenderer } from './renderer';
import { addToViewport } from './user-interface';
import { array } from './utils/arrays';
import { get } from './utils/dom/dom';
import { TVector, Vector } from './vector';
import { TViewport } from './viewport';

export type NewLevelOptions = {
  name: string;
};

export class CLevel {
  content: TActor[] = [];
  groups: { [key: string]: TActor[] } = {};
  collisions: CCollisions = new CCollisions();
  viewport: TViewport;
  renderer: TRenderer;
  size: TVector;
  options: TOptions;
  /* Must be unique across the game. */
  name: string;

  constructor(
    props: NewLevelOptions,
    viewport: TViewport,
    renderer: TRenderer,
    options: TOptions,
    size: TVector = Vector.new(600, 400),
  ) {
    this.name = props.name;
    this.viewport = viewport;
    this.renderer = renderer;
    this.options = options;
    this.size = size;
    renderer.clearRenderTargets();
  }

  /* Called after level initialisation but before first tick. */
  beginPlay(): void {
    //
  }

  run(): void {
    this.collisions
      .createWorldBounds(this.size.x, this.size.y, 500, -700)
      .forEach((boundBody: TShape) => {
        this.add(
          name('world bound'),
          physics(
            boundBody,
            EOnHitResponseType.slideOff,
            function onHit(now, deltaSeconds, body, otherBody, otherActor, result): void {
              this.level.remove(otherActor);
              console.log(this.level.content.length);
            },
          ),
          debugDraw({ alpha: 0.1, color: '#ff0000' }),
        );
      });

    this.content.forEach((actor) => {
      if (actor.visible) this.renderer.addRenderTarget(actor);
    });
    this.content.forEach((actor: TActor & TAPhysics) => {
      if (actor.onHitType !== undefined && actor.onHitType !== EOnHitResponseType.none) {
        this.collisions.insert(actor.body);
      }
    });
    this.content.forEach((actor: TActor) => actor.beginPlay && actor.beginPlay());

    if (this.options.hideSystemCursor) get('#canvas').className += ' hide-system-cursor';

    this.beginPlay();
  }

  forGrup(groupName: string, callback: (a: TActor, index: number) => void): void {
    const group = this.groups[groupName];
    if (!group) return;

    const { length } = group;

    for (let i = 0; i < length; i++) {
      callback(group[i], i);
    }
  }

  add<T extends TActor>(...options: TNewActorProps<T>): T {
    const actor = newActor(this, ...options);
    for (const propName in actor) {
      const value = actor[propName];
      if (value instanceof HTMLElement) {
        addToViewport(value);
      }
    }

    // options.groups?.forEach((groupName) => {
    //   if (!this.groups[groupName]) this.groups[groupName] = [];
    //   this.groups[groupName].push(actor);
    // });

    this.content.push(actor);

    return actor;
  }

  spawn<T extends TActor>(...options: TNewActorProps<T>): T {
    const actor = this.add(...options);
    if (actor.visible) this.renderer.addRenderTarget(actor);
    if (actor.body) {
      this.collisions.insert(actor.body);
    }
    if (actor.beginPlay) actor.beginPlay();

    return actor;
  }

  remove(actor: TActor): void {
    if (actor.body) this.collisions.remove(actor.body);
    this.renderer.removeRenderTarget(actor);
    array.removeBy(this.content, (e) => e.id == actor.id);
    delete actor.body;
  }

  removeAll(id: number): void {
    array.removeAllBy(this.content, (e) => e.id == id);
  }

  getById(id: number): TActor | undefined {
    return this.content.find((a) => a.id == id);
  }

  getByName(name: string): TActor | undefined {
    return this.content.find((a) => a.name == name);
  }

  getAllByName(name: string): TActor[] {
    return this.content.filter((a) => a.name == name);
  }

  fireInDirection(actor: TActor, unitVector: TVector): void {
    if (actor.direction) {
      Vector.set(actor.direction, unitVector);
      actor.speed = actor.speedMax;
    }
  }
}
