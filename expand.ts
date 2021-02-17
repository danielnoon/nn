import { range } from "./range.ts";

export function expand(x: number, c: number) {
  return range(c).arr.map((_, i) => (i === x ? 1 : 0));
}
