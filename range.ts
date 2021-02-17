class RRange {
  private readonly start: number;
  private readonly end: number;
  private readonly step: number;

  constructor(a: number, b?: number, c?: number) {
    if ([a, b, c].every((n) => n !== undefined)) {
      this.start = a;
      this.end = b!;
      this.step = c!;
    } else if ([a, b].every((n) => n !== undefined)) {
      this.start = a;
      this.end = b!;
      this.step = 1;
    } else {
      this.start = 0;
      this.end = a;
      this.step = 1;
    }
  }

  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i += this.step) yield i;
  }

  get arr() {
    return Array.from(this);
  }
}

export function range(end: number): RRange;
export function range(start: number, end: number): RRange;
export function range(start: number, end?: number, step?: number) {
  return new RRange(start, end, step);
}
