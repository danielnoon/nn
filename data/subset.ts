import { range } from "../tools/range.ts";
import { Collection } from "./collection.ts";
import { Entry } from "./entry.ts";

export interface SubsetOptions {
  x_columns?: Iterable<number> | string[];
  y_columns?: Iterable<number> | string[];
  rows?: Iterable<number> | ((entry: Entry, idx: number) => boolean);
}

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
