export type ActivationFunction = (z: number) => number;

export const step = (x: number) => (x > 0 ? 1 : 0);

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
