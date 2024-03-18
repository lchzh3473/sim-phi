export default hook.define({
  name: 'Export',
  description: 'Export Chart as JSON',
  contents: [
    {
      type: 'command',
      meta: ['/dl', callback]
    }
  ]
});
function callback() {
  if (!hook.app.chart) {
    hook.toast('请先播放谱面');
    return;
  }
  const a = document.createElement('a');
  const text = JSON.stringify(chartify(hook.app.chart));
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = `chart_${Date.now()}.json`;
  a.click();
}
/**
 * 导出json
 * @param {ChartPGS} json
 */
function chartify(json) {
  const newChart = {
    formatVersion: 3,
    offset: json.offset,
    numOfNotes: json.numOfNotes,
    judgeLineList: []
  };
  for (const line of json.judgeLineList) {
    /** @type {JudgeLinePGS} */
    const newLine = {
      numOfNotes: line.numOfNotes,
      numOfNotesAbove: line.numOfNotesAbove,
      numOfNotesBelow: line.numOfNotesBelow,
      bpm: line.bpm,
      speedEvents: [],
      notesAbove: [],
      notesBelow: [],
      judgeLineDisappearEvents: [],
      judgeLineMoveEvents: [],
      judgeLineRotateEvents: []
    };
    for (const evt of line.speedEvents) {
      if (evt.startTime === evt.endTime) continue;
      const newEvent = {};
      newEvent.startTime = evt.startTime;
      newEvent.endTime = evt.endTime;
      newEvent.value = frix(evt.value);
      newEvent.floorPosition = frix(evt.floorPosition);
      newLine.speedEvents.push(newEvent);
    }
    for (const note of line.notesAbove) {
      const newNote = {};
      newNote.type = note.type;
      newNote.time = note.time;
      newNote.positionX = frix(note.positionX);
      newNote.holdTime = note.holdTime;
      newNote.speed = frix(note.speed);
      newNote.floorPosition = frix(note.floorPosition);
      newLine.notesAbove.push(newNote);
    }
    for (const note of line.notesBelow) {
      const newNote = {};
      newNote.type = note.type;
      newNote.time = note.time;
      newNote.positionX = frix(note.positionX);
      newNote.holdTime = note.holdTime;
      newNote.speed = frix(note.speed);
      newNote.floorPosition = frix(note.floorPosition);
      newLine.notesBelow.push(newNote);
    }
    for (const evt of line.judgeLineDisappearEvents) {
      if (evt.startTime === evt.endTime) continue;
      const newEvent = {};
      newEvent.startTime = evt.startTime;
      newEvent.endTime = evt.endTime;
      newEvent.start = frix(evt.start);
      newEvent.end = frix(evt.end);
      newLine.judgeLineDisappearEvents.push(newEvent);
    }
    for (const evt of line.judgeLineMoveEvents) {
      if (evt.startTime === evt.endTime) continue;
      const newEvent = {};
      newEvent.startTime = evt.startTime;
      newEvent.endTime = evt.endTime;
      newEvent.start = frix(evt.start);
      newEvent.end = frix(evt.end);
      newEvent.start2 = frix(evt.start2);
      newEvent.end2 = frix(evt.end2);
      newLine.judgeLineMoveEvents.push(newEvent);
    }
    for (const evt of line.judgeLineRotateEvents) {
      if (evt.startTime === evt.endTime) continue;
      const newEvent = {};
      newEvent.startTime = evt.startTime;
      newEvent.endTime = evt.endTime;
      newEvent.start = frix(evt.start);
      newEvent.end = frix(evt.end);
      newLine.judgeLineRotateEvents.push(newEvent);
    }
    newChart.judgeLineList.push(newLine);
  }
  return newChart;
}
function frix(num) {
  const fn = Math.fround(num);
  if (!isFinite(fn)) return null;
  for (let i = 1; i < 1e3; i++) {
    const str = fn.toPrecision(i);
    const nstr = Number(str);
    if (Math.fround(nstr) === fn) {
      if (parseFloat(str.slice(-1)) !== 3) return nstr;
      const nstr2 = parseFloat(str.slice(0, -1) + 2);
      if (fn - nstr2 === nstr - fn && Math.fround(nstr2) === fn) {
        return nstr2;
      }
      return nstr;
    }
  }
  throw new Error('frix error');
}
