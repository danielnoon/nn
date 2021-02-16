import { sum } from "./sum.ts";

type fn = (z: number, w: number[], i: number) => number;

export type ActivationFunction = [base: fn, derivative: fn];

export const step: ActivationFunction = [(x) => (x > 0 ? 1 : 0), (x) => 0];

export const sigmoid: ActivationFunction = [
  (x) => 1 / (1 + Math.exp(-x)),
  (x) => x * (1 - x),
];

export const relu: ActivationFunction = [
  (x) => Math.max(0, x),
  (x) => (x > 0 ? 1 : 0),
];

export const softmax: ActivationFunction = [
  (x, w) => Math.exp(x) / sum(w.map(Math.exp)),
  (x) => x * (1 - x),
];
