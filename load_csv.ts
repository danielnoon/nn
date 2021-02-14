import { collection } from "./data.ts";
import { zip } from "./zip.ts";

export enum StringStrategy {
  CLASS,
  VECTOR,
}

export function load_csv(
  path: string,
  kwarg: { y: number; str: StringStrategy; labels: string[] }
) {
  const text = Deno.readTextFileSync(path).trim();
  const observations = text
    .trim()
    .split(/[\n\r]+/g)
    .map((line) => line.trim().split(","));

  const dtypes = observations[0].map((obs) => {
    const t = getTypeOf(obs);
    switch (t) {
      case "string":
        return kwarg.str === StringStrategy.CLASS
          ? strClassificationGenerator()
          : (x: string) => 1;
      case "number":
        return (x: string) => Number(x);
      default:
        return (x: string) => 0;
    }
  });

  const processed = observations.map((o) =>
    zip(o, dtypes).map(([oo, d]) => d(oo))
  );

  const yChanged = moveY(processed, kwarg.y);

  return collection(yChanged, kwarg.labels);
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

function moveY(obs: number[][], y: number) {
  if (y === 0) {
    return obs;
  } else if (y === obs[0].length - 1) {
    return obs.map((o) => [o[y], ...o.slice(0, y)]);
  } else {
    return obs.map((o) => [o[y], ...o.slice(0, y), ...o.slice(y + 1)]);
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
