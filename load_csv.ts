import { collection } from "./data.ts";
import { zip } from "./zip.ts";

export function load_csv(
  path: string,
  kwarg: {
    y: number | "last";
    str: "class" | "embed";
    labels: string[] | "infer";
    type: "classification" | "regression";
  }
) {
  const text = Deno.readTextFileSync(path).trim();
  const observations = text
    .trim()
    .split(/[\n\r]+/g)
    .map((line) => line.trim().split(","));

  let labels: string[] = [];
  if (kwarg.labels === "infer") {
    labels = observations.shift() as string[];
  } else {
    labels = kwarg.labels;
  }

  const dtypes = observations[0].map((obs) => {
    const t = getTypeOf(obs);
    switch (t) {
      case "string":
        return kwarg.str === "class"
          ? strClassificationGenerator()
          : (x: string) => 1;
      case "number":
        return (x: string) => Number(x);
      case "boolean":
        return (x: string) => (x === "true" ? 1 : 0);
      default:
        return (x: string) => 0;
    }
  });

  const processed = observations.map((o) =>
    zip(o, dtypes).map(([oo, d]) => d(oo))
  );

  const y_idx = kwarg.y === "last" ? processed[0].length - 1 : kwarg.y;

  let [y, lab] = moveY(processed, labels, y_idx);
  let num_y = 1;

  if (kwarg.type === "classification") {
    const max = y.reduce((prev, [curr]) => (curr > prev ? curr : prev), 0);

    y = y.map((ent) => {
      const y = new Array(max + 1)
        .fill(0)
        .map((_, i) => (i === ent[0] ? 1 : 0));
      return [...y, ...ent.slice(1)];
    });

    const lab_y = new Array(max + 1).fill(0).map((_, i) => `${lab[0]}_${i}`);
    lab = [...lab_y, ...lab.slice(1)];

    num_y = max + 1;
  }

  return collection(y, lab, num_y);
}

function getTypeOf(obs: string) {
  if (obs === "true" || obs === "false") {
    return "boolean";
  }

  if (Number.isFinite(Number(obs))) {
    return "number";
  }

  return "string";
}

function moveY(
  obs: number[][],
  labels: string[],
  y: number
): [number[][], string[]] {
  if (y === 0) {
    return [obs, labels];
  } else if (y === obs[0].length - 1) {
    const os = obs.map((o) => [o[y], ...o.slice(0, y)]);
    const ls = [labels[y], ...labels.slice(0, y)];
    return [os, ls];
  } else {
    const os = obs.map((o) => [o[y], ...o.slice(0, y), ...o.slice(y + 1)]);
    const ls = [labels[y], ...labels.slice(0, y), ...labels.slice(y + 1)];
    return [os, ls];
  }
}

function strClassificationGenerator() {
  const mapping = new Map<string, number>();
  let i = 0;

  return function classify(str: string) {
    if (mapping.has(str)) {
      return mapping.get(str) as number;
    } else {
      mapping.set(str, i);
      i++;
      return mapping.get(str) as number;
    }
  };
}
