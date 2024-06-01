const table = { sp: [0, 0], ez: [1, 7], hd: [3, 13], in: [6, 15], at: [13, 16] } as const;
const keys = ['ez', 'hd', 'in', 'at'] as const;
type DifficultyLowerCase = keyof typeof table;
type Difficulty = Uppercase<DifficultyLowerCase | ''>;
export class LevelInfoHandler {
  private readonly selectDifficulty: HTMLSelectElement;
  private readonly selectLevel: HTMLSelectElement;
  public text = '';
  public constructor(selectDifficulty: HTMLSelectElement, selectLevel: HTMLSelectElement) {
    this.selectDifficulty = selectDifficulty;
    this.selectLevel = selectLevel;
    Object.keys(table).forEach(key => this.selectDifficulty.add(new Option(key.toUpperCase())));
    for (let i = 0; i < 17; i++) this.selectLevel.add(new Option(String(i || '?')));
    this.selectDifficulty.addEventListener('change', () => this.updateInternal(0));
    this.selectLevel.addEventListener('change', () => this.updateInternal(1));
    this.updateInternal(-1);
  }
  private updateInternal(type: number): void {
    let diffStr = (this.selectDifficulty.value || 'SP').toLowerCase() as DifficultyLowerCase;
    let levelNum = Number(this.selectLevel.value) | 0;
    if (type === 0) {
      const diff = table[diffStr];
      if (levelNum < diff[0]) levelNum = diff[0];
      if (levelNum > diff[1]) levelNum = diff[1];
      this.selectLevel.value = String(levelNum || '?');
    } else if (type === 1) {
      if (table[diffStr][1] < levelNum) diffStr = keys.find(key => table[key][1] >= levelNum) || 'sp';
      else if (table[diffStr][0] > levelNum) diffStr = keys.findLast(key => table[key][0] <= levelNum) || 'sp';
      this.selectDifficulty.value = diffStr.toUpperCase() as Difficulty;
    }
    const diffString = this.selectDifficulty.value;
    const levelString = this.selectLevel.value;
    this.text = [diffString, levelString].join('\u2002Lv.');
  }
  public updateLevelText(level: string): void {
    this.text = level;
    const p = this.text.toUpperCase().split('LV.').map(a => a.trim());
    if (p[0]) this.selectDifficulty.value = p[0];
    if (p[1]) this.selectLevel.value = p[1];
  }
  public getDifficultyIndex(): number {
    return ['ez', 'hd', 'in', 'at'].indexOf(this.text.slice(0, 2).toLowerCase());
  }
  public getLevelNumber(): number {
    return Number(/\d+$/.exec(this.text));
  }
}
