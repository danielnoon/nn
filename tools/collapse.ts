export function collapse(n: number[]) {
  const max = Math.max(...n);
  return n.indexOf(max);
}
