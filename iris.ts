import { relu, sigmoid, softmax } from "./activation.ts";
import { layer, loss, network, train } from "./network.ts";
import { load_csv } from "./load_csv.ts";
import { slice } from "./slice.ts";
import { crossentropy, sse } from "./loss.ts";
import { collection, onehot } from "./data.ts";
import { collapse } from "./collapse.ts";

const data = load_csv("iris.data", {
  y: 4,
  str: "class",
  labels: [
    "Sepal Length",
    "Sepal Width",
    "Petal Length",
    "Petal Width",
    "Flower",
  ],
  type: "classification",
});

const [c, t] = slice(onehot(data, "Flower"), 0.2);

const n = network(4, sse, layer(3, sigmoid), layer(3, softmax));

const weights = await Deno.readTextFile("./weights.json");
n.loadWeights(JSON.parse(weights));

// const losses = train(n, c, 0.001, 0.01, 100000);
// Deno.writeTextFile("./loss.txt", losses.join("\n"));

function getFlowerType(c: number[]) {
  const max = c.indexOf(Math.max(...c));
  return ["setosa", "versicolor", "virginica"][max];
}

console.log("Training loss: ", loss(n, c));
console.log("Test loss: ", loss(n, t));

const outputs = collection(
  t.map((entry) => {
    const out = n.predict(entry.x);
    const predicted = getFlowerType(out);
    const expected = getFlowerType(entry.y);
    const error = n.error(entry);
    return [expected === predicted, expected, predicted, error, ...out];
  }),
  [
    "Correct",
    "Expected",
    "Predicted",
    "Error",
    "Setosa",
    "Versicolor",
    "Virginica",
  ],
  1
);

outputs
  .subset({ rows: (row) => row.getY("Correct") === 0 })
  .sort("Error", "desc")
  .print();

// Deno.writeTextFile(
//   "./weights.json",
//   JSON.stringify(n.exportWeights(), null, 0)
// );
