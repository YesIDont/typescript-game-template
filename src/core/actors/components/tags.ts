export type Tags = {
  tags: string[];
};

export function tags(...tagsIn: string[]): Tags {
  return {
    tags: tagsIn,
  };
}
