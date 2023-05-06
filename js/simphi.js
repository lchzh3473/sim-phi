/**
 * @typedef {Object} NoteExtends
 * @property {number} type
 * @property {number} time
 * @property {number} positionX
 * @property {number} holdTime
 * @property {number} speed
 * @property {number} floorPosition
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} alpha
 * @property {number} realTime
 * @property {number} realHoldTime
 * @property {JudgeLine} line
 * @property {number} lineId
 * @property {number} noteId
 * @property {number} isAbove
 * @property {string} name
 * @property {number} isMulti
 * @property {NoteExtends[]} nearNotes
 * @property {number} cosr
 * @property {number} sinr
 * @property {number} projectX
 * @property {number} projectY
 * @property {number} visible
 * @property {number} showPoint
 * @property {number} badTime
 * @property {number} holdStatus
 * @property {number} holdTapTime
 * @property {boolean} holdBroken
 * @property {number} status
 * @property {boolean} scored
 * @property {number} statOffset
 * @property {number} frameCount
 *
 * @typedef {Object} JudgelineExtends
 * @property {number} cosr
 * @property {number} sinr
 * @property {number} offsetX
 * @property {number} offsetY
 * @property {number} alpha
 * @property {number} lineId
 * @property {boolean} imageD
 * @property {boolean} imageU
 * @property {number} imageS
 * @property {number} imageW
 * @property {number} imageA
 * @property {number} imageH
 * @property {ImageBitmap[]} imageL
 * @property {boolean} imageC
 */
