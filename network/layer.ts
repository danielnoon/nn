import { dot } from "../tools/dot.ts";
import actMap, { ActivationFunction } from "./activation.ts";
import { Perceptron } from "./perceptron.ts";

export class Layer {
  constructor(public perceptrons: Perceptron[]) {}

  ff(input: number[]) {
    return this.perceptrons
      .map((p) => ({ d: dot(p.weights, [1, ...input]), a: p.activation }))
      .map((v, i, a) =>
        v.a[0](
          v.d,
          a.map((b) => b.d),
          i
        )
      );
  }
}

export type LayerGenerator = (inputs: number) => Layer;

export function layer(
  nodes: number,
  activation: ActivationFunction | string
): LayerGenerator {
  return function (inputs: number) {
    const arr = new Array(nodes).fill(0);
    const a = getActivation(activation);
    return new Layer(arr.map((_) => new Perceptron(inputs, a)));
  };
}

function getActivation(a: ActivationFunction | string): ActivationFunction {
  if (typeof a === "string") {
    const func = actMap.get(a);
    if (func) {
      return func;
    } else {
      throw new Error(`Activation ${a} does not exist.`);
    }
  } else {
    return a;
  }
}
