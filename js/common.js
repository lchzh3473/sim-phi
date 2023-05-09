'use strict';
export const time2Str = time => `${Math.floor(time / 60)}:${`00${Math.floor(time % 60)}`.slice(-2)}`;
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
	fps: 0,
	addTick(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = 1e3 * fr / (-this.time + (this.time = performance.now()));
		}
		return this.fps;
	},
	get fpsStr() {
		const fps = this.fps;
		if (fps < 10) return fps.toPrecision(2);
		return fps.toFixed(0);
	},
	get disp() {
		return 0.5 / frameTimer.fps || 0;
	}
};
export class FrameAnimater {
	constructor() {
		this.callback = _ => {};
		this.lastTime = 0;
		this.interval = Number.EPSILON;
		this.id = null;
		this._animate = this._animate.bind(this);
	}
	_animate() {
		this.id = requestAnimationFrame(this._animate); //回调更新动画
		var nowTime = performance.now();
		var elapsed = nowTime - this.lastTime;
		if (elapsed > this.interval) {
			this.lastTime = nowTime - (elapsed % this.interval);
			this.callback(nowTime);
		}
	}
	start() {
		if (this.id) return;
		this.lastTime = performance.now();
		this.id = requestAnimationFrame(this._animate);
	}
	stop() {
		cancelAnimationFrame(this.id);
		this.id = null;
	}
	setCallback(callback) {
		if (typeof callback !== 'function') throw new TypeError('callback is not a function');
		this.callback = callback;
	}
	setFrameRate(frameRate) {
		this.interval = Math.abs(1e3 / frameRate);
		if (!isFinite(this.interval)) this.interval = Number.EPSILON;
	}
}
//全屏相关
export const full = {
	/**
	 * @param {HTMLElement} [elem]
	 * @returns {Promise}
	 */
	toggle(elem) {
		//Apple第三方浏览器可能根本没有包含full的属性或方法qwq
		if (!this.enabled) return Promise.reject();
		const onFullscreen = () => new Promise((resolve, reject) => {
			document.addEventListener(this.onchange, resolve, { once: true });
			document.addEventListener(this.onerror, reject, { once: true });
		});
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen(), onFullscreen();
			if (document.webkitExitFullscreen) return document.webkitExitFullscreen(), onFullscreen();
			if (document.mozCancelFullScreen) return document.mozCancelFullScreen(), onFullscreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen(), onFullscreen();
			if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen(), onFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen(), onFullscreen();
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
export const orientation = {
	checkSupport() {
		const s = screen.orientation;
		if (!s) return Promise.resolve(false);
		return new Promise(async resolve => {
			try {
				await s.lock(s.type);
				resolve(s.unlock());
			} catch (e) {
				if (e.name === 'SecurityError') resolve(true);
				else if (e.name === 'NotSupportedError') resolve(false);
				else if (e.name === 'TypeError') resolve(false); //Safari 16.4
				else throw e;
			}
		});
	},
	lockLandscape() {
		const s = screen.orientation;
		if (!s) return Promise.reject();
		return s.lock('landscape-primary');
	},
	lockPortrait() {
		const s = screen.orientation;
		if (!s) return Promise.reject();
		return s.lock('portrait-primary');
	},
	unlock() {
		const s = screen.orientation;
		if (!s) return Promise.reject();
		return s.unlock();
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
	jszip: ['//unpkg.com/jszip/dist/jszip.min.js', '//cdn.jsdelivr.net/npm/jszip', '//fastly.jsdelivr.net/npm/jszip'],
	browser: ['//cdn.jsdelivr.net/gh/mumuy/browser/Browser.js', '//fastly.jsdelivr.net/gh/mumuy/browser/Browser.js' /* , '//passer-by.com/browser/Browser.js' */ ],
	bitmap: ['//cdn.jsdelivr.net/gh/lchz\x683\x3473/createImageBitmap/dist/createImageBitmap.js', '//fastly.jsdelivr.net/gh/lchz\x683\x3473/createImageBitmap/dist/createImageBitmap.js'],
	blur: ['//unpkg.com/stackblur-canvas/dist/stackblur.min.js', '//cdn.jsdelivr.net/npm/stackblur-canvas', '//fastly.jsdelivr.net/npm/stackblur-canvas'],
	md5: ['//unpkg.com/md5-js/md5.min.js', '//cdn.jsdelivr.net/npm/md5-js', '//fastly.jsdelivr.net/npm/md5-js']
};
export const getConstructorName = obj => {
	if (obj === null) return 'Null';
	if (obj === undefined) return 'Undefined';
	return obj.constructor.name;
};
export const isUndefined = name => self[name] === undefined;
//Legacy
{
	//兼容EventTarget() for Safari 14-
	try {
		new EventTarget();
	} catch (e) {
		self.EventTarget = function() {
			this.listeners = {};
		};
		EventTarget.prototype = {
			constructor: EventTarget,
			addEventListener(type, callback) {
				if (!(type in this.listeners)) this.listeners[type] = [];
				this.listeners[type].push(callback);
			},
			removeEventListener(type, callback) {
				if (!(type in this.listeners)) return;
				const stack = this.listeners[type];
				for (let i = 0, l = stack.length; i < l; i++) {
					if (stack[i] === callback) {
						stack.splice(i, 1);
						return;
					}
				}
			},
			dispatchEvent(event) {
				if (!(event.type in this.listeners)) return true;
				const stack = this.listeners[event.type];
				// event.target = this;
				for (let i = 0, l = stack.length; i < l; i++) {
					stack[i].call(this, event);
				}
				return !event.defaultPrevented;
			}
		};
	}
	//兼容Error.cause for Safari 15-
	if (new Error('', { cause: 'qwq' }).cause !== 'qwq') {
		class Error extends self.Error {
			constructor(message, { cause } = {}) {
				super(message);
				this.cause = cause;
			}
		}
		self.Error = Error;
	}
	//兼容DOMException.stack for qwq
	class DOMException extends self.DOMException {
		constructor(message, name) {
			super(message, name);
			if (Error.captureStackTrace) {
				Error.captureStackTrace(this, DOMException); //过滤自身stack
			} else {
				this.stack = new Error().stack.replace(/.+\n/, '');
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
		if (!location.port) script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	});
	return load(args.next().value);
}