/* eslint-disable @typescript-eslint/naming-convention */
import { type BeatArray, BpmList } from './BpmList';
import { easing } from './easing.js';
import { cubicBezier } from './cubicBezier.js';
interface BpmEventRPE {
  startTime: BeatArray;
  bpm: number;
}
interface BpmEventRPEExtends extends BpmEventRPE {
  time: number;
}
interface LineEventPec {
  startTime: number;
  endTime: number;
  start: number;
  end: number;
}
interface LineEventPec2 extends LineEventPec {
  start2: number;
  end2: number;
}
interface LineEventPecDelta extends LineEventPec {
  delta: number;
}
interface SpeedEventPec {
  time: number;
  value: number;
}
interface LineEventRPE {
  startTime: BeatArray;
  endTime: BeatArray;
  start: number;
  end: number;
  easingType: number;
  linkgroup?: number;
  easingLeft?: number;
  easingRight?: number;
  bezier?: number;
  bezierPoints?: [number, number, number, number];
}
interface LineEventRPE2 {
  startTime: number;
  endTime: number;
  start: number;
  end: number;
  easingFn?: (t: number) => number;
}
const enum EasingCode {
  NoError = 0,
  StartEqualsEnd = -1,
  EasingTypeNotSupported = -2,
  LinearBezier = -3
}
interface EasingResult {
  code: EasingCode;
  fn?: (t: number) => number;
}
function getEasingFn(le: LineEventRPE, startTime: number, endTime: number): EasingResult {
  const { start, end, bezier = 0 } = le;
  if (start === end) return { code: EasingCode.StartEqualsEnd };
  if (bezier === 0 || bezier == null) {
    const { easingType, easingLeft = 0, easingRight = 1 } = le;
    if (easingLeft === easingRight) return { code: EasingCode.StartEqualsEnd };
    const easingFn = easing(easingType);
    if (easingFn == null) return { code: EasingCode.EasingTypeNotSupported };
    const eHead = easingFn(easingLeft);
    const eTail = easingFn(easingRight);
    const eSpeed = (easingRight - easingLeft) / (endTime - startTime);
    const eDelta = (eTail - eHead) / (end - start);
    return { code: EasingCode.NoError, fn: (t: number) => (easingFn((t - startTime) * eSpeed + easingLeft) - eHead) / eDelta };
  }
  if (bezier !== 0) {
    const { bezierPoints: [p1x, p1y, p2x, p2y] = [0, 0, 0, 0] } = le;
    if (p1x === p1y && p2x === p2y) return { code: EasingCode.LinearBezier };
    const eSpeed = 1 / (endTime - startTime);
    const eDelta = 1 / (end - start);
    const easingFn = cubicBezier(p1x, p1y, p2x, p2y);
    return { code: EasingCode.NoError, fn: (t: number) => easingFn((t - startTime) * eSpeed) / eDelta };
  }
  throw new Error('Not implemented');
}
function pushLineEvent(ls: LineEventPecDelta[], le: LineEventRPE2) {
  const { startTime, endTime, start, end, easingFn } = le;
  const delta = (end - start) / (endTime - startTime);
  // 插入之前考虑事件时间的相互关系
  for (let i = ls.length - 1; i >= 0; i--) {
    const e = ls[i];
    if (e.endTime < startTime) { // 相离：补全空隙
      ls[i + 1] = { startTime: e.endTime, endTime: startTime, start: e.end, end: e.end, delta: 0 };
      break;
    }
    if (e.startTime === startTime) { // 相切：直接截断
      ls.length = i;
      break;
    }
    if (e.startTime < startTime) { // 相交：截断交点以后的部分
      e.end = e.start + (startTime - e.startTime) * e.delta;
      e.endTime = startTime;
      e.delta = (e.end - e.start) / (startTime - e.startTime);
      ls.length = i + 1;
      break;
    }
  }
  // 插入新事件
  if (startTime >= endTime) {
    ls.push({ startTime, endTime: startTime, start: end, end, delta: 0 });
    return;
  }
  if (easingFn == null) {
    ls.push({ startTime, endTime, start, end, delta });
  } else {
    let v1 = 0;
    let v2 = 0;
    for (let j = startTime; j < endTime; j++) {
      v1 = v2;
      v2 = easingFn(j + 1);
      ls.push({ startTime: j, endTime: j + 1, start: start + v1, end: start + v2, delta: v2 - v1 });
    }
  }
}
function toSpeedEvent(le: LineEventRPE2[]) {
  const result = [];
  for (const i of le) {
    const { startTime, endTime, start, end } = i;
    result.push({ time: startTime, value: start });
    if (start !== end) { // 暂未考虑开始时间大于结束时间的情况
      const t1 = (end - start) / (endTime - startTime);
      for (let j = startTime; j < endTime; j++) {
        const x = j + 1 - startTime;
        result.push({ time: j + 1, value: start + x * t1 });
      }
    }
  }
  return result;
}
function getEventsValue(e: LineEventPecDelta[], t: number, d: boolean) {
  let result = e[0]?.start ?? 0;
  for (const i of e) {
    const { startTime, endTime, start, end, delta } = i;
    if (t < startTime) break;
    if (d && t === startTime) break;
    if (t >= endTime) result = end;
    else result = start + (t - startTime) * delta;
  }
  return result;
}
function getMoveValue(e: LineEventPec2[], t: number, d: boolean) {
  let result = e[0]?.start ?? 0;
  let result2 = e[0]?.start2 ?? 0;
  for (const i of e) {
    const { startTime, endTime, start, end, start2, end2 } = i;
    if (t < startTime) break;
    if (d && t === startTime) break;
    if (t >= endTime) {
      result = end;
      result2 = end2;
    } else {
      result = start + (t - startTime) * (end - start) / (endTime - startTime);
      result2 = start2 + (t - startTime) * (end2 - start2) / (endTime - startTime);
    }
  }
  return [result, result2];
}
function getRotateValue(e: LineEventRPE2[], t: number, d: boolean) {
  let result = e[0]?.start ?? 0;
  for (const i of e) {
    const { startTime, endTime, start, end } = i;
    if (t < startTime) break;
    if (d && t === startTime) break;
    if (t >= endTime) result = end;
    else { result = start + (t - startTime) * (end - start) / (endTime - startTime) }
  }
  return result;
}
function combineXYEvents(xe: LineEventPecDelta[], ye: LineEventPecDelta[]) {
  const le = [];
  const splits = [];
  for (const i of xe) splits.push(i.startTime, i.endTime);
  for (const i of ye) splits.push(i.startTime, i.endTime);
  splits.sort((a, b) => a - b);
  for (let i = 0; i < splits.length - 1; i++) {
    const startTime = splits[i];
    const endTime = splits[i + 1];
    if (startTime === endTime) continue;
    const startX = getEventsValue(xe, startTime, false);
    const endX = getEventsValue(xe, endTime, true);
    const startY = getEventsValue(ye, startTime, false);
    const endY = getEventsValue(ye, endTime, true);
    le.push({ startTime, endTime, start: startX, end: endX, start2: startY, end2: endY });
  }
  return le;
}
function combineMultiEvents(es: LineEventPecDelta[][]) {
  const le = [];
  const splits = [];
  for (const e of es) {
    for (const i of e) splits.push(i.startTime, i.endTime);
  }
  splits.sort((a, b) => a - b);
  for (let i = 0; i < splits.length - 1; i++) {
    const startTime = splits[i];
    const endTime = splits[i + 1];
    if (startTime === endTime) continue;
    const start = es.reduce((n, e) => n + getEventsValue(e, startTime, false), 0);
    const end = es.reduce((n, e) => n + getEventsValue(e, endTime, true), 0);
    le.push({ startTime, endTime, start, end, delta: (end - start) / (endTime - startTime) });
  }
  return le;
}
function mergeFather(child: LineRPE1, father: LineRPE1) {
  const moveEvents = [];
  const splits = [];
  for (const i of father.moveEvents!) splits.push(i.startTime, i.endTime);
  for (const i of father.rotateEvents!) splits.push(i.startTime, i.endTime);
  for (const i of child.moveEvents!) splits.push(i.startTime, i.endTime);
  splits.sort((a, b) => a - b);
  for (let i = splits[0]; i < splits[splits.length - 1]; i++) {
    const startTime = i;
    const endTime = i + 1;
    if (startTime === endTime) continue;
    // 计算父级移动和旋转
    const [fatherX, fatherY] = getMoveValue(father.moveEvents!, startTime, false);
    const fatherR = getRotateValue(father.rotateEvents!, startTime, false) * -Math.PI / 180;
    const [fatherX2, fatherY2] = getMoveValue(father.moveEvents!, endTime, true);
    const fatherR2 = getRotateValue(father.rotateEvents!, endTime, true) * -Math.PI / 180;
    // 计算子级移动
    const [childX, childY] = getMoveValue(child.moveEvents!, startTime, false);
    const [childX2, childY2] = getMoveValue(child.moveEvents!, endTime, true);
    // 坐标转换
    const start = fatherX + childX * Math.cos(fatherR) - childY * Math.sin(fatherR);
    const end = fatherX2 + childX2 * Math.cos(fatherR2) - childY2 * Math.sin(fatherR2);
    const start2 = fatherY + childX * Math.sin(fatherR) + childY * Math.cos(fatherR);
    const end2 = fatherY2 + childX2 * Math.sin(fatherR2) + childY2 * Math.cos(fatherR2);
    moveEvents.push({ startTime, endTime, start, end, start2, end2 });
  }
  child.moveEvents = moveEvents;
}
interface EventLayer {
  moveXEvents: LineEventRPE[];
  moveYEvents: LineEventRPE[];
  rotateEvents: LineEventRPE[];
  alphaEvents: LineEventRPE[];
  speedEvents: LineEventRPE[];
}
class EventLayer1 {
  public moveXEvents: LineEventRPE2[];
  public moveYEvents: LineEventRPE2[];
  public rotateEvents: LineEventRPE2[];
  public alphaEvents: LineEventRPE2[];
  public speedEvents: LineEventRPE2[];
  public constructor() {
    this.moveXEvents = [];
    this.moveYEvents = [];
    this.rotateEvents = [];
    this.alphaEvents = [];
    this.speedEvents = [];
  }
  public pushMoveXEvent(startTime: number, endTime: number, start: number, end: number, easingFn?: (t: number) => number) {
    this.moveXEvents.push({ startTime, endTime, start, end, easingFn });
  }
  public pushMoveYEvent(startTime: number, endTime: number, start: number, end: number, easingFn?: (t: number) => number) {
    this.moveYEvents.push({ startTime, endTime, start, end, easingFn });
  }
  public pushRotateEvent(startTime: number, endTime: number, start: number, end: number, easingFn?: (t: number) => number) {
    this.rotateEvents.push({ startTime, endTime, start, end, easingFn });
  }
  public pushAlphaEvent(startTime: number, endTime: number, start: number, end: number, easingFn?: (t: number) => number) {
    this.alphaEvents.push({ startTime, endTime, start, end, easingFn });
  }
  public pushSpeedEvent(startTime: number, endTime: number, start: number, end: number) { this.speedEvents.push({ startTime, endTime, start, end }) }
}
interface NoteRPE {
  type: number;
  startTime: BeatArray;
  endTime: BeatArray;
  positionX: number;
  above: number;
  isFake: number;
  speed: number;
  size: number;
  yOffset: number;
  visibleTime: number;
  alpha: number;
}
interface NoteRPE1 {
  type: number;
  time: number;
  positionX: number;
  holdTime: number;
  speed: number;
  isAbove: boolean;
  isFake: boolean;
}
class LineRPE1 {
  public bpm: number;
  public notes: NoteRPE1[];
  public eventLayers: EventLayer1[];
  public id?: number;
  public father: LineRPE1 | null;
  public moveEvents?: LineEventPec2[];
  public rotateEvents?: LineEventPec[];
  public alphaEvents?: LineEventPec[];
  public speedEvents?: SpeedEventPec[];
  private settled: boolean;
  private merged: boolean;
  public constructor(bpm: number) {
    this.bpm = 120;
    this.notes = [];
    this.eventLayers = [];
    this.father = null;
    this.settled = false;
    this.merged = false;
    if (!isNaN(bpm)) this.bpm = bpm;
  }
  public pushNote(type: number, time: number, positionX: number, holdTime: number, speed: number, isAbove: boolean, isFake: boolean) {
    this.notes.push({ type, time, positionX, holdTime, speed, isAbove, isFake });
  }
  public setId(id = NaN) { this.id = id }
  public setFather(fatherLine: LineRPE1 | null) { this.father = fatherLine }
  public preset() {
    const sortFn2 = (a: { startTime: number }, b: { startTime: number }) => a.startTime - b.startTime;
    const events = [];
    for (const e of this.eventLayers) {
      const moveXEvents: LineEventPecDelta[] = [];
      const moveYEvents: LineEventPecDelta[] = [];
      const rotateEvents: LineEventPecDelta[] = [];
      const alphaEvents: LineEventPecDelta[] = [];
      const speedEvents: LineEventPecDelta[] = [];
      for (const i of e.moveXEvents.sort(sortFn2)) pushLineEvent(moveXEvents, i);
      for (const i of e.moveYEvents.sort(sortFn2)) pushLineEvent(moveYEvents, i);
      for (const i of e.rotateEvents.sort(sortFn2)) pushLineEvent(rotateEvents, i);
      for (const i of e.alphaEvents.sort(sortFn2)) pushLineEvent(alphaEvents, i);
      for (const i of e.speedEvents.sort(sortFn2)) pushLineEvent(speedEvents, i); // TODO: 特殊处理
      events.push({ moveXEvents, moveYEvents, rotateEvents, alphaEvents, speedEvents });
    }
    const moveXEvents = combineMultiEvents(events.map(i => i.moveXEvents));
    const moveYEvents = combineMultiEvents(events.map(i => i.moveYEvents));
    this.moveEvents = combineXYEvents(moveXEvents, moveYEvents);
    this.rotateEvents = combineMultiEvents(events.map(i => i.rotateEvents));
    this.alphaEvents = combineMultiEvents(events.map(i => i.alphaEvents));
    this.speedEvents = toSpeedEvent(combineMultiEvents(events.map(i => i.speedEvents)));
    this.settled = true;
  }
  public fitFather(stack: LineRPE1[] = [], onwarning = console.warn) {
    if (!this.settled) this.preset();
    if (stack.includes(this)) {
      onwarning(`检测到循环继承：${stack.concat(this).map(i => i.id).join('->')}(对应的father将被视为-1)`);
      stack.map(i => i.setFather(null));
      return;
    }
    if (this.father) this.father.fitFather(stack.concat(this), onwarning);
    // this.father可能会在上一行被修改成null
    if (this.father && !this.merged) {
      mergeFather(this, this.father);
      this.merged = true;
    }
  }
  public format({ onwarning = console.warn } = {}) {
    this.fitFather([], onwarning);
    const result = {
      bpm: this.bpm,
      speedEvents: [] as SpeedEvent[],
      numOfNotes: 0,
      numOfNotesAbove: 0,
      numOfNotesBelow: 0,
      notesAbove: [] as Note[],
      notesBelow: [] as Note[],
      judgeLineDisappearEvents: [] as JudgeLineEvent[],
      judgeLineMoveEvents: [] as JudgeLineEvent[],
      judgeLineRotateEvents: [] as JudgeLineEvent[]
    };
    for (const i of this.moveEvents!) {
      result.judgeLineMoveEvents.push({
        startTime: i.startTime,
        endTime: i.endTime,
        start: (i.start + 675) / 1350,
        end: (i.end + 675) / 1350,
        start2: (i.start2 + 450) / 900,
        end2: (i.end2 + 450) / 900
      });
    }
    for (const i of this.rotateEvents!) {
      result.judgeLineRotateEvents.push({
        startTime: i.startTime,
        endTime: i.endTime,
        start: -i.start,
        end: -i.end,
        start2: 0,
        end2: 0
      });
    }
    for (const i of this.alphaEvents!) {
      result.judgeLineDisappearEvents.push({
        startTime: i.startTime,
        endTime: i.endTime,
        start: Math.max(0, i.start / 255),
        end: Math.max(0, i.end / 255),
        start2: 0,
        end2: 0
      });
    }
    // 添加floorPosition
    let floorPos = 0;
    const speedEvents = this.speedEvents!;
    for (let i = 0; i < speedEvents.length; i++) {
      const startTime = Math.max(speedEvents[i].time, 0);
      const endTime = i < speedEvents.length - 1 ? speedEvents[i + 1].time : 1e9;
      const value = speedEvents[i].value * 11 / 45;
      const floorPosition = floorPos;
      floorPos += (endTime - startTime) * value / this.bpm * 1.875;
      floorPos = Math.fround(floorPos);
      result.speedEvents.push({ startTime, endTime, value, floorPosition });
    }
    // 处理notes
    const sortFn = (a: { time: number }, b: { time: number }) => a.time - b.time;
    for (const i of this.notes.sort(sortFn)) {
      const { time } = i;
      let v1 = 0;
      let v2 = 0;
      let v3 = 0;
      for (const e of result.speedEvents) {
        if (time > e.endTime) continue;
        if (time < e.startTime) break;
        v1 = e.floorPosition;
        v2 = e.value;
        v3 = time - e.startTime;
      }
      const note = {
        type: i.type,
        time: time + (i.isFake ? 1e9 : 0),
        positionX: i.positionX,
        holdTime: i.holdTime,
        speed: i.speed * (i.type === 3 ? v2 : 1),
        floorPosition: Math.fround(v1 + v2 * v3 / this.bpm * 1.875)
      };
      if (i.isAbove) {
        result.notesAbove.push(note);
        if (i.isFake) continue;
        result.numOfNotes++;
        result.numOfNotesAbove++;
      } else {
        result.notesBelow.push(note);
        if (i.isFake) continue;
        result.numOfNotes++;
        result.numOfNotesBelow++;
      }
    }
    return result;
  }
}
interface RPEMeta {
  RPEVersion: string;
  song: string;
  background: string;
  name: string;
  composer: string;
  charter: string;
  level: string;
  offset: number;
}
interface RPEDataBase {
  BPMList: BpmEventRPEExtends[];
  judgeLineList: JudgeLineRPEExtends[];
}
type RPEDataLegacy = RPEDataBase & RPEMeta & { META: undefined };
type RPEDataCurrent = RPEDataBase & { META: RPEMeta };
type RPEData = RPEDataCurrent | RPEDataLegacy;
interface JudgeLineRPE {
  numOfNotes: number;
  isCover: number;
  Texture: string;
  eventLayers: (EventLayer | null)[];
  extended?: {
    scaleXEvents: LineEventRPE[];
    scaleYEvents: LineEventRPE[];
  } | null;
  notes: NoteRPE[] | null;
  Group: number;
  Name: string;
  zOrder: number;
  bpmfactor: number;
  father: number;
}
interface JudgeLineRPEExtends extends JudgeLineRPE {
  LineId: number;
  judgeLineRPE: LineRPE1;
}
export function parse(pec: string, filename: string): {
  data: string;
  messages: BetterMessage[];
  info: ChartInfoData;
  line: ChartLineData[];
  format: string;
} {
  const data = JSON.parse(pec) as RPEData;
  const meta = data.META || data;
  if (!meta?.RPEVersion) throw new Error('Invalid rpe file');
  const result = { formatVersion: 3, offset: 0, numOfNotes: 0, judgeLineList: [] as JudgeLine[] };
  const warnings = [] as BetterMessage[];
  const warn = (code: number, name: string, message: string) => warnings.push({ host: 'RPE2JSON', code, name, message, target: filename });
  warn(0, 'RPEVersionNotice', `RPE谱面兼容建设中...\n检测到RPE版本:${meta.RPEVersion}`);
  const format = `RPE(${meta.RPEVersion})`;
  // 谱面信息
  const info: ChartInfoData = {};
  info.Chart = filename;
  info.Music = meta.song;
  info.Image = meta.background;
  info.Name = meta.name;
  info.Artist = meta.composer;
  info.Charter = meta.charter;
  info.Level = meta.level;
  result.offset = meta.offset / 1e3;
  // 判定线贴图
  const line: ChartLineData[] = [];
  data.judgeLineList.forEach((i: JudgeLineRPEExtends, index: number) => {
    i.LineId = index;
    const texture = String(i.Texture).replace(/\0/g, '');
    if (texture === 'line.png') return;
    const { extended } = i;
    const scaleX = extended?.scaleXEvents ? extended.scaleXEvents[extended.scaleXEvents.length - 1].end : 1;
    const scaleY = extended?.scaleYEvents ? extended.scaleYEvents[extended.scaleYEvents.length - 1].end : 1;
    line.push({
      Chart: filename,
      LineId: index,
      Image: texture,
      Scale: scaleY,
      Aspect: scaleX / scaleY,
      UseBackgroundDim: 0,
      UseLineColor: 1,
      UseLineScale: 1
    });
  });
  // bpm变速
  const bpmList = new BpmList(data.BPMList[0].bpm);
  for (const i of data.BPMList) { i.time = i.startTime[0] + i.startTime[1] / i.startTime[2] }
  data.BPMList.sort((a: { time: number }, b: { time: number }) => a.time - b.time).forEach((i, idx, arr) => {
    if (arr[idx + 1]?.time <= 0) return; // 过滤负数
    bpmList.push(i.time < 0 ? 0 : i.time, arr[idx + 1]?.time ?? 1e9, i.bpm);
  });
  for (const i of data.judgeLineList) {
    if (i.zOrder === undefined) i.zOrder = 0;
    if (i.bpmfactor === undefined) i.bpmfactor = 1;
    if (i.father === undefined) i.father = -1;
    if (i.isCover !== 1) warn(1, 'ImplementionWarning', `未兼容isCover=${i.isCover}(可能无法正常显示)\n位于${i.LineId}号判定线`);
    if (i.zOrder !== 0) warn(1, 'ImplementionWarning', `未兼容zOrder=${i.zOrder}(可能无法正常显示)\n位于${i.LineId}号判定线`);
    if (i.bpmfactor !== 1) warn(1, 'ImplementionWarning', `未兼容bpmfactor=${i.bpmfactor}(可能无法正常显示)\n位于${i.LineId}号判定线`);
    const lineRPE = new LineRPE1(bpmList.baseBpm);
    lineRPE.setId(i.LineId);
    if (i.notes) {
      for (const note of i.notes) {
        if (note.alpha === undefined) note.alpha = 255;
        // if (note.above !== 1 && note.above !== 2) ({code:1,name:'NoteSideWarning',message:`检测到非法方向:${note.above}(将被视为2)\n位于:"${JSON.stringify(note)}"`});
        if (note.isFake !== 0) warn(1, 'FakeNoteWarning', `检测到FakeNote(可能无法正常显示)\n位于:"${JSON.stringify(note)}"`);
        if (note.size !== 1) warn(1, 'ImplementionWarning', `未兼容size=${note.size}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"`);
        if (note.yOffset !== 0) warn(1, 'ImplementionWarning', `未兼容yOffset=${note.yOffset}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"`);
        if (note.visibleTime !== 999999) warn(1, 'ImplementionWarning', `未兼容visibleTime=${note.visibleTime}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"`);
        if (note.alpha !== 255) warn(1, 'ImplementionWarning', `未兼容alpha=${note.alpha}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"`);
        const type = [0, 1, 4, 2, 3].indexOf(note.type);
        const time = bpmList.calc2(note.startTime);
        const holdTime = bpmList.calc2(note.endTime) - time;
        const { speed } = note;
        const positionX = note.positionX / 75.375;
        lineRPE.pushNote(type, time, positionX, holdTime, speed, note.above === 1, note.isFake !== 0);
      }
    }
    for (const e of i.eventLayers) {
      if (!e) continue; // 有可能是null
      const layer = new EventLayer1();
      for (const j of e.moveXEvents ?? []) {
        const startTime = bpmList.calc2(j.startTime);
        const endTime = bpmList.calc2(j.endTime);
        const easingResult = getEasingFn(j, startTime, endTime);
        if (easingResult.code === EasingCode.EasingTypeNotSupported && j.easingType !== 1) {
          warn(1, 'EasingTypeWarning', `未知的缓动类型:${j.easingType}(将被视为1)\n位于:"${JSON.stringify(j)}"`);
        }
        if (easingResult.code === EasingCode.StartEqualsEnd && j.easingLeft === j.easingRight) {
          warn(1, 'EasingClipWarning', `检测到easingLeft等于easingRight(将被视为线性)\n位于:"${JSON.stringify(j)}"`);
        }
        layer.pushMoveXEvent(startTime, endTime, j.start, j.end, easingResult.fn);
      }
      for (const j of e.moveYEvents ?? []) {
        const startTime = bpmList.calc2(j.startTime);
        const endTime = bpmList.calc2(j.endTime);
        const easingResult = getEasingFn(j, startTime, endTime);
        if (easingResult.code === EasingCode.EasingTypeNotSupported && j.easingType !== 1) {
          warn(1, 'EasingTypeWarning', `未知的缓动类型:${j.easingType}(将被视为1)\n位于:"${JSON.stringify(j)}"`);
        }
        if (easingResult.code === EasingCode.StartEqualsEnd && j.easingLeft === j.easingRight) {
          warn(1, 'EasingClipWarning', `检测到easingLeft等于easingRight(将被视为线性)\n位于:"${JSON.stringify(j)}"`);
        }
        layer.pushMoveYEvent(startTime, endTime, j.start, j.end, easingResult.fn);
      }
      for (const j of e.rotateEvents ?? []) {
        const startTime = bpmList.calc2(j.startTime);
        const endTime = bpmList.calc2(j.endTime);
        const easingResult = getEasingFn(j, startTime, endTime);
        if (easingResult.code === EasingCode.EasingTypeNotSupported && j.easingType !== 1) {
          warn(1, 'EasingTypeWarning', `未知的缓动类型:${j.easingType}(将被视为1)\n位于:"${JSON.stringify(j)}"`);
        }
        if (easingResult.code === EasingCode.StartEqualsEnd && j.easingLeft === j.easingRight) {
          warn(1, 'EasingClipWarning', `检测到easingLeft等于easingRight(将被视为线性)\n位于:"${JSON.stringify(j)}"`);
        }
        layer.pushRotateEvent(startTime, endTime, j.start, j.end, easingResult.fn);
      }
      for (const j of e.alphaEvents ?? []) {
        const startTime = bpmList.calc2(j.startTime);
        const endTime = bpmList.calc2(j.endTime);
        const easingResult = getEasingFn(j, startTime, endTime);
        if (easingResult.code === EasingCode.EasingTypeNotSupported && j.easingType !== 1) {
          warn(1, 'EasingTypeWarning', `未知的缓动类型:${j.easingType}(将被视为1)\n位于:"${JSON.stringify(j)}"`);
        }
        if (easingResult.code === EasingCode.StartEqualsEnd && j.easingLeft === j.easingRight) {
          warn(1, 'EasingClipWarning', `检测到easingLeft等于easingRight(将被视为线性)\n位于:"${JSON.stringify(j)}"`);
        }
        layer.pushAlphaEvent(startTime, endTime, j.start, j.end, easingResult.fn);
      }
      for (const j of e.speedEvents ?? []) {
        const startTime = bpmList.calc2(j.startTime);
        const endTime = bpmList.calc2(j.endTime);
        layer.pushSpeedEvent(startTime, endTime, j.start, j.end);
      }
      lineRPE.eventLayers.push(layer);
    }
    i.judgeLineRPE = lineRPE;
  }
  for (const i of data.judgeLineList) {
    const lineRPE = i.judgeLineRPE; // TODO: 待优化
    const father = data.judgeLineList[i.father];
    lineRPE.setFather(father?.judgeLineRPE);
  }
  for (const i of data.judgeLineList) {
    const lineRPE = i.judgeLineRPE; // TODO: 待优化
    const judgeLine = lineRPE.format({ onwarning: (msg: string) => warn(1, 'OtherWarning', `${msg}`) });
    result.judgeLineList.push(judgeLine);
    result.numOfNotes += judgeLine.numOfNotes;
  }
  return { data: JSON.stringify(result), messages: warnings, info, line, format };
}
