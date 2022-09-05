export type Name = {
  name: string;
};

export function name(nameIn: string): Name {
  return {
    name: nameIn,
  };
}
