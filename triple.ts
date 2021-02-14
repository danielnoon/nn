import { sigmoid } from "./activation.ts";
import { load_csv, StringStrategy } from "./load_csv.ts";
import { layer, network } from "./network.ts";
import { perceptron } from "./perceptron.ts";
import { slice } from "./slice.ts";

const data = load_csv("iris.data", {
  y: 4,
  str: StringStrategy.CLASS,
  labels: ["Sepal Length", "Sepal Width", "Petal Length", "Petal Width"],
});

const [c, t] = slice(data, 0.3);

const n = network(4, layer(4, sigmoid), layer(4, sigmoid), layer(3, sigmoid));

console.log(n.train(c.entries[0], 0.2));
