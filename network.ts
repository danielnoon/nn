import { ActivationFunction } from "./activation.ts";
import { Entry } from "./data.ts";
import { Perceptron } from "./perceptron.ts";
import { sum } from "./sum.ts";
import { zip } from "./zip.ts";

export class Network {
  constructor(public layers: Layer[]) {}

  predict(observations: number[]) {
    return this.layers.reduce((prev, curr) => curr.ff(prev), observations);
  }

  train(entry: Entry, alpha: number) {
    const ideal = new Array(
      this.layers[this.layers.length - 1].perceptrons.length
    )
      .fill(0)
      .map((_, i) => (i === entry.y ? 1 : 0));

    const actual = this.predict(entry.x);

    const total_error =
      sum(zip(ideal, actual).map(([i, a]) => (i - a) ** 2)) / 2;

    console.log(total_error);
  }
}

export class Layer {
  constructor(public perceptrons: Perceptron[]) {}

  ff(input: number[]) {
    return this.perceptrons.map((p) => p.predict(input));
  }
}

export function layer(
  inputs: number,
  nodes: number,
  activation: ActivationFunction
): Layer {
  const arr = new Array(nodes).fill(0);
  return new Layer(arr.map((_) => new Perceptron(inputs, activation)));
}

export function network(...layers: Layer[]) {
  return new Network(layers);
}
