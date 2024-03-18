// 规范判定线事件
function arrangeLineEvent(events) {
  const oldEvents = JSON.parse(JSON.stringify(events)); // 深拷贝
  const newEvents = [
    {
      // 以1-1e6开头
      startTime: 1 - 1e6,
      endTime: 0,
      start: oldEvents[0] ? oldEvents[0].start : 0,
      end: oldEvents[0] ? oldEvents[0].start : 0,
      start2: oldEvents[0] ? oldEvents[0].start2 : 0,
      end2: oldEvents[0] ? oldEvents[0].start2 : 0
    }
  ];
  oldEvents.push({
    // 以1e9结尾
    startTime: 0,
    endTime: 1e9,
    start: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
    end: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
    start2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0,
    end2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0
  });
  for (const i2 of oldEvents) {
    // 保证时间连续性
    const i1 = newEvents[newEvents.length - 1];
    if (i2.startTime > i2.endTime) continue;
    if (i1.endTime > i2.endTime) {
      // i1吃掉i2
    } else if (i1.endTime === i2.startTime) newEvents.push(i2);
    else if (i1.endTime < i2.startTime) {
      newEvents.push({
        startTime: i1.endTime,
        endTime: i2.startTime,
        start: i1.end,
        end: i1.end,
        start2: i1.end2,
        end2: i1.end2
      }, i2);
    } else if (i1.endTime > i2.startTime) {
      newEvents.push({
        startTime: i1.endTime,
        endTime: i2.endTime,
        start: (i2.start * (i2.endTime - i1.endTime) + i2.end * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
        end: i1.end,
        start2: (i2.start2 * (i2.endTime - i1.endTime) + i2.end2 * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
        end2: i1.end2
      });
    }
  }
  // 合并相同变化率事件
  const newEvents2 = [newEvents.shift()];
  for (const i2 of newEvents) {
    const i1 = newEvents2[newEvents2.length - 1];
    const d1 = i1.endTime - i1.startTime;
    const d2 = i2.endTime - i2.startTime;
    if (i2.startTime === i2.endTime) {
      // 忽略0长度事件
    } else if (i1.end === i2.start && i1.end2 === i2.start2 && (i1.end - i1.start) * d2 === (i2.end - i2.start) * d1 && (i1.end2 - i1.start2) * d2 === (i2.end2 - i2.start2) * d1) {
      i1.endTime = i2.endTime;
      i1.end = i2.end;
      i1.end2 = i2.end2;
    } else newEvents2.push(i2);
  }
  return JSON.parse(JSON.stringify(newEvents2));
}
class JudgeLineEvent {
  constructor(start, end, start2, end2, startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.start = start;
    this.end = end;
    this.start2 = start2;
    this.end2 = end2;
  }
}
class Note {
  constructor(type, time, positionX, holdTime, speed) {
    this.type = type;
    this.time = time;
    this.positionX = positionX;
    this.holdTime = holdTime;
    this.speed = speed;
    this.floorPosition = 0;
  }
}
class SpeedEvent {
  constructor(value, startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.floorPosition = 0;
    this.value = value;
  }
}
class JudgeLine {
  constructor() {
    this.numOfNotes = 0;
    this.numOfNotesAbove = 0;
    this.numOfNotesBelow = 0;
    this.bpm = 120;
    /** @type {SpeedEvent[]} */
    this.speedEvents = [];
    /** @type {Note[]} */
    this.notesAbove = [];
    /** @type {Note[]} */
    this.notesBelow = [];
    /** @type {JudgeLineEvent[]} */
    this.judgeLineDisappearEvents = [];
    /** @type {JudgeLineEvent[]} */
    this.judgeLineMoveEvents = [];
    /** @type {JudgeLineEvent[]} */
    this.judgeLineRotateEvents = [];
  }
  updateSefp() {
    let y = 0;
    this.speedEvents.sort((a, b) => a.startTime - b.startTime);
    for (const evt of this.speedEvents) {
      if (evt.startTime < 0) evt.startTime = 0;
      evt.floorPosition = y;
      y += (evt.endTime - evt.startTime) * evt.value / this.bpm * 1.875;
    }
    this.speedEvents[this.speedEvents.length - 1].endTime = 1e9;
    for (const note of this.notesAbove) {
      let owo = 0;
      let owo2 = 0;
      let owo3 = 0;
      for (const evt of this.speedEvents) {
        if (note.time % 1e9 > evt.endTime) continue;
        if (note.time % 1e9 < evt.startTime) break;
        owo = evt.floorPosition;
        owo2 = evt.value;
        owo3 = note.time % 1e9 - evt.startTime;
      }
      note.floorPosition = owo + owo2 * owo3 / this.bpm * 1.875;
      // if (j.type === 3) j.speed *= owo2;
    }
    for (const note of this.notesBelow) {
      let owo = 0;
      let owo2 = 0;
      let owo3 = 0;
      for (const evt of this.speedEvents) {
        if (note.time % 1e9 > evt.endTime) continue;
        if (note.time % 1e9 < evt.startTime) break;
        owo = evt.floorPosition;
        owo2 = evt.value;
        owo3 = note.time % 1e9 - evt.startTime;
      }
      note.floorPosition = owo + owo2 * owo3 / this.bpm * 1.875;
      // if (j.type === 3) j.speed *= owo2;
    }
  }
  updateDe() {
    this.judgeLineDisappearEvents.sort((a, b) => a.startTime - b.startTime);
    this.judgeLineMoveEvents.sort((a, b) => a.startTime - b.startTime);
    this.judgeLineRotateEvents.sort((a, b) => a.startTime - b.startTime);
    this.judgeLineDisappearEvents = arrangeLineEvent(this.judgeLineDisappearEvents);
    this.judgeLineMoveEvents = arrangeLineEvent(this.judgeLineMoveEvents);
    this.judgeLineRotateEvents = arrangeLineEvent(this.judgeLineRotateEvents);
  }
}
class Chart {
  constructor() {
    this.formatVersion = 3;
    this.offset = 0;
    this.numOfNotes = 0;
    /** @type {JudgeLine[]} */
    this.judgeLineList = []; // Array.from(Array(24), () => new JudgeLine);
  }
}
/** @type {Map<AudioBuffer|null,boolean>|null} */
let kfcFkXqsVw50 = null;
hook.before.set('kfcFkXqsVw50', () => {
  if (!(kfcFkXqsVw50 instanceof Map)) return;
  const /** @type {AudioBuffer|null} */ bgm = hook.bgms.get(hook.selectbgm.value).audio;
  if (bgm != null) for (let i = 0; i < bgm.numberOfChannels; i++) bgm.getChannelData(i).reverse();
  kfcFkXqsVw50.set(bgm, hook.awawa = !kfcFkXqsVw50.get(bgm));
  hook.modify = hook.awawa ? a => reverse(a, hook.app.duration) : a => a;
});
/**
 *
 * @param {Chart} chart json
 * @param {number} duration time/s
 */
export function reverse(chart, duration) {
  const chartNew = new Chart();
  chartNew.offset = -chart.offset;
  for (const line of chart.judgeLineList) {
    const judgeLine = new JudgeLine();
    const tb = duration * line.bpm / 1.875;
    judgeLine.bpm = line.bpm;
    for (const evt of line.speedEvents) judgeLine.speedEvents.push(new SpeedEvent(evt.value, tb - evt.endTime, tb - evt.startTime));
    for (const note of line.notesAbove) {
      if (note.type === 3) judgeLine.notesAbove.push(new Note(note.type, tb - note.time, note.positionX, 1, note.speed * note.holdTime));
      else judgeLine.notesAbove.push(new Note(note.type, tb - note.time, note.positionX, note.holdTime, note.speed));
      judgeLine.numOfNotesAbove++;
    }
    for (const note of line.notesBelow) {
      if (note.type === 3) judgeLine.notesBelow.push(new Note(note.type, tb - note.time, note.positionX, 1, note.speed * note.holdTime));
      else judgeLine.notesBelow.push(new Note(note.type, tb - note.time, note.positionX, note.holdTime, note.speed));
      judgeLine.numOfNotesBelow++;
    }
    judgeLine.numOfNotes += judgeLine.numOfNotesAbove + judgeLine.numOfNotesBelow;
    chartNew.numOfNotes += judgeLine.numOfNotes;
    //
    judgeLine.updateSefp();
    line.judgeLineDisappearEvents = arrangeLineEvent(line.judgeLineDisappearEvents);
    line.judgeLineMoveEvents = arrangeLineEvent(line.judgeLineMoveEvents);
    line.judgeLineRotateEvents = arrangeLineEvent(line.judgeLineRotateEvents);
    for (const evt of line.judgeLineDisappearEvents) judgeLine.judgeLineDisappearEvents.push(new JudgeLineEvent(evt.end, evt.start, evt.end2, evt.start2, tb - evt.endTime, tb - evt.startTime));
    for (const evt of line.judgeLineMoveEvents) judgeLine.judgeLineMoveEvents.push(new JudgeLineEvent(evt.end, evt.start, evt.end2, evt.start2, tb - evt.endTime, tb - evt.startTime));
    for (const evt of line.judgeLineRotateEvents) judgeLine.judgeLineRotateEvents.push(new JudgeLineEvent(evt.end, evt.start, evt.end2, evt.start2, tb - evt.endTime, tb - evt.startTime));
    judgeLine.updateDe();
    chartNew.judgeLineList.push(judgeLine);
  }
  return JSON.parse(JSON.stringify(chartNew)); // 规范判定线事件
}
/**
 * @param {HTMLElement} elem
 * @param {()=>any} activeFn
 * @param {()=>any} doneFn
 */
function longPress(elem, activeFn, doneFn, failFn) {
  let timer = null;
  elem.addEventListener('mousedown', awaIn);
  elem.addEventListener('mouseup', awaOut);
  elem.addEventListener('mouseleave', awaOut);
  elem.addEventListener('touchstart', awaIn, { passive: true });
  elem.addEventListener('touchend', awaOut);
  elem.addEventListener('touchcancel', awaOut);
  function awaIn() {
    timer = requestAnimationFrame(awaIn);
    if (activeFn()) {
      cancelAnimationFrame(timer);
      doneFn();
      elem.removeEventListener('mousedown', awaIn);
      elem.removeEventListener('mouseup', awaOut);
      elem.removeEventListener('mouseleave', awaOut);
      elem.removeEventListener('touchstart', awaIn);
      elem.removeEventListener('touchend', awaOut);
      elem.removeEventListener('touchcancel', awaOut);
    }
  }
  function awaOut() {
    cancelAnimationFrame(timer);
    failFn();
  }
}
(function() {
  const tt = document.querySelector('.title');
  if (!(tt instanceof HTMLElement)) return;
  let pressTime = NaN;
  const revolveWorld = () => {
    if (isNaN(pressTime)) pressTime = performance.now();
    tt.style.cssText += `;filter:hue-rotate(${(performance.now() - pressTime) / 4}deg)`;
    if (performance.now() - pressTime > 3473 && Math.random() * 401 < 1) return 1;
    return 0;
  };
  longPress(tt, revolveWorld, () => {
    hook.fireModal('<p>Tip</p>', '<p>Reverse Mode is on...</p>');
    kfcFkXqsVw50 = new Map();
    setInterval(revolveWorld, 20);
  }, () => {
    tt.style.cssText += ';filter:hue-rotate(0deg);';
    pressTime = NaN;
  });
}());
