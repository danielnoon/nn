import { sigmoid } from "./activation.ts";
import { layer, loss, network, train } from "./network.ts";
import { range } from "./range.ts";
import { load_csv, StringStrategy } from "./load_csv.ts";
import { slice } from "./slice.ts";
import { collection } from "./data.ts";
import { plot } from "https://deno.land/x/chart/mod.ts";

const data = load_csv("iris.data", {
  y: 4,
  str: StringStrategy.CLASS,
  labels: ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"],
  type: "classification",
});

const [c, t] = slice(data, 0.3);

// const c = collection([[0.1, 0.05, 1, 4, 5]], ["X1", "X2", "X3"], 2);

const n = network(
  4,
  layer(4, sigmoid),
  layer(6, sigmoid),
  layer(6, sigmoid),
  layer(3, sigmoid)
);

// const n = network(3, layer(2, sigmoid), layer(2, sigmoid));

// console.log(loss(n, c));

// train(n, c, 0.2, 0.00001, 100000);

const losses = train(n, c, 0.2, 0.01, 10000);
// console.log(plot(losses, { min: 0, max: 15 }));

losses.forEach((loss) => console.log(loss.toString()));

// console.log(n.predict(c.entries[0].x));
// console.log(n.layers[0].perceptrons[0].weights);
// n.train(c.entries[0], 0.2);
// console.log(n.layers[0].perceptrons[0].weights);
// n.train(c.entries[1], 0.2);
// console.log(n.layers[0].perceptrons[0].weights);
// console.log(n.predict(c.entries[0].x));

console.log("Training loss: ", loss(n, c));
console.log("Test loss: ", loss(n, t));

// console.log("\nTest case: ", n.predict(c.entries[0].x));
// console.log("Expected output: ", c.entries[0].y);
// console.log(n.error(c.entries[0]));

// console.log("Training loss: ", loss(n, c));
// console.log("Test loss: ", loss(n, t));
