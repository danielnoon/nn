import { sum } from "./sum.ts";
import { zip } from "./zip.ts";

export function dot(a: number[], b: number[]) {
  return sum(zip(a, b).map(([A, B]) => A * B));
}
