interface Chart {
  formatVersion: number;
  offset: number;
  numOfNotes: number;
  judgeLineList: JudgeLine[];
}
interface Note {
  type: number;
  time: number;
  positionX: number;
  holdTime: number;
  speed: number;
  floorPosition: number;
}
interface JudgeLine {
  bpm: number;
  numOfNotes: number;
  numOfNotesAbove: number;
  numOfNotesBelow: number;
  notesAbove: Note[];
  notesBelow: Note[];
  speedEvents: SpeedEvent[];
  judgeLineDisappearEvents: JudgeLineEvent[];
  judgeLineMoveEvents: JudgeLineEvent[];
  judgeLineRotateEvents: JudgeLineEvent[];
}
interface SpeedEvent {
  startTime: number;
  endTime: number;
  value: number;
  floorPosition: number;
  floorPosition2?: number; // float32
  floorPositionMin?: number;
}
interface JudgeLineEvent {
  startTime: number;
  endTime: number;
  start: number;
  end: number;
  start2: number;
  end2: number;
}
