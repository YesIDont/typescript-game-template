import { newActor } from './actors/actor';
import { TActor, TNewActorProps } from './actors/actor-types';
import { CCollisions } from './collisions';
import { TShape } from './collisions/proxyTypes';
import { TOptions } from './options';
import { TRenderer } from './renderer';
import { array } from './utils/arrays';
import { TVector, Vector } from './vector';

export class CLevel {
  content: TActor[] = [];
  groups: { [key: string]: TActor[] } = {};
  collisions: CCollisions = new CCollisions();
  renderer: TRenderer;
  size: TVector;
  options: TOptions;

  constructor(renderer: TRenderer, options: TOptions, size: TVector = Vector.new(600, 400)) {
    this.renderer = renderer;
    this.options = options;
    this.size = size;
    renderer.clearRenderTargets();
  }

  run(): void {
    this.collisions
      .createWorldBounds(this.size.x, this.size.y, 1000, -2000)
      .forEach((boundBody: TShape) => {
        this.add({
          name: 'world bound',
          body: boundBody,
          alpha: 0.1,
          color: '#ff0000',
          // visible: false,

          onHit(now, deltaSeconds, body, otherBody, otherActor, result): void {
            this.level.remove(otherActor);
          },
        });
      });

    this.content.forEach((actor) => {
      if (actor.visible) this.renderer.addRenderTarget(actor);
    });
    this.content.forEach((actor: TActor) => {
      if (actor.collides && actor.body) this.collisions.insert(actor.body);
    });
    this.content.forEach((actor: TActor) => actor.beginPlay());

    if (this.options.hideSystemCursor) document.body.className += ' hide-system-cursor';
  }

  forGrup(groupName: string, callback: (a: TActor, index: number) => void): void {
    const group = this.groups[groupName];
    if (!group) return;

    const { length } = group;

    for (let i = 0; i < length; i++) {
      callback(group[i], i);
    }
  }

  add<TCustomProps>(
    options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
  ): TActor & TCustomProps {
    options.level = this;
    const actor = newActor(options);

    options.groups?.forEach((groupName) => {
      if (!this.groups[groupName]) this.groups[groupName] = [];
      this.groups[groupName].push(actor);
    });

    this.content.push(actor);

    return actor;
  }

  spawn<TCustomProps>(
    options: TCustomProps & TNewActorProps = {} as TCustomProps & TNewActorProps,
  ): TActor & TCustomProps {
    const actor = this.add(options);
    if (actor.visible) this.renderer.addRenderTarget(actor);
    if (actor.collides && actor.body) {
      this.collisions.insert(actor.body);
    }
    actor.beginPlay();

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
    Vector.set(actor.velocity, unitVector);
  }
}
