import { range } from "../tools/range.ts";
import { Collection } from "./collection.ts";
import { subset } from "./subset.ts";

export function head(c: Collection, n = 5) {
  n = Math.min(n, c.length);
  return subset(c, { rows: range(n) });
}
