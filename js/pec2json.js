/**@type {((pos:number)=>number)[]} */
const tween = [null, null,
	pos => Math.sin(pos * Math.PI / 2), //2
	pos => 1 - Math.cos(pos * Math.PI / 2), //3
	pos => 1 - (pos - 1) ** 2, //4
	pos => pos ** 2, //5
	pos => (1 - Math.cos(pos * Math.PI)) / 2, //6
	pos => ((pos *= 2) < 1 ? pos ** 2 : -((pos - 2) ** 2 - 2)) / 2, //7
	pos => 1 + (pos - 1) ** 3, //8
	pos => pos ** 3, //9
	pos => 1 - (pos - 1) ** 4, //10
	pos => pos ** 4, //11
	pos => ((pos *= 2) < 1 ? pos ** 3 : ((pos - 2) ** 3 + 2)) / 2, //12
	pos => ((pos *= 2) < 1 ? pos ** 4 : -((pos - 2) ** 4 - 2)) / 2, //13
	pos => 1 + (pos - 1) ** 5, //14
	pos => pos ** 5, //15
	pos => 1 - 2 ** (-10 * pos), //16
	pos => 2 ** (10 * (pos - 1)), //17
	pos => Math.sqrt(1 - (pos - 1) ** 2), //18
	pos => 1 - Math.sqrt(1 - pos ** 2), //19
	pos => (2.70158 * pos - 1) * (pos - 1) ** 2 + 1, //20
	pos => (2.70158 * pos - 1.70158) * pos ** 2, //21
	pos => ((pos *= 2) < 1 ? (1 - Math.sqrt(1 - pos ** 2)) : (Math.sqrt(1 - (pos - 2) ** 2) + 1)) / 2, //22
	pos => pos < 0.5 ? (14.379638 * pos - 5.189819) * pos ** 2 : (14.379638 * pos - 9.189819) * (pos - 1) ** 2 + 1, //23
	pos => 1 - 2 ** (-10 * pos) * Math.cos(pos * Math.PI / .15), //24
	pos => 2 ** (10 * (pos - 1)) * Math.cos((pos - 1) * Math.PI / .15), //25
	pos => ((pos *= 11) < 4 ? pos ** 2 : pos < 8 ? (pos - 6) ** 2 + 12 : pos < 10 ? (pos - 9) ** 2 + 15 : (pos - 10.5) ** 2 + 15.75) / 16, //26
	pos => 1 - tween[26](1 - pos), //27
	pos => (pos *= 2) < 1 ? tween[26](pos) / 2 : tween[27](pos - 1) / 2 + .5, //28
	pos => pos < 0.5 ? 2 ** (20 * pos - 11) * Math.sin((160 * pos + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * pos) * Math.sin((160 * pos + 1) * Math.PI / 18) //29
];
class LinePec {
	constructor(bpm) {
		this.bpm = 120;
		this.numOfNotes = 0;
		this.numOfNotesAbove = 0;
		this.numOfNotesBelow = 0;
		this.speedEvents = [];
		this.notes = [];
		this.notesAbove = [];
		this.notesBelow = [];
		this.alphaEvents = [];
		this.moveEvents = [];
		this.rotateEvents = [];
		if (!isNaN(bpm)) this.bpm = bpm;
	}
	pushNote(type, time, positionX, holdTime, speed, isAbove, isFake) {
		this.notes.push({ type, time, positionX, holdTime, speed, isAbove, isFake });
	}
	pushSpeedEvent(time, value) {
		this.speedEvents.push({ time, value });
	}
	pushAlphaEvent(startTime, endTime, value, motionType) {
		this.alphaEvents.push({ startTime, endTime, value, motionType });
	}
	pushMoveEvent(startTime, endTime, value, value2, motionType) {
		this.moveEvents.push({ startTime, endTime, value, value2, motionType });
	}
	pushRotateEvent(startTime, endTime, value, motionType) {
		this.rotateEvents.push({ startTime, endTime, value, motionType });
	}
	format() {
		const sortFn = (a, b) => a.time - b.time;
		const sortFn2 = (a, b) => (a.startTime - b.startTime) + (a.endTime - b.endTime); //不单独判断以避免误差
		const result = {
			bpm: this.bpm,
			speedEvents: [],
			numOfNotes: 0,
			numOfNotesAbove: 0,
			numOfNotesBelow: 0,
			notesAbove: [],
			notesBelow: [],
			judgeLineDisappearEvents: [],
			judgeLineMoveEvents: [],
			judgeLineRotateEvents: []
		};
		const pushDisappearEvent = (startTime, endTime, start, end) => {
			result.judgeLineDisappearEvents.push({ startTime, endTime, start, end, start2: 0, end2: 0 });
		};
		const pushMoveEvent = (startTime, endTime, start, end, start2, end2) => {
			result.judgeLineMoveEvents.push({ startTime, endTime, start, end, start2, end2 });
		};
		const pushRotateEvent = (startTime, endTime, start, end) => {
			result.judgeLineRotateEvents.push({ startTime, endTime, start, end, start2: 0, end2: 0 });
		};
		//cv和floorPosition一并处理
		const cvp = this.speedEvents.sort(sortFn);
		let s1 = 0;
		for (let i = 0; i < cvp.length; i++) {
			const startTime = Math.max(cvp[i].time, 0);
			const endTime = i < cvp.length - 1 ? cvp[i + 1].time : 1e9;
			const value = cvp[i].value;
			const floorPosition = s1;
			s1 += (endTime - startTime) * value / this.bpm * 1.875;
			s1 = Math.fround(s1);
			result.speedEvents.push({ startTime, endTime, value, floorPosition });
		}
		for (const i of this.notes.sort(sortFn)) {
			const time = i.time;
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
				floorPosition: Math.fround(v1 + v2 * v3 / this.bpm * 1.875),
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
		//整合motionType
		let dt = 0;
		let d1 = 0;
		for (const e of this.alphaEvents.sort(sortFn2)) {
			pushDisappearEvent(dt, e.startTime, d1, d1);
			if (tween[e.motionType]) {
				const t1 = e.value - d1;
				let x1 = 0;
				let x2 = 0;
				for (let i = e.startTime; i < e.endTime; i++) {
					x1 = x2;
					x2 = tween[e.motionType]((i + 1 - e.startTime) / (e.endTime - e.startTime));
					pushDisappearEvent(i, i + 1, d1 + x1 * t1, d1 + x2 * t1);
				}
			} else if (e.motionType) pushDisappearEvent(e.startTime, e.endTime, d1, e.value);
			dt = e.endTime;
			d1 = e.value;
		}
		pushDisappearEvent(dt, 1e9, d1, d1);
		//
		let mt = 0;
		let m1 = 0;
		let m2 = 0;
		for (const e of this.moveEvents.sort(sortFn2)) {
			pushMoveEvent(mt, e.startTime, m1, m1, m2, m2);
			if (e.motionType !== 1) {
				const t1 = e.value - m1;
				const t2 = e.value2 - m2;
				let x1 = 0;
				let x2 = 0;
				for (let i = e.startTime; i < e.endTime; i++) {
					x1 = x2;
					x2 = tween[e.motionType]((i + 1 - e.startTime) / (e.endTime - e.startTime));
					pushMoveEvent(i, i + 1, m1 + x1 * t1, m1 + x2 * t1, m2 + x1 * t2, m2 + x2 * t2);
				}
			} else pushMoveEvent(e.startTime, e.endTime, m1, e.value, m2, e.value2);
			mt = e.endTime;
			m1 = e.value;
			m2 = e.value2;
		}
		pushMoveEvent(mt, 1e9, m1, m1, m2, m2);
		//
		let rt = 0;
		let r1 = 0;
		for (const e of this.rotateEvents.sort(sortFn2)) {
			pushRotateEvent(rt, e.startTime, r1, r1);
			if (e.motionType !== 1) {
				const t1 = e.value - r1;
				let x1 = 0;
				let x2 = 0;
				for (let i = e.startTime; i < e.endTime; i++) {
					x1 = x2;
					x2 = tween[e.motionType]((i + 1 - e.startTime) / (e.endTime - e.startTime));
					pushRotateEvent(i, i + 1, r1 + x1 * t1, r1 + x2 * t1);
				}
			} else pushRotateEvent(e.startTime, e.endTime, r1, e.value);
			rt = e.endTime;
			r1 = e.value;
		}
		pushRotateEvent(rt, 1e9, r1, r1);
		//
		return result;
	}
}
/**
 * @typedef {object} BpmEvent
 * @property {number} start 开始拍数
 * @property {number} end 结束拍数
 * @property {number} bpm BPM值
 * @property {number} value 累积绝对时间(min)
 */
class BpmList {
	constructor(baseBpm) {
		this.baseBpm = Number(baseBpm) || 120;
		this.accTime = 0;
		/** @type {BpmEvent[]} */
		this.list = []; //存放bpm变速事件
	}
	push(start, end, bpm) {
		const value = this.accTime;
		this.list.push({ start, end, bpm, value });
		this.accTime += (end - start) / bpm;
	}
	calc(beat) { //将pec时间转换为pgr时间
		let time = 0;
		for (const i of this.list) {
			if (beat > i.end) continue;
			if (beat < i.start) break;
			time = Math.round(((beat - i.start) / i.bpm + i.value) * this.baseBpm * 32);
		}
		return time;
	}
}
/**
 * @param {string} pec 
 * @param {string} filename 
 */
function parse(pec, filename) {
	const data = pec.split(/\s+/); //切分pec文本
	const data2 = { offset: 0, bpmList: [], notes: [], lines: [] };
	const result = { formatVersion: 3, offset: 0, numOfNotes: 0, judgeLineList: [] };
	const warnings = []; //
	let ptr = 0;
	data2.offset = isNaN(data[ptr]) ? 0 : Number(data[ptr++]);
	while (ptr < data.length) {
		const command = data[ptr++];
		if (command === '') continue;
		if (command === 'bp') {
			const time = Number(data[ptr++]);
			const bpm = Number(data[ptr++]);
			data2.bpmList.push({ time, bpm });
		} else if (command[0] === 'n') {
			if (!'1234'.includes(command[1])) throw new Error('Unsupported Command: ' + command);
			const cmd = {};
			const type = command[1];
			cmd.type = Number(type);
			cmd.lineId = Number(data[ptr++]);
			cmd.time = Number(data[ptr++]);
			cmd.time2 = '2'.includes(type) ? Number(data[ptr++]) : cmd.time;
			cmd.offsetX = Number(data[ptr++]);
			cmd.isAbove = Number(data[ptr++]);
			cmd.isFake = Number(data[ptr++]);
			cmd.text = 'n' + Object.values(cmd).join(' ');
			cmd.speed = (data[ptr++] || '')[0] === '#' ? Number(data[ptr++]) : (ptr--, 1);
			cmd.size = (data[ptr++] || '')[0] === '&' ? Number(data[ptr++]) : (ptr--, 1);
			data2.notes.push(cmd);
		} else if (command[0] === 'c') {
			if (!'vpdamrf'.includes(command[1])) throw new Error('Unsupported Command: ' + command);
			const cmd = {};
			const type = command[1];
			cmd.type = type;
			cmd.lineId = Number(data[ptr++]);
			cmd.time = Number(data[ptr++]);
			if ('v'.includes(type)) cmd.speed = Number(data[ptr++]);
			cmd.time2 = 'mrf'.includes(type) ? Number(data[ptr++]) : cmd.time;
			if ('pm'.includes(type)) cmd.offsetX = Number(data[ptr++]);
			if ('pm'.includes(type)) cmd.offsetY = Number(data[ptr++]);
			if ('dr'.includes(type)) cmd.rotation = Number(data[ptr++]);
			if ('af'.includes(type)) cmd.alpha = Number(data[ptr++]);
			if ('mr'.includes(type)) cmd.motionType = Number(data[ptr++]);
			cmd.text = 'c' + Object.values(cmd).join(' ');
			if ('pdaf'.includes(type)) cmd.motionType = 1;
			data2.lines.push(cmd);
		} else throw new Error('Unexpected Command: ' + command);
	}
	result.offset = data2.offset / 1e3 - 0.175; //v18x固定延迟
	//bpm变速
	if (!data2.bpmList.length) throw new Error('Invalid pec file');
	const bpmList = new BpmList(data2.bpmList[0].bpm); //qwq
	data2.bpmList.sort((a, b) => a.time - b.time).forEach((i, idx, arr) => {
		if (arr[idx + 1] && arr[idx + 1].time <= 0) return; //过滤负数
		bpmList.push(i.time < 0 ? 0 : i.time, arr[idx + 1] ? arr[idx + 1].time : 1e9, i.bpm);
	});
	//note和判定线事件
	const linesPec = [];
	for (const i of data2.notes) {
		const type = [0, 1, 4, 2, 3].indexOf(i.type);
		const time = bpmList.calc(i.time);
		const holdTime = bpmList.calc(i.time2) - time;
		const speed = isNaN(i.speed) ? 1 : i.speed;
		if (!linesPec[i.lineId]) linesPec[i.lineId] = new LinePec(bpmList.baseBpm);
		linesPec[i.lineId].pushNote(type, time, i.offsetX / 115.2, holdTime, speed, i.isAbove === 1, i.isFake !== 0); //102.4
		// if (i.isAbove !== 1 && i.isAbove !== 2) warnings.push(`检测到非法方向:${i.isAbove}(将被视为2)\n位于:"${i.text}"\n来自${filename}`);
		if (i.isFake !== 0) warnings.push(`检测到FakeNote(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`);
		if (i.size !== 1) warnings.push(`检测到异常Note(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`);
	}
	const isMotion = i => tween[i] || i === 1;
	for (const i of data2.lines) {
		const t1 = bpmList.calc(i.time);
		const t2 = bpmList.calc(i.time2);
		if (t1 > t2) {
			warnings.push(`检测到开始时间大于结束时间(将禁用此事件)\n位于:"${i.text}"\n来自${filename}`);
			continue;
		}
		if (!linesPec[i.lineId]) linesPec[i.lineId] = new LinePec(bpmList.baseBpm);
		//变速
		if (i.type === 'v') {
			linesPec[i.lineId].pushSpeedEvent(t1, i.speed / 7.0); //6.0??
		}
		//不透明度
		if (i.type === 'a' || i.type === 'f') {
			linesPec[i.lineId].pushAlphaEvent(t1, t2, Math.max(i.alpha / 255, 0), i.motionType); //暂不支持alpha值扩展
			if (i.alpha < 0) warnings.push(`检测到负数Alpha:${i.alpha}(将被视为0)\n位于:"${i.text}"\n来自${filename}`);
		}
		//移动
		if (i.type === 'p' || i.type === 'm') {
			linesPec[i.lineId].pushMoveEvent(t1, t2, i.offsetX / 2048, i.offsetY / 1400, isMotion(i.motionType) ? i.motionType : 1);
			if (!isMotion(i.motionType)) warnings.push(`未知的缓动类型:${i.motionType}(将被视为1)\n位于:"${i.text}"\n来自${filename}`);
		}
		//旋转
		if (i.type === 'd' || i.type === 'r') {
			linesPec[i.lineId].pushRotateEvent(t1, t2, -i.rotation, isMotion(i.motionType) ? i.motionType : 1);
			if (!isMotion(i.motionType)) warnings.push(`未知的缓动类型:${i.motionType}(将被视为1)\n位于:"${i.text}"\n来自${filename}`);
		}
	}
	for (const i of linesPec) {
		const judgeLine = i.format();
		result.judgeLineList.push(judgeLine);
		result.numOfNotes += judgeLine.numOfNotes;
	}
	return { data: JSON.stringify(result), messages: warnings };
}
/**
 * @typedef {object} LineEvent
 * @property {number} startTime
 * @property {number} endTime
 * @property {number} start
 * @property {number} end
 * @property {number} [easingType]
 * @property {number} [easingLeft]
 * @property {number} [easingRight]
 * @property {number} [delta]
 * 
 * @param {LineEvent[]} ls
 * @param {LineEvent} le
 */
function pushLineEvent(ls, le) {
	const { startTime, endTime, start, end, easingType = 1, easingLeft = 0, easingRight = 1 } = le;
	const delta = (end - start) / (endTime - startTime);
	//插入之前考虑事件时间的相互关系
	for (let i = ls.length - 1; i >= 0; i--) {
		const e = ls[i];
		if (e.endTime < startTime) { //相离：补全空隙
			ls[i + 1] = { startTime: e.endTime, endTime: startTime, start: e.end, end: e.end, delta: 0 };
			break;
		}
		if (e.startTime === startTime) { //相切：直接截断
			ls.length = i;
			break;
		}
		if (e.startTime < startTime) { //相交：截断交点以后的部分
			e.end = e.start + (startTime - e.startTime) * e.delta;
			e.endTime = startTime;
			e.delta = (e.end - e.start) / (startTime - e.startTime);
			ls.length = i + 1;
			break;
		}
	}
	//插入新事件
	if (easingType === 1 || start === end) ls.push({ startTime, endTime, start, end, delta });
	else { //暂未考虑开始时间大于结束时间的情况
		const eHead = tween[easingType](easingLeft);
		const eTail = tween[easingType](easingRight);
		const eSpeed = (easingRight - easingLeft) / (endTime - startTime);
		const eDelta = (eTail - eHead) / (end - start);
		let v1 = 0;
		let v2 = 0;
		for (let j = startTime; j < endTime; j++) {
			v1 = v2;
			v2 = (tween[easingType]((j + 1 - startTime) * eSpeed + easingLeft) - eHead) / eDelta;
			ls.push({ startTime: j, endTime: j + 1, start: start + v1, end: start + v2, delta: v2 - v1 });
		}
	}
}
/** @param {LineEvent[]} le */
function toSpeedEvent(le) {
	const result = [];
	for (const i of le) {
		const { startTime, endTime, start, end } = i;
		result.push({ time: startTime, value: start });
		if (start !== end) { //暂未考虑开始时间大于结束时间的情况
			const t1 = (end - start) / (endTime - startTime);
			for (let j = startTime; j < endTime; j++) {
				const x = j + 1 - startTime;
				result.push({ time: j + 1, value: start + x * t1 });
			}
		}
	}
	return result;
}
/**
 * @param {LineEvent[]} e 
 * @param {number} t 
 * @param {boolean} d
 */
function getEventsValue(e, t, d) {
	let result = e[0] ? e[0].start : 0;
	for (const i of e) {
		const { startTime, endTime, start, end, delta } = i;
		if (t < startTime) break;
		if (d && t === startTime) break;
		if (t >= endTime) result = end;
		else result = start + (t - startTime) * delta;
	}
	return result;
}
/**
 * @param {LineEvent[]} e 
 * @param {number} t 
 * @param {boolean} d
 */
function getMoveValue(e, t, d) {
	let result = e[0] ? e[0].start : 0;
	let result2 = e[0] ? e[0].start2 : 0;
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
/**
 * @param {LineEvent[]} e 
 * @param {number} t 
 * @param {boolean} d
 */
function getRotateValue(e, t, d) {
	let result = e[0] ? e[0].start : 0;
	for (const i of e) {
		const { startTime, endTime, start, end } = i;
		if (t < startTime) break;
		if (d && t === startTime) break;
		if (t >= endTime) result = end;
		else result = start + (t - startTime) * (end - start) / (endTime - startTime);
	}
	return result;
}
/**
 * @param {LineEvent[]} xe
 * @param {LineEvent[]} ye
 */
function combineXYEvents(xe, ye) {
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
/** @param {LineEvent[][]} es */
function combineMultiEvents(es) {
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
		const start = es.reduce((i, e) => i + getEventsValue(e, startTime, false), 0);
		const end = es.reduce((i, e) => i + getEventsValue(e, endTime, true), 0);
		le.push({ startTime, endTime, start, end, delta: (end - start) / (endTime - startTime) });
	}
	return le;
}
/**
 * @param {LineRPE} child
 * @param {LineRPE} father
 */
function mergeFather(child, father) {
	const moveEvents = [];
	const splits = [];
	for (const i of father.moveEvents) splits.push(i.startTime, i.endTime);
	for (const i of father.rotateEvents) splits.push(i.startTime, i.endTime);
	for (const i of child.moveEvents) splits.push(i.startTime, i.endTime);
	splits.sort((a, b) => a - b);
	for (let i = splits[0]; i < splits[splits.length - 1]; i++) {
		const startTime = i;
		const endTime = i + 1;
		if (startTime === endTime) continue;
		//计算父级移动和旋转
		const [fatherX, fatherY] = getMoveValue(father.moveEvents, startTime, false);
		const fatherR = getRotateValue(father.rotateEvents, startTime, false) * -Math.PI / 180;
		const [fatherX2, fatherY2] = getMoveValue(father.moveEvents, endTime, true);
		const fatherR2 = getRotateValue(father.rotateEvents, endTime, true) * -Math.PI / 180;
		//计算子级移动
		const [childX, childY] = getMoveValue(child.moveEvents, startTime, false);
		const [childX2, childY2] = getMoveValue(child.moveEvents, endTime, true);
		//坐标转换
		const start = fatherX + childX * Math.cos(fatherR) - childY * Math.sin(fatherR);
		const end = fatherX2 + childX2 * Math.cos(fatherR2) - childY2 * Math.sin(fatherR2);
		const start2 = fatherY + childX * Math.sin(fatherR) + childY * Math.cos(fatherR);
		const end2 = fatherY2 + childX2 * Math.sin(fatherR2) + childY2 * Math.cos(fatherR2);
		moveEvents.push({ startTime, endTime, start, end, start2, end2 })
	}
	child.moveEvents = moveEvents;
}
class EventLayer {
	constructor() {
		this.moveXEvents = [];
		this.moveYEvents = [];
		this.rotateEvents = [];
		this.alphaEvents = [];
		this.speedEvents = [];
	}
	pushMoveXEvent(startTime, endTime, start, end, easingType, easingLeft, easingRight) {
		this.moveXEvents.push({ startTime, endTime, start, end, easingType, easingLeft, easingRight });
	}
	pushMoveYEvent(startTime, endTime, start, end, easingType, easingLeft, easingRight) {
		this.moveYEvents.push({ startTime, endTime, start, end, easingType, easingLeft, easingRight });
	}
	pushRotateEvent(startTime, endTime, start, end, easingType, easingLeft, easingRight) {
		this.rotateEvents.push({ startTime, endTime, start, end, easingType, easingLeft, easingRight });
	}
	pushAlphaEvent(startTime, endTime, start, end, easingType, easingLeft, easingRight) {
		this.alphaEvents.push({ startTime, endTime, start, end, easingType, easingLeft, easingRight });
	}
	pushSpeedEvent(startTime, endTime, start, end) {
		this.speedEvents.push({ startTime, endTime, start, end });
	}
}
class LineRPE {
	constructor(bpm) {
		this.bpm = 120;
		this.notes = [];
		this.eventLayers = [];
		if (!isNaN(bpm)) this.bpm = bpm;
	}
	pushNote(type, time, positionX, holdTime, speed, isAbove, isFake) {
		this.notes.push({ type, time, positionX, holdTime, speed, isAbove, isFake });
	}
	setId(id = NaN) {
		this.id = id;
	}
	/** @param {LineRPE} fatherLine */
	setFather(fatherLine) {
		this.father = fatherLine;
	}
	preset() {
		const sortFn2 = (a, b) => a.startTime - b.startTime;
		const events = [];
		for (const e of this.eventLayers) {
			const moveXEvents = [];
			const moveYEvents = [];
			const rotateEvents = [];
			const alphaEvents = [];
			const speedEvents = [];
			for (const i of e.moveXEvents.sort(sortFn2)) pushLineEvent(moveXEvents, i);
			for (const i of e.moveYEvents.sort(sortFn2)) pushLineEvent(moveYEvents, i);
			for (const i of e.rotateEvents.sort(sortFn2)) pushLineEvent(rotateEvents, i);
			for (const i of e.alphaEvents.sort(sortFn2)) pushLineEvent(alphaEvents, i);
			for (const i of e.speedEvents.sort(sortFn2)) pushLineEvent(speedEvents, i);
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
	fitFather(stack = [], onwarning = console.warn) {
		if (!this.settled) this.preset();
		if (stack.includes(this)) {
			onwarning(`检测到循环继承：${stack.concat(this).map(i => i.id).join('->')}(对应的father将被视为-1)`);
			stack.map(i => i.setFather(null));
			return;
		}
		if (this.father) {
			this.father.fitFather(stack.concat(this), onwarning);
			if (!this.father) return;
			if (!this.merged) mergeFather(this, this.father);
			this.merged = true;
		}
	}
	format({ onwarning = console.warn } = {}) {
		this.fitFather([], onwarning);
		const result = {
			bpm: this.bpm,
			speedEvents: [],
			numOfNotes: 0,
			numOfNotesAbove: 0,
			numOfNotesBelow: 0,
			notesAbove: [],
			notesBelow: [],
			judgeLineDisappearEvents: [],
			judgeLineMoveEvents: [],
			judgeLineRotateEvents: []
		};
		for (const i of this.moveEvents) result.judgeLineMoveEvents.push({
			startTime: i.startTime,
			endTime: i.endTime,
			start: (i.start + 675) / 1350,
			end: (i.end + 675) / 1350,
			start2: (i.start2 + 450) / 900,
			end2: (i.end2 + 450) / 900
		});
		for (const i of this.rotateEvents) result.judgeLineRotateEvents.push({
			startTime: i.startTime,
			endTime: i.endTime,
			start: -i.start,
			end: -i.end,
			start2: 0,
			end2: 0
		});
		for (const i of this.alphaEvents) result.judgeLineDisappearEvents.push({
			startTime: i.startTime,
			endTime: i.endTime,
			start: Math.max(0, i.start / 255),
			end: Math.max(0, i.end / 255),
			start2: 0,
			end2: 0
		});
		//添加floorPosition
		let floorPos = 0;
		const speedEvents = this.speedEvents;
		for (let i = 0; i < speedEvents.length; i++) {
			const startTime = Math.max(speedEvents[i].time, 0);
			const endTime = i < speedEvents.length - 1 ? speedEvents[i + 1].time : 1e9;
			const value = speedEvents[i].value * 11 / 45;
			const floorPosition = floorPos;
			floorPos += (endTime - startTime) * value / this.bpm * 1.875;
			floorPos = Math.fround(floorPos);
			result.speedEvents.push({ startTime, endTime, value, floorPosition });
		}
		//处理notes
		const sortFn = (a, b) => a.time - b.time;
		for (const i of this.notes.sort(sortFn)) {
			const time = i.time;
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
				floorPosition: Math.fround(v1 + v2 * v3 / this.bpm * 1.875),
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

function parseRPE(pec, filename) {
	const data = JSON.parse(pec);
	const meta = data.META || data;
	if (!meta && !meta.RPEVersion) throw new Error('Invalid rpe file');
	const result = { formatVersion: 3, offset: 0, numOfNotes: 0, judgeLineList: [] };
	const warnings = [];
	warnings.push(`RPE谱面兼容建设中...\n检测到RPE版本:${meta.RPEVersion}\n来自${filename}`);
	//谱面信息
	const info = {};
	info.Chart = filename;
	info.Music = meta.song;
	info.Image = meta.background;
	info.Name = meta.name;
	info.Artist = meta.composer;
	info.Charter = meta.charter;
	info.Level = meta.level;
	result.offset = meta.offset / 1e3;
	//判定线贴图
	const line = [];
	data.judgeLineList.forEach((i, index) => {
		i.LineId = index;
		const texture = String(i.Texture).replace(/\0/g, '');
		if (texture === 'line.png') return;
		const extended = i.extended || {};
		let scaleX = extended.scaleXEvents ? extended.scaleXEvents[extended.scaleXEvents.length - 1].end : 1;
		let scaleY = extended.scaleYEvents ? extended.scaleYEvents[extended.scaleYEvents.length - 1].end : 1;
		line.push({
			Chart: filename,
			LineId: index,
			Image: texture,
			Scale: scaleY,
			Aspect: scaleX / scaleY,
			UseBackgroundDim: 0,
			UseLineColor: 1,
			UseLineScale: 1,
		});
	});
	//bpm变速
	const bpmList = new BpmList(data.BPMList[0].bpm);
	for (const i of data.BPMList) i.time = i.startTime[0] + i.startTime[1] / i.startTime[2];
	data.BPMList.sort((a, b) => a.time - b.time).forEach((i, idx, arr) => {
		if (arr[idx + 1] && arr[idx + 1].time <= 0) return; //过滤负数
		bpmList.push(i.time < 0 ? 0 : i.time, arr[idx + 1] ? arr[idx + 1].time : 1e9, i.bpm);
	});
	for (const i of data.judgeLineList) {
		if (i.zOrder === undefined) i.zOrder = 0;
		if (i.bpmfactor === undefined) i.bpmfactor = 1;
		if (i.father === undefined) i.father = -1;
		if (i.isCover !== 1) warnings.push(`未兼容isCover=${i.isCover}(可能无法正常显示)\n位于${i.LineId}号判定线\n来自${filename}`);
		if (i.zOrder !== 0) warnings.push(`未兼容zOrder=${i.zOrder}(可能无法正常显示)\n位于${i.LineId}号判定线\n来自${filename}`);
		if (i.bpmfactor !== 1) warnings.push(`未兼容bpmfactor=${i.bpmfactor}(可能无法正常显示)\n位于${i.LineId}号判定线\n来自${filename}`);
		const lineRPE = new LineRPE(bpmList.baseBpm);
		lineRPE.setId(i.LineId);
		if (i.notes) {
			for (const note of i.notes) {
				if (note.alpha === undefined) note.alpha = 255;
				// if (note.above !== 1 && note.above !== 2) warnings.push(`检测到非法方向:${note.above}(将被视为2)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				if (note.isFake !== 0) warnings.push(`检测到FakeNote(可能无法正常显示)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				if (note.size !== 1) warnings.push(`未兼容size=${note.size}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				if (note.yOffset !== 0) warnings.push(`未兼容yOffset=${note.yOffset}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				if (note.visibleTime !== 999999) warnings.push(`未兼容visibleTime=${note.visibleTime}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				if (note.alpha !== 255) warnings.push(`未兼容alpha=${note.alpha}(可能无法正常显示)\n位于:"${JSON.stringify(note)}"\n来自${filename}`);
				const type = [0, 1, 4, 2, 3].indexOf(note.type);
				const time = bpmList.calc(note.startTime[0] + note.startTime[1] / note.startTime[2]);
				const holdTime = bpmList.calc(note.endTime[0] + note.endTime[1] / note.endTime[2]) - time;
				const speed = note.speed;
				const positionX = note.positionX / 75.375;
				lineRPE.pushNote(type, time, positionX, holdTime, speed, note.above === 1, note.isFake !== 0);
			}
		}
		for (const e of i.eventLayers) {
			if (!e) continue; //有可能是null
			const layer = new EventLayer;
			for (const j of (e.moveXEvents || [])) {
				if (j.linkgroup === undefined) j.linkgroup = 0;
				if (j.linkgroup !== 0) warnings.push(`未兼容linkgroup=${j.linkgroup}(可能无法正常显示)\n位于:"${JSON.stringify(j)}"\n来自${filename}`);
				const startTime = bpmList.calc(j.startTime[0] + j.startTime[1] / j.startTime[2]);
				const endTime = bpmList.calc(j.endTime[0] + j.endTime[1] / j.endTime[2]);
				layer.pushMoveXEvent(startTime, endTime, j.start, j.end, j.easingType, j.easingLeft, j.easingRight);
			}
			for (const j of (e.moveYEvents || [])) {
				if (j.linkgroup === undefined) j.linkgroup = 0;
				if (j.linkgroup !== 0) warnings.push(`未兼容linkgroup=${j.linkgroup}(可能无法正常显示)\n位于:"${JSON.stringify(j)}"\n来自${filename}`);
				const startTime = bpmList.calc(j.startTime[0] + j.startTime[1] / j.startTime[2]);
				const endTime = bpmList.calc(j.endTime[0] + j.endTime[1] / j.endTime[2]);
				layer.pushMoveYEvent(startTime, endTime, j.start, j.end, j.easingType, j.easingLeft, j.easingRight);
			}
			for (const j of (e.rotateEvents || [])) {
				if (j.linkgroup === undefined) j.linkgroup = 0;
				if (j.linkgroup !== 0) warnings.push(`未兼容linkgroup=${j.linkgroup}(可能无法正常显示)\n位于:"${JSON.stringify(j)}"\n来自${filename}`);
				const startTime = bpmList.calc(j.startTime[0] + j.startTime[1] / j.startTime[2]);
				const endTime = bpmList.calc(j.endTime[0] + j.endTime[1] / j.endTime[2]);
				layer.pushRotateEvent(startTime, endTime, j.start, j.end, j.easingType, j.easingLeft, j.easingRight);
			}
			for (const j of (e.alphaEvents || [])) {
				if (j.linkgroup === undefined) j.linkgroup = 0;
				if (j.linkgroup !== 0) warnings.push(`未兼容linkgroup=${j.linkgroup}(可能无法正常显示)\n位于:"${JSON.stringify(j)}"\n来自${filename}`);
				const startTime = bpmList.calc(j.startTime[0] + j.startTime[1] / j.startTime[2]);
				const endTime = bpmList.calc(j.endTime[0] + j.endTime[1] / j.endTime[2]);
				layer.pushAlphaEvent(startTime, endTime, j.start, j.end, j.easingType, j.easingLeft, j.easingRight);
			}
			for (const j of (e.speedEvents || [])) {
				if (j.linkgroup === undefined) j.linkgroup = 0;
				if (j.linkgroup !== 0) warnings.push(`未兼容linkgroup=${j.linkgroup}(可能无法正常显示)\n位于:"${JSON.stringify(j)}"\n来自${filename}`);
				const startTime = bpmList.calc(j.startTime[0] + j.startTime[1] / j.startTime[2]);
				const endTime = bpmList.calc(j.endTime[0] + j.endTime[1] / j.endTime[2]);
				layer.pushSpeedEvent(startTime, endTime, j.start, j.end);
			}
			lineRPE.eventLayers.push(layer);
		}
		i.judgeLineRPE = lineRPE;
	}
	for (const i of data.judgeLineList) {
		/** @type {LineRPE} */
		const lineRPE = i.judgeLineRPE; //qwq
		const father = data.judgeLineList[i.father];
		if (father) lineRPE.setFather(father.judgeLineRPE);
	}
	for (const i of data.judgeLineList) {
		/** @type {LineRPE} */
		const lineRPE = i.judgeLineRPE; //qwq
		const judgeLine = lineRPE.format({
			onwarning: msg => warnings.push(`${msg}\n来自${filename}`),
		});
		result.judgeLineList.push(judgeLine);
		result.numOfNotes += judgeLine.numOfNotes;
	}
	return { data: JSON.stringify(result), messages: warnings, info: info, line: line };
}
//读取info.txt
function info(text) {
	const lines = String(text).split(/\r?\n/);
	const result = [];
	let current = {};
	for (const i of lines) {
		if (i.startsWith('#')) {
			if (Object.keys(current).length) result.push(current);
			current = {};
		} else {
			let [key, value] = i.split(/:(.+)/).map(i => i.trim());
			if (key === 'Song') key = 'Music';
			if (key === 'Picture') key = 'Image';
			if (key) current[key] = value;
		}
	}
	if (Object.keys(current).length) result.push(current);
	return result;
}
export default { parse, parseRPE, info };