export function zip<T, P>(a: Iterable<T>, b: Iterable<P>): [T, P][] {
  const result: [T, P][] = [];
  const A = a[Symbol.iterator]();
  const B = b[Symbol.iterator]();

  let aa = A.next();
  let bb = B.next();

  while (!aa.done && !bb.done) {
    result.push([aa.value, bb.value]);
    aa = A.next();
    bb = B.next();
  }

  return result;
}
