import { step } from "./activation.ts";
import { collection, Entry } from "./data.ts";
import { load_csv, StringStrategy } from "./load_csv.ts";
import { epoch, loss, perceptron, train } from "./perceptron.ts";
import { subset } from "./subset.ts";

const p = perceptron({
  features: 4,
  activation: step,
});

const data = load_csv("iris.data", {
  y: 4,
  str: StringStrategy.CLASS,
  labels: ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"],
});

data.entries = data.entries
  .filter((l) => l.y !== 1)
  .map((l) => {
    const x = l.x.slice(0, 4);
    const y = l.y === 0 ? 0 : 1;
    return new Entry(x, y);
  });

const [c, t] = subset(data, 0.3);

train(p, c, 0.2, 10);

console.log(p.weights);

console.log("Training Loss: ", loss(p, c));
console.log("Test Loss: ", loss(p, t));
