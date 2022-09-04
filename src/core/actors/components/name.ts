export type TAName = {
  name: string;
};

export function name(nameIn: string): TAName {
  return {
    name: nameIn,
  };
}
