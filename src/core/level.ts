import { DebugDraw, debugDraw, Movement, physics, Physics } from './actors/components';
import { Attachment, updateActorAttachments } from './actors/components/attachments';
import { MovingActor } from './actors/components/movement';
import { AActor, AActorBase, Actor, TNewActorProps } from './actors/new-actor';
import { CCollisions } from './collisions';
import { CPolygon } from './collisions/polygon';
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
  content: AActorBase[] = [];
  groups: { [key: string]: AActorBase[] } = {};
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
      .forEach((boundBody: CPolygon) => {
        this.add<AActor<Physics<CPolygon> & DebugDraw>>(
          { name: 'world bound' },
          physics<CPolygon>(
            boundBody,
            EOnHitResponseType.slideOff,
            function onHit(now, deltaSeconds, body, otherBody, otherActor, result): void {
              this.level.remove(otherActor);
            },
          ),
          debugDraw({ alpha: 0.1, color: '#ff0000' }),
        );
      });

    this.content.forEach((actor) => {
      if (actor.visible) this.renderer.addRenderTarget(actor);
    });
    this.content.forEach((actor: AActorBase & Physics) => {
      if (actor.onHitType !== undefined && actor.onHitType !== EOnHitResponseType.none) {
        this.collisions.insert(actor.body);
      }
    });
    this.content.forEach((actor: AActorBase) => {
      actor.attachments?.forEach((item: Attachment) => {
        if (item instanceof HTMLElement) {
          addToViewport(item);
        }
      });
      setTimeout(() => {
        if (actor.hasAttachments) updateActorAttachments(actor as unknown as MovingActor);
      }, 100);
    });
    this.content.forEach((actor: AActorBase) => actor.beginPlay && actor.beginPlay());

    if (this.options.hideSystemCursor) get('#canvas').className += ' hide-system-cursor';

    this.beginPlay();
  }

  forGrup(groupName: string, callback: (a: AActorBase, index: number) => void): void {
    const group = this.groups[groupName];
    if (!group) return;

    const { length } = group;

    for (let i = 0; i < length; i++) {
      callback(group[i], i);
    }
  }

  add<T>(...options: TNewActorProps<T>): T {
    const actor = Actor.new<T>(this, ...options);
    for (const propName in actor) {
      const value = actor[propName];
      if (value instanceof HTMLElement) {
        addToViewport(value);
      }
    }

    this.content.push(actor);

    return actor;
  }

  spawn<T extends AActorBase>(...options: TNewActorProps<T>): T {
    const actor = this.add(...options);
    if (actor.visible) this.renderer.addRenderTarget(actor);
    if (actor.body) this.collisions.insert(actor.body);
    if (actor.beginPlay) actor.beginPlay();

    return actor;
  }

  remove(actor: AActorBase): void {
    if (actor.body) this.collisions.remove(actor.body);
    this.renderer.removeRenderTarget(actor);
    array.removeBy(this.content, (e) => e.id == actor.id);
    delete actor.body;
  }

  removeAll(id: number): void {
    array.removeAllBy(this.content, (e) => e.id == id);
  }

  getById(id: number): AActorBase | undefined {
    return this.content.find((a) => a.id == id);
  }

  getByName(name: string): AActorBase | undefined {
    return this.content.find((a) => a.name == name);
  }

  getAllByName(name: string): AActorBase[] {
    return this.content.filter((a) => a.name == name);
  }

  getAllByTags(...tags: string[]): AActorBase[] {
    return this.content.filter((a) => a.tags.some((t) => tags.includes(t)));
  }

  fireInDirection(actor: AActorBase & Movement, unitVector: TVector): void {
    if (actor.direction) {
      Vector.set(actor.direction, unitVector);
      actor.speed = actor.speedMax;
    }
  }
}
