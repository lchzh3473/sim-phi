import Type from './Type';
export class SpeedEvent {
  public startTime: number;
  public endTime: number;
  public value: number;
  public constructor(event: Record<string, unknown>) {
    this.startTime = Type.int(event.startTime);
    this.endTime = Type.int(event.endTime);
    this.value = Type.float(event.value);
  }
}
export class Note {
  public type: number;
  public time: number;
  public positionX: number;
  public holdTime: number;
  public speed: number;
  public floorPosition: number;
  public constructor(note: Record<string, unknown>) {
    this.type = Type.int(note.type);
    this.time = Type.int(note.time);
    this.positionX = Type.float(note.positionX);
    this.holdTime = Type.int(note.holdTime);
    this.speed = Type.float(note.speed);
    this.floorPosition = Type.float(note.floorPosition);
  }
}
export class JudgeLineEvent {
  public startTime: number;
  public endTime: number;
  public start: number;
  public end: number;
  public start2: number;
  public end2: number;
  public constructor(event: Record<string, unknown>) {
    this.startTime = Type.int(event.startTime);
    this.endTime = Type.int(event.endTime);
    this.start = Type.float(event.start);
    this.end = Type.float(event.end);
    this.start2 = Type.float(event.start2);
    this.end2 = Type.float(event.end2);
  }
}
export class JudgeLine {
  public numOfNotes: number;
  public numOfNotesAbove: number;
  public numOfNotesBelow: number;
  public bpm: number;
  public speedEvents: SpeedEvent[];
  public notesAbove: Note[];
  public notesBelow: Note[];
  public judgeLineDisappearEvents: JudgeLineEvent[];
  public judgeLineMoveEvents: JudgeLineEvent[];
  public judgeLineRotateEvents: JudgeLineEvent[];
  public constructor(line: Record<string, unknown>) {
    this.numOfNotes = Type.int(line.numOfNotes);
    this.numOfNotesAbove = Type.int(line.numOfNotesAbove);
    this.numOfNotesBelow = Type.int(line.numOfNotesBelow);
    this.bpm = Type.float(line.bpm);
    this.speedEvents = Type.arr(line.speedEvents, SpeedEvent);
    this.notesAbove = Type.arr(line.notesAbove, Note);
    this.notesBelow = Type.arr(line.notesBelow, Note);
    if (line.numOfNotesAbove == null) this.numOfNotesAbove = this.notesAbove.length;
    if (line.numOfNotesBelow == null) this.numOfNotesBelow = this.notesBelow.length;
    if (line.numOfNotes == null) this.numOfNotes = this.numOfNotesAbove + this.numOfNotesBelow;
    this.judgeLineDisappearEvents = Type.arr(line.judgeLineDisappearEvents, JudgeLineEvent);
    this.judgeLineMoveEvents = Type.arr(line.judgeLineMoveEvents, JudgeLineEvent);
    this.judgeLineRotateEvents = Type.arr(line.judgeLineRotateEvents, JudgeLineEvent);
  }
}
export class Chart {
  public formatVersion: number;
  public offset: number;
  public numOfNotes: number;
  public judgeLineList: JudgeLine[];
  public constructor(input?: Record<string, unknown>) {
    const chart = input || {};
    this.formatVersion = Type.int(chart.formatVersion);
    this.offset = Type.float(chart.offset);
    this.numOfNotes = Type.int(chart.numOfNotes);
    this.judgeLineList = Type.arr(chart.judgeLineList, JudgeLine);
    if (chart.numOfNotes == null) this.numOfNotes = this.judgeLineList.reduce((a, b) => a + b.numOfNotes, 0);
  }
  public duplicate(): Chart {
    return Type.obj(this, Chart);
  }
}
interface ChartData {
  data: Chart;
  messages: BetterMessage[];
}
export function structChart(chart: ChartPGS, filename: string): ChartData {
  const result = Type.obj(chart, Chart);
  switch (result.formatVersion) {
    case 1:
      for (const line of result.judgeLineList) {
        for (const evt of line.judgeLineMoveEvents) {
          evt.start2 = evt.start % 1000 / 520;
          evt.end2 = evt.end % 1000 / 520;
          evt.start = Math.floor(evt.start / 1000) / 880;
          evt.end = Math.floor(evt.end / 1000) / 880;
        }
      } // fallthrough
    case 3:
    case 3473:
      break;
    default:
      throw new Error(`Unsupported formatVersion: ${result.formatVersion}`);
  }
  const errors = [];
  const messages: BetterMessage[] = [];
  const numOfLines = result.judgeLineList.length;
  // if (result.offset < 0) throw new Error('Offset must be non-negative');
  // if (result.numOfNotes <= 0) throw new Error('At least one note is required');
  const warn = (code: number, name: string, message: string) => messages.push({ host: 'Core', code, name, message, target: filename });
  if (numOfLines > 100) warn(1, 'LineCountWarning', `Expected at most 100 items in judgeLineList, but got ${numOfLines}`);
  let maxNoteSeconds = 0;
  for (const { bpm, notesAbove, notesBelow } of result.judgeLineList) {
    for (const { type, time, holdTime } of notesAbove) {
      const seconds = (time % 1e9 + (type === 3 && holdTime > 0 ? holdTime : 0)) / bpm * 1.875;
      if (seconds > maxNoteSeconds) maxNoteSeconds = seconds;
    }
    for (const { type, time, holdTime } of notesBelow) {
      const seconds = (time % 1e9 + (type === 3 && holdTime > 0 ? holdTime : 0)) / bpm * 1.875;
      if (seconds > maxNoteSeconds) maxNoteSeconds = seconds;
    }
  }
  for (let i = 0; i < numOfLines; i++) {
    const line = result.judgeLineList[i];
    const subErrors = [];
    if (line.bpm > 0) {
      const maxNoteTime = Math.ceil(maxNoteSeconds * line.bpm / 1.875);
      type KeyOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
      type KeyOfJudgeLine = KeyOfType<JudgeLine, (JudgeLineEvent | SpeedEvent)[]>;
      const checkMaxEventTime = (key: KeyOfJudgeLine) => {
        if (line[key].length) {
          let maxEndTime = 0;
          for (const { endTime } of line[key]) {
            if (endTime > maxEndTime) maxEndTime = endTime;
          }
          if (maxEndTime < maxNoteTime) subErrors.push(`Maximum time for ${key} is too small`);
        } else subErrors.push(`Expected at least 1 item in ${key}`);
      };
      checkMaxEventTime('speedEvents');
      checkMaxEventTime('judgeLineDisappearEvents');
      checkMaxEventTime('judgeLineMoveEvents');
      checkMaxEventTime('judgeLineRotateEvents');
    } else subErrors.push(`Expected bpm > 0, but got ${line.bpm}`);
    if (subErrors.length) errors.push(`JudgeLine ${i}:\n${subErrors.map(e => `  ${e}`).join('\n')}`);
  }
  if (errors.length) throw new Error(`Invalid chart input\n${errors.map(e => `  ${e.split('\n').join('\n  ')}`).join('\n')}`);
  if (!numOfLines) throw new Error('No judge lines available');
  return { data: result, messages };
}
