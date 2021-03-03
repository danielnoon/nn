import { Collection } from "./collection.ts";
import { shuffle as s } from "../tools/shuffle.ts";

export function slice(
  data: Collection,
  test: number,
  shuffle = true
): [train: Collection, test: Collection] {
  const n = Math.floor(data.entries.length * test);
  const r = shuffle ? s(s(data.entries.slice())) : data.entries.slice();
  return [
    new Collection(
      r.slice(0, data.entries.length - n),
      data.xlab,
      data.ylab,
      data.classes
    ),
    new Collection(r.slice(n), data.xlab, data.ylab, data.classes),
  ];
}
