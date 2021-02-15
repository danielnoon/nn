import { ActivationFunction } from "./activation.ts";
import { Collection, Entry } from "./data.ts";
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

    const r_outputs = reverse(outputs);
    const r_layers = reverse(this.layers);

    const z = zip(r_layers, r_outputs);
  }

  public error(entry: Entry) {
    const ideal = entry.y;
    const outputs = this.ff(entry.x);

    return sum(zip(ideal, last(outputs)).map(([i, a]) => (i - a) ** 2)) / 2;
  }
}

export class Layer {
  constructor(public perceptrons: Perceptron[]) {}

  ff(input: number[]) {
    return this.perceptrons.map((p) => p.predict(input));
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
  for (const entry of collection.entries) {
    network.train(entry, alpha);
  }
}

export function train(
  network: Network,
  data: Collection,
  alpha: number,
  target_loss: number = 0.0001,
  max_epochs: number = 10000
) {
  let i = max_epochs;
  const losses: number[] = [];
  while (i > 0 && loss(network, data) > target_loss) {
    i--;
    epoch(network, data.shuffle(), alpha);
    losses.push(loss(network, data));
  }
  return losses;
}

export function loss(network: Network, collection: Collection) {
  const l = collection.entries.map((entry) => Math.abs(network.error(entry)));

  return sum(l) / l.length;
}
