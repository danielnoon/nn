export type LossFunction = (actual: number, expected: number) => number;

export const crossentropy: LossFunction = (actual, expected) => {
  if (expected === 1) {
    return -Math.log(Math.abs(actual));
  } else {
    return -Math.log(1 - Math.abs(actual));
  }
};

export const sse: LossFunction = (actual, expected) => actual - expected;
