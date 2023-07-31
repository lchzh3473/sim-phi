interface BpmEventPec {
  start: number;
  end: number;
  bpm: number;
  value: number;
}
export type BeatArray = [number, number, number];
export class BpmList {
  public baseBpm: number;
  private accTime: number;
  private readonly list: BpmEventPec[];
  public constructor(baseBpm: unknown) {
    this.baseBpm = Number(baseBpm) || 120;
    this.accTime = 0;
    this.list = []; // 存放bpm变速事件
  }
  public push(start: number, end: number, bpm: number): void {
    const value = this.accTime;
    this.list.push({ start, end, bpm, value });
    this.accTime += (end - start) / bpm;
  }
  public calc(beat: number): number {
    let time = 0;
    for (const i of this.list) {
      if (beat > i.end) { continue }
      if (beat < i.start) { break }
      time = Math.round(((beat - i.start) / i.bpm + i.value) * this.baseBpm * 32);
    }
    return time;
  }
  public calc2(time: BeatArray): number {
    return this.calc(time[0] + time[1] / time[2]);
  }
}
