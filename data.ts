import { shuffle } from "./shuffle.ts";
import AsciiTable from "https://deno.land/x/ascii_table/mod.ts";
import { range } from "./range.ts";

interface SubsetOptions {
  x_columns?: Iterable<number> | string[];
  y_columns?: Iterable<number> | string[];
  rows?: Iterable<number> | ((entry: Entry, idx: number) => boolean);
}

export class Collection {
  constructor(
    public entries: Entry[],
    public xlab: string[],
    public ylab: string[],
    public classes: Map<string, Map<number, string>>
  ) {}

  shuffle() {
    return new Collection(
      shuffle(this.entries.slice()),
      this.xlab,
      this.ylab,
      this.classes
    );
  }

  subset(options: SubsetOptions) {
    return subset(this, options);
  }

  head(n = 5) {
    return head(this, n);
  }

  sort(by: string, dir: "asc" | "desc" = "desc") {
    return sort(this, by, dir);
  }

  // addColumn(label: string, values: number[], type: 'x' | 'y', opts: ) {
  //   let xlab = type === 'x' ? [...this.xlab, label]
  // }

  toString() {
    const table = AsciiTable.fromJSON({
      title: "",
      heading: [...this.ylab, ...this.xlab],
      rows: this.entries.map((entry) => [
        ...entry.y.map((z, i) => this.classes.get(`y_${i}`)?.get(z) ?? z),
        ...entry.x.map((z, i) => this.classes.get(`x_${i}`)?.get(z) ?? z),
      ]),
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
  entries: (number | boolean | string)[][],
  lab: string[],
  y_values: number = 1
) {
  const xlab = lab.slice(y_values);
  const ylab = lab.slice(0, y_values);

  const classes = new Map<
    string,
    [Map<number, string>, Map<string, number>, number]
  >();
  entries[0].forEach((v, i) => {
    const coord = i < y_values ? "y" : "x";

    if (typeof v === "string") {
      classes.set(`${coord}_${coord === "y" ? i : i - y_values}`, [
        new Map(),
        new Map(),
        0,
      ]);
    }

    if (typeof v === "boolean") {
      classes.set(`${coord}_${coord === "y" ? i : i - y_values}`, [
        new Map([
          [0, "no"],
          [1, "yes"],
        ]),
        new Map(),
        0,
      ]);
    }
  });

  const numbers = entries.map((entry) => {
    return entry.map((v, i) => {
      const coord = i < y_values ? "y" : "x";

      if (typeof v === "string") {
        const cls = classes.get(
          `${coord}_${coord === "y" ? i : i - y_values}`
        )!;
        if (cls[1].has(v)) {
          return cls[1].get(v)!;
        } else {
          cls[1].set(v, cls[2]);
          cls[0].set(cls[2], v);
          cls[2] += 1;
          return cls[2] - 1;
        }
      } else if (typeof v === "boolean") {
        return Number(v);
      } else {
        return v;
      }
    });
  });

  const c = new Map(
    Array.from(classes.entries()).map(([k, v]) => {
      return [k, v[0]];
    })
  );

  return new Collection(
    numbers.map((entry) => {
      return new Entry(
        entry.slice(y_values),
        entry.slice(0, y_values),
        xlab,
        ylab
      );
    }),
    xlab,
    ylab,
    c
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

  const classes = new Map<string, Map<number, string>>();

  xlabIdx
    .map((i) => collection.classes.get(`x_${i}`))
    .forEach((c, i) => (c ? classes.set(`x_${i}`, c) : void 0));

  ylabIdx
    .map((i) => collection.classes.get(`y_${i}`))
    .forEach((c, i) => (c ? classes.set(`y_${i}`, c) : void 0));

  let entries: Entry[] = [];
  for (let row of rows) {
    const e = collection.entries[row];
    const xval = xlabIdx.map((x) => e.x[x]);
    const yval = ylabIdx.map((x) => e.y[x]);
    entries.push(new Entry(xval, yval, xlab, ylab));
  }

  return new Collection(entries, xlab, ylab, classes);
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

export function onehot(c: Collection, xy: "x" | "y", i: number) {
  const classes = new Map([...c.classes]);
  if (classes.has(`${xy}_${i}`)) {
    classes.delete(`${xy}_${i}`);
  }

  const max = Math.max(...c.entries.map((e) => (xy === "x" ? e.x : e.y)[i]));
  const r = range(max + 1);

  let xlab = c.xlab;
  let ylab = c.ylab;

  if (xy === "x") {
    xlab = [
      ...xlab.slice(0, i),
      ...r.arr.map((x) => `${xlab[i]}_${x}`),
      ...xlab.slice(i + 1),
    ];
  } else {
    ylab = [
      ...ylab.slice(0, i),
      ...r.arr.map((x) => `${ylab[i]}_${x}`),
      ...ylab.slice(i + 1),
    ];
  }

  const entries = c.entries.map((e) => {
    if (xy === "x") {
      return new Entry(
        [
          ...e.x.slice(0, i),
          ...r.arr.map((x) => (x === e.x[i] ? 1 : 0)),
          ...e.x.slice(i + 1),
        ],
        e.y,
        xlab,
        ylab
      );
    } else {
      return new Entry(
        e.x,
        [
          ...e.y.slice(0, i),
          ...r.arr.map((x) => (x === e.y[i] ? 1 : 0)),
          ...e.y.slice(i + 1),
        ],
        xlab,
        ylab
      );
    }
  });

  return new Collection(entries, xlab, ylab, classes);
}

export function sort(
  collection: Collection,
  by: string,
  dir: "asc" | "desc" = "desc"
) {
  const xy = collection.xlab.includes(by) ? "x" : "y";
  const idx = (xy === "x" ? collection.xlab : collection.ylab).indexOf(by);

  const sortedEntries = collection.entries.slice().sort((a, b) => {
    if (xy === "x") {
      return dir === "asc" ? a.x[idx] - b.x[idx] : b.x[idx] - a.x[idx];
    } else {
      return dir === "asc" ? a.y[idx] - b.y[idx] : b.y[idx] - a.y[idx];
    }
  });

  return new Collection(
    sortedEntries,
    collection.xlab,
    collection.ylab,
    collection.classes
  );
}