class Stat {
	constructor() {
		this.level = 0;
		this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0];
		this.combos = [0, 0, 0, 0, 0];
		this.cumDisp = 0;
		this.curDisp = 0;
		this.numDisp = 0;
		this.maxcombo = 0;
		this.combo = 0;
	}
	get good() {
		return this.noteRank[7] + this.noteRank[3];
	}
	get bad() {
		return this.noteRank[6] + this.noteRank[2];
	}
	get great() {
		return this.noteRank[5] + this.noteRank[1];
	}
	get perfect() {
		return this.noteRank[4] + this.great;
	}
	get all() {
		return this.perfect + this.good + this.bad;
	}
	get scoreNum() {
		const a = 1e6 * (this.perfect * 0.9 + this.good * 0.585 + this.maxcombo * 0.1) / this.numOfNotes;
		return isFinite(a) ? a : 0;
	}
	get scoreStr() {
		const a = this.scoreNum.toFixed(0);
		return '0'.repeat(a.length < 7 ? 7 - a.length : 0) + a;
	}
	get accNum() {
		const a = (this.perfect + this.good * 0.65) / this.all;
		return isFinite(a) ? a : 1;
	}
	get accStr() {
		return (100 * this.accNum).toFixed(2) + '\uff05';
	}
	get avgDispStr() {
		const a = Math.trunc(this.cumDisp / this.numDisp * 1e3) || 0;
		return `${a > 0 ? '+' : ''}${a.toFixed(0)}ms`;
	}
	get curDispStr() {
		const a = Math.trunc(this.curDisp * 1e3);
		return `${a > 0 ? '+' : ''}${a.toFixed(0)}ms`;
	}
	get lineStatus() {
		if (this.bad) return 0;
		if (this.good) return 3;
		return 1;
	}
	get rankStatus() {
		const a = Math.round(this.scoreNum);
		if (a >= 1e6) return 0;
		if (a >= 9.6e5) return 1;
		if (a >= 9.2e5) return 2;
		if (a >= 8.8e5) return 3;
		if (a >= 8.2e5) return 4;
		if (a >= 7e5) return 5;
		return 6;
	}
	get localData() {
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = this.level.toString(36).slice(-1);
		return l1 + l2 + l3;
	}
	getData(isAuto, speed = '') {
		const s1 = this.data[this.id].slice(0, 3);
		const s2 = this.data[this.id].slice(3, 7);
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = this.level.toString(36).slice(-1);
		const a = (parseInt(s2, 32) - 40672).toFixed(0);
		const scoreBest = '0'.repeat(a.length < 7 ? 7 - a.length : 0) + a;
		if (!isAuto) this.data[this.id] = (s1 > l1 ? s1 : l1) + (s2 > l2 ? s2 : l2) + l3;
		const arr = [];
		for (const i in this.data) arr.push(i + this.data[i]);
		localStorage.setItem(`phi-${speed}`, arr.sort(() => Math.random() - 0.5).join(''));
		const pbj = {
			newBestColor: s2 < l2 ? '#18ffbf' : '#fff',
			newBestStr: s2 < l2 ? 'NEW BEST' : 'BEST',
			scoreBest: scoreBest,
			scoreDelta: (s2 > l2 ? '- ' : '+ ') + Math.abs(scoreBest - this.scoreStr),
			textAboveColor: '#65fe43',
			textAboveStr: '  ( Speed {SPEED}x )',
			textBelowColor: '#fe4365',
			textBelowStr: 'AUTO PLAY'
		};
		if (isAuto) return Object.assign(pbj, { newBestColor: '#fff', newBestStr: 'BEST', scoreDelta: '' });
		if (this.lineStatus === 1) return Object.assign(pbj, { textBelowStr: 'ALL  PERFECT', textBelowColor: '#ffc500' });
		if (this.lineStatus === 3) return Object.assign(pbj, { textBelowStr: 'FULL  COMBO', textBelowColor: '#00bef1' });
		return Object.assign(pbj, { textBelowStr: '' });
	}
	reset(numOfNotes, id, speed = '') {
		const key = `phi-${speed}`;
		this.numOfNotes = Number(numOfNotes) || 0;
		this.combo = 0;
		this.maxcombo = 0;
		this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0]; //4:PM,5:PE,1:PL,7:GE,3:GL,6:BE,2:BL
		this.combos = [0, 0, 0, 0, 0]; //不同种类note实时连击次数
		this.cumDisp = 0;
		this.curDisp = 0;
		this.numDisp = 0;
		this.data = {};
		if (speed === '' && localStorage.getItem('phi')) {
			localStorage.setItem(key, localStorage.getItem('phi'));
			localStorage.removeItem('phi');
		}
		if (localStorage.getItem(key) === null) localStorage.setItem(key, ''); //初始化存储
		const str = localStorage.getItem(key);
		for (let i = 0; i < Math.floor(str.length / 40); i++) {
			const data = str.slice(i * 40, i * 40 + 40);
			this.data[data.slice(0, 32)] = data.slice(-8);
		}
		if (id) {
			if (!this.data[id]) this.data[id] = this.localData;
			this.id = id;
		}
	}
	addCombo(status, type) {
		this.noteRank[status]++;
		this.combo = status % 4 === 2 ? 0 : this.combo + 1;
		if (this.combo > this.maxcombo) this.maxcombo = this.combo;
		this.combos[0]++;
		this.combos[type]++;
	}
	addDisp(disp) {
		this.curDisp = disp;
		this.cumDisp += disp;
		this.numDisp++;
	}
}
class Renderer {
	constructor(stage) {
		if (!(stage instanceof HTMLDivElement)) throw new Error('Not a container');
		this.stage = stage;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d', { alpha: false }); //游戏界面(alpha:false会使Firefox显示异常/需要验证)
		this.canvasos = document.createElement('canvas'); //绘制游戏主界面(OffscreenCanvas会使Safari崩溃)
		this.ctxos = this.canvasos.getContext('2d');
		this.stage.appendChild(this.canvas);
		this.canvas.style.cssText = ';position:absolute;top:0px;left:0px;right:0px;bottom:0px';
		this.isFull = false;
		console.log('Hello, Phi\x67ros Simulator!');
		//qwq
		this.speed = 1;
		// this.config = {};
		this.chart = {};
		// this.music = {};
		// this.background = {};
		// this.width = 1920;
		// this.height = 1080;
		this.lineScale = 57.6;
		this.noteScale = 1; //note缩放设定值
		this.noteScaleRatio = 8e3; //note缩放比率，由noteScale计算而来
		this.brightness = 0.6;
		// this.songName = '';
		// this.chartLevel = '';
		// this.illustrator = '';
		// this.chartDesign = '';
		// this.feedback = true;
		// this.imageBlur = true;
		this.multiHint = true;
		// this.hitSound = true;
		// this.anchorPoint = false;
		// this.coloredLine = true;
		// this.perfectLine = '#feffa9';
		// this.goodLine = '#a2eeff';
		// this.perfectNote = '#ffeca0';
		// this.goodNote = '#b4e1ff';
		// this.badNote = '#6c4343';
		this.playMode = 1; //0:game,1:auto,2:hyper,3:auto&hyper
		this.musicVolume = 1;
		this.soundVolume = 1;
		// this.showTransition = true;
		// this.chartOffset = 0;
		this._mirrorType = 0;
		this.enableFR = false;
		this.enableVP = false;
		//qwq
		this.chart = null;
		this.bgImage = null;
		this.bgImageBlur = null;
		this.bgMusic = null;
		this.bgVideo = null;
		/** @type {JudgelineExtends[]} */
		this.lines = [];
		/** @type {NoteExtends[]} */
		this.notes = [];
		/** @type {NoteExtends[]} */
		this.taps = [];
		/** @type {NoteExtends[]} */
		this.drags = [];
		/** @type {NoteExtends[]} */
		this.flicks = [];
		/** @type {NoteExtends[]} */
		this.holds = [];
		/** @type {JudgelineExtends[]} */
		this.linesReversed = [];
		/** @type {NoteExtends[]} */
		this.notesReversed = [];
		/** @type {NoteExtends[]} */
		this.tapsReversed = [];
		/** @type {NoteExtends[]} */
		this.dragsReversed = [];
		/** @type {NoteExtends[]} */
		this.flicksReversed = [];
		/** @type {NoteExtends[]} */
		this.holdsReversed = [];
		/** @type {NoteExtends[]} */
		this.tapholds = [];
		//qwq2
		this._setLowResFactor(1);
		this.resizeCanvas();
	}
	init(options) {
		/*const _this = this;
		Object.assign(_this, options);*/
	}
	//config
	setNoteScale(num) {
		this.noteScale = Number(num) || 1;
		this.noteScaleRatio = this.canvasos.width * this.noteScale / 8080; //note、特效缩放
	}
	_setLowResFactor(num) {
		this.lowResFactor = num * self.devicePixelRatio;
	}
	setLowResFactor(num) {
		this._setLowResFactor(Number(num) || 1);
		this._resizeCanvas();
	}
	_resizeCanvas() {
		const { canvas, canvasos, width, height } = this;
		const widthLowRes = width * this.lowResFactor;
		const heightLowRes = height * this.lowResFactor;
		canvas.width = widthLowRes;
		canvas.height = heightLowRes;
		canvasos.width = Math.min(widthLowRes, heightLowRes * 16 / 9);
		canvasos.height = heightLowRes;
		this.wlen = canvasos.width / 2;
		this.hlen = canvasos.height / 2;
		this.mirrorView();
		this.setNoteScale(this.noteScale);
		this.lineScale = canvasos.width > canvasos.height * 0.75 ? canvasos.height / 18.75 : canvasos.width / 14.0625; //判定线、文字缩放
	}
	resizeCanvas() {
		const { clientWidth: width, clientHeight: height } = this.stage;
		if (this.width === width && this.height === height) return;
		this.width = width;
		this.height = height;
		this.canvas.style.cssText += `;width:${width}px;height:${height}px`; //只有inset还是会溢出
		this._resizeCanvas();
	}
	mirrorView(code = this._mirrorType) {
		const n = this._mirrorType = 3 & code;
		this.transformView(1 & n ? -1 : 1, 2 & n ? -1 : 1, 0, 0);
	}
	transformView(scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0) {
		const { canvasos } = this;
		const xa = canvasos.width * scaleX;
		const xb = (canvasos.width - xa) * 0.5;
		const ya = -canvasos.height * scaleY;
		const yb = (canvasos.height - ya) * 0.5;
		const ra = -Math.sign(scaleX * scaleY) * Math.PI / 180;
		const rb = scaleY > 0 ? 0 : Math.PI;
		const tx = Math.sign(scaleY) * xa * 0.05625;
		const ty = Math.sign(scaleY) * -ya * 0.6; //控制note流速
		this.matX = x => xb + xa * (x - offsetX);
		this.matY = y => yb + ya * (y - offsetY);
		this.matR = r => rb + ra * r;
		this.scaleX = tx;
		this.scaleY = ty;
	}
	//note预处理
	prerenderChart(chart) {
		this.lines.length = 0;
		this.notes.length = 0;
		this.taps.length = 0;
		this.drags.length = 0;
		this.flicks.length = 0;
		this.holds.length = 0;
		this.tapholds.length = 0;
		const chartNew = new Chart(chart);
		let maxTime = 0;
		//添加realTime
		const addRealTime = (events, bpm) => {
			for (const i of events) {
				i.startRealTime = i.startTime / bpm * 1.875;
				i.endRealTime = i.endTime / bpm * 1.875;
				if (i.startTime > 1 - 1e6 && i.startRealTime > maxTime) maxTime = i.startRealTime;
				if (i.endTime < 1e9 && i.endRealTime > maxTime) maxTime = i.endRealTime;
			}
		};
		//向Renderer添加Note
		/** @param {NoteExtends} note */
		const addNote = (note, beat32, line, noteId, isAbove) => {
			note.offsetX = 0;
			note.offsetY = 0;
			note.alpha = 0;
			note.realTime = note.time * beat32;
			note.realHoldTime = note.holdTime * beat32;
			note.line = line;
			note.lineId = line.lineId;
			note.noteId = noteId;
			note.isAbove = isAbove;
			note.name = `${line.lineId}${isAbove ? '+' : '-'}${noteId}${'?tdhf'[note.type]}`;
			this.notes.push(note);
			if (note.type === 1) this.taps.push(note);
			else if (note.type === 2) this.drags.push(note);
			else if (note.type === 3) this.holds.push(note);
			else if (note.type === 4) this.flicks.push(note);
			if (note.type === 1 || note.type === 3) this.tapholds.push(note);
		};
		const sortNote = (a, b) => a.realTime - b.realTime || a.lineId - b.lineId || a.noteId - b.noteId;
		//优化events
		chartNew.judgeLineList.forEach((i, lineId) => i.lineId = lineId);
		for (const i of chartNew.judgeLineList) {
			i.bpm *= this.speed;
			i.offsetX = 0;
			i.offsetY = 0;
			i.alpha = 0;
			i.rotation = 0;
			i.positionY = 0; //临时过渡用
			i.speedEvents = normalizeSpeedEvent(i.speedEvents);
			i.judgeLineDisappearEvents = normalizeLineEvent(i.judgeLineDisappearEvents);
			i.judgeLineMoveEvents = normalizeLineEvent(i.judgeLineMoveEvents);
			i.judgeLineRotateEvents = normalizeLineEvent(i.judgeLineRotateEvents);
			addRealTime(i.speedEvents, i.bpm);
			addRealTime(i.judgeLineDisappearEvents, i.bpm);
			addRealTime(i.judgeLineMoveEvents, i.bpm);
			addRealTime(i.judgeLineRotateEvents, i.bpm);
			this.lines.push(i); //qwq可以定义新类避免函数在循环里定义
			i.notesAbove.forEach((j, noteId) => addNote(j, 1.875 / i.bpm, i, noteId, true));
			i.notesBelow.forEach((j, noteId) => addNote(j, 1.875 / i.bpm, i, noteId, false));
		}
		this.notes.sort(sortNote);
		this.taps.sort(sortNote);
		this.drags.sort(sortNote);
		this.holds.sort(sortNote);
		this.flicks.sort(sortNote);
		this.notesReversed = this.notes.slice().reverse();
		this.tapsReversed = this.taps.slice().reverse();
		this.dragsReversed = this.drags.slice().reverse();
		this.holdsReversed = this.holds.slice().reverse();
		this.flicksReversed = this.flicks.slice().reverse();
		this.linesReversed = this.lines.slice().reverse();
		this.tapholds.sort(sortNote);
		//多押标记
		const timeOfMulti = {};
		for (const i of this.notes) timeOfMulti[i.realTime.toFixed(6)] = timeOfMulti[i.realTime.toFixed(6)] ? 2 : 1;
		for (const i of this.notes) i.isMulti = timeOfMulti[i.realTime.toFixed(6)] === 2;
		//分析邻近Note(0.01s内标记，用于预处理Flick,TapHold重叠判定)
		for (let i = 0; i < this.flicks.length; i++) {
			const note = this.flicks[i];
			note.nearNotes = [];
			for (let j = i + 1; j < this.flicks.length; j++) {
				const note2 = this.flicks[j];
				if (Math.fround(note2.realTime - note.realTime) > 0.01) break;
				note.nearNotes.push(note2);
			}
		}
		for (let i = 0; i < this.tapholds.length; i++) {
			const note = this.tapholds[i];
			note.nearNotes = [];
			for (let j = i + 1; j < this.tapholds.length; j++) {
				const note2 = this.tapholds[j];
				if (Math.fround(note2.realTime - note.realTime) > 0.01) break;
				note.nearNotes.push(note2);
			}
		}
		this.chart = chartNew;
		console.log(maxTime);
	}
	updateByTime(timeChart) {
		for (const line of this.lines) {
			for (const i of line.judgeLineDisappearEvents) {
				if (timeChart < i.startRealTime) break;
				if (timeChart > i.endRealTime) continue;
				const dt = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
				line.alpha = i.start + (i.end - i.start) * dt;
			}
			for (const i of line.judgeLineMoveEvents) {
				if (timeChart < i.startRealTime) break;
				if (timeChart > i.endRealTime) continue;
				const dt = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
				line.offsetX = this.matX(i.start + (i.end - i.start) * dt);
				line.offsetY = this.matY(i.start2 + (i.end2 - i.start2) * dt);
			}
			for (const i of line.judgeLineRotateEvents) {
				if (timeChart < i.startRealTime) break;
				if (timeChart > i.endRealTime) continue;
				const dt = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
				line.rotation = this.matR(i.start + (i.end - i.start) * dt);
				line.cosr = Math.cos(line.rotation);
				line.sinr = Math.sin(line.rotation);
			}
			for (const i of line.speedEvents) {
				if (timeChart < i.startRealTime) break;
				if (timeChart > i.endRealTime) continue;
				line.positionY = (timeChart - i.startRealTime) * i.value * this.speed + (this.enableFR ? i.floorPosition2 : i.floorPosition);
			}
			const realgetY = i => {
				if (i.type !== 3) return (i.floorPosition - line.positionY) * i.speed;
				if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed * this.speed;
				return i.floorPosition - line.positionY;
			};
			const getY = i => {
				if (!i.badtime) return realgetY(i);
				if (performance.now() - i.badtime > 500) delete i.badtime;
				if (!i.badY) i.badY = realgetY(i);
				return i.badY;
			};
			const setAlpha = (i, dx, dy) => {
				i.projectX = line.offsetX + dx * i.cosr;
				i.offsetX = i.projectX + dy * i.sinr;
				i.projectY = line.offsetY + dx * i.sinr;
				i.offsetY = i.projectY - dy * i.cosr;
				i.visible = (i.offsetX - this.wlen) ** 2 + (i.offsetY - this.hlen) ** 2 < (this.wlen * 1.23625 + this.hlen + this.scaleY * i.realHoldTime * i.speed * this.speed) ** 2; //Math.hypot实测性能较低
				i.showPoint = false;
				if (i.badtime);
				else if (i.realTime > timeChart) {
					i.showPoint = true;
					i.alpha = dy <= -1e-3 * this.scaleY || this.enableVP && realgetY(i) * 0.6 > 2 ? 0 : i.type === 3 && i.speed === 0 ? 0 : 1;
				} else {
					i.frameCount = i.frameCount == null ? 0 : i.frameCount + 1;
					if (i.type === 3) {
						i.showPoint = true;
						i.alpha = i.speed === 0 ? 0 : i.status % 4 === 2 ? 0.45 : 1;
					} else i.alpha = Math.max(1 - (timeChart - i.realTime) / 0.16, 0); //过线后0.16s消失
				}
			};
			for (const i of line.notesAbove) {
				i.cosr = line.cosr;
				i.sinr = line.sinr;
				setAlpha(i, this.scaleX * i.positionX, this.scaleY * getY(i));
			}
			for (const i of line.notesBelow) {
				i.cosr = -line.cosr;
				i.sinr = -line.sinr;
				setAlpha(i, -this.scaleX * i.positionX, this.scaleY * getY(i));
			}
		}
	}
}
class HitEvent {
	/**
	 * @param {'mouse'|'keyboard'|'touch'} type
	 * @param {number|string} id
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	constructor(type, id, offsetX, offsetY) {
		/** @type {string} */
		this.type = type;
		this.id = id;
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isActive = true; //是否标记为按下，若false则可以移除
		this.isTapped = false; //是否触发过Tap判定
		this.isMoving = false; //是否正在移动
		//flick(speed)
		this.lastDeltaX = 0;
		this.lastDeltaY = 0;
		this.nowDeltaX = 0;
		this.nowDeltaY = 0;
		this.deltaTime = 0; //按下时间差
		this.currentTime = performance.now(); //按下时间
		this.flicking = false; //是否触发Flick判定
		this.flicked = false; //是否触发过Flick判定
	}
	/**
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	move(offsetX, offsetY) {
		this.lastDeltaX = this.nowDeltaX;
		this.lastDeltaY = this.nowDeltaY;
		this.nowDeltaX = offsetX - this.offsetX;
		this.nowDeltaY = offsetY - this.offsetY;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		const time = performance.now();
		this.deltaTime = time - this.currentTime;
		this.currentTime = time;
		this.isMoving = true;
		const flickSpeed = (this.nowDeltaX * this.lastDeltaX + this.nowDeltaY * this.lastDeltaY) / Math.sqrt(this.lastDeltaX ** 2 + this.lastDeltaY ** 2) / this.deltaTime;
		if (this.flicking && flickSpeed < 0.50) {
			this.flicking = false;
			this.flicked = false;
		} else if (!this.flicking && flickSpeed > 1.00) this.flicking = true;
	}
}
class HitManager {
	constructor() {
		/** @type {HitEvent[]} */
		this.list = [];
	}
	/**
	 * @param {'mouse'|'keyboard'|'touch'} type
	 * @param {number|string} id
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	activate(type, id, offsetX, offsetY) {
		const { list } = this;
		const idx = list.findIndex(hit => hit.type === type && hit.id === id);
		if (idx !== -1) list.splice(idx, 1);
		list.push(new HitEvent(type, id, offsetX, offsetY));
	}
	/**
	 * @param {'mouse'|'keyboard'|'touch'} type
	 * @param {number|string} id
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	moving(type, id, offsetX, offsetY) {
		const hitEl = this.list.find(hit => hit.type === type && hit.id === id);
		if (hitEl) hitEl.move(offsetX, offsetY);
	}
	/**
	 * @param {'mouse'|'keyboard'|'touch'} type
	 * @param {number|string} id
	 */
	deactivate(type, id) {
		const hitEl = this.list.find(hit => hit.type === type && hit.id === id);
		if (hitEl) hitEl.isActive = false;
	}
	update() {
		const { list } = this;
		for (let i = 0; i < list.length; i++) {
			const hitEl = list[i];
			if (hitEl.isActive) {
				hitEl.isTapped = true;
				hitEl.isMoving = false;
			} else list.splice(i--, 1);
		}
	}
	/**
	 * @param {'mouse'|'keyboard'|'touch'} type
	 */
	clear(type) {
		for (const i of this.list) {
			if (i.type === type) this.deactivate(type, i.id);
		}
	}
}
//qwq
class Chart {
	constructor(chart) {
		chart = chart || {};
		this.formatVersion = parseInt(chart.formatVersion) || 0;
		this.offset = parseFloat(chart.offset) || 0;
		this.numOfNotes = parseInt(chart.numOfNotes) || 0;
		/** @type {JudgeLine[]} */
		this.judgeLineList = Array.isArray(chart.judgeLineList) ? chart.judgeLineList.map(i => new JudgeLine(i)) : [];
	}
}
class JudgeLine {
	constructor(line) {
		line = line || {};
		this.numOfNotes = parseInt(line.numOfNotes) || 0;
		this.numOfNotesAbove = parseInt(line.numOfNotesAbove) || 0;
		this.numOfNotesBelow = parseInt(line.numOfNotesBelow) || 0;
		this.bpm = parseFloat(line.bpm) || 0;
		/** @type {SpeedEvent[]} */
		this.speedEvents = Array.isArray(line.speedEvents) ? line.speedEvents.map(i => new SpeedEvent(i)) : [];
		/** @type {Note[]} */
		this.notesAbove = Array.isArray(line.notesAbove) ? line.notesAbove.map(i => new Note(i)) : [];
		/** @type {Note[]} */
		this.notesBelow = Array.isArray(line.notesBelow) ? line.notesBelow.map(i => new Note(i)) : [];
		/** @type {LineEvent[]} */
		this.judgeLineDisappearEvents = Array.isArray(line.judgeLineDisappearEvents) ? line.judgeLineDisappearEvents.map(i => new LineEvent(i)) : [];
		/** @type {LineEvent[]} */
		this.judgeLineMoveEvents = Array.isArray(line.judgeLineMoveEvents) ? line.judgeLineMoveEvents.map(i => new LineEvent(i)) : [];
		/** @type {LineEvent[]} */
		this.judgeLineRotateEvents = Array.isArray(line.judgeLineRotateEvents) ? line.judgeLineRotateEvents.map(i => new LineEvent(i)) : [];
	}
}
class SpeedEvent {
	constructor(event) {
		event = event || {};
		this.startTime = parseInt(event.startTime) || 0;
		this.endTime = parseInt(event.endTime) || 0;
		this.value = parseFloat(event.value) || 0;
		this.floorPosition = parseFloat(event.floorPosition) || 0;
		this.floorPosition2 = parseFloat(event.floorPosition2) || 0;
	}
}
class Note {
	constructor(note) {
		note = note || {};
		this.type = parseInt(note.type) || 0;
		this.time = parseInt(note.time) || 0;
		this.positionX = parseFloat(note.positionX) || 0;
		this.holdTime = parseInt(note.holdTime) || 0;
		this.speed = parseFloat(note.speed) || 0;
		this.floorPosition = parseFloat(note.floorPosition) || 0;
	}
}
class LineEvent {
	constructor(event) {
		event = event || {};
		this.startTime = parseInt(event.startTime) || 0;
		this.endTime = parseInt(event.endTime) || 0;
		this.start = parseFloat(event.start) || 0;
		this.end = parseFloat(event.end) || 0;
		this.start2 = parseFloat(event.start2) || 0;
		this.end2 = parseFloat(event.end2) || 0;
	}
}
//规范判定线事件
function normalizeLineEvent(events = []) {
	const oldEvents = events.map(i => new LineEvent(i)); //深拷贝
	if (!oldEvents.length) return [new LineEvent({ startTime: -999999, endTime: 1e9 })]; //如果没有事件，添加一个默认事件(以后添加warning)
	const newEvents = [new LineEvent({
		startTime: -999999,
		endTime: 0,
		start: oldEvents[0].start,
		end: oldEvents[0].start,
		start2: oldEvents[0].start2,
		end2: oldEvents[0].start2
	})]; //以1-1e6开头
	oldEvents.push(new LineEvent({
		startTime: oldEvents[oldEvents.length - 1].endTime,
		endTime: 1e9,
		start: oldEvents[oldEvents.length - 1].end,
		end: oldEvents[oldEvents.length - 1].end,
		start2: oldEvents[oldEvents.length - 1].end2,
		end2: oldEvents[oldEvents.length - 1].end2
	})); //以1e9结尾
	for (const i2 of oldEvents) { //保证时间连续性
		if (i2.startTime > i2.endTime) continue;
		const i1 = newEvents[newEvents.length - 1];
		if (i1.endTime > i2.endTime);
		else if (i1.endTime === i2.startTime) newEvents.push(i2);
		else if (i1.endTime < i2.startTime) newEvents.push(new LineEvent({
			startTime: i1.endTime,
			endTime: i2.startTime,
			start: i1.end,
			end: i1.end,
			start2: i1.end2,
			end2: i1.end2
		}), i2);
		else if (i1.endTime > i2.startTime) newEvents.push(new LineEvent({
			startTime: i1.endTime,
			endTime: i2.endTime,
			start: (i2.start * (i2.endTime - i1.endTime) + i2.end * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end: i1.end,
			start2: (i2.start2 * (i2.endTime - i1.endTime) + i2.end2 * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end2: i1.end2
		}));
	}
	//合并相同变化率事件
	const newEvents2 = [newEvents.shift()];
	for (const i2 of newEvents) {
		const i1 = newEvents2[newEvents2.length - 1];
		const d1 = i1.endTime - i1.startTime;
		const d2 = i2.endTime - i2.startTime;
		if (i2.startTime === i2.endTime);
		else if (i1.end === i2.start && i1.end2 === i2.start2 && (i1.end - i1.start) * d2 === (i2.end - i2.start) * d1 && (i1.end2 - i1.start2) * d2 === (i2.end2 - i2.start2) * d1) {
			i1.endTime = i2.endTime;
			i1.end = i2.end;
			i1.end2 = i2.end2;
		} else newEvents2.push(i2);
	}
	return newEvents2;
}
//规范speedEvents
function normalizeSpeedEvent(events = []) {
	const newEvents = [];
	for (const i2 of events) {
		const i1 = newEvents[newEvents.length - 1];
		if (i1 && i1.value === i2.value) i1.endTime = i2.endTime;
		else newEvents.push(new SpeedEvent(i2));
	}
	return newEvents;
}
export default { Stat, Renderer, HitManager };