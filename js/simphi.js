let energy = 0;
const simphi = {
	Stat: class {
		constructor() {
			this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0];
			this.combos = [0, 0, 0, 0, 0];
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
			const b = 1e6 * (this.noteRank[4] + this.great * 0.65 + this.good * 0.35) / this.numOfNotes;
			return hyperMode.checked ? (isFinite(b) ? b : 0) : (isFinite(a) ? a : 0);
		}
		get scoreStr() {
			const a = this.scoreNum.toFixed(0);
			return ('0').repeat(a.length < 7 ? 7 - a.length : 0) + a;
		}
		get accNum() {
			const a = (this.perfect + this.good * 0.65) / this.all;
			const b = (this.noteRank[4] + this.great * 0.65 + this.good * 0.35) / this.all;
			return hyperMode.checked ? (isFinite(b) ? b : 0) : (isFinite(a) ? a : 0);
		}
		get accStr() {
			return (100 * this.accNum).toFixed(2) + '%';
		}
		get lineStatus() {
			if (this.bad) return 0;
			if (this.good) return 3;
			if (this.great && hyperMode.checked) return 2;
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
			const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
			return l1 + l2 + l3;
		}
		getData(isAuto, speed = '') {
			const s1 = this.data[this.id].slice(0, 3);
			const s2 = this.data[this.id].slice(3, 7);
			const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
			const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
			const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
			const a = (parseInt(s2, 32) - 40672).toFixed(0);
			const scoreBest = ('0').repeat(a.length < 7 ? 7 - a.length : 0) + a;
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
				textAboveStr: `  ( Speed ${app.speed.toFixed(2)}x )`,
				textBelowColor: '#fe4365',
				textBelowStr: 'AUTO PLAY',
			}
			if (app.speed == 1) Object.assign(pbj, { textAboveStr: '' });
			if (isAuto) return Object.assign(pbj, { newBestColor: '#fff', newBestStr: 'BEST', scoreDelta: '' });
			if (this.lineStatus == 1) return Object.assign(pbj, { textBelowStr: 'ALL  PERFECT', textBelowColor: '#ffc500' });
			if (this.lineStatus == 2) return Object.assign(pbj, { textBelowStr: 'ALL  PERFECT', textBelowColor: '#91ff8f' })
			if (this.lineStatus == 3) return Object.assign(pbj, { textBelowStr: 'FULL  COMBO', textBelowColor: '#00bef1' });
			return Object.assign(pbj, { textBelowStr: '' });
		}
		reset(numOfNotes, id, speed = '') {
			const key = `phi-${speed}`;
			this.numOfNotes = Number(numOfNotes) || 0;
			this.combo = 0;
			this.maxcombo = 0;
			this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0]; //4:PM,5:PE,1:PL,7:GE,3:GL,6:BE,2:BL
			this.combos = [0, 0, 0, 0, 0]; //不同种类note实时连击次数
			this.data = {};
			if (speed == '' && localStorage.getItem('phi')) {
				localStorage.setItem(key, localStorage.getItem('phi'));
				localStorage.removeItem('phi');
			}
			if (localStorage.getItem(key) == null) localStorage.setItem(key, ''); //初始化存储
			const str = localStorage.getItem(key);
			for (let i = 0; i < parseInt(str.length / 40); i++) {
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
			this.combo = status % 4 == 2 ? 0 : this.combo + 1;
			if (this.combo > this.maxcombo) this.maxcombo = this.combo;
			this.combos[0]++;
			this.combos[type]++;
			if (qwq[4]) energy++;
			if (this.lineStatus != 1) energy = 0;
		}
	},
	Renderer: class {
		constructor(stage) {
			if (!(stage instanceof HTMLDivElement)) throw new Error('Not a container');
			this.stage = stage;
			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d'); //游戏界面(alpha:false会出现兼容问题)
			this.canvasos = document.createElement('canvas'); //绘制游戏主界面
			this.ctxos = this.canvasos.getContext('2d');
			this.stage.appendChild(this.canvas);
			this.isFull = false;
			console.log('Hello, Phigros Simulator!');
			//qwq
			this.speed = 1;
			this.isJSZip = true;
			this.config = {};
			this.chart = {};
			this.music = {};
			this.background = {};
			this.width = 1920;
			this.height = 1080;
			this.lineScale = 57.6;
			this.noteScale = 1; //note缩放设定值
			this.noteScaleRatio = 8e3; //note缩放比率，由noteScale计算而来
			this.brightness = 0;
			this.songName = '';
			this.chartLevel = '';
			this.illustrator = '';
			this.chartDesign = '';
			this.feedback = true;
			this.imageBlur = true;
			this.multiHint = true;
			this.hitSound = true;
			this.anchorPoint = false;
			this.coloredLine = true;
			this.perfectLine = '#feffa9';
			this.goodLine = '#a2eeff';
			this.perfectNote = '#ffeca0';
			this.goodNote = '#b4e1ff';
			this.badNote = '#6c4343';
			this.playMode = 'autoplay';
			this.showTransition = true;
			this.chartOffset = 0;
			this._mirrorType = 0;
			//qwq
			this.chart = null;
			this.chart2 = null; //qwq
			this.bgImage = null;
			this.bgImageBlur = null;
			this.bgMusic = null;
			this.lines = [];
			this.notes = [];
			this.taps = [];
			this.drags = [];
			this.flicks = [];
			this.holds = [];
			this.reverseholds = [];
			this.tapholds = [];
			//qwq2
			this.wlen = 0;
			this.hlen = 0;
			// this.wlen2 = 0;
			// this.hlen2 = 0;
			// this.transformView(1, 1, 0, 0);
			this.resizeCanvas();
		}
		init(options) {
			/*const _this = this;
			Object.assign(_this, options);*/
		}
		//config
		setNoteScale(num) {
			this.noteScale = Number(num);
			this.resizeCanvas();
		}
		resizeCanvas() {
			const { canvas, canvasos, isFull } = this;
			const AspectRatio = 16 / 9;
			const width = document.documentElement.clientWidth;
			const height = document.documentElement.clientHeight;
			const defaultWidth = Math.min(854, width * 0.8);
			const defaultHeight = defaultWidth / (selectaspectratio.value || 16 / 9);
			const realWidth = Math.floor(isFull ? width : defaultWidth);
			const realHeight = Math.floor(isFull ? height : defaultHeight);
			canvas.style.cssText += `;width:${realWidth}px;height:${realHeight}px`;
			canvas.width = realWidth * devicePixelRatio;
			canvas.height = realHeight * devicePixelRatio;
			canvasos.width = Math.min(realWidth, realHeight * AspectRatio) * devicePixelRatio;
			canvasos.height = realHeight * devicePixelRatio;
			this.wlen = canvasos.width / 2;
			this.hlen = canvasos.height / 2;
			this.mirrorView();
			this.noteScaleRatio = canvasos.width * (this.noteScale || 1) / 8080; //note、特效缩放
			this.lineScale = canvasos.width > canvasos.height * 0.75 ? canvasos.height / 18.75 : canvasos.width / 14.0625; //判定线、文字缩放
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
	},
	//导出json
	chartify(json) {
		const newChart = {
			formatVersion: 3,
			offset: json.offset,
			numOfNotes: json.numOfNotes,
			judgeLineList: [],
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
				judgeLineRotateEvents: [],
			};
			for (const j of i.speedEvents) {
				if (j.startTime == j.endTime) continue;
				let newEvent = {};
				newEvent.startTime = j.startTime;
				newEvent.endTime = j.endTime;
				newEvent.value = Number(j.value.toFixed(6));
				newEvent.floorPosition = Number(j.floorPosition.toFixed(6));
				newLine.speedEvents.push(newEvent);
			}
			for (const j of i.notesAbove) {
				let newNote = {};
				newNote.type = j.type;
				newNote.time = j.time;
				newNote.positionX = Number(j.positionX.toFixed(6));
				newNote.holdTime = j.holdTime;
				newNote.speed = Number(j.speed.toFixed(6));
				newNote.floorPosition = Number(j.floorPosition.toFixed(6));
				newLine.notesAbove.push(newNote);
			}
			for (const j of i.notesBelow) {
				let newNote = {};
				newNote.type = j.type;
				newNote.time = j.time;
				newNote.positionX = Number(j.positionX.toFixed(6));
				newNote.holdTime = j.holdTime;
				newNote.speed = Number(j.speed.toFixed(6));
				newNote.floorPosition = Number(j.floorPosition.toFixed(6));
				newLine.notesBelow.push(newNote);
			}
			for (const j of i.judgeLineDisappearEvents) {
				if (j.startTime == j.endTime) continue;
				let newEvent = {};
				newEvent.startTime = j.startTime;
				newEvent.endTime = j.endTime;
				newEvent.start = Number(j.start.toFixed(6));
				newEvent.end = Number(j.end.toFixed(6));
				newEvent.start2 = Number(j.start2.toFixed(6));
				newEvent.end2 = Number(j.end2.toFixed(6));
				newLine.judgeLineDisappearEvents.push(newEvent);
			}
			for (const j of i.judgeLineMoveEvents) {
				if (j.startTime == j.endTime) continue;
				let newEvent = {};
				newEvent.startTime = j.startTime;
				newEvent.endTime = j.endTime;
				newEvent.start = Number(j.start.toFixed(6));
				newEvent.end = Number(j.end.toFixed(6));
				newEvent.start2 = Number(j.start2.toFixed(6));
				newEvent.end2 = Number(j.end2.toFixed(6));
				newLine.judgeLineMoveEvents.push(newEvent);
			}
			for (const j of i.judgeLineRotateEvents) {
				if (j.startTime == j.endTime) continue;
				let newEvent = {};
				newEvent.startTime = j.startTime;
				newEvent.endTime = j.endTime;
				newEvent.start = Number(j.start.toFixed(6));
				newEvent.end = Number(j.end.toFixed(6));
				newEvent.start2 = Number(j.start2.toFixed(6));
				newEvent.end2 = Number(j.end2.toFixed(6));
				newLine.judgeLineRotateEvents.push(newEvent);
			}
			newChart.judgeLineList.push(newLine);
		}
		return newChart;
	}
}

function frix(num = 0) {
	const qwq = Math.fround(num);
}