import { Entry } from "./entry.ts";
import AsciiTable from "https://deno.land/x/ascii_table/mod.ts";
import { subset, SubsetOptions } from "./subset.ts";
import { head } from "./head.ts";
import { sort } from "./sort.ts";
import { onehot } from "./onehot.ts";
import { slice } from "./slice.ts";
import { shuffle } from "../tools/shuffle.ts";

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

  onehot(col: string) {
    return onehot(this, col);
  }

  slice(test_percentage: number) {
    return slice(this, test_percentage);
  }

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
