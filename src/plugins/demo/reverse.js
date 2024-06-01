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
function reverseLineEvent(evt, tb) {
  const start = evt.end;
  evt.end = evt.start;
  evt.start = start;
  const start2 = evt.end2;
  evt.end2 = evt.start2;
  evt.start2 = start2;
  const startTime = tb - evt.endTime;
  evt.endTime = tb - evt.startTime;
  evt.startTime = startTime;
}
function reverseNote(note, tb) {
  note.time = tb - note.time;
  if (note.type === 3) {
    note.speed *= note.holdTime;
    note.holdTime = 1;
  }
}
function reverseSpeedEvent(evt, tb) {
  const startTime = tb - evt.endTime;
  evt.endTime = tb - evt.startTime;
  evt.startTime = startTime;
}
function updateSefp(line) {
  let y = 0;
  line.speedEvents.sort((a, b) => a.startTime - b.startTime);
  for (const evt of line.speedEvents) {
    if (evt.startTime < 0) evt.startTime = 0;
    evt.floorPosition = y;
    y += (evt.endTime - evt.startTime) * evt.value / line.bpm * 1.875;
  }
  line.speedEvents[line.speedEvents.length - 1].endTime = 1e9;
  for (const note of line.notesAbove) {
    let owo = 0;
    let owo2 = 0;
    let owo3 = 0;
    for (const evt of line.speedEvents) {
      if (note.time % 1e9 > evt.endTime) continue;
      if (note.time % 1e9 < evt.startTime) break;
      owo = evt.floorPosition;
      owo2 = evt.value;
      owo3 = note.time % 1e9 - evt.startTime;
    }
    note.floorPosition = owo + owo2 * owo3 / line.bpm * 1.875;
    // if (j.type === 3) j.speed *= owo2;
  }
  for (const note of line.notesBelow) {
    let owo = 0;
    let owo2 = 0;
    let owo3 = 0;
    for (const evt of line.speedEvents) {
      if (note.time % 1e9 > evt.endTime) continue;
      if (note.time % 1e9 < evt.startTime) break;
      owo = evt.floorPosition;
      owo2 = evt.value;
      owo3 = note.time % 1e9 - evt.startTime;
    }
    note.floorPosition = owo + owo2 * owo3 / line.bpm * 1.875;
    // if (j.type === 3) j.speed *= owo2;
  }
}
function updateDe(line) {
  line.judgeLineDisappearEvents.sort((a, b) => a.startTime - b.startTime);
  line.judgeLineMoveEvents.sort((a, b) => a.startTime - b.startTime);
  line.judgeLineRotateEvents.sort((a, b) => a.startTime - b.startTime);
  line.judgeLineDisappearEvents = arrangeLineEvent(line.judgeLineDisappearEvents);
  line.judgeLineMoveEvents = arrangeLineEvent(line.judgeLineMoveEvents);
  line.judgeLineRotateEvents = arrangeLineEvent(line.judgeLineRotateEvents);
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
 * @param {import('@/utils/Chart').Chart} chart json
 * @param {number} duration time/s
 */
export function reverse(chart, duration) {
  const chartNew = chart.duplicate();
  chartNew.offset = -chartNew.offset;
  for (const line of chartNew.judgeLineList) {
    const tb = duration * line.bpm / 1.875;
    for (const evt of line.speedEvents) reverseSpeedEvent(evt, tb);
    for (const note of line.notesAbove) reverseNote(note, tb);
    for (const note of line.notesBelow) reverseNote(note, tb);
    updateSefp(line);
    line.judgeLineDisappearEvents = arrangeLineEvent(line.judgeLineDisappearEvents);
    line.judgeLineMoveEvents = arrangeLineEvent(line.judgeLineMoveEvents);
    line.judgeLineRotateEvents = arrangeLineEvent(line.judgeLineRotateEvents);
    for (const evt of line.judgeLineDisappearEvents) reverseLineEvent(evt, tb);
    for (const evt of line.judgeLineMoveEvents) reverseLineEvent(evt, tb);
    for (const evt of line.judgeLineRotateEvents) reverseLineEvent(evt, tb);
    updateDe(line);
  }
  return chartNew.duplicate(); // 规范判定线事件
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
