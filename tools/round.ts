export function round(n: number, sf: number = 0) {
  if (sf === 0) {
    return Math.round(n);
  }

  const t1 = 10 ** sf;

  return Math.round(n * t1) / t1;
}
