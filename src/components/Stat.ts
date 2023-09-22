export class Stat {
  public level: number;
  public noteRank: [number, number, number, number, number, number, number, number];
  public combos: [number, number, number, number, number];
  public maxcombo: number;
  public combo: number;
  private cumDisp: number;
  private curDisp: number;
  private numDisp: number;
  private numOfNotes: number;
  private data: Record<string, string>;
  private id: string;
  public format: string;
  public constructor() {
    this.level = 0;
    this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0];
    this.combos = [0, 0, 0, 0, 0];
    this.cumDisp = 0;
    this.curDisp = 0;
    this.numDisp = 0;
    this.maxcombo = 0;
    this.combo = 0;
    this.numOfNotes = 0;
    this.data = {};
    this.id = '';
    this.format = '';
  }
  public get good(): number {
    return this.noteRank[7] + this.noteRank[3];
  }
  public get bad(): number {
    return this.noteRank[6] + this.noteRank[2];
  }
  public get great(): number {
    return this.noteRank[5] + this.noteRank[1];
  }
  public get perfect(): number {
    return this.noteRank[4] + this.great;
  }
  public get all(): number {
    return this.perfect + this.good + this.bad;
  }
  public get scoreNum(): number {
    const a = 1e6 * (this.perfect * 0.9 + this.good * 0.585 + this.maxcombo * 0.1) / this.numOfNotes;
    return isFinite(a) ? a : 0;
  }
  public get scoreStr(): string {
    const a = this.scoreNum.toFixed(0);
    return '0'.repeat(a.length < 7 ? 7 - a.length : 0) + a;
  }
  public get accNum(): number {
    const a = (this.perfect + this.good * 0.65) / this.all;
    return isFinite(a) ? a : 1;
  }
  public get accStr(): string {
    return `${(100 * this.accNum).toFixed(2)}\uff05`;
  }
  public get avgDispStr(): string {
    const a = Math.trunc(this.cumDisp / this.numDisp * 1e3) || 0;
    return `${a > 0 ? '+' : ''}${a.toFixed(0)}ms`;
  }
  public get curDispStr(): string {
    const a = Math.trunc(this.curDisp * 1e3);
    return `${a > 0 ? '+' : ''}${a.toFixed(0)}ms`;
  }
  public get lineStatus(): 0 | 1 | 3 {
    if (this.bad) return 0;
    if (this.good) return 3;
    return 1;
  }
  public get rankStatus(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
    const a = Math.round(this.scoreNum);
    if (a >= 1e6) return 0;
    if (a >= 9.6e5) return 1;
    if (a >= 9.2e5) return 2;
    if (a >= 8.8e5) return 3;
    if (a >= 8.2e5) return 4;
    if (a >= 7e5) return 5;
    return 6;
  }
  public get localData(): string {
    const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
    const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
    const l3 = this.level.toString(36).slice(-1);
    return l1 + l2 + l3;
  }
  public static removeLegacy(key: string): void {
    const item = localStorage.getItem('phi');
    if (item == null) return;
    localStorage.setItem(key, item);
    localStorage.removeItem('phi');
  }
  public getData(isAuto: boolean, speed = ''): StatData {
    const s1 = this.data[this.id].slice(0, 3);
    const s2 = this.data[this.id].slice(3, 7);
    const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
    const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
    const l3 = this.level.toString(36).slice(-1);
    const na = parseInt(s2, 32) - 40672;
    const sa = na.toFixed(0);
    const sb = '0'.repeat(sa.length < 7 ? 7 - sa.length : 0) + sa;
    if (!isAuto) this.data[this.id] = (s1 > l1 ? s1 : l1) + (s2 > l2 ? s2 : l2) + l3;
    const arr = [];
    for (const [i, v] of Object.entries(this.data)) arr.push(i + v);
    localStorage.setItem(`phi-${speed}`, arr.sort(() => Math.random() - 0.5).join(''));
    const pbj = {
      newBestColor: s2 < l2 ? '#18ffbf' : '#fff',
      newBestStr: s2 < l2 ? 'NEW BEST' : 'BEST',
      scoreBest: sb,
      scoreDelta: `${s2 > l2 ? '- ' : '+ '}${Math.abs(na - Math.round(this.scoreNum))}`,
      textAboveColor: '#65fe43',
      textAboveStr: '  ( Speed {SPEED}x )',
      textBelowColor: '#fe4365',
      textBelowStr: 'AUTO PLAY'
    };
    if (isAuto) {
      return Object.assign(pbj, {
        newBestColor: '#fff',
        newBestStr: 'BEST',
        scoreDelta: ''
      });
    }
    if (this.lineStatus === 1) {
      return Object.assign(pbj, {
        textBelowStr: 'ALL  PERFECT',
        textBelowColor: '#ffc500'
      });
    }
    if (this.lineStatus === 3) {
      return Object.assign(pbj, {
        textBelowStr: 'FULL  COMBO',
        textBelowColor: '#00bef1'
      });
    }
    return Object.assign(pbj, { textBelowStr: '' });
  }
  public reset(numOfNotes: number, id: string, format: string, speed = ''): void {
    const key = `phi-${speed}`;
    this.numOfNotes = numOfNotes | 0;
    this.combo = 0;
    this.maxcombo = 0;
    this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0]; // 4:PM,5:PE,1:PL,7:GE,3:GL,6:BE,2:BL
    this.combos = [0, 0, 0, 0, 0]; // 不同种类note实时连击次数
    this.cumDisp = 0;
    this.curDisp = 0;
    this.numDisp = 0;
    if (speed === '') Stat.removeLegacy(key);
    const str = localStorage.getItem(key) ?? (localStorage.setItem(key, ''), ''); // 初始化存储
    for (let i = 0; i < Math.floor(str.length / 40); i++) {
      const data = str.slice(i * 40, i * 40 + 40);
      this.data[data.slice(0, 32)] = data.slice(-8);
    }
    if (id) {
      if (!this.data[id]) this.data[id] = this.localData;
      this.id = id;
    }
    this.format = format;
  }
  public addCombo(status: number, type: number): void {
    this.noteRank[status]++;
    this.combo = status % 4 === 2 ? 0 : this.combo + 1;
    if (this.combo > this.maxcombo) this.maxcombo = this.combo;
    this.combos[0]++;
    this.combos[type]++;
  }
  public addDisp(disp: number): void {
    this.curDisp = disp;
    this.cumDisp += disp;
    this.numDisp++;
  }
}
