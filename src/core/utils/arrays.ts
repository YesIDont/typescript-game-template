export const array = {
  remove<T = number>(a: Array<T>, item: T): void {
    const index = a.indexOf(item);
    if (index != -1) a.splice(index, 1);
  },

  removeAll<T = number>(a: Array<T>, item: T): void {
    const { length } = a;
    if (length === 0) return;

    for (let i = length - 1; i > -1; i--) {
      if (a[i] == item) a.splice(i, 1);
    }
  },

  removeBy<T = number>(a: Array<T>, predicate: (i: T) => boolean): void {
    const index = a.findIndex(predicate);
    if (index != -1) {
      delete a[index];
      a.splice(index, 1);
    }
  },

  removeAllBy<T = number>(a: Array<T>, predicate: (i: T) => boolean): void {
    const { length } = a;
    if (length === 0) return;

    for (let i = length - 1; i > -1; i--) {
      if (predicate(a[i])) a.splice(i, 1);
    }
  },
};
