import { load_csv } from "./data/load_csv.ts";

const data = load_csv("./data/phone/train.csv", {
  y: "last",
  labels: "infer",
  str: "class",
  type: "classification",
});

data
  .subset({
    x_columns: ["blue", "int_memory"],
  })
  .shuffle()
  .head()
  .print();

// const sub = data.subset({
//   x_columns: ["blue", "sc_w", "touch_screen", "ram"],
// });

// const [c, t] = slice(sub, 0.2);

// const n = network(
//   sub.x,
//   sse,
//   layer(4, sigmoid),
//   layer(4, relu),
//   layer(3, sigmoid),
//   layer(3, relu)
// );

// const losses = train(n, c, 0.001, 0.01, 10000);
// Deno.writeTextFile("./loss.txt", losses.join("\n"));

// console.log("Training loss: ", loss(n, c));
// console.log("Test loss: ", loss(n, t));
