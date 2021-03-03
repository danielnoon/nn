import { load_csv } from "./data/load_csv.ts";
import { range } from "./tools/range.ts";

const data = load_csv("./datasets/phone/train.csv", {
  y: "last",
});

data
  .subset({ x_columns: range(5, 10) })
  .head()
  .print();

console.log("\nthis model is left as an exercise for the reader ;)");
