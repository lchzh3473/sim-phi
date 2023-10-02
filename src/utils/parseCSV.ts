export function parseCSV(rawText: string, isObject: false): string[][];
export function parseCSV(rawText: string, isObject: true): Record<string, string>[];
export function parseCSV(rawText: string, isObject: boolean): Record<string, string>[] | string[][] {
  const lines = rawText.replace(/\ufeff|\r/g, '').split('\n');
  const rows = [];
  for (const line of lines) {
    let rowText = '';
    let isQuot = false;
    let beforeQuot = false;
    const row = [];
    for (const char of line) {
      if (char === '"') {
        if (!isQuot) isQuot = true;
        else if (beforeQuot) {
          rowText += char; beforeQuot = false;
        } else beforeQuot = true;
      } else if (char === ',') {
        if (!isQuot) {
          row.push(rowText);
          rowText = '';
        } else if (beforeQuot) {
          row.push(rowText);
          rowText = '';
          isQuot = false;
          beforeQuot = false;
        } else rowText += char;
      } else if (beforeQuot) throw new SyntaxError('Unexpected token , (-1)');
      else rowText += char;
    }
    if (!isQuot) {
      row.push(rowText);
      rowText = '';
    } else if (beforeQuot) {
      row.push(rowText);
      rowText = '';
      isQuot = false;
      beforeQuot = false;
    } else throw new SyntaxError('Unexpected token , (-2)');
    rows.push(row);
  }
  if (!isObject) return rows;
  const arr = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {} as Record<string, string>;
    for (let j = 0; j < rows[0].length; j++) obj[rows[0][j]] = rows[i][j];
    arr.push(obj);
  }
  return arr;
}
