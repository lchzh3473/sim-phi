export class HitEvents extends Array {
  public update: () => void;
  public animate: () => void;
  public constructor({
    updateCallback = (..._arg: any[]): boolean => false,
    iterateCallback = (..._arg: any[]) => {}
  } = {}) {
    super();
    this.update = this.defilter.bind(this, updateCallback);
    this.animate = this.iterate.bind(this, iterateCallback);
  }
  private defilter(predicate: (arg0: unknown) => boolean): this {
    let i = this.length;
    while (i--) if (predicate(this[i])) this.splice(i, 1);
    return this;
  }
  private iterate(callback: (arg0: unknown) => void): void {
    for (const i of this) callback(i);
  }
  public add(value: unknown): void {
    this[this.length] = value;
  }
  public clear(): void {
    this.length = 0;
  }
}
