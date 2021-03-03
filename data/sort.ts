import { Collection } from "./collection.ts";

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
