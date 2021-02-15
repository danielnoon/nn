type fn = (z: number) => number;

export type ActivationFunction = [base: fn, derivative: fn];

export const step: ActivationFunction = [
  (x: number) => (x > 0 ? 1 : 0),
  (x: number) => 0,
];

const sigmoidBase = (x: number) => 1 / (1 + Math.exp(-x));
export const sigmoid: ActivationFunction = [
  sigmoidBase,
  (x: number) => sigmoidBase(x) * (1 - sigmoidBase(x)),
];
