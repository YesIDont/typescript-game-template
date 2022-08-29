export class ObjectPool<TPool, TGetter> {
  pool: TPool[] = [];
  new: () => TPool;
  get: TGetter;

  constructor(newItem: () => TPool, get: TGetter) {
    this.new = newItem;
    this.get = get;
  }

  _get(): TPool {
    const item = this.pool.pop() ?? this.new();

    return item;
  }

  store(o: TPool): void {
    this.pool.push(o);
  }
}
