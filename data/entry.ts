export class Entry {
  constructor(
    public x: number[],
    public y: number[],
    public xlab: string[],
    public ylab: string[]
  ) {}

  getX(label: string) {
    return this.x[this.xlab.indexOf(label)];
  }

  getY(label: string) {
    return this.y[this.ylab.indexOf(label)];
  }
}
