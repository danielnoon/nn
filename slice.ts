import { Collection } from "./data.ts";
import { shuffle } from "./shuffle.ts";

export function slice(
  data: Collection,
  test: number
): [train: Collection, test: Collection] {
  const n = Math.floor(data.entries.length * test);
  const r = shuffle(shuffle(data.entries.slice()));
  return [
    new Collection(r.slice(0, data.entries.length - n), data.labels),
    new Collection(r.slice(n), data.labels),
  ];
}
