'use strict';
const time2Str = time => `${parseInt(time / 60)}:${`00${parseInt(time % 60)}`.slice(-2)}`;
class Timer {
	constructor() {
		this.reset();
	}
	play() {
		if (!this.isPaused) throw new Error('Time has been playing');
		this.t1 = performance.now();
		this.isPaused = false;
	}
	pause() {
		if (this.isPaused) throw new Error('Time has been paused');
		this.t0 = this.time;
		this.isPaused = true;
	}
	reset() {
		this.t0 = 0;
		this.t1 = 0;
		this.isPaused = true;
	}
	addTime(num) {
		this.t0 += num;
	}
	get time() {
		if (this.isPaused) return this.t0;
		return this.t0 + performance.now() - this.t1;
	}
	get second() {
		return this.time / 1e3;
	}
}
const frameTimer = { //计算fps
	tick: 0,
	time: performance.now(),
	fps: '',
	addTick(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = (1e3 * fr / (-this.time + (this.time = performance.now()))).toFixed(0);
		}
		return this.fps;
	}
}
//全屏相关
const full = {
	toggle(elem) {
		if (!this.enabled) return false;
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen();
			if (document.cancelFullScreen) return document.cancelFullScreen();
			if (document.webkitCancelFullScreen) return document.webkitCancelFullScreen();
			if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen();
			if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
		}
	},
	check(elem) {
		if (!(elem instanceof HTMLElement)) elem = document.body;
		return this.element == elem;
	},
	get onchange() {
		if (document.onfullscreenchange !== undefined) return 'fullscreenchange';
		if (document.onwebkitfullscreenchange !== undefined) return 'webkitfullscreenchange';
		if (document.onmozfullscreenchange !== undefined) return 'mozfullscreenchange';
	},
	get onerror() {
		if (document.onfullscreenerror !== undefined) return 'fullscreenerror';
		if (document.onwebkitfullscreenerror !== undefined) return 'webkitfullscreenerror';
		if (document.onmozfullscreenerror !== undefined) return 'mozfullscreenerror';
	},
	get element() {
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
	},
	get enabled() {
		return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled);
	}
};
const audio = {
	/** @type {AudioContext} */
	_actx: null,
	_inited: false,
	_started: false,
	/** @type {AudioBufferSourceNode[]} */
	_bfs: [],
	init(actx) {
		this._actx = actx || window.AudioContext || window.webkitAudioContext;
		this._inited = true;
	},
	start(actx) {
		if (!this._inited) this.init(actx);
		if (!this._started) this._actx = new this._actx();
		this._started = true;
	},
	decode(arraybuffer) {
		const actx = this.actx;
		return actx.decodeAudioData(arraybuffer);
	},
	play(res, loop, isOut, offset, playbackrate) {
		const actx = this.actx;
		const bfs = this._bfs;
		const gain = actx.createGain();
		const bufferSource = actx.createBufferSource();
		bufferSource.buffer = res;
		bufferSource.loop = loop; //循环播放
		bufferSource.connect(gain);
		bufferSource.playbackRate.value = Number(playbackrate) || 1;
		if (isOut) gain.connect(actx.destination);
		bufferSource.start(0, offset);
		bfs[bfs.length] = bufferSource;
	},
	stop() {
		const bfs = this._bfs;
		for (const i of bfs) i.stop();
		bfs.length = 0;
	},
	get actx() {
		if (!this._started) this.start();
		return this._actx;
	}
};

function csv2array(data, isObject) {
	const strarr = data.replace(/\ufeff|\r/g, '').split('\n');
	const col = [];
	for (const i of strarr) {
		let rowstr = '';
		let isQuot = false;
		let beforeQuot = false;
		const row = [];
		for (const j of i) {
			if (j == '"') {
				if (!isQuot) isQuot = true;
				else if (beforeQuot) {
					rowstr += j;
					beforeQuot = false;
				} else beforeQuot = true;
			} else if (j == ',') {
				if (!isQuot) {
					row.push(rowstr);
					rowstr = '';
				} else if (beforeQuot) {
					row.push(rowstr);
					rowstr = '';
					isQuot = false;
					beforeQuot = false;
				} else rowstr += j;
			} else if (!beforeQuot) rowstr += j;
			else throw 'Error 1';
		}
		if (!isQuot) {
			row.push(rowstr);
			rowstr = '';
		} else if (beforeQuot) {
			row.push(rowstr);
			rowstr = '';
			isQuot = false;
			beforeQuot = false;
		} else throw 'Error 2';
		col.push(row);
	}
	if (!isObject) return col;
	const qwq = [];
	for (let i = 1; i < col.length; i++) {
		const obj = {};
		for (let j = 0; j < col[0].length; j++) obj[col[0][j]] = col[i][j];
		qwq.push(obj);
	}
	return qwq;
}
// function loadJS(url, callback) {
// 	const script = document.createElement('script');
// 	const fn = callback || function() {};
// 	script.type = 'text/javascript';
// 	script.onload = function() {
// 		fn();
// 	};
// 	script.src = url;
// 	document.getElementsByTagName('head')[0].appendChild(script);
// }
// function loadJS2(url) {
// 	return new Promise((resolve, reject) => {
// 		const script = document.createElement('script');
// 		script.type = 'text/javascript';
// 		script.onload = resolve;
// 		script.onerror = reject;
// 		script.src = url;
// 		document.getElementsByTagName('head')[0].appendChild(script);
// 	});
// }
// window.onerror=(...a)=>console.log('qwq',a);
// window.addEventListener('error',(...a)=>console.log('qwq',a));
function loadJS(qwq) {
	const a = (function*(arg) { yield* arg; })(qwq instanceof Array ? qwq.reverse() : arguments);
	const load = url => new Promise((resolve, reject) => {
		if (!url) return reject();
		const script = document.createElement('script');
		script.onload = () => resolve(script);
		script.onerror = () => load(a.next().value).then(script => resolve(script)).catch(e => reject(e));
		script.src = url;
		script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	});
	return load(a.next().value);
}