type Reviver = Parameters<typeof JSON.parse>[1];
export function structChart(text: string, reviver?: Reviver): Chart {
  const chart = (typeof reviver === 'function' ? JSON.parse(text, reviver) : JSON.parse(text)) as Chart; // test
  if (chart.formatVersion === undefined) throw new Error('Invalid chart file');
  switch (Number(chart.formatVersion) | 0) {
    case 1:
      for (const i of chart.judgeLineList) {
        for (const j of i.judgeLineMoveEvents) {
          j.start2 = j.start % 1000 / 520;
          j.end2 = j.end % 1000 / 520;
          j.start = Math.floor(j.start / 1000) / 880;
          j.end = Math.floor(j.end / 1000) / 880;
        }
      } // fallthrough
    case 3:
      for (const i of chart.judgeLineList) {
        let y = 0;
        let y2 = 0; // float32
        for (const j of i.speedEvents) {
          if (j.startTime < 0) j.startTime = 0;
          j.floorPosition = y;
          j.floorPosition2 = y2;
          y += (j.endTime - j.startTime) / i.bpm * 1.875 * j.value;
          y2 += Math.fround(Math.fround((j.endTime - j.startTime) / i.bpm * 1.875) * j.value);
          y = Math.fround(y);
          y2 = Math.fround(y2);
        }
      } // fallthrough
    case 3473:
      for (const i of chart.judgeLineList) {
        if (i.numOfNotes == null) {
          i.numOfNotes = 0;
          for (const j of i.notesAbove) {
            if (j.type === 1) i.numOfNotes++;
            if (j.type === 2) i.numOfNotes++;
            if (j.type === 3) i.numOfNotes++;
            if (j.type === 4) i.numOfNotes++;
          }
          for (const j of i.notesBelow) {
            if (j.type === 1) i.numOfNotes++;
            if (j.type === 2) i.numOfNotes++;
            if (j.type === 3) i.numOfNotes++;
            if (j.type === 4) i.numOfNotes++;
          }
        }
      }
      if (chart.numOfNotes == null) {
        chart.numOfNotes = 0;
        for (const i of chart.judgeLineList) chart.numOfNotes += i.numOfNotes;
      }
      break;
    default:
      throw new Error(`Unsupported formatVersion: ${chart.formatVersion}`);
  }
  return chart;
}
