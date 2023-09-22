import { isLinear } from './easing.js';
import { BpmList } from './BpmList';
import { LinePec } from './LinePec';
interface BpmCommand {
  time: number;
  bpm: number;
}
interface NoteCommand {
  type: number;
  lineId: number;
  time: number;
  time2: number;
  offsetX: number;
  isAbove: number;
  isFake: number;
  text: string;
  speed: number;
  size: number;
}
interface LineCommand {
  type: string;
  lineId: number;
  time: number;
  time2: number;
  speed: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  alpha: number;
  motionType: number;
  text: string;
}
interface PecParseResult {
  data: string;
  messages: string[];
  format: string;
}
export function parse(pec: string, filename: string): PecParseResult {
  const data = pec.split(/\s+/); // 切分pec文本
  const data2 = {
    offset: 0,
    bpmList: [] as BpmCommand[],
    notes: [] as NoteCommand[],
    lines: [] as LineCommand[]
  };
  const result = {
    formatVersion: 3,
    offset: 0,
    numOfNotes: 0,
    judgeLineList: [] as JudgeLine[]
  };
  const warnings = []; //
  let ptr = 0;
  data2.offset = isNaN(Number(data[ptr])) ? 0 : Number(data[ptr++]);
  while (ptr < data.length) {
    const command = data[ptr++];
    if (command === '') { continue }
    if (command === 'bp') {
      const time = Number(data[ptr++]);
      const bpm = Number(data[ptr++]);
      data2.bpmList.push({ time, bpm });
    } else if (command.startsWith('n')) {
      if (!'1234'.includes(command[1])) { throw new Error(`Unsupported Command: ${command}`) }
      const cmd = {} as NoteCommand;
      const type = command[1];
      cmd.type = Number(type);
      cmd.lineId = Number(data[ptr++]);
      cmd.time = Number(data[ptr++]);
      cmd.time2 = '2'.includes(type) ? Number(data[ptr++]) : cmd.time;
      cmd.offsetX = Number(data[ptr++]);
      cmd.isAbove = Number(data[ptr++]);
      cmd.isFake = Number(data[ptr++]);
      cmd.text = `n${Object.values(cmd).join(' ')}`;
      cmd.speed = (data[ptr++] || '').startsWith('#') ? Number(data[ptr++]) : (ptr--, 1);
      cmd.size = (data[ptr++] || '').startsWith('&') ? Number(data[ptr++]) : (ptr--, 1);
      data2.notes.push(cmd);
    } else if (command.startsWith('c')) {
      if (!'vpdamrf'.includes(command[1])) { throw new Error(`Unsupported Command: ${command}`) }
      const cmd = {} as LineCommand;
      const type = command[1];
      cmd.type = type;
      cmd.lineId = Number(data[ptr++]);
      cmd.time = Number(data[ptr++]);
      if ('v'.includes(type)) { cmd.speed = Number(data[ptr++]) }
      cmd.time2 = 'mrf'.includes(type) ? Number(data[ptr++]) : cmd.time;
      if ('pm'.includes(type)) { cmd.offsetX = Number(data[ptr++]) }
      if ('pm'.includes(type)) { cmd.offsetY = Number(data[ptr++]) }
      if ('dr'.includes(type)) { cmd.rotation = Number(data[ptr++]) }
      if ('af'.includes(type)) { cmd.alpha = Number(data[ptr++]) }
      if ('mr'.includes(type)) { cmd.motionType = Number(data[ptr++]) }
      cmd.text = `c${Object.values(cmd).join(' ')}`;
      if ('pdaf'.includes(type)) { cmd.motionType = 1 }
      data2.lines.push(cmd);
    } else { throw new Error(`Unexpected Command: ${command}`) }
  }
  result.offset = data2.offset / 1e3 - 0.175; // v18x固定延迟
  // bpm变速
  if (!data2.bpmList.length) { throw new Error('Invalid pec file') }
  const bpmList = new BpmList(data2.bpmList[0].bpm); // FIXME: 考虑合适的bpm范围
  data2.bpmList.sort((a, b) => a.time - b.time).forEach((i, idx, arr) => {
    if (arr[idx + 1]?.time <= 0) { return } // 过滤负数
    bpmList.push(i.time < 0 ? 0 : i.time, arr[idx + 1]?.time ?? 1e9, i.bpm);
  });
  // note和判定线事件
  const linesPec = [] as LinePec[];
  for (const i of data2.notes) {
    const type = [0, 1, 4, 2, 3].indexOf(i.type);
    const time = bpmList.calc(i.time);
    const holdTime = bpmList.calc(i.time2) - time;
    const speed = isNaN(i.speed) ? 1 : i.speed;
    linesPec[i.lineId] ??= new LinePec(bpmList.baseBpm);
    linesPec[i.lineId].pushNote(type, time, i.offsetX / 115.2, holdTime, speed, i.isAbove === 1, i.isFake !== 0); // 102.4
    // if (i.isAbove !== 1 && i.isAbove !== 2) warnings.push(`检测到非法方向:${i.isAbove}(将被视为2)\n位于:"${i.text}"\n来自${filename}`);
    if (i.isFake !== 0) {
      warnings.push(`检测到FakeNote(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`);
    }
    if (i.size !== 1) { warnings.push(`检测到异常Note(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`) }
  }
  const isMotion = (i: number) => !isLinear(i) || i === 1;
  for (const i of data2.lines) {
    const t1 = bpmList.calc(i.time);
    const t2 = bpmList.calc(i.time2);
    if (t1 > t2) {
      warnings.push(`检测到开始时间大于结束时间(将禁用此事件)\n位于:"${i.text}"\n来自${filename}`);
      continue;
    }
    linesPec[i.lineId] ??= new LinePec(bpmList.baseBpm);
    // 变速
    if (i.type === 'v') {
      linesPec[i.lineId].pushSpeedEvent(t1, i.speed / 7.0); // 6.0??
    }
    // 不透明度
    if (i.type === 'a' || i.type === 'f') {
      linesPec[i.lineId].pushAlphaEvent(t1, t2, Math.max(i.alpha / 255, 0), i.motionType); // 暂不支持alpha值扩展
      if (i.alpha < 0) { warnings.push(`检测到负数Alpha:${i.alpha}(将被视为0)\n位于:"${i.text}"\n来自${filename}`) }
    }
    // 移动
    if (i.type === 'p' || i.type === 'm') {
      linesPec[i.lineId].pushMoveEvent(t1, t2, i.offsetX / 2048, i.offsetY / 1400, isMotion(i.motionType) ? i.motionType : 1);
      if (!isMotion(i.motionType)) { warnings.push(`未知的缓动类型:${i.motionType}(将被视为1)\n位于:"${i.text}"\n来自${filename}`) }
    }
    // 旋转
    if (i.type === 'd' || i.type === 'r') {
      linesPec[i.lineId].pushRotateEvent(t1, t2, -i.rotation, isMotion(i.motionType) ? i.motionType : 1);
      if (!isMotion(i.motionType)) { warnings.push(`未知的缓动类型:${i.motionType}(将被视为1)\n位于:"${i.text}"\n来自${filename}`) }
    }
  }
  for (const i of linesPec) {
    const judgeLine = i.format();
    result.judgeLineList.push(judgeLine);
    result.numOfNotes += judgeLine.numOfNotes;
  }
  return { data: JSON.stringify(result), messages: warnings, format: 'PEC' };
}
