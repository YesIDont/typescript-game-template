import { DebugDraw, debugDraw, Movement, physics, Physics } from './actors/components';
import { Attachment, updateActorAttachments } from './actors/components/attachments';
import { MovingActor } from './actors/components/movement';
import { AActor, AActorBase, Actor, TNewActorProps } from './actors/new-actor';
import { CBody, CCollisions, TCollisionResult } from './collisions';
import { CPolygon } from './collisions/polygon';
import { EOnHitResponseType } from './collisions/responses';
import { CGame } from './game';
import { addToViewport, TUiItem } from './user-interface';
import { array } from './utils/arrays';
import { get } from './utils/dom/dom';
import { TVector, Vector } from './vector';

export type TNewLevelOptions = {
  name?: string;
  size?: TVector;
  actors?: AActorBase[];
};

export class CLevel {
  game: CGame;
  content: AActorBase[] = [];
  groups: { [key: string]: AActorBase[] } = {};
  collisions: CCollisions = new CCollisions();
  size: TVector;
  /* Must be unique across the game. */
  name: string;
  onBeginPlay: (game: CGame) => void = () => {};

  constructor(props: TNewLevelOptions) {
    const { name, size } = props;
    this.name = name ?? 'Unnamed level';
    this.size = size ?? Vector.new();

    if (props.actors) {
      for (const actor of props.actors) {
        this.add(actor);
      }
    }
  }

  initialise(game: CGame): void {
    this.game = game;

    if (Vector.isZero(this.size)) {
      this.size = Vector.new(game.viewport.width, game.viewport.height);
    }

    this.collisions
      .createWorldBounds(this.size.x, this.size.y, 500, -700)
      .forEach((boundBody: CPolygon) => {
        this.add<AActor<Physics<CPolygon> & DebugDraw>>(
          { name: 'world bound' },
          physics<CPolygon>(
            boundBody,
            EOnHitResponseType.slideOff,
            function onHit(
              _now: number,
              _deltaSeconds: number,
              _body: CBody,
              _otherBody: CBody,
              otherActor: AActorBase,
              _result: TCollisionResult,
              level: CLevel,
            ): void {
              level.remove(otherActor);
            },
          ),
          debugDraw({ alpha: 0.1, color: '#ff0000' }),
        );
      });

    this.content.forEach((actor) => {
      if (actor.visible) game.renderer.addRenderTarget(actor);
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
    this.content.forEach((actor: AActorBase) => actor.beginPlay && actor.beginPlay(0, 0, game));

    if (game.options.hideSystemCursor) get('#canvas').className += ' hide-system-cursor';
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
    const actor = Actor.new<T>(...options);
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
    if (actor.visible) this.game.renderer.addRenderTarget(actor);
    if (actor.body) this.collisions.insert(actor.body);
    if (actor.beginPlay) actor.beginPlay(0, 0, this.game);

    return actor;
  }

  remove(actor: AActorBase): void {
    if (actor.body) this.collisions.remove(actor.body);
    this.game.renderer.removeRenderTarget(actor);
    array.removeBy(this.content, (e) => e.id == actor.id);
    delete actor.body;
  }

  removeAll(id: number): void {
    array.removeAllBy(this.content, (e) => e.id == id);
  }

  getById(id: number): AActorBase | undefined {
    return this.content.find((a) => a.id == id);
  }

  getByName<T>(name: string): T | undefined {
    return this.content.find((a) => a.name == name) as unknown as T;
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

  addUi(...elements: TUiItem[]): void {
    elements.forEach((element) => {
      element.level = this;
      addToViewport(element);
    });
  }
}
