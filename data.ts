import { shuffle } from "./shuffle.ts";

export class Collection {
  constructor(public entries: Entry[], public labels: string[]) {}

  shuffle() {
    return new Collection(shuffle(this.entries.slice()), this.labels);
  }
}

export class Entry {
  constructor(public x: number[], public y: number[]) {}
}

export function collection(
  entries: number[][],
  labels: string[],
  y_values: number = 1
) {
  return new Collection(
    entries.map(
      (entry) => new Entry(entry.slice(y_values), entry.slice(0, y_values))
    ),
    labels
  );
}
