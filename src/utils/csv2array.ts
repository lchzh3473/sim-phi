export function csv2array(data: string, isObject: boolean): Record<string, string>[] | string[][] {
  const strarr = data.replace(/\ufeff|\r/g, '').split('\n');
  const col = [];
  for (const i of strarr) {
    let rowstr = '';
    let isQuot = false;
    let beforeQuot = false;
    const row = [];
    for (const j of i) {
      if (j === '"') {
        if (!isQuot) isQuot = true;
        else if (beforeQuot) {
          rowstr += j; beforeQuot = false;
        } else beforeQuot = true;
      } else if (j === ',') {
        if (!isQuot) {
          row.push(rowstr);
          rowstr = '';
        } else if (beforeQuot) {
          row.push(rowstr);
          rowstr = '';
          isQuot = false;
          beforeQuot = false;
        } else rowstr += j;
      } else if (beforeQuot) throw new SyntaxError('Unexpected token , (-1)');
      else rowstr += j;
    }
    if (!isQuot) {
      row.push(rowstr);
      rowstr = '';
    } else if (beforeQuot) {
      row.push(rowstr);
      rowstr = '';
      isQuot = false;
      beforeQuot = false;
    } else throw new SyntaxError('Unexpected token , (-2)');
    col.push(row);
  }
  if (!isObject) return col;
  const arr = [];
  for (let i = 1; i < col.length; i++) {
    const obj = {} as Record<string, string>;
    for (let j = 0; j < col[0].length; j++) obj[col[0][j]] = col[i][j];
    arr.push(obj);
  }
  return arr;
}
