import lossMap, { LossFunction } from "./loss.ts";
import { range } from "../tools/range.ts";
import { sum } from "../tools/sum.ts";
import { zip } from "../tools/zip.ts";
import { Entry } from "../data/entry.ts";
import { Collection } from "../data/collection.ts";
import { Layer, LayerGenerator } from "./layer.ts";

export class Network {
  public loss: LossFunction;

  constructor(public layers: Layer[], loss: string | LossFunction) {
    if (typeof loss === "string") {
      const l = lossMap.get(loss);
      if (l) {
        this.loss = l;
      } else {
        throw new Error(`Loss function ${loss} does not exist`);
      }
    } else {
      this.loss = loss;
    }
  }

  static fromWeights(weights: number[][]) {
    const shape = weights.map((w) => w.length);
    console.log(weights, shape);
  }

  loadWeights(weights: number[][][]) {
    for (let i of range(weights.length)) {
      for (let j of range(weights[i].length)) {
        this.layers[i].perceptrons[j].weights = weights[i][j];
      }
    }
  }

  predict(observations: number[]) {
    return this.layers.reduce((prev, curr) => curr.ff(prev), observations);
  }

  private ff(observations: number[]) {
    const outputs: number[][] = [];

    let prev: number[] = observations;
    for (const layer of this.layers) {
      prev = layer.ff(prev);
      outputs.push(prev);
    }

    return outputs;
  }

  train(entry: Entry, alpha: number) {
    const ideal = entry.y;

    const outputs = this.ff(entry.x);

    return backpropagate(
      this.layers,
      outputs,
      entry.x,
      ideal,
      alpha,
      this.loss
    );
  }

  public error(entry: Entry) {
    const ideal = entry.y;
    const output = this.predict(entry.x);

    return (
      sum(zip(ideal, output).map(([i, o]) => this.loss(o, i) ** 2)) /
      ideal.length
    );
  }

  public exportWeights() {
    return this.layers.map((l) => l.perceptrons.map((p) => p.weights));
  }
}

function backpropagate(
  layers: Layer[],
  outputs: number[][],
  prev: number[],
  y: number[],
  alpha: number,
  loss: LossFunction
): number[] {
  const l = layers[0];
  const o = outputs[0];
  const h = [1, ...prev];

  const deltas: number[] = [];

  if (layers.length === 1) {
    for (const i of range(l.perceptrons.length)) {
      const p = l.perceptrons[i];

      const a = loss(o[i], y[i]);
      const b = p.activation[1](o[i], o, i);

      p.weights = p.weights.map((w, j) => {
        const c = h[j];
        deltas[j] = a * b * w;

        return w - alpha * (a * b * c);
      });
    }

    return deltas.slice(1);
  }

  const d1 = backpropagate(
    layers.slice(1),
    outputs.slice(1),
    outputs[0],
    y,
    alpha,
    loss
  );

  for (const i of range(l.perceptrons.length)) {
    const p = l.perceptrons[i];

    const a = d1[i];
    const b = p.activation[1](o[i], o, i);

    p.weights = p.weights.map((w, j) => {
      const c = h[j];
      deltas[j] = a * b * w;

      return w - alpha * (a * b * c);
    });
  }

  return deltas.slice(1);
}

export function network(
  inputs: number,
  loss: LossFunction | string,
  ...layers: LayerGenerator[]
) {
  const inputLayer = layers[0](inputs);
  const l: Layer[] = [inputLayer];
  let prev = inputLayer.perceptrons.length;

  for (const layerFunction of layers.slice(1)) {
    const n = layerFunction(prev);
    prev = n.perceptrons.length;
    l.push(n);
  }
  return new Network(l, loss);
}

export function epoch(network: Network, collection: Collection, alpha: number) {
  for (const entry of collection.shuffle().entries) {
    network.train(entry, alpha);
  }
}

export function train(
  network: Network,
  data: Collection,
  options: {
    alpha: number;
    max_epochs?: number;
    target_loss?: number;
    print_epochs?: number;
  }
) {
  const {
    alpha,
    max_epochs = Infinity,
    target_loss = 0,
    print_epochs = 0,
  } = options;

  if (max_epochs === Infinity && target_loss === 0) {
    throw new Error("Either max_epochs or target_loss must be specified!");
  }

  let i = 0;
  const losses: number[] = [];
  let l = loss(network, data);
  while (i < max_epochs && l > target_loss) {
    if (print_epochs > 0 && i % print_epochs === 0) {
      console.log(`Epoch: ${i}\nLoss: ${l}`);
    }

    epoch(network, data, alpha);
    losses.push(l);
    l = loss(network, data);
    i++;
  }
  return losses;
}

export function loss(network: Network, collection: Collection) {
  const l = collection.entries.map((entry) => Math.abs(network.error(entry)));

  return sum(l) / l.length;
}
