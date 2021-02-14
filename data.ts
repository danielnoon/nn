export class Collection {
  constructor(public entries: Entry[], public labels: string[]) {}
}

export class Entry {
  constructor(public x: number[], public y: number) {}
}

export function collection(entries: number[][], labels: string[]) {
  return new Collection(
    entries.map((entry) => new Entry(entry.slice(1), entry[0])),
    labels
  );
}
