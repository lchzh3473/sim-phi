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
		if (isAbove !== 1 && isAbove !== 2) console.warn('Warning: Illeagal Note Side: ' + isAbove);
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
			if (i.isAbove === 1) {
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
	/**
	 * @typedef {object} BpmEvent
	 * @property {number} start 开始拍数
	 * @property {number} end 结束拍数
	 * @property {number} bpm BPM值
	 * @property {number} value 累积绝对时间(min)
	 */
	//处理bpm变速
	const bpmEvents = {
		baseBpm: 120,
		accTime: 0,
		/** @type {BpmEvent[]} */
		list: [], //存放bpm变速事件
		push(start, end, bpm) {
			const value = this.accTime;
			this.list.push({ start, end, bpm, value });
			this.accTime += (end - start) / bpm;
		},
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
	if (!data2.bpmList.length) throw new Error('Invalid pec file');
	bpmEvents.baseBpm = data2.bpmList[0].bpm; //qwq
	data2.bpmList.sort((a, b) => a.time - b.time).forEach((i, idx, arr) => {
		if (arr[idx + 1] && arr[idx + 1].time <= 0) return; //过滤负数
		bpmEvents.push(i.time < 0 ? 0 : i.time, arr[idx + 1] ? arr[idx + 1].time : 1e9, i.bpm);
	});
	//处理note和判定线事件
	const linesPec = [];
	for (const i of data2.notes) {
		const type = [0, 1, 4, 2, 3].indexOf(i.type);
		const time = bpmEvents.calc(i.time);
		const holdTime = bpmEvents.calc(i.time2) - time;
		const speed = isNaN(i.speed) ? 1 : i.speed;
		if (!linesPec[i.lineId]) linesPec[i.lineId] = new LinePec(bpmEvents.baseBpm);
		linesPec[i.lineId].pushNote(type, time, i.offsetX / 115.2, holdTime, speed, i.isAbove, i.isFake); //102.4
		if (i.isAbove !== 1 && i.isAbove !== 2) warnings.push(`检测到非法方向:${i.isAbove}(将被视为2)\n位于:"${i.text}"\n来自${filename}`);
		if (i.isFake) warnings.push(`检测到FakeNote(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`);
		if (i.size !== 1) warnings.push(`检测到异常Note(可能无法正常显示)\n位于:"${i.text}"\n来自${filename}`);
	}
	const isMotion = i => tween[i] || i === 1;
	for (const i of data2.lines) {
		const t1 = bpmEvents.calc(i.time);
		const t2 = bpmEvents.calc(i.time2);
		if (t1 > t2) {
			warnings.push(`检测到开始时间大于结束时间(将禁用此事件)\n位于:"${i.text}"\n来自${filename}`);
			continue;
		}
		if (!linesPec[i.lineId]) linesPec[i.lineId] = new LinePec(bpmEvents.baseBpm);
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

function parseRPE(pec, filename) {
	const data = JSON.parse(pec);
	const result = { formatVersion: 3, offset: 0, numOfNotes: 0, judgeLineList: [] };
	console.log(data, filename); //qwq
	const meta = data.META;
	if (!meta && !meta.RPEVersion) throw new Error('Invalid rpe file');
	console.log(meta); //qwq
	const warnings = []; //
	warnings.push(`谱面适配建设中...\nRPE文件版本:${meta.RPEVersion}\n来自${filename}`);
	return { data: JSON.stringify(result), messages: warnings };
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