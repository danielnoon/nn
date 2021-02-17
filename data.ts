import { shuffle } from "./shuffle.ts";
import AsciiTable from "https://deno.land/x/ascii_table/mod.ts";
import { range } from "./range.ts";

interface SubsetOptions {
  x_columns?: Iterable<number> | string[];
  y_columns?: Iterable<number> | string[];
  rows?: Iterable<number> | ((entry: Entry, idx: number) => boolean);
}

export class Collection {
  // private classes = new Map<
  constructor(
    public entries: Entry[],
    public xlab: string[],
    public ylab: string[]
  ) {}

  shuffle() {
    return new Collection(shuffle(this.entries.slice()), this.xlab, this.ylab);
  }

  subset(options: SubsetOptions) {
    return subset(this, options);
  }

  head(n = 5) {
    return head(this, n);
  }

  // addColumn(label: string, values: number[], type: 'x' | 'y', opts: ) {
  //   let xlab = type === 'x' ? [...this.xlab, label]
  // }

  toString() {
    const table = AsciiTable.fromJSON({
      title: "",
      heading: [...this.ylab, ...this.xlab],
      rows: this.entries.map((entry) => [...entry.y, ...entry.x]),
    });

    return table.toString();
  }

  print() {
    console.log(this.toString());
    return this;
  }

  [Symbol.iterator]() {
    return this.entries[Symbol.iterator]();
  }

  map<T>(predicate: (el: Entry, i: number, arr: Entry[]) => T[]) {
    return this.entries.map(predicate);
  }

  get x() {
    return this.xlab.length;
  }

  get y() {
    return this.ylab.length;
  }

  get length() {
    return this.entries.length;
  }
}

export class Entry {
  constructor(
    public x: number[],
    public y: number[],
    public xlab: string[],
    public ylab: string[]
  ) {}

  getX(label: string) {
    return this.x[this.xlab.indexOf(label)];
  }

  getY(label: string) {
    return this.y[this.ylab.indexOf(label)];
  }
}

export function collection(
  entries: number[][],
  lab: string[],
  y_values: number = 1
) {
  const xlab = lab.slice(y_values);
  const ylab = lab.slice(0, y_values);

  // const classes = new Map<string, Map<number, string>>();
  // entries[0]

  // const numbers = entries.map((entry) => {
  //   return entry.map((v, i) => {
  //     const t = typeof v;
  //     if (!)
  //   })
  // })

  return new Collection(
    entries.map((entry) => {
      return new Entry(
        entry.slice(y_values),
        entry.slice(0, y_values),
        xlab,
        ylab
      );
    }),
    xlab,
    ylab
  );
}

// let a: Iterable<number> = [];

export function subset(collection: Collection, options: SubsetOptions) {
  let xc: Iterable<number> = range(collection.xlab.length);
  if (options.x_columns) {
    const x = options.x_columns;
    if (x instanceof Array && typeof x[0] === "string") {
      xc = x.map((el) => collection.xlab.indexOf(el));
    } else {
      xc = x as Iterable<number>;
    }
  }

  let yc: Iterable<number> = range(collection.ylab.length);
  if (options.y_columns) {
    const x = options.y_columns;
    if (x instanceof Array && typeof x[0] === "string") {
      yc = x.map((el) => collection.ylab.indexOf(el));
    } else {
      yc = x as Iterable<number>;
    }
  }

  let rows: Iterable<number> = range(collection.length);
  if (options.rows) {
    if (options.rows instanceof Function) {
      let r: number[] = [];
      for (const i of range(collection.entries.length)) {
        if (options.rows(collection.entries[i], i)) {
          r.push(i);
        }
      }
      rows = r;
    } else {
      rows = options.rows;
    }
  }

  let xlabIdx = Array.from(xc);
  let xlab = xlabIdx.map((x) => collection.xlab[x]);
  let ylabIdx = Array.from(yc);
  let ylab = ylabIdx.map((x) => collection.ylab[x]);

  let entries: Entry[] = [];
  for (let row of rows) {
    const e = collection.entries[row];
    const xval = xlabIdx.map((x) => e.x[x]);
    const yval = ylabIdx.map((x) => e.y[x]);
    entries.push(new Entry(xval, yval, xlab, ylab));
  }

  return new Collection(entries, xlab, ylab);
}

export function head(c: Collection, n = 5) {
  n = Math.min(n, c.length);
  return subset(c, { rows: range(n) });
}

export function addColumn(
  c: Collection,
  label: string,
  data: number[],
  options: {}
) {}
