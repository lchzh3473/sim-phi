import { parse } from './pec2json';
import { parse as parseRPE } from './rpe2json';
// 读取info.txt
function readInfo(text: string): Record<string, string>[] {
  const lines = String(text).split(/\r?\n/);
  const result = [];
  let current = {} as Record<string, string>;
  for (const i of lines) {
    if (i.startsWith('#')) {
      if (Object.keys(current).length) result.push(current);
      current = {};
    } else {
      let [key, value] = i.split(/:(.+)/).map(s => s.trim());
      if (key === 'Song') key = 'Music';
      if (key === 'Picture') key = 'Image';
      if (key) current[key] = value;
    }
  }
  if (Object.keys(current).length) result.push(current);
  return result;
}
export default { parse, parseRPE, readInfo };
