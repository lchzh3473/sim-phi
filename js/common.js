'use strict';
export const time2Str = time => `${parseInt(time / 60)}:${`00${parseInt(time % 60)}`.slice(-2)}`;
export class Timer {
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
export const frameTimer = { //计算fps
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
export const full = {
	/**
	 * @param {HTMLElement} elem 
	 * @returns {Promise}
	 */
	toggle(elem) {
		//Apple第三方浏览器可能根本没有包含full的属性或方法qwq
		if (!this.enabled) return Promise.reject();
		const onFullscreen = () => new Promise((resolve, reject) => {
			const onchange = evt => { resolve(evt), document.removeEventListener(this.onchange, onchange) };
			const onerror = evt => { reject(evt), document.removeEventListener(this.onerror, onerror) };
			document.addEventListener(this.onchange, onchange);
			document.addEventListener(this.onerror, onerror);
		})
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen() || onFullscreen();
			if (document.webkitExitFullscreen) return document.webkitExitFullscreen() || onFullscreen();
			if (document.mozCancelFullScreen) return document.mozCancelFullScreen() || onFullscreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen() || onFullscreen();
			if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen() || onFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen() || onFullscreen();
		}
	},
	check(elem) {
		if (!(elem instanceof HTMLElement)) elem = document.body;
		return this.element === elem;
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
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || null;
	},
	get enabled() {
		return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || false;
	}
};
export const audio = {
	/** @type {AudioContext} */
	_actx: null,
	_inited: false,
	_started: false,
	/** @type {AudioBufferSourceNode[]} */
	_bfs: [],
	init(actx) {
		this._actx = actx || self.AudioContext || self.webkitAudioContext;
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
	mute(length) {
		const actx = this.actx;
		return actx.createBuffer(2, 44100 * length, 44100);
	},
	/**
	 * @typedef {Object} AudioParamOptions
	 * @property {boolean} [loop=false]
	 * @property {boolean} [isOut=true] 
	 * @property {number} [offset=0] 
	 * @property {number} [playbackrate=1] 
	 * @property {number} [gainrate=1] 
	 * 
	 * @param {AudioBuffer} res
	 * @param {AudioParamOptions} options 
	 */
	play(res, {
		loop = false,
		isOut = true,
		offset = 0,
		playbackrate = 1,
		gainrate = 1
	} = {}) {
		const actx = this.actx;
		const bfs = this._bfs;
		const gain = actx.createGain();
		const bufferSource = actx.createBufferSource();
		bufferSource.buffer = res;
		bufferSource.loop = loop; //循环播放
		bufferSource.connect(gain);
		gain.gain.value = gainrate;
		bufferSource.playbackRate.value = playbackrate;
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
export function csv2array(data, isObject) {
	const strarr = data.replace(/\ufeff|\r/g, '').split('\n');
	const col = [];
	for (const i of strarr) {
		let rowstr = '';
		let isQuot = false;
		let beforeQuot = false;
		const row = [];
		for (const j of i) {
			if (j === '"') {
				if (!isQuot) isQuot = true;
				else if (beforeQuot) {
					rowstr += j;
					beforeQuot = false;
				} else beforeQuot = true;
			} else if (j === ',') {
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
// self.onerror=(...a)=>console.log('qwq',a);
// self.addEventListener('error',(...a)=>console.log('qwq',a));
export const urls = {
	jszip: ['//cdn.jsdelivr.net/npm/jszip', '//fastly.jsdelivr.net/npm/jszip'],
	browser: ['//cdn.jsdelivr.net/gh/mumuy/browser/Browser.js', '//fastly.jsdelivr.net/gh/mumuy/browser/Browser.js' /* , '//passer-by.com/browser/Browser.js' */ ],
	bitmap: ['//cdn.jsdelivr.net/gh/Kaiido/createImageBitmap/dist/createImageBitmap.js', '//fastly.jsdelivr.net/gh/Kaiido/createImageBitmap/dist/createImageBitmap.js'],
	blur: ['//cdn.jsdelivr.net/npm/stackblur-canvas', '//fastly.jsdelivr.net/npm/stackblur-canvas'],
	md5: ['//cdn.jsdelivr.net/npm/md5-js', '//fastly.jsdelivr.net/npm/md5-js'],
}
export const getConstructorName = obj => {
	if (obj === null) return 'Null';
	if (obj === undefined) return 'Undefined';
	return obj.constructor.name;
}
export const isUndefined = name => self[name] === undefined;
//Legacy
{
	class DOMException extends self.DOMException {
		constructor(message, name) {
			super(message, name);
			if (Error.captureStackTrace) {
				Error.captureStackTrace(this, DOMException); //过滤自身stack
			} else {
				this.stack = (new Error).stack.replace(/.+\n/, '');
			}
		}
	}
	self.DOMException = DOMException;
}
export function loadJS(urls) {
	const arr = Array.from(urls instanceof Array ? urls : arguments, i => new URL(i, location).href);
	const args = (function*(arg) { yield* arg; })(arr);
	const load = url => new Promise((resolve, reject) => {
		if (!url) return reject(new DOMException('All urls are invalid\n' + arr.join('\n'), 'NetworkError'));
		const script = document.createElement('script');
		script.onload = () => resolve(script);
		script.onerror = () => load(args.next().value).then(script => resolve(script)).catch(e => reject(e));
		script.src = url;
		script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	});
	return load(args.next().value);
}