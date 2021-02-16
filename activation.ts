type fn = (z: number, w: number[]) => number;

export type ActivationFunction = [base: fn, derivative: fn];

export const step: ActivationFunction = [
  (x: number) => (x > 0 ? 1 : 0),
  (x: number) => 0,
];

export const sigmoid: ActivationFunction = [
  (x: number) => 1 / (1 + Math.exp(-x)),
  (x: number) => x * (1 - x),
];
