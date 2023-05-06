export default hook.define({
	name: 'Export',
	description: 'Export Chart as JSON',
	contents: [{
		type: 'command',
		meta: ['/dl', callback]
	}]
});

function callback() {
	if (!hook.app.chart) return hook.toast('请先播放谱面');
	const a = document.createElement('a');
	const text = JSON.stringify(chartify(hook.app.chart));
	a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
	a.download = `chart_${Date.now()}.json`;
	a.click();
}
//导出json
function chartify(json) {
	const newChart = {
		formatVersion: 3,
		offset: json.offset,
		numOfNotes: json.numOfNotes,
		judgeLineList: []
	};
	for (const i of json.judgeLineList) {
		const newLine = {
			numOfNotes: i.numOfNotes,
			numOfNotesAbove: i.numOfNotesAbove,
			numOfNotesBelow: i.numOfNotesBelow,
			bpm: i.bpm,
			speedEvents: [],
			notesAbove: [],
			notesBelow: [],
			judgeLineDisappearEvents: [],
			judgeLineMoveEvents: [],
			judgeLineRotateEvents: []
		};
		for (const j of i.speedEvents) {
			if (j.startTime === j.endTime) continue;
			const newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.value = frix(j.value);
			newEvent.floorPosition = frix(j.floorPosition);
			newLine.speedEvents.push(newEvent);
		}
		for (const j of i.notesAbove) {
			const newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = frix(j.positionX);
			newNote.holdTime = j.holdTime;
			newNote.speed = frix(j.speed);
			newNote.floorPosition = frix(j.floorPosition);
			newLine.notesAbove.push(newNote);
		}
		for (const j of i.notesBelow) {
			const newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = frix(j.positionX);
			newNote.holdTime = j.holdTime;
			newNote.speed = frix(j.speed);
			newNote.floorPosition = frix(j.floorPosition);
			newLine.notesBelow.push(newNote);
		}
		for (const j of i.judgeLineDisappearEvents) {
			if (j.startTime === j.endTime) continue;
			const newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = frix(j.start);
			newEvent.end = frix(j.end);
			newLine.judgeLineDisappearEvents.push(newEvent);
		}
		for (const j of i.judgeLineMoveEvents) {
			if (j.startTime === j.endTime) continue;
			const newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = frix(j.start);
			newEvent.end = frix(j.end);
			newEvent.start2 = frix(j.start2);
			newEvent.end2 = frix(j.end2);
			newLine.judgeLineMoveEvents.push(newEvent);
		}
		for (const j of i.judgeLineRotateEvents) {
			if (j.startTime === j.endTime) continue;
			const newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = frix(j.start);
			newEvent.end = frix(j.end);
			newLine.judgeLineRotateEvents.push(newEvent);
		}
		newChart.judgeLineList.push(newLine);
	}
	return newChart;
}

function frix(num) {
	const qwq = Math.fround(num);
	if (!isFinite(qwq)) return null;
	for (let i = 1; i < 1e3; i++) {
		const str = qwq.toPrecision(i);
		if (Math.fround(str) === qwq) {
			if (str.slice(-1) != 3) return Number(str);
			const str2 = str.slice(0, -1) + 2;
			if (qwq - str2 === str - qwq && Math.fround(str2) === qwq) return Number(str2);
			return Number(str);
		}
	}
}