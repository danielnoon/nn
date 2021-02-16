import { sigmoid } from "./activation.ts";
import { layer, loss, network, train } from "./network.ts";
import { load_csv, StringStrategy } from "./load_csv.ts";
import { slice } from "./slice.ts";

const data = load_csv("iris.data", {
  y: 4,
  str: StringStrategy.CLASS,
  labels: ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"],
  type: "classification",
});

const [c, t] = slice(data, 0.2);

const n = network(4, layer(4, sigmoid), layer(4, sigmoid), layer(3, sigmoid));

const losses = train(n, c, 0.05, 0.01, 50);

Deno.writeTextFile("./loss.txt", losses.join("\n"));

function getFlowerType(c: number[]) {
  const max = c.indexOf(Math.max(...c));
  return ["setosa", "versicolor", "virginica"][max];
}

for (const entry of t.entries) {
  console.log("Expected: ", getFlowerType(entry.y));
  console.log("Actual:   ", getFlowerType(n.predict(entry.x)));
  console.log("");
}

console.log("Training loss: ", loss(n, c));
console.log("Test loss: ", loss(n, t));
