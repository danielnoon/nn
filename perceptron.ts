import { ActivationFunction } from "./activation.ts";
import { Collection, Entry } from "./data.ts";
import { sum } from "./sum.ts";
import { zip } from "./zip.ts";

export class Perceptron {
  public weights: number[];

  constructor(features: number, private activation: ActivationFunction) {
    this.weights = new Array(features + 1)
      .fill(1)
      .map((_) => Math.floor(Math.random() * features * 10) / 10);
  }

  predict(observation: number[]) {
    const m = zip([1, ...observation], this.weights);
    const dp = sum(m.map((d) => d[0] * d[1]));
    return this.activation(dp);
  }

  train(entry: Entry, alpha: number) {
    const { x, y } = entry;

    const yhat = this.predict(x);

    const correction = alpha * (y - yhat);
    const xhat = [1, ...x].map((xx) => xx * correction);

    this.weights = zip(this.weights, xhat).map(([w, xh]) => w + xh);
  }
}

export function perceptron(args: {
  features: number;
  activation: ActivationFunction;
}) {
  const { features, activation } = args;

  return new Perceptron(features, activation);
}

export function epoch(
  perceptron: Perceptron,
  collection: Collection,
  alpha: number
) {
  for (const entry of collection.entries) {
    perceptron.train(entry, alpha);
  }
}

export function train(
  perceptron: Perceptron,
  data: Collection,
  alpha: number,
  epochs: number
) {
  let i = epochs;
  while (i > 0 && loss(perceptron, data) > 0) {
    i--;
    epoch(perceptron, data, alpha);
  }
}

export function loss(perceptron: Perceptron, collection: Collection) {
  const l = collection.entries.map((entry) => {
    const p = perceptron.predict(entry.x);
    return (entry.y - p) ** 2;
  });

  return sum(l);
}
