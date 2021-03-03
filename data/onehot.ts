import { range } from "../tools/range.ts";
import { Collection } from "./collection.ts";
import { Entry } from "./entry.ts";

export function onehot(c: Collection, col: string): Collection {
  const xy = c.xlab.includes(col) ? "x" : "y";
  const i = (xy === "x" ? c.xlab : c.ylab).indexOf(col);

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
