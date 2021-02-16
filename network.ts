import { ActivationFunction } from "./activation.ts";
import { Collection, Entry } from "./data.ts";
import { dot } from "./dot.ts";
import { last } from "./last.ts";
import { perceptron, Perceptron } from "./perceptron.ts";
import { range } from "./range.ts";
import { reverse } from "./reverse.ts";
import { sum } from "./sum.ts";
import { zip } from "./zip.ts";

export class Network {
  constructor(public layers: Layer[]) {}

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

    return backpropagate(this.layers, outputs, entry.x, ideal, alpha);
  }

  public error(entry: Entry) {
    const ideal = entry.y;
    const outputs = this.ff(entry.x);

    return sum(zip(ideal, last(outputs)).map(([i, a]) => (i - a) ** 2)) / 2;
  }
}

function backpropagate(
  layers: Layer[],
  outputs: number[][],
  prev: number[],
  y: number[],
  alpha: number
): number[] {
  const l = layers[0];
  const o = outputs[0];
  const h = [1, ...prev];

  const deltas: number[] = [];

  if (layers.length === 1) {
    for (const i of range(l.perceptrons.length)) {
      const p = l.perceptrons[i];

      const a = o[i] - y[i];
      const b = p.activation[1](o[i], o);

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
    alpha
  );

  for (const i of range(l.perceptrons.length)) {
    const p = l.perceptrons[i];

    const a = d1[i];
    const b = p.activation[1](o[i], o);

    p.weights = p.weights.map((w, j) => {
      const c = h[j];
      deltas[j] = a * b * w;

      return w - alpha * (a * b * c);
    });
  }

  return deltas.slice(1);
}

export class Layer {
  constructor(public perceptrons: Perceptron[]) {}

  ff(input: number[]) {
    return this.perceptrons
      .map((p) => ({ d: dot(p.weights, [1, ...input]), a: p.activation }))
      .map((v, _, a) =>
        v.a[0](
          v.d,
          a.map((b) => b.d)
        )
      );
  }
}

type LayerGenerator = (inputs: number) => Layer;

export function layer(
  nodes: number,
  activation: ActivationFunction
): LayerGenerator {
  return function (inputs: number) {
    const arr = new Array(nodes).fill(0);
    return new Layer(arr.map((_) => new Perceptron(inputs, activation)));
  };
}

export function network(inputs: number, ...layers: LayerGenerator[]) {
  const inputLayer = layers[0](inputs);
  const l: Layer[] = [inputLayer];
  let prev = inputLayer.perceptrons.length;

  for (const layerFunction of layers.slice(1)) {
    const n = layerFunction(prev);
    prev = n.perceptrons.length;
    l.push(n);
  }
  return new Network(l);
}

export function epoch(network: Network, collection: Collection, alpha: number) {
  for (let i of range(10)) {
    for (const entry of collection.shuffle().entries) {
      network.train(entry, alpha);
    }
  }
}

export function train(
  network: Network,
  data: Collection,
  alpha: number,
  target_loss: number = 0.001,
  max_epochs: number = 10000
) {
  let i = 0;
  const losses: number[] = [];
  while (i < max_epochs && loss(network, data) > target_loss) {
    if (i % 100 === 0) console.log(`Epoch ${i}`);
    i++;
    epoch(network, data, alpha);
    losses.push(loss(network, data));
  }
  return losses;
}

export function loss(network: Network, collection: Collection) {
  const l = collection.entries.map((entry) => Math.abs(network.error(entry)));

  return sum(l) / l.length;
}
